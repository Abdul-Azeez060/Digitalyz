'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/contexts/data-context';
import { CSVParser } from '@/lib/csv-parser';
import { 
  Download, 
  FileText, 
  Database, 
  Settings, 
  CheckCircle,
  ArrowRight,
  Package,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  filename: string;
  data: any[];
}

export default function ExportPage() {
  const { state } = useData();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: 'clients',
      name: 'Clients Data',
      description: 'Cleaned and validated client information',
      icon: Database,
      enabled: true,
      filename: 'clients_cleaned.csv',
      data: state.clients
    },
    {
      id: 'workers',
      name: 'Workers Data',
      description: 'Worker skills, capacity, and availability',
      icon: Database,
      enabled: true,
      filename: 'workers_cleaned.csv',
      data: state.workers
    },
    {
      id: 'tasks',
      name: 'Tasks Data',
      description: 'Task requirements and specifications',
      icon: Database,
      enabled: true,
      filename: 'tasks_cleaned.csv',
      data: state.tasks
    },
    {
      id: 'rules',
      name: 'Allocation Rules',
      description: 'Configured rules and constraints (JSON)',
      icon: Settings,
      enabled: true,
      filename: 'allocation_rules.json',
      data: state.rules
    },
    {
      id: 'weights',
      name: 'Prioritization Weights',
      description: 'Priority weights configuration (JSON)',
      icon: Settings,
      enabled: true,
      filename: 'prioritization_weights.json',
      data: [state.prioritizationWeights]
    }
  ]);

  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0;
  const selectedOptions = exportOptions.filter(option => option.enabled);
  const totalFiles = selectedOptions.length;

  const toggleOption = (optionId: string) => {
    setExportOptions(prev => 
      prev.map(option => 
        option.id === optionId 
          ? { ...option, enabled: !option.enabled }
          : option
      )
    );
  };

  const exportSingle = (option: ExportOption) => {
    if (option.filename.endsWith('.json')) {
      const jsonData = JSON.stringify(option.data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = option.filename;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      CSVParser.exportToCSV(option.data, option.filename);
    }
  };

  const exportAll = async () => {
    setIsExporting(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      selectedOptions.forEach(option => {
        if (option.data.length > 0 || option.id === 'weights') {
          exportSingle(option);
        }
      });
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPackage = async () => {
    setIsExporting(true);
    
    try {
      // Create a comprehensive export package
      const packageData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          totalClients: state.clients.length,
          totalWorkers: state.workers.length,
          totalTasks: state.tasks.length,
          totalRules: state.rules.length,
          validationErrors: state.validationErrors.length
        },
        clients: state.clients,
        workers: state.workers,
        tasks: state.tasks,
        rules: state.rules,
        prioritizationWeights: state.prioritizationWeights,
        validationErrors: state.validationErrors
      };
      
      const jsonData = JSON.stringify(packageData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data_alchemist_export_package.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Package export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = [
    { label: 'Clients', value: state.clients.length, color: 'text-blue-600' },
    { label: 'Workers', value: state.workers.length, color: 'text-green-600' },
    { label: 'Tasks', value: state.tasks.length, color: 'text-purple-600' },
    { label: 'Rules', value: state.rules.length, color: 'text-orange-600' }
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Export Data</h1>
            <p className="page-subtitle">
              Download your cleaned data and configured rules for production use
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="badge-modern badge-info">
              {totalFiles} files selected
            </Badge>
            {hasData && (
              <Button onClick={exportAll} disabled={isExporting || totalFiles === 0} className="btn-primary">
                {isExporting ? (
                  <Package className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Selected
              </Button>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Data to Export</h3>
            <p className="text-body mb-6">
              Upload and process your data files first before exporting
            </p>
            <Button onClick={() => window.location.href = '/upload'} className="btn-primary">
              Upload Data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Export Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="metric-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <FileText className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="metric-change positive">+{stat.value}</div>
                </div>
                <div className="metric-value">{stat.value}</div>
                <div className="metric-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Validation Status */}
          {state.validationErrors.length > 0 && (
            <Alert className="mb-8 border-yellow-200 bg-yellow-50 rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800 font-medium">
                {state.validationErrors.length} validation issues found. 
                Consider reviewing and fixing these before export for optimal results.
              </AlertDescription>
            </Alert>
          )}

          {/* Export Options */}
          <Card className="card-modern mb-8">
            <CardHeader>
              <CardTitle className="text-heading-3">Export Options</CardTitle>
              <CardDescription>
                Select which files you want to include in your export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl">
                  <Checkbox
                    id={option.id}
                    checked={option.enabled}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <option.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold">{option.name}</h4>
                      <Badge className="badge-modern badge-info text-xs">
                        {option.data.length} records
                      </Badge>
                    </div>
                    <p className="text-body text-sm">{option.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Filename: {option.filename}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSingle(option)}
                    disabled={option.data.length === 0 && option.id !== 'weights'}
                    className="btn-outline"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="card-modern overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Individual Files</h3>
                    <p className="text-blue-100 text-sm">
                      Export selected files separately for targeted use
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={exportAll} 
                  disabled={isExporting || totalFiles === 0}
                  className="w-full mt-6 bg-white text-blue-700 hover:bg-gray-50 border-0 font-medium"
                >
                  {isExporting ? 'Exporting...' : `Export ${totalFiles} Files`}
                </Button>
              </div>
            </Card>

            <Card className="card-modern overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-pink-700 p-8 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Complete Package</h3>
                    <p className="text-purple-100 text-sm">
                      Export everything as a single comprehensive JSON package
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={exportPackage}
                  disabled={isExporting}
                  className="w-full mt-6 bg-white text-purple-700 hover:bg-gray-50 border-0 font-medium"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Export Package
                </Button>
              </div>
            </Card>
          </div>

          {/* Export Instructions */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-heading-3">Export Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">CSV Files</p>
                  <p className="text-body text-sm">
                    Cleaned data ready for import into other systems or spreadsheet applications
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">JSON Configuration</p>
                  <p className="text-body text-sm">
                    Rules and weights in structured format for integration with allocation engines
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Complete Package</p>
                  <p className="text-body text-sm">
                    All data and metadata in a single file for backup or system migration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}