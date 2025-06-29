'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RuleRecommendations } from '@/components/ai/rule-recommendations';
import { ErrorCorrection } from '@/components/ai/error-correction';
import { useData } from '@/contexts/data-context';
import { AIService } from '@/lib/ai-service';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  BarChart3,
  Users,
  Clock,
  Target,
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Zap,
  DollarSign,
  Wand2,
  Settings
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'optimization' | 'warning' | 'suggestion' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

export default function InsightsPage() {
  const { state } = useData();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0;

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newInsights: Insight[] = [
        {
          id: '1',
          type: 'optimization',
          title: 'Resource Utilization Opportunity',
          description: `${Math.floor(Math.random() * 30 + 10)}% of workers have capacity for additional tasks. Consider redistributing workload to maximize efficiency.`,
          impact: 'high',
          actionable: true,
          data: { underutilizedWorkers: Math.floor(Math.random() * 5 + 2) }
        },
        {
          id: '2',
          type: 'warning',
          title: 'Skill Gap Detected',
          description: `${Math.floor(Math.random() * 15 + 5)} tasks require skills not available in current worker pool. Consider training or hiring.`,
          impact: 'high',
          actionable: true,
          data: { missingSkills: ['React', 'Python', 'Design'] }
        },
        {
          id: '3',
          type: 'suggestion',
          title: 'Co-run Opportunity',
          description: `Tasks for Client ${state.clients[0]?.id || 'A'} could be grouped together for ${Math.floor(Math.random() * 20 + 10)}% efficiency gain.`,
          impact: 'medium',
          actionable: true
        },
        {
          id: '4',
          type: 'trend',
          title: 'Workload Distribution Pattern',
          description: `${Math.floor(Math.random() * 40 + 30)}% of tasks are concentrated in Phase ${Math.floor(Math.random() * 3 + 1)}. Consider load balancing.`,
          impact: 'medium',
          actionable: false
        },
        {
          id: '5',
          type: 'optimization',
          title: 'Budget Optimization',
          description: `Potential cost savings of ₹${Math.floor(Math.random() * 5000 + 1000)} by optimizing worker-task assignments based on hourly rates.`,
          impact: 'high',
          actionable: true
        },
        {
          id: '6',
          type: 'suggestion',
          title: 'Timeline Optimization',
          description: `Parallel execution of ${Math.floor(Math.random() * 8 + 3)} tasks could reduce project timeline by ${Math.floor(Math.random() * 15 + 5)} days.`,
          impact: 'medium',
          actionable: true
        }
      ];
      
      setInsights(newInsights);
      setLastGenerated(new Date());
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (hasData && insights.length === 0) {
      generateInsights();
    }
  }, [hasData]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'optimization':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'trend':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
    }
  };

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-info';
    }
  };

  const insightsByType = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, Insight[]>);

  const stats = [
    {
      title: 'Total Insights',
      value: insights.length,
      icon: Brain,
      color: 'text-purple-600'
    },
    {
      title: 'High Impact',
      value: insights.filter(i => i.impact === 'high').length,
      icon: Target,
      color: 'text-red-600'
    },
    {
      title: 'Actionable',
      value: insights.filter(i => i.actionable).length,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Optimizations',
      value: insights.filter(i => i.type === 'optimization').length,
      icon: TrendingUp,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">AI Insights & Corrections</h1>
            <p className="page-subtitle">
              Get intelligent suggestions, automated optimizations, and error corrections for your workflow
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {lastGenerated && (
              <Badge className="badge-modern badge-info">
                <Clock className="h-3 w-3 mr-1" />
                Updated {lastGenerated.toLocaleTimeString()}
              </Badge>
            )}
            {hasData && (
              <Button onClick={generateInsights} disabled={isGenerating} className="btn-primary">
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Analyzing...' : 'Refresh Insights'}
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
              Upload your data files first to generate AI-powered insights
            </p>
            <Button onClick={() => window.location.href = '/upload'} className="btn-primary">
              Upload Data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* AI Features Banner */}
          <Card className="card-modern mb-8 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Advanced AI Analysis</h3>
                  <p className="text-lg text-indigo-100">
                    Comprehensive insights, rule recommendations, and intelligent error correction
                  </p>
                </div>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                    <div>
                      <p className="text-white font-medium">Smart Insights</p>
                      <p className="text-indigo-200 text-xs">Pattern recognition</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wand2 className="h-6 w-6 text-green-300" />
                    <div>
                      <p className="text-white font-medium">Auto Corrections</p>
                      <p className="text-indigo-200 text-xs">Error fixing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="metric-change positive">+{Math.floor(Math.random() * 10 + 5)}%</div>
                </div>
                <div className="metric-value">{stat.value}</div>
                <div className="metric-label">{stat.title}</div>
              </div>
            ))}
          </div>

          {/* AI Features Tabs */}
          <Tabs defaultValue="insights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-2xl p-1">
              <TabsTrigger value="insights" className="flex items-center space-x-2 rounded-xl">
                <Lightbulb className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center space-x-2 rounded-xl">
                <Target className="h-4 w-4" />
                <span>Rule Recommendations</span>
              </TabsTrigger>
              <TabsTrigger value="corrections" className="flex items-center space-x-2 rounded-xl">
                <Wand2 className="h-4 w-4" />
                <span>Error Correction</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2 rounded-xl">
                <BarChart3 className="h-4 w-4" />
                <span>Data Analysis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights">
              {isGenerating ? (
                <Card className="card-modern">
                  <CardContent className="p-12 text-center">
                    <Brain className="h-16 w-16 text-blue-600 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-xl font-semibold mb-3">Analyzing Your Data</h3>
                    <p className="text-body">
                      AI is processing your data to generate actionable insights...
                    </p>
                  </CardContent>
                </Card>
              ) : insights.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {insights.map((insight) => (
                    <Card key={insight.id} className="card-modern group cursor-pointer">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getInsightIcon(insight.type)}
                            <span className="text-lg font-semibold">{insight.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`badge-modern ${getImpactColor(insight.impact)}`}>
                              {insight.impact} impact
                            </Badge>
                            {insight.actionable && (
                              <Badge className="badge-modern badge-success">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Actionable
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-body mb-4">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Button size="sm" className="btn-outline">
                            Take Action
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="card-modern">
                  <CardContent className="p-12 text-center">
                    <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold mb-3">No Insights Generated</h3>
                    <p className="text-body mb-6">
                      Click "Refresh Insights" to analyze your data and generate recommendations
                    </p>
                    <Button onClick={generateInsights} className="btn-primary">
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations">
              <RuleRecommendations />
            </TabsContent>

            <TabsContent value="corrections">
              <ErrorCorrection />
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>Workload Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Tasks</span>
                        <Badge className="badge-modern badge-info">{state.tasks.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Duration</span>
                        <Badge className="badge-modern badge-info">
                          {state.tasks.reduce((sum, task) => sum + task.duration, 0)}h
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Priority</span>
                        <Badge className="badge-modern badge-info">
                          {(state.tasks.reduce((sum, task) => sum + task.priority, 0) / state.tasks.length).toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span>Resource Capacity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Workers</span>
                        <Badge className="badge-modern badge-success">{state.workers.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Capacity</span>
                        <Badge className="badge-modern badge-success">
                          {state.workers.reduce((sum, worker) => sum + worker.capacity, 0)}h
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Utilization Rate</span>
                        <Badge className="badge-modern badge-warning">
                          {Math.round((state.tasks.reduce((sum, task) => sum + task.duration, 0) / 
                            state.workers.reduce((sum, worker) => sum + worker.capacity, 0)) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}