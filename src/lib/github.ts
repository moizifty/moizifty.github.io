export interface PinnedRepo {
	name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	language: string | null;
}

const GITHUB_USERNAME = 'moizifty';

const PINNED_ITEMS_QUERY = `
	query ($login: String!) {
		user(login: $login) {
			pinnedItems(first: 6, types: [REPOSITORY]) {
				nodes {
					... on Repository {
						name
						description
						url
						stargazerCount
						primaryLanguage {
							name
						}
					}
				}
			}
		}
	}
`;

let cachedRepos: Promise<PinnedRepo[]> | undefined;

async function fetchPinnedReposUncached(): Promise<PinnedRepo[]> {
	const token = process.env.GITHUB_TOKEN;

	if (!token) {
		console.warn(
			'GITHUB_TOKEN is not set — skipping pinned repos fetch. Set GITHUB_TOKEN (a GitHub personal access token) to fetch pinned repos.'
		);
		return [];
	}

	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'User-Agent': 'astro-build',
		},
		body: JSON.stringify({ query: PINNED_ITEMS_QUERY, variables: { login: GITHUB_USERNAME } }),
	});

	if (!res.ok) {
		console.warn(`GitHub GraphQL request failed: ${res.status} ${res.statusText}`);
		return [];
	}

	const json = await res.json();
	const nodes = json?.data?.user?.pinnedItems?.nodes ?? [];

	return nodes.map((node: any) => ({
		name: node.name,
		description: node.description,
		html_url: node.url,
		stargazers_count: node.stargazerCount,
		language: node.primaryLanguage?.name ?? null,
	}));
}

export function fetchPinnedRepos(): Promise<PinnedRepo[]> {
	cachedRepos ??= fetchPinnedReposUncached();
	return cachedRepos;
}
