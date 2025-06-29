// Enhanced AI service that uses Gemini for real AI processing
import { Rule, ValidationError } from '@/types/models';
import { GeminiService } from './gemini-service';

export class AIService {
  private static instance: AIService;
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private getSchemaFields(dataType: string): string[] {
    switch (dataType) {
      case 'client':
        return ['id', 'name', 'priority', 'budget', 'requirements', 'contactInfo', 'phases', 'requestedTaskIds', 'groupTag', 'attributesJSON'];
      case 'worker':
        return ['id', 'name', 'skills', 'capacity', 'hourlyRate', 'availability', 'maxLoad', 'phases', 'availableSlots', 'maxLoadPerPhase', 'workerGroup', 'qualificationLevel'];
      case 'task':
        return ['id', 'name', 'clientId', 'duration', 'requiredSkills', 'priority', 'phases', 'deadline', 'dependencies', 'estimatedEffort', 'category', 'preferredPhases', 'maxConcurrent'];
      default:
        return [];
    }
  }

  async mapHeaders(uploadedHeaders: string[], expectedHeaders: string[]): Promise<Record<string, string>> {
    try {
      // Try Gemini first with schema enforcement
      const prompt = `
Map uploaded CSV headers to expected headers using STRICT SCHEMA:

Uploaded headers: ${uploadedHeaders.join(', ')}
Expected headers (ONLY these are valid): ${expectedHeaders.join(', ')}

IMPORTANT: Only map to headers that exist in the expected list.

Return a JSON object mapping uploaded headers to expected headers:
{
  "uploaded_header": "expected_header_from_list_only"
}

Response (JSON only):`;

      const geminiResult = await this.geminiService.makeRequest(prompt);
      const jsonMatch = geminiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mapping = JSON.parse(jsonMatch[0]);
        // Validate that all mapped values are in expectedHeaders
        const validMapping: Record<string, string> = {};
        Object.entries(mapping).forEach(([key, value]) => {
          if (expectedHeaders.includes(value as string)) {
            validMapping[key] = value as string;
          }
        });
        return validMapping;
      }
    } catch (error) {
      console.warn('Gemini header mapping failed, falling back to local logic:', error);
    }

    // Fallback to local logic with schema validation
    const mapping: Record<string, string> = {};
    
    for (const expected of expectedHeaders) {
      const match = this.findBestMatch(expected, uploadedHeaders);
      if (match) {
        mapping[match] = expected;
      }
    }
    
