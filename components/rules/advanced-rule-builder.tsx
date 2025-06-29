"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/contexts/data-context";
import { Rule, RuleTemplate } from "@/types/models";
import { Settings, X, Code, Crown, Filter, Layers } from "lucide-react";

interface AdvancedRuleBuilderProps {
  onClose: () => void;
  editRule?: Rule;
}

const ruleTypes = [
  {
    value: "coRun",
    label: "Co-Run Tasks",
    description: "Tasks that should be executed together",
    icon: Layers,
  },
  {
    value: "sequence",
    label: "Sequential Tasks",
    description: "Tasks that must be completed in order",
    icon: Filter,
  },
  {
    value: "exclusion",
    label: "Exclusion Rule",
    description: "Tasks that cannot run simultaneously",
    icon: X,
  },
  {
    value: "slotRestriction",
    label: "Slot Restriction",
    description: "Limit tasks to specific time slots",
    icon: Settings,
  },
  {
    value: "loadLimit",
    label: "Load Limit",
    description: "Restrict worker load capacity",
    icon: Settings,
  },
  {
    value: "phaseWindow",
    label: "Phase Window",
    description: "Restrict tasks to specific phases",
    icon: Settings,
  },
  {
    value: "patternMatch",
    label: "Pattern Match",
    description: "Rules based on regex patterns",
    icon: Code,
  },
  {
    value: "precedenceOverride",
    label: "Precedence Override",
    description: "Override rule priorities",
    icon: Crown,
  },
];

const ruleTemplates: RuleTemplate[] = [
  {
    id: "high-priority-client",
    name: "High Priority Client Rule",
    description: "Prioritize tasks for clients with priority >= 4",
    type: "patternMatch",
    pattern: "priority >= 4",
    parameters: { field: "client.priority", operator: ">=", value: 4 },
  },
  {
    id: "skill-match",
    name: "Skill Matching Rule",
    description: "Match tasks to workers with required skills",
    type: "patternMatch",
    pattern: "worker.skills.includes(task.requiredSkills)",
    parameters: {
      field: "skills",
      operator: "includes",
      value: "requiredSkills",
    },
  },
  {
    id: "group-balance",
    name: "Group Balance Rule",
    description: "Balance workload across worker groups",
    type: "loadLimit",
    parameters: { maxLoadPerGroup: 0.8, balanceAcrossGroups: true },
  },
  {
    id: "deadline-priority",
    name: "Deadline Priority Rule",
    description: "Prioritize tasks with approaching deadlines",
    type: "precedenceOverride",
    parameters: { deadlineThreshold: 7, priorityBoost: 2 },
  },
];

