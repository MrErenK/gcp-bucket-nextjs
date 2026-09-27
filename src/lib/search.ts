type SearchQuery = {
  include: string[];
  exclude: string[];
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function parseSearchQuery(input: string): SearchQuery {
  const include: string[] = [];
  const exclude: string[] = [];
  const pattern = /"([^"]*)"|(\S+)/g;

  for (const match of input.matchAll(pattern)) {
    const phrase = match[1];
    const bare = match[2];

    if (phrase !== undefined) {
      const normalized = normalizeSearchText(phrase);
      if (normalized) include.push(normalized);
      continue;
    }

    const negated = bare.startsWith("-") && bare.length > 1;
    const normalized = normalizeSearchText(negated ? bare.slice(1) : bare);
    if (!normalized) continue;

    if (negated) exclude.push(normalized);
    else include.push(normalized);
  }

  return { include, exclude };
}

export function matchesSearch(haystack: string, input: string): boolean {
  const { include, exclude } = parseSearchQuery(input);
  if (include.length === 0 && exclude.length === 0) return true;

  for (const term of exclude) {
    if (haystack.includes(term)) return false;
  }

  for (const term of include) {
    if (!haystack.includes(term)) return false;
  }

  return true;
}
