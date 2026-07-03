import { STATUT_CLASSES, labelStatutEleve } from '../utils/format'

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-sm font-semibold ${
        STATUT_CLASSES[status] || STATUT_CLASSES.pas_de_donnees
      }`}
    >
      {labelStatutEleve(status)}
    </span>
  )
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-live-bg px-2 py-0.5 text-sm font-semibold text-live">
      <span className="h-1.5 w-1.5 rounded-full bg-live" style={{ animation: 'livepulse 1.4s ease-in-out infinite' }} />
      En direct
    </span>
  )
}
