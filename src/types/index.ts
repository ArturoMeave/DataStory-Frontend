export interface DataRow {
  date: string;
  revenue: number;
  expenses: number;
  label?: string;
}

export interface Goal {
  amount: number;
  currency: string;
  period: "monthly" | "quarterly" | "annual";
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AnomalyPoint {
  index: number;
  date: string;
  value: number;
  type: "revenue" | "expense";
}

export interface ForecastPoint extends DataRow {
  isForecast: true;
}

export type ChartDataPoint = DataRow | ForecastPoint;

export interface AppState {
  rows: DataRow[];
  goal: Goal | null;
  tasks: Task[];
  chatHistory: ChatMessage[];
  aiSummary: string;
  anomalies: AnomalyPoint[];
  isLoadingAI: boolean;
  isReadOnly: boolean;
}
