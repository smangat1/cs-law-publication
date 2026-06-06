const issueRoot = document.getElementById("issue-view");
const issueParams = new URLSearchParams(window.location.search);
const issueId = issueParams.get("id") || issueRoot?.dataset.issueId;

function renderIssueMissing() {
  if (!issueRoot) {
    return;
  }

  issueRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Missing Issue</p>
      <h1>This issue could not be found.</h1>
      <p class="lede">Return to the archive to browse the current editorial shelf.</p>
    </section>
  `;
}

async function renderIssue() {
  const issue = issueId ? await window.HBContent.getIssueById(issueId) : null;

  if (!issueRoot || !issue) {
    renderIssueMissing();
    return;
  }

  const pieces = await window.HBContent.getIssuePieces(issue.id);

  issueRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">${issue.label}</p>
      <h1>${issue.title}</h1>
      <p class="lede">${issue.dek}</p>
      <div class="meta-row">
        <span>${pieces.length} pieces</span>
        <span>${window.HBContent.formatDate(issue.publishedAt)}</span>
      </div>
    </section>

    <section class="page-section">
      <h2>Editor's note</h2>
      <p class="page-copy">${issue.editorNote}</p>
    </section>

    <section class="page-section">
      <h2>Contained pieces</h2>
      <div class="piece-grid issue-piece-grid"></div>
    </section>
  `;

  const grid = issueRoot.querySelector(".issue-piece-grid");

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

    if (piece.thumbnail) {
      const thumb = document.createElement("div");
      thumb.className = "piece-thumb";
      thumb.style.backgroundImage = `url("${piece.thumbnail}")`;
      card.append(label, thumb, title, dek);
    } else {
      card.append(label, title, dek);
    }

    grid.appendChild(card);
  });

  document.title = `${issue.label} | HB`;
}

window.HBContent.ready().then(renderIssue);
