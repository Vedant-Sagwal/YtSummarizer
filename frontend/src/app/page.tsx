"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }

    // Check authentication
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
    }

    checkUser();
  }, []);

  // function toggleTheme() {
  //   const newDarkMode = !darkMode;

  //   setDarkMode(newDarkMode);

  //   if (newDarkMode) {
  //     document.documentElement.classList.add("dark");
  //     localStorage.setItem("theme", "dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //     localStorage.setItem("theme", "light");
  //   }
  // }

  function handleGetStarted() {
    if (loggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">

        {/* Navbar */}
        <nav className="flex items-center justify-between py-6">

          <button
            onClick={() => {router.push("/")}}
            className="text-2xl font-bold transition hover:opacity-70">
            Auxiliator
          </button>

          <div className="flex items-center gap-4">

            {/* Dashboard / Login */}
            <button
              onClick={() =>
                loggedIn
                  ? router.push("/dashboard")
                  : router.push("/login")
              }
              className="
                rounded-lg
                border
                border-[var(--foreground)]
                px-5
                py-2.5
                text-sm
                font-medium
                transition
                hover:opacity-70
              "
            >
              {loggedIn ? "Dashboard" : "Login"}
            </button>

            
          </div>

        </nav>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">

          <div
            className="
              mb-6
              rounded-full
              border
              border-[var(--foreground)]
              px-4
              py-2
              text-sm
              opacity-90
            "
          >
            AI-powered YouTube summarization
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Understand YouTube videos

            <span className="block opacity-60">
              in seconds.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg opacity-70">
            Turn long YouTube videos into structured summaries,
            chapters, key concepts, actionable insights and
            important quotes.
          </p>

          {/* CTA */}
          <button
            onClick={handleGetStarted}
            className="
              mt-10
              rounded-xl
              bg-[var(--button)]
              px-7
              py-3
              font-semibold
              text-[var(--button-text)]
              shadow-md
              transition
              hover:scale-[1.02]
              hover:opacity-90
            "
          >
            {loggedIn ? "Go to Dashboard →" : "Get Started →"}
          </button>

          {/* Features */}
          <div className="mt-20 grid w-full max-w-4xl gap-5 sm:grid-cols-3">

            <Feature
              title="Smart Summaries"
              description="Get the important information without watching the entire video."
            />

            <Feature
              title="Key Concepts"
              description="Automatically identify the important ideas discussed in the video."
            />

            <Feature
              title="Chapters"
              description="Navigate the video through meaningful timestamped sections."
            />

          </div>

        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-sm opacity-50">
          Built by Vedant Sagwal
        </footer>

      </div>
    </main>
  );
}


function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-[var(--foreground)]
        p-6
        text-left
        transition
        hover:-translate-y-1
      "
    >
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm opacity-65">
        {description}
      </p>
    </div>
  );
}