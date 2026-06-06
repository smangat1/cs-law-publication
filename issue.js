const issueRoot = document.getElementById("issue-view");
const issueParams = new URLSearchParams(window.location.search);
const issueId = issueParams.get("id") || issueRoot?.dataset.issueId;

function renderIssueMissing(message = "This issue could not be found.") {
  if (!issueRoot) {
    return;
  }

  issueRoot.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Missing Issue</p>
      <h1>${message}</h1>
      <p class="lede">Return to the archive to browse the current editorial shelf.</p>
      <div class="link-list">
        <a href="../archive.html">Browse the archive</a>
        <a href="../about.html">Read the editorial note</a>
      </div>
    </section>
  `;

  window.HBContent.setMeta({
    title: "Missing issue",
    description: "The requested HB issue could not be found."
  });
}

function buildIssuePieceCard(piece) {
  const card = document.createElement("a");
  card.className = "piece-card issue-piece-card";
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
    thumb.style.backgroundImage = `linear-gradient(135deg, rgba(239, 143, 104, 0.18), rgba(8, 12, 18, 0.22)), url("${piece.thumbnail}")`;
    card.append(label, thumb, title, dek);
    return card;
  }

  card.append(label, title, dek);
  return card;
}

async function renderIssue() {
  if (!issueRoot || !issueId) {
    renderIssueMissing("No issue was specified.");
    return;
  }

  const issue = await window.HBContent.getIssueById(issueId);
  if (!issue) {
    renderIssueMissing();
    return;
  }

  window.HBContent.applyIssueTheme(issue);
  issueRoot.dataset.issueLayout = issue.layout || "default";

  const pieces = await window.HBContent.getIssuePieces(issue.id);
  const [leadPiece, ...restPieces] = pieces;
  const topicSummary = [...new Set(pieces.map((piece) => piece.category).filter(Boolean))].slice(0, 3).join(" / ") || "No topics yet";

  issueRoot.innerHTML = `
    <section class="issue-stage">
      <div class="issue-stage__hero">
        <p class="issue-stage__eyebrow">${issue.label}</p>
        <h1>${issue.title}</h1>
        <p class="issue-stage__dek">${issue.dek}</p>
      </div>
      <div class="issue-stage__sidecar">
        ${issue.coverImage ? `<div class="issue-stage__cover" style="background-image: url('${issue.coverImage}')"></div>` : ""}
        <p class="issue-stage__caption">Issue frame</p>
        <p>${issue.editorNote}</p>
        <div class="issue-stage__meta">
          <span>${pieces.length} pieces</span>
          <span>${window.HBContent.formatDate(issue.publishedAt)}</span>
          <span>${topicSummary}</span>
        </div>
      </div>
    </section>

    <section class="issue-world">
      <div class="issue-world__rail">
        <p class="eyebrow">Contents</p>
        <div class="issue-toc"></div>
      </div>
      <div class="issue-world__body">
        <section class="issue-lead-shell">
          <p class="eyebrow">Lead Piece</p>
          <div class="issue-lead-card"></div>
        </section>
        <section class="issue-field">
          <p class="eyebrow">Contained pieces</p>
          <div class="piece-grid issue-piece-grid"></div>
        </section>
      </div>
    </section>
  `;

  const lead = issueRoot.querySelector(".issue-lead-card");
  const grid = issueRoot.querySelector(".issue-piece-grid");
  const toc = issueRoot.querySelector(".issue-toc");

  if (leadPiece && lead) {
    const leadLink = document.createElement("a");
    leadLink.className = "issue-lead-link";
    leadLink.href = window.HBContent.createHref(leadPiece);
    leadLink.innerHTML = `
      <span class="panel-label">${window.HBContent.typeLabel(leadPiece.type)} / ${leadPiece.readTime}</span>
      <h3>${leadPiece.title}</h3>
      <p>${leadPiece.dek}</p>
    `;
    lead.appendChild(leadLink);
  } else if (lead) {
    lead.innerHTML = `<div class="issue-empty-card"><p class="page-copy">This issue does not yet contain a lead piece.</p></div>`;
  }

  if (pieces.length) {
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

    if (restPieces.length) {
      grid.replaceChildren(...restPieces.map(buildIssuePieceCard));
    } else if (leadPiece) {
      grid.innerHTML = `
        <div class="empty-state archive-empty-state">
          <p class="eyebrow">Single-piece issue</p>
          <h3>This issue currently turns on one lead argument.</h3>
          <p class="page-copy">Additional contained pieces can be added in the repo content source.</p>
        </div>
      `;
    }
  } else {
    toc.innerHTML = `
      <div class="empty-state archive-empty-state">
        <p class="eyebrow">No contents yet</p>
        <h3>This issue has no published pieces attached to it.</h3>
        <p class="page-copy">Check the issue's piece IDs in the repo content source.</p>
      </div>
    `;
    grid.innerHTML = "";
  }

  window.HBContent.setMeta({
    title: issue.label,
    description: issue.dek || issue.editorNote,
    type: "article",
    url: window.HBContent.createIssuePublicUrl(issue),
    image: issue.ogImagePublicUrl || issue.coverImagePublicUrl,
    themeColor: issue.theme?.accent || window.HBContent.getSite().themeColor
  });
  window.HBContent.trackEvent("issue_view", { id: issue.id, title: issue.title });
}

window.HBContent.ready().then(renderIssue);
