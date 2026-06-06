const pieceRoot = document.getElementById("piece-view");
const params = new URLSearchParams(window.location.search);
const pieceId = params.get("id");
const piece = pieceId ? window.HBContent.getById(pieceId) : null;

function renderMissing() {
  pieceRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Missing Piece</p>
      <h1>This piece could not be found.</h1>
      <p class="lede">Return to the archive or create a new one in Studio.</p>
    </section>
  `;
}

function renderPiece() {
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

  const meta = document.createElement("div");
  meta.className = "meta-row";
  meta.innerHTML = `
    <span>${window.HBContent.typeLabel(piece.type)}</span>
    <span>${piece.readTime}</span>
    <span>${piece.issue || "Standalone piece"}</span>
  `;

  hero.append(eyebrow);

  if (piece.thumbnail) {
    const thumb = document.createElement("div");
    thumb.className = "piece-thumb piece-thumb-large";
    thumb.style.backgroundImage = `url("${piece.thumbnail}")`;
    hero.append(thumb);
  }

  hero.append(title, dek, meta);

  const body = document.createElement("section");
  body.className = "page-section";

  piece.body.forEach((paragraph) => {
    const p = document.createElement("p");
    p.className = "page-copy";
    p.textContent = paragraph;
    body.appendChild(p);
  });

  wrapper.append(hero, body);
  pieceRoot.replaceChildren(wrapper);
  document.title = `${piece.title} | HB`;
}

if (!pieceRoot || !piece) {
  renderMissing();
} else {
  renderPiece();
}
