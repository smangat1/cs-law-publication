const topicRoot = document.getElementById("topic-view");
const topicName = new URLSearchParams(window.location.search).get("name");

function renderTopicState(title, copy) {
  if (!topicRoot) {
    return;
  }

  topicRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Topic</p>
      <h1>${title}</h1>
      <p class="lede">${copy}</p>
    </section>
  `;
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

  const pieces = await window.HBContent.getPiecesByCategory(topicName);
  renderTopicState(
    topicName,
    pieces.length
      ? `${pieces.length} published ${pieces.length === 1 ? "piece" : "pieces"} currently live in this strand.`
      : "No published pieces currently live in this strand."
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

    topicRoot.appendChild(grid);
  }

  window.HBContent.setMeta({
    title: topicName,
    description: pieces.length
      ? `Browse ${pieces.length} HB ${pieces.length === 1 ? "piece" : "pieces"} in ${topicName}.`
      : `Browse the ${topicName} strand in HB.`,
    url: window.HBContent.createTopicPublicUrl(topicName)
  });
  window.HBContent.trackEvent("topic_view", { name: topicName, count: pieces.length });
});
