'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useData } from '@/contexts/data-context';
import { PrioritizationWeights, PrioritizationCriteria, AHPComparison, PresetStrategy } from '@/types/models';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users,
  Sparkles,
  RefreshCw,
  ArrowUpDown,
  Scale,
  Zap,
  Shield,
  Brain
} from 'lucide-react';

const criteriaList: PrioritizationCriteria[] = [
  {
    id: 'clientPriority',
    name: 'Client Priority',
    description: 'Weight given to high-priority clients',
    weight: 0.2,
    category: 'client'
  },
  {
    id: 'taskUrgency',
    name: 'Task Urgency',
    description: 'Priority for urgent and deadline-sensitive tasks',
    weight: 0.2,
    category: 'task'
  },
  {
    id: 'workerEfficiency',
    name: 'Worker Efficiency',
    description: 'Optimize for worker skill matching and productivity',
    weight: 0.15,
    category: 'worker'
  },
  {
    id: 'resourceOptimization',
    name: 'Resource Optimization',
    description: 'Maximize overall resource utilization',
    weight: 0.15,
    category: 'resource'
  },
  {
    id: 'costEfficiency',
    name: 'Cost Efficiency',
    description: 'Minimize costs while maintaining quality',
    weight: 0.15,
    category: 'resource'
  },
  {
    id: 'timelineAdherence',
    name: 'Timeline Adherence',
    description: 'Ensure projects stay on schedule',
    weight: 0.15,
    category: 'time'
  }
];

