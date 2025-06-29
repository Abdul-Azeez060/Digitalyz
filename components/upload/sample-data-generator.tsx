"use client";

import { useState } from "react";
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
import { EnhancedCSVParser } from "@/lib/enhanced-csv-parser";
import { useData } from "@/contexts/data-context";
import {
  Download,
  Database,
  Sparkles,
  FileText,
  Users,
  Briefcase,
  CheckSquare,
} from "lucide-react";

export function SampleDataGenerator() {
  const { dispatch } = useData();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndLoadSampleData = async () => {
    setIsGenerating(true);
    try {
      const sampleData = EnhancedCSVParser.generateSampleData();

      // Load into context
      dispatch({ type: "SET_CLIENTS", payload: sampleData.clients });
      dispatch({ type: "SET_WORKERS", payload: sampleData.workers });
      dispatch({ type: "SET_TASKS", payload: sampleData.tasks });

      // Simulate validation
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error generating sample data:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSampleCSV = (type: "clients" | "workers" | "tasks") => {
    const sampleData = EnhancedCSVParser.generateSampleData();
    EnhancedCSVParser.exportToCSV(sampleData[type], `sample_${type}.csv`);
  };

  const downloadAllSamples = () => {
    const sampleData = EnhancedCSVParser.generateSampleData();
    EnhancedCSVParser.exportToCSV(sampleData.clients, "sample_clients.csv");
    EnhancedCSVParser.exportToCSV(sampleData.workers, "sample_workers.csv");
    EnhancedCSVParser.exportToCSV(sampleData.tasks, "sample_tasks.csv");
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Database className="h-5 w-5 text-emerald-600" />
          </div>
          <span>Sample Data Generator</span>
        </CardTitle>
        <CardDescription>
          Generate comprehensive sample data with realistic relationships and
          edge cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Load */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                Quick Start with Sample Data
              </h3>
              <p className="text-emerald-700 text-sm">
                Load pre-configured sample data with 3 clients, 4 workers, and 8
                tasks including complex relationships
              </p>
            </div>
            <Button
              onClick={generateAndLoadSampleData}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isGenerating ? (
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Load Sample Data"}
            </Button>
          </div>
        </div>

        {/* Sample Data Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Clients</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enterprise & startup clients</li>
              <li>• Priority levels 3-5</li>
              <li>• Group tags & attributes</li>
              <li>• Realistic budgets</li>
            </ul>
          </div>

          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center space-x-3 mb-3">
              <Briefcase className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Workers</h4>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Frontend, backend, design skills</li>
              <li>• Available slots & load limits</li>
              <li>• Worker groups & qualifications</li>
              <li>• Realistic hourly rates</li>
            </ul>
          </div>

          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center space-x-3 mb-3">
              <CheckSquare className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Tasks</h4>
            </div>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Development, design, testing</li>
              <li>• Task dependencies</li>
              <li>• Preferred phases & concurrency</li>
              <li>• Skill requirements</li>
            </ul>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-4">
          <h4 className="font-medium">Download Sample Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button
              onClick={() => downloadSampleCSV("clients")}
              className="btn-outline">
              <FileText className="h-4 w-4 mr-2" />
              Clients CSV
            </Button>
            <Button
              onClick={() => downloadSampleCSV("workers")}
              className="btn-outline">
              <FileText className="h-4 w-4 mr-2" />
              Workers CSV
            </Button>
            <Button
              onClick={() => downloadSampleCSV("tasks")}
              className="btn-outline">
              <FileText className="h-4 w-4 mr-2" />
              Tasks CSV
            </Button>
            <Button onClick={downloadAllSamples} className="btn-outline">
              <Download className="h-4 w-4 mr-2" />
              All Templates
            </Button>
          </div>
        </div>

        {/* Data Relationships Info */}
        <Alert className="border-blue-200 bg-blue-50 rounded-2xl">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Sample Data Includes:</strong> Complex relationships,
            circular dependency detection, skill mismatches, phase overloads,
            group constraints, and other edge cases for comprehensive testing.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
