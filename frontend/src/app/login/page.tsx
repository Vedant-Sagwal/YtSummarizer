"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/dashboard");
      }
    }

    checkUser();
  }, [router]);

//   function toggleTheme() {
//     const newDarkMode = !darkMode;

//     setDarkMode(newDarkMode);

//     if (newDarkMode) {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          throw error;
        }

        router.replace("/dashboard");
      } else {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) {
          throw error;
        }

        /*
         * If email confirmation is enabled in Supabase,
         * the user needs to confirm their email first.
         */
        if (data.session) {
          router.replace("/dashboard");
        } else {
          setMessage(
            "Account created. Please check your email to confirm your account.",
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">

        {/* Navbar */}
        <nav className="flex items-center justify-between py-6">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold"
          >
            Auxiliator
          </button>

       
        </nav>

        {/* Auth card */}
        <div className="flex flex-1 items-center justify-center">

          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              border
              border-[var(--foreground)]
              bg-[var(--card)]
              p-8
              shadow-lg
            "
          >

            <div className="text-center">

              <h1 className="text-3xl font-bold">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>

              <p className="mt-2 text-sm opacity-60">
                {isLogin
                  ? "Log in to continue using Auxiliator."
                  : "Create an account to start summarizing videos."}
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-[var(--foreground)]
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-[var(--foreground)]
                  "
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-[var(--foreground)]
                    bg-transparent
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-[var(--foreground)]
                  "
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="
                    rounded-lg
                    border
                    border-red-500
                    bg-red-500/10
                    p-3
                    text-sm
                    text-red-500
                  "
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div
                  className="
                    rounded-lg
                    border
                    border-green-500
                    bg-green-500/10
                    p-3
                    text-sm
                    text-green-500
                  "
                >
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  bg-[var(--button)]
                  px-4
                  py-3
                  font-semibold
                  text-[var(--button-text)]
                  transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
              </button>

            </form>

            {/* Switch */}
            <div className="mt-6 text-center text-sm">

              <span className="opacity-60">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>

              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setMessage("");
                }}
                className="font-semibold underline"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}