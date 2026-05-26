"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppleIcon, GithubIcon, GoogleIcon } from "./oauth-icons";
import {
  signInWithGoogleAction,
  signInWithAppleAction,
} from "@/lib/actions/oauth";

type Provider = "google" | "github" | "apple";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

// Google Identity Services typing — minimal surface we use
type GoogleCredentialResponse = { credential: string };
type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (resp: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
      }) => void;
      prompt: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: { id_token: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
      };
    };
  }
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export function OAuthRow({
  providers = ["google", "apple", "github"],
}: {
  providers?: Provider[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<Provider | null>(null);

  const onGoogle = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error("Google sign-in is not configured.");
      return;
    }
    setPending("google");
    try {
      await loadScript("https://accounts.google.com/gsi/client", "gsi-script");
      if (!window.google) throw new Error("Google SDK failed to load");
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: false,
        callback: async (resp) => {
          try {
            const res = await signInWithGoogleAction(resp.credential);
            if (res.success) router.push(res.redirect ?? "/");
            else toast.error(res.error ?? "Google sign-in failed.");
          } finally {
            setPending(null);
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch {
      toast.error("Couldn't start Google sign-in.");
      setPending(null);
    }
  };

  const onApple = async () => {
    const clientId = process.env.NEXT_PUBLIC_APPLE_SERVICES_ID;
    if (!clientId) {
      toast.error("Apple sign-in is not configured.");
      return;
    }
    setPending("apple");
    try {
      await loadScript(
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
        "appleid-script",
      );
      if (!window.AppleID) throw new Error("Apple SDK failed to load");
      window.AppleID.auth.init({
        clientId,
        scope: "name email",
        redirectURI: `${APP_URL}/callback/apple`,
        usePopup: true,
      });
      const data = await window.AppleID.auth.signIn();
      const name = data.user?.name;
      const fullName = name
        ? [name.firstName, name.lastName].filter(Boolean).join(" ").trim()
        : undefined;
      const res = await signInWithAppleAction(
        data.authorization.id_token,
        fullName,
      );
      if (res.success) router.push(res.redirect ?? "/");
      else toast.error(res.error ?? "Apple sign-in failed.");
    } catch {
      toast.error("Couldn't start Apple sign-in.");
    } finally {
      setPending(null);
    }
  };

  const onGithub = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      toast.error("GitHub sign-in is not configured.");
      return;
    }
    const state = crypto.randomUUID();
    sessionStorage.setItem("lexa_oauth_state", state);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${APP_URL}/callback/github`,
      scope: "read:user user:email",
      state,
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  const labels: Record<Provider, string> = {
    google: "Google",
    apple: "Apple",
    github: "GitHub",
  };

  const handlers: Record<Provider, () => void> = {
    google: onGoogle,
    apple: onApple,
    github: onGithub,
  };

  const icons: Record<Provider, React.ReactNode> = {
    google: <GoogleIcon />,
    apple: <AppleIcon />,
    github: <GithubIcon />,
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {providers.map((p) => (
        <button
          key={p}
          type="button"
          onClick={handlers[p]}
          disabled={pending !== null}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line-2 bg-card text-sm font-medium text-ink-2 transition-colors hover:border-muted-2 hover:bg-[color:var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Continue with ${labels[p]}`}
        >
          {icons[p]}
          <span>{labels[p]}</span>
        </button>
      ))}
    </div>
  );
}
