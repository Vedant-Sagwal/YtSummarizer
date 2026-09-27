"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  function toggleTheme() {
    const newDark = !dark;

    setDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="
        fixed
        top-5
        right-5
        z-50
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        border
        border-gray-200
        bg-white
        text-lg
        shadow-sm
        transition
        hover:scale-105
        dark:border-gray-700
        dark:bg-gray-900
      "
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}