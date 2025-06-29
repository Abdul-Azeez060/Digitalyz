'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DataSet, Client, Worker, Task, Rule, ValidationError, PrioritizationWeights } from '@/types/models';

interface DataState extends DataSet {
  isLoading: boolean;
  prioritizationWeights: PrioritizationWeights;
}

type DataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_WORKERS'; payload: Worker[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_RULES'; payload: Rule[] }
  | { type: 'ADD_RULE'; payload: Rule }
  | { type: 'UPDATE_RULE'; payload: { id: string; updates: Partial<Rule> } }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'SET_PRIORITIZATION_WEIGHTS'; payload: PrioritizationWeights }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; updates: Partial<Client> } }
  | { type: 'UPDATE_WORKER'; payload: { id: string; updates: Partial<Worker> } }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } };

const initialState: DataState = {
  clients: [],
  workers: [],
  tasks: [],
  rules: [],
  validationErrors: [],
  isLoading: false,
  prioritizationWeights: {
    clientPriority: 0.2,
    taskUrgency: 0.2,
    workerEfficiency: 0.15,
    resourceOptimization: 0.15,
    costEfficiency: 0.15,
    timelineAdherence: 0.15,
    skillMatching: 0,
    groupBalance: 0
  }
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'SET_WORKERS':
      return { ...state, workers: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_RULES':
      return { ...state, rules: action.payload };
    case 'ADD_RULE':
      return { ...state, rules: [...state.rules, action.payload] };
    case 'UPDATE_RULE':
      return {
        ...state,
        rules: state.rules.map(rule =>
          rule.id === action.payload.id ? { ...rule, ...action.payload.updates } : rule
        )
      };
    case 'DELETE_RULE':
      return {
        ...state,
        rules: state.rules.filter(rule => rule.id !== action.payload)
      };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_PRIORITIZATION_WEIGHTS':
      return { ...state, prioritizationWeights: action.payload };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? { ...client, ...action.payload.updates } : client
        )
      };
    case 'UPDATE_WORKER':
      return {
        ...state,
        workers: state.workers.map(worker =>
          worker.id === action.payload.id ? { ...worker, ...action.payload.updates } : worker
        )
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        )
      };
    default:
      return state;
  }
}

const DataContext = createContext<{
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
} | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}