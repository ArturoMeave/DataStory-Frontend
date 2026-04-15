import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // Importamos las herramientas de persistencia
import type {
  AppState,
  DataRow,
  Goal,
  Task,
  ChatMessage,
  AnomalyPoint,
} from "../types";

interface AppActions {
  setRows: (rows: DataRow[]) => void;
  setGoal: (goal: Goal) => void;
  setTasks: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setAiSummary: (summary: string) => void;
  setAnomalies: (anomalies: AnomalyPoint[]) => void;
  setIsLoadingAI: (loading: boolean) => void;
  setIsReadOnly: (readOnly: boolean) => void;
  resetData: () => void;
}

const initialState: AppState = {
  rows: [],
  goal: null,
  tasks: [],
  chatHistory: [],
  aiSummary: "",
  anomalies: [],
  isLoadingAI: false,
  isReadOnly: false,
};

// Aplicamos el middleware 'persist'
export const useDataStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...initialState,

      setRows: (rows) => set({ rows }),

      setGoal: (goal) => set({ goal }),

      setTasks: (tasks) => set({ tasks }),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),

      clearChat: () => set({ chatHistory: [] }),

      setAiSummary: (aiSummary) => set({ aiSummary }),

      setAnomalies: (anomalies) => set({ anomalies }),

      setIsLoadingAI: (isLoadingAI) => set({ isLoadingAI }),

      setIsReadOnly: (isReadOnly) => set({ isReadOnly }),

      resetData: () => set(initialState),
    }),
    {
      name: "financial-data-storage", // Nombre de la clave en el LocalStorage
      storage: createJSONStorage(() => localStorage), // Usamos el disco duro del navegador
      // OPCIONAL: Evitamos que se guarde el estado de carga
      partialize: (state) => ({
        ...state,
        isLoadingAI: false, // Siempre iniciará en false al recargar
      }),
    },
  ),
);
