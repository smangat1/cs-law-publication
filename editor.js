if (!window.HBAuth?.renderStudioGate()) {
  const form = document.getElementById("piece-form");
  const pieceIdInput = document.getElementById("piece-id");
  const titleInput = document.getElementById("piece-title");
  const typeInput = document.getElementById("piece-type");
  const categoryInput = document.getElementById("piece-category");
  const readTimeOutput = document.getElementById("piece-read-time");
  const authorInput = document.getElementById("piece-author");
  const publishedAtInput = document.getElementById("piece-published-at");
  const statusInput = document.getElementById("piece-status");
  const dekInput = document.getElementById("piece-dek");
  const bodyInput = document.getElementById("piece-body");
  const issueInput = document.getElementById("piece-issue");
  const thumbnailInput = document.getElementById("piece-thumbnail");
  const thumbnailNote = document.getElementById("thumbnail-note");
  const editorStatusNote = document.getElementById("editor-status-note");
  const editorStatusPill = document.getElementById("editor-status-pill");
  const previewCard = document.getElementById("preview-card");
  const previewArticle = document.getElementById("preview-article");
  const previewPanel = document.getElementById("preview-panel");
  const coverPreview = document.getElementById("studio-cover-preview");
  const savedPieces = document.getElementById("saved-pieces");
  const savePieceButton = document.getElementById("save-piece-button");
  const deletePieceButton = document.getElementById("delete-piece-button");
  const newPieceButton = document.getElementById("new-piece-button");
  const exportContentButton = document.getElementById("export-content-button");
  const togglePreviewButton = document.getElementById("toggle-preview-button");
  const toolButtons = document.querySelectorAll(".studio-tool");

  let thumbnailData = "";
  let previewOpen = false;

  function bodyToText(blocks) {
    return (blocks || [])
      .map((block) => {
        if (block.type === "heading") {
          return `## ${block.text}`;
        }

        if (block.type === "quote") {
          return `> ${block.text}`;
        }

        return block.text || "";
      })
      .join("\n\n");
  }

  function textToBlocks(value) {
    return value
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => {
        if (text.startsWith("## ")) {
          return { type: "heading", text: text.slice(3).trim() };
        }

        if (text.startsWith("> ")) {
          return { type: "quote", text: text.slice(2).trim() };
        }

        return { type: "paragraph", text };
      });
  }

  function estimateReadTime(blocks) {
    return window.HBContent.estimateReadTime(blocks);
  }

  function syncReadTime(blocks = textToBlocks(bodyInput.value)) {
    readTimeOutput.textContent = estimateReadTime(blocks);
    return readTimeOutput.textContent;
  }

  function setPreviewState(nextState) {
    previewOpen = nextState;
    previewPanel.hidden = !previewOpen;
    togglePreviewButton.textContent = previewOpen ? "Hide preview" : "Preview";
  }

  function updateStatusUI(piece = null) {
    const status = piece?.status || statusInput.value || "draft";
    editorStatusPill.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    editorStatusPill.dataset.status = status;
  }

  function setEditorMode(piece = null) {
    if (!piece) {
      pieceIdInput.value = "";
      editorStatusNote.textContent = "Creating a new local piece.";
      savePieceButton.textContent = "Save draft";
      deletePieceButton.hidden = true;
      updateStatusUI({ status: statusInput.value });
      return;
    }

    editorStatusNote.textContent = `Editing local ${piece.status} piece: ${piece.title}`;
    savePieceButton.textContent = piece.status === "published" ? "Update published piece" : "Save draft";
    deletePieceButton.hidden = false;
    updateStatusUI(piece);
  }

  function renderCoverPreview() {
    if (!thumbnailData) {
      coverPreview.hidden = true;
      coverPreview.style.backgroundImage = "";
      return;
    }

    coverPreview.hidden = false;
    coverPreview.style.backgroundImage = `url("${thumbnailData}")`;
  }

  function resetForm() {
    form.reset();
    pieceIdInput.value = "";
    thumbnailData = "";
    statusInput.value = "draft";
    publishedAtInput.value = new Date().toISOString().slice(0, 10);
    thumbnailNote.textContent = "Recommended: 1200 x 630.";
    renderCoverPreview();
    syncReadTime([]);
    setEditorMode();
    updatePreview();
  }

  function getDraftPiece() {
    const blocks = textToBlocks(bodyInput.value);

    return {
      id: pieceIdInput.value || window.HBContent.buildPieceId(titleInput.value || "piece"),
      title: titleInput.value || "Untitled piece",
      slug: "",
      type: typeInput.value,
      status: statusInput.value,
      author: authorInput.value || "HB Desk",
      publishedAt: publishedAtInput.value || new Date().toISOString().slice(0, 10),
      category: categoryInput.value || "Category",
      readTime: syncReadTime(blocks),
      dek: dekInput.value || "Add a subtitle...",
      summary: dekInput.value || "Add a subtitle...",
      blocks,
      issueId: issueInput.value.trim() || "",
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
    updateStatusUI(piece);
    renderOutsidePreview(piece);
    renderInsidePreview(piece);
  }

  function populateForm(piece) {
    pieceIdInput.value = piece.id;
    titleInput.value = piece.title;
    typeInput.value = piece.type;
    categoryInput.value = piece.category;
    authorInput.value = piece.author;
    publishedAtInput.value = piece.publishedAt;
    statusInput.value = piece.status;
    dekInput.value = piece.dek;
    bodyInput.value = bodyToText(piece.blocks);
    issueInput.value = piece.issueId || "";
    thumbnailData = piece.thumbnail || "";
    thumbnailNote.textContent = piece.thumbnail ? "Using the saved cover image." : "Recommended: 1200 x 630.";
    renderCoverPreview();
    syncReadTime(piece.blocks);
    setEditorMode(piece);
    updatePreview();
  }

  function buildStudioCard(piece) {
    const article = document.createElement("article");
    article.className = "studio-piece-card";

    const header = document.createElement("div");
    header.className = "studio-piece-head";
    header.innerHTML = `
      <div class="entry-meta">
        <span>${window.HBContent.typeLabel(piece.type)}</span>
        <span class="entry-rule" aria-hidden="true"></span>
        <span>${piece.status}</span>
        <span class="entry-rule" aria-hidden="true"></span>
        <span>${window.HBContent.formatDate(piece.publishedAt)}</span>
      </div>
    `;

    const title = document.createElement("button");
    title.type = "button";
    title.className = "studio-piece-link";
    title.textContent = piece.title;
    title.addEventListener("click", () => {
      populateForm(piece);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

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

    header.append(title);
    actions.append(editButton, publishButton, deleteButton);
    article.append(header);

    if (piece.thumbnail) {
      const thumb = document.createElement("div");
      thumb.className = "piece-thumb";
      thumb.style.backgroundImage = `url("${piece.thumbnail}")`;
      article.append(thumb);
    }

    article.append(dek, actions);
    return article;
  }

  function renderStudioPieces() {
    const pieces = window.HBContent.loadStudioPieces()
      .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));

    if (!pieces.length) {
      savedPieces.innerHTML = `
        <div class="studio-empty-state">
          <p class="eyebrow">No Local Pieces Yet</p>
          <h3>Studio is ready for a first draft.</h3>
          <p class="page-copy">Start writing above, then publish or export when the piece is ready to become part of the repo content source.</p>
        </div>
      `;
      return;
    }

    savedPieces.replaceChildren(...pieces.map(buildStudioCard));
  }

  function insertSnippet(snippet) {
    const start = bodyInput.selectionStart;
    const end = bodyInput.selectionEnd;
    const before = bodyInput.value.slice(0, start);
    const selection = bodyInput.value.slice(start, end);
    const after = bodyInput.value.slice(end);
    const content = selection ? snippet.replace("bold", selection).replace("italic", selection) : snippet;
    bodyInput.value = `${before}${content}${after}`;
    bodyInput.focus();
    bodyInput.selectionStart = bodyInput.selectionEnd = before.length + content.length;
    updatePreview();
  }

  thumbnailInput.addEventListener("change", async () => {
    const file = thumbnailInput.files && thumbnailInput.files[0];

    if (!file) {
      thumbnailData = "";
      thumbnailNote.textContent = "Recommended: 1200 x 630.";
      renderCoverPreview();
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
    thumbnailNote.textContent = `Loaded ${image.width} x ${image.height}. Recommended remains 1200 x 630.`;
    renderCoverPreview();
    updatePreview();
  });

  [titleInput, typeInput, categoryInput, authorInput, publishedAtInput, statusInput, dekInput, bodyInput, issueInput].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => insertSnippet(button.dataset.insert || ""));
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
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  togglePreviewButton.addEventListener("click", () => {
    setPreviewState(!previewOpen);
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
    setPreviewState(false);
    resetForm();
    renderStudioPieces();
  });
}
