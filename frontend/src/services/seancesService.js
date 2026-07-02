import { request } from '../lib/apiClient'
import { seances } from '../data/mockStore'

const IMMINENT_WINDOW_MIN = 30

export function getSeancesByClasse(coursId) {
  return request(`/cours/${coursId}/seances`, {
    mockResolver: () =>
      seances
        .filter((s) => s.cours_id === Number(coursId))
        .map((s) => ({ ...s }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
  })
}

export function getSeanceById(seanceId) {
  return request(`/seances/${seanceId}`, {
    mockResolver: () => {
      const s = seances.find((x) => x.id === Number(seanceId))
      return s ? { ...s } : null
    },
  })
}

/**
 * Renvoie le créneau le plus pertinent pour la carte "classe"/"cours" du
 * dashboard : en priorité une séance en cours, sinon la prochaine séance
 * planifiée (avec un indicateur `imminente` si elle démarre dans moins de
 * 30 min, utile côté professeur pour afficher le bouton "Lancer le cours").
 */
export function getCreneauActif(coursId) {
  return request(`/cours/${coursId}/creneau-actif`, {
    mockResolver: () => {
      const list = seances.filter((s) => s.cours_id === Number(coursId))
      const enCours = list.find((s) => s.statut === 'en_cours')
      if (enCours) return { seance: { ...enCours }, enCours: true, imminente: false }

      const now = Date.now()
      const prochaine = list
        .filter((s) => s.statut === 'planifiee' && new Date(s.date).getTime() >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

      if (!prochaine) return null

      const minutesAvant = (new Date(prochaine.date).getTime() - now) / 60000
      return {
        seance: { ...prochaine },
        enCours: false,
        imminente: minutesAvant <= IMMINENT_WINDOW_MIN,
      }
    },
  })
}

/** Séance en cours pour ce cours, si elle existe (vue élève). */
export function getSeanceEnCours(coursId) {
  return request(`/cours/${coursId}/seance-en-cours`, {
    mockResolver: () => {
      const s = seances.find((x) => x.cours_id === Number(coursId) && x.statut === 'en_cours')
      return s ? { ...s } : null
    },
  })
}

export function demarrerSeance(seanceId) {
  return request(`/seances/${seanceId}/demarrer`, {
    method: 'POST',
    mockResolver: () => {
      const s = seances.find((x) => x.id === Number(seanceId))
      if (s) s.statut = 'en_cours'
      return s ? { ...s } : null
    },
  })
}

export function terminerSeance(seanceId) {
  return request(`/seances/${seanceId}/terminer`, {
    method: 'POST',
    mockResolver: () => {
      const s = seances.find((x) => x.id === Number(seanceId))
      if (s) s.statut = 'terminee'
      return s ? { ...s } : null
    },
  })
}
