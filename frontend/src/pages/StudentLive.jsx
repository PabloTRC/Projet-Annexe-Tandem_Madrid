import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { LiveBadge } from '../components/Badge'
import { getCoursById } from '../services/coursService'
import { getDocumentsBySeance } from '../services/documentsService'
import { getSeanceEnCours } from '../services/seancesService'
import { getMesQuestionsBySeance, poserQuestion } from '../services/questionsService'
import { eleves, ELEVE_ACTUEL_ID } from '../data/mockStore'
import { formatHeure } from '../utils/format'

const studentName = eleves.find((e) => e.id === ELEVE_ACTUEL_ID)?.nom ?? ''

export default function StudentLive() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState(null)
  const [seance, setSeance] = useState(null)
  const [documentName, setDocumentName] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [c, seanceEnCours] = await Promise.all([getCoursById(courseId), getSeanceEnCours(courseId)])
      if (cancelled) return
      setClassData(c)
      setSeance(seanceEnCours)

      if (seanceEnCours) {
        const [docs, questions] = await Promise.all([
          getDocumentsBySeance(seanceEnCours.id),
          getMesQuestionsBySeance(seanceEnCours.id),
        ])
        if (cancelled) return
        setDocumentName(docs[0]?.donnees.nom ?? null)
        setMyQuestions(questions)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [courseId])

  async function submitQuestion(e) {
    e.preventDefault()
    const texte = draft.trim()
    if (!texte || !seance) return
    setSubmitting(true)
    await poserQuestion(seance.id, texte)
    setMyQuestions(await getMesQuestionsBySeance(seance.id))
    setDraft('')
    setSubmitting(false)
  }

  function downloadDocument() {
    if (!documentName) return
    const contenu = `Support de séance : ${documentName}\n\n(Document simulé pour la démo MVP.)`
    const blob = new Blob([contenu], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = documentName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div>
        <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
        <main className="mx-auto max-w-2xl px-5 py-8">Chargement…</main>
      </div>
    )
  }

  if (!classData || !seance) {
    return (
      <div>
        <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
        <main className="mx-auto max-w-2xl px-5 py-8">Séance introuvable.</main>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
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
          <h1 className="text-2xl font-bold">{classData.titre}</h1>
        </div>

        {documentName && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-primary-light px-4 py-3">
            <span className="font-bold text-primary-dark">📄 {documentName}</span>
            <button
              type="button"
              onClick={downloadDocument}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Télécharger
            </button>
          </div>
        )}

        <h2 className="mb-3 text-lg font-bold">Mes questions</h2>
        {myQuestions.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-6 text-center text-sm text-text-muted">
            Vous n&apos;avez pas encore posé de question pendant cette séance.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {myQuestions.map((q) => (
              <div key={q.id} className="rounded-lg border border-border bg-white px-3 py-2 text-sm">
                <div>{q.texte}</div>
                <div className="mt-1 text-xs text-text-muted">{formatHeure(q.horodatage)}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <form onSubmit={submitQuestion} className="fixed inset-x-0 bottom-0 flex gap-2 border-t border-border bg-white p-4">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Poser une question…"
            autoComplete="off"
            disabled={submitting}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-2 focus:outline-primary"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  )
}
