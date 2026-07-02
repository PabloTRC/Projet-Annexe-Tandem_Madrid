export const STATUT_LABELS = {
  a_jour: 'À jour',
  difficulte: 'En difficulté',
  pas_de_donnees: 'Pas de données',
}

export const CATEGORIE_LABELS = {
  elementaire: 'Élémentaire',
  approfondie: 'Approfondie',
  cours_anterieur: 'Cours antérieur',
}

export const STATUT_CLASSES = {
  a_jour: 'bg-ok-bg text-ok',
  difficulte: 'bg-difficulte-bg text-difficulte',
  pas_de_donnees: 'bg-inconnu-bg text-inconnu',
}

export function labelStatutEleve(statut) {
  return STATUT_LABELS[statut] || 'Pas de données'
}

export function labelCategorie(categorie) {
  return CATEGORIE_LABELS[categorie] || 'Non classée'
}

export function formatDateCourt(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatHeure(isoString) {
  const d = new Date(isoString)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateHeure(isoString) {
  return `${formatDateCourt(isoString)} · ${formatHeure(isoString)}`
}

export function isToday(dateIso) {
  return new Date(dateIso).toDateString() === new Date().toDateString()
}

export function isWithinWeek(dateIso) {
  const d = new Date(dateIso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)
  return d >= startOfToday && d < endOfWeek
}
