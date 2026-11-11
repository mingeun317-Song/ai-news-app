"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { collectNews, type CollectResult } from "@/lib/collect";

export type FetchNewsState =
  | ({ status: "done" } & CollectResult)
  | { status: "error" }
  | null;

export async function fetchNews(): Promise<FetchNewsState> {
  // proxy.ts가 막고 있지만, Server Action은 직접 호출될 수 있으므로 여기서도 확인한다.
  const { userId } = await auth();
  if (!userId) throw new Error("로그인이 필요합니다.");

  try {
    const result = await collectNews();
    // 새 기사가 바로 카드로 보이도록 화면을 다시 그린다.
    refresh();
    return { status: "done", ...result };
  } catch (error) {
    console.error("[fetchNews]", error);
    return { status: "error" };
  }
}
