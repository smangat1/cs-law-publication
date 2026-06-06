const form = document.getElementById("piece-form");
const pieceIdInput = document.getElementById("piece-id");
const titleInput = document.getElementById("piece-title");
const typeInput = document.getElementById("piece-type");
const categoryInput = document.getElementById("piece-category");
const readTimeInput = document.getElementById("piece-read-time");
const authorInput = document.getElementById("piece-author");
const publishedAtInput = document.getElementById("piece-published-at");
const statusInput = document.getElementById("piece-status");
const dekInput = document.getElementById("piece-dek");
const bodyInput = document.getElementById("piece-body");
const issueInput = document.getElementById("piece-issue");
const thumbnailInput = document.getElementById("piece-thumbnail");
const thumbnailNote = document.getElementById("thumbnail-note");
const editorStatusNote = document.getElementById("editor-status-note");
const previewCard = document.getElementById("preview-card");
const previewArticle = document.getElementById("preview-article");
const savedPieces = document.getElementById("saved-pieces");
const savePieceButton = document.getElementById("save-piece-button");
const deletePieceButton = document.getElementById("delete-piece-button");
const newPieceButton = document.getElementById("new-piece-button");
const exportContentButton = document.getElementById("export-content-button");

let thumbnailData = "";

function bodyToText(blocks) {
  return (blocks || [])
    .map((block) => block.text || "")
    .join("\n\n");
}

function textToBlocks(value) {
  return value
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", text }));
}

function setEditorMode(piece = null) {
  if (!piece) {
    pieceIdInput.value = "";
    editorStatusNote.textContent = "Creating a new local piece.";
    savePieceButton.textContent = "Save piece";
    deletePieceButton.hidden = true;
    return;
  }

  editorStatusNote.textContent = `Editing local ${piece.status} piece: ${piece.title}`;
  savePieceButton.textContent = "Update piece";
  deletePieceButton.hidden = false;
}

function resetForm() {
  form.reset();
  pieceIdInput.value = "";
  thumbnailData = "";
  statusInput.value = "draft";
  publishedAtInput.value = new Date().toISOString().slice(0, 10);
  thumbnailNote.textContent = "Recommended cover size: 1200 x 630. Other sizes will still preview, but may crop.";
  setEditorMode();
  updatePreview();
}

function getDraftPiece() {
  return {
    id: pieceIdInput.value || window.HBContent.buildPieceId(titleInput.value || "piece"),
    title: titleInput.value || "Untitled piece",
    slug: "",
    type: typeInput.value,
    status: statusInput.value,
    author: authorInput.value || "HB Desk",
    publishedAt: publishedAtInput.value || new Date().toISOString().slice(0, 10),
    category: categoryInput.value || "Category",
    readTime: readTimeInput.value || "8 min read",
    dek: dekInput.value || "Dek preview.",
    summary: dekInput.value || "Dek preview.",
    blocks: textToBlocks(bodyInput.value),
    issueId: issueInput.value.trim().toLowerCase().replace(/\s+/g, "-") || "",
    thumbnail: thumbnailData,
    featured: false
  };
}

function renderOutsidePreview(piece) {
  previewCard.innerHTML = "";

  const body = document.createElement("div");
  body.className = "featured-body";
  body.innerHTML = `
    <div class="entry-meta">
      <span>${window.HBContent.typeLabel(piece.type)}</span>
      <span class="entry-rule" aria-hidden="true"></span>
      <span>${piece.readTime}</span>
      <span class="entry-rule" aria-hidden="true"></span>
      <span>${piece.status}</span>
    </div>
    <h3>${piece.title}</h3>
    <p>${piece.dek}</p>
  `;

  if (piece.thumbnail) {
    const media = document.createElement("div");
    media.className = "featured-media";
    media.style.backgroundImage = `url("${piece.thumbnail}")`;
    previewCard.classList.remove("no-media");
    previewCard.append(media, body);
    return;
  }

  previewCard.classList.add("no-media");
  previewCard.append(body);
}

function renderInsidePreview(piece) {
  previewArticle.innerHTML = "";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = piece.category;

  const title = document.createElement("h1");
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.className = "lede";
  dek.textContent = piece.dek;

  const meta = document.createElement("div");
  meta.className = "meta-row";
  meta.innerHTML = `
    <span>${piece.author}</span>
    <span>${window.HBContent.formatDate(piece.publishedAt)}</span>
    <span>${piece.readTime}</span>
    <span>${piece.status}</span>
  `;

  previewArticle.append(eyebrow);

  if (piece.thumbnail) {
    const image = document.createElement("div");
    image.className = "piece-thumb piece-thumb-large";
    image.style.backgroundImage = `url("${piece.thumbnail}")`;
    previewArticle.append(image);
  }

  previewArticle.append(title, dek, meta);
}

