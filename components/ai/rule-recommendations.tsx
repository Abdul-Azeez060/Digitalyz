"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdvancedAIService } from "@/lib/advanced-ai-service";
import { useData } from "@/contexts/data-context";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  X,
  Sparkles,
  Target,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export function RuleRecommendations() {
  const { state, dispatch } = useData();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<
    Set<string>
  >(new Set());

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const aiService = AdvancedAIService.getInstance();
      const result = await aiService.generateRuleRecommendations(
        state.clients,
        state.workers,
        state.tasks
      );
      setRecommendations(result.recommendations);
      setInsights(result.insights);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (
      state.clients.length > 0 &&
      state.workers.length > 0 &&
      state.tasks.length > 0
    ) {
      generateRecommendations();
    }
  }, [state.clients.length, state.workers.length, state.tasks.length]);

  const handleAcceptRecommendation = (recommendation: any) => {
    dispatch({ type: "ADD_RULE", payload: recommendation.rule });
    setDismissedRecommendations(
      (prev) => new Set([...prev, recommendation.rule.id])
    );
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations((prev) => new Set([...prev, recommendationId]));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-info";
      default:
        return "badge-info";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const visibleRecommendations = recommendations.filter(
    (rec) => !dismissedRecommendations.has(rec.rule.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <span>AI Rule Recommendations</span>
            <Badge className="badge-modern badge-info">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Suggestions
            </Badge>
          </CardTitle>
          <CardDescription>
            AI analyzes your data patterns and suggests optimization rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {visibleRecommendations.length} active recommendations
              </div>
              {insights.length > 0 && (
                <div className="text-sm text-gray-600">
                  {insights.length} insights discovered
                </div>
              )}
            </div>
            <Button onClick={generateRecommendations} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Refresh Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              <span>Data Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    {insight}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {isGenerating ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-indigo-600 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-semibold mb-3">Analyzing Your Data</h3>
            <p className="text-body">
              AI is discovering patterns and generating rule recommendations...
            </p>
          </CardContent>
        </Card>
      ) : visibleRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleRecommendations.map((recommendation, index) => (
            <Card
              key={index}
              className="card-modern group hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Target className="h-5 w-5 text-indigo-600" />
                      <span>{recommendation.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {recommendation.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDismissRecommendation(recommendation.rule.id)
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="flex items-center space-x-4">
                  <Badge
                    className={`badge-modern ${getImpactColor(
                      recommendation.impact
                    )}`}>
                    {recommendation.impact} impact
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span
                      className={`text-sm font-medium ${getConfidenceColor(
                        recommendation.confidence
                      )}`}>
                      {Math.round(recommendation.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Rule Details */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rule Type:</span>
                    <Badge>{recommendation.rule.type}</Badge>
                  </div>
                  {recommendation.rule.tasks && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasks:</span>
                      <span className="text-sm text-gray-600">
                        {recommendation.rule.tasks.length} tasks
                      </span>
                    </div>
                  )}
                  {recommendation.rule.workers && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Workers:</span>
                      <span className="text-sm text-gray-600">
                        {recommendation.rule.workers.length} workers
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weight:</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((recommendation.rule.weight || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAcceptRecommendation(recommendation)}
                    className="flex-1 btn-primary">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Rule
                  </Button>
                  <Button
                    onClick={() =>
                      handleDismissRecommendation(recommendation.rule.id)
                    }
                    className="btn-outline">
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">
              No Recommendations Available
            </h3>
            <p className="text-body mb-6">
              Upload more data or click "Refresh Recommendations" to get
              AI-powered rule suggestions
            </p>
            <Button onClick={generateRecommendations} className="btn-primary">
              <Brain className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
