// Advanced AI service with comprehensive features
import { Rule, ValidationError, Client, Worker, Task } from "@/types/models";
import { GeminiService } from "./gemini-service";

export class AdvancedAIService {
  private static instance: AdvancedAIService;
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  static getInstance(): AdvancedAIService {
    if (!AdvancedAIService.instance) {
      AdvancedAIService.instance = new AdvancedAIService();
    }
    return AdvancedAIService.instance;
  }

  // Advanced Natural Language Data Retrieval
  async processAdvancedNaturalLanguageQuery(
    query: string,
    data: any[],
    dataType: "clients" | "workers" | "tasks"
  ): Promise<any[]> {
    try {
      const schemaFields = this.getSchemaFields(dataType);
      const prompt = `
Analyze this advanced natural language query for ${dataType} data:

Query: "${query}"
STRICT SCHEMA - Only use these fields: ${schemaFields.join(", ")}
Data structure: ${JSON.stringify(data[0] || {}, null, 2)}
Sample data: ${JSON.stringify(data.slice(0, 3), null, 2)}

Parse complex queries like:
- "All tasks with duration > 5 hours and having phase 2 in their preferredPhases list"
- "Workers with React skills and capacity > 30 hours"
- "High priority clients with budget over ₹50000"
- "Tasks requiring Python or JavaScript skills in phases 1-3"

IMPORTANT: Only use fields that exist in the schema: ${schemaFields.join(", ")}

Return JavaScript filter logic as JSON:
{
  "filters": [
    {
      "field": "field-name-from-schema-only",
      "operator": ">", "<", "=", "includes", "excludes", "range", "and", "or",
      "value": "filter-value",
      "conditions": [additional conditions for complex queries]
    }
  ],
  "logic": "and" | "or"
}

Response (JSON only):`;

      const response = await this.geminiService.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const filterConfig = JSON.parse(jsonMatch[0]);
        return this.applyAdvancedFilters(data, filterConfig);
      }
      return this.fallbackAdvancedQuery(query, data, dataType);
    } catch (error) {
      console.warn("Advanced query processing failed, using fallback:", error);
      return this.fallbackAdvancedQuery(query, data, dataType);
    }
  }

  private getSchemaFields(dataType: "clients" | "workers" | "tasks"): string[] {
    switch (dataType) {
      case "clients":
        return [
          "id",
          "name",
          "priority",
          "budget",
          "requirements",
          "contactInfo",
          "phases",
          "requestedTaskIds",
          "groupTag",
          "attributesJSON",
        ];
      case "workers":
        return [
          "id",
          "name",
          "skills",
          "capacity",
          "hourlyRate",
          "availability",
          "maxLoad",
          "phases",
          "availableSlots",
          "maxLoadPerPhase",
          "workerGroup",
          "qualificationLevel",
        ];
      case "tasks":
        return [
          "id",
          "name",
          "clientId",
          "duration",
          "requiredSkills",
          "priority",
          "phases",
          "deadline",
          "dependencies",
          "estimatedEffort",
          "category",
          "preferredPhases",
          "maxConcurrent",
        ];
      default:
        return [];
    }
  }

  private applyAdvancedFilters(data: any[], config: any): any[] {
    const { filters, logic = "and" } = config;

    return data.filter((item) => {
      const results = filters.map((filter: any) =>
        this.evaluateFilter(item, filter)
      );
      //@ts-ignore
      return logic === "and" ? results.every((r) => r) : results.some((r) => r);
    });
  }

  private evaluateFilter(item: any, filter: any): boolean {
    const { field, operator, value, conditions } = filter;
    const itemValue = item[field];

    switch (operator) {
      case ">":
        return Number(itemValue) > Number(value);
      case "<":
        return Number(itemValue) < Number(value);
      case ">=":
        return Number(itemValue) >= Number(value);
      case "<=":
        return Number(itemValue) <= Number(value);
      case "=":
      case "==":
        return itemValue == value;
      case "includes":
        if (Array.isArray(itemValue)) {
          return itemValue.some((v) =>
            v.toString().toLowerCase().includes(value.toLowerCase())
          );
        }
        return itemValue.toString().toLowerCase().includes(value.toLowerCase());
      case "excludes":
        if (Array.isArray(itemValue)) {
          return !itemValue.some((v) =>
            v.toString().toLowerCase().includes(value.toLowerCase())
          );
        }
        return !itemValue
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      case "range":
        const [min, max] = value.split("-").map(Number);
        return Number(itemValue) >= min && Number(itemValue) <= max;
      case "and":
        return (
          conditions?.every((cond: any) => this.evaluateFilter(item, cond)) ||
          false
        );
      case "or":
        return (
          conditions?.some((cond: any) => this.evaluateFilter(item, cond)) ||
          false
        );
      default:
        return true;
    }
  }

  private fallbackAdvancedQuery(
    query: string,
    data: any[],
    dataType: string
  ): any[] {
    const lowerQuery = query.toLowerCase();
    let filteredData = [...data];
    const schemaFields = this.getSchemaFields(dataType as any);

    // Only process queries for fields that exist in schema
    if (lowerQuery.includes("duration") && schemaFields.includes("duration")) {
      if (lowerQuery.includes("more than") || lowerQuery.includes(">")) {
        const match = lowerQuery.match(/duration.*?(\d+)/);
        if (match) {
          const threshold = parseInt(match[1]);
          filteredData = filteredData.filter(
            (item) => item.duration && item.duration > threshold
          );
        }
      }
    }

    // Phase-specific queries using correct field names
    if (
      lowerQuery.includes("phase") &&
      (schemaFields.includes("phases") ||
        schemaFields.includes("preferredPhases"))
    ) {
      const phaseMatch = lowerQuery.match(/phase\s*(\d+)/);
      if (phaseMatch) {
        const phase = parseInt(phaseMatch[1]);
        filteredData = filteredData.filter(
          (item) =>
            (item.phases && item.phases.includes(phase)) ||
            (item.preferredPhases && item.preferredPhases.includes(phase))
        );
      }
    }

    // Skills queries using correct field names
    if (
      lowerQuery.includes("skills") &&
      (schemaFields.includes("skills") ||
        schemaFields.includes("requiredSkills"))
    ) {
      const skillPattern =
        /skills.*?(react|python|javascript|node|angular|vue|java|c\+\+|php|ruby)/gi;
      //@ts-ignore
      const skills = [...lowerQuery.matchAll(skillPattern)].map(
        (match) => match[1]
      );

      if (skills.length > 0) {
        filteredData = filteredData.filter((item) => {
          const itemSkills = item.skills || item.requiredSkills || [];
          if (!Array.isArray(itemSkills)) return false;

          if (lowerQuery.includes(" and ")) {
            return skills.every((skill) =>
              itemSkills.some((s: string) =>
                s.toLowerCase().includes(skill.toLowerCase())
              )
            );
          } else {
            return skills.some((skill) =>
              itemSkills.some((s: string) =>
                s.toLowerCase().includes(skill.toLowerCase())
              )
            );
          }
        });
      }
    }

    // Capacity queries
    if (lowerQuery.includes("capacity") && schemaFields.includes("capacity")) {
      const match = lowerQuery.match(/capacity\s*>\s*(\d+)/);
      if (match) {
        const threshold = parseInt(match[1]);
        filteredData = filteredData.filter(
          (item) => item.capacity && item.capacity > threshold
        );
      }
    }

    // Budget queries - updated for rupees
    if (lowerQuery.includes("budget") && schemaFields.includes("budget")) {
      const match = lowerQuery.match(/budget.*over.*?(\d+)/);
      if (match) {
        const threshold = parseInt(match[1]);
        filteredData = filteredData.filter(
          (item) => item.budget && item.budget > threshold
        );
      }
    }

    return filteredData;
  }

  // Natural Language Data Modification
  async processNaturalLanguageModification(
    command: string,
    data: any[],
    dataType: "clients" | "workers" | "tasks"
  ): Promise<{
    success: boolean;
    changes: any[];
    message: string;
    preview: any[];
  }> {
    try {
      const schemaFields = this.getSchemaFields(dataType);
      const prompt = `
Process this data modification command with high accuracy:

Command: "${command}"
Data type: ${dataType}
STRICT SCHEMA - Only modify these fields: ${schemaFields.join(", ")}
Sample data: ${JSON.stringify(data.slice(0, 3), null, 2)}

Parse commands like:
- "Increase all task durations by 2 hours"
- "Set priority to 5 for all clients with budget > 50000"
- "Add 'senior' skill to all workers with capacity > 40"

IMPORTANT: Only use fields that exist in the schema: ${schemaFields.join(", ")}

Return precise modification instructions:
{
  "success": true,
  "modifications": [
    {
      "type": "update" | "add" | "remove",
      "field": "field-name-from-schema-only",
      "condition": {
        "field": "condition-field-from-schema",
        "operator": ">", "<", "=", "includes",
        "value": "condition-value"
      },
      "action": {
        "operation": "set" | "increment" | "append" | "remove",
        "value": "new-value"
      }
    }
  ],
  "message": "Description of changes"
}

Response (JSON only):`;

      const response = await this.geminiService.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const modConfig = JSON.parse(jsonMatch[0]);
        return this.applyDataModifications(data, modConfig);
      }

      return this.fallbackDataModification(command, data, dataType);
    } catch (error) {
      console.warn("Data modification failed, using fallback:", error);
      return this.fallbackDataModification(command, data, dataType);
    }
  }

  private applyDataModifications(data: any[], config: any): any {
    const changes: any[] = [];
    const preview: any[] = [];

    config.modifications?.forEach((mod: any) => {
      data.forEach((item, index) => {
        if (this.evaluateCondition(item, mod.condition)) {
          const oldValue = item[mod.field];
          let newValue = oldValue;

          switch (mod.action.operation) {
            case "set":
              newValue = mod.action.value;
              break;
            case "increment":
              newValue = (Number(oldValue) || 0) + Number(mod.action.value);
              break;
            case "append":
              if (Array.isArray(oldValue)) {
                newValue = [...oldValue, mod.action.value];
              } else {
                newValue = oldValue + mod.action.value;
              }
              break;
            case "remove":
              if (Array.isArray(oldValue)) {
                newValue = oldValue.filter((v) => v !== mod.action.value);
              }
              break;
          }

          if (newValue !== oldValue) {
            changes.push({
              index,
              field: mod.field,
              oldValue,
              newValue,
              id: item.id,
            });

            preview.push({
              ...item,
              [mod.field]: newValue,
            });
          }
        }
      });
    });

    return {
      success: true,
      changes,
      message: config.message || `Applied ${changes.length} modifications`,
      preview,
    };
  }

  private evaluateCondition(item: any, condition: any): boolean {
    if (!condition) return true;

    const { field, operator, value } = condition;
    const itemValue = item[field];

    switch (operator) {
      case ">":
        return Number(itemValue) > Number(value);
      case "<":
        return Number(itemValue) < Number(value);
      case "=":
        return itemValue == value;
      case "includes":
        return Array.isArray(itemValue)
          ? itemValue.includes(value)
          : itemValue.toString().includes(value);
      default:
        return true;
    }
  }

  private fallbackDataModification(
    command: string,
    data: any[],
    dataType: string
  ): any {
    const lowerCommand = command.toLowerCase();
    const changes: any[] = [];
    const schemaFields = this.getSchemaFields(dataType as any);

    // Simple increment/decrement patterns - only for schema fields
    if (lowerCommand.includes("increase") && lowerCommand.includes("by")) {
      const match = lowerCommand.match(/increase.*?(\w+).*?by\s*(\d+)/);
      if (match) {
        const [, field, amount] = match;
        if (schemaFields.includes(field)) {
          data.forEach((item, index) => {
            if (item[field] !== undefined) {
              changes.push({
                index,
                field,
                oldValue: item[field],
                newValue: (Number(item[field]) || 0) + Number(amount),
                id: item.id,
              });
            }
          });
        }
      }
    }

    return {
      success: changes.length > 0,
      changes,
      message:
        changes.length > 0
          ? `Applied ${changes.length} changes`
          : "No changes applied",
      preview: [],
    };
  }

  // AI Rule Recommendations - Strictly follow schema
  async generateRuleRecommendations(
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
  ): Promise<{ recommendations: any[]; insights: string[] }> {
    try {
      const prompt = `
Analyze this resource allocation data and provide intelligent rule recommendations:

STRICT SCHEMA COMPLIANCE:
Client fields: id, name, priority, budget, requirements, contactInfo, phases, requestedTaskIds, groupTag, attributesJSON
Worker fields: id, name, skills, capacity, hourlyRate, availability, maxLoad, phases, availableSlots, maxLoadPerPhase, workerGroup, qualificationLevel
Task fields: id, name, clientId, duration, requiredSkills, priority, phases, deadline, dependencies, estimatedEffort, category, preferredPhases, maxConcurrent

Rule types: coRun, sequence, exclusion, slotRestriction, loadLimit, phaseWindow, patternMatch, precedenceOverride

Data Summary:
- Clients: ${clients.length} (priorities: ${clients
        .map((c) => c.priority)
        .join(", ")})
- Workers: ${workers.length} (avg capacity: ${
        workers.reduce((sum, w) => sum + w.capacity, 0) / workers.length
      })
- Tasks: ${tasks.length} (total duration: ${tasks.reduce(
        (sum, t) => sum + t.duration,
        0
      )})

Sample data:
${JSON.stringify(
  {
    clients: clients.slice(0, 2),
    workers: workers.slice(0, 2),
    tasks: tasks.slice(0, 2),
  },
  null,
  2
)}

ONLY analyze patterns using the exact fields listed above. Look for:
1. Tasks with same clientId that could run together (coRun)
2. Workers with high capacity vs maxLoadPerPhase (loadLimit)
3. Tasks with preferredPhases conflicts (phaseWindow)
4. Skills in requiredSkills vs worker skills gaps
5. Phase distribution in availableSlots vs preferredPhases

Return recommendations using ONLY schema fields:
{
  "recommendations": [
    {
      "type": "coRun" | "loadLimit" | "phaseWindow" | "slotRestriction",
      "title": "Recommendation title",
      "description": "Why this helps",
      "confidence": 0.8,
      "impact": "high" | "medium" | "low",
      "rule": {
        "id": "rule-id",
        "type": "rule-type",
        "name": "Rule name",
        "tasks": ["task-ids-from-data"],
        "workers": ["worker-ids-from-data"],
        "phases": [phase-numbers-from-data],
        "weight": 0.7,
        "active": false,
        "parameters": {}
      }
    }
  ],
  "insights": [
    "Key insights using only schema field names"
  ]
}

Response (JSON only):`;

      const response = await this.geminiService.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          recommendations: result.recommendations || [],
          insights: result.insights || [],
        };
      }

      return this.fallbackRuleRecommendations(clients, workers, tasks);
    } catch (error) {
      console.warn("Rule recommendations failed, using fallback:", error);
      return this.fallbackRuleRecommendations(clients, workers, tasks);
    }
  }

  private fallbackRuleRecommendations(
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
  ): any {
    const recommendations: any[] = [];
    const insights: string[] = [];

    // Analyze task co-occurrence by clientId (using schema field)
    const tasksByClient = tasks.reduce((acc, task) => {
      if (!acc[task.clientId]) acc[task.clientId] = [];
      acc[task.clientId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    Object.entries(tasksByClient).forEach(([clientId, clientTasks]) => {
      if (clientTasks.length > 1) {
        const client = clients.find((c) => c.id === clientId);
        recommendations.push({
          type: "coRun",
          title: `Co-run tasks for ${client?.name || clientId}`,
          description: `${clientTasks.length} tasks for this client could be executed together for efficiency`,
          confidence: 0.8,
          impact: "high",
          rule: {
            id: `corun-${clientId}-${Date.now()}`,
            type: "coRun",
            name: `Co-run ${client?.name || clientId} tasks`,
            tasks: clientTasks.map((t) => t.id),
            weight: 0.7,
            active: false,
          },
        });
      }
    });

    // Analyze worker capacity vs maxLoadPerPhase (using schema fields)
    const overloadedWorkers = workers.filter(
      (w) => w.capacity > 40 && w.maxLoadPerPhase && w.maxLoadPerPhase > 8
    );

    if (overloadedWorkers.length > 0) {
      recommendations.push({
        type: "loadLimit",
        title: "Prevent worker overload",
        description:
          "High-capacity workers may be overloaded based on maxLoadPerPhase. Set load limits.",
        confidence: 0.7,
        impact: "medium",
        rule: {
          id: `load-limit-${Date.now()}`,
          type: "loadLimit",
          name: "High-capacity worker limits",
          workers: overloadedWorkers.map((w) => w.id),
          weight: 0.6,
          active: false,
          parameters: { maxLoad: 0.8 },
        },
      });
    }

    // Analyze skill coverage using requiredSkills vs skills (schema fields)
    const allRequiredSkills = new Set(tasks.flatMap((t) => t.requiredSkills));
    const allAvailableSkills = new Set(workers.flatMap((w) => w.skills));
    //@ts-ignore
    const missingSkills = [...allRequiredSkills].filter(
      (skill) => !allAvailableSkills.has(skill)
    );

    if (missingSkills.length > 0) {
      insights.push(
        `Skill gaps detected in requiredSkills vs worker skills: ${missingSkills.join(
          ", "
        )}`
      );
    }

    // Analyze preferredPhases vs availableSlots (schema fields)
    const phaseDistribution = tasks.reduce((acc, task) => {
      task.preferredPhases?.forEach((phase) => {
        acc[phase] = (acc[phase] || 0) + task.duration;
      });
      return acc;
    }, {} as Record<number, number>);

    const workerPhaseCapacity = workers.reduce((acc, worker) => {
      worker.availableSlots?.forEach((phase) => {
        acc[phase] = (acc[phase] || 0) + (worker.maxLoadPerPhase || 1);
      });
      return acc;
    }, {} as Record<number, number>);

    Object.entries(phaseDistribution).forEach(([phase, demand]) => {
      const capacity = workerPhaseCapacity[parseInt(phase)] || 0;
      if (demand > capacity) {
        insights.push(
          `Phase ${phase} overloaded: ${demand}h demand vs ${capacity}h capacity in availableSlots`
        );
      }
    });

    return { recommendations, insights };
  }

  // AI-based Error Correction - Schema compliant
  async generateErrorCorrections(
    errors: ValidationError[],
    data: any[],
    dataType: "clients" | "workers" | "tasks"
  ): Promise<{ corrections: any[]; autoFixable: any[] }> {
    try {
      const schemaFields = this.getSchemaFields(dataType);
      const prompt = `
Analyze these validation errors and suggest precise corrections:

STRICT SCHEMA - Only suggest corrections for these fields: ${schemaFields.join(
        ", "
      )}

Errors: ${JSON.stringify(errors.slice(0, 10), null, 2)}
Data type: ${dataType}
Sample data: ${JSON.stringify(data.slice(0, 3), null, 2)}

For each error, provide corrections using ONLY schema fields.

Return correction suggestions:
{
  "corrections": [
    {
      "errorId": "error-id",
      "correction": {
        "type": "replace" | "add" | "remove" | "transform",
        "field": "field-name-from-schema-only",
        "oldValue": "current-value",
        "newValue": "corrected-value",
        "confidence": 0.9,
        "reasoning": "Why this correction is suggested"
      },
      "autoFixable": true,
      "impact": "low" | "medium" | "high"
    }
  ]
}

Response (JSON only):`;

      const response = await this.geminiService.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const corrections = result.corrections || [];
        const autoFixable = corrections.filter((c: any) => c.autoFixable);
        return { corrections, autoFixable };
      }

      return this.fallbackErrorCorrections(errors, data);
    } catch (error) {
      console.warn("Error correction failed, using fallback:", error);
      return this.fallbackErrorCorrections(errors, data);
    }
  }

  private fallbackErrorCorrections(
    errors: ValidationError[],
    data: any[]
  ): any {
    const corrections: any[] = [];
    const autoFixable: any[] = [];

    errors.forEach((error) => {
      let correction: any = null;

      switch (error.type) {
        case "error":
          if (error.field === "id" && !error.suggestedFix) {
            correction = {
              errorId: error.id,
              correction: {
                type: "replace",
                field: "id",
                oldValue: "",
                newValue: `${error.field}-${Date.now()}-${error.row}`,
                confidence: 0.9,
                reasoning: "Generate unique ID based on timestamp and row",
              },
              autoFixable: true,
              impact: "low",
            };
          }
          break;
        case "warning":
          if (error.field === "priority" && error.suggestedFix) {
            correction = {
              errorId: error.id,
              correction: {
                type: "replace",
                field: "priority",
                oldValue: error.message.match(/\d+/)?.[0],
                newValue: error.suggestedFix,
                confidence: 0.8,
                reasoning: "Clamp priority value to valid range (1-5)",
              },
              autoFixable: true,
              impact: "low",
            };
          }
          break;
      }

      if (correction) {
        corrections.push(correction);
        if (correction.autoFixable) {
          autoFixable.push(correction);
        }
      }
    });

    return { corrections, autoFixable };
  }

  // Natural Language to Rules Converter - Schema compliant
  async convertNaturalLanguageToRule(
    description: string,
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
  ): Promise<{ success: boolean; rule?: Rule; message: string }> {
    try {
      const prompt = `
Convert this natural language rule description into a structured rule:

Description: "${description}"

STRICT SCHEMA COMPLIANCE:
Available clients: ${clients.map((c) => `${c.id} (${c.name})`).join(", ")}
Available workers: ${workers.map((w) => `${w.id} (${w.name})`).join(", ")}
Available tasks: ${tasks.map((t) => `${t.id} (${t.name})`).join(", ")}

Rule types: coRun, sequence, exclusion, slotRestriction, loadLimit, phaseWindow, patternMatch, precedenceOverride

Parse descriptions like:
- "Tasks T1 and T2 should always run together" -> coRun rule
- "Worker W1 should not work more than 6 hours per phase" -> loadLimit rule
- "High priority clients should get their tasks done first" -> precedenceOverride rule
- "Tasks requiring Python skills should be in phases 2-3" -> phaseWindow rule

ONLY use IDs that exist in the provided data.

Return a structured rule:
{
  "success": true,
  "rule": {
    "id": "generated-id",
    "type": "coRun" | "sequence" | "exclusion" | "loadLimit" | "phaseWindow" | "slotRestriction" | "patternMatch" | "precedenceOverride",
    "name": "Rule name",
    "description": "Rule description",
    "tasks": ["existing-task-ids-only"],
    "workers": ["existing-worker-ids-only"],
    "phases": [1, 2, 3],
    "weight": 0.7,
    "active": false,
    "parameters": {}
  },
  "message": "Rule created successfully"
}

Response (JSON only):`;

      const response = await this.geminiService.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }

      return this.fallbackNaturalLanguageToRule(
        description,
        clients,
        workers,
        tasks
      );
    } catch (error) {
      console.warn(
        "Natural language rule conversion failed, using fallback:",
        error
      );
      return this.fallbackNaturalLanguageToRule(
        description,
        clients,
        workers,
        tasks
      );
    }
  }

  private fallbackNaturalLanguageToRule(
    description: string,
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
  ): any {
    const lowerDesc = description.toLowerCase();

    // Co-run pattern - only use existing task IDs
    if (lowerDesc.includes("together") || lowerDesc.includes("same time")) {
      const taskMatches = description.match(/t\d+/gi);
      if (taskMatches && taskMatches.length > 1) {
        const validTaskIds = taskMatches
          .map((t) => t.toLowerCase())
          .filter((taskId) =>
            tasks.some((task) => task.id.toLowerCase() === taskId)
          );

        if (validTaskIds.length > 1) {
          return {
            success: true,
            rule: {
              id: `corun-${Date.now()}`,
              type: "coRun",
              name: "Co-run tasks",
              description,
              tasks: validTaskIds,
              weight: 0.7,
              active: false,
            },
            message: "Co-run rule created from natural language",
          };
        }
      }
    }

    // Load limit pattern - only use existing worker IDs
    if (
      lowerDesc.includes("not work more than") ||
      lowerDesc.includes("limit")
    ) {
      const hourMatch = description.match(/(\d+)\s*hours?/);
      const workerMatch = description.match(/worker\s+(\w+)/i);

      if (hourMatch && workerMatch) {
        const workerId = workerMatch[1].toLowerCase();
        const workerExists = workers.some(
          (w) => w.id.toLowerCase() === workerId
        );

        if (workerExists) {
          return {
            success: true,
            rule: {
              id: `load-limit-${Date.now()}`,
              type: "loadLimit",
              name: "Worker load limit",
              description,
              workers: [workerId],
              weight: 0.6,
              active: false,
              parameters: { maxHours: parseInt(hourMatch[1]) },
            },
            message: "Load limit rule created from natural language",
          };
        }
      }
    }

    return {
      success: false,
      message:
        "Could not parse the rule description. Please be more specific and use existing IDs from your data.",
    };
  }
}
