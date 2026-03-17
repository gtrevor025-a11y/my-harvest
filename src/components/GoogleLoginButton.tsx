import React from "react";
import { supabase } from "../services/supabaseClient";

export const GoogleLoginButton: React.FC = () => {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://my-harvest.vercel.app"
      }
    });
    if (error) console.error("Google login error:", error.message);
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Sign in with Google
    </button>
  );
};
