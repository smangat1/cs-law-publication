const topicsGrid = document.getElementById("topics-grid");

window.HBContent.ready().then(async () => {
  if (!topicsGrid) {
    return;
  }

  const topics = await window.HBContent.getTopics();
  topicsGrid.replaceChildren(...topics.map((topic) => {
    const card = document.createElement("a");
    card.className = "piece-card";
    card.href = window.HBContent.createTopicHref(topic.name);

    const label = document.createElement("span");
    label.className = "panel-label";
    label.textContent = `${topic.count} ${topic.count === 1 ? "piece" : "pieces"}`;

    const title = document.createElement("h3");
    title.textContent = topic.name;

    const dek = document.createElement("p");
    dek.textContent = "Browse the pieces gathered under this recurring editorial theme.";

    card.append(label, title, dek);
    return card;
  }));
});