export function AdvancedRuleBuilder({
  onClose,
  editRule,
}: AdvancedRuleBuilderProps) {
  const { state, dispatch } = useData();
  const [formData, setFormData] = useState<Partial<Rule>>({
    name: editRule?.name || "",
    description: editRule?.description || "",
    type: editRule?.type || "coRun",
    tasks: editRule?.tasks || [],
    workers: editRule?.workers || [],
    phases: editRule?.phases || [],
    weight: editRule?.weight || 0.5,
    active: editRule?.active || false,
    parameters: editRule?.parameters || {},
    priority: editRule?.priority || 1,
    pattern: editRule?.pattern || "",
    global: editRule?.global || false,
  });

  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    editRule?.tasks || []
  );
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(
    editRule?.workers || []
  );
  const [selectedPhases, setSelectedPhases] = useState<number[]>(
    editRule?.phases || []
  );
  const [activeTab, setActiveTab] = useState("basic");

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
      parameters: formData.parameters,
      priority: formData.priority,
      pattern: formData.pattern,
      global: formData.global,
    };

    if (editRule) {
      dispatch({
        type: "UPDATE_RULE",
        payload: { id: editRule.id, updates: rule },
      });
    } else {
      dispatch({ type: "ADD_RULE", payload: rule });
    }

    onClose();
  };

  const applyTemplate = (template: RuleTemplate) => {
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      type: template.type,
      pattern: template.pattern,
      parameters: template.parameters,
    }));
  };

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleWorker = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const togglePhase = (phase: number) => {
    setSelectedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const availablePhases = Array.from(
    new Set([
      ...state.clients.flatMap((c) => c.phases || []),
      ...state.workers.flatMap((w) => w.phases || []),
      ...state.tasks.flatMap((t) => t.phases || []),
    ])
  ).sort((a, b) => a - b);

  const clientGroups = Array.from(
    new Set(state.clients.map((c) => c.groupTag).filter(Boolean))
  );
  const workerGroups = Array.from(
    new Set(state.workers.map((w) => w.workerGroup).filter(Boolean))
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>
              {editRule ? "Edit Advanced Rule" : "Create Advanced Rule"}
            </span>
          </DialogTitle>
          <DialogDescription>
            Configure sophisticated allocation rules with advanced parameters
            and patterns
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-2xl p-1">
            <TabsTrigger value="basic" className="rounded-xl">
              Basic
            </TabsTrigger>
            <TabsTrigger value="targets" className="rounded-xl">
              Targets
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-xl">
              Advanced
            </TabsTrigger>
            <TabsTrigger value="patterns" className="rounded-xl">
              Patterns
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-xl">
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Rule Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: value as Rule["type"],
                        }))
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {type.description}
                                </div>
                              </div>
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this rule does"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Rule Weight: {Math.round((formData.weight || 0) * 100)}%
                    </Label>
                    <Slider
                      value={[(formData.weight || 0) * 100]}
                      onValueChange={([value]) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: value / 100,
                        }))
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority Level: {formData.priority}</Label>
                    <Slider
                      value={[formData.priority || 1]}
                      onValueChange={([value]) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, active: !!checked }))
                      }
                    />
                    <Label htmlFor="active">
                      Activate this rule immediately
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="global"
                      checked={formData.global}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, global: !!checked }))
                      }
                    />
                    <Label htmlFor="global">Global rule (applies to all)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Target Selection */}
          <TabsContent value="targets" className="space-y-6">
            {/* Task Selection */}
            {(formData.type === "coRun" ||
              formData.type === "sequence" ||
              formData.type === "exclusion") && (
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
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleTask(task.id)}>
                        <div className="font-medium text-sm">{task.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Client: {task.clientId} • {task.duration}h
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.requiredSkills.slice(0, 2).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedTasks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {selectedTasks.map((taskId) => {
                        const task = state.tasks.find((t) => t.id === taskId);
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
            {(formData.type === "loadLimit" ||
              formData.type === "slotRestriction") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Worker Selection</CardTitle>
                  <CardDescription>
                    Select workers or worker groups that this rule applies to
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Worker Groups */}
                  {workerGroups.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">
                        Worker Groups
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {workerGroups.map((group) => (
                          <Badge
                            key={group}
                            className="cursor-pointer hover:bg-blue-50"
                            onClick={() => {
                              const groupWorkers = state.workers
                                .filter((w) => w.workerGroup === group)
                                .map((w) => w.id);
                              setSelectedWorkers((prev) => [
                                //@ts-ignore
                                ...new Set([...prev, ...groupWorkers]),
                              ]);
                            }}>
                            {group} Group
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual Workers */}
                  <div>
                    <Label className="text-sm font-medium">
                      Individual Workers
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto mt-2">
                      {state.workers.map((worker) => (
                        <div
                          key={worker.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedWorkers.includes(worker.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => toggleWorker(worker.id)}>
                          <div className="font-medium text-sm">
                            {worker.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {worker.capacity}h capacity •{" "}
                            {worker.workerGroup || "No group"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedWorkers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {selectedWorkers.map((workerId) => {
                        const worker = state.workers.find(
                          (w) => w.id === workerId
                        );
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
            {formData.type === "phaseWindow" && (
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
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => togglePhase(phase)}>
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
          </TabsContent>

          {/* Advanced Parameters */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Advanced Parameters</CardTitle>
                <CardDescription>
                  Configure rule-specific parameters and constraints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.type === "loadLimit" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Load Per Phase (%)</Label>
                      <Slider
                        value={[
                          (formData.parameters?.maxLoadPerPhase || 0.8) * 100,
                        ]}
                        onValueChange={([value]) =>
                          setFormData((prev) => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              maxLoadPerPhase: value / 100,
                            },
                          }))
                        }
                        max={100}
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Buffer Time (hours)</Label>
                      <Input
                        type="number"
                        value={formData.parameters?.bufferTime || 0}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              bufferTime: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {formData.type === "slotRestriction" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Common Slots</Label>
                      <Input
                        type="number"
                        value={formData.parameters?.minCommonSlots || 1}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              minCommonSlots: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slot Overlap Threshold (%)</Label>
                      <Slider
                        value={[
                          (formData.parameters?.overlapThreshold || 0.5) * 100,
                        ]}
                        onValueChange={([value]) =>
                          setFormData((prev) => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              overlapThreshold: value / 100,
                            },
                          }))
                        }
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                )}

                {formData.type === "precedenceOverride" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Override Condition</Label>
                      <Select
                        value={formData.parameters?.condition || "deadline"}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              condition: value,
                            },
                          }))
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">
                            Approaching Deadline
                          </SelectItem>
                          <SelectItem value="priority">
                            High Priority
                          </SelectItem>
                          <SelectItem value="client">VIP Client</SelectItem>
                          <SelectItem value="resource">
                            Resource Constraint
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority Boost</Label>
                      <Slider
                        value={[formData.parameters?.priorityBoost || 1]}
                        onValueChange={([value]) =>
                          setFormData((prev) => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              priorityBoost: value,
                            },
                          }))
                        }
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Custom Parameters (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(formData.parameters || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const params = JSON.parse(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          parameters: params,
                        }));
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pattern Matching */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Pattern Matching Rules
                </CardTitle>
                <CardDescription>
                  Define rules using regex patterns and conditional logic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pattern Expression</Label>
                  <Input
                    value={formData.pattern}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pattern: e.target.value,
                      }))
                    }
                    placeholder="e.g., client.priority >= 4 && task.duration > 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Field</Label>
                    <Select
                      value={formData.parameters?.field || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          parameters: { ...prev.parameters, field: value },
                        }))
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client.priority">
                          Client Priority
                        </SelectItem>
                        <SelectItem value="client.budget">
                          Client Budget
                        </SelectItem>
                        <SelectItem value="task.duration">
                          Task Duration
                        </SelectItem>
                        <SelectItem value="task.priority">
                          Task Priority
                        </SelectItem>
                        <SelectItem value="worker.capacity">
                          Worker Capacity
                        </SelectItem>
                        <SelectItem value="worker.qualificationLevel">
                          Worker Qualification
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select
                      value={formData.parameters?.operator || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          parameters: { ...prev.parameters, operator: value },
                        }))
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">&gt; (greater than)</SelectItem>
                        <SelectItem value=">=">
                          &gt;= (greater or equal)
                        </SelectItem>
                        <SelectItem value="<">&lt; (less than)</SelectItem>
                        <SelectItem value="<=">
                          &lt;= (less or equal)
                        </SelectItem>
                        <SelectItem value="=">= (equals)</SelectItem>
                        <SelectItem value="!=">!= (not equals)</SelectItem>
                        <SelectItem value="includes">includes</SelectItem>
                        <SelectItem value="excludes">excludes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comparison Value</Label>
                  <Input
                    value={formData.parameters?.value || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parameters: {
                          ...prev.parameters,
                          value: e.target.value,
                        },
                      }))
                    }
                    placeholder="Enter comparison value"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Pattern Examples:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <code>client.priority &gt;= 4</code> - High priority
                      clients
                    </li>
                    <li>
                      •{" "}
                      <code>
                        task.duration &gt; 5 && task.category === 'development'
                      </code>{" "}
                      - Long development tasks
                    </li>
                    <li>
                      • <code>worker.skills.includes('React')</code> - Workers
                      with React skills
                    </li>
                    <li>
                      •{" "}
                      <code>
                        task.deadline &lt; Date.now() + 7*24*60*60*1000
                      </code>{" "}
                      - Tasks due within a week
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ruleTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="card-modern group cursor-pointer hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Code className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>{template.name}</span>
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Type:</span>
                        <Badge>{template.type}</Badge>
                      </div>
                      {template.pattern && (
                        <div>
                          <span className="text-sm font-medium">Pattern:</span>
                          <code className="block text-xs bg-gray-100 p-2 rounded mt-1">
                            {template.pattern}
                          </code>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full btn-outline group-hover:btn-primary transition-all"
                      onClick={() => applyTemplate(template)}>
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.type}
            className="btn-primary">
            {editRule ? "Update Rule" : "Create Rule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
