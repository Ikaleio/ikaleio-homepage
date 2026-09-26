import { motion } from "framer-motion";
import { useLanguage } from "~/hooks/use-language";
import {
  useShaderSpotlight,
} from "~/components/shader-background";
import type { GitHubRepo } from "~/lib/github.server";
import { Star, ExternalLink } from "lucide-react";
import { useCallback } from "react";

interface ProjectCardProps {
  repo: GitHubRepo;
  index: number;
}

function ProjectCard({ repo, index }: ProjectCardProps) {
  const { setSpotlight, clearSpotlight } = useShaderSpotlight();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      setSpotlight(x, y);
    },
    [setSpotlight]
  );

  const handleMouseLeave = useCallback(() => {
    clearSpotlight();
  }, [clearSpotlight]);

  return (
    <motion.a
      data-smash-target
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-card/80"
      initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.08,
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Repo name + external link */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-base font-semibold text-foreground">
          {repo.name}
        </h3>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Description */}
      {repo.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {repo.description}
        </p>
      )}

      {/* Meta: language + stars */}
      <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{
                backgroundColor: repo.language.color ?? "#6b7280",
              }}
            />
            {repo.language.name}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.stars}
          </span>
        )}
      </div>
    </motion.a>
  );
}

interface ProjectsSectionProps {
  repos: GitHubRepo[];
}

export function ProjectsSection({ repos }: ProjectsSectionProps) {
  const { t } = useLanguage();

  if (repos.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-24">
      <motion.div
        data-smash-target
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
          {t("projectsTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("projectsSubtitle")}</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo, i) => (
          <ProjectCard key={repo.name} repo={repo} index={i} />
        ))}
      </div>
    </section>
  );
}
