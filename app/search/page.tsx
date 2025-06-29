'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedSearch } from '@/components/ai/advanced-search';
import { useData } from '@/contexts/data-context';
import { Search, Brain, Database, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export default function SearchPage() {
  const { state } = useData();

  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0;

  const clientColumns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { 
      accessorKey: 'priority', 
      header: 'Priority',
      cell: ({ row }) => (
        <Badge className={`badge-modern ${row.original.priority > 3 ? 'badge-error' : 'badge-info'}`}>
          {row.original.priority}
        </Badge>
      )
    },
    { 
      accessorKey: 'budget', 
      header: 'Budget',
      cell: ({ row }) => row.original.budget ? `$${row.original.budget.toLocaleString()}` : '-'
    }
  ], []);

  const workerColumns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { 
      accessorKey: 'skills', 
      header: 'Skills',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.skills.slice(0, 2).map((skill: string) => (
            <Badge key={skill} className="badge-modern badge-success text-xs">
              {skill}
            </Badge>
          ))}
          {row.original.skills.length > 2 && (
            <Badge className="badge-modern badge-info text-xs">
              +{row.original.skills.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    { 
      accessorKey: 'capacity', 
      header: 'Capacity',
      cell: ({ row }) => `${row.original.capacity}h`
    }
  ], []);

  const taskColumns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'clientId', header: 'Client' },
    { 
      accessorKey: 'duration', 
      header: 'Duration',
      cell: ({ row }) => `${row.original.duration}h`
    },
    { 
      accessorKey: 'priority', 
      header: 'Priority',
      cell: ({ row }) => (
        <Badge className={`badge-modern ${row.original.priority > 3 ? 'badge-error' : 'badge-success'}`}>
          {row.original.priority}
        </Badge>
      )
    }
  ], []);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Advanced AI Search</h1>
            <p className="page-subtitle">
              Search and filter your data using advanced natural language queries
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="badge-modern badge-info">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="badge-modern badge-success">
              <Sparkles className="h-3 w-3 mr-1" />
              Natural Language
            </Badge>
          </div>
        </div>
      </div>

      {!hasData ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Data Available</h3>
            <p className="text-body mb-6">
              Upload your data files first to use the advanced search functionality
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
                  <h3 className="text-xl font-bold mb-3">Advanced Natural Language Search</h3>
                  <p className="text-lg text-indigo-100">
                    Use complex queries like "All tasks with duration > 5 hours and having phase 2 in their preferred phases"
                  </p>
                </div>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6 text-yellow-300" />
                    <div>
                      <p className="text-white font-medium">Complex Queries</p>
                      <p className="text-indigo-200 text-xs">Multi-condition filtering</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Search className="h-6 w-6 text-blue-300" />
                    <div>
                      <p className="text-white font-medium">Smart Results</p>
                      <p className="text-indigo-200 text-xs">AI-powered matching</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Search Tabs */}
          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-2xl p-1">
              <TabsTrigger value="clients" className="flex items-center space-x-2 rounded-xl">
                <span>Clients ({state.clients.length})</span>
              </TabsTrigger>
              <TabsTrigger value="workers" className="flex items-center space-x-2 rounded-xl">
                <span>Workers ({state.workers.length})</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center space-x-2 rounded-xl">
                <span>Tasks ({state.tasks.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients">
              <AdvancedSearch
                data={state.clients}
                dataType="clients"
                columns={clientColumns}
              />
            </TabsContent>

            <TabsContent value="workers">
              <AdvancedSearch
                data={state.workers}
                dataType="workers"
                columns={workerColumns}
              />
            </TabsContent>

            <TabsContent value="tasks">
              <AdvancedSearch
                data={state.tasks}
                dataType="tasks"
                columns={taskColumns}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}