'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RuleBuilder } from './rule-builder';
import { useData } from '@/contexts/data-context';
import { Rule } from '@/types/models';
import { 
  Settings, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  AlertTriangle,
  CheckCircle,
  Target
} from 'lucide-react';

export function RulesList() {
  const { state, dispatch } = useData();
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const toggleRule = (ruleId: string) => {
    const rule = state.rules.find(r => r.id === ruleId);
    if (rule) {
      dispatch({
        type: 'UPDATE_RULE',
        payload: { id: ruleId, updates: { active: !rule.active } }
      });
    }
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      dispatch({ type: 'DELETE_RULE', payload: ruleId });
    }
  };

  const getRuleTypeColor = (type: Rule['type']) => {
    switch (type) {
      case 'coRun':
        return 'bg-blue-100 text-blue-800';
      case 'sequence':
        return 'bg-green-100 text-green-800';
      case 'exclusion':
        return 'bg-red-100 text-red-800';
      case 'slotRestriction':
        return 'bg-yellow-100 text-yellow-800';
      case 'loadLimit':
        return 'bg-purple-100 text-purple-800';
      case 'phaseWindow':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuleTypeLabel = (type: Rule['type']) => {
    switch (type) {
      case 'coRun':
        return 'Co-Run';
      case 'sequence':
        return 'Sequential';
      case 'exclusion':
        return 'Exclusion';
      case 'slotRestriction':
        return 'Slot Restriction';
      case 'loadLimit':
        return 'Load Limit';
      case 'phaseWindow':
        return 'Phase Window';
      default:
        return type;
    }
  };

  const activeRules = state.rules.filter(rule => rule.active);
  const inactiveRules = state.rules.filter(rule => !rule.active);

  return (
    <div className="space-y-6">
      {/* Rules Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{state.rules.length}</p>
                <p className="text-sm text-muted-foreground">Total Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeRules.length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(state.rules.reduce((acc, rule) => acc + (rule.weight || 0), 0) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Total Weight</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Rules */}
      {activeRules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Active Rules ({activeRules.length})</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeRules.map((rule) => (
              <Card key={rule.id} className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <span>{rule.name}</span>
                      <Badge className={getRuleTypeColor(rule.type)}>
                        {getRuleTypeLabel(rule.type)}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {rule.description && (
                    <CardDescription>{rule.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <Badge variant="outline">
                      {Math.round((rule.weight || 0) * 100)}%
                    </Badge>
                  </div>
                  
                  {rule.tasks && rule.tasks.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Tasks:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.tasks.slice(0, 3).map((taskId) => {
                          const task = state.tasks.find(t => t.id === taskId);
                          return (
                            <Badge key={taskId} variant="secondary" className="text-xs">
                              {task?.name || taskId}
                            </Badge>
                          );
                        })}
                        {rule.tasks.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.tasks.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {rule.workers && rule.workers.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Workers:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.workers.slice(0, 3).map((workerId) => {
                          const worker = state.workers.find(w => w.id === workerId);
                          return (
                            <Badge key={workerId} variant="secondary" className="text-xs">
                              {worker?.name || workerId}
                            </Badge>
                          );
                        })}
                        {rule.workers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.workers.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {rule.phases && rule.phases.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Phases:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.phases.map((phase) => (
                          <Badge key={phase} variant="outline" className="text-xs">
                            P{phase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Rules */}
      {inactiveRules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Pause className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Inactive Rules ({inactiveRules.length})</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inactiveRules.map((rule) => (
              <Card key={rule.id} className="border-gray-200 bg-gray-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <span className="text-muted-foreground">{rule.name}</span>
                      <Badge variant="outline" className={getRuleTypeColor(rule.type)}>
                        {getRuleTypeLabel(rule.type)}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {rule.description && (
                    <CardDescription className="text-muted-foreground">
                      {rule.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weight:</span>
                    <Badge variant="outline">
                      {Math.round((rule.weight || 0) * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <RuleBuilder
          editRule={editingRule}
          onClose={() => setEditingRule(null)}
        />
      )}
    </div>
  );
}