"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdvancedAIService } from "@/lib/advanced-ai-service";
import { useData } from "@/contexts/data-context";
import {
  Brain,
  Wand2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Target,
  Settings,
} from "lucide-react";

export function NaturalLanguageRules() {
  const { state, dispatch } = useData();
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const ruleSuggestions = [
    "Tasks T1 and T2 should always run together",
    "Worker W1 should not work more than 6 hours per phase",
    "High priority clients should get their tasks done first",
    "Tasks requiring Python skills should be in phases 2-3",
    "Sales workers should not be overloaded during peak season",
    "Critical tasks must be completed before dependent tasks",
    "Client ABC tasks should be grouped for efficiency",
  ];

  const handleConvertRule = async () => {
    if (!description.trim()) return;

    setIsProcessing(true);
    try {
      const aiService = AdvancedAIService.getInstance();
      const result = await aiService.convertNaturalLanguageToRule(
        description,
        state.clients,
        state.workers,
        state.tasks
      );
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: "Error converting rule description",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRule = () => {
    if (result?.success && result.rule) {
      dispatch({ type: "ADD_RULE", payload: result.rule });
      setResult(null);
      setDescription("");
    }
  };

  const handleRejectRule = () => {
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Rule Converter Interface */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-violet-600" />
            <span>Natural Language to Rules</span>
            <Badge className="badge-modern badge-info">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Describe your business rule in plain English and let AI convert it
            to a structured rule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rule Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="e.g., 'Tasks T1 and T2 should always run together' or 'Worker W1 should not work more than 6 hours per phase'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleConvertRule()}
              className="flex-1"
            />
            <Button
              onClick={handleConvertRule}
              disabled={isProcessing || !description.trim()}>
              {isProcessing ? (
                <Brain className="h-4 w-4 animate-pulse" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Convert
            </Button>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Rule examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {ruleSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  size="sm"
                  onClick={() => setDescription(suggestion)}
                  className="text-xs">
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {result.success && result.rule && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <Target className="h-5 w-5" />
                      <span>Generated Rule</span>
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Review the generated rule before adding it to your
                      configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rule Details */}
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Name:</span>
                        <span className="text-gray-700">
                          {result.rule.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Type:</span>
                        <Badge variant="outline">{result.rule.type}</Badge>
                      </div>
                      {result.rule.description && (
                        <div className="space-y-1">
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-gray-600">
                            {result.rule.description}
                          </p>
                        </div>
                      )}
                      {result.rule.tasks && result.rule.tasks.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium">Tasks:</span>
                          <div className="flex flex-wrap gap-1">
                            {result.rule.tasks.map((taskId: string) => (
                              <Badge
                                key={taskId}
                                variant="secondary"
                                className="text-xs">
                                {taskId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.rule.workers &&
                        result.rule.workers.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-medium">Workers:</span>
                            <div className="flex flex-wrap gap-1">
                              {result.rule.workers.map((workerId: string) => (
                                <Badge
                                  key={workerId}
                                  variant="secondary"
                                  className="text-xs">
                                  {workerId}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      {result.rule.phases && result.rule.phases.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-medium">Phases:</span>
                          <div className="flex flex-wrap gap-1">
                            {result.rule.phases.map((phase: number) => (
                              <Badge
                                key={phase}
                                variant="outline"
                                className="text-xs">
                                P{phase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Weight:</span>
                        <span className="text-gray-700">
                          {Math.round((result.rule.weight || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAcceptRule}
                        className="flex-1 btn-primary">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRejectRule}
                        className="btn-outline">
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Settings className="h-5 w-5" />
            <span>Rule Writing Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Be specific with IDs</p>
                <p className="text-sm text-blue-700">
                  Use exact task IDs (T1, T2) or worker IDs (W1, W2) from your
                  data
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Use clear relationships</p>
                <p className="text-sm text-blue-700">
                  Words like "together", "before", "not more than", "should be"
                  help AI understand intent
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Include constraints</p>
                <p className="text-sm text-blue-700">
                  Specify limits like "6 hours per phase" or "phases 2-3" for
                  precise rules
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
