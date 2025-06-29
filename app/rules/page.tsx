'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedRuleBuilder } from '@/components/rules/advanced-rule-builder';
import { RulesList } from '@/components/rules/rules-list';
import { RuleRecommendations } from '@/components/ai/rule-recommendations';
import { NaturalLanguageRules } from '@/components/ai/natural-language-rules';
import { useData } from '@/contexts/data-context';
import { AIService } from '@/lib/ai-service';
import { 
  Settings, 
  Plus, 
  Brain, 
  Lightbulb, 
  Database,
  ArrowRight,
  CheckCircle,
  Target,
  Sparkles,
  Wand2
} from 'lucide-react';

export default function RulesPage() {
  const { state, dispatch } = useData();
  const [showBuilder, setShowBuilder] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0;
  const hasRules = state.rules.length > 0;
  const activeRules = state.rules.filter(rule => rule.active).length;

  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const aiService = AIService.getInstance();
      const suggestions = await aiService.suggestRules({
        clients: state.clients,
        workers: state.workers,
        tasks: state.tasks
      });
      
      suggestions.forEach(suggestion => {
        dispatch({ type: 'ADD_RULE', payload: suggestion });
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Advanced Rule Builder</h1>
            <p className="page-subtitle">
              Configure sophisticated allocation rules with AI assistance and pattern matching
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasRules && (
              <Badge className="badge-modern badge-info">
                {activeRules} of {state.rules.length} rules active
              </Badge>
            )}
            {hasData && (
              <Button onClick={() => setShowBuilder(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Advanced Rule
              </Button>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Data Available</h3>
            <p className="text-body mb-6">
              Upload your data files first to create advanced allocation rules
            </p>
            <Button onClick={() => window.location.href = '/upload'} className="btn-primary">
              Upload Data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Enhanced AI Features Banner */}
          <Card className="card-modern mb-8 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">AI-Powered Advanced Rule Creation</h3>
                  <p className="text-lg text-purple-100">
                    Pattern matching, precedence override, natural language conversion, and intelligent rule suggestions
                  </p>
                </div>
                <Button 
                  onClick={generateAISuggestions}
                  disabled={isGeneratingSuggestions}
                  className="bg-white text-purple-700 hover:bg-gray-50 border-0 font-medium"
                >
                  {isGeneratingSuggestions ? (
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate AI Suggestions
                </Button>
              </div>
            </div>
          </Card>

          {/* Enhanced Rules Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div className="metric-change positive">+{state.rules.length}</div>
              </div>
              <div className="metric-value">{state.rules.length}</div>
              <div className="metric-label">Total Rules</div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="metric-change positive">+{activeRules}</div>
              </div>
              <div className="metric-value">{activeRules}</div>
              <div className="metric-label">Active Rules</div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div className="metric-change positive">+{state.rules.filter(r => r.name.includes('AI')).length}</div>
              </div>
              <div className="metric-value">
                {state.rules.filter(r => r.name.includes('AI')).length}
              </div>
              <div className="metric-label">AI Suggested</div>
            </div>
            
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div className="metric-change positive">
                  {Math.round(state.rules.reduce((acc, rule) => acc + (rule.weight || 0), 0) * 100)}%
                </div>
              </div>
              <div className="metric-value">
                {Math.round(state.rules.reduce((acc, rule) => acc + (rule.weight || 0), 0) * 100)}%
              </div>
              <div className="metric-label">Total Weight</div>
            </div>
          </div>

          {/* Enhanced Rule Management Tabs */}
          <Tabs defaultValue="rules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-2xl p-1">
              <TabsTrigger value="rules" className="flex items-center space-x-2 rounded-xl">
                <Settings className="h-4 w-4" />
                <span>Rules</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center space-x-2 rounded-xl">
                <Lightbulb className="h-4 w-4" />
                <span>AI Recommendations</span>
              </TabsTrigger>
              <TabsTrigger value="natural-language" className="flex items-center space-x-2 rounded-xl">
                <Wand2 className="h-4 w-4" />
                <span>Natural Language</span>
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center space-x-2 rounded-xl">
                <Plus className="h-4 w-4" />
                <span>Advanced Builder</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              {hasRules ? (
                <RulesList />
              ) : (
                <Card className="card-modern">
                  <CardContent className="p-12 text-center">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold mb-3">No Rules Configured</h3>
                    <p className="text-body mb-6">
                      Create your first advanced allocation rule with pattern matching and precedence control
                    </p>
                    <div className="flex justify-center space-x-3">
                      <Button onClick={() => setShowBuilder(true)} className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Advanced Rule
                      </Button>
                      <Button onClick={generateAISuggestions} className="btn-outline">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Suggestions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations">
              <RuleRecommendations />
            </TabsContent>

            <TabsContent value="natural-language">
              <NaturalLanguageRules />
            </TabsContent>

            <TabsContent value="builder">
              <Card className="card-modern">
                <CardContent className="p-12 text-center">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-3">Advanced Visual Rule Builder</h3>
                  <p className="text-body mb-6">
                    Create sophisticated rules with pattern matching, precedence override, and advanced parameters
                  </p>
                  <Button onClick={() => setShowBuilder(true)} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Open Advanced Builder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Advanced Rule Builder Modal */}
          {showBuilder && (
            <AdvancedRuleBuilder onClose={() => setShowBuilder(false)} />
          )}
        </>
      )}
    </div>
  );
}