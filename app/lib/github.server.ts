export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  updatedAt: string;
}

export async function fetchGitHubProjects(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/Ikaleio/repos?sort=updated&per_page=6&type=owner",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ikaleio-homepage",
        },
      }
    );

    if (!res.ok) {
      console.error("GitHub API error:", res.status, res.statusText);
      return [];
    }

    const repos = await res.json();
    return repos
      .filter((repo: any) => !repo.fork && !repo.archived)
      .slice(0, 6)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        updatedAt: repo.updated_at,
      }));
  } catch (error) {
    console.error("Failed to fetch GitHub projects:", error);
    return [];
  }
}
