// Gemini AI service for real AI processing with strict schema compliance
export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async makeRequest(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      console.error("Gemini API request failed:", error);
      throw error;
    }
  }

  async mapHeaders(
    uploadedHeaders: string[],
    expectedHeaders: string[]
  ): Promise<Record<string, string>> {
    const prompt = `
You are a data mapping expert. Map the uploaded CSV headers to expected headers using STRICT SCHEMA.

Uploaded headers: ${uploadedHeaders.join(", ")}
Expected headers (ONLY these are valid): ${expectedHeaders.join(", ")}

CRITICAL: Only map to headers that exist in the expected list. Do not create new mappings.

Return a JSON object mapping uploaded headers to expected headers:
{
  "uploaded_header": "expected_header_from_list_only"
}

Response (JSON only):`;

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const mapping = JSON.parse(jsonMatch[0]);
        // Validate all mappings against expected headers
        const validMapping: Record<string, string> = {};
        Object.entries(mapping).forEach(([key, value]) => {
          if (expectedHeaders.includes(value as string)) {
            validMapping[key] = value as string;
          }
        });
        return validMapping;
      }
      return {};
    } catch (error) {
      console.error("Header mapping failed:", error);
      return {};
    }
  }

  async validateData(data: any[], schema: string): Promise<any[]> {
    const sampleData = data.slice(0, 5); // Analyze first 5 rows

    const schemaFields = this.getSchemaFields(schema);

    const prompt = `
Analyze this ${schema} data and identify validation errors using STRICT SCHEMA:

Valid fields for ${schema}: ${schemaFields.join(", ")}
Data sample: ${JSON.stringify(sampleData, null, 2)}

CRITICAL: Only validate fields that exist in the schema list above.

Look for:
1. Missing required fields (id, name are always required)
2. Invalid data types for schema fields only
3. Out-of-range values for schema fields only
4. Inconsistent formats in schema fields only

Return a JSON array of validation errors with this structure:
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

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const errors = JSON.parse(jsonMatch[0]);
        // Filter to only include errors for valid schema fields
        return errors.filter(
          (error: any) =>
            schemaFields.includes(error.field) ||
            error.field === "id" ||
            error.field === "name"
        );
      }
      return [];
    } catch (error) {
      console.error("Data validation failed:", error);
      return [];
    }
  }

  private getSchemaFields(schema: string): string[] {
    switch (schema) {
      case "client":
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
      case "worker":
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
      case "task":
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

  async processNaturalLanguageQuery(
    query: string,
    data: any[]
  ): Promise<any[]> {
    // Determine data type from structure
    const dataType = data[0]?.clientId
      ? "task"
      : data[0]?.skills
      ? "worker"
      : "client";
    const schemaFields = this.getSchemaFields(dataType);

    const prompt = `
Convert this natural language query into a filter function for the data using STRICT SCHEMA:

Query: "${query}"
Data type: ${dataType}
Valid fields: ${schemaFields.join(", ")}
Data structure: ${JSON.stringify(data[0] || {}, null, 2)}

CRITICAL: Only use fields that exist in the schema list above.

Analyze the query and return JavaScript filter logic as a JSON object:
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

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const filterConfig = JSON.parse(jsonMatch[0]);
        const validFilters =
          filterConfig.filters?.filter((filter: any) =>
            schemaFields.includes(filter.field)
          ) || [];
        return this.applyFilters(data, validFilters);
      }
      return data;
    } catch (error) {
      console.error("Natural language query failed:", error);
      return data;
    }
  }

  private applyFilters(data: any[], filters: any[]): any[] {
    return data.filter((item) => {
      return filters.every((filter) => {
        const value = item[filter.field];
        switch (filter.operator) {
          case ">":
            return Number(value) > Number(filter.value);
          case "<":
            return Number(value) < Number(filter.value);
          case "=":
            return value == filter.value;
          case "includes":
            return Array.isArray(value)
              ? value.some((v) =>
                  v
                    .toString()
                    .toLowerCase()
                    .includes(filter.value.toLowerCase())
                )
              : value
                  .toString()
                  .toLowerCase()
                  .includes(filter.value.toLowerCase());
          case "excludes":
            return !value
              .toString()
              .toLowerCase()
              .includes(filter.value.toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  async suggestRules(data: {
    clients: any[];
    workers: any[];
    tasks: any[];
  }): Promise<any[]> {
    const prompt = `
Analyze this resource allocation data and suggest optimization rules using STRICT SCHEMA:

SCHEMA COMPLIANCE:
- Rule types: coRun, sequence, exclusion, slotRestriction, loadLimit, phaseWindow, patternMatch, precedenceOverride
- Client fields: id, name, priority, budget, requestedTaskIds, groupTag, attributesJSON
- Worker fields: id, name, skills, capacity, availableSlots, maxLoadPerPhase, workerGroup, qualificationLevel  
- Task fields: id, name, clientId, duration, requiredSkills, priority, category, preferredPhases, maxConcurrent

Clients: ${data.clients.length} records
Workers: ${data.workers.length} records  
Tasks: ${data.tasks.length} records

Sample data:
${JSON.stringify(
  {
    clients: data.clients.slice(0, 2),
    workers: data.workers.slice(0, 2),
    tasks: data.tasks.slice(0, 2),
  },
  null,
  2
)}

CRITICAL: Only suggest rules using existing IDs from the data and schema fields listed above.

Suggest 3-5 allocation rules that would optimize resource distribution. Return as JSON array:
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

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        // Validate that all referenced IDs exist in the data
        return suggestions.filter((rule: any) => {
          const validTasks =
            rule.tasks?.every((taskId: string) =>
              data.tasks.some((t) => t.id === taskId)
            ) ?? true;
          const validWorkers =
            rule.workers?.every((workerId: string) =>
              data.workers.some((w) => w.id === workerId)
            ) ?? true;
          return validTasks && validWorkers;
        });
      }
      return [];
    } catch (error) {
      console.error("Rule suggestion failed:", error);
      return [];
    }
  }

  async processNaturalLanguageCorrection(
    command: string,
    data: any[],
    dataType: string
  ): Promise<{ success: boolean; changes: any[]; message: string }> {
    const schemaFields = this.getSchemaFields(dataType);

    const prompt = `
Process this data correction command using STRICT SCHEMA:

Command: "${command}"
Data type: ${dataType}
Valid fields: ${schemaFields.join(", ")}
Sample data: ${JSON.stringify(data.slice(0, 3), null, 2)}

CRITICAL: Only modify fields that exist in the schema list above.

Analyze the command and return the changes needed as JSON:
{
  "success": true,
  "changes": [
    {
      "index": 0,
      "field": "field-name-from-schema-only",
      "oldValue": "current-value",
      "newValue": "new-value",
      "id": "record-id"
    }
  ],
  "message": "Description of changes"
}

Response (JSON only):`;

    try {
      const response = await this.makeRequest(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        // Validate that all field names are in schema
        const validChanges =
          result.changes?.filter((change: any) =>
            schemaFields.includes(change.field)
          ) || [];
        return {
          ...result,
          changes: validChanges,
        };
      }
      return {
        success: false,
        changes: [],
        message: "Could not process the command",
      };
    } catch (error) {
      console.error("Natural language correction failed:", error);
      return {
        success: false,
        changes: [],
        message: "Error processing command",
      };
    }
  }
}
