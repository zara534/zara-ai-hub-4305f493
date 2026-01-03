import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UsageLimits {
  textLimit: number | null;
  imageLimit: number | null;
  textUsed: number;
  imageUsed: number;
  textRemaining: number | null;
  imageRemaining: number | null;
  tier: "free" | "pro" | "unlimited" | "admin";
  isUnlimited: boolean;
  isLoading: boolean;
}

export function useUsageLimits() {
  const { user, isAdmin } = useAuth();
  const [limits, setLimits] = useState<UsageLimits>({
    textLimit: 10,
    imageLimit: 5,
    textUsed: 0,
    imageUsed: 0,
    textRemaining: 10,
    imageRemaining: 5,
    tier: "free",
    isUnlimited: false,
    isLoading: true,
  });

  const loadLimits = useCallback(async () => {
    if (!user) {
      setLimits(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Admin check first
    if (isAdmin) {
      setLimits({
        textLimit: null,
        imageLimit: null,
        textUsed: 0,
        imageUsed: 0,
        textRemaining: null,
        imageRemaining: null,
        tier: "admin",
        isUnlimited: true,
        isLoading: false,
      });
      return;
    }

    try {
      // Get user's subscription tier
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("tier, expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      // Get global limits
      const { data: globalLimits } = await supabase
        .from("global_limits")
        .select("*")
        .maybeSingle();

      // Get today's usage
      const today = new Date().toISOString().split("T")[0];
      const { data: usage } = await supabase
        .from("user_usage")
        .select("text_generations, image_generations")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();

      // Determine tier
      let tier: UsageLimits["tier"] = "free";
      const isExpired = subscription?.expires_at && new Date(subscription.expires_at) < new Date();
      
      if (subscription && !isExpired) {
        tier = subscription.tier as UsageLimits["tier"];
      }

      // Set limits based on tier
      let textLimit: number | null = globalLimits?.free_text_limit ?? 10;
      let imageLimit: number | null = globalLimits?.free_image_limit ?? 5;

      if (tier === "pro") {
        textLimit = globalLimits?.pro_text_limit ?? 100;
        imageLimit = globalLimits?.pro_image_limit ?? 50;
      } else if (tier === "unlimited") {
        textLimit = null;
        imageLimit = null;
      }

      const textUsed = usage?.text_generations ?? 0;
      const imageUsed = usage?.image_generations ?? 0;

      setLimits({
        textLimit,
        imageLimit,
        textUsed,
        imageUsed,
        textRemaining: textLimit !== null ? Math.max(0, textLimit - textUsed) : null,
        imageRemaining: imageLimit !== null ? Math.max(0, imageLimit - imageUsed) : null,
        tier,
        isUnlimited: tier === "unlimited",
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading usage limits:", error);
      // Default to free tier on error
      setLimits(prev => ({
        ...prev,
        tier: "free",
        isLoading: false,
      }));
    }
  }, [user, isAdmin]);

  const canGenerate = useCallback((type: "text" | "image"): boolean => {
    if (limits.isUnlimited || limits.tier === "admin") return true;
    
    if (type === "text") {
      return limits.textRemaining === null || limits.textRemaining > 0;
    } else {
      return limits.imageRemaining === null || limits.imageRemaining > 0;
    }
  }, [limits]);

  const incrementUsage = useCallback(async (type: "text" | "image") => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();

      if (existing) {
        const update = type === "text" 
          ? { text_generations: existing.text_generations + 1 }
          : { image_generations: existing.image_generations + 1 };

        await supabase
          .from("user_usage")
          .update({ ...update, updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        setLimits(prev => ({
          ...prev,
          textUsed: type === "text" ? prev.textUsed + 1 : prev.textUsed,
          imageUsed: type === "image" ? prev.imageUsed + 1 : prev.imageUsed,
          textRemaining: type === "text" && prev.textRemaining !== null 
            ? Math.max(0, prev.textRemaining - 1) : prev.textRemaining,
          imageRemaining: type === "image" && prev.imageRemaining !== null 
            ? Math.max(0, prev.imageRemaining - 1) : prev.imageRemaining,
        }));
      } else {
        await supabase
          .from("user_usage")
          .insert({
            user_id: user.id,
            usage_date: today,
            text_generations: type === "text" ? 1 : 0,
            image_generations: type === "image" ? 1 : 0,
          });

        setLimits(prev => ({
          ...prev,
          textUsed: type === "text" ? 1 : 0,
          imageUsed: type === "image" ? 1 : 0,
          textRemaining: type === "text" && prev.textLimit !== null 
            ? prev.textLimit - 1 : prev.textRemaining,
          imageRemaining: type === "image" && prev.imageLimit !== null 
            ? prev.imageLimit - 1 : prev.imageRemaining,
        }));
      }
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }
  }, [user]);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  return {
    ...limits,
    canGenerate,
    incrementUsage,
    refresh: loadLimits,
  };
}
