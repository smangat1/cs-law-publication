const archiveShell = document.querySelector("[data-archive-type][data-archive-grid]");

if (archiveShell && window.HBArchive) {
  const archiveType = archiveShell.dataset.archiveType;
  const archiveGrid = archiveShell.dataset.archiveGrid;

  if (archiveType && archiveGrid) {
    window.HBArchive.renderArchiveList(archiveGrid, archiveType);
  }
}
