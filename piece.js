const pieceRoot = document.getElementById("piece-view");
const pieceParams = new URLSearchParams(window.location.search);
const pieceId = pieceParams.get("id");

function renderMissingPiece(message = "This piece could not be found.") {
  if (!pieceRoot) {
    return;
  }

  pieceRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Missing Piece</p>
      <h1>${message}</h1>
      <p class="lede">Return to the archive to keep reading across articles, essays, and issues.</p>
      <div class="link-list">
        <a href="archive.html">Browse the archive</a>
        <a href="about.html">Read the editorial note</a>
      </div>
    </section>
  `;

  window.HBContent.setMeta({
    title: "Missing piece",
    description: "The requested HB piece could not be found.",
    url: window.HBContent.getSite().url + "piece.html" + window.location.search
  });
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

function buildRelatedCard(relatedPiece) {
  const card = document.createElement("a");
  card.className = "piece-card related-card";
  card.href = window.HBContent.createHref(relatedPiece);

  const label = document.createElement("span");
  label.className = "panel-label";
  label.textContent = `${window.HBContent.typeLabel(relatedPiece.type)} / ${relatedPiece.readTime}`;

  const title = document.createElement("h3");
  title.textContent = relatedPiece.title;

  const relatedDek = document.createElement("p");
  relatedDek.textContent = relatedPiece.dek;

  if (relatedPiece.thumbnail) {
    const thumb = document.createElement("div");
    thumb.className = "piece-thumb";
    thumb.style.backgroundImage = `linear-gradient(135deg, rgba(125, 31, 31, 0.12), rgba(22, 22, 22, 0.02)), url("${relatedPiece.thumbnail}")`;
    card.append(label, thumb, title, relatedDek);
    return card;
  }

  card.append(label, title, relatedDek);
  return card;
}

async function renderPiece() {
  if (!pieceRoot || !pieceId) {
    renderMissingPiece("No piece was specified.");
    return;
  }

  const piece = await window.HBContent.getById(pieceId);

  if (!piece) {
    renderMissingPiece();
    return;
  }

  const wrapper = document.createElement("div");
  let issue = null;
  if (piece.issueId) {
    issue = await window.HBContent.getIssueById(piece.issueId);
  }
  const hero = document.createElement("section");
  hero.className = "page-hero";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  const categoryLink = document.createElement("a");
  categoryLink.href = window.HBContent.createTopicHref(piece.category);
  categoryLink.className = "eyebrow-link";
  categoryLink.textContent = piece.category;
  eyebrow.appendChild(categoryLink);

  const title = document.createElement("h1");
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.className = "lede";
  dek.textContent = piece.dek || piece.summary || "This HB piece does not yet have a publication deck.";

  const cover = document.createElement("div");
  cover.className = piece.thumbnail ? "piece-thumb piece-thumb-large" : "piece-cover";

  if (piece.thumbnail) {
    cover.style.backgroundImage = `linear-gradient(135deg, rgba(125, 31, 31, 0.12), rgba(22, 22, 22, 0.02)), url("${piece.thumbnail}")`;
  } else {
    cover.innerHTML = `
      <span class="piece-cover-kicker">${window.HBContent.typeLabel(piece.type)}</span>
      <strong>${piece.category}</strong>
      <span class="piece-cover-tag">HB / ${window.HBContent.formatDate(piece.publishedAt)}</span>
    `;
  }

  const authorBlock = document.createElement("div");
  authorBlock.className = "article-header-meta";

  const byline = document.createElement("div");
  byline.innerHTML = `<span class="meta-label">Byline</span>`;
  const bylineLink = document.createElement("a");
  bylineLink.href = window.HBContent.createAuthorHref(piece.author);
  bylineLink.className = "meta-link";
  bylineLink.textContent = piece.author;
  byline.appendChild(bylineLink);

  const published = document.createElement("div");
  published.innerHTML = `<span class="meta-label">Published</span><p>${window.HBContent.formatDate(piece.publishedAt)}</p>`;

  const section = document.createElement("div");
  section.innerHTML = `<span class="meta-label">Section</span>`;
  if (piece.issueId) {
    if (issue) {
      const issueLink = document.createElement("a");
      issueLink.href = window.HBContent.createIssueHref(issue);
      issueLink.className = "meta-link";
      issueLink.textContent = issue.label;
      section.appendChild(issueLink);
    }
  } else {
    const standalone = document.createElement("p");
    standalone.textContent = "Standalone piece";
    section.appendChild(standalone);
  }

  authorBlock.append(byline, published, section);

  const meta = document.createElement("div");
  meta.className = "meta-row article-meta-row";
  meta.innerHTML = `
    <span>${window.HBContent.typeLabel(piece.type)}</span>
    <span>${piece.category}</span>
    <span>${piece.readTime}</span>
  `;

  hero.append(eyebrow, title, dek, cover, authorBlock, meta);

  const body = document.createElement("section");
  body.className = "page-section";

  if (piece.blocks.length) {
    piece.blocks.forEach((block) => renderBodyBlock(block, body));
  } else {
    body.innerHTML = `
      <p class="page-copy">This piece is missing a readable body. Check the repo content source before publishing this route.</p>
    `;
  }

  wrapper.append(hero, body);

  const relatedPieces = await window.HBContent.getRelatedPieces(piece);
  if (relatedPieces.length) {
    const relatedSection = document.createElement("section");
    relatedSection.className = "page-section related-reading";

    const relatedEyebrow = document.createElement("p");
    relatedEyebrow.className = "eyebrow";
    relatedEyebrow.textContent = "Related Reading";

    const relatedTitle = document.createElement("h2");
    relatedTitle.textContent = "Keep reading inside the same desk.";

    const relatedGrid = document.createElement("div");
    relatedGrid.className = "piece-grid related-grid";
    relatedGrid.replaceChildren(...relatedPieces.map(buildRelatedCard));

    relatedSection.append(relatedEyebrow, relatedTitle, relatedGrid);
    wrapper.append(relatedSection);
  }

  pieceRoot.replaceChildren(wrapper);

  window.HBContent.setMeta({
    title: piece.title,
    description: piece.summary || piece.dek,
    type: "article",
    url: window.HBContent.createPublicHref(piece),
    image: piece.ogImagePublicUrl || piece.thumbnailPublicUrl || issue?.ogImagePublicUrl
  });
  window.HBContent.trackEvent("piece_view", { id: piece.id, title: piece.title, type: piece.type });
}

window.HBContent.ready().then(renderPiece);
