import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { LiveBadge } from "../components/Badge"
import { getClass, student } from "../data/mockData"

export default function StudentLive() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const classData = getClass(courseId)
  const [myQuestions, setMyQuestions] = useState([])
  const [draft, setDraft] = useState("")

  if (!classData) {
    return (
      <div>
        <AppHeader role="Espace élève" roleHome="/student" userName={student.name} />
        <main className="mx-auto max-w-2xl px-5 py-8">Séance introuvable.</main>
      </div>
    )
  }

  function submitQuestion(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMyQuestions((qs) => [
      ...qs,
      { id: qs.length + 1, text, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
    ])
    setDraft("")
  }

  return (
    <div className="pb-24">
      <AppHeader role="Espace élève" roleHome="/student" userName={student.name} />
      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(`/student/course/${courseId}`)}
          className="mb-4 inline-block text-sm text-text-muted hover:text-black"
        >
          ← Retour au cours
        </button>

        <div className="mb-6 flex items-center gap-3">
          <LiveBadge />
          <h1 className="text-2xl font-bold">
            {classData.name} {classData.subject}
          </h1>
        </div>

        <h2 className="mb-3 text-lg font-bold">Mes questions</h2>
        {myQuestions.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-6 text-center text-sm text-text-muted">
            Vous n'avez pas encore posé de question pendant cette séance.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {myQuestions.map((q) => (
              <div key={q.id} className="rounded-lg border border-border bg-white px-3 py-2 text-sm">
                <div>{q.text}</div>
                <div className="mt-1 text-xs text-text-muted">{q.time}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <form
        onSubmit={submitQuestion}
        className="fixed inset-x-0 bottom-0 flex gap-2 border-t border-border bg-white p-4"
      >
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Poser une question…"
            autoComplete="off"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-2 focus:outline-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  )
}
