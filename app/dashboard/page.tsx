"use client";

import { useMemo, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EditableDataGrid } from "@/components/data/editable-data-grid";
import { DataModification } from "@/components/ai/data-modification";
import { PhaseGanttChart } from "@/components/charts/phase-gantt-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/contexts/data-context";
import { Client, Worker, Task } from "@/types/models";
import { EnhancedAIService } from "@/lib/enhanced-ai-service";
import {
  Users,
  Briefcase,
  CheckSquare,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Brain,
  Calendar,
  Wand2,
  Database,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { state, dispatch } = useData();
  const router = useRouter();
  const [interlinkValidation, setInterlinkValidation] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const hasData =
    state.clients.length > 0 ||
    state.workers.length > 0 ||
    state.tasks.length > 0;

  const clientColumns: ColumnDef<Client>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge
            className={`badge-modern ${
              row.original.priority > 3 ? "badge-error" : "badge-info"
            }`}>
            {row.original.priority}
          </Badge>
        ),
      },
      {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) =>
          row.original.budget
            ? `₹${row.original.budget.toLocaleString()}`
            : "-",
      },
      {
        accessorKey: "groupTag",
        header: "Group",
        cell: ({ row }) =>
          row.original.groupTag ? (
            <Badge className="badge-modern badge-info text-xs">
              {row.original.groupTag}
            </Badge>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "requestedTaskIds",
        header: "Requested Tasks",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.requestedTaskIds?.slice(0, 2).map((taskId) => (
              <Badge
                key={taskId}
                className="badge-modern badge-success text-xs">
                {taskId}
              </Badge>
            ))}
            {row.original.requestedTaskIds?.length > 2 && (
              <Badge className="badge-modern badge-info text-xs">
                +{row.original.requestedTaskIds.length - 2}
              </Badge>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const workerColumns: ColumnDef<Worker>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "skills",
        header: "Skills",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} className="badge-modern badge-success text-xs">
                {skill}
              </Badge>
            ))}
            {row.original.skills.length > 3 && (
              <Badge className="badge-modern badge-info text-xs">
                +{row.original.skills.length - 3}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => `${row.original.capacity}h`,
      },
      {
        accessorKey: "workerGroup",
        header: "Group",
        cell: ({ row }) =>
          row.original.workerGroup ? (
            <Badge className="badge-modern badge-info text-xs">
              {row.original.workerGroup}
            </Badge>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "qualificationLevel",
        header: "Qualification",
        cell: ({ row }) =>
          row.original.qualificationLevel ? (
            <Badge className="badge-modern badge-warning text-xs">
              Level {row.original.qualificationLevel}
            </Badge>
          ) : (
            "-"
          ),
      },
    ],
    []
  );

  const taskColumns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "clientId",
        header: "Client",
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => `${row.original.duration}h`,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) =>
          row.original.category ? (
            <Badge className="badge-modern badge-info text-xs">
              {row.original.category}
            </Badge>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "maxConcurrent",
        header: "Max Concurrent",
        cell: ({ row }) => row.original.maxConcurrent || 1,
      },
      {
        accessorKey: "preferredPhases",
        header: "Preferred Phases",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.preferredPhases?.map((phase) => (
              <Badge key={phase} className="badge-modern badge-info text-xs">
                P{phase}
              </Badge>
            ))}
          </div>
        ),
      },
    ],
    []
  );

  const runInterlinkValidation = async () => {
    setIsValidating(true);
    try {
      const aiService = EnhancedAIService.getInstance();
      const errors = await aiService.validateDataWithInterlinks(
        state.clients,
        state.workers,
        state.tasks
      );
      setInterlinkValidation(errors);
      dispatch({
        type: "SET_VALIDATION_ERRORS",
        payload: [...state.validationErrors, ...errors],
      });
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (hasData && interlinkValidation.length === 0) {
      runInterlinkValidation();
    }
  }, [hasData]);

  const stats = [
    {
      title: "Clients",
      value: state.clients.length,
      icon: Users,
      color: "text-blue-600",
      change: "+12%",
    },
    {
      title: "Workers",
      value: state.workers.length,
      icon: Briefcase,
      color: "text-green-600",
      change: "+8%",
    },
    {
      title: "Tasks",
      value: state.tasks.length,
      icon: CheckSquare,
      color: "text-purple-600",
      change: "+24%",
    },
    {
      title: "Validation Issues",
      value: state.validationErrors.length,
      icon: state.validationErrors.length > 0 ? AlertTriangle : CheckCircle,
      color:
        state.validationErrors.length > 0 ? "text-red-600" : "text-green-600",
      change: state.validationErrors.length > 0 ? "+3" : "0",
    },
  ];

  const criticalErrors = state.validationErrors.filter(
    (e) => e.type === "error"
  ).length;
  const interlinkErrors = interlinkValidation.filter(
    (e) => e.type === "error"
  ).length;

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Enhanced Data Dashboard</h1>
            <p className="page-subtitle">
              View and manage your uploaded data with comprehensive AI-powered
              validation and editing
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasData && (
              <Button
                onClick={runInterlinkValidation}
                disabled={isValidating}
                className="btn-outline">
                {isValidating ? (
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Validate Relationships
              </Button>
            )}
            {hasData && criticalErrors === 0 && (
              <Button
                onClick={() => router.push("/rules")}
                className="btn-primary">
                Configure Rules
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Data Uploaded</h3>
            <p className="text-body mb-6">
              Upload your CSV files to get started with enhanced data analysis
              and rule configuration
            </p>
            <Button
              onClick={() => router.push("/upload")}
              className="btn-primary">
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
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">
                    Enhanced AI Data Management
                  </h3>
                  <p className="text-lg text-purple-100">
                    Advanced validation, natural language modifications,
                    intelligent error correction, and comprehensive relationship
                    analysis
                  </p>
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
                  <div
                    className={`metric-change ${
                      stat.change.startsWith("+") ? "positive" : "negative"
                    }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="metric-value">{stat.value}</div>
                <div className="metric-label">{stat.title}</div>
              </div>
            ))}
          </div>

          {/* Critical Errors Alert */}
          {(criticalErrors > 0 || interlinkErrors > 0) && (
            <Alert className="mb-8 border-red-200 bg-red-50 rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                {criticalErrors + interlinkErrors} critical validation errors
                found. Please review and fix these issues before proceeding to
                rule configuration.
                {interlinkErrors > 0 &&
                  ` ${interlinkErrors} relationship validation errors detected.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Data Tables */}
          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-2xl p-1">
              <TabsTrigger
                value="clients"
                className="flex items-center space-x-2 rounded-xl">
                <Users className="h-4 w-4" />
                <span>Clients ({state.clients.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="workers"
                className="flex items-center space-x-2 rounded-xl">
                <Briefcase className="h-4 w-4" />
                <span>Workers ({state.workers.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex items-center space-x-2 rounded-xl">
                <CheckSquare className="h-4 w-4" />
                <span>Tasks ({state.tasks.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="modifications"
                className="flex items-center space-x-2 rounded-xl">
                <Wand2 className="h-4 w-4" />
                <span>AI Modify</span>
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="flex items-center space-x-2 rounded-xl">
                <Calendar className="h-4 w-4" />
                <span>Timeline</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-6">
              <EditableDataGrid
                data={state.clients}
                columns={clientColumns}
                validationErrors={state.validationErrors.filter((e) =>
                  e.field.includes("client")
                )}
                title="Enhanced Clients Data"
                searchPlaceholder="Search clients..."
                dataType="clients"
              />
            </TabsContent>

            <TabsContent value="workers" className="space-y-6">
              <EditableDataGrid
                data={state.workers}
                columns={workerColumns}
                validationErrors={state.validationErrors.filter((e) =>
                  e.field.includes("worker")
                )}
                title="Enhanced Workers Data"
                searchPlaceholder="Search workers..."
                dataType="workers"
              />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <EditableDataGrid
                data={state.tasks}
                columns={taskColumns}
                validationErrors={state.validationErrors.filter((e) =>
                  e.field.includes("task")
                )}
                title="Enhanced Tasks Data"
                searchPlaceholder="Search tasks..."
                dataType="tasks"
              />
            </TabsContent>

            <TabsContent value="modifications" className="space-y-6">
              <Tabs defaultValue="clients-mod" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-2xl p-1">
                  <TabsTrigger value="clients-mod" className="rounded-xl">
                    Clients
                  </TabsTrigger>
                  <TabsTrigger value="workers-mod" className="rounded-xl">
                    Workers
                  </TabsTrigger>
                  <TabsTrigger value="tasks-mod" className="rounded-xl">
                    Tasks
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="clients-mod">
                  <DataModification
                    data={state.clients}
                    dataType="clients"
                    columns={clientColumns}
                  />
                </TabsContent>

                <TabsContent value="workers-mod">
                  <DataModification
                    data={state.workers}
                    dataType="workers"
                    columns={workerColumns}
                  />
                </TabsContent>

                <TabsContent value="tasks-mod">
                  <DataModification
                    data={state.tasks}
                    dataType="tasks"
                    columns={taskColumns}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <PhaseGanttChart tasks={state.tasks} workers={state.workers} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
