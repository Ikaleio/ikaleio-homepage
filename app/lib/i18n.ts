export type Language = "zh" | "en";

export const defaultLanguage: Language = "zh";

export const languageCookie = "lang";

export const htmlLang: Record<Language, string> = { zh: "zh-CN", en: "en" };

export function parseLanguageCookie(cookieHeader: string | null): Language {
  const value = cookieHeader
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === languageCookie)?.[1];
  return value === "zh" || value === "en" ? value : defaultLanguage;
}

export const translations = {
  zh: {
    heroName: "Ikaleio",
    heroTitle: "学生 / 独立开发者",
    heroBio: "来自中国的大学生，前 OIer，具有全栈开发和运维经验。",
    heroStack: "TypeScript / React / Bun / Docker / Python",
    projectsTitle: "项目",
    projectsSubtitle: "近期开源项目",
    contactTitle: "联系我",
    contactSubtitle: "欢迎通过以下方式找到我",
    contactGithub: "GitHub",
    contactTelegram: "Telegram",
    contactEmail: "邮箱",
    madeWith: "用 ❤ 构建",
  },
  en: {
    heroName: "Ikaleio",
    heroTitle: "Student / Indie Developer",
    heroBio:
      "A college student from China. Former OIer with full-stack development and DevOps experience.",
    heroStack: "TypeScript / React / Bun / Docker / Python",
    projectsTitle: "Projects",
    projectsSubtitle: "Recent open-source work",
    contactTitle: "Contact",
    contactSubtitle: "Feel free to reach out",
    contactGithub: "GitHub",
    contactTelegram: "Telegram",
    contactEmail: "Email",
    madeWith: "Built with ❤",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["zh"];
