const pieceRoot = document.getElementById("piece-view");
const params = new URLSearchParams(window.location.search);
const pieceId = params.get("id");

function renderMissing() {
  pieceRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Missing Piece</p>
      <h1>This piece could not be found.</h1>
      <p class="lede">Return to the archive or create a new one in Studio.</p>
    </section>
  `;
}

function renderBodyBlock(block, body) {
  if (block.type === "heading") {
    const heading = document.createElement("h2");
    heading.textContent = block.text;
    body.appendChild(heading);
    return;
  }

  if (block.type === "quote") {
    const quote = document.createElement("div");
    quote.className = "pull-quote";
    quote.textContent = block.text;
    body.appendChild(quote);
    return;
  }

  const paragraph = document.createElement("p");
  paragraph.className = "page-copy";
  paragraph.textContent = block.text;
  body.appendChild(paragraph);
}

async function renderPiece() {
  const piece = pieceId ? await window.HBContent.getById(pieceId) : null;

  if (!pieceRoot || !piece) {
    renderMissing();
    return;
  }

  const wrapper = document.createElement("div");
  const hero = document.createElement("section");
  hero.className = "page-hero";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = piece.category;

  const title = document.createElement("h1");
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.className = "lede";
  dek.textContent = piece.dek;

  const cover = document.createElement("div");
  cover.className = piece.thumbnail ? "piece-thumb piece-thumb-large" : "piece-cover";

  if (piece.thumbnail) {
    cover.style.backgroundImage = `url("${piece.thumbnail}")`;
  } else {
    cover.innerHTML = `
      <span class="piece-cover-kicker">${window.HBContent.typeLabel(piece.type)}</span>
      <strong>${piece.category}</strong>
      <span class="piece-cover-tag">HB / ${window.HBContent.formatDate(piece.publishedAt)}</span>
    `;
  }

  const authorBlock = document.createElement("div");
  authorBlock.className = "article-header-meta";
  authorBlock.innerHTML = `
    <div>
      <span class="meta-label">Byline</span>
      <p>${piece.author}</p>
    </div>
    <div>
      <span class="meta-label">Published</span>
      <p>${window.HBContent.formatDate(piece.publishedAt)}</p>
    </div>
    <div>
      <span class="meta-label">Section</span>
      <p>${piece.issueId ? `Issue ${piece.issueId.replace("issue-", "").padStart(3, "0")}` : "Standalone piece"}</p>
    </div>
  `;

  const meta = document.createElement("div");
  meta.className = "meta-row article-meta-row";
  meta.innerHTML = `
    <span>${window.HBContent.typeLabel(piece.type)}</span>
    <span>${piece.category}</span>
    <span>${piece.readTime}</span>
    <span>${piece.status}</span>
  `;

  hero.append(eyebrow, title, dek, cover, authorBlock, meta);

  const body = document.createElement("section");
  body.className = "page-section";
  piece.blocks.forEach((block) => renderBodyBlock(block, body));

  const relatedSection = document.createElement("section");
  relatedSection.className = "page-section related-reading";

  const relatedEyebrow = document.createElement("p");
  relatedEyebrow.className = "eyebrow";
  relatedEyebrow.textContent = "Related Reading";

  const relatedTitle = document.createElement("h2");
  relatedTitle.textContent = "Keep reading inside the same desk.";

  const relatedGrid = document.createElement("div");
  relatedGrid.className = "piece-grid related-grid";

  const relatedPieces = await window.HBContent.getRelatedPieces(piece);

  relatedPieces.forEach((relatedPiece) => {
    const card = document.createElement("a");
    card.className = "piece-card related-card";
    card.href = window.HBContent.createHref(relatedPiece);

    const label = document.createElement("span");
    label.className = "panel-label";
    label.textContent = `${window.HBContent.typeLabel(relatedPiece.type)} / ${relatedPiece.readTime}`;

    const relatedTitle = document.createElement("h3");
    relatedTitle.textContent = relatedPiece.title;

    const relatedDek = document.createElement("p");
    relatedDek.textContent = relatedPiece.dek;

    if (relatedPiece.thumbnail) {
      const thumb = document.createElement("div");
      thumb.className = "piece-thumb";
      thumb.style.backgroundImage = `url("${relatedPiece.thumbnail}")`;
      card.append(label, thumb, relatedTitle, relatedDek);
    } else {
      card.append(label, relatedTitle, relatedDek);
    }

    relatedGrid.appendChild(card);
  });

  relatedSection.append(relatedEyebrow, relatedTitle, relatedGrid);
  wrapper.append(hero, body, relatedSection);
  pieceRoot.replaceChildren(wrapper);
  document.title = `${piece.title} | HB`;
}

window.HBContent.ready().then(renderPiece);
