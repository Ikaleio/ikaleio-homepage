export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: { name: string; color: string | null } | null;
}

interface PinnedReposResponse {
  data?: {
    user: {
      pinnedItems: {
        nodes: Array<{
          name: string;
          description: string | null;
          url: string;
          stargazerCount: number;
          primaryLanguage: GitHubRepo["language"];
        }>;
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const PINNED_REPOS_QUERY = `
  query {
    user(login: "Ikaleio") {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            primaryLanguage { name color }
          }
        }
      }
    }
  }
`;

const CACHE_TTL_MS = 60 * 60 * 1000;

let cache: { repos: GitHubRepo[]; expiresAt: number } | null = null;

// Mirrors the repositories pinned on the GitHub profile, so curation happens on GitHub.
export async function fetchPinnedRepos(): Promise<GitHubRepo[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.repos;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN is not set; skipping pinned repositories");
    return [];
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "ikaleio-homepage",
      },
      body: JSON.stringify({ query: PINNED_REPOS_QUERY }),
    });

    if (!res.ok) {
      console.error("GitHub API error:", res.status, res.statusText);
      return [];
    }

    const { data, errors }: PinnedReposResponse = await res.json();
    if (errors?.length || !data?.user) {
      console.error("GitHub GraphQL error:", errors);
      return [];
    }

    const repos = data.user.pinnedItems.nodes.map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stargazerCount,
      language: repo.primaryLanguage,
    }));
    cache = { repos, expiresAt: Date.now() + CACHE_TTL_MS };
    return repos;
  } catch (error) {
    console.error("Failed to fetch pinned repositories:", error);
    return [];
  }
}
