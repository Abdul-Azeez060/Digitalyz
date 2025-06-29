'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedAIService } from '@/lib/enhanced-ai-service';
import { useData } from '@/contexts/data-context';
import { Brain, Wand2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface NaturalLanguageCorrectorProps {
  dataType: 'clients' | 'workers' | 'tasks';
  data: any[];
}

export function NaturalLanguageCorrector({ dataType, data }: NaturalLanguageCorrectorProps) {
  const { dispatch } = useData();
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previewChanges, setPreviewChanges] = useState<any[]>([]);

  const suggestions = [
    'Change all duration < 2 to 2',
    'Set all priority to 3',
    'Remove duplicates',
    'Change all capacity > 50 to 40',
    'Set all phases to 1,2,3'
  ];

  const handleProcessCommand = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    try {
      const aiService = EnhancedAIService.getInstance();
      const result = await aiService.processNaturalLanguageCorrection(command, data, dataType);
      setResult(result);
      setPreviewChanges(result.changes || []);
    } catch (error) {
      setResult({
        success: false,
        changes: [],
        message: 'Error processing command'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyChanges = () => {
    if (!result?.success || previewChanges.length === 0) return;

    previewChanges.forEach(change => {
      const updateAction = {
        type: `UPDATE_${dataType.slice(0, -1).toUpperCase()}` as any,
        payload: { 
          id: change.id, 
          updates: { [change.field]: change.newValue } 
        }
      };
      dispatch(updateAction);
    });

    setResult(null);
    setPreviewChanges([]);
    setCommand('');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>Natural Language Data Correction</span>
        </CardTitle>
        <CardDescription>
          Use plain English to make bulk changes to your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="e.g., 'Change all duration < 2 to 2' or 'Set all priority to 3'"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleProcessCommand()}
            className="flex-1"
          />
          <Button 
            onClick={handleProcessCommand}
            disabled={isProcessing || !command.trim()}
          >
            {isProcessing ? (
              <Brain className="h-4 w-4 animate-pulse" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Process
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setCommand(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {result && (
          <div className="space-y-3">
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>

            {result.success && previewChanges.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Preview Changes ({previewChanges.length})</h4>
                  <Button onClick={handleApplyChanges} size="sm">
                    Apply Changes
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {previewChanges.slice(0, 10).map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="text-sm">
                        <span className="font-medium">{change.id}</span>
                        <span className="text-muted-foreground"> • {change.field}: </span>
                        <span className="line-through text-red-600">{change.oldValue}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-green-600 font-medium">{change.newValue}</span>
                      </div>
                    </div>
                  ))}
                  {previewChanges.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... and {previewChanges.length - 10} more changes
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}