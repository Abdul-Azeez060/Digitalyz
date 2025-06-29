'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/data-context';
import { Rule } from '@/types/models';
import { Settings, X } from 'lucide-react';

interface RuleBuilderProps {
  onClose: () => void;
  editRule?: Rule;
}

const ruleTypes = [
  {
    value: 'coRun',
    label: 'Co-Run Tasks',
    description: 'Tasks that should be executed together'
  },
  {
    value: 'sequence',
    label: 'Sequential Tasks',
    description: 'Tasks that must be completed in order'
  },
  {
    value: 'exclusion',
    label: 'Exclusion Rule',
    description: 'Tasks that cannot run simultaneously'
  },
  {
    value: 'slotRestriction',
    label: 'Slot Restriction',
    description: 'Limit tasks to specific time slots'
  },
  {
    value: 'loadLimit',
    label: 'Load Limit',
    description: 'Restrict worker load capacity'
  },
  {
    value: 'phaseWindow',
    label: 'Phase Window',
    description: 'Restrict tasks to specific phases'
  }
];

export function RuleBuilder({ onClose, editRule }: RuleBuilderProps) {
  const { state, dispatch } = useData();
  const [formData, setFormData] = useState<Partial<Rule>>({
    name: editRule?.name || '',
    description: editRule?.description || '',
    type: editRule?.type || 'coRun',
    tasks: editRule?.tasks || [],
    workers: editRule?.workers || [],
    phases: editRule?.phases || [],
    weight: editRule?.weight || 0.5,
    active: editRule?.active || false,
    parameters: editRule?.parameters || {}
  });

  const [selectedTasks, setSelectedTasks] = useState<string[]>(editRule?.tasks || []);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(editRule?.workers || []);
  const [selectedPhases, setSelectedPhases] = useState<number[]>(editRule?.phases || []);

  const handleSave = () => {
    const rule: Rule = {
      id: editRule?.id || `rule-${Date.now()}`,
      name: formData.name!,
      description: formData.description,
      type: formData.type!,
      tasks: selectedTasks,
      workers: selectedWorkers,
      phases: selectedPhases,
      weight: formData.weight!,
      active: formData.active!,
      parameters: formData.parameters
    };

    if (editRule) {
      dispatch({ type: 'UPDATE_RULE', payload: { id: editRule.id, updates: rule } });
    } else {
      dispatch({ type: 'ADD_RULE', payload: rule });
    }

    onClose();
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleWorker = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const togglePhase = (phase: number) => {
    setSelectedPhases(prev => 
      prev.includes(phase) 
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const availablePhases = Array.from(new Set([
    ...state.clients.flatMap(c => c.phases || []),
    ...state.workers.flatMap(w => w.phases || []),
    ...state.tasks.flatMap(t => t.phases || [])
  ])).sort((a, b) => a - b);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{editRule ? 'Edit Rule' : 'Create New Rule'}</span>
          </DialogTitle>
          <DialogDescription>
            Configure allocation rules and constraints for optimal resource distribution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Rule Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Rule['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Rule Weight: {Math.round((formData.weight || 0) * 100)}%</Label>
                <Slider
                  value={[(formData.weight || 0) * 100]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, weight: value / 100 }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Priority</span>
                  <span>High Priority</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: !!checked }))}
                />
                <Label htmlFor="active">Activate this rule immediately</Label>
              </div>
            </CardContent>
          </Card>

          {/* Task Selection */}
          {(formData.type === 'coRun' || formData.type === 'sequence' || formData.type === 'exclusion') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Selection</CardTitle>
                <CardDescription>
                  Select tasks that this rule applies to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {state.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTasks.includes(task.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Client: {task.clientId} • {task.duration}h
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTasks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selectedTasks.map((taskId) => {
                      const task = state.tasks.find(t => t.id === taskId);
                      return (
                        <Badge key={taskId} variant="secondary">
                          {task?.name}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleTask(taskId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Worker Selection */}
          {(formData.type === 'loadLimit' || formData.type === 'slotRestriction') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Worker Selection</CardTitle>
                <CardDescription>
                  Select workers that this rule applies to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {state.workers.map((worker) => (
                    <div
                      key={worker.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWorkers.includes(worker.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleWorker(worker.id)}
                    >
                      <div className="font-medium text-sm">{worker.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {worker.capacity}h capacity
                      </div>
                    </div>
                  ))}
                </div>
                {selectedWorkers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selectedWorkers.map((workerId) => {
                      const worker = state.workers.find(w => w.id === workerId);
                      return (
                        <Badge key={workerId} variant="secondary">
                          {worker?.name}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => toggleWorker(workerId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phase Selection */}
          {formData.type === 'phaseWindow' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phase Selection</CardTitle>
                <CardDescription>
                  Select phases that this rule applies to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availablePhases.map((phase) => (
                    <div
                      key={phase}
                      className={`px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                        selectedPhases.includes(phase)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePhase(phase)}
                    >
                      Phase {phase}
                    </div>
                  ))}
                </div>
                {selectedPhases.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {selectedPhases.map((phase) => (
                      <Badge key={phase} variant="secondary">
                        Phase {phase}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => togglePhase(phase)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name || !formData.type}
            >
              {editRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}