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

function buildIssueSection(titleText, eyebrowText, pieces) {
  const section = document.createElement("section");
  section.className = "issue-field";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = eyebrowText;

  const title = document.createElement("h2");
  title.className = "issue-subheading";
  title.textContent = titleText;

  const grid = document.createElement("div");
  grid.className = "piece-grid issue-piece-grid";
  grid.replaceChildren(...pieces.map(buildIssuePieceCard));

  section.append(eyebrow, title, grid);
  return section;
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

  const stage = document.createElement("section");
  stage.className = "issue-stage";

  const stageHero = document.createElement("div");
  stageHero.className = "issue-stage__hero";

  const stageEyebrow = document.createElement("p");
  stageEyebrow.className = "issue-stage__eyebrow";
  stageEyebrow.textContent = issue.label;

  const stageTitle = document.createElement("h1");
  stageTitle.textContent = issue.title;

  const stageDek = document.createElement("p");
  stageDek.className = "issue-stage__dek";
  stageDek.textContent = issue.dek;

  stageHero.append(stageEyebrow, stageTitle, stageDek);

  const sidecar = document.createElement("div");
  sidecar.className = "issue-stage__sidecar";

  if (issue.coverImage) {
    const cover = document.createElement("div");
    cover.className = "issue-stage__cover";
    cover.style.backgroundImage = `url('${issue.coverImage}')`;
    sidecar.appendChild(cover);
  }

  const caption = document.createElement("p");
  caption.className = "issue-stage__caption";
  caption.textContent = "Issue frame";

  const note = document.createElement("p");
  note.textContent = issue.editorNote;

  const meta = document.createElement("div");
  meta.className = "issue-stage__meta";
  [ `${pieces.length} pieces`, window.HBContent.formatDate(issue.publishedAt), topicSummary ].forEach((value) => {
    const chip = document.createElement("span");
    chip.textContent = value;
    meta.appendChild(chip);
  });

  sidecar.append(caption, note, meta);
  stage.append(stageHero, sidecar);

  const issueWorld = document.createElement("section");
  issueWorld.className = "issue-world";

  const rail = document.createElement("div");
  rail.className = "issue-world__rail";
  const railEyebrow = document.createElement("p");
  railEyebrow.className = "eyebrow";
  railEyebrow.textContent = "Contents";
  const toc = document.createElement("div");
  toc.className = "issue-toc";
  rail.append(railEyebrow, toc);

  const body = document.createElement("div");
  body.className = "issue-world__body";
  const leadShell = document.createElement("section");
  leadShell.className = "issue-lead-shell";
  const leadEyebrow = document.createElement("p");
  leadEyebrow.className = "eyebrow";
  leadEyebrow.textContent = "Lead Piece";
  const lead = document.createElement("div");
  lead.className = "issue-lead-card";
  leadShell.append(leadEyebrow, lead);
  body.appendChild(leadShell);

  issueWorld.append(rail, body);
  issueRoot.replaceChildren(stage, issueWorld);

  const articlePieces = pieces.filter((piece) => piece.type === "article" && piece.id !== leadPiece?.id);
  const essayPieces = pieces.filter((piece) => piece.type === "essay" && piece.id !== leadPiece?.id);

  if (leadPiece && lead) {
    const leadLink = document.createElement("a");
    leadLink.className = "issue-lead-link";
    leadLink.href = window.HBContent.createHref(leadPiece);
    const leadLabel = document.createElement("span");
    leadLabel.className = "panel-label";
    leadLabel.textContent = `${window.HBContent.typeLabel(leadPiece.type)} / ${leadPiece.readTime}`;
    const leadTitle = document.createElement("h3");
    leadTitle.textContent = leadPiece.title;
    const leadDek = document.createElement("p");
    leadDek.textContent = leadPiece.dek;
    leadLink.append(leadLabel, leadTitle, leadDek);
    lead.appendChild(leadLink);
  } else if (lead) {
    const empty = document.createElement("div");
    empty.className = "issue-empty-card";
    const copy = document.createElement("p");
    copy.className = "page-copy";
    copy.textContent = "This issue does not yet contain a lead piece.";
    empty.appendChild(copy);
    lead.appendChild(empty);
  }

  if (pieces.length) {
    pieces.forEach((piece, index) => {
      const tocLink = document.createElement("a");
      tocLink.className = "issue-toc-link";
      tocLink.href = window.HBContent.createHref(piece);
      const number = document.createElement("span");
      number.className = "issue-toc-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("span");
      copy.className = "issue-toc-copy";
      const strong = document.createElement("strong");
      strong.textContent = piece.title;
      const small = document.createElement("small");
      small.textContent = `${piece.category} / ${window.HBContent.typeLabel(piece.type)} / ${piece.readTime}`;
      copy.append(strong, small);
      tocLink.append(number, copy);
      toc.appendChild(tocLink);
    });

    if (articlePieces.length) {
      body.appendChild(buildIssueSection("Issue articles", "Articles", articlePieces));
    }

    if (essayPieces.length) {
      body.appendChild(buildIssueSection("Issue essays", "Essays", essayPieces));
    }

    if (!articlePieces.length && !essayPieces.length && leadPiece) {
      const single = document.createElement("div");
      single.className = "empty-state archive-empty-state";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Single-piece issue";
      const title = document.createElement("h3");
      title.textContent = "This issue currently turns on one lead argument.";
      const copy = document.createElement("p");
      copy.className = "page-copy";
      copy.textContent = "Additional contained pieces can be added in the repo content source.";
      single.append(eyebrow, title, copy);
      body.appendChild(single);
    }
  } else {
    const empty = document.createElement("div");
    empty.className = "empty-state archive-empty-state";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "No contents yet";
    const title = document.createElement("h3");
    title.textContent = "This issue has no published pieces attached to it.";
    const copy = document.createElement("p");
    copy.className = "page-copy";
    copy.textContent = "Check the issue's piece IDs in the repo content source.";
    empty.append(eyebrow, title, copy);
    toc.replaceChildren(empty);
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
