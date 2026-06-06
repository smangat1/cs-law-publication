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
  const [leadPiece, ...restPieces] = pieces;

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

    <section class="page-section issue-cover-sheet">
      <div class="issue-cover-sheet__intro">
        <p class="eyebrow">Issue Frame</p>
        <h2>${issue.title}</h2>
        <p class="page-copy">${issue.editorNote}</p>
      </div>
      <div class="issue-cover-sheet__stats">
        <div>
          <span class="meta-label">Published</span>
          <p>${window.HBContent.formatDate(issue.publishedAt)}</p>
        </div>
        <div>
          <span class="meta-label">Contained pieces</span>
          <p>${pieces.length}</p>
        </div>
        <div>
          <span class="meta-label">Primary themes</span>
          <p>${[...new Set(pieces.map((piece) => piece.category))].slice(0, 3).join(" / ")}</p>
        </div>
      </div>
    </section>

    <section class="page-section">
      <h2>Editor's note</h2>
      <p class="page-copy">${issue.editorNote}</p>
    </section>

    <section class="page-section issue-lead-shell">
      <p class="eyebrow">Lead Piece</p>
      <div class="issue-lead-card"></div>
    </section>

    <section class="page-section">
      <h2>Contents</h2>
      <div class="issue-toc"></div>
      <div class="piece-grid issue-piece-grid"></div>
    </section>
  `;

  const lead = issueRoot.querySelector(".issue-lead-card");
  const grid = issueRoot.querySelector(".issue-piece-grid");
  const toc = issueRoot.querySelector(".issue-toc");

  if (leadPiece && lead) {
    lead.innerHTML = `
      <a class="issue-lead-link" href="${window.HBContent.createHref(leadPiece)}">
        <span class="panel-label">${window.HBContent.typeLabel(leadPiece.type)} / ${leadPiece.readTime}</span>
        <h3>${leadPiece.title}</h3>
        <p>${leadPiece.dek}</p>
      </a>
    `;
  }

  pieces.forEach((piece, index) => {
    const tocLink = document.createElement("a");
    tocLink.className = "issue-toc-link";
    tocLink.href = window.HBContent.createHref(piece);
    tocLink.innerHTML = `
      <span class="issue-toc-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="issue-toc-copy">
        <strong>${piece.title}</strong>
        <small>${piece.category} / ${piece.readTime}</small>
      </span>
    `;
    toc.appendChild(tocLink);
  });

  restPieces.forEach((piece) => {
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
