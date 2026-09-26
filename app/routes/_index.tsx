import type { Route } from "./+types/_index";
import { useLoaderData } from "react-router";
import { fetchPinnedRepos } from "~/lib/github.server";
import { translations } from "~/lib/i18n";
import { NavHeader } from "~/components/nav-header";
import { HeroSection } from "~/components/hero-section";
import { ProjectsSection } from "~/components/projects-section";
import { ContactSection } from "~/components/contact-section";
import { ShaderBackground } from "~/components/shader-background";

export function meta({ matches }: Route.MetaArgs) {
  const { language } = matches[0].data;
  return [
    { title: "Ikaleio" },
    {
      name: "description",
      content: `Ikaleio - ${translations[language].heroTitle}`,
    },
  ];
}

export async function loader() {
  const repos = await fetchPinnedRepos();
  return { repos };
}

export default function Index() {
  const { repos } = useLoaderData<typeof loader>();

  return (
    <>
      <ShaderBackground />
      <NavHeader />
      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection repos={repos} />
        <ContactSection />
      </main>
    </>
  );
}
