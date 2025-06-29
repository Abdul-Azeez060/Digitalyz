'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, Worker } from '@/types/models';
import { Calendar, Clock, Users } from 'lucide-react';

interface PhaseGanttChartProps {
  tasks: Task[];
  workers: Worker[];
}

interface PhaseData {
  phase: number;
  tasks: Task[];
  duration: number;
  workers: string[];
  startDate?: Date;
  endDate?: Date;
}

export function PhaseGanttChart({ tasks, workers }: PhaseGanttChartProps) {
  const phaseData = useMemo(() => {
    const phases: Record<number, PhaseData> = {};
    
    tasks.forEach(task => {
      task.phases.forEach(phaseNum => {
        if (!phases[phaseNum]) {
          phases[phaseNum] = {
            phase: phaseNum,
            tasks: [],
            duration: 0,
            workers: []
          };
        }
        
        phases[phaseNum].tasks.push(task);
        phases[phaseNum].duration += task.duration;
        
        // Simulate worker assignments based on skills
        const suitableWorkers = workers.filter(worker => 
          task.requiredSkills.some(skill => worker.skills.includes(skill))
        );
        
        suitableWorkers.forEach(worker => {
          if (!phases[phaseNum].workers.includes(worker.id)) {
            phases[phaseNum].workers.push(worker.id);
          }
        });
      });
    });

    // Calculate estimated dates (simplified simulation)
    let currentDate = new Date();
    Object.values(phases).sort((a, b) => a.phase - b.phase).forEach(phase => {
      phase.startDate = new Date(currentDate);
      const estimatedDays = Math.ceil(phase.duration / 8); // 8 hours per day
      phase.endDate = new Date(currentDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
      currentDate = new Date(phase.endDate.getTime() + 24 * 60 * 60 * 1000); // 1 day buffer
    });

    return Object.values(phases).sort((a, b) => a.phase - b.phase);
  }, [tasks, workers]);

  const maxDuration = Math.max(...phaseData.map(p => p.duration));
  const totalDuration = phaseData.reduce((sum, p) => sum + p.duration, 0);

  const getPhaseColor = (phase: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500'
    ];
    return colors[phase % colors.length];
  };

  const getPhaseProgress = (duration: number) => {
    return (duration / maxDuration) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Phase Timeline Overview</span>
        </CardTitle>
        <CardDescription>
          Visual breakdown of tasks and resource allocation across project phases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Phases</p>
              <p className="font-semibold">{phaseData.length}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="font-semibold">{totalDuration}h</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Workers Involved</p>
              <p className="font-semibold">
                {new Set(phaseData.flatMap(p => p.workers)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium">Phase Timeline</h4>
          {phaseData.map((phase) => (
            <div key={phase.phase} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="font-mono">
                    Phase {phase.phase}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {phase.tasks.length} tasks • {phase.duration}h
                  </span>
                  {phase.startDate && phase.endDate && (
                    <span className="text-xs text-muted-foreground">
                      {phase.startDate.toLocaleDateString()} - {phase.endDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {phase.workers.length} workers
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className={`h-6 rounded-full ${getPhaseColor(phase.phase)} transition-all duration-500`}
                    style={{ width: `${getPhaseProgress(phase.duration)}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {Math.round((phase.duration / totalDuration) * 100)}%
                  </span>
                </div>
              </div>

              {/* Task Details */}
              <div className="ml-4 space-y-1">
                {phase.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${getPhaseColor(phase.phase)}`} />
                    <span className="font-medium">{task.name}</span>
                    <span className="text-muted-foreground">({task.duration}h)</span>
                    <div className="flex space-x-1">
                      {task.requiredSkills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {task.requiredSkills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{task.requiredSkills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {phase.tasks.length > 3 && (
                  <div className="text-xs text-muted-foreground ml-4">
                    ... and {phase.tasks.length - 3} more tasks
                  </div>
                )}
              </div>

              {/* Worker Assignment */}
              <div className="ml-4">
                <div className="flex flex-wrap gap-1">
                  {phase.workers.slice(0, 4).map((workerId) => {
                    const worker = workers.find(w => w.id === workerId);
                    return (
                      <Badge key={workerId} variant="outline" className="text-xs">
                        {worker?.name || workerId}
                      </Badge>
                    );
                  })}
                  {phase.workers.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{phase.workers.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phase Dependencies (Simplified) */}
        <div className="space-y-2">
          <h4 className="font-medium">Phase Flow</h4>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {phaseData.map((phase, index) => (
              <div key={phase.phase} className="flex items-center space-x-2 flex-shrink-0">
                <div className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${getPhaseColor(phase.phase)}`}>
                  Phase {phase.phase}
                </div>
                {index < phaseData.length - 1 && (
                  <div className="text-muted-foreground">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}