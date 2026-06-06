const authorRoot = document.getElementById("author-view");
const authorName = new URLSearchParams(window.location.search).get("name");

window.HBContent.ready().then(async () => {
  if (!authorRoot || !authorName) {
    return;
  }

  const pieces = await window.HBContent.getPiecesByAuthor(authorName);
  authorRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Author</p>
      <h1>${authorName}</h1>
      <p class="lede">${pieces.length} published ${pieces.length === 1 ? "piece" : "pieces"} currently appear under this byline.</p>
    </section>
    <section class="piece-grid topic-piece-grid"></section>
  `;

  const grid = authorRoot.querySelector(".topic-piece-grid");
  pieces.forEach((piece) => {
    const card = document.createElement("a");
    card.className = "piece-card";
    card.href = window.HBContent.createHref(piece);
    card.innerHTML = `
      <span class="panel-label">${window.HBContent.typeLabel(piece.type)} / ${piece.readTime}</span>
      <h3>${piece.title}</h3>
      <p>${piece.dek}</p>
    `;
    grid.appendChild(card);
  });

  document.title = `${authorName} | HB`;
});
