import { SignInModal } from "./sign-in-modal";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
      <SignInModal />
    </main>
  );
}
