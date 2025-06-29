import Papa from 'papaparse';
import { Client, Worker, Task, ValidationError } from '@/types/models';

export class CSVParser {
  static parseCSV<T>(file: File): Promise<{ data: T[], errors: string[] }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transform: (value: string) => value.trim(),
        complete: (results) => {
          resolve({
            data: results.data as T[],
            errors: results.errors.map(err => err.message)
          });
        },
        error: (error) => {
          resolve({
            data: [],
            errors: [error.message]
          });
        }
      });
    });
  }

  static normalizeClientData(rawData: any[]): Client[] {
    return rawData.map(row => ({
      id: row.id || row.clientId || row.client_id || '',
      name: row.name || row.clientName || row.client_name || '',
      priority: parseInt(row.priority) || 1,
      budget: row.budget ? parseFloat(row.budget) : undefined,
      requirements: row.requirements ? 
        (typeof row.requirements === 'string' ? 
          JSON.parse(row.requirements.replace(/'/g, '"')) : 
          row.requirements) : [],
      contactInfo: row.contactInfo || row.contact || '',
      phases: row.phases ? 
        (typeof row.phases === 'string' ? 
          row.phases.split('-').map(p => parseInt(p.trim())) : 
          row.phases) : []
    }));
  }

  static normalizeWorkerData(rawData: any[]): Worker[] {
    return rawData.map(row => ({
      id: row.id || row.workerId || row.worker_id || '',
      name: row.name || row.workerName || row.worker_name || '',
      skills: row.skills ? 
        (typeof row.skills === 'string' ? 
          row.skills.split(',').map(s => s.trim()) : 
          row.skills) : [],
      capacity: parseFloat(row.capacity) || 40,
      hourlyRate: row.hourlyRate ? parseFloat(row.hourlyRate) : undefined,
      availability: row.availability ? 
        (typeof row.availability === 'string' ? 
          row.availability.split(',').map(a => a.trim()) : 
          row.availability) : [],
      maxLoad: row.maxLoad ? parseFloat(row.maxLoad) : undefined,
      phases: row.phases ? 
        (typeof row.phases === 'string' ? 
          row.phases.split('-').map(p => parseInt(p.trim())) : 
          row.phases) : []
    }));
  }

  static normalizeTaskData(rawData: any[]): Task[] {
    return rawData.map(row => ({
      id: row.id || row.taskId || row.task_id || '',
      name: row.name || row.taskName || row.task_name || '',
      clientId: row.clientId || row.client_id || '',
      duration: parseFloat(row.duration) || 1,
      requiredSkills: row.requiredSkills ? 
        (typeof row.requiredSkills === 'string' ? 
          row.requiredSkills.split(',').map(s => s.trim()) : 
          row.requiredSkills) : [],
      priority: parseInt(row.priority) || 1,
      phases: row.phases ? 
        (typeof row.phases === 'string' ? 
          row.phases.split(',').map(p => parseInt(p.trim())) : 
          row.phases) : [],
      deadline: row.deadline || undefined,
      dependencies: row.dependencies ? 
        (typeof row.dependencies === 'string' ? 
          row.dependencies.split(',').map(d => d.trim()) : 
          row.dependencies) : [],
      estimatedEffort: row.estimatedEffort ? parseFloat(row.estimatedEffort) : undefined
    }));
  }

  static exportToCSV(data: any[], filename: string): void {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}