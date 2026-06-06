const HB_RUNTIME_ROOT_URL = new URL(".", new URL(document.currentScript.src, window.location.href));
const HB_CONTENT_SOURCE_URL = new URL("content/site-content.json", HB_RUNTIME_ROOT_URL).href;

const HB_DEFAULT_SITE = {
  title: "HB",
  tagline: "a loosely bound tech law publication",
  description: "HB is a loosely bound tech law publication about governance, procedure, institutional design, and the legal edges of technical systems.",
  url: "https://smangat1.github.io/cs-law-publication/",
  themeColor: "#f4efe6",
  defaultOgImage: "og-default.svg",
  analytics: {
    endpoint: ""
  }
};

const HB_BLOCK_TYPES = new Set(["paragraph", "heading", "quote"]);
const HB_ISSUE_THEME_KEYS = ["bg", "bgDeep", "paper", "ink", "muted", "line", "lineStrong", "accent", "surface"];

let hbContentPromise;
let hbContentCache;

function hbSlugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function hbAbsoluteRuntimeUrl(path = "") {
  return new URL(path, HB_RUNTIME_ROOT_URL).href;
}

function hbAbsolutePublicUrl(path = "") {
  const base = hbContentCache?.site?.url || HB_DEFAULT_SITE.url;
  return new URL(path, base).href;
}

