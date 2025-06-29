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
  Wand2,
  Brain,
  CheckCircle,
  AlertTriangle,
  Target,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";

export function ErrorCorrection() {
  const { state, dispatch } = useData();
  const [corrections, setCorrections] = useState<any[]>([]);
  const [autoFixable, setAutoFixable] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [appliedCorrections, setAppliedCorrections] = useState<Set<string>>(
    new Set()
  );

  const generateCorrections = async () => {
    if (state.validationErrors.length === 0) return;

    setIsGenerating(true);
    try {
      const aiService = AdvancedAIService.getInstance();

      // Generate corrections for each data type
      const allCorrections: any[] = [];
      const allAutoFixable: any[] = [];

      if (state.clients.length > 0) {
        const clientErrors = state.validationErrors.filter(
          (e) => e.field.includes("client") || e.row !== undefined
        );
        const clientResult = await aiService.generateErrorCorrections(
          clientErrors,
          state.clients,
          "clients"
        );
        allCorrections.push(...clientResult.corrections);
        allAutoFixable.push(...clientResult.autoFixable);
      }

      if (state.workers.length > 0) {
        const workerErrors = state.validationErrors.filter((e) =>
          e.field.includes("worker")
        );
        const workerResult = await aiService.generateErrorCorrections(
          workerErrors,
          state.workers,
          "workers"
        );
        allCorrections.push(...workerResult.corrections);
        allAutoFixable.push(...workerResult.autoFixable);
      }

      if (state.tasks.length > 0) {
        const taskErrors = state.validationErrors.filter((e) =>
          e.field.includes("task")
        );
        const taskResult = await aiService.generateErrorCorrections(
          taskErrors,
          state.tasks,
          "tasks"
        );
        allCorrections.push(...taskResult.corrections);
        allAutoFixable.push(...taskResult.autoFixable);
      }

      setCorrections(allCorrections);
      setAutoFixable(allAutoFixable);
    } catch (error) {
      console.error("Error generating corrections:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (state.validationErrors.length > 0) {
      generateCorrections();
    }
  }, [state.validationErrors.length]);

  const handleApplyCorrection = (correction: any) => {
    const { errorId, correction: correctionData } = correction;

    // Apply the correction based on the error type
    const error = state.validationErrors.find((e) => e.id === errorId);
    if (error && error.row !== undefined) {
      // Determine data type and apply update
      let dataType = "clients";
      let data = state.clients;

      if (error.field.includes("worker")) {
        dataType = "workers";
        data = state.workers;
      } else if (error.field.includes("task")) {
        dataType = "tasks";
        data = state.tasks;
      }

      const item = data[error.row];
      if (item) {
        const updateAction = {
          type: `UPDATE_${dataType.slice(0, -1).toUpperCase()}` as any,
          payload: {
            id: item.id,
            updates: { [correctionData.field]: correctionData.newValue },
          },
        };
        dispatch(updateAction);

        setAppliedCorrections((prev) => new Set([...prev, errorId]));
      }
    }
  };

  const handleApplyAllAutoFix = () => {
    autoFixable.forEach((correction) => {
      if (!appliedCorrections.has(correction.errorId)) {
        handleApplyCorrection(correction);
      }
    });
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

  const availableCorrections = corrections.filter(
    (c) => !appliedCorrections.has(c.errorId)
  );

  const availableAutoFix = autoFixable.filter(
    (c) => !appliedCorrections.has(c.errorId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-green-600" />
            <span>AI Error Correction</span>
            <Badge className="badge-modern badge-success">
              <Brain className="h-3 w-3 mr-1" />
              Smart Fixes
            </Badge>
          </CardTitle>
          <CardDescription>
            AI analyzes validation errors and suggests precise corrections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {availableCorrections.length} corrections available
              </div>
              <div className="text-sm text-gray-600">
                {availableAutoFix.length} auto-fixable
              </div>
            </div>
            <div className="flex space-x-2">
              {availableAutoFix.length > 0 && (
                <Button onClick={handleApplyAllAutoFix} className="btn-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-fix All ({availableAutoFix.length})
                </Button>
              )}
              <Button onClick={generateCorrections} disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corrections */}
      {isGenerating ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-green-600 mx-auto mb-6 animate-pulse" />
            <h3 className="text-xl font-semibold mb-3">Analyzing Errors</h3>
            <p className="text-body">
              AI is generating precise correction suggestions...
            </p>
          </CardContent>
        </Card>
      ) : availableCorrections.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableCorrections.map((correction, index) => (
            <Card
              key={index}
              className="card-modern group hover:shadow-lg transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Error Correction</span>
                  {correction.autoFixable && (
                    <Badge className="badge-modern badge-success">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Auto-fixable
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Correction Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Field:</span>
                    <Badge>{correction.correction.field}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current:</span>
                      <span className="text-sm text-red-600 font-mono">
                        {correction.correction.oldValue || "empty"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Suggested:</span>
                      <span className="text-sm text-green-600 font-mono">
                        {correction.correction.newValue}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reasoning:</span>{" "}
                      {correction.correction.reasoning}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center space-x-4">
                  <Badge
                    className={`badge-modern ${getImpactColor(
                      correction.impact
                    )}`}>
                    {correction.impact} impact
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span
                      className={`text-sm font-medium ${getConfidenceColor(
                        correction.correction.confidence
                      )}`}>
                      {Math.round(correction.correction.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  onClick={() => handleApplyCorrection(correction)}
                  className="w-full btn-primary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Correction
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : state.validationErrors.length === 0 ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Errors Found</h3>
            <p className="text-body">
              Your data is clean and ready for rule configuration!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">
              No Corrections Available
            </h3>
            <p className="text-body mb-6">
              Upload data with validation errors to get AI-powered correction
              suggestions
            </p>
            <Button onClick={generateCorrections} className="btn-primary">
              <Brain className="h-4 w-4 mr-2" />
              Generate Corrections
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
