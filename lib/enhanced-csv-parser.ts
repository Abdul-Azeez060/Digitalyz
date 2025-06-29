// Enhanced CSV parser with support for new data schema
import Papa from 'papaparse';
import { Client, Worker, Task } from '@/types/models';

export class EnhancedCSVParser {
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
      id: row.id || row.clientId || row.client_id || row.ClientID || '',
      name: row.name || row.clientName || row.client_name || row.ClientName || '',
      priority: parseInt(row.priority || row.priorityLevel || row.PriorityLevel) || 1,
      budget: row.budget ? parseFloat(row.budget) : undefined,
      requirements: row.requirements ? 
        (typeof row.requirements === 'string' ? 
          JSON.parse(row.requirements.replace(/'/g, '"')) : 
          row.requirements) : [],
      contactInfo: row.contactInfo || row.contact || '',
      phases: this.parsePhases(row.phases),
      // New fields
      requestedTaskIds: this.parseCommaSeparated(row.requestedTaskIds || row.RequestedTaskIDs || ''),
      groupTag: row.groupTag || row.GroupTag || undefined,
      attributesJSON: this.parseJSON(row.attributesJSON || row.AttributesJSON || '{}')
    }));
  }

  static normalizeWorkerData(rawData: any[]): Worker[] {
    return rawData.map(row => ({
      id: row.id || row.workerId || row.worker_id || row.WorkerID || '',
      name: row.name || row.workerName || row.worker_name || row.WorkerName || '',
      skills: this.parseCommaSeparated(row.skills || row.Skills || ''),
      capacity: parseFloat(row.capacity) || 40,
      hourlyRate: row.hourlyRate ? parseFloat(row.hourlyRate) : undefined,
      availability: this.parseCommaSeparated(row.availability || ''),
      maxLoad: row.maxLoad ? parseFloat(row.maxLoad) : undefined,
      phases: this.parsePhases(row.phases),
      // New fields
      availableSlots: this.parseNumberArray(row.availableSlots || row.AvailableSlots || ''),
      maxLoadPerPhase: parseInt(row.maxLoadPerPhase || row.MaxLoadPerPhase) || 1,
      workerGroup: row.workerGroup || row.WorkerGroup || undefined,
      qualificationLevel: row.qualificationLevel ? parseInt(row.qualificationLevel) : undefined
    }));
  }

  static normalizeTaskData(rawData: any[]): Task[] {
    return rawData.map(row => ({
      id: row.id || row.taskId || row.task_id || row.TaskID || '',
      name: row.name || row.taskName || row.task_name || row.TaskName || '',
      clientId: row.clientId || row.client_id || row.ClientID || '',
      duration: parseFloat(row.duration || row.Duration) || 1,
      requiredSkills: this.parseCommaSeparated(row.requiredSkills || row.RequiredSkills || ''),
      priority: parseInt(row.priority) || 1,
      phases: this.parsePhases(row.phases),
      deadline: row.deadline || undefined,
      dependencies: this.parseCommaSeparated(row.dependencies || ''),
      estimatedEffort: row.estimatedEffort ? parseFloat(row.estimatedEffort) : undefined,
      // New fields
      category: row.category || row.Category || undefined,
      preferredPhases: this.parsePhaseRange(row.preferredPhases || row.PreferredPhases || ''),
      maxConcurrent: parseInt(row.maxConcurrent || row.MaxConcurrent) || 1
    }));
  }

  private static parseCommaSeparated(value: string): string[] {
    if (!value || value === '') return [];
    return value.split(',').map(s => s.trim()).filter(s => s !== '');
  }

  private static parseNumberArray(value: string): number[] {
    if (!value || value === '') return [];
    
    // Handle array format [1,2,3] or comma-separated 1,2,3
    const cleanValue = value.replace(/[\[\]]/g, '');
    return cleanValue.split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));
  }

  private static parsePhases(value: any): number[] {
    if (!value) return [];
    
    if (typeof value === 'string') {
      // Handle range format "1-3" or comma-separated "1,2,3"
      if (value.includes('-')) {
        const [start, end] = value.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
      }
      return this.parseNumberArray(value);
    }
    
    if (Array.isArray(value)) {
      return value.map(v => parseInt(v)).filter(n => !isNaN(n));
    }
    
    return [];
  }

  private static parsePhaseRange(value: string): number[] {
    if (!value || value === '') return [];
    
    // Handle different formats: "1-3", "[2,4,5]", "1,2,3"
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(s => parseInt(s.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
    }
    
    return this.parseNumberArray(value);
  }

  private static parseJSON(value: string): Record<string, any> {
    if (!value || value === '') return {};
    
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse JSON:', value);
      return {};
    }
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

  static generateSampleData(): { clients: Client[], workers: Worker[], tasks: Task[] } {
    const clients: Client[] = [
      {
        id: 'client-001',
        name: 'Acme Corporation',
        priority: 5,
        budget: 1500000,
        requestedTaskIds: ['task-001', 'task-002', 'task-003'],
        groupTag: 'enterprise',
        attributesJSON: { industry: 'technology', size: 'large', urgency: 'high' },
        phases: [1, 2, 3]
      },
      {
        id: 'client-002',
        name: 'StartupXYZ',
        priority: 3,
        budget: 500000,
        requestedTaskIds: ['task-004', 'task-005'],
        groupTag: 'startup',
        attributesJSON: { industry: 'fintech', size: 'small', urgency: 'medium' },
        phases: [1, 2]
      },
      {
        id: 'client-003',
        name: 'Global Industries',
        priority: 4,
        budget: 2000000,
        requestedTaskIds: ['task-006', 'task-007', 'task-008'],
        groupTag: 'enterprise',
        attributesJSON: { industry: 'manufacturing', size: 'large', urgency: 'high' },
        phases: [2, 3, 4]
      }
    ];

    const workers: Worker[] = [
      {
        id: 'worker-001',
        name: 'Alice Johnson',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        capacity: 40,
        hourlyRate: 8500,
        availableSlots: [1, 2, 3, 4, 5],
        maxLoadPerPhase: 8,
        workerGroup: 'frontend',
        qualificationLevel: 5,
        phases: [1, 2, 3]
      },
      {
        id: 'worker-002',
        name: 'Bob Smith',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        capacity: 35,
        hourlyRate: 7500,
        availableSlots: [1, 2, 3, 4],
        maxLoadPerPhase: 7,
        workerGroup: 'backend',
        qualificationLevel: 4,
        phases: [2, 3, 4]
      },
      {
        id: 'worker-003',
        name: 'Carol Davis',
        skills: ['UI/UX', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
        capacity: 30,
        hourlyRate: 7000,
        availableSlots: [1, 2, 3],
        maxLoadPerPhase: 6,
        workerGroup: 'design',
        qualificationLevel: 5,
        phases: [1, 2]
      },
      {
        id: 'worker-004',
        name: 'David Wilson',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
        capacity: 40,
        hourlyRate: 9000,
        availableSlots: [2, 3, 4, 5],
        maxLoadPerPhase: 8,
        workerGroup: 'backend',
        qualificationLevel: 5,
        phases: [2, 3, 4]
      }
    ];

    const tasks: Task[] = [
      {
        id: 'task-001',
        name: 'Frontend Development',
        clientId: 'client-001',
        duration: 3,
        requiredSkills: ['React', 'TypeScript'],
        priority: 5,
        phases: [1, 2],
        category: 'development',
        preferredPhases: [1, 2],
        maxConcurrent: 2,
        dependencies: []
      },
      {
        id: 'task-002',
        name: 'Backend API Development',
        clientId: 'client-001',
        duration: 4,
        requiredSkills: ['Node.js', 'PostgreSQL'],
        priority: 5,
        phases: [2, 3],
        category: 'development',
        preferredPhases: [2, 3],
        maxConcurrent: 1,
        dependencies: ['task-001']
      },
      {
        id: 'task-003',
        name: 'UI/UX Design',
        clientId: 'client-001',
        duration: 2,
        requiredSkills: ['UI/UX', 'Figma'],
        priority: 4,
        phases: [1],
        category: 'design',
        preferredPhases: [1],
        maxConcurrent: 1,
        dependencies: []
      },
      {
        id: 'task-004',
        name: 'Mobile App Development',
        clientId: 'client-002',
        duration: 5,
        requiredSkills: ['React', 'React Native'],
        priority: 3,
        phases: [1, 2, 3],
        category: 'development',
        preferredPhases: [1, 2, 3],
        maxConcurrent: 2,
        dependencies: []
      },
      {
        id: 'task-005',
        name: 'Database Design',
        clientId: 'client-002',
        duration: 2,
        requiredSkills: ['PostgreSQL', 'Database Design'],
        priority: 3,
        phases: [1],
        category: 'architecture',
        preferredPhases: [1],
        maxConcurrent: 1,
        dependencies: []
      },
      {
        id: 'task-006',
        name: 'Microservices Architecture',
        clientId: 'client-003',
        duration: 6,
        requiredSkills: ['Java', 'Spring Boot', 'Microservices'],
        priority: 4,
        phases: [2, 3, 4],
        category: 'architecture',
        preferredPhases: [2, 3, 4],
        maxConcurrent: 1,
        dependencies: []
      },
      {
        id: 'task-007',
        name: 'DevOps Setup',
        clientId: 'client-003',
        duration: 3,
        requiredSkills: ['Docker', 'Kubernetes', 'AWS'],
        priority: 4,
        phases: [3, 4],
        category: 'infrastructure',
        preferredPhases: [3, 4],
        maxConcurrent: 1,
        dependencies: ['task-006']
      },
      {
        id: 'task-008',
        name: 'Quality Assurance',
        clientId: 'client-003',
        duration: 2,
        requiredSkills: ['Testing', 'Automation'],
        priority: 3,
        phases: [4],
        category: 'testing',
        preferredPhases: [4],
        maxConcurrent: 2,
        dependencies: ['task-006', 'task-007']
      }
    ];

    return { clients, workers, tasks };
  }
}