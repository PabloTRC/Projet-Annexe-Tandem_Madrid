import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { LiveBadge } from '../components/Badge'
import { getClasseById } from '../services/coursService'
import { getElevesByClasse } from '../services/elevesService'
import { getSeanceEnCours, terminerSeance } from '../services/seancesService'
import {
  genererSyntheseQuestions,
  getQuestionsBySeance,
  groupSimilarQuestions,
  subscribeToLiveQuestions,
} from '../services/questionsService'
import { professeurs } from '../data/mockStore'
import { formatHeure, labelCategorie } from '../utils/format'

const teacherName = professeurs[0]?.nom ?? ''

export default function TeacherLive() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState(null)
  const [seance, setSeance] = useState(null)
  const [elevesParId, setElevesParId] = useState(new Map())
  const [questions, setQuestions] = useState([])
  const [lastAddedId, setLastAddedId] = useState(null)
  const [synthesis, setSynthesis] = useState('')
  const [generating, setGenerating] = useState(false)
  const [ending, setEnding] = useState(false)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [c, seanceEnCours, eleves] = await Promise.all([
        getClasseById(classId),
        getSeanceEnCours(classId),
        getElevesByClasse(classId),
      ])
      if (cancelled) return
      setClassData(c)
      setSeance(seanceEnCours)
      setElevesParId(new Map(eleves.map((e) => [e.id, e])))

      if (seanceEnCours) {
        const qs = await getQuestionsBySeance(seanceEnCours.id)
        if (cancelled) return
        setQuestions(qs)
        unsubscribeRef.current = subscribeToLiveQuestions(seanceEnCours.id, (q) => {
          setQuestions((prev) => [...prev, q])
          setLastAddedId(q.id)
        })
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
      unsubscribeRef.current?.()
    }
  }, [classId])

  if (loading) {
    return (
      <div>
        <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
        <main className="mx-auto max-w-5xl px-5 py-8">Chargement…</main>
      </div>
    )
  }

  if (!classData || !seance) {
    return (
      <div>
        <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
        <main className="mx-auto max-w-5xl px-5 py-8">
          {classData ? 'Aucune séance en cours pour cette classe.' : 'Classe introuvable.'}
        </main>
      </div>
    )
  }

  const groups = groupSimilarQuestions(questions)

  async function generateSynthesis() {
    setGenerating(true)
    setSynthesis('')
    const result = await genererSyntheseQuestions(seance.id)
    setSynthesis(result.texte_genere)
    setGenerating(false)
  }

  async function endSession() {
    setEnding(true)
    unsubscribeRef.current?.()
    await terminerSeance(seance.id)
    navigate(`/teacher/class/${classId}`)
  }

  return (
    <div>
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
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
          <h1 className="text-2xl font-bold">{classData.titre}</h1>
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
                      {group.count > 1 ? `${group.count} élèves ont posé une question similaire` : '1 élève'}
                    </div>
                    <div className="flex flex-col gap-3">
                      {group.questions
                        .slice()
                        .sort((a, b) => new Date(a.horodatage) - new Date(b.horodatage))
                        .map((q) => {
                          const eleve = elevesParId.get(q.eleve_id)
                          return (
                            <div
                              key={q.id}
                              className={`rounded-lg px-3 py-2 text-sm ${
                                q.id === lastAddedId ? 'bg-primary-light' : 'bg-bg'
                              }`}
                            >
                              <div>{q.texte}</div>
                              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-text-muted">
                                <span>{eleve ? eleve.nom : 'Élève'}</span>
                                <span>·</span>
                                <span>{labelCategorie(q.categorie)}</span>
                                <span>·</span>
                                <span>{formatHeure(q.horodatage)}</span>
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
                {generating ? 'Génération en cours…' : synthesis ? 'Régénérer la synthèse' : 'Générer la synthèse'}
              </button>
              {synthesis && (
                <div className="mt-3 whitespace-pre-line rounded-lg bg-bg p-3 text-sm">{synthesis}</div>
              )}
            </div>
            <button
              type="button"
              onClick={endSession}
              disabled={ending}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-bg disabled:opacity-50"
            >
              Terminer la séance
            </button>
          </aside>
        </div>
      </main>
    </div>
  )
}
