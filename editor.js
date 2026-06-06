const form = document.getElementById("piece-form");
const titleInput = document.getElementById("piece-title");
const typeInput = document.getElementById("piece-type");
const categoryInput = document.getElementById("piece-category");
const readTimeInput = document.getElementById("piece-read-time");
const authorInput = document.getElementById("piece-author");
const publishedAtInput = document.getElementById("piece-published-at");
const dekInput = document.getElementById("piece-dek");
const bodyInput = document.getElementById("piece-body");
const issueInput = document.getElementById("piece-issue");
const thumbnailInput = document.getElementById("piece-thumbnail");
const thumbnailNote = document.getElementById("thumbnail-note");
const previewCard = document.getElementById("preview-card");
const previewArticle = document.getElementById("preview-article");
const savedPieces = document.getElementById("saved-pieces");

let thumbnailData = "";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getDraftPiece() {
  return {
    id: `custom-${slugify(titleInput.value || "piece")}-${Date.now()}`,
    title: titleInput.value || "Untitled piece",
    type: typeInput.value,
    author: authorInput.value || "HB Desk",
    publishedAt: publishedAtInput.value || new Date().toISOString().slice(0, 10),
    category: categoryInput.value || "Category",
    readTime: readTimeInput.value || "8 min read",
    dek: dekInput.value || "Dek preview.",
    body: bodyInput.value.split(/\n\s*\n/).filter(Boolean),
    issue: issueInput.value || "",
    thumbnail: thumbnailData,
    href: ""
  };
}

function renderOutsidePreview(piece) {
  previewCard.innerHTML = "";

  const media = document.createElement("div");
  media.className = "featured-media";
  if (piece.thumbnail) {
    media.style.backgroundImage = `url("${piece.thumbnail}")`;
  }

  const body = document.createElement("div");
  body.className = "featured-body";
  body.innerHTML = `
    <div class="entry-meta">
      <span>${window.HBContent.typeLabel(piece.type)}</span>
      <span class="entry-rule" aria-hidden="true"></span>
      <span>${piece.readTime}</span>
    </div>
    <h3>${piece.title}</h3>
    <p>${piece.dek}</p>
  `;

  previewCard.append(media, body);
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

function renderSavedPieces() {
  const pieces = window.HBContent.loadCustomPieces();
  savedPieces.replaceChildren(...pieces.map((piece) => {
    const card = document.createElement("a");
    card.className = "piece-card";
    card.href = window.HBContent.createHref(piece);

    const label = document.createElement("span");
    label.className = "panel-label";
    label.textContent = piece.readTime;

    const title = document.createElement("h3");
    title.textContent = piece.title;

    if (piece.thumbnail) {
      const thumb = document.createElement("div");
      thumb.className = "piece-thumb";
      thumb.style.backgroundImage = `url("${piece.thumbnail}")`;
      card.append(label, thumb, title);
    } else {
      card.append(label, title);
    }

    return card;
  }));
}

function updatePreview() {
  const piece = getDraftPiece();
  renderOutsidePreview(piece);
  renderInsidePreview(piece);
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

[titleInput, typeInput, categoryInput, readTimeInput, authorInput, publishedAtInput, dekInput, bodyInput, issueInput].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const piece = {
    ...getDraftPiece(),
    id: `custom-${slugify(titleInput.value)}-${Date.now()}`
  };

  const pieces = window.HBContent.loadCustomPieces();
  pieces.unshift(piece);
  window.HBContent.saveCustomPieces(pieces);
  form.reset();
  thumbnailData = "";
  publishedAtInput.value = "";
  thumbnailNote.textContent = "Saved. Recommended cover size: 1200 x 630.";
  renderSavedPieces();
  updatePreview();
});

updatePreview();
renderSavedPieces();
