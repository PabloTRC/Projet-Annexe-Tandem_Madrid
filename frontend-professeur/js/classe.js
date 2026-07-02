(function () {
  const { coursService, elevesService, documentsService, seancesService } = window.App.services;
  const { badgeStatutEleve, formatDateHeure, debounce, qs, escapeHtml } = window.App.render;

  const coursId = qs("coursId");
  if (!coursId) {
    document.getElementById("classe-title").textContent = "Classe introuvable";
  }

  let elevesActuels = [];
  let filtreDifficulteActif = false;

  const titleEl = document.getElementById("classe-title");
  const metaEl = document.getElementById("classe-meta");
  const elevesListEl = document.getElementById("eleves-list");
  const toggleEl = document.getElementById("toggle-difficulte");
  const documentsListEl = document.getElementById("documents-list");
  const dropzoneEl = document.getElementById("dropzone");
  const fileInputEl = document.getElementById("file-input");
  const browseBtn = document.getElementById("btn-browse");
  const agendaTextarea = document.getElementById("agenda-textarea");
  const saveIndicator = document.getElementById("save-indicator");
  const btnLancer = document.getElementById("btn-lancer");

  function renderElevesList() {
    const liste = filtreDifficulteActif
      ? elevesActuels.filter((e) => e.statut === "difficulte")
      : elevesActuels;

    if (liste.length === 0) {
      elevesListEl.innerHTML = `<div class="empty-state">Aucun élève à afficher.</div>`;
      return;
    }

    elevesListEl.innerHTML = liste
      .map(
        (e) => `
        <a class="eleve-row" href="eleve.html?coursId=${coursId}&eleveId=${e.id}">
          <span class="eleve-row__nom">${escapeHtml(e.nom)}</span>
          ${badgeStatutEleve(e.statut)}
        </a>
      `
      )
      .join("");
  }

  function renderDocuments(docs) {
    if (docs.length === 0) {
      documentsListEl.innerHTML = `<div class="empty-state">Aucun document partagé pour l'instant.</div>`;
      return;
    }
    documentsListEl.innerHTML = docs
      .map(
        (d) => `
        <div class="doc-row">
          <span class="doc-row__name">📄 ${escapeHtml(d.donnees.nom)}</span>
          <span class="text-muted text-sm">${d.donnees.taille} · ${formatDateHeure(d.created_at)}</span>
        </div>
      `
      )
      .join("");
  }

  async function loadDocuments() {
    const docs = await documentsService.getDocumentsByClasse(coursId);
    renderDocuments(docs);
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    for (const file of files) {
      const tailleKo = Math.max(1, Math.round(file.size / 1024));
      const taille = tailleKo >= 1024 ? `${(tailleKo / 1024).toFixed(1)} Mo` : `${tailleKo} Ko`;
      await documentsService.addDocument(coursId, null, { nom: file.name, taille });
    }
    await loadDocuments();
  }

  async function init() {
    const [cours, eleves, creneau] = await Promise.all([
      coursService.getClasseById(coursId),
      elevesService.getElevesByClasse(coursId),
      seancesService.getCreneauActif(coursId),
    ]);

    if (!cours) {
      titleEl.textContent = "Classe introuvable";
      return;
    }

    titleEl.textContent = cours.titre;
    metaEl.textContent = `${eleves.length} élèves`;
    elevesActuels = eleves;
    renderElevesList();

    agendaTextarea.value = cours.agenda || "";

    await loadDocuments();

    if (creneau) {
      btnLancer.disabled = false;
      btnLancer.textContent = creneau.enCours ? "Reprendre le cours" : "Lancer le cours";
      btnLancer.addEventListener("click", async () => {
        btnLancer.disabled = true;
        if (!creneau.enCours) {
          await seancesService.demarrerSeance(creneau.seance.id);
        }
        window.location.href = `seance-direct.html?seanceId=${creneau.seance.id}`;
      });
    } else {
      btnLancer.textContent = "Aucun créneau planifié";
    }
  }

  toggleEl.addEventListener("change", () => {
    filtreDifficulteActif = toggleEl.checked;
    renderElevesList();
  });

  browseBtn.addEventListener("click", () => fileInputEl.click());
  fileInputEl.addEventListener("change", (e) => handleFiles(e.target.files));

  ["dragenter", "dragover"].forEach((evt) =>
    dropzoneEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzoneEl.classList.add("dropzone--active");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzoneEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzoneEl.classList.remove("dropzone--active");
    })
  );
  dropzoneEl.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));

  const saveAgenda = debounce(async (value) => {
    saveIndicator.textContent = "Enregistrement…";
    saveIndicator.className = "save-indicator save-indicator--saving";
    await coursService.updateAgenda(coursId, value);
    saveIndicator.textContent = "Enregistré";
    saveIndicator.className = "save-indicator save-indicator--saved";
  }, 800);

  agendaTextarea.addEventListener("input", () => {
    saveIndicator.textContent = "";
    saveAgenda(agendaTextarea.value);
  });

  init();
})();
