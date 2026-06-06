const HB_STUDIO_STORAGE_KEY = "hb_studio_pieces_v2";
const HB_SITE_ROOT_URL = new URL(".", new URL(document.currentScript.src, window.location.href));
const HB_CONTENT_SOURCE_URL = new URL("content/site-content.json", HB_SITE_ROOT_URL).href;

let hbBaseContentPromise;

function hbLoadBaseContent() {
  if (!hbBaseContentPromise) {
    hbBaseContentPromise = fetch(HB_CONTENT_SOURCE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load HB content: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => ({
        issues: Array.isArray(data.issues) ? data.issues.map(hbNormalizeIssue) : [],
        pieces: Array.isArray(data.pieces) ? data.pieces.map(hbNormalizePiece) : []
      }))
      .catch(() => ({
        issues: [],
        pieces: []
      }));
  }

  return hbBaseContentPromise;
}

function hbLoadStudioPieces() {
  try {
    const raw = localStorage.getItem(HB_STUDIO_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(hbNormalizePiece) : [];
  } catch (error) {
    return [];
  }
}

function hbSaveStudioPieces(pieces) {
  localStorage.setItem(HB_STUDIO_STORAGE_KEY, JSON.stringify(pieces));
}

function hbSlugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
  const publishedAt = piece.publishedAt || new Date().toISOString().slice(0, 10);
  const blocks = Array.isArray(piece.blocks) && piece.blocks.length
    ? piece.blocks
    : Array.isArray(piece.body)
      ? piece.body.map((text) => ({ type: "paragraph", text }))
      : [];

  return {
    ...piece,
    id: piece.id || `piece-${Date.now()}`,
    slug: piece.slug || hbSlugify(piece.title || piece.id || "piece"),
    type: piece.type || "article",
    status: piece.status || "draft",
    author: piece.author || "HB Desk",
    publishedAt,
    category: piece.category || "Category",
    readTime: hbEstimateReadTime(blocks),
    dek: piece.dek || "",
    summary: piece.summary || piece.dek || "",
    issueId: piece.issueId || "",
    featured: Boolean(piece.featured),
    thumbnail: piece.thumbnail || "",
    relatedIds: Array.isArray(piece.relatedIds) ? piece.relatedIds : [],
    blocks,
    body: blocks
      .filter((block) => block.type === "paragraph")
      .map((block) => block.text),
    origin: piece.origin || "base",
    updatedAt: piece.updatedAt || publishedAt
  };
}

function hbNormalizeIssue(issue) {
  return {
    ...issue,
    id: issue.id || `issue-${Date.now()}`,
    slug: issue.slug || hbSlugify(issue.title || issue.id || "issue"),
    status: issue.status || "draft",
    publishedAt: issue.publishedAt || new Date().toISOString().slice(0, 10),
    pieceIds: Array.isArray(issue.pieceIds) ? issue.pieceIds : []
  };
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
  return new URL(`piece.html?id=${encodeURIComponent(piece.id)}`, HB_SITE_ROOT_URL).href;
}

function hbCreateIssueHref(issue) {
  return new URL(`issues/issue-001.html?id=${encodeURIComponent(issue.id)}`, HB_SITE_ROOT_URL).href;
}

function hbCreateTopicHref(topic) {
  return new URL(`topic.html?name=${encodeURIComponent(topic)}`, HB_SITE_ROOT_URL).href;
}

function hbCreateAuthorHref(author) {
  return new URL(`author.html?name=${encodeURIComponent(author)}`, HB_SITE_ROOT_URL).href;
}

async function hbGetMergedContent() {
  const baseContent = await hbLoadBaseContent();
  const localPieces = hbLoadStudioPieces();
  const localById = new Map(localPieces.map((piece) => [piece.id, piece]));
  const mergedBasePieces = baseContent.pieces
    .map((piece) => localById.get(piece.id) || piece)
    .map(hbNormalizePiece);
  const localOnlyPieces = localPieces
    .filter((piece) => !baseContent.pieces.some((basePiece) => basePiece.id === piece.id))
    .map(hbNormalizePiece);

  return {
    issues: baseContent.issues.map(hbNormalizeIssue),
    pieces: [...localOnlyPieces, ...mergedBasePieces]
  };
}

async function hbGetAllPieces(options = {}) {
  const { includeDrafts = false } = options;
  const content = await hbGetMergedContent();
  return content.pieces
    .filter((piece) => includeDrafts || piece.status === "published")
    .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
}

