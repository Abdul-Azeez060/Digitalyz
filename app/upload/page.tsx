'use client';

import { EnhancedFileUpload } from '@/components/upload/enhanced-file-upload';
import { SampleDataGenerator } from '@/components/upload/sample-data-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, AlertTriangle, FileText, ArrowRight, Sparkles, Download, Zap, Users, FileSpreadsheet } from 'lucide-react';
import { useData } from '@/contexts/data-context';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { state } = useData();
  const router = useRouter();

  const uploadConfigs = [
    {
      fileType: 'clients' as const,
      title: 'Clients Data',
      description: 'Upload client information with priorities, budgets, and group tags',
      expectedHeaders: ['id', 'name', 'priority', 'budget', 'requestedTaskIds', 'groupTag', 'attributesJSON', 'phases'],
      uploaded: state.clients.length > 0,
      color: '#6366f1'
    },
    {
      fileType: 'workers' as const,
      title: 'Workers Data',
      description: 'Upload worker skills, capacity, availability, and group assignments',
      expectedHeaders: ['id', 'name', 'skills', 'capacity', 'hourlyRate', 'availableSlots', 'maxLoadPerPhase', 'workerGroup', 'qualificationLevel', 'phases'],
      uploaded: state.workers.length > 0,
      color: '#10b981'
    },
    {
      fileType: 'tasks' as const,
      title: 'Tasks Data',
      description: 'Upload task requirements, categories, and preferred phases',
      expectedHeaders: ['id', 'name', 'clientId', 'duration', 'requiredSkills', 'priority', 'category', 'preferredPhases', 'maxConcurrent', 'deadline', 'dependencies'],
      uploaded: state.tasks.length > 0,
      color: '#8b5cf6'
    }
  ];

  const uploadedCount = uploadConfigs.filter(config => config.uploaded).length;
  const allUploaded = uploadedCount === 3;
  const hasValidationErrors = state.validationErrors.filter(e => e.type === 'error').length > 0;

  const downloadSampleTemplate = (type: string) => {
    const templates = {
      clients: [
        { 
          id: 'client-001', 
          name: 'Acme Corp', 
          priority: 5, 
          budget: 150000, 
          requestedTaskIds: 'task-001,task-002,task-003',
          groupTag: 'enterprise',
          attributesJSON: '{"industry": "technology", "size": "large", "urgency": "high"}',
          phases: '1,2,3'
        },
        { 
          id: 'client-002', 
          name: 'StartupXYZ', 
          priority: 3, 
          budget: 50000, 
          requestedTaskIds: 'task-004,task-005',
          groupTag: 'startup',
          attributesJSON: '{"industry": "fintech", "size": "small", "urgency": "medium"}',
          phases: '1,2'
        }
      ],
      workers: [
        { 
          id: 'worker-001', 
          name: 'Alice Johnson', 
          skills: 'React,TypeScript,Node.js,AWS', 
          capacity: 40, 
          hourlyRate: 85, 
          availableSlots: '1,2,3,4,5',
          maxLoadPerPhase: 8,
          workerGroup: 'frontend',
          qualificationLevel: 5,
          phases: '1,2,3'
        },
        { 
          id: 'worker-002', 
          name: 'Bob Smith', 
          skills: 'Python,Django,PostgreSQL,Docker', 
          capacity: 35, 
          hourlyRate: 75, 
          availableSlots: '1,2,3,4',
          maxLoadPerPhase: 7,
          workerGroup: 'backend',
          qualificationLevel: 4,
          phases: '2,3,4'
        }
      ],
      tasks: [
        { 
          id: 'task-001', 
          name: 'Frontend Development', 
          clientId: 'client-001', 
          duration: 3, 
          requiredSkills: 'React,TypeScript', 
          priority: 5,
          category: 'development',
          preferredPhases: '1,2',
          maxConcurrent: 2,
          deadline: '2024-03-15', 
          dependencies: ''
        },
        { 
          id: 'task-002', 
          name: 'Backend API Development', 
          clientId: 'client-001', 
          duration: 4, 
          requiredSkills: 'Node.js,PostgreSQL', 
          priority: 5,
          category: 'development',
          preferredPhases: '2,3',
          maxConcurrent: 1,
          deadline: '2024-03-20', 
          dependencies: 'task-001'
        }
      ]
    };

    const data = templates[type as keyof typeof templates];
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Enhanced Data Upload</h1>
            <p className="page-subtitle">
              Upload your CSV or Excel files with comprehensive validation and AI-powered processing
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="badge-modern badge-info">
              {uploadedCount}/3 Files Uploaded
            </Badge>
            {allUploaded && !hasValidationErrors && (
              <Button 
                onClick={() => router.push('/dashboard')}
                className="btn-primary"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Processing Banner */}
      <Card className="card-modern mb-8 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3">Advanced AI Processing</h3>
              <p className="text-lg text-indigo-100">
                Comprehensive validation including relationship checks, group constraints, phase-slot analysis, and circular dependency detection
              </p>
            </div>
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-3">
                {allUploaded ? (
                  <CheckCircle className="h-6 w-6 text-emerald-300" />
                ) : (
                  <FileText className="h-6 w-6 text-white/60" />
                )}
                <div>
                  <p className="text-white font-medium">
                    {allUploaded ? 'All files uploaded' : `${uploadedCount} of 3 files uploaded`}
                  </p>
                  <p className="text-indigo-200 text-xs">File processing status</p>
                </div>
              </div>
              
              {state.validationErrors.length > 0 && (
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-orange-300" />
                  <div>
                    <p className="text-white font-medium">
                      {state.validationErrors.length} validation issues
                    </p>
                    <p className="text-indigo-200 text-xs">Requires attention</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sample Data Generator */}
      <div className="mb-8">
        <SampleDataGenerator />
      </div>

      {/* Enhanced Validation Features */}
      <Card className="card-modern mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <span>Comprehensive Data Validation</span>
          </CardTitle>
          <CardDescription>
            Our enhanced AI automatically detects and flags these data issues and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Missing required columns (ID, Name)',
              'Duplicate IDs across all data types',
              'Invalid task-client relationships',
              'Skill gaps in worker pool',
              'Malformed JSON in attributes',
              'Out-of-range priority levels (1-5)',
              'Phase-slot capacity overloads',
              'Circular task dependencies',
              'Invalid group tag references',
              'Worker overload conditions',
              'Preferred phase conflicts',
              'MaxConcurrent violations',
              'Available slots validation',
              'Qualification level checks',
              'Budget vs task cost analysis'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors Alert */}
      {hasValidationErrors && (
        <Alert className="mb-8 border-red-200 bg-red-50 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            Critical validation errors found. Please review your data in the dashboard before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* File Upload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {uploadConfigs.map((config) => (
          <div key={config.fileType} className="relative">
            {config.uploaded && (
              <div className="absolute top-6 right-6 z-10">
                <Badge className="badge-modern badge-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Uploaded
                </Badge>
              </div>
            )}
            <EnhancedFileUpload
              fileType={config.fileType}
              title={config.title}
              description={config.description}
              expectedHeaders={config.expectedHeaders}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Sample Data Templates */}
      <Card className="card-modern">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Download className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Enhanced Sample Data Templates</CardTitle>
              <CardDescription className="text-body">
                Download comprehensive templates with realistic data relationships and edge cases
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { name: 'Clients Template', type: 'clients', icon: Users, color: '#6366f1', features: ['Group tags', 'Attributes JSON', 'Task references'] },
              { name: 'Workers Template', type: 'workers', icon: Brain, color: '#10b981', features: ['Available slots', 'Worker groups', 'Qualifications'] },
              { name: 'Tasks Template', type: 'tasks', icon: Zap, color: '#8b5cf6', features: ['Categories', 'Preferred phases', 'Dependencies'] }
            ].map((template, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-all">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${template.color}15` }}
                  >
                    <Download className="h-4 w-4" style={{ color: template.color }} />
                  </div>
                  <span className="font-medium">{template.name}</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1 mb-4">
                  {template.features.map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full btn-outline"
                  onClick={() => downloadSampleTemplate(template.type)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Multiple Format Support</p>
                  <p className="text-sm text-blue-700">CSV, Excel (.xlsx), and legacy Excel (.xls) formats</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Enhanced Schema</p>
                  <p className="text-sm text-green-700">Includes all new fields: groups, attributes, slots, categories</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}