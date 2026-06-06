const authorRoot = document.getElementById("author-view");
const authorName = new URLSearchParams(window.location.search).get("name");

function renderAuthorState(title, copy) {
  if (!authorRoot) {
    return;
  }

  authorRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Author</p>
      <h1>${title}</h1>
      <p class="lede">${copy}</p>
    </section>
  `;
}

window.HBContent.ready().then(async () => {
  if (!authorRoot) {
    return;
  }

  if (!authorName) {
    renderAuthorState("No author was specified.", "Choose a byline from the author index to keep reading.");
    window.HBContent.setMeta({
      title: "Author",
      description: "Browse HB pieces by a single author or editorial desk.",
      url: `${window.HBContent.getSite().url}author.html`
    });
    return;
  }

  const pieces = await window.HBContent.getPiecesByAuthor(authorName);
  renderAuthorState(
    authorName,
    pieces.length
      ? `${pieces.length} published ${pieces.length === 1 ? "piece" : "pieces"} currently appear under this byline.`
      : "No published pieces currently appear under this byline."
  );

  if (pieces.length) {
    const grid = document.createElement("section");
    grid.className = "piece-grid topic-piece-grid";

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

    authorRoot.appendChild(grid);
  }

  window.HBContent.setMeta({
    title: authorName,
    description: pieces.length
      ? `Browse ${pieces.length} HB ${pieces.length === 1 ? "piece" : "pieces"} by ${authorName}.`
      : `Browse the ${authorName} byline in HB.`,
    url: window.HBContent.createAuthorPublicUrl(authorName)
  });
  window.HBContent.trackEvent("author_view", { name: authorName, count: pieces.length });
});
