// Comprehensive validation service for all data types
import { ValidationError } from '@/types/models';

export class ValidationService {
  private static instance: ValidationService;

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  validateClients(clients: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();

    clients.forEach((client, index) => {
      // Missing required columns
      if (!client.id || client.id === '') {
        errors.push({
          id: `client-${index}-missing-id`,
          type: 'error',
          field: 'id',
          message: 'Missing required column: ClientID',
          row: index,
          column: 'id',
          suggestedFix: `client-${Date.now()}-${index}`,
          autoFixable: true
        });
      }

      if (!client.name || client.name === '') {
        errors.push({
          id: `client-${index}-missing-name`,
          type: 'error',
          field: 'name',
          message: 'Missing required column: Name',
          row: index,
          column: 'name',
          autoFixable: false
        });
      }

      // Duplicate IDs
      if (client.id && seenIds.has(client.id)) {
        errors.push({
          id: `client-${index}-duplicate-id`,
          type: 'error',
          field: 'id',
          message: `Duplicate ClientID: ${client.id}`,
          row: index,
          column: 'id',
          suggestedFix: `${client.id}-${index}`,
          autoFixable: true
        });
      } else if (client.id) {
        seenIds.add(client.id);
      }

      // Out-of-range values
      if (client.priority && (client.priority < 1 || client.priority > 5)) {
        errors.push({
          id: `client-${index}-priority-range`,
          type: 'warning',
          field: 'priority',
          message: 'PriorityLevel not in range 1-5',
          row: index,
          column: 'priority',
          suggestedFix: Math.max(1, Math.min(5, client.priority)).toString(),
          autoFixable: true
        });
      }

      // Malformed JSON in attributes
      if (client.requirements && typeof client.requirements === 'string') {
        try {
          JSON.parse(client.requirements);
        } catch (e) {
          errors.push({
            id: `client-${index}-malformed-json`,
            type: 'error',
            field: 'requirements',
            message: 'Broken JSON in AttributesJSON',
            row: index,
            column: 'requirements',
            suggestedFix: '[]',
            autoFixable: true
          });
        }
      }
    });

    return errors;
  }

  validateWorkers(workers: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();

    workers.forEach((worker, index) => {
      // Missing required columns
      if (!worker.id || worker.id === '') {
        errors.push({
          id: `worker-${index}-missing-id`,
          type: 'error',
          field: 'id',
          message: 'Missing required column: WorkerID',
          row: index,
          column: 'id',
          suggestedFix: `worker-${Date.now()}-${index}`,
          autoFixable: true
        });
      }

      if (!worker.name || worker.name === '') {
        errors.push({
          id: `worker-${index}-missing-name`,
          type: 'error',
          field: 'name',
          message: 'Missing required column: Name',
          row: index,
          column: 'name',
          autoFixable: false
        });
      }

      // Duplicate IDs
      if (worker.id && seenIds.has(worker.id)) {
        errors.push({
          id: `worker-${index}-duplicate-id`,
          type: 'error',
          field: 'id',
          message: `Duplicate WorkerID: ${worker.id}`,
          row: index,
          column: 'id',
          suggestedFix: `${worker.id}-${index}`,
          autoFixable: true
        });
      } else if (worker.id) {
        seenIds.add(worker.id);
      }

      // Malformed lists
      if (worker.availability && typeof worker.availability === 'string') {
        const slots = worker.availability.split(',');
        const invalidSlots = slots.filter(slot => isNaN(parseInt(slot.trim())));
        if (invalidSlots.length > 0) {
          errors.push({
            id: `worker-${index}-malformed-slots`,
            type: 'warning',
            field: 'availability',
            message: 'Non-numeric values in AvailableSlots',
            row: index,
            column: 'availability',
            suggestedFix: slots.filter(slot => !isNaN(parseInt(slot.trim()))).join(','),
            autoFixable: true
          });
        }
      }

      // Overloaded workers
      if (worker.availability && worker.maxLoad) {
        const availableSlots = Array.isArray(worker.availability) 
          ? worker.availability.length 
          : worker.availability.split(',').length;
        
        if (availableSlots < worker.maxLoad) {
          errors.push({
            id: `worker-${index}-overloaded`,
            type: 'warning',
            field: 'maxLoad',
            message: 'AvailableSlots.length < MaxLoadPerPhase',
            row: index,
            column: 'maxLoad',
            suggestedFix: availableSlots.toString(),
            autoFixable: true
          });
        }
      }
    });

    return errors;
  }

