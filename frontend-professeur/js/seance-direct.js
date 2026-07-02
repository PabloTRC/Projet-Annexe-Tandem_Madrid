(function () {
  const { coursService, elevesService, seancesService, documentsService, questionsService } = window.App.services;
  const { labelCategorie, formatHeure, qs, escapeHtml } = window.App.render;

  const seanceId = qs("seanceId");

  let questionsActuelles = [];
  let elevesParId = new Map();
  let coursActuel = null;
  let dernierAjoutId = null;
  let unsubscribe = null;

  const groupsEl = document.getElementById("questions-groups");
  const btnSynthese = document.getElementById("btn-synthese");
  const syntheseResultEl = document.getElementById("synthese-result");
  const btnTerminer = document.getElementById("btn-terminer");
  const backLink = document.getElementById("back-link");

  function renderGroups() {
    if (questionsActuelles.length === 0) {
      groupsEl.innerHTML = `<div class="empty-state">Aucune question pour le moment.</div>`;
      return;
    }

    const groupes = questionsService.groupSimilarQuestions(questionsActuelles);

    groupsEl.innerHTML = groupes
      .map((groupe) => {
        const countLabel =
          groupe.count > 1 ? `${groupe.count} élèves ont posé une question similaire` : `1 élève`;

        const items = groupe.questions
          .slice()
          .sort((a, b) => new Date(a.horodatage) - new Date(b.horodatage))
          .map((q) => {
            const eleve = elevesParId.get(q.eleve_id);
            const isNew = q.id === dernierAjoutId;
            return `
              <div class="question-item ${isNew ? "question-item--new" : ""}">
                <div>${escapeHtml(q.texte)}</div>
                <div class="question-item__meta">
                  <span>${eleve ? escapeHtml(eleve.nom) : "Élève"}</span>
                  <span>·</span>
                  <span>${labelCategorie(q.categorie)}</span>
                  <span>·</span>
                  <span>${formatHeure(q.horodatage)}</span>
                </div>
              </div>
            `;
          })
          .join("");

        return `
          <div class="card question-group">
            <div class="question-group__count">${countLabel}</div>
            ${items}
          </div>
        `;
      })
      .join("");
  }

  function onNewQuestion(question) {
    questionsActuelles.push(question);
    dernierAjoutId = question.id;
    renderGroups();
  }

  async function init() {
    const seance = await seancesService.getSeanceById(seanceId);
    if (!seance) {
      document.getElementById("seance-title").textContent = "Séance introuvable";
      return;
    }

    const [cours, eleves, documents, questions] = await Promise.all([
      coursService.getClasseById(seance.cours_id),
      elevesService.getElevesByClasse(seance.cours_id),
      documentsService.getDocumentsBySeance(seanceId),
      questionsService.getQuestionsBySeance(seanceId),
    ]);

    coursActuel = cours;
    elevesParId = new Map(eleves.map((e) => [e.id, e]));
    questionsActuelles = questions;

    document.getElementById("seance-title").textContent = cours.titre;
    backLink.href = `classe.html?coursId=${cours.id}`;
    document.getElementById("doc-info").textContent = documents.length
      ? `📄 ${documents[0].donnees.nom}`
      : "Aucun document déposé pour cette séance";

    renderGroups();

    unsubscribe = questionsService.subscribeToLiveQuestions(seanceId, onNewQuestion);
  }

  btnSynthese.addEventListener("click", async () => {
    btnSynthese.disabled = true;
    btnSynthese.textContent = "Génération en cours…";
    syntheseResultEl.textContent = "";

    const synthese = await questionsService.genererSyntheseQuestions(seanceId);

    syntheseResultEl.textContent = synthese.texte_genere;
    btnSynthese.disabled = false;
    btnSynthese.textContent = "Régénérer la synthèse";
  });

  btnTerminer.addEventListener("click", async () => {
    btnTerminer.disabled = true;
    if (unsubscribe) unsubscribe();
    await seancesService.terminerSeance(seanceId);
    window.location.href = coursActuel ? `classe.html?coursId=${coursActuel.id}` : "index.html";
  });

  window.addEventListener("beforeunload", () => {
    if (unsubscribe) unsubscribe();
  });

  init();
})();
