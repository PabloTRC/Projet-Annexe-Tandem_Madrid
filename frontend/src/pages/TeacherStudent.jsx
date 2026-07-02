import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { StatusBadge } from '../components/Badge'
import { getClasseById } from '../services/coursService'
import { getEleveById, getNotionsDifficulte } from '../services/elevesService'
import { getQuestionsByEleve } from '../services/questionsService'
import { getSeanceById } from '../services/seancesService'
import { professeurs } from '../data/mockStore'
import { formatDateCourt, formatHeure, labelCategorie } from '../utils/format'

const teacherName = professeurs[0]?.nom ?? ''

export default function TeacherStudent() {
  const { classId, studentId } = useParams()
  const [classData, setClassData] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [c, eleve, questions, notions] = await Promise.all([
        getClasseById(classId),
        getEleveById(studentId),
        getQuestionsByEleve(studentId),
        getNotionsDifficulte(studentId),
      ])
      if (cancelled) return
      setClassData(c)
      setStudentData(eleve)

      const seanceIds = [...new Set([...questions.map((q) => q.seance_id), ...notions.map((n) => n.seance_id)])]
      const seances = (await Promise.all(seanceIds.map((id) => getSeanceById(id)))).filter(Boolean)
      seances.sort((a, b) => new Date(b.date) - new Date(a.date))

      if (cancelled) return
      setHistory(
        seances.map((seance) => ({
          seance,
          questions: questions.filter((q) => q.seance_id === seance.id),
          notions: notions.filter((n) => n.seance_id === seance.id),
        })),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [classId, studentId])

  return (
    <div>
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link to={`/teacher/class/${classId}`} className="mb-4 inline-block text-sm text-text-muted hover:text-black">
          ← Retour à la classe
        </Link>

        {loading ? (
          <p>Chargement…</p>
        ) : !studentData ? (
          <p>Élève introuvable.</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{studentData.nom}</h1>
              <StatusBadge status={studentData.statut} />
            </div>
            <p className="mt-1 text-sm text-text-muted">{classData?.titre}</p>

            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Historique par séance</h2>
              {history.length === 0 ? (
                <div className="rounded-xl border border-border bg-white p-6 text-center text-sm text-text-muted">
                  Aucune question ni notion signalée pour cet élève.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.map(({ seance, questions, notions }) => (
                    <div key={seance.id} className="rounded-xl border border-border bg-white p-4">
                      <div className="mb-2 text-sm font-semibold text-text-muted">
                        Séance du {formatDateCourt(seance.date)}
                      </div>
                      {notions.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {notions.map((n, j) => (
                            <span
                              key={j}
                              className="rounded-full bg-difficulte-bg px-2 py-0.5 text-sm font-semibold text-difficulte"
                            >
                              ⚠ {n.notion}
                            </span>
                          ))}
                        </div>
                      )}
                      {questions.length === 0 ? (
                        <p className="text-sm text-text-muted">Aucune question posée cette séance-là.</p>
                      ) : (
                        questions.map((q) => (
                          <div key={q.id} className="text-sm">
                            <span className="text-text-muted">
                              {labelCategorie(q.categorie)} · {formatHeure(q.horodatage)} —{' '}
                            </span>
                            {q.texte}
                          </div>
                        ))
                      )}
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
