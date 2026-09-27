"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Logged in as: {email}
      </p>

      <button
        className="mt-6 rounded bg-black px-4 py-2 text-white"
        onClick={logout}
      >
        Logout
      </button>
    </main>
  );
}