// Enhanced validation service with comprehensive relationship checks
import { ValidationError, Client, Worker, Task, Rule } from '@/types/models';

export class EnhancedValidationService {
  private static instance: EnhancedValidationService;

  static getInstance(): EnhancedValidationService {
    if (!EnhancedValidationService.instance) {
      EnhancedValidationService.instance = new EnhancedValidationService();
    }
    return EnhancedValidationService.instance;
  }

  validateClients(clients: Client[], tasks: Task[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const taskIds = new Set(tasks.map(t => t.id));

    clients.forEach((client, index) => {
      // Basic validations
      if (!client.id || client.id === '') {
        errors.push({
          id: `client-${index}-missing-id`,
          type: 'error',
          field: 'id',
          message: 'Missing required field: ClientID',
          row: index,
          column: 'id',
          suggestedFix: `client-${Date.now()}-${index}`,
          autoFixable: true,
          severity: 'critical'
        });
      }

      if (!client.name || client.name === '') {
        errors.push({
          id: `client-${index}-missing-name`,
          type: 'error',
          field: 'name',
          message: 'Missing required field: ClientName',
          row: index,
          column: 'name',
          autoFixable: false,
          severity: 'critical'
        });
      }

      // Duplicate ID check
      if (client.id && seenIds.has(client.id)) {
        errors.push({
          id: `client-${index}-duplicate-id`,
          type: 'error',
          field: 'id',
          message: `Duplicate ClientID: ${client.id}`,
          row: index,
          column: 'id',
          suggestedFix: `${client.id}-${index}`,
          autoFixable: true,
          severity: 'high'
        });
      } else if (client.id) {
        seenIds.add(client.id);
      }

      // Priority validation
      if (client.priority && (client.priority < 1 || client.priority > 5)) {
        errors.push({
          id: `client-${index}-priority-range`,
          type: 'warning',
          field: 'priority',
          message: 'PriorityLevel not in range 1-5',
          row: index,
          column: 'priority',
          suggestedFix: Math.max(1, Math.min(5, client.priority)).toString(),
          autoFixable: true,
          severity: 'medium'
        });
      }

      // RequestedTaskIDs validation
      if (client.requestedTaskIds && client.requestedTaskIds.length > 0) {
        const invalidTaskIds = client.requestedTaskIds.filter(taskId => !taskIds.has(taskId));
        if (invalidTaskIds.length > 0) {
          errors.push({
            id: `client-${index}-invalid-task-refs`,
            type: 'error',
            field: 'requestedTaskIds',
            message: `Invalid task references: ${invalidTaskIds.join(', ')}`,
            row: index,
            column: 'requestedTaskIds',
            autoFixable: false,
            severity: 'high'
          });
        }
      }

      // AttributesJSON validation
      if (client.attributesJSON && typeof client.attributesJSON === 'string') {
        try {
          JSON.parse(client.attributesJSON as any);
        } catch (e) {
          errors.push({
            id: `client-${index}-malformed-json`,
            type: 'error',
            field: 'attributesJSON',
            message: 'Malformed JSON in AttributesJSON',
            row: index,
            column: 'attributesJSON',
            suggestedFix: '{}',
            autoFixable: true,
            severity: 'medium'
          });
        }
      }
    });

    return errors;
  }

  validateWorkers(workers: Worker[], tasks: Task[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const allRequiredSkills = new Set(tasks.flatMap(t => t.requiredSkills));

    workers.forEach((worker, index) => {
      // Basic validations
      if (!worker.id || worker.id === '') {
        errors.push({
          id: `worker-${index}-missing-id`,
          type: 'error',
          field: 'id',
          message: 'Missing required field: WorkerID',
          row: index,
          column: 'id',
          suggestedFix: `worker-${Date.now()}-${index}`,
          autoFixable: true,
          severity: 'critical'
        });
      }

      if (!worker.name || worker.name === '') {
        errors.push({
          id: `worker-${index}-missing-name`,
          type: 'error',
          field: 'name',
          message: 'Missing required field: WorkerName',
          row: index,
          column: 'name',
          autoFixable: false,
          severity: 'critical'
        });
      }

      // Duplicate ID check
      if (worker.id && seenIds.has(worker.id)) {
        errors.push({
          id: `worker-${index}-duplicate-id`,
          type: 'error',
          field: 'id',
          message: `Duplicate WorkerID: ${worker.id}`,
          row: index,
          column: 'id',
          suggestedFix: `${worker.id}-${index}`,
          autoFixable: true,
          severity: 'high'
        });
      } else if (worker.id) {
        seenIds.add(worker.id);
      }

      // AvailableSlots validation
      if (worker.availableSlots) {
        const invalidSlots = worker.availableSlots.filter(slot => 
          !Number.isInteger(slot) || slot < 1 || slot > 10
        );
        if (invalidSlots.length > 0) {
          errors.push({
            id: `worker-${index}-invalid-slots`,
            type: 'warning',
            field: 'availableSlots',
            message: 'Invalid phase numbers in AvailableSlots',
            row: index,
            column: 'availableSlots',
            suggestedFix: worker.availableSlots.filter(slot => 
              Number.isInteger(slot) && slot >= 1 && slot <= 10
            ).join(','),
            autoFixable: true,
            severity: 'medium'
          });
        }
      }

      // MaxLoadPerPhase validation
      if (worker.maxLoadPerPhase && worker.availableSlots) {
        if (worker.availableSlots.length < worker.maxLoadPerPhase) {
          errors.push({
            id: `worker-${index}-overloaded`,
            type: 'warning',
            field: 'maxLoadPerPhase',
            message: 'AvailableSlots.length < MaxLoadPerPhase',
            row: index,
            column: 'maxLoadPerPhase',
            suggestedFix: worker.availableSlots.length.toString(),
            autoFixable: true,
            severity: 'medium'
          });
        }
      }

      // Skills coverage validation
      if (worker.skills && worker.skills.length > 0) {
        const uncoveredSkills = [...allRequiredSkills].filter(skill => 
          !worker.skills.some(workerSkill => 
            workerSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        
        if (uncoveredSkills.length === allRequiredSkills.size) {
          errors.push({
            id: `worker-${index}-no-skill-coverage`,
            type: 'warning',
            field: 'skills',
            message: 'Worker has no skills matching any required tasks',
            row: index,
            column: 'skills',
            autoFixable: false,
            severity: 'low'
          });
        }
      }
    });

    return errors;
  }

  validateTasks(tasks: Task[], clients: Client[], workers: Worker[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const clientIds = new Set(clients.map(c => c.id));
    const allAvailableSkills = new Set(workers.flatMap(w => w.skills));

    tasks.forEach((task, index) => {
      // Basic validations
      if (!task.id || task.id === '') {
        errors.push({
          id: `task-${index}-missing-id`,
          type: 'error',
          field: 'id',
          message: 'Missing required field: TaskID',
          row: index,
          column: 'id',
          suggestedFix: `task-${Date.now()}-${index}`,
          autoFixable: true,
          severity: 'critical'
        });
      }

      if (!task.name || task.name === '') {
        errors.push({
          id: `task-${index}-missing-name`,
          type: 'error',
          field: 'name',
          message: 'Missing required field: TaskName',
          row: index,
          column: 'name',
          autoFixable: false,
          severity: 'critical'
        });
      }

      // Duplicate ID check
      if (task.id && seenIds.has(task.id)) {
        errors.push({
          id: `task-${index}-duplicate-id`,
          type: 'error',
          field: 'id',
          message: `Duplicate TaskID: ${task.id}`,
          row: index,
          column: 'id',
          suggestedFix: `${task.id}-${index}`,
          autoFixable: true,
          severity: 'high'
        });
      } else if (task.id) {
        seenIds.add(task.id);
      }

      // Client reference validation
      if (task.clientId && !clientIds.has(task.clientId)) {
        errors.push({
          id: `task-${index}-invalid-client`,
          type: 'error',
          field: 'clientId',
          message: `Invalid client reference: ${task.clientId}`,
          row: index,
          column: 'clientId',
          autoFixable: false,
          severity: 'high'
        });
      }

      // Duration validation
      if (task.duration && task.duration < 1) {
        errors.push({
          id: `task-${index}-invalid-duration`,
          type: 'warning',
          field: 'duration',
          message: 'Duration must be >= 1 phase',
          row: index,
          column: 'duration',
          suggestedFix: '1',
          autoFixable: true,
          severity: 'medium'
        });
      }

      // Required skills validation
      if (task.requiredSkills && task.requiredSkills.length > 0) {
        const unavailableSkills = task.requiredSkills.filter(skill => 
          !allAvailableSkills.has(skill)
        );
        if (unavailableSkills.length > 0) {
          errors.push({
            id: `task-${index}-unavailable-skills`,
            type: 'warning',
            field: 'requiredSkills',
            message: `Skills not available in worker pool: ${unavailableSkills.join(', ')}`,
            row: index,
            column: 'requiredSkills',
            autoFixable: false,
            severity: 'medium'
          });
        }
      }

      // PreferredPhases validation
      if (task.preferredPhases) {
        const invalidPhases = task.preferredPhases.filter(phase => 
          !Number.isInteger(phase) || phase < 1 || phase > 10
        );
        if (invalidPhases.length > 0) {
          errors.push({
            id: `task-${index}-invalid-phases`,
            type: 'warning',
            field: 'preferredPhases',
            message: 'Invalid phase numbers in PreferredPhases',
            row: index,
            column: 'preferredPhases',
            suggestedFix: task.preferredPhases.filter(phase => 
              Number.isInteger(phase) && phase >= 1 && phase <= 10
            ).join(','),
            autoFixable: true,
            severity: 'medium'
          });
        }
      }

      // MaxConcurrent validation
      if (task.maxConcurrent && task.maxConcurrent < 1) {
        errors.push({
          id: `task-${index}-invalid-concurrent`,
          type: 'warning',
          field: 'maxConcurrent',
          message: 'MaxConcurrent must be >= 1',
          row: index,
          column: 'maxConcurrent',
          suggestedFix: '1',
          autoFixable: true,
          severity: 'low'
        });
      }

      // Circular dependency check
      if (task.dependencies && task.dependencies.length > 0) {
        const hasCircular = this.detectCircularDependencies(task.id, task.dependencies, tasks);
        if (hasCircular) {
          errors.push({
            id: `task-${index}-circular-deps`,
            type: 'error',
            field: 'dependencies',
            message: 'Circular dependency detected',
            row: index,
            column: 'dependencies',
            autoFixable: false,
            severity: 'high'
          });
        }
      }
    });

    return errors;
  }

  validateGroupRelationships(clients: Client[], workers: Worker[], tasks: Task[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Group tag consistency
    const clientGroups = new Set(clients.map(c => c.groupTag).filter(Boolean));
    const workerGroups = new Set(workers.map(w => w.workerGroup).filter(Boolean));

    // Check for orphaned group references
    clients.forEach((client, index) => {
      if (client.groupTag) {
        const relatedTasks = tasks.filter(t => t.clientId === client.id);
        if (relatedTasks.length === 0) {
          errors.push({
            id: `client-${index}-orphaned-group`,
            type: 'warning',
            field: 'groupTag',
            message: `Client group "${client.groupTag}" has no associated tasks`,
            row: index,
            column: 'groupTag',
            autoFixable: false,
            severity: 'low'
          });
        }
      }
    });

    // Phase-slot saturation checks
    const phaseWorkerMap = new Map<number, Worker[]>();
    workers.forEach(worker => {
      worker.availableSlots?.forEach(phase => {
        if (!phaseWorkerMap.has(phase)) {
          phaseWorkerMap.set(phase, []);
        }
        phaseWorkerMap.get(phase)!.push(worker);
      });
    });

    const phaseTaskMap = new Map<number, Task[]>();
    tasks.forEach(task => {
      task.preferredPhases?.forEach(phase => {
        if (!phaseTaskMap.has(phase)) {
          phaseTaskMap.set(phase, []);
        }
        phaseTaskMap.get(phase)!.push(task);
      });
    });

    // Check for phase overload
    phaseTaskMap.forEach((phaseTasks, phase) => {
      const phaseWorkers = phaseWorkerMap.get(phase) || [];
      const totalCapacity = phaseWorkers.reduce((sum, w) => sum + (w.maxLoadPerPhase || 1), 0);
      const totalDemand = phaseTasks.reduce((sum, t) => sum + t.duration, 0);

      if (totalDemand > totalCapacity) {
        errors.push({
          id: `phase-${phase}-overload`,
          type: 'warning',
          field: 'phases',
          message: `Phase ${phase} overloaded: ${totalDemand}h demand vs ${totalCapacity}h capacity`,
          autoFixable: false,
          severity: 'high'
        });
      }
    });

    return errors;
  }

  validateRuleConflicts(rules: Rule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for conflicting co-run and exclusion rules
    const coRunRules = rules.filter(r => r.type === 'coRun' && r.active);
    const exclusionRules = rules.filter(r => r.type === 'exclusion' && r.active);

    coRunRules.forEach((coRunRule, index) => {
      exclusionRules.forEach(exclusionRule => {
        const conflictingTasks = coRunRule.tasks?.filter(taskId => 
          exclusionRule.tasks?.includes(taskId)
        );

        if (conflictingTasks && conflictingTasks.length > 1) {
          errors.push({
            id: `rule-conflict-${index}`,
            type: 'error',
            field: 'rules',
            message: `Conflicting rules: Co-run and exclusion for tasks ${conflictingTasks.join(', ')}`,
            autoFixable: false,
            severity: 'high'
          });
        }
      });
    });

    // Check for precedence override conflicts
    const precedenceRules = rules.filter(r => r.type === 'precedenceOverride' && r.active);
    const duplicatePriorities = precedenceRules
      .map(r => r.priority)
      .filter((priority, index, arr) => arr.indexOf(priority) !== index);

    if (duplicatePriorities.length > 0) {
      errors.push({
        id: 'precedence-duplicate-priorities',
        type: 'warning',
        field: 'rules',
        message: `Duplicate precedence priorities: ${duplicatePriorities.join(', ')}`,
        autoFixable: false,
        severity: 'medium'
      });
    }

    return errors;
  }

  private detectCircularDependencies(taskId: string, dependencies: string[], allTasks: Task[]): boolean {
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

  validateAll(clients: Client[], workers: Worker[], tasks: Task[], rules: Rule[]): ValidationError[] {
    return [
      ...this.validateClients(clients, tasks),
      ...this.validateWorkers(workers, tasks),
      ...this.validateTasks(tasks, clients, workers),
      ...this.validateGroupRelationships(clients, workers, tasks),
      ...this.validateRuleConflicts(rules)
    ];
  }
}