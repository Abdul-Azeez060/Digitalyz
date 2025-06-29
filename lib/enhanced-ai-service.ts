// Enhanced AI service with advanced features using Gemini
import { Rule, ValidationError, Client, Worker, Task } from '@/types/models';
import { GeminiService } from './gemini-service';

export class EnhancedAIService {
  private static instance: EnhancedAIService;
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  static getInstance(): EnhancedAIService {
    if (!EnhancedAIService.instance) {
      EnhancedAIService.instance = new EnhancedAIService();
    }
    return EnhancedAIService.instance;
  }

  async validateDataWithInterlinks(
    clients: Client[], 
    workers: Worker[], 
    tasks: Task[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    
    // Check for duplicate IDs across all data
    const allIds = [
      ...clients.map(c => ({ id: c.id, type: 'client' })),
      ...workers.map(w => ({ id: w.id, type: 'worker' })),
      ...tasks.map(t => ({ id: t.id, type: 'task' }))
    ];
    
    const idCounts = allIds.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(idCounts).forEach(([id, count]) => {
      if (count > 1) {
        errors.push({
          id: `duplicate-id-${id}`,
          type: 'error',
          field: 'id',
          message: `Duplicate ID "${id}" found across multiple records`,
          suggestedFix: `${id}-${Date.now()}`,
          autoFixable: true
        });
      }
    });

    // Validate task-client relationships
    tasks.forEach((task, index) => {
      const clientExists = clients.some(c => c.id === task.clientId);
      if (!clientExists) {
        errors.push({
          id: `task-client-${task.id}`,
          type: 'error',
          field: 'clientId',
          message: `Task "${task.name}" references non-existent client "${task.clientId}"`,
          row: index,
          column: 'clientId',
          autoFixable: false
        });
      }
    });

    // Validate skill requirements vs available skills
    const allAvailableSkills = new Set(workers.flatMap(w => w.skills));
    tasks.forEach((task, index) => {
      const missingSkills = task.requiredSkills.filter(skill => !allAvailableSkills.has(skill));
      if (missingSkills.length > 0) {
        errors.push({
          id: `task-skills-${task.id}`,
          type: 'warning',
          field: 'requiredSkills',
          message: `Task "${task.name}" requires skills not available in worker pool: ${missingSkills.join(', ')}`,
          row: index,
          column: 'requiredSkills',
          autoFixable: false
        });
      }
    });

    return errors;
  }

  async processNaturalLanguageCorrection(
    command: string, 
    data: any[], 
    dataType: 'clients' | 'workers' | 'tasks'
  ): Promise<{ success: boolean; changes: any[]; message: string }> {
    try {
      // Try Gemini first
      const geminiResult = await this.geminiService.processNaturalLanguageCorrection(command, data, dataType);
      if (geminiResult.success) {
        return geminiResult;
      }
    } catch (error) {
      console.warn('Gemini correction failed, falling back to local logic:', error);
    }

    // Fallback to local correction logic
    const lowerCommand = command.toLowerCase();
    const changes: any[] = [];
    
    try {
      // Parse "change all X < Y to Z" patterns
      const changePattern = /change all (\w+)\s*([<>=]+)\s*(\d+)\s*to\s*(\d+)/i;
      const match = lowerCommand.match(changePattern);
      
      if (match) {
        const [, field, operator, threshold, newValue] = match;
        const thresholdNum = parseInt(threshold);
        const newValueNum = parseInt(newValue);
        
        data.forEach((item, index) => {
          const currentValue = item[field];
          let shouldChange = false;
          
          switch (operator) {
            case '<':
              shouldChange = currentValue < thresholdNum;
              break;
            case '>':
              shouldChange = currentValue > thresholdNum;
              break;
            case '=':
            case '==':
              shouldChange = currentValue === thresholdNum;
              break;
          }
          
          if (shouldChange) {
            changes.push({
              index,
              field,
              oldValue: currentValue,
              newValue: newValueNum,
              id: item.id
            });
          }
        });
        
        return {
          success: true,
          changes,
          message: `Found ${changes.length} records to update`
        };
      }

      // Parse "set all X to Y" patterns
      const setPattern = /set all (\w+)\s+to\s+(.+)/i;
      const setMatch = lowerCommand.match(setPattern);
      
      if (setMatch) {
        const [, field, value] = setMatch;
        
        data.forEach((item, index) => {
          changes.push({
            index,
            field,
            oldValue: item[field],
            newValue: value,
            id: item.id
          });
        });
        
        return {
          success: true,
          changes,
          message: `Will update ${changes.length} records`
        };
      }

      return {
        success: false,
        changes: [],
        message: 'Could not understand the command. Try patterns like "change all duration < 2 to 2" or "set all priority to 3"'
      };
      
    } catch (error) {
      return {
        success: false,
        changes: [],
        message: 'Error processing command'
      };
    }
  }
}