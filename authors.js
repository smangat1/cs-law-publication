const authorsGrid = document.getElementById("authors-grid");

window.HBContent.ready().then(async () => {
  if (!authorsGrid) {
    return;
  }

  const authors = await window.HBContent.getAuthors();

  if (!authors.length) {
    authorsGrid.innerHTML = `
      <div class="empty-state archive-empty-state">
        <p class="eyebrow">No bylines yet</p>
        <h3>The author index is empty.</h3>
        <p class="page-copy">Add published pieces in the repo content source to populate this shelf.</p>
      </div>
    `;
    return;
  }

  authorsGrid.replaceChildren(...authors.map((author) => {
    const card = document.createElement("a");
    card.className = "piece-card";
    card.href = window.HBContent.createAuthorHref(author.name);

    const label = document.createElement("span");
    label.className = "panel-label";
    label.textContent = `${author.count} ${author.count === 1 ? "piece" : "pieces"}`;

    const title = document.createElement("h3");
    title.textContent = author.name;

    const dek = document.createElement("p");
    dek.textContent = "Browse this author or desk across the publication.";

    card.append(label, title, dek);
    return card;
  }));
  window.HBContent.trackEvent("page_view", { surface: "authors" });
});
