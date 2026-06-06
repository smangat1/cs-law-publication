const HB_STORAGE_KEY = "hb_custom_pieces_v1";

const HB_SAMPLE_PIECES = [
  {
    id: "sample-model-opacity",
    title: "When Model Opacity Becomes a Due Process Problem",
    type: "article",
    author: "HB Staff Draft",
    publishedAt: "2026-06-01",
    category: "Procedure and AI",
    readTime: "8 min read",
    dek: "A draft essay on how inscrutable automated decisions move from technical inconvenience into procedural harm.",
    body: [
      "Institutions increasingly route consequential judgments through automated systems while preserving the rhetoric of human review.",
      "That mismatch matters because due process is not only about the final answer. It is also about legibility."
    ],
    thumbnail: "",
    href: "articles/model-opacity.html",
    issue: "Issue 001",
    featured: true
  },
  {
    id: "sample-scraping-consent",
    title: "Scraping, Consent, and the New Public Access Fights",
    type: "essay",
    author: "HB Notes",
    publishedAt: "2026-05-29",
    category: "Access and Extraction",
    readTime: "6 min read",
    dek: "Notes on data extraction, contractual fences, and why public online space keeps shrinking under private ordering.",
    body: [
      "A recurring mistake in public debate is to treat availability and permission as the same thing.",
      "Scraping cases sit at the center of a contradiction about who gets to structure knowledge once information leaves a single interface."
    ],
    thumbnail: "",
    href: "articles/scraping-consent.html",
    issue: "Issue 001",
    featured: true
  },
  {
    id: "sample-law-school-ai",
    title: "Law School AI Policies Are Becoming Shadow Curricula",
    type: "article",
    author: "HB Commentary",
    publishedAt: "2026-05-23",
    category: "Education and Practice",
    readTime: "7 min read",
    dek: "A look at how classroom restrictions and permissions shape students' practical understanding of authorship, delegation, and trust.",
    body: [
      "Every AI policy in a classroom teaches more than it says.",
      "Law schools are not just regulating a tool. They are implicitly training future lawyers how to think about delegation and responsibility."
    ],
    thumbnail: "",
    href: "articles/law-school-ai.html",
    issue: "Issue 001",
    featured: true
  },
  {
    id: "sample-moderation-audit",
    title: "Content Moderation Needs an Audit Trail, Not a Press Release",
    type: "essay",
    author: "HB Staff Argument",
    publishedAt: "2026-05-17",
    category: "Governance Records",
    readTime: "7 min read",
    dek: "Sketching a publication-ready argument for traceable enforcement, appellate structure, and procedural memory in platform governance.",
    body: [
      "Moderation systems are often discussed as if they were pure scale problems.",
      "Without a durable trail, a platform cannot tell the difference between a hard case, a repeated error, and a forgotten controversy."
    ],
    thumbnail: "",
    href: "articles/moderation-audit-trail.html",
    issue: "Issue 001",
    featured: true
  }
];

function hbLoadCustomPieces() {
  try {
    const raw = localStorage.getItem(HB_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(hbNormalizePiece) : [];
  } catch (error) {
    return [];
  }
}

function hbSaveCustomPieces(pieces) {
  localStorage.setItem(HB_STORAGE_KEY, JSON.stringify(pieces));
}

function hbGetAllPieces() {
  return [...hbLoadCustomPieces(), ...HB_SAMPLE_PIECES].map(hbNormalizePiece);
}

function hbGetPieceById(id) {
  return hbGetAllPieces().find((piece) => piece.id === id) || null;
}

function hbCreatePieceHref(piece) {
  return piece.href || `piece.html?id=${encodeURIComponent(piece.id)}`;
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

function hbNormalizePiece(piece) {
  return {
    ...piece,
    author: piece.author || "HB Desk",
    publishedAt: piece.publishedAt || new Date().toISOString().slice(0, 10),
    body: Array.isArray(piece.body) ? piece.body : []
  };
}

function hbGetRelatedPieces(piece, limit = 3) {
  return hbGetAllPieces()
    .filter((candidate) => candidate.id !== piece.id)
    .sort((left, right) => {
      const leftScore = Number(left.category === piece.category) + Number(left.type === piece.type);
      const rightScore = Number(right.category === piece.category) + Number(right.type === piece.type);

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return String(right.publishedAt).localeCompare(String(left.publishedAt));
    })
    .slice(0, limit);
}

window.HBContent = {
  createHref: hbCreatePieceHref,
  formatDate: hbFormatDate,
  getAllPieces: hbGetAllPieces,
  getById: hbGetPieceById,
  getRelatedPieces: hbGetRelatedPieces,
  loadCustomPieces: hbLoadCustomPieces,
  saveCustomPieces: hbSaveCustomPieces,
  typeLabel: hbTypeLabel
};
