import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "~/hooks/use-theme";
import { useLanguage } from "~/hooks/use-language";
import { Sun, Moon, Languages } from "lucide-react";

export function NavHeader() {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { scrollY } = useScroll();

  const headerOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 12]);

  const backgroundColor = useTransform(
    headerOpacity,
    (v) => `hsl(var(--background) / ${v})`
  );
  const backdropFilter = useTransform(headerBlur, (v) => `blur(${v}px)`);

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ backgroundColor, backdropFilter }}
    >
      {/* Logo/Name */}
      <motion.span
        className="text-sm font-medium text-foreground"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
      >
        Ikaleio
      </motion.span>

      {/* Controls */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.6 }}
      >
        {/* Language toggle */}
        <motion.button
          onClick={toggleLanguage}
          className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Toggle language"
        >
          <Languages className="h-3.5 w-3.5" />
          <span>{language === "zh" ? "EN" : "中"}</span>
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/50 text-foreground backdrop-blur-sm transition-colors hover:border-primary/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Toggle theme"
        >
          <motion.div
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.header>
  );
}
