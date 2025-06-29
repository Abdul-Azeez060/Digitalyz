'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertTriangle, CheckCircle, Brain, ArrowUp, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CSVParser } from '@/lib/csv-parser';
import { AIService } from '@/lib/ai-service';
import { useData } from '@/contexts/data-context';
import { Client, Worker, Task } from '@/types/models';

interface FileUploadProps {
  fileType: 'clients' | 'workers' | 'tasks';
  title: string;
  description: string;
  expectedHeaders: string[];
}

export function FileUpload({ fileType, title, description, expectedHeaders }: FileUploadProps) {
  const { dispatch } = useData();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const getColor = () => {
    switch (fileType) {
      case 'clients': return '#6366f1';
      case 'workers': return '#10b981';
      case 'tasks': return '#8b5cf6';
      default: return '#6366f1';
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(20);

    try {
      // Parse CSV
      const { data, errors: parseErrors } = await CSVParser.parseCSV(file);
      setUploadProgress(40);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setUploadStatus('error');
        return;
      }

      setUploadStatus('processing');
      setUploadProgress(60);

      // AI header mapping
      const aiService = AIService.getInstance();
      const uploadedHeaders = Object.keys(data[0] || {});
      const mapping = await aiService.mapHeaders(uploadedHeaders, expectedHeaders);

      setUploadProgress(80);
      await processData(data);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['Failed to process file']);
      setUploadStatus('error');
    }
  }, [fileType, expectedHeaders]);

  const processData = async (rawData: any[]) => {
    try {
      setUploadStatus('processing');
      setUploadProgress(80);

      let normalizedData;
      let validationErrors;

      switch (fileType) {
        case 'clients':
          normalizedData = CSVParser.normalizeClientData(rawData);
          dispatch({ type: 'SET_CLIENTS', payload: normalizedData as Client[] });
          validationErrors = await AIService.getInstance().validateData(normalizedData, 'client');
          break;
        case 'workers':
          normalizedData = CSVParser.normalizeWorkerData(rawData);
          dispatch({ type: 'SET_WORKERS', payload: normalizedData as Worker[] });
          validationErrors = await AIService.getInstance().validateData(normalizedData, 'worker');
          break;
        case 'tasks':
          normalizedData = CSVParser.normalizeTaskData(rawData);
          dispatch({ type: 'SET_TASKS', payload: normalizedData as Task[] });
          validationErrors = await AIService.getInstance().validateData(normalizedData, 'task');
          break;
      }

      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: validationErrors });
      setUploadProgress(100);
      setUploadStatus('complete');
    } catch (error) {
      console.error('Processing error:', error);
      setErrors(['Failed to process data']);
      setUploadStatus('error');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'complete':
        return (
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
        );
      case 'error':
        return (
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        );
      case 'uploading':
      case 'processing':
        return (
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center">
            <Brain className="h-10 w-10 text-indigo-600 animate-pulse" />
          </div>
        );
      default:
        return (
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${getColor()}15` }}
          >
            <ArrowUp className="h-10 w-10" style={{ color: getColor() }} />
          </div>
        );
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading file...';
      case 'processing':
        return 'AI processing data...';
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed';
      default:
        return 'Select a CSV file to upload';
    }
  };

  const getSubText = () => {
    switch (uploadStatus) {
      case 'idle':
        return 'or drag and drop it here';
      case 'complete':
        return `Successfully processed ${fileName}`;
      case 'error':
        return 'Please try again with a valid CSV file';
      default:
        return fileName;
    }
  };

  return (
    <Card className="card-modern">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${getColor()}15` }}
          >
            <FileText className="h-6 w-6" style={{ color: getColor() }} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-heading-3 text-gray-900">{title}</CardTitle>
            <CardDescription className="text-body">{description}</CardDescription>
          </div>
          {uploadStatus === 'complete' && (
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer smooth-transition",
            isDragActive && "border-indigo-400 bg-indigo-50",
            uploadStatus === 'complete' && "border-emerald-300 bg-emerald-50",
            uploadStatus === 'error' && "border-red-300 bg-red-50",
            uploadStatus === 'idle' && "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-6">
            {getStatusIcon()}
            <div>
              <p className="text-xl font-semibold text-gray-900 mb-2">{getStatusText()}</p>
              <p className="text-body">{getSubText()}</p>
            </div>
            {uploadStatus === 'idle' && (
              <Button 
                className="btn-primary"
                style={{ backgroundColor: getColor() }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
          <div className="space-y-4">
            <Progress value={uploadProgress} className="w-full h-3 rounded-full" />
            <div className="flex justify-between items-center">
              <span className="text-body">
                {uploadProgress < 40 ? 'Parsing CSV file...' :
                 uploadProgress < 60 ? 'Validating data structure...' :
                 uploadProgress < 80 ? 'AI header mapping...' :
                 'Processing and normalizing data...'}
              </span>
              <span className="font-bold text-gray-900">{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50 rounded-2xl">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-800">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {uploadStatus === 'complete' && (
          <Alert className="border-emerald-200 bg-emerald-50 rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              File uploaded successfully! Data is now available in the dashboard.
            </AlertDescription>
          </Alert>
        )}

        {/* Expected Headers */}
        <div className="bg-surface-secondary rounded-2xl p-6">
          <p className="font-semibold text-gray-700 mb-4">Expected Headers:</p>
          <div className="flex flex-wrap gap-2">
            {expectedHeaders.map((header) => (
              <Badge 
                key={header} 
                className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium"
              >
                {header}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}