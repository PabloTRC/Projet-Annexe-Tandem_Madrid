import { request } from '../lib/apiClient'
import { contenus } from '../data/mockStore'

export function getDocumentsByClasse(coursId) {
  return request(`/cours/${coursId}/contenus`, {
    mockResolver: () =>
      contenus
        .filter((c) => c.cours_id === Number(coursId))
        .map((c) => ({ ...c }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  })
}

export function getDocumentsBySeance(seanceId) {
  return request(`/seances/${seanceId}/contenus`, {
    mockResolver: () => contenus.filter((c) => c.seance_id === Number(seanceId)).map((c) => ({ ...c })),
  })
}

export function addDocument(coursId, seanceId, fichier) {
  return request(`/cours/${coursId}/contenus`, {
    method: 'POST',
    body: { seanceId, fichier },
    mockResolver: () => {
      const nextId = Math.max(0, ...contenus.map((c) => c.id)) + 1
      const contenu = {
        id: nextId,
        cours_id: Number(coursId),
        seance_id: seanceId ? Number(seanceId) : null,
        type: 'document',
        donnees: { nom: fichier.nom, taille: fichier.taille },
        created_at: new Date().toISOString(),
      }
      contenus.unshift(contenu)
      return { ...contenu }
    },
  })
}