async function hbGetPieceById(id, options = {}) {
  const { includeDrafts = true } = options;
  const pieces = await hbGetAllPieces({ includeDrafts });
  return pieces.find((piece) => piece.id === id) || null;
}

async function hbGetIssueById(id) {
  const content = await hbGetMergedContent();
  return content.issues.find((issue) => issue.id === id) || null;
}

async function hbGetIssues(options = {}) {
  const { includeDrafts = false } = options;
  const content = await hbGetMergedContent();
  return content.issues
    .filter((issue) => includeDrafts || issue.status === "published")
    .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
}

async function hbGetRelatedPieces(piece, limit = 3, options = {}) {
  const { includeDrafts = false } = options;
  const pieces = await hbGetAllPieces({ includeDrafts });
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

async function hbGetIssuePieces(issueId, options = {}) {
  const issue = await hbGetIssueById(issueId);

  if (!issue) {
    return [];
  }

  const lookup = new Map((await hbGetAllPieces(options)).map((piece) => [piece.id, piece]));
  return issue.pieceIds.map((pieceId) => lookup.get(pieceId)).filter(Boolean);
}

async function hbGetTopics(options = {}) {
  const pieces = await hbGetAllPieces(options);
  const counts = new Map();

  pieces.forEach((piece) => {
    if (!piece.category) {
      return;
    }

    counts.set(piece.category, (counts.get(piece.category) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function hbGetAuthors(options = {}) {
  const pieces = await hbGetAllPieces(options);
  const counts = new Map();

  pieces.forEach((piece) => {
    if (!piece.author) {
      return;
    }

    counts.set(piece.author, (counts.get(piece.author) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function hbGetPiecesByCategory(category, options = {}) {
  const pieces = await hbGetAllPieces(options);
  return pieces.filter((piece) => piece.category === category);
}

async function hbGetPiecesByAuthor(author, options = {}) {
  const pieces = await hbGetAllPieces(options);
  return pieces.filter((piece) => piece.author === author);
}

function hbBuildPieceId(title) {
  return `custom-${hbSlugify(title || "piece")}-${Date.now()}`;
}

function hbSavePiece(pieceInput) {
  const normalized = hbNormalizePiece({
    ...pieceInput,
    origin: "local",
    updatedAt: new Date().toISOString()
  });
  const pieces = hbLoadStudioPieces();
  const index = pieces.findIndex((piece) => piece.id === normalized.id);

  if (index >= 0) {
    pieces[index] = normalized;
  } else {
    pieces.unshift(normalized);
  }

  hbSaveStudioPieces(pieces);
  return normalized;
}

function hbDeletePiece(id) {
  const pieces = hbLoadStudioPieces().filter((piece) => piece.id !== id);
  hbSaveStudioPieces(pieces);
}

function hbSetPieceStatus(id, status) {
  const pieces = hbLoadStudioPieces();
  const index = pieces.findIndex((piece) => piece.id === id);

  if (index < 0) {
    return null;
  }

  pieces[index] = hbNormalizePiece({
    ...pieces[index],
    status,
    updatedAt: new Date().toISOString()
  });
  hbSaveStudioPieces(pieces);
  return pieces[index];
}

async function hbExportSiteData() {
  const baseContent = await hbLoadBaseContent();
  const localPieces = hbLoadStudioPieces().map((piece) => ({
    ...piece,
    blocks: piece.blocks
  }));

  const localById = new Map(localPieces.map((piece) => [piece.id, piece]));
  const mergedBasePieces = baseContent.pieces.map((piece) => localById.get(piece.id) || piece);
  const localOnlyPieces = localPieces.filter((piece) => !baseContent.pieces.some((basePiece) => basePiece.id === piece.id));

  return JSON.stringify(
    {
      issues: baseContent.issues,
      pieces: [...localOnlyPieces, ...mergedBasePieces]
    },
    null,
    2
  );
}

window.HBContent = {
  createAuthorHref: hbCreateAuthorHref,
  buildPieceId: hbBuildPieceId,
  createHref: hbCreatePieceHref,
  createIssueHref: hbCreateIssueHref,
  createTopicHref: hbCreateTopicHref,
  deletePiece: hbDeletePiece,
  estimateReadTime: hbEstimateReadTime,
  exportSiteData: hbExportSiteData,
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
  getTopics: hbGetTopics,
  loadStudioPieces: hbLoadStudioPieces,
  ready: hbLoadBaseContent,
  savePiece: hbSavePiece,
  setPieceStatus: hbSetPieceStatus,
  typeLabel: hbTypeLabel
};