function hbResolveAssetUrl(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).href;
  } catch (error) {
    return hbAbsoluteRuntimeUrl(value.replace(/^\.\//, ""));
  }
}

function hbResolvePublicAssetUrl(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).href;
  } catch (error) {
    return hbAbsolutePublicUrl(value.replace(/^\.\//, ""));
  }
}

function hbNormalizeBlocks(blocks, body) {
  if (Array.isArray(blocks) && blocks.length) {
    return blocks
      .map((block) => ({
        type: HB_BLOCK_TYPES.has(block?.type) ? block.type : "paragraph",
        text: String(block?.text || "").trim()
      }))
      .filter((block) => block.text);
  }

  if (Array.isArray(body) && body.length) {
    return body
      .map((text) => String(text || "").trim())
      .filter(Boolean)
      .map((text) => ({ type: "paragraph", text }));
  }

  return [];
}

function hbCountWords(blocks) {
  return blocks
    .map((block) => String(block.text || "").trim())
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function hbEstimateReadTime(blocks) {
  const wordCount = hbCountWords(blocks);

  if (!wordCount) {
    return "1 min read";
  }

  const fast = Math.max(1, Math.ceil(wordCount / 275));
  const slow = Math.max(1, Math.ceil(wordCount / 200));
  return fast === slow ? `${fast} min read` : `${fast}-${slow} min read`;
}

function hbNormalizePiece(piece) {
  const blocks = hbNormalizeBlocks(piece.blocks, piece.body);
  const publishedAt = piece.publishedAt || new Date().toISOString().slice(0, 10);

  return {
    ...piece,
    id: piece.id || `piece-${Date.now()}`,
    slug: piece.slug || hbSlugify(piece.title || piece.id || "piece"),
    type: piece.type === "essay" ? "essay" : "article",
    status: piece.status || "draft",
    title: String(piece.title || "Untitled piece").trim(),
    author: String(piece.author || "HB Desk").trim(),
    publishedAt,
    category: String(piece.category || "Category").trim(),
    readTime: hbEstimateReadTime(blocks),
    dek: String(piece.dek || "").trim(),
    summary: String(piece.summary || piece.dek || "").trim(),
    issueId: piece.issueId || "",
    featured: Boolean(piece.featured),
    thumbnail: hbResolveAssetUrl(piece.thumbnail || ""),
    thumbnailPublicUrl: hbResolvePublicAssetUrl(piece.thumbnail || ""),
    ogImage: hbResolveAssetUrl(piece.ogImage || piece.thumbnail || ""),
    ogImagePublicUrl: hbResolvePublicAssetUrl(piece.ogImage || piece.thumbnail || ""),
    relatedIds: Array.isArray(piece.relatedIds) ? piece.relatedIds : [],
    blocks,
    body: blocks.filter((block) => block.type === "paragraph").map((block) => block.text)
  };
}

function hbNormalizeIssue(issue) {
  const theme = typeof issue.theme === "object" && issue.theme ? issue.theme : {};

  return {
    ...issue,
    id: issue.id || `issue-${Date.now()}`,
    label: String(issue.label || "Issue").trim(),
    title: String(issue.title || "Untitled issue").trim(),
    slug: issue.slug || hbSlugify(issue.title || issue.id || "issue"),
    path: issue.path || `issues/${issue.slug || hbSlugify(issue.title || issue.id || "issue")}.html`,
    status: issue.status || "draft",
    publishedAt: issue.publishedAt || new Date().toISOString().slice(0, 10),
    dek: String(issue.dek || "").trim(),
    editorNote: String(issue.editorNote || "").trim(),
    coverImage: hbResolveAssetUrl(issue.coverImage || ""),
    coverImagePublicUrl: hbResolvePublicAssetUrl(issue.coverImage || ""),
    ogImage: hbResolveAssetUrl(issue.ogImage || issue.coverImage || ""),
    ogImagePublicUrl: hbResolvePublicAssetUrl(issue.ogImage || issue.coverImage || ""),
    layout: issue.layout || "default",
    pieceIds: Array.isArray(issue.pieceIds) ? issue.pieceIds : [],
    theme: {
      slug: theme.slug || hbSlugify(issue.title || issue.id || "issue"),
      bg: theme.bg || "",
      bgDeep: theme.bgDeep || "",
      paper: theme.paper || "",
      ink: theme.ink || "",
      muted: theme.muted || "",
      line: theme.line || "",
      lineStrong: theme.lineStrong || "",
      accent: theme.accent || "",
      surface: theme.surface || ""
    }
  };
}

function hbNormalizeSite(site) {
  return {
    ...HB_DEFAULT_SITE,
    ...(site || {}),
    defaultOgImage: hbResolvePublicAssetUrl(site?.defaultOgImage || HB_DEFAULT_SITE.defaultOgImage),
    analytics: {
      ...HB_DEFAULT_SITE.analytics,
      ...(site?.analytics || {})
    }
  };
}

async function hbLoadContent() {
  if (!hbContentPromise) {
    hbContentPromise = fetch(HB_CONTENT_SOURCE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load HB content: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        const content = {
          site: hbNormalizeSite(data.site),
          issues: Array.isArray(data.issues) ? data.issues.map(hbNormalizeIssue) : [],
          pieces: Array.isArray(data.pieces) ? data.pieces.map(hbNormalizePiece) : []
        };
        hbContentCache = content;
        return content;
      })
      .catch(() => {
        const fallback = {
          site: hbNormalizeSite(),
          issues: [],
          pieces: []
        };
        hbContentCache = fallback;
        return fallback;
      });
  }

  return hbContentPromise;
}

function hbFormatDate(value) {
  if (!value) {
    return "Unscheduled";
  }

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function hbTypeLabel(type) {
  if (type === "essay") {
    return "Essay";
  }

  if (type === "issue") {
    return "Issue";
  }

  return "Article";
}

function hbCreatePieceHref(piece) {
  return hbAbsoluteRuntimeUrl(`piece.html?id=${encodeURIComponent(piece.id)}`);
}

function hbCreatePiecePublicUrl(piece) {
  return hbAbsolutePublicUrl(`piece.html?id=${encodeURIComponent(piece.id)}`);
}

function hbCreateIssueHref(issue) {
  const path = issue?.path || `issues/${issue?.slug || "issue"}.html`;
  return hbAbsoluteRuntimeUrl(path);
}

function hbCreateIssuePublicUrl(issue) {
  const path = issue?.path || `issues/${issue?.slug || "issue"}.html`;
  return hbAbsolutePublicUrl(path);
}

function hbCreateTopicHref(topic) {
  return hbAbsoluteRuntimeUrl(`topic.html?name=${encodeURIComponent(topic)}`);
}

function hbCreateTopicPublicUrl(topic) {
  return hbAbsolutePublicUrl(`topic.html?name=${encodeURIComponent(topic)}`);
}

function hbCreateAuthorHref(author) {
  return hbAbsoluteRuntimeUrl(`author.html?name=${encodeURIComponent(author)}`);
}

function hbCreateAuthorPublicUrl(author) {
  return hbAbsolutePublicUrl(`author.html?name=${encodeURIComponent(author)}`);
}

async function hbGetAllPieces(options = {}) {
  const { includeDrafts = false } = options;
  const content = await hbLoadContent();
  return content.pieces
    .filter((piece) => includeDrafts || piece.status === "published")
    .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
}

async function hbGetPieceById(id, options = {}) {
  const pieces = await hbGetAllPieces(options);
  return pieces.find((piece) => piece.id === id) || null;
}

async function hbGetIssues(options = {}) {
  const { includeDrafts = false } = options;
  const content = await hbLoadContent();
  return content.issues
    .filter((issue) => includeDrafts || issue.status === "published")
    .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
}

async function hbGetIssueById(id) {
  const issues = await hbGetIssues({ includeDrafts: true });
  return issues.find((issue) => issue.id === id) || null;
}

async function hbGetIssuePieces(issueId, options = {}) {
  const issue = await hbGetIssueById(issueId);
  if (!issue) {
    return [];
  }

  const lookup = new Map((await hbGetAllPieces(options)).map((piece) => [piece.id, piece]));
  return issue.pieceIds.map((pieceId) => lookup.get(pieceId)).filter(Boolean);
}

async function hbGetRelatedPieces(piece, limit = 3, options = {}) {
  const pieces = await hbGetAllPieces(options);
  const preferred = new Set(piece.relatedIds || []);

  return pieces
    .filter((candidate) => candidate.id !== piece.id)
    .sort((left, right) => {
      const leftScore = Number(preferred.has(left.id)) * 10 + Number(left.category === piece.category) + Number(left.type === piece.type);
      const rightScore = Number(preferred.has(right.id)) * 10 + Number(right.category === piece.category) + Number(right.type === piece.type);

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return String(right.publishedAt).localeCompare(String(left.publishedAt));
    })
    .slice(0, limit);
}

async function hbGetTopics(options = {}) {
  const pieces = await hbGetAllPieces(options);
  const counts = new Map();

  pieces.forEach((piece) => {
    if (piece.category) {
      counts.set(piece.category, (counts.get(piece.category) || 0) + 1);
    }
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function hbGetAuthors(options = {}) {
  const pieces = await hbGetAllPieces(options);
  const counts = new Map();

  pieces.forEach((piece) => {
    if (piece.author) {
      counts.set(piece.author, (counts.get(piece.author) || 0) + 1);
    }
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function hbGetPiecesByCategory(category, options = {}) {
  return (await hbGetAllPieces(options)).filter((piece) => piece.category === category);
}

async function hbGetPiecesByAuthor(author, options = {}) {
  return (await hbGetAllPieces(options)).filter((piece) => piece.author === author);
}

function hbUpsertMetaTag(selector, attributes) {
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      node.setAttribute(key, value);
    }
  });
}

function hbUpsertLink(selector, attributes) {
  let node = document.head.querySelector(selector);

  if (!node) {
    node = document.createElement("link");
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      node.setAttribute(key, value);
    }
  });
}

function hbSetDocumentMeta(options = {}) {
  const {
    title,
    description,
    type = "website",
    url,
    image,
    themeColor
  } = options;

  const site = hbContentCache?.site || HB_DEFAULT_SITE;
  const fullTitle = title ? `${title} | ${site.title}` : `${site.title} | ${site.tagline}`;
  const finalDescription = description || site.description;
  const finalUrl = url || hbAbsolutePublicUrl(window.location.pathname.replace(/^\//, "") + window.location.search);
  const finalImage = image || site.defaultOgImage || "";

  document.title = fullTitle;

  if (finalDescription) {
    hbUpsertMetaTag('meta[name="description"]', { name: "description", content: finalDescription });
    hbUpsertMetaTag('meta[property="og:description"]', { property: "og:description", content: finalDescription });
    hbUpsertMetaTag('meta[name="twitter:description"]', { name: "twitter:description", content: finalDescription });
  }

  hbUpsertMetaTag('meta[property="og:title"]', { property: "og:title", content: fullTitle });
  hbUpsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
  hbUpsertMetaTag('meta[property="og:type"]', { property: "og:type", content: type });
  hbUpsertMetaTag('meta[property="og:url"]', { property: "og:url", content: finalUrl });
  hbUpsertMetaTag('meta[property="og:site_name"]', { property: "og:site_name", content: site.title });
  hbUpsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card", content: finalImage ? "summary_large_image" : "summary" });
  hbUpsertLink('link[rel="canonical"]', { rel: "canonical", href: finalUrl });

  if (finalImage) {
    hbUpsertMetaTag('meta[property="og:image"]', { property: "og:image", content: finalImage });
    hbUpsertMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: finalImage });
  }

  const nextThemeColor = themeColor || site.themeColor;
  if (nextThemeColor) {
    hbUpsertMetaTag('meta[name="theme-color"]', { name: "theme-color", content: nextThemeColor });
  }
}

function hbClearIssueTheme() {
  document.body.classList.remove("issue-theme-active");
  document.body.removeAttribute("data-issue-theme");
  HB_ISSUE_THEME_KEYS.forEach((key) => {
    document.body.style.removeProperty(`--issue-${key}`);
  });
}

function hbApplyIssueTheme(issue) {
  hbClearIssueTheme();

  if (!issue?.theme) {
    return;
  }

  document.body.classList.add("issue-theme-active");
  document.body.dataset.issueTheme = issue.theme.slug || issue.slug || issue.id;

  HB_ISSUE_THEME_KEYS.forEach((key) => {
    if (issue.theme[key]) {
      document.body.style.setProperty(`--issue-${key}`, issue.theme[key]);
    }
  });
}

function hbTrackEvent(name, detail = {}) {
  const endpoint = hbContentCache?.site?.analytics?.endpoint || "";
  const payload = {
    name,
    detail,
    path: window.location.pathname + window.location.search,
    timestamp: new Date().toISOString()
  };

  if (endpoint) {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }
}

window.HBContent = {
  applyIssueTheme: hbApplyIssueTheme,
  clearIssueTheme: hbClearIssueTheme,
  createAuthorHref: hbCreateAuthorHref,
  createAuthorPublicUrl: hbCreateAuthorPublicUrl,
  createHref: hbCreatePieceHref,
  createIssueHref: hbCreateIssueHref,
  createIssuePublicUrl: hbCreateIssuePublicUrl,
  createPublicHref: hbCreatePiecePublicUrl,
  createTopicHref: hbCreateTopicHref,
  createTopicPublicUrl: hbCreateTopicPublicUrl,
  estimateReadTime: hbEstimateReadTime,
  formatDate: hbFormatDate,
  getAllPieces: hbGetAllPieces,
  getAuthors: hbGetAuthors,
  getById: hbGetPieceById,
  getIssueById: hbGetIssueById,
  getIssuePieces: hbGetIssuePieces,
  getIssues: hbGetIssues,
  getPiecesByAuthor: hbGetPiecesByAuthor,
  getPiecesByCategory: hbGetPiecesByCategory,
  getRelatedPieces: hbGetRelatedPieces,
  getSite: () => hbContentCache?.site || HB_DEFAULT_SITE,
  getTopics: hbGetTopics,
  ready: hbLoadContent,
  resolveAssetUrl: hbResolveAssetUrl,
  resolvePublicAssetUrl: hbResolvePublicAssetUrl,
  setMeta: hbSetDocumentMeta,
  trackEvent: hbTrackEvent,
  typeLabel: hbTypeLabel
};
