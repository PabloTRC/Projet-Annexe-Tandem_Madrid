import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { LiveBadge } from "../components/Badge"
import { getClass, initialLiveQuestions, liveQuestionsQueue, teacher, categoryLabels } from "../data/mockData"
import { groupSimilarQuestions, SYNTHESIS_TEMPLATE } from "../lib/questions"

export default function TeacherLive() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const classData = getClass(classId)

  const [questions, setQuestions] = useState(initialLiveQuestions[classId] ?? [])
  const [lastAddedId, setLastAddedId] = useState(null)
  const [synthesis, setSynthesis] = useState("")
  const [generating, setGenerating] = useState(false)
  const nextIdRef = useRef((initialLiveQuestions[classId]?.length ?? 0) + 1)
  const queueIndexRef = useRef(0)

  useEffect(() => {
    const queue = liveQuestionsQueue[classId] ?? []
    if (queue.length === 0) return undefined

    const interval = setInterval(() => {
      const template = queue[queueIndexRef.current % queue.length]
      queueIndexRef.current += 1
      const id = nextIdRef.current++
      const question = {
        id,
        studentId: template.studentId,
        text: template.text,
        category: template.category,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }
      setQuestions((qs) => [...qs, question])
      setLastAddedId(id)
    }, 9000)

    return () => clearInterval(interval)
  }, [classId])

  if (!classData) {
    return (
      <div>
        <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacher.name} />
        <main className="mx-auto max-w-5xl px-5 py-8">Classe introuvable.</main>
      </div>
    )
  }

  const studentsById = new Map(classData.students.map((s) => [s.id, s]))
  const groups = groupSimilarQuestions(questions)

  function generateSynthesis() {
    setGenerating(true)
    setSynthesis("")
    setTimeout(() => {
      setSynthesis(SYNTHESIS_TEMPLATE)
      setGenerating(false)
    }, 1200)
  }

  function endSession() {
    navigate(`/teacher/class/${classId}`)
  }

  return (
    <div>
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacher.name} />
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(`/teacher/class/${classId}`)}
          className="mb-4 inline-block text-sm text-text-muted hover:text-black"
        >
          ← Retour à la classe
        </button>

        <div className="mb-6 flex items-center gap-3">
          <LiveBadge />
          <h1 className="text-2xl font-bold">
            {classData.name} {classData.subject}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-3 text-lg font-bold">Questions des élèves</h2>
            {groups.length === 0 ? (
              <div className="rounded-xl border border-border bg-white p-6 text-center text-sm text-text-muted">
                Aucune question pour le moment.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {groups.map((group, gi) => (
                  <div key={gi} className="rounded-xl border border-border bg-white p-4">
                    <div className="mb-2 text-sm font-semibold text-text-muted">
                      {group.count > 1 ? `${group.count} élèves ont posé une question similaire` : "1 élève"}
                    </div>
                    <div className="flex flex-col gap-3">
                      {group.questions
                        .slice()
                        .sort((a, b) => a.id - b.id)
                        .map((q) => {
                          const s = studentsById.get(q.studentId)
                          return (
                            <div
                              key={q.id}
                              className={`rounded-lg px-3 py-2 text-sm ${
                                q.id === lastAddedId ? "bg-primary-light" : "bg-bg"
                              }`}
                            >
                              <div>{q.text}</div>
                              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-text-muted">
                                <span>{s ? s.name : "Élève"}</span>
                                <span>·</span>
                                <span>{categoryLabels[q.category]}</span>
                                <span>·</span>
                                <span>{q.time}</span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-white p-4">
              <h3 className="mb-2 font-semibold">Synthèse des questions</h3>
              <button
                type="button"
                onClick={generateSynthesis}
                disabled={generating}
                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {generating ? "Génération en cours…" : synthesis ? "Régénérer la synthèse" : "Générer la synthèse"}
              </button>
              {synthesis && (
                <div className="mt-3 whitespace-pre-line rounded-lg bg-bg p-3 text-sm">{synthesis}</div>
              )}
            </div>
            <button
              type="button"
              onClick={endSession}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-bg"
            >
              Terminer la séance
            </button>
          </aside>
        </div>
      </main>
    </div>
  )
}
