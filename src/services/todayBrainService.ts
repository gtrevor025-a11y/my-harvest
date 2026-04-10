import { supabase } from "@/services/supabaseClient";

export interface TodayBrain {
  tasks: any[];
  alerts: any[];
  weather?: any;
  summary: string;
  healthScore: number;
}

export async function getTodayBrain(userId: string): Promise<TodayBrain> {
  // 🟢 TASKS
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .limit(5);

  // 🔴 ALERTS
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  // 🧠 SIMPLE HEALTH SCORE (you’ll improve later)
  let score = 100;

  if (alerts?.length) score -= alerts.length * 10;
  if (tasks?.length > 5) score -= 10;

  if (score < 0) score = 0;

  // 🧾 SUMMARY
  const summary = `
You have ${tasks?.length || 0} pending tasks and ${alerts?.length || 0} alerts today.
Focus on high priority tasks first.
`;

  return {
    tasks: tasks || [],
    alerts: alerts || [],
    summary,
    healthScore: score,
  };
}
