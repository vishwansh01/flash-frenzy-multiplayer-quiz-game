import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "./AuthForm";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🃏 Flashcard Frenzy
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}
