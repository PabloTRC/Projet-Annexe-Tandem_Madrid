(function () {
  const { coursService, seancesService, documentsService, questionsService } = window.App.services;
  const { formatHeure, qs, escapeHtml } = window.App.render;

  const seanceId = qs("seanceId");

  const mesQuestionsEl = document.getElementById("mes-questions");
  const docBannerEl = document.getElementById("doc-banner");
  const form = document.getElementById("question-form");
  const input = document.getElementById("question-input");

  function renderQuestions(questions) {
    if (questions.length === 0) {
      mesQuestionsEl.innerHTML = `<div class="empty-state">Vous n'avez pas encore posé de question.</div>`;
      return;
    }
    mesQuestionsEl.innerHTML = questions
      .map(
        (q) => `
        <div class="card mes-questions-item">
          <div>${escapeHtml(q.texte)}</div>
          <div class="mes-questions-item__meta">Posée à ${formatHeure(q.horodatage)}</div>
        </div>
      `
      )
      .join("");
  }

  function declencherTelechargement(nom) {
    const contenu = `Support de séance : ${nom}\n\n(Document simulé pour la démo MVP.)`;
    const blob = new Blob([contenu], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function init() {
    const seance = await seancesService.getSeanceById(seanceId);
    if (!seance) {
      document.getElementById("seance-title").textContent = "Séance introuvable";
      return;
    }

    const cours = await coursService.getCoursById(seance.cours_id);
    document.getElementById("back-link").href = `cours.html?coursId=${seance.cours_id}`;

    if (seance.statut !== "en_cours") {
      window.location.replace(`cours.html?coursId=${seance.cours_id}`);
      return;
    }

    document.getElementById("seance-title").textContent = cours ? cours.titre : "Séance";

    const documents = await documentsService.getDocumentsBySeance(seanceId);
    if (documents.length > 0) {
      const nom = documents[0].donnees.nom;
      docBannerEl.hidden = false;
      docBannerEl.innerHTML = `
        <span class="live-doc-banner__name">📄 ${escapeHtml(nom)}</span>
        <button class="btn btn--sm btn--primary" type="button" id="btn-telecharger">Télécharger</button>
      `;
      document.getElementById("btn-telecharger").addEventListener("click", () => declencherTelechargement(nom));
    }

    const mesQuestions = await questionsService.getMesQuestionsBySeance(seanceId);
    renderQuestions(mesQuestions);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const texte = input.value.trim();
      if (!texte) return;

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      input.disabled = true;

      await questionsService.poserQuestion(seanceId, texte);
      const questionsAJour = await questionsService.getMesQuestionsBySeance(seanceId);
      renderQuestions(questionsAJour);

      input.value = "";
      input.disabled = false;
      submitBtn.disabled = false;
      input.focus();
    });
  }

  init();
})();
