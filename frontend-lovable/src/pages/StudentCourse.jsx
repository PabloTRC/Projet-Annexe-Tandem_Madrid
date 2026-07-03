import { Link, useNavigate, useParams } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { getClass, student } from "../data/mockData"

export default function StudentCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const classData = getClass(courseId)

  if (!classData) {
    return (
      <div>
        <AppHeader role="Espace élève" roleHome="/student" userName={student.name} />
        <main className="mx-auto max-w-3xl px-5 py-8">Cours introuvable.</main>
      </div>
    )
  }

  const isLive = classData.nextSession.status === "en_cours"

  return (
    <div>
      <AppHeader role="Espace élève" roleHome="/student" userName={student.name} />
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link to="/student" className="mb-4 inline-block text-sm text-text-muted hover:text-black">
          ← Retour à mes cours
        </Link>
        <h1 className="text-2xl font-bold">
          {classData.name} <span className="font-normal text-text-muted">{classData.subject}</span>
        </h1>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Agenda du cours</h2>
          <div className="rounded-xl border border-border bg-white p-4 text-sm">{classData.agenda}</div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Documents des séances précédentes</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
            {classData.documents.length === 0 ? (
              <div className="py-4 text-center text-sm text-text-muted">Aucun document pour l'instant.</div>
            ) : (
              classData.documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>📄 {d.name}</span>
                  <span className="text-text-muted">
                    {d.size} · {d.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          {isLive ? (
            <button
              type="button"
              onClick={() => navigate(`/student/course/${courseId}/live`)}
              className="w-full rounded-lg bg-live px-4 py-3 font-semibold text-white hover:bg-[#c73631]"
            >
              Rejoindre la séance en direct
            </button>
          ) : (
            <div className="rounded-xl border border-border bg-white p-4 text-center text-sm text-text-muted">
              Le cours n'est pas encore lancé. Vous serez basculé automatiquement dès que le professeur démarrera la
              séance.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
