// Client minimal pour l'API backend (FastAPI). Toutes les fonctions
// renvoient une Promise et lancent une Error avec un message lisible en
// cas d'echec (statut HTTP >= 400).

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // reponse non-JSON, on garde le statusText
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // ---- Cours ----
  getCours: () => request("/cours"),
  getCoursFull: (coursId) => request(`/cours/${coursId}/full`),

  // ---- Seances ----
  getSeanceFull: (seanceId) => request(`/seances/${seanceId}/full`),

  // ---- Eleves ----
  getEleves: () => request("/eleves"),
  createEleve: (nom) =>
    request("/eleves", { method: "POST", body: JSON.stringify({ nom }) }),

  // ---- Questions ----
  getQuestions: (seanceId) => request(`/seances/${seanceId}/questions`),
  createQuestion: (seanceId, texte, eleveId) =>
    request(`/seances/${seanceId}/questions`, {
      method: "POST",
      body: JSON.stringify({ texte, eleve_id: eleveId ?? null }),
    }),

  // ---- Syntheses (generation via LLM) ----
  genererSyntheseQuestions: (seanceId) =>
    request(`/seances/${seanceId}/synthese-questions/generer`, { method: "POST" }),
  genererSyntheseCours: (seanceId) =>
    request(`/seances/${seanceId}/synthese-cours/generer`, { method: "POST" }),

  // ---- Contenus (documents deposes par le professeur) ----
  getContenus: (seanceId) => request(`/seances/${seanceId}/contenus`),
  uploadContenu: async (seanceId, file, type = "fichier") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch(`${API_URL}/seances/${seanceId}/contenus/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail || detail;
      } catch {
        // reponse non-JSON
      }
      throw new Error(detail);
    }
    return res.json();
  },
  downloadContenuUrl: (seanceId, contenuId) =>
    `${API_URL}/seances/${seanceId}/contenus/${contenuId}/download`,
};

export default api;
