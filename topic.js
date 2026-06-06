const topicRoot = document.getElementById("topic-view");
const topicName = new URLSearchParams(window.location.search).get("name");

function renderTopicState(title, copy) {
  if (!topicRoot) {
    return;
  }

  const hero = document.createElement("section");
  hero.className = "page-hero";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Topic";

  const heading = document.createElement("h1");
  heading.textContent = title;

  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent = copy;

  hero.append(eyebrow, heading, lede);
  topicRoot.replaceChildren(hero);
}

window.HBContent.ready().then(async () => {
  if (!topicRoot) {
    return;
  }

  if (!topicName) {
    renderTopicState("No topic was specified.", "Choose a strand from the topic index to keep reading.");
    window.HBContent.setMeta({
      title: "Topic",
      description: "Browse HB by topic across recurring themes in procedure, governance, education, and technical institutions.",
      url: `${window.HBContent.getSite().url}topic.html`
    });
    return;
  }

  const [pieces, profile] = await Promise.all([
    window.HBContent.getPiecesByCategory(topicName),
    window.HBContent.getTopicProfile(topicName)
  ]);
  renderTopicState(
    topicName,
    profile?.description || (
      pieces.length
      ? `${pieces.length} published ${pieces.length === 1 ? "piece" : "pieces"} currently live in this strand.`
      : "No published pieces currently live in this strand."
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

    topicRoot.appendChild(grid);
  }

  window.HBContent.setMeta({
    title: topicName,
    description: profile?.description || (pieces.length
      ? `Browse ${pieces.length} HB ${pieces.length === 1 ? "piece" : "pieces"} in ${topicName}.`
      : `Browse the ${topicName} strand in HB.`),
    url: window.HBContent.createTopicPublicUrl(topicName),
    image: profile?.ogImagePublicUrl || pieces[0]?.thumbnailPublicUrl
  });
  window.HBContent.trackEvent("topic_view", { name: topicName, count: pieces.length });
});
