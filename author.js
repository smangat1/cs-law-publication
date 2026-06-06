const authorRoot = document.getElementById("author-view");
const authorName = new URLSearchParams(window.location.search).get("name");

function renderAuthorState(title, copy) {
  if (!authorRoot) {
    return;
  }

  const hero = document.createElement("section");
  hero.className = "page-hero";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Author";

  const heading = document.createElement("h1");
  heading.textContent = title;

  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent = copy;

  hero.append(eyebrow, heading, lede);
  authorRoot.replaceChildren(hero);
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

  const [pieces, profile] = await Promise.all([
    window.HBContent.getPiecesByAuthor(authorName),
    window.HBContent.getAuthorProfile(authorName)
  ]);
  renderAuthorState(
    authorName,
    profile?.description || (
      pieces.length
      ? `${pieces.length} published ${pieces.length === 1 ? "piece" : "pieces"} currently appear under this byline.`
      : "No published pieces currently appear under this byline."
    )
  );

  if (pieces.length) {
    const grid = document.createElement("section");
    grid.className = "piece-grid topic-piece-grid";

    pieces.forEach((piece) => {
      const card = document.createElement("a");
      card.className = "piece-card";
      card.href = window.HBContent.createHref(piece);

      const label = document.createElement("span");
      label.className = "panel-label";
      label.textContent = `${window.HBContent.typeLabel(piece.type)} / ${piece.readTime}`;

      const title = document.createElement("h3");
      title.textContent = piece.title;

      const dek = document.createElement("p");
      dek.textContent = piece.dek;

      card.append(label, title, dek);
      grid.appendChild(card);
    });

    authorRoot.appendChild(grid);
  }

  window.HBContent.setMeta({
    title: authorName,
    description: profile?.description || (pieces.length
      ? `Browse ${pieces.length} HB ${pieces.length === 1 ? "piece" : "pieces"} by ${authorName}.`
      : `Browse the ${authorName} byline in HB.`),
    url: window.HBContent.createAuthorPublicUrl(authorName),
    image: profile?.ogImagePublicUrl || pieces[0]?.thumbnailPublicUrl
  });
  window.HBContent.trackEvent("author_view", { name: authorName, count: pieces.length });
});
