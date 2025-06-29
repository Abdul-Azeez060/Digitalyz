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
import { DataGrid } from "@/components/data/data-grid";
import { AdvancedAIService } from "@/lib/advanced-ai-service";
import { useData } from "@/contexts/data-context";
import {
  Wand2,
  Brain,
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface DataModificationProps {
  data: any[];
  dataType: "clients" | "workers" | "tasks";
  columns: ColumnDef<any>[];
}

export function DataModification({
  data,
  dataType,
  columns,
}: DataModificationProps) {
  const { dispatch } = useData();
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const modificationSuggestions = [
    "Increase all task durations by 2 hours",
    "Set priority to 5 for all clients with budget > 50000",
    'Add "senior" skill to all workers with capacity > 40',
    "Change phase 1 to phase 2 for all tasks in client ABC",
    "Reduce capacity by 10% for overloaded workers",
    "Set deadline to next Friday for high priority tasks",
    'Add "urgent" tag to all tasks with priority > 4',
  ];

  const handleProcessModification = async () => {
    if (!command.trim()) return;

    setIsProcessing(true);
    try {
      const aiService = AdvancedAIService.getInstance();
      const result = await aiService.processNaturalLanguageModification(
        command,
        data,
        dataType
      );
      setResult(result);
      setShowPreview(result.success && result.changes.length > 0);
    } catch (error) {
      setResult({
        success: false,
        changes: [],
        message: "Error processing modification command",
        preview: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyChanges = () => {
    if (!result?.success || result.changes.length === 0) return;

    result.changes.forEach((change: any) => {
      const updateAction = {
        type: `UPDATE_${dataType.slice(0, -1).toUpperCase()}` as any,
        payload: {
          id: change.id,
          updates: { [change.field]: change.newValue },
        },
      };
      dispatch(updateAction);
    });

    setResult(null);
    setShowPreview(false);
    setCommand("");
  };

  const handleRejectChanges = () => {
    setResult(null);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      {/* Modification Interface */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-orange-600" />
            <span>AI Data Modification</span>
            <Badge className="badge-modern badge-warning">
              <Brain className="h-3 w-3 mr-1" />
              High Accuracy
            </Badge>
          </CardTitle>
          <CardDescription>
            Use natural language to make precise bulk changes to your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Command Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="e.g., 'Increase all task durations by 2 hours' or 'Set priority to 5 for clients with budget > 50000'"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleProcessModification()
              }
              className="flex-1"
            />
            <Button
              onClick={handleProcessModification}
              disabled={isProcessing || !command.trim()}>
              {isProcessing ? (
                <Brain className="h-4 w-4 animate-pulse" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Process
            </Button>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Modification examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {modificationSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  size="sm"
                  onClick={() => setCommand(suggestion)}
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

              {result.success && result.changes.length > 0 && (
                <div className="space-y-4">
                  {/* Change Summary */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          {result.changes.length} changes ready to apply
                        </h4>
                        <p className="text-sm text-blue-700">
                          Review the changes below before applying
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}>
                        <Eye className="h-4 w-4 mr-1" />
                        {showPreview ? "Hide" : "Preview"}
                      </Button>
                      <Button size="sm" onClick={handleRejectChanges}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApplyChanges}
                        className="btn-primary">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Apply Changes
                      </Button>
                    </div>
                  </div>

                  {/* Change Details */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {result.changes
                      .slice(0, 20)
                      .map((change: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="text-sm">
                            <span className="font-medium">{change.id}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              • {change.field}:{" "}
                            </span>
                            <span className="line-through text-red-600">
                              {change.oldValue}
                            </span>
                            <ArrowRight className="inline h-3 w-3 mx-2 text-gray-400" />
                            <span className="text-green-600 font-medium">
                              {change.newValue}
                            </span>
                          </div>
                        </div>
                      ))}
                    {result.changes.length > 20 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... and {result.changes.length - 20} more changes
                      </div>
                    )}
                  </div>

                  {/* Preview Grid */}
                  {showPreview && result.preview.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center space-x-2 text-green-800">
                          <Sparkles className="h-5 w-5" />
                          <span>Preview of Changes</span>
                        </CardTitle>
                        <CardDescription className="text-green-700">
                          This is how your data will look after applying the
                          changes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DataGrid
                          data={result.preview.slice(0, 10)}
                          columns={columns}
                          title="Modified Data Preview"
                          searchPlaceholder="Search preview..."
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