  validateTasks(tasks: any[], clients: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const clientIds = new Set(clients.map(c => c.id));

    tasks.forEach((task, index) => {
      // Missing required columns
      if (!task.id || task.id === '') {
        errors.push({
          id: `task-${index}-missing-id`,
          type: 'error',
          field: 'id',
          message: 'Missing required column: TaskID',
          row: index,
          column: 'id',
          suggestedFix: `task-${Date.now()}-${index}`,
          autoFixable: true
        });
      }

      if (!task.name || task.name === '') {
        errors.push({
          id: `task-${index}-missing-name`,
          type: 'error',
          field: 'name',
          message: 'Missing required column: Name',
          row: index,
          column: 'name',
          autoFixable: false
        });
      }

      // Duplicate IDs
      if (task.id && seenIds.has(task.id)) {
        errors.push({
          id: `task-${index}-duplicate-id`,
          type: 'error',
          field: 'id',
          message: `Duplicate TaskID: ${task.id}`,
          row: index,
          column: 'id',
          suggestedFix: `${task.id}-${index}`,
          autoFixable: true
        });
      } else if (task.id) {
        seenIds.add(task.id);
      }

      // Unknown references
      if (task.clientId && !clientIds.has(task.clientId)) {
        errors.push({
          id: `task-${index}-unknown-client`,
          type: 'error',
          field: 'clientId',
          message: `Unknown reference: ClientID ${task.clientId} not found`,
          row: index,
          column: 'clientId',
          autoFixable: false
        });
      }

      // Out-of-range values
      if (task.duration && task.duration < 1) {
        errors.push({
          id: `task-${index}-duration-range`,
          type: 'warning',
          field: 'duration',
          message: 'Duration < 1',
          row: index,
          column: 'duration',
          suggestedFix: '1',
          autoFixable: true
        });
      }

      if (task.priority && (task.priority < 1 || task.priority > 5)) {
        errors.push({
          id: `task-${index}-priority-range`,
          type: 'warning',
          field: 'priority',
          message: 'PriorityLevel not in range 1-5',
          row: index,
          column: 'priority',
          suggestedFix: Math.max(1, Math.min(5, task.priority)).toString(),
          autoFixable: true
        });
      }

      // Check for circular dependencies
      if (task.dependencies && Array.isArray(task.dependencies)) {
        const hasCircular = this.detectCircularDependencies(task.id, task.dependencies, tasks);
        if (hasCircular) {
          errors.push({
            id: `task-${index}-circular-deps`,
            type: 'error',
            field: 'dependencies',
            message: 'Circular dependency detected',
            row: index,
            column: 'dependencies',
            autoFixable: false
          });
        }
      }
    });

    return errors;
  }

  private detectCircularDependencies(taskId: string, dependencies: string[], allTasks: any[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (currentId: string): boolean => {
      if (recursionStack.has(currentId)) return true;
      if (visited.has(currentId)) return false;

      visited.add(currentId);
      recursionStack.add(currentId);

      const task = allTasks.find(t => t.id === currentId);
      if (task && task.dependencies) {
        for (const dep of task.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    return hasCycle(taskId);
  }

  validateRuleConflicts(rules: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for conflicting rules vs phase-window constraints
    const phaseWindowRules = rules.filter(r => r.type === 'phaseWindow');
    const exclusionRules = rules.filter(r => r.type === 'exclusion');

    phaseWindowRules.forEach((phaseRule, index) => {
      exclusionRules.forEach(exclusionRule => {
        const conflictingTasks = phaseRule.tasks?.filter((taskId: string) => 
          exclusionRule.tasks?.includes(taskId)
        );

        if (conflictingTasks && conflictingTasks.length > 0) {
          errors.push({
            id: `rule-conflict-${index}`,
            type: 'warning',
            field: 'rules',
            message: `Conflicting rules: phase-window vs exclusion for tasks ${conflictingTasks.join(', ')}`,
            autoFixable: false
          });
        }
      });
    });

    return errors;
  }

  validateCoRunGroups(rules: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const coRunRules = rules.filter(r => r.type === 'coRun');

    // Check for circular co-run groups
    coRunRules.forEach((rule, index) => {
      if (rule.tasks && rule.tasks.length > 1) {
        const hasCircular = this.detectCircularCoRun(rule.tasks, coRunRules);
        if (hasCircular) {
          errors.push({
            id: `corun-circular-${index}`,
            type: 'error',
            field: 'rules',
            message: `Circular co-run group detected: ${rule.tasks.join('→')}`,
            autoFixable: false
          });
        }
      }
    });

    return errors;
  }

  private detectCircularCoRun(tasks: string[], coRunRules: any[]): boolean {
    // Build adjacency list
    const graph = new Map<string, string[]>();
    
    coRunRules.forEach(rule => {
      if (rule.tasks) {
        rule.tasks.forEach((task: string) => {
          if (!graph.has(task)) graph.set(task, []);
          rule.tasks.forEach((otherTask: string) => {
            if (task !== otherTask) {
              graph.get(task)!.push(otherTask);
            }
          });
        });
      }
    });

    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    for (const task of tasks) {
      if (hasCycle(task)) return true;
    }

    return false;
  }
}