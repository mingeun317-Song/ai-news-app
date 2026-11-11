import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isSignInRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(
  async (auth, request) => {
    if (!isSignInRoute(request)) {
      await auth.protect();
      return;
    }

    // 이미 로그인한 상태에서는 Clerk 모달이 열리지 않으므로 메인(/dashboard)으로 보낸다.
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  },
  { signInUrl: "/sign-in" },
);

export const config = {
  matcher: [
    // Next.js 내부 경로와 정적 파일을 제외한 모든 경로
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api(.*)",
  ],
};
