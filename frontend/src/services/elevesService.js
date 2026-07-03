import { request } from '../lib/apiClient'
import { cours, eleves, notionsDifficulte, ELEVE_ACTUEL_ID } from '../data/mockStore'

export function getElevesByClasse(coursId) {
  return request(`/cours/${coursId}/eleves`, {
    mockResolver: () => {
      const c = cours.find((x) => x.id === Number(coursId))
      if (!c) return []
      return eleves.filter((e) => c.eleve_ids.includes(e.id)).map((e) => ({ ...e }))
    },
  })
}

export function getEleveById(eleveId) {
  return request(`/eleves/${eleveId}`, {
    mockResolver: () => {
      const e = eleves.find((x) => x.id === Number(eleveId))
      return e ? { ...e } : null
    },
  })
}

export function classesEnDifficulte(coursId) {
  return request(`/cours/${coursId}/eleves?statut=difficulte`, {
    mockResolver: () => {
      const c = cours.find((x) => x.id === Number(coursId))
      if (!c) return 0
      return eleves.filter((e) => c.eleve_ids.includes(e.id) && e.statut === 'difficulte').length
    },
  })
}

export function getNotionsDifficulte(eleveId) {
  return request(`/eleves/${eleveId}/notions-difficulte`, {
    mockResolver: () =>
      notionsDifficulte.filter((n) => n.eleve_id === Number(eleveId)).map((n) => ({ ...n })),
  })
}

export function getEleveActuel() {
  return request('/moi', {
    mockResolver: () => {
      const e = eleves.find((x) => x.id === ELEVE_ACTUEL_ID)
      return { ...e }
    },
  })
}
