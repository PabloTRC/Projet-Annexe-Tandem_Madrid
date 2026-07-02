import { request } from '../lib/apiClient'
import { cours, professeurs, ELEVE_ACTUEL_ID } from '../data/mockStore'

function withProfesseurNom(c) {
  const prof = professeurs.find((p) => p.id === c.professeur_id)
  return { ...c, professeur_nom: prof ? prof.nom : '' }
}

/** Toutes les classes du professeur connecté (vue professeur). */
export function getClasses() {
  return request('/cours', {
    mockResolver: () => cours.map((c) => ({ ...c })),
  })
}

export function getClasseById(coursId) {
  return request(`/cours/${coursId}`, {
    mockResolver: () => {
      const c = cours.find((x) => x.id === Number(coursId))
      return c ? { ...c } : null
    },
  })
}

export function updateAgenda(coursId, agenda) {
  return request(`/cours/${coursId}`, {
    method: 'PATCH',
    body: { agenda },
    mockResolver: () => {
      const c = cours.find((x) => x.id === Number(coursId))
      if (c) c.agenda = agenda
      return c ? { ...c } : null
    },
  })
}

/** Cours suivis par l'élève connecté (vue élève). */
export function getMesCours() {
  return request('/moi/cours', {
    mockResolver: () =>
      cours.filter((c) => c.eleve_ids.includes(ELEVE_ACTUEL_ID)).map((c) => withProfesseurNom(c)),
  })
}

export function getCoursById(coursId) {
  return request(`/cours/${coursId}`, {
    mockResolver: () => {
      const c = cours.find((x) => x.id === Number(coursId))
      return c ? withProfesseurNom(c) : null
    },
  })
}
