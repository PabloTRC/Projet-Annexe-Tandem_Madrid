import { Link, useParams } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { StatusBadge } from "../components/Badge"
import { getClass, getStudent, teacher } from "../data/mockData"

export default function TeacherStudent() {
  const { classId, studentId } = useParams()
  const classData = getClass(classId)
  const studentData = getStudent(classId, studentId)

  return (
    <div>
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacher.name} />
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link to={`/teacher/class/${classId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-black">
          ← Retour à la classe
        </Link>

        {!studentData ? (
          <p>Élève introuvable.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{studentData.name}</h1>
              <StatusBadge status={studentData.status} />
            </div>
            <p className="mt-1 text-sm text-text-muted">
              {classData.name} · {classData.subject}
            </p>

            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Historique par séance</h2>
              {studentData.history.length === 0 ? (
                <div className="rounded-xl border border-border bg-white p-6 text-center text-sm text-text-muted">
                  Aucune question ni notion signalée pour cet élève.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {studentData.history.map((h, i) => (
                    <div key={i} className="rounded-xl border border-border bg-white p-4">
                      <div className="mb-2 text-sm font-semibold text-text-muted">
                        Séance du {h.date}
                      </div>
                      {h.notions.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {h.notions.map((n, j) => (
                            <span
                              key={j}
                              className="rounded-full bg-difficulte-bg px-2 py-0.5 text-sm font-semibold text-difficulte"
                            >
                              ⚠ {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {h.questions.map((q, j) => (
                        <div key={j} className="text-sm">
                          {q}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
