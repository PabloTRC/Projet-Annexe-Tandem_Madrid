import { Link } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { classes, teacher, strugglingCount } from "../data/mockData"

export default function TeacherDashboard() {
  const todaySlots = classes.filter((c) => c.today)
  const weekSlots = classes.flatMap((c) => c.week.map((w) => ({ ...w, className: `${c.name} ${c.subject}` })))

  return (
    <div>
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacher.name} />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-bold">Bonjour, prêt pour la journée ?</h1>
        <p className="mt-1 text-sm text-text-muted">{teacher.name}</p>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">Emploi du temps — aujourd'hui</h2>
            {todaySlots.length === 0 ? (
              <p className="text-sm text-text-muted">Aucun créneau aujourd'hui.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {todaySlots.map((c) => (
                  <li
                    key={c.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                      c.nextSession.status === "en_cours"
                        ? "border-live bg-live-bg"
                        : "border-border bg-bg"
                    }`}
                  >
                    <span className="font-semibold">
                      {c.name} {c.subject}
                    </span>
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
          <h2 className="mb-4 text-lg font-bold">Mes classes · {classes.length} classes</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => {
              const struggling = strugglingCount(c)
              const isLive = c.nextSession.status === "en_cours"
              return (
                <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold">
                        {c.name} {c.subject}
                      </div>
                      <div className="mt-1 text-sm text-text-muted">{c.students.length} élèves</div>
                    </div>
                    {struggling > 0 && (
                      <span className="whitespace-nowrap rounded-full bg-difficulte-bg px-2 py-0.5 text-sm font-semibold text-difficulte">
                        {struggling} en difficulté
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-muted">
                    {isLive ? (
                      <span className="font-semibold text-live">En cours</span>
                    ) : (
                      <>Prochain : {c.nextSession.day} {c.nextSession.time}</>
                    )}
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
