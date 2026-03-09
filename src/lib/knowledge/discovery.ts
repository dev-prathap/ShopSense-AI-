type KnowledgeSourceType = "PRIVACY" | "SHIPPING" | "RETURNS" | "FAQ" | "CONTACT" | "CUSTOM";

const DISCOVERY_TIMEOUT = 15000;

interface DiscoveredSource {
  type: KnowledgeSourceType;
  url: string;
}

const TYPE_PATTERNS: Array<{ type: KnowledgeSourceType; patterns: string[] }> = [
  { type: "PRIVACY", patterns: ["privacy", "policy"] },
  { type: "SHIPPING", patterns: ["shipping", "delivery", "shipping-policy"] },
  { type: "RETURNS", patterns: ["return", "refund", "returns-policy"] },
  { type: "FAQ", patterns: ["faq", "frequently-asked", "help-center"] },
  { type: "CONTACT", patterns: ["contact", "support", "about-us"] }
];

export async function discoverKnowledgeSources(rootUrl: string): Promise<DiscoveredSource[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT);

  try {
    const res = await fetch(rootUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "user-agent": "AI-Sales-Agent-DiscoveryBot/1.0"
      }
    });

    if (!res.ok) {
      throw new Error(`discovery_failed_${res.status}`);
    }

    const html = await res.text();
    const links = extractLinks(html, rootUrl);
    
    const discovered: DiscoveredSource[] = [];
    const seenTypes = new Set<KnowledgeSourceType>();

    // Rank links and find matches
    for (const link of links) {
      const urlLower = link.toLowerCase();
      
      for (const mapping of TYPE_PATTERNS) {
        if (seenTypes.has(mapping.type)) continue;

        if (mapping.patterns.some(p => urlLower.includes(p))) {
          discovered.push({
            type: mapping.type,
            url: link
          });
          seenTypes.add(mapping.type);
          break;
        }
      }
    }

    return discovered;
  } finally {
    clearTimeout(timeout);
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
  let match;
  
  const base = new URL(baseUrl);

  while ((match = regex.exec(html)) !== null) {
    let href = match[2];
    if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) continue;

    try {
      const absoluteUrl = new URL(href, baseUrl);
      // Only include links from the same domain
      if (absoluteUrl.hostname === base.hostname) {
        links.push(absoluteUrl.toString());
      }
    } catch {
      // Ignore invalid URLs
    }
  }

  // Deduplicate and filter out very short links
  return Array.from(new Set(links)).filter(l => l.length > baseUrl.length);
}