    return mapping;
  }

  async validateData(data: any[], schema: string): Promise<ValidationError[]> {
    try {
      const schemaFields = this.getSchemaFields(schema);
      const prompt = `
Analyze this ${schema} data and identify validation errors using STRICT SCHEMA:

Valid fields for ${schema}: ${schemaFields.join(', ')}
Data sample: ${JSON.stringify(data.slice(0, 5), null, 2)}

ONLY validate fields that exist in the schema list above.

Look for:
1. Missing required fields (id, name are always required)
2. Invalid data types for schema fields
3. Out-of-range values for schema fields
4. Inconsistent formats in schema fields

Return a JSON array of validation errors:
[
  {
    "id": "unique-error-id",
    "type": "error" | "warning",
    "field": "field-name-from-schema-only",
    "message": "description",
    "row": 0,
    "column": "field-name-from-schema",
    "suggestedFix": "suggested-value",
    "autoFixable": true/false
  }
]

Response (JSON only):`;

      const geminiResult = await this.geminiService.makeRequest(prompt);
      const jsonMatch = geminiResult.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const errors = JSON.parse(jsonMatch[0]);
        // Validate that all field names are in schema
        return errors.filter((error: any) => 
          schemaFields.includes(error.field) || error.field === 'id' || error.field === 'name'
        );
      }
    } catch (error) {
      console.warn('Gemini validation failed, falling back to local logic:', error);
    }

    // Fallback to local validation logic with schema compliance
    const errors: ValidationError[] = [];
    const schemaFields = this.getSchemaFields(schema);
    
    data.forEach((row, index) => {
      if (schema === 'client') {
        if (!row.id || row.id === '') {
          errors.push({
            id: `client-${index}-id`,
            type: 'error',
            field: 'id',
            message: 'Client ID is required',
            row: index,
            column: 'id',
            suggestedFix: `client-${Date.now()}-${index}`,
            autoFixable: true
          });
        }
        if (!row.name || row.name === '') {
          errors.push({
            id: `client-${index}-name`,
            type: 'error',
            field: 'name',
            message: 'Client name is required',
            row: index,
            column: 'name',
            autoFixable: false
          });
        }
        if (row.priority && (row.priority < 1 || row.priority > 5)) {
          errors.push({
            id: `client-${index}-priority`,
            type: 'warning',
            field: 'priority',
            message: 'Priority should be between 1 and 5',
            row: index,
            column: 'priority',
            suggestedFix: Math.max(1, Math.min(5, row.priority)).toString(),
            autoFixable: true
          });
        }
      } else if (schema === 'worker') {
        if (!row.id || row.id === '') {
          errors.push({
            id: `worker-${index}-id`,
            type: 'error',
            field: 'id',
            message: 'Worker ID is required',
            row: index,
            column: 'id',
            suggestedFix: `worker-${Date.now()}-${index}`,
            autoFixable: true
          });
        }
        if (!row.name || row.name === '') {
          errors.push({
            id: `worker-${index}-name`,
            type: 'error',
            field: 'name',
            message: 'Worker name is required',
            row: index,
            column: 'name',
            autoFixable: false
          });
        }
        if (!row.skills || row.skills.length === 0) {
          errors.push({
            id: `worker-${index}-skills`,
            type: 'warning',
            field: 'skills',
            message: 'Worker should have at least one skill',
            row: index,
            column: 'skills',
            autoFixable: false
          });
        }
      } else if (schema === 'task') {
        if (!row.id || row.id === '') {
          errors.push({
            id: `task-${index}-id`,
            type: 'error',
            field: 'id',
            message: 'Task ID is required',
            row: index,
            column: 'id',
            suggestedFix: `task-${Date.now()}-${index}`,
            autoFixable: true
          });
        }
        if (!row.name || row.name === '') {
          errors.push({
            id: `task-${index}-name`,
            type: 'error',
            field: 'name',
            message: 'Task name is required',
            row: index,
            column: 'name',
            autoFixable: false
          });
        }
        if (!row.clientId || row.clientId === '') {
          errors.push({
            id: `task-${index}-clientId`,
            type: 'error',
            field: 'clientId',
            message: 'Task must be assigned to a client',
            row: index,
            column: 'clientId',
            autoFixable: false
          });
        }
        if (!row.duration || row.duration <= 0) {
          errors.push({
            id: `task-${index}-duration`,
            type: 'warning',
            field: 'duration',
            message: 'Task duration should be greater than 0',
            row: index,
            column: 'duration',
            suggestedFix: '1',
            autoFixable: true
          });
        }
      }
    });
    
    return errors;
  }

  async suggestRules(data: { clients: any[], workers: any[], tasks: any[] }): Promise<Rule[]> {
    try {
      const prompt = `
Analyze this resource allocation data and suggest optimization rules using STRICT SCHEMA:

SCHEMA COMPLIANCE:
- Rule types: coRun, sequence, exclusion, slotRestriction, loadLimit, phaseWindow, patternMatch, precedenceOverride
- Client fields: id, name, priority, budget, requestedTaskIds, groupTag, attributesJSON
- Worker fields: id, name, skills, capacity, availableSlots, maxLoadPerPhase, workerGroup, qualificationLevel
- Task fields: id, name, clientId, duration, requiredSkills, priority, category, preferredPhases, maxConcurrent

Data Summary:
- Clients: ${data.clients.length}
- Workers: ${data.workers.length}
- Tasks: ${data.tasks.length}

Sample data:
${JSON.stringify({
  clients: data.clients.slice(0, 2),
  workers: data.workers.slice(0, 2),
  tasks: data.tasks.slice(0, 2)
}, null, 2)}

ONLY suggest rules using existing IDs and schema fields.

Return rule suggestions:
[
  {
    "id": "rule-id",
    "type": "coRun" | "sequence" | "exclusion" | "loadLimit" | "phaseWindow" | "slotRestriction",
    "name": "Rule Name",
    "description": "Why this rule helps",
    "tasks": ["existing-task-ids-only"],
    "workers": ["existing-worker-ids-only"],
    "phases": [phase-numbers-from-data],
    "weight": 0.7,
    "active": false,
    "parameters": {}
  }
]

Response (JSON only):`;

      const geminiResult = await this.geminiService.makeRequest(prompt);
      const jsonMatch = geminiResult.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        // Validate that all referenced IDs exist in data
        return suggestions.filter((rule: any) => {
          const validTasks = rule.tasks?.every((taskId: string) => 
            data.tasks.some(t => t.id === taskId)
          ) ?? true;
          const validWorkers = rule.workers?.every((workerId: string) => 
            data.workers.some(w => w.id === workerId)
          ) ?? true;
          return validTasks && validWorkers;
        });
      }
    } catch (error) {
      console.warn('Gemini rule suggestion failed, falling back to local logic:', error);
    }

    // Fallback to local rule suggestion logic with schema compliance
    const suggestions: Rule[] = [];
    
    // Analyze tasks for potential co-run rules using clientId
    const tasksByClient = data.tasks.reduce((acc, task) => {
      if (!acc[task.clientId]) acc[task.clientId] = [];
      acc[task.clientId].push(task);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(tasksByClient).forEach(([clientId, tasks]) => {
      if (tasks.length > 1) {
        const client = data.clients.find(c => c.id === clientId);
        suggestions.push({
          id: `corun-${clientId}-${Date.now()}`,
          type: 'coRun',
          name: `Co-run tasks for ${client?.name || clientId}`,
          description: `Tasks for client ${client?.name || clientId} should be executed together for efficiency`,
          tasks: tasks.map(t => t.id),
          weight: 0.7,
          active: false
        });
      }
    });

    // Analyze workers for load limit suggestions using capacity and maxLoadPerPhase
    const highCapacityWorkers = data.workers.filter(w => w.capacity > 40 && w.maxLoadPerPhase > 8);
    if (highCapacityWorkers.length > 0) {
      suggestions.push({
        id: `load-limit-${Date.now()}`,
        type: 'loadLimit',
        name: 'High-capacity worker load limits',
        description: 'Prevent overloading high-capacity workers based on maxLoadPerPhase',
        workers: highCapacityWorkers.map(w => w.id),
        weight: 0.6,
        active: false,
        parameters: { maxLoad: 0.8 }
      });
    }

    return suggestions;
  }

  async processNaturalLanguageQuery(query: string, data: any[]): Promise<any[]> {
    try {
      // Determine data type from data structure
      const dataType = data[0]?.clientId ? 'task' : data[0]?.skills ? 'worker' : 'client';
      const schemaFields = this.getSchemaFields(dataType);
      
      const prompt = `
Process this natural language query using STRICT SCHEMA:

Query: "${query}"
Data type: ${dataType}
Valid fields: ${schemaFields.join(', ')}
Data structure: ${JSON.stringify(data[0] || {}, null, 2)}

ONLY use fields that exist in the schema list above.

Return filter logic as JSON:
{
  "filters": [
    {
      "field": "field-name-from-schema-only",
      "operator": ">", "<", "=", "includes", "excludes",
      "value": "filter-value"
    }
  ]
}

Response (JSON only):`;

      const geminiResult = await this.geminiService.makeRequest(prompt);
      const jsonMatch = geminiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const filterConfig = JSON.parse(jsonMatch[0]);
        return this.applyFilters(data, filterConfig.filters || []);
      }
    } catch (error) {
      console.warn('Gemini query processing failed, falling back to local logic:', error);
    }

    // Fallback to local query processing with schema validation
    const lowerQuery = query.toLowerCase();
    let filteredData = [...data];
    
    // Only process queries for fields that exist in the first item
    const availableFields = Object.keys(data[0] || {});
    
    // Duration filters (only if duration field exists)
    if (lowerQuery.includes('duration') && availableFields.includes('duration')) {
      if (lowerQuery.includes('>')) {
        const match = lowerQuery.match(/duration\s*>\s*(\d+)/);
        if (match) {
          const threshold = parseInt(match[1]);
          filteredData = filteredData.filter(item => item.duration && item.duration > threshold);
        }
      }
      
      if (lowerQuery.includes('<')) {
        const match = lowerQuery.match(/duration\s*<\s*(\d+)/);
        if (match) {
          const threshold = parseInt(match[1]);
          filteredData = filteredData.filter(item => item.duration && item.duration < threshold);
        }
      }
    }
    
    // Priority filters (only if priority field exists)
    if (lowerQuery.includes('priority') && availableFields.includes('priority')) {
      if (lowerQuery.includes('high')) {
        filteredData = filteredData.filter(item => item.priority && item.priority >= 4);
      }
      
      if (lowerQuery.includes('low')) {
        filteredData = filteredData.filter(item => item.priority && item.priority <= 2);
      }
    }
    
    // Skills filters (only if skills or requiredSkills fields exist)
    const skillMatch = lowerQuery.match(/skills?\s+(?:with|includes?)\s+(\w+)/i);
    if (skillMatch && (availableFields.includes('skills') || availableFields.includes('requiredSkills'))) {
      const skill = skillMatch[1];
      filteredData = filteredData.filter(item => {
        const itemSkills = item.skills || item.requiredSkills || [];
        return Array.isArray(itemSkills) && itemSkills.some((s: string) => 
          s.toLowerCase().includes(skill.toLowerCase())
        );
      });
    }
    
    return filteredData;
  }

  private applyFilters(data: any[], filters: any[]): any[] {
    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field];
        switch (filter.operator) {
          case '>':
            return Number(value) > Number(filter.value);
          case '<':
            return Number(value) < Number(filter.value);
          case '=':
            return value == filter.value;
          case 'includes':
            return Array.isArray(value) 
              ? value.some(v => v.toString().toLowerCase().includes(filter.value.toLowerCase()))
              : value.toString().toLowerCase().includes(filter.value.toLowerCase());
          case 'excludes':
            return !value.toString().toLowerCase().includes(filter.value.toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  private findBestMatch(target: string, options: string[]): string | null {
    const targetLower = target.toLowerCase();
    
    // Exact match
    const exact = options.find(opt => opt.toLowerCase() === targetLower);
    if (exact) return exact;
    
    // Partial match
    const partial = options.find(opt => 
      opt.toLowerCase().includes(targetLower) || 
      targetLower.includes(opt.toLowerCase())
    );
    if (partial) return partial;
    
    // Similarity matching (simplified)
    let bestMatch = null;
    let bestScore = 0;
    
    for (const option of options) {
      const score = this.calculateSimilarity(targetLower, option.toLowerCase());
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = option;
      }
    }
    
    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[len1][len2];
    return 1 - distance / Math.max(len1, len2);
  }
}