import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ onThemeChange }: { onThemeChange?: (isDark: boolean) => void }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasUserPreference, setHasUserPreference] = useState(false);

  // Initialize theme based on system preference (always default to system)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const userHasPreference = savedTheme !== null;
    setHasUserPreference(userHasPreference);

    // Always default to system preference unless user explicitly set a preference
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = userHasPreference ? savedTheme === "dark" : systemPrefersDark;

    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (localStorage.getItem("theme") === null) {
        const newIsDark = e.matches;
        setIsDarkMode(newIsDark);
        if (newIsDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        onThemeChange?.(newIsDark);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [onThemeChange]);

  // Toggle theme function
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setHasUserPreference(true);
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
      className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-muted focus-ring-inset"
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
