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
    media.style.backgroundImage = `url("${piece.thumbnail}")`;
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

  if (piece.thumbnail) {
    const thumb = document.createElement("div");
    thumb.className = "thumbnail-pill";
    thumb.textContent = "includes cover image";
    article.append(meta, title, thumb);
    return article;
  }

  article.append(meta, title);
  return article;
}

function renderHomePieces() {
  if (!featuredGrid || !window.HBContent) {
    return;
  }

  const pieces = window.HBContent.getAllPieces()
    .filter((piece) => piece.type === "article" || piece.type === "essay")
    .slice(0, 4);

  if (!pieces.length) {
    return;
  }

  const [leadPiece, ...rest] = pieces;
  const stack = document.createElement("div");
  stack.className = "featured-stack";

  rest.forEach((piece) => {
    stack.append(buildFeaturedItem(piece));
  });

  featuredGrid.replaceChildren(buildFeaturedLead(leadPiece), stack);
}

renderHomePieces();
