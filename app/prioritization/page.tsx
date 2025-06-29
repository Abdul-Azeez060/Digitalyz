'use client';

import { AdvancedPrioritization } from '@/components/prioritization/advanced-prioritization';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ArrowRight } from 'lucide-react';
import { useData } from '@/contexts/data-context';

export default function PrioritizationPage() {
  const { state } = useData();
  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0;

  if (!hasData) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Prioritization & Weights</h1>
            <p className="page-subtitle">
              Configure advanced priority weights using multiple methodologies
            </p>
          </div>
        </div>

        <Card className="card-modern">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Data Available</h3>
            <p className="text-body mb-6">
              Upload your data files first to configure prioritization weights
            </p>
            <Button onClick={() => window.location.href = '/upload'} className="btn-primary">
              Upload Data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-content">
      <AdvancedPrioritization />
    </div>
  );
}