function updatePreview() {
  const piece = getDraftPiece();
  renderOutsidePreview(piece);
  renderInsidePreview(piece);
}

function populateForm(piece) {
  pieceIdInput.value = piece.id;
  titleInput.value = piece.title;
  typeInput.value = piece.type;
  categoryInput.value = piece.category;
  readTimeInput.value = piece.readTime;
  authorInput.value = piece.author;
  publishedAtInput.value = piece.publishedAt;
  statusInput.value = piece.status;
  dekInput.value = piece.dek;
  bodyInput.value = bodyToText(piece.blocks);
  issueInput.value = piece.issueId || "";
  thumbnailData = piece.thumbnail || "";
  thumbnailNote.textContent = piece.thumbnail
    ? "Using the saved thumbnail for this piece."
    : "Recommended cover size: 1200 x 630. Other sizes will still preview, but may crop.";
  setEditorMode(piece);
  updatePreview();
}

function buildStudioCard(piece) {
  const article = document.createElement("article");
  article.className = "studio-piece-card";

  const header = document.createElement("div");
  header.className = "studio-piece-head";

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  meta.innerHTML = `
    <span>${window.HBContent.typeLabel(piece.type)}</span>
    <span class="entry-rule" aria-hidden="true"></span>
    <span>${piece.status}</span>
    <span class="entry-rule" aria-hidden="true"></span>
    <span>${window.HBContent.formatDate(piece.publishedAt)}</span>
  `;

  const title = document.createElement("a");
  title.href = window.HBContent.createHref(piece);
  title.className = "studio-piece-link";
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.className = "page-copy";
  dek.textContent = piece.dek;

  const actions = document.createElement("div");
  actions.className = "studio-piece-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "studio-button studio-button-secondary";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    populateForm(piece);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const publishButton = document.createElement("button");
  publishButton.type = "button";
  publishButton.className = "studio-button";
  publishButton.textContent = piece.status === "published" ? "Unpublish" : "Publish";
  publishButton.addEventListener("click", () => {
    window.HBContent.setPieceStatus(piece.id, piece.status === "published" ? "draft" : "published");
    renderStudioPieces();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "studio-button studio-button-danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    window.HBContent.deletePiece(piece.id);

    if (pieceIdInput.value === piece.id) {
      resetForm();
    }

    renderStudioPieces();
  });

  header.append(meta, title);
  actions.append(editButton, publishButton, deleteButton);
  article.append(header, dek, actions);

  if (piece.thumbnail) {
    const thumb = document.createElement("div");
    thumb.className = "piece-thumb";
    thumb.style.backgroundImage = `url("${piece.thumbnail}")`;
    article.insertBefore(thumb, dek);
  }

  return article;
}

function renderStudioPieces() {
  const pieces = window.HBContent.loadStudioPieces()
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));

  if (!pieces.length) {
    savedPieces.innerHTML = `
      <div class="studio-empty-state">
        <p class="eyebrow">No Local Pieces Yet</p>
        <h3>Studio is ready for drafts.</h3>
        <p class="page-copy">Create a piece above, then publish or export it when it is ready to become part of the repository content file.</p>
      </div>
    `;
    return;
  }

  savedPieces.replaceChildren(...pieces.map(buildStudioCard));
}

thumbnailInput.addEventListener("change", async () => {
  const file = thumbnailInput.files && thumbnailInput.files[0];

  if (!file) {
    thumbnailData = "";
    thumbnailNote.textContent = "Recommended cover size: 1200 x 630. Other sizes will still preview, but may crop.";
    updatePreview();
    return;
  }

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });

  thumbnailData = dataUrl;
  thumbnailNote.textContent = `Loaded ${image.width} x ${image.height}. Recommended cover size remains 1200 x 630.`;
  updatePreview();
});

[titleInput, typeInput, categoryInput, readTimeInput, authorInput, publishedAtInput, statusInput, dekInput, bodyInput, issueInput].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const piece = window.HBContent.savePiece(getDraftPiece());
  populateForm(piece);
  renderStudioPieces();
});

deletePieceButton.addEventListener("click", () => {
  if (!pieceIdInput.value) {
    return;
  }

  window.HBContent.deletePiece(pieceIdInput.value);
  resetForm();
  renderStudioPieces();
});

newPieceButton.addEventListener("click", () => {
  resetForm();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

exportContentButton.addEventListener("click", async () => {
  const payload = await window.HBContent.exportSiteData();
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hb-site-content.json";
  link.click();
  URL.revokeObjectURL(url);
});

window.HBContent.ready().then(() => {
  resetForm();
  renderStudioPieces();
});
