import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ onThemeChange }: { onThemeChange?: (isDark: boolean) => void }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme based on user preference
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" ||
      (localStorage.getItem("theme") === null &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    onThemeChange?.(newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
      aria-label="Toggle theme"
      data-theme={isDarkMode ? 'dark' : 'light'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-primary" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
    </button>
  );
}
