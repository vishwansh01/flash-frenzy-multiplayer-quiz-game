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
    <div className="min-h-screen bg-gradient-to-br bg-[linear-gradient(to_bottom,hsl(220,65%,5%)_0%,hsl(220,65%,3.52%)_50%,hsl(220,65%,10%)_100%)]  flex items-center justify-center">
      <div className="bg-[#080c15] rounded-lg border-[#004be0] border text-white  shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center b-8">
          🃏 Flashcard Frenzy
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}
