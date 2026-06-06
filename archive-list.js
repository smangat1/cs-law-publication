function buildPieceCard(piece) {
  const card = document.createElement("a");
  card.className = "piece-card";
  card.href = window.HBContent.createHref(piece);

  const label = document.createElement("span");
  label.className = "panel-label";
  label.textContent = piece.readTime;

  const title = document.createElement("h3");
  title.textContent = piece.title;

  const dek = document.createElement("p");
  dek.textContent = piece.dek;

  if (piece.thumbnail) {
    const thumb = document.createElement("div");
    thumb.className = "piece-thumb";
    thumb.style.backgroundImage = `url("${piece.thumbnail}")`;
    card.append(label, thumb, title, dek);
    return card;
  }

  card.append(label, title, dek);
  return card;
}

function renderArchiveList(containerId, type) {
  const container = document.getElementById(containerId);

  if (!container || !window.HBContent) {
    return;
  }

  const pieces = window.HBContent.getAllPieces().filter((piece) => piece.type === type);
  container.replaceChildren(...pieces.map(buildPieceCard));
}

window.HBArchive = {
  renderArchiveList
};
