"use client";

import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

const AFTER_SIGN_IN_URL = "/";

export function SignInModal() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      clerk.openSignIn({ fallbackRedirectUrl: AFTER_SIGN_IN_URL });
    }
  }, [clerk, isLoaded, isSignedIn]);

  return (
    <SignInButton mode="modal" fallbackRedirectUrl={AFTER_SIGN_IN_URL}>
      <button
        type="button"
        className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background"
      >
        로그인
      </button>
    </SignInButton>
  );
}
