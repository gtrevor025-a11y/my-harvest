import { supabase } from "@/services/supabaseClient";

const ADMIN_SESSION_KEY = "harvest_admin_session";

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .single();
    return !error && !!data;
  } catch {
    return false;
  }
}

export function setAdminSession(email: string) {
  localStorage.setItem(ADMIN_SESSION_KEY, email);
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

const SETTINGS_KEY = "harvest_site_settings";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  announcementBanner: string;
  announcementEnabled: boolean;
  maintenanceMode: boolean;
  enableMarketplace: boolean;
  enableCommunity: boolean;
  enableExperts: boolean;
  enableFarmAssistant: boolean;
  allowNewSignups: boolean;
  requireApprovalForListings: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Harvest",
  tagline: "Connecting farmers across Africa",
  announcementBanner: "",
  announcementEnabled: false,
  maintenanceMode: false,
  enableMarketplace: true,
  enableCommunity: true,
  enableExperts: true,
  enableFarmAssistant: true,
  allowNewSignups: true,
  requireApprovalForListings: false,
};

export function getSiteSettings(): SiteSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function updateSiteSettings(updates: Partial<SiteSettings>) {
  const current = getSiteSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
}
