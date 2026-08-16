import { motion } from "framer-motion";
import { useLanguage } from "~/hooks/use-language";
import { SectionReveal, RevealItem } from "~/components/section-reveal";
import { Github, Send, Mail } from "lucide-react";

export function ContactSection() {
  const { t } = useLanguage();

  const links = [
    {
      icon: Github,
      label: t("contactGithub"),
      href: "https://github.com/Ikaleio",
    },
    {
      icon: Send,
      label: t("contactTelegram"),
      href: "https://t.me/Ikaleio",
    },
    {
      icon: Mail,
      label: t("contactEmail"),
      href: "mailto:me@ikale.io",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-24">
      <SectionReveal className="flex flex-col items-center gap-8 text-center">
        <RevealItem>
          <h2
            data-smash-target
            className="font-serif text-3xl font-bold tracking-tight md:text-4xl"
          >
            {t("contactTitle")}
          </h2>
        </RevealItem>
        <RevealItem>
          <p data-smash-target className="text-muted-foreground">
            {t("contactSubtitle")}
          </p>
        </RevealItem>

        <RevealItem className="flex flex-wrap justify-center gap-4">
          {links.map((link) => (
            <motion.a
              data-smash-target
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </motion.a>
          ))}
        </RevealItem>
      </SectionReveal>

      {/* Footer */}
      <motion.footer
        data-smash-target
        className="mt-24 pb-8 text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <p>{t("madeWith")}</p>
      </motion.footer>
    </section>
  );
}
