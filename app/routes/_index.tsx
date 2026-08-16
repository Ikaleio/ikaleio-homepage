import type { Route } from "./+types/_index";
import { useLoaderData } from "react-router";
import { fetchGitHubProjects } from "~/lib/github.server";
import { NavHeader } from "~/components/nav-header";
import { HeroSection } from "~/components/hero-section";
import { ProjectsSection } from "~/components/projects-section";
import { ContactSection } from "~/components/contact-section";
import { ShaderBackground } from "~/components/shader-background";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ikaleio" },
    { name: "description", content: "Ikaleio - Independent Developer" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const repos = await fetchGitHubProjects();
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
