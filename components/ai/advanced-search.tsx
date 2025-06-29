'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataGrid } from '@/components/data/data-grid';
import { AdvancedAIService } from '@/lib/advanced-ai-service';
import { Search, Brain, Sparkles, Zap, Clock, Target } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface AdvancedSearchProps {
  data: any[];
  dataType: 'clients' | 'workers' | 'tasks';
  columns: ColumnDef<any>[];
}

export function AdvancedSearch({ data, dataType, columns }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const advancedSuggestions = [
    `All ${dataType} with duration > 5 hours and phase 2 in preferred phases`,
    `High priority ${dataType} with budget over $50000`,
    `${dataType} requiring Python or JavaScript skills`,
    `${dataType} in phases 1-3 with capacity > 30`,
    `Overloaded ${dataType} with more than 8 hours per phase`,
    `${dataType} with missing required skills`,
    `Critical ${dataType} with deadline this week`
  ];

  const handleAdvancedSearch = async () => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const aiService = AdvancedAIService.getInstance();
      const results = await aiService.processAdvancedNaturalLanguageQuery(query, data, dataType);
      
      setSearchResults(results);
      setSearchTime(Date.now() - startTime);
      
      // Add to history if not already present
      if (!queryHistory.includes(query)) {
        setQueryHistory(prev => [query, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Advanced search error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Search Interface */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Advanced AI Search</span>
            <Badge className="badge-modern badge-info">
              <Sparkles className="h-3 w-3 mr-1" />
              Natural Language
            </Badge>
          </CardTitle>
          <CardDescription>
            Use complex natural language queries to find exactly what you need
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={`e.g., "All ${dataType} with duration > 5 hours and having phase 2 in their preferred phases"`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdvancedSearch()}
                className="pl-12 h-12 text-base rounded-2xl border-gray-200 focus:border-purple-500"
              />
            </div>
            <Button 
              onClick={handleAdvancedSearch} 
              disabled={isProcessing || !query.trim()}
              className="btn-primary h-12 px-6"
            >
              {isProcessing ? (
                <Brain className="h-5 w-5 animate-pulse" />
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Stats */}
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{searchResults.length} results found</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{searchTime}ms</span>
              </div>
            </div>
          )}

          {/* Advanced Suggestions */}
          <div className="space-y-3">
            <p className="font-medium text-gray-700">Advanced query examples:</p>
            <div className="flex flex-wrap gap-2">
              {advancedSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm btn-outline"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-gray-700">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {queryHistory.map((historyQuery, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHistoryClick(historyQuery)}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    {historyQuery.length > 50 ? `${historyQuery.substring(0, 50)}...` : historyQuery}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-green-600" />
              <span>Search Results</span>
              <Badge className="badge-modern badge-success">
                {searchResults.length} matches
              </Badge>
            </CardTitle>
            <CardDescription>
              Results for: "{query}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={searchResults}
              columns={columns}
              title={`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Results`}
              searchPlaceholder={`Filter results...`}
            />
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {query && searchResults.length === 0 && !isProcessing && (
        <Alert className="border-yellow-200 bg-yellow-50 rounded-2xl">
          <Brain className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            No {dataType} found matching your advanced query. Try rephrasing or using different criteria.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}