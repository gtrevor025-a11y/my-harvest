// src/services/profileService.ts
import { supabase } from "./supabaseClient";

export const syncProfile = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Session error:", sessionError);
    return;
  }

  const user = session?.user;
  if (!user) return;

  const fullName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error);
    return;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      location: "",
      farming_activities: [],
    });

    if (insertError) console.error("Error creating profile:", insertError);
  }
};
