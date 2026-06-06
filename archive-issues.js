const issueGrid = document.getElementById("issue-grid");

function renderIssueCard(issue) {
  const card = document.createElement("a");
  card.className = "issue-card";
  card.href = window.HBContent.createIssueHref(issue);

  const label = document.createElement("span");
  label.className = "panel-label";
  label.textContent = issue.label;

  const title = document.createElement("h2");
  title.textContent = issue.title;

  const dek = document.createElement("p");
  dek.textContent = issue.dek;

  card.append(label, title, dek);
  return card;
}

function renderIssues() {
  if (!issueGrid) {
    return;
  }

  window.HBContent.getIssues().then((issues) => {
    issueGrid.replaceChildren(...issues.map(renderIssueCard));
  });
}

window.HBContent.ready().then(renderIssues);
