const issueGrid = document.getElementById("issue-grid");

function renderIssueCard(issue) {
  const card = document.createElement("a");
  card.className = "issue-card";
  card.href = window.HBContent.createIssueHref(issue);
  if (issue.theme?.slug) {
    card.dataset.issueTheme = issue.theme.slug;
  }

  const label = document.createElement("span");
  label.className = "panel-label";
  label.textContent = issue.label;

  const title = document.createElement("h2");
  title.textContent = issue.title;

  const dek = document.createElement("p");
  dek.textContent = issue.dek;

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  meta.innerHTML = `<span>${window.HBContent.formatDate(issue.publishedAt)}</span>`;

  card.append(label, title, dek, meta);
  return card;
}

function renderIssues() {
  if (!issueGrid) {
    return;
  }

  window.HBContent.getIssues().then((issues) => {
    if (!issues.length) {
      issueGrid.innerHTML = `
        <div class="empty-state archive-empty-state">
          <p class="eyebrow">No issues yet</p>
          <h3>The issue shelf is empty.</h3>
          <p class="page-copy">Add published issues in the repo content source to populate this shelf.</p>
        </div>
      `;
      return;
    }

    issueGrid.replaceChildren(...issues.map(renderIssueCard));
    window.HBContent.trackEvent("archive_view", { type: "issue" });
  });
}

window.HBContent.ready().then(renderIssues);
