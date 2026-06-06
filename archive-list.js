function buildPieceCard(piece) {
  const card = document.createElement("a");
  card.className = "piece-card";
  card.href = window.HBContent.createHref(piece);

  const label = document.createElement("span");
  label.className = "panel-label";
  label.textContent = `${piece.readTime} / ${window.HBContent.formatDate(piece.publishedAt)}`;

  const title = document.createElement("h3");
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.textContent = piece.dek;

  if (piece.thumbnail) {
    const thumb = document.createElement("div");
    thumb.className = "piece-thumb";
    thumb.style.backgroundImage = `linear-gradient(135deg, rgba(125, 31, 31, 0.12), rgba(22, 22, 22, 0.02)), url("${piece.thumbnail}")`;
    card.append(label, thumb, title, dek);
    return card;
  }

  card.append(label, title, dek);
  return card;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function sortPieces(pieces, mode) {
  const sorted = [...pieces];

  if (mode === "oldest") {
    return sorted.sort((left, right) => String(left.publishedAt).localeCompare(String(right.publishedAt)));
  }

  if (mode === "title") {
    return sorted.sort((left, right) => left.title.localeCompare(right.title));
  }

  return sorted.sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
}

function renderArchiveList(containerId, type) {
  const container = document.getElementById(containerId);
  const searchInput = document.getElementById("archive-search");
  const categorySelect = document.getElementById("archive-category");
  const sortSelect = document.getElementById("archive-sort");
  const resultsCount = document.getElementById("archive-results-count");

  if (!container || !window.HBContent) {
    return;
  }

  window.HBContent.getAllPieces()
    .then((pieces) => pieces.filter((piece) => piece.type === type && piece.status === "published"))
    .then((pieces) => {
      if (!pieces.length) {
        if (resultsCount) {
          resultsCount.textContent = `0 ${type}s shown`;
        }
        container.setAttribute("aria-busy", "false");
        container.innerHTML = `
          <div class="empty-state archive-empty-state">
            <p class="eyebrow">No ${type}s yet</p>
            <h3>This shelf is currently empty.</h3>
            <p class="page-copy">Add published ${type}s in the repo content source to populate this archive.</p>
          </div>
        `;
        return;
      }

      const categories = [...new Set(pieces.map((piece) => piece.category).filter(Boolean))].sort((left, right) => left.localeCompare(right));

      if (categorySelect) {
        categorySelect.replaceChildren(
          ...[
            (() => {
              const option = document.createElement("option");
              option.value = "";
              option.textContent = "All categories";
              return option;
            })(),
            ...categories.map((category) => {
              const option = document.createElement("option");
              option.value = category;
              option.textContent = category;
              return option;
            })
          ]
        );
      }

      const applyFilters = () => {
        const query = normalizeText(searchInput?.value);
        const category = categorySelect?.value || "";
        const sortMode = sortSelect?.value || "latest";

        const filtered = sortPieces(
          pieces.filter((piece) => {
            const matchesCategory = !category || piece.category === category;
            const haystack = normalizeText(`${piece.title} ${piece.dek} ${piece.category} ${piece.author}`);
            const matchesQuery = !query || haystack.includes(query);
            return matchesCategory && matchesQuery;
          }),
          sortMode
        );

        if (resultsCount) {
          resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? type : `${type}s`} shown`;
        }

        if (!filtered.length) {
          container.setAttribute("aria-busy", "false");
          container.innerHTML = `
            <div class="empty-state archive-empty-state">
              <p class="eyebrow">No matches</p>
              <h3>No ${type}s match the current filters.</h3>
              <p class="page-copy">Try clearing the search or broadening the category filter.</p>
            </div>
          `;
          return;
        }

        container.setAttribute("aria-busy", "false");
        container.replaceChildren(...filtered.map(buildPieceCard));
      };

      [searchInput, categorySelect, sortSelect].forEach((control) => {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
      window.HBContent.trackEvent("archive_view", { type });
    });
}

window.HBArchive = {
  renderArchiveList
};
