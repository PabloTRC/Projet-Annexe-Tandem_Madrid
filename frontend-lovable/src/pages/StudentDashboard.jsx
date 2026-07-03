import { Link } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { classes, student } from "../data/mockData"

// Alice Martin is only enrolled in 3ème A Mathématiques.
const enrolledIds = ["c1"]

export default function StudentDashboard() {
  const enrolled = classes.filter((c) => enrolledIds.includes(c.id))
  const todaySlots = enrolled.filter((c) => c.today)
  const weekSlots = enrolled.flatMap((c) => c.week.map((w) => ({ ...w, className: `${c.name} ${c.subject}` })))

  return (
    <div>
      <AppHeader role="Espace élève" roleHome="/student" userName={student.name} />
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-bold">Mes cours</h1>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Emploi du temps — aujourd'hui</h2>
            {todaySlots.length === 0 ? (
              <p className="text-sm text-text-muted">Aucun cours aujourd'hui.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {todaySlots.map((c) => (
                  <li
                    key={c.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      c.nextSession.status === "en_cours" ? "border-live bg-live-bg" : "border-border bg-bg"
                    }`}
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-text-muted">
                      {c.today.time} · {c.room}
                    </span>
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
                {weekSlots.map((w, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                    <span className="font-semibold">{w.className}</span>
                    <span className="text-text-muted">
                      {w.day} {w.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">
            Mes cours · {enrolled.length} cours
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {enrolled.map((c) => {
              const isLive = c.nextSession.status === "en_cours"
              return (
                <Link
                  key={c.id}
                  to={`/student/course/${c.id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="text-lg font-bold">
                    {c.name}
                    {c.subject}
                  </div>
                  <div className="text-sm">
                    {isLive ? (
                      <span className="font-semibold text-live">En direct</span>
                    ) : (
                      <span className="text-text-muted">
                        Prochain : {c.nextSession.day} {c.nextSession.time}
                      </span>
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
