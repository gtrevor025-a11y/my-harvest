import { askAI } from "@/services/aiService";
import { fetchFarmRecords } from "@/services/farmService";

export interface TodayBrain {
  summary: string;
  priorityTasks: {
    title: string;
    priority: "low" | "medium" | "high";
  }[];
  alerts: {
    level: "low" | "medium" | "high";
    message: string;
  }[];
  insights: string[];
  confidence: number;
}

export async function generateTodayBrain(userId: string): Promise<TodayBrain> {
  const farmRecords = await fetchFarmRecords();

  const ai = await askAI({
    mode: "advice",
    query: `Generate today's farm priority summary, risks, and actions for this farmer.`,
    farmRecords,
  });

  return {
    summary: ai.content,
    priorityTasks: ai.actions || [],
    alerts: ai.alerts || [],
    insights: ai.insights || [],
    confidence: ai.confidence || 0.5,
  };
}