const presetStrategies: PresetStrategy[] = [
  {
    id: 'client-first',
    name: 'Client-First',
    description: 'Prioritize high-value clients and their requirements',
    icon: 'Users',
    weights: {
      clientPriority: 0.4,
      taskUrgency: 0.2,
      workerEfficiency: 0.1,
      resourceOptimization: 0.1,
      costEfficiency: 0.1,
      timelineAdherence: 0.1,
      skillMatching: 0,
      groupBalance: 0
    }
  },
  {
    id: 'efficiency-focus',
    name: 'Efficiency Focus',
    description: 'Maximize worker productivity and resource utilization',
    icon: 'TrendingUp',
    weights: {
      clientPriority: 0.15,
      taskUrgency: 0.15,
      workerEfficiency: 0.3,
      resourceOptimization: 0.25,
      costEfficiency: 0.1,
      timelineAdherence: 0.05,
      skillMatching: 0,
      groupBalance: 0
    }
  },
  {
    id: 'deadline-driven',
    name: 'Deadline Driven',
    description: 'Ensure all deadlines are met with timeline focus',
    icon: 'Clock',
    weights: {
      clientPriority: 0.1,
      taskUrgency: 0.35,
      workerEfficiency: 0.15,
      resourceOptimization: 0.1,
      costEfficiency: 0.1,
      timelineAdherence: 0.2,
      skillMatching: 0,
      groupBalance: 0
    }
  },
  {
    id: 'cost-optimized',
    name: 'Cost Optimized',
    description: 'Minimize costs while maintaining service quality',
    icon: 'DollarSign',
    weights: {
      clientPriority: 0.15,
      taskUrgency: 0.15,
      workerEfficiency: 0.2,
      resourceOptimization: 0.15,
      costEfficiency: 0.25,
      timelineAdherence: 0.1,
      skillMatching: 0,
      groupBalance: 0
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Equal consideration across all factors',
    icon: 'Scale',
    weights: {
      clientPriority: 0.167,
      taskUrgency: 0.167,
      workerEfficiency: 0.167,
      resourceOptimization: 0.166,
      costEfficiency: 0.166,
      timelineAdherence: 0.167,
      skillMatching: 0,
      groupBalance: 0
    }
  }
];

export function AdvancedPrioritization() {
  const { state, dispatch } = useData();
  const [criteria, setCriteria] = useState<PrioritizationCriteria[]>(criteriaList);
  const [ahpComparisons, setAhpComparisons] = useState<AHPComparison[]>([]);
  const [activeTab, setActiveTab] = useState('sliders');

  const updateCriteriaWeight = (id: string, weight: number) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, weight: weight / 100 } : c
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(criteria);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Recalculate weights based on position (higher position = higher weight)
    const totalItems = items.length;
    const updatedItems = items.map((item, index) => ({
      ...item,
      weight: (totalItems - index) / (totalItems * (totalItems + 1) / 2)
    }));

    setCriteria(updatedItems);
  };

  const applyPreset = (preset: PresetStrategy) => {
    const updatedCriteria = criteria.map(c => ({
      ...c,
      weight: preset.weights[c.id as keyof PrioritizationWeights] || 0
    }));
    setCriteria(updatedCriteria);
  };

  const generateAHPMatrix = () => {
    const comparisons: AHPComparison[] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        comparisons.push({
          criteria1: criteria[i].id,
          criteria2: criteria[j].id,
          value: 1,
          reciprocal: 1
        });
      }
    }
    setAhpComparisons(comparisons);
  };

  const updateAHPComparison = (criteria1: string, criteria2: string, value: number) => {
    setAhpComparisons(prev => prev.map(comp => 
      comp.criteria1 === criteria1 && comp.criteria2 === criteria2
        ? { ...comp, value, reciprocal: 1 / value }
        : comp
    ));
  };

  const calculateAHPWeights = () => {
    // Simplified AHP calculation
    const matrix = criteria.map(() => criteria.map(() => 1));
    
    ahpComparisons.forEach(comp => {
      const i = criteria.findIndex(c => c.id === comp.criteria1);
      const j = criteria.findIndex(c => c.id === comp.criteria2);
      if (i !== -1 && j !== -1) {
        matrix[i][j] = comp.value;
        matrix[j][i] = comp.reciprocal;
      }
    });

    // Calculate eigenvector (simplified)
    const sums = matrix.map(row => row.reduce((sum, val) => sum + val, 0));
    const weights = sums.map(sum => sum / sums.reduce((total, s) => total + s, 0));

    const updatedCriteria = criteria.map((c, index) => ({
      ...c,
      weight: weights[index]
    }));

    setCriteria(updatedCriteria);
  };

  const saveWeights = () => {
    const weights: PrioritizationWeights = {
      clientPriority: criteria.find(c => c.id === 'clientPriority')?.weight || 0,
      taskUrgency: criteria.find(c => c.id === 'taskUrgency')?.weight || 0,
      workerEfficiency: criteria.find(c => c.id === 'workerEfficiency')?.weight || 0,
      resourceOptimization: criteria.find(c => c.id === 'resourceOptimization')?.weight || 0,
      costEfficiency: criteria.find(c => c.id === 'costEfficiency')?.weight || 0,
      timelineAdherence: criteria.find(c => c.id === 'timelineAdherence')?.weight || 0,
      skillMatching: 0,
      groupBalance: 0
    };

    dispatch({ type: 'SET_PRIORITIZATION_WEIGHTS', payload: weights });
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isValidTotal = Math.abs(totalWeight - 1) < 0.01;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'client': return Users;
      case 'task': return Target;
      case 'worker': return Brain;
      case 'resource': return Zap;
      case 'time': return Clock;
      default: return BarChart3;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'client': return 'text-blue-600';
      case 'task': return 'text-green-600';
      case 'worker': return 'text-purple-600';
      case 'resource': return 'text-orange-600';
      case 'time': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-2">Advanced Prioritization</h2>
          <p className="text-body">Configure sophisticated priority weights using multiple methodologies</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`badge-modern ${isValidTotal ? "badge-success" : "badge-error"}`}>
            Total: {Math.round(totalWeight * 100)}%
          </Badge>
          <Button onClick={saveWeights} disabled={!isValidTotal} className="btn-primary">
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Methodology Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-2xl p-1">
          <TabsTrigger value="sliders" className="rounded-xl">
            <BarChart3 className="h-4 w-4 mr-2" />
            Sliders
          </TabsTrigger>
          <TabsTrigger value="ranking" className="rounded-xl">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Drag & Drop
          </TabsTrigger>
          <TabsTrigger value="ahp" className="rounded-xl">
            <Scale className="h-4 w-4 mr-2" />
            AHP Matrix
          </TabsTrigger>
          <TabsTrigger value="presets" className="rounded-xl">
            <Sparkles className="h-4 w-4 mr-2" />
            Presets
          </TabsTrigger>
        </TabsList>

        {/* Slider Method */}
        <TabsContent value="sliders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {criteria.map((criterion) => {
              const Icon = getCategoryIcon(criterion.category);
              return (
                <Card key={criterion.id} className="card-modern">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <Icon className={`h-5 w-5 ${getCategoryColor(criterion.category)}`} />
                        </div>
                        <span>{criterion.name}</span>
                      </div>
                      <Badge className="badge-modern badge-info">
                        {Math.round(criterion.weight * 100)}%
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-body">
                      {criterion.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Slider
                      value={[criterion.weight * 100]}
                      onValueChange={([value]) => updateCriteriaWeight(criterion.id, value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Drag & Drop Ranking */}
        <TabsContent value="ranking" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Drag to Rank by Importance</CardTitle>
              <CardDescription>
                Drag criteria to reorder by importance. Higher position = higher weight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="criteria">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {criteria.map((criterion, index) => {
                        const Icon = getCategoryIcon(criterion.category);
                        return (
                          <Draggable key={criterion.id} draggableId={criterion.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 border rounded-2xl transition-all ${
                                  snapshot.isDragging 
                                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold">
                                      {index + 1}
                                    </div>
                                    <Icon className={`h-5 w-5 ${getCategoryColor(criterion.category)}`} />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{criterion.name}</h4>
                                    <p className="text-sm text-gray-600">{criterion.description}</p>
                                  </div>
                                  <Badge className="badge-modern badge-info">
                                    {Math.round(criterion.weight * 100)}%
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AHP Matrix */}
        <TabsContent value="ahp" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Analytic Hierarchy Process (AHP)</CardTitle>
              <CardDescription>
                Compare criteria pairwise to build a weight matrix using the AHP methodology.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ahpComparisons.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Generate AHP Matrix</h3>
                  <p className="text-body mb-6">
                    Create pairwise comparisons to calculate optimal weights
                  </p>
                  <Button onClick={generateAHPMatrix} className="btn-primary">
                    <Scale className="h-4 w-4 mr-2" />
                    Generate Matrix
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Pairwise Comparisons</h4>
                    <Button onClick={calculateAHPWeights} className="btn-primary">
                      Calculate Weights
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {ahpComparisons.map((comparison, index) => {
                      const criteria1 = criteria.find(c => c.id === comparison.criteria1);
                      const criteria2 = criteria.find(c => c.id === comparison.criteria2);
                      
                      return (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">{criteria1?.name}</span>
                              <span className="text-gray-500">vs</span>
                              <span className="font-medium">{criteria2?.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Slider
                                value={[comparison.value]}
                                onValueChange={([value]) => updateAHPComparison(comparison.criteria1, comparison.criteria2, value)}
                                min={0.11}
                                max={9}
                                step={0.11}
                                className="w-32"
                              />
                              <Badge variant="outline">
                                {comparison.value.toFixed(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preset Strategies */}
        <TabsContent value="presets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presetStrategies.map((preset) => (
              <Card key={preset.id} className="card-modern group cursor-pointer hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>{preset.name}</span>
                  </CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {Object.entries(preset.weights).slice(0, 6).map(([key, value]) => {
                      const criterion = criteria.find(c => c.id === key);
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {criterion?.name || key}
                          </span>
                          <span className="font-mono font-medium">
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Button 
                    className="w-full btn-outline group-hover:btn-primary transition-all"
                    onClick={() => applyPreset(preset)}
                  >
                    Apply Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Weight Summary */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-heading-3">Current Weight Distribution</CardTitle>
          <CardDescription>
            Visual representation of your prioritization strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criteria.map((criterion) => {
              const Icon = getCategoryIcon(criterion.category);
              return (
                <div key={criterion.id} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${getCategoryColor(criterion.category)}`} />
                  </div>
                  <span className="font-medium min-w-[160px]">
                    {criterion.name}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full smooth-transition"
                      style={{ width: `${criterion.weight * 100}%` }}
                    />
                  </div>
                  <span className="font-mono font-medium min-w-[50px] text-right">
                    {Math.round(criterion.weight * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}