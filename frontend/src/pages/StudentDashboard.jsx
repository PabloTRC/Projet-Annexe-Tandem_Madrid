import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getMesCours } from '../services/coursService'
import { getCreneauActif, getSeancesByClasse } from '../services/seancesService'
import { eleves, ELEVE_ACTUEL_ID } from '../data/mockStore'
import { formatDateCourt, formatHeure, isToday, isWithinWeek } from '../utils/format'

const studentName = eleves.find((e) => e.id === ELEVE_ACTUEL_ID)?.nom ?? ''

export default function StudentDashboard() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const mesCours = await getMesCours()
      const withData = await Promise.all(
        mesCours.map(async (c) => ({
          cours: c,
          seances: await getSeancesByClasse(c.id),
          creneau: await getCreneauActif(c.id),
        })),
      )
      if (!cancelled) setRows(withData)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!rows) {
    return (
      <div>
        <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
        <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">Chargement…</main>
      </div>
    )
  }

  const todaySlots = []
  const weekSlots = []
  rows.forEach(({ cours: c, seances }) => {
    seances.forEach((s) => {
      if (s.statut === 'en_cours' || (s.statut === 'planifiee' && isWithinWeek(s.date))) {
        const slot = { cours: c, seance: s }
        if (isToday(s.date)) todaySlots.push(slot)
        else weekSlots.push(slot)
      }
    })
  })
  todaySlots.sort((a, b) => new Date(a.seance.date) - new Date(b.seance.date))
  weekSlots.sort((a, b) => new Date(a.seance.date) - new Date(b.seance.date))

  return (
    <div>
      <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-bold">Mes cours</h1>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Emploi du temps — aujourd&apos;hui</h2>
            {todaySlots.length === 0 ? (
              <p className="text-sm text-text-muted">Aucun cours aujourd&apos;hui.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {todaySlots.map(({ cours: c, seance }) => (
                  <li
                    key={seance.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      seance.statut === 'en_cours' ? 'border-live bg-live-bg' : 'border-border bg-bg'
                    }`}
                  >
                    <span className="font-semibold">{c.titre}</span>
                    <span className="text-text-muted">{formatHeure(seance.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Reste de la semaine</h2>
            {weekSlots.length === 0 ? (
              <p className="text-sm text-text-muted">Aucun autre créneau cette semaine.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {weekSlots.map(({ cours: c, seance }) => (
                  <li key={seance.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                    <span className="font-semibold">{c.titre}</span>
                    <span className="text-text-muted">
                      {formatDateCourt(seance.date)} · {formatHeure(seance.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">Mes cours · {rows.length} cours</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {rows.map(({ cours: c, creneau }) => {
              const isLive = Boolean(creneau?.enCours)
              return (
                <Link
                  key={c.id}
                  to={`/student/course/${c.id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="text-lg font-bold">{c.titre}</div>
                  <div className="text-sm text-text-muted">{c.professeur_nom}</div>
                  <div className="text-sm">
                    {isLive ? (
                      <span className="font-semibold text-live">En direct</span>
                    ) : creneau ? (
                      <span className="text-text-muted">
                        Prochain :{' '}
                        {isToday(creneau.seance.date) ? "Aujourd'hui" : formatDateCourt(creneau.seance.date)} ·{' '}
                        {formatHeure(creneau.seance.date)}
                      </span>
                    ) : (
                      <span className="text-text-muted">Aucun créneau prévu</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
