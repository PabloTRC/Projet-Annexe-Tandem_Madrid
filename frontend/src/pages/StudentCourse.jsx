import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getCoursById } from '../services/coursService'
import { getDocumentsByClasse } from '../services/documentsService'
import { getSeanceEnCours } from '../services/seancesService'
import { eleves, ELEVE_ACTUEL_ID } from '../data/mockStore'
import { formatDateHeure } from '../utils/format'

const studentName = eleves.find((e) => e.id === ELEVE_ACTUEL_ID)?.nom ?? ''
const POLL_INTERVAL_MS = 15000

export default function StudentCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    let pollHandle = null

    async function checkLive() {
      const seance = await getSeanceEnCours(courseId)
      if (cancelled) return
      if (seance) {
        setIsLive(true)
        if (pollHandle) clearInterval(pollHandle)
      }
    }

    async function load() {
      const [c, docs] = await Promise.all([getCoursById(courseId), getDocumentsByClasse(courseId)])
      if (cancelled) return
      setClassData(c)
      setDocuments(docs)
      await checkLive()
      pollHandle = setInterval(checkLive, POLL_INTERVAL_MS)
    }

    load()
    return () => {
      cancelled = true
      if (pollHandle) clearInterval(pollHandle)
    }
  }, [courseId])

  if (!classData) {
    return (
      <div>
        <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
        <main className="mx-auto max-w-3xl px-5 py-8">Chargement…</main>
      </div>
    )
  }

  return (
    <div>
      <AppHeader role="Espace élève" roleHome="/student" userName={studentName} />
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link to="/student" className="mb-4 inline-block text-sm text-text-muted hover:text-black">
          ← Retour à mes cours
        </Link>
        <h1 className="text-2xl font-bold">{classData.titre}</h1>
        <p className="mt-1 text-sm text-text-muted">{classData.professeur_nom}</p>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Agenda du cours</h2>
          <div className="rounded-xl border border-border bg-white p-4 text-sm">
            {classData.agenda || "Aucun agenda communiqué pour l'instant."}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Documents des séances précédentes</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
            {documents.length === 0 ? (
              <div className="py-4 text-center text-sm text-text-muted">Aucun document pour l&apos;instant.</div>
            ) : (
              documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span>📄 {d.donnees.nom}</span>
                  <span className="text-text-muted">
                    {d.donnees.taille} · {formatDateHeure(d.created_at)}
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
              Le cours n&apos;est pas encore lancé. Vous serez basculé automatiquement dès que le professeur
              démarrera la séance.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
