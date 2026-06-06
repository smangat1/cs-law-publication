const topicsGrid = document.getElementById("topics-grid");

window.HBContent.ready().then(async () => {
  if (!topicsGrid) {
    return;
  }

  const topics = await window.HBContent.getTopics();

  if (!topics.length) {
    topicsGrid.innerHTML = `
      <div class="empty-state archive-empty-state">
        <p class="eyebrow">No topics yet</p>
        <h3>The taxonomy index is empty.</h3>
        <p class="page-copy">Add published pieces in the repo content source to populate this shelf.</p>
      </div>
    `;
    return;
  }

  topicsGrid.replaceChildren(...await Promise.all(topics.map(async (topic) => {
    const profile = await window.HBContent.getTopicProfile(topic.name);
    const card = document.createElement("a");
    card.className = "piece-card";
    card.href = window.HBContent.createTopicHref(topic.name);

    const label = document.createElement("span");
    label.className = "panel-label";
    label.textContent = `${topic.count} ${topic.count === 1 ? "piece" : "pieces"}`;

    const title = document.createElement("h3");
    title.textContent = topic.name;

    const dek = document.createElement("p");
    dek.textContent = profile?.description || "Browse the pieces gathered under this recurring editorial theme.";

    card.append(label, title, dek);
    return card;
  })));
  window.HBContent.trackEvent("page_view", { surface: "topics" });
});
