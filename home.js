const featuredGrid = document.getElementById("featured-grid");

function buildFeaturedLead(piece) {
  const article = document.createElement("a");
  article.className = "featured-lead";
  article.href = window.HBContent.createHref(piece);
  article.setAttribute("aria-label", `Read ${piece.title}`);

  const body = document.createElement("div");
  body.className = "featured-body";

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  meta.innerHTML = `<span>${window.HBContent.typeLabel(piece.type)}</span><span class="entry-rule" aria-hidden="true"></span><span>${piece.readTime}</span>`;

  const title = document.createElement("h3");
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.textContent = piece.dek;

  body.append(meta, title, dek);

  if (piece.thumbnail) {
    const media = document.createElement("div");
    media.className = "featured-media";
    media.style.backgroundImage = `linear-gradient(135deg, rgba(125, 31, 31, 0.12), rgba(22, 22, 22, 0.02)), url("${piece.thumbnail}")`;
    article.append(media, body);
    return article;
  }

  article.classList.add("no-media");
  article.append(body);
  return article;
}

function buildFeaturedItem(piece) {
  const article = document.createElement("a");
  article.className = "featured-item";
  article.href = window.HBContent.createHref(piece);
  article.setAttribute("aria-label", `Read ${piece.title}`);

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  meta.innerHTML = `<span>${window.HBContent.typeLabel(piece.type)}</span><span class="entry-rule" aria-hidden="true"></span><span>${piece.readTime}</span>`;

  const title = document.createElement("h3");
  title.textContent = piece.title;
  article.append(meta, title);

  return article;
}

function renderHomePieces() {
  if (!featuredGrid || !window.HBContent) {
    return;
  }

  window.HBContent.getAllPieces()
    .then((allPieces) => {
      const pieces = allPieces
        .filter((piece) => piece.status === "published")
        .sort((left, right) => Number(right.featured) - Number(left.featured) || String(right.publishedAt).localeCompare(String(left.publishedAt)))
        .slice(0, 4);

      if (!pieces.length) {
        featuredGrid.innerHTML = `
          <div class="empty-state archive-empty-state">
            <p class="eyebrow">No published pieces yet</p>
            <h3>HB is ready for a first issue or article.</h3>
            <p class="page-copy">Add content in the repo source to bring the front page to life.</p>
          </div>
        `;
        return;
      }

      const [leadPiece, ...rest] = pieces;
      const stack = document.createElement("div");
      stack.className = "featured-stack";
      rest.forEach((piece) => stack.append(buildFeaturedItem(piece)));
      featuredGrid.replaceChildren(buildFeaturedLead(leadPiece), stack);
    });
}

window.HBContent.ready().then(() => {
  renderHomePieces();
  window.HBContent.trackEvent("page_view", { surface: "home" });
});
