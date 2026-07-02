import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getClasses } from '../services/coursService'
import { classesEnDifficulte, getElevesByClasse } from '../services/elevesService'
import { getCreneauActif, getSeancesByClasse } from '../services/seancesService'
import { professeurs } from '../data/mockStore'
import { formatDateCourt, formatHeure, isToday, isWithinWeek } from '../utils/format'

const teacherName = professeurs[0]?.nom ?? ''

export default function TeacherDashboard() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const classes = await getClasses()
      const withData = await Promise.all(
        classes.map(async (c) => {
          const [seances, eleves, nbDifficulte, creneau] = await Promise.all([
            getSeancesByClasse(c.id),
            getElevesByClasse(c.id),
            classesEnDifficulte(c.id),
            getCreneauActif(c.id),
          ])
          return { cours: c, seances, eleves, nbDifficulte, creneau }
        }),
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
        <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">Chargement…</main>
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
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-bold">Bonjour, prêt pour la journée ?</h1>
        <p className="mt-1 text-sm text-text-muted">{teacherName}</p>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Emploi du temps — aujourd&apos;hui</h2>
            {todaySlots.length === 0 ? (
              <p className="text-sm text-text-muted">Aucun créneau aujourd&apos;hui.</p>
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
          <h2 className="mb-4 text-lg font-bold">Mes classes · {rows.length} classes</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ cours: c, eleves, nbDifficulte, creneau }) => {
              const isLive = Boolean(creneau?.enCours)
              const creneauLabel = creneau
                ? `${isToday(creneau.seance.date) ? "Aujourd'hui" : formatDateCourt(creneau.seance.date)} · ${formatHeure(creneau.seance.date)}`
                : 'Aucun créneau prévu'

              return (
                <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold">{c.titre}</div>
                      <div className="mt-1 text-sm text-text-muted">{eleves.length} élèves</div>
                    </div>
                    {nbDifficulte > 0 && (
                      <span className="whitespace-nowrap rounded-full bg-difficulte-bg px-2 py-0.5 text-sm font-semibold text-difficulte">
                        {nbDifficulte} en difficulté
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-muted">
                    {isLive ? <span className="font-semibold text-live">En cours</span> : <>Prochain : {creneauLabel}</>}
                  </div>
                  <div className="mt-1 flex gap-2">
                    <Link
                      to={`/teacher/class/${c.id}`}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-sm font-semibold hover:bg-bg"
                    >
                      Ouvrir la classe
                    </Link>
                    {isLive && (
                      <Link
                        to={`/teacher/class/${c.id}/live`}
                        className="rounded-lg bg-live px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#c73631]"
                      >
                        Rejoindre
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
