"use client";

import { useEffect, useState } from "react";
import type { MarketingSettings } from "@/lib/types";
import { WelcomePopup } from "./WelcomePopup";
import { ExitIntentPopup } from "./ExitIntentPopup";
import { CartReminderPopup } from "./CartReminderPopup";

export function MarketingProvider() {
  const [settings, setSettings] = useState<MarketingSettings | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/marketing")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  if (!settings) return null;

  return (
    <>
      {settings.welcome_popup.enabled && (
        <WelcomePopup config={settings.welcome_popup} />
      )}
      {settings.exit_intent.enabled && (
        <ExitIntentPopup config={settings.exit_intent} />
      )}
      {settings.cart_reminder.enabled && (
        <CartReminderPopup config={settings.cart_reminder} />
      )}
    </>
  );
}
