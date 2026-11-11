"use client";

import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AFTER_SIGN_IN_URL = "/dashboard";

export function SignInModal() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // proxy.ts를 거치지 않고 이 화면에서 로그인 상태가 된 경우(다른 탭 로그인, 뒤로 가기 등)
      router.replace(AFTER_SIGN_IN_URL);
    } else {
      clerk.openSignIn({ fallbackRedirectUrl: AFTER_SIGN_IN_URL });
    }
  }, [clerk, isLoaded, isSignedIn, router]);

  // 로그인 상태에서 모달을 열면 Clerk가 오류를 던지므로, 상태가 확정되기 전에는 버튼을 보여주지 않는다.
  if (!isLoaded || isSignedIn) return null;

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
