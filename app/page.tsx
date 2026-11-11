import { redirect } from "next/navigation";

// 메인 화면은 /dashboard다(PRD 6장).
export default function Home() {
  redirect("/dashboard");
}
