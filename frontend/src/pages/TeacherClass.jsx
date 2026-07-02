import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { StatusBadge } from '../components/Badge'
import { getClasseById, updateAgenda } from '../services/coursService'
import { classesEnDifficulte, getElevesByClasse } from '../services/elevesService'
import { addDocument, getDocumentsByClasse } from '../services/documentsService'
import { demarrerSeance, getCreneauActif } from '../services/seancesService'
import { professeurs } from '../data/mockStore'
import { formatDateHeure } from '../utils/format'
import { useDebouncedCallback } from '../hooks/useDebounce'

const teacherName = professeurs[0]?.nom ?? ''

export default function TeacherClass() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [classData, setClassData] = useState(null)
  const [eleves, setEleves] = useState([])
  const [nbDifficulte, setNbDifficulte] = useState(0)
  const [documents, setDocuments] = useState([])
  const [creneau, setCreneau] = useState(null)
  const [onlyStruggling, setOnlyStruggling] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [agenda, setAgenda] = useState('')
  const [saveState, setSaveState] = useState('')
  const [launching, setLaunching] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [c, els, nb, docs, cr] = await Promise.all([
        getClasseById(classId),
        getElevesByClasse(classId),
        classesEnDifficulte(classId),
        getDocumentsByClasse(classId),
        getCreneauActif(classId),
      ])
      if (cancelled) return
      setClassData(c)
      setEleves(els)
      setNbDifficulte(nb)
      setDocuments(docs)
      setCreneau(cr)
      setAgenda(c?.agenda ?? '')
    }

    load()
    return () => {
      cancelled = true
    }
  }, [classId])

  const saveAgenda = useDebouncedCallback(async (value) => {
    setSaveState('saving')
    await updateAgenda(classId, value)
    setSaveState('saved')
  }, 800)

  function handleAgendaChange(value) {
    setAgenda(value)
    setSaveState('')
    saveAgenda(value)
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    for (const file of files) {
      const ko = Math.max(1, Math.round(file.size / 1024))
      const size = ko >= 1024 ? `${(ko / 1024).toFixed(1)} Mo` : `${ko} Ko`
      await addDocument(classId, null, { nom: file.name, taille: size })
    }
    if (files.length) setDocuments(await getDocumentsByClasse(classId))
  }

  async function launchCourse() {
    if (!creneau) return
    setLaunching(true)
    if (!creneau.enCours) await demarrerSeance(creneau.seance.id)
    navigate(`/teacher/class/${classId}/live`)
  }

  if (!classData) {
    return (
      <div>
        <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
        <main className="mx-auto max-w-4xl px-5 py-8">Chargement…</main>
      </div>
    )
  }

  const students = onlyStruggling ? eleves.filter((e) => e.statut === 'difficulte') : eleves
  const launchLabel = !creneau ? 'Aucun créneau planifié' : creneau.enCours ? 'Reprendre le cours' : 'Lancer le cours'

  return (
    <div className="pb-24">
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacherName} />
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link to="/teacher" className="mb-4 inline-block text-sm text-text-muted hover:text-black">
          ← Retour aux classes
        </Link>
        <h1 className="text-2xl font-bold">{classData.titre}</h1>
        <p className="mt-1 text-sm text-text-muted">
          {eleves.length} élèves
          {nbDifficulte > 0 && ` · ${nbDifficulte} en difficulté`}
        </p>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Élèves</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyStruggling}
                onChange={(e) => setOnlyStruggling(e.target.checked)}
              />
              Élèves en difficulté uniquement
            </label>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            {students.length === 0 ? (
              <div className="p-6 text-center text-sm text-text-muted">Aucun élève à afficher.</div>
            ) : (
              students.map((s, i) => (
                <Link
                  key={s.id}
                  to={`/teacher/class/${classId}/student/${s.id}`}
                  className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-bg ${
                    i !== 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <span className="font-medium">{s.nom}</span>
                  <StatusBadge status={s.statut} />
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Documents</h2>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragActive(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={`rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm text-text-muted transition ${
              dragActive ? 'border-primary bg-primary-light' : 'border-border'
            }`}
          >
            Glissez-déposez un fichier ici, ou{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-primary hover:underline"
            >
              choisissez un fichier
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
            {documents.length === 0 ? (
              <div className="py-4 text-center text-sm text-text-muted">Aucun document partagé pour l&apos;instant.</div>
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
          <h2 className="mb-3 text-lg font-bold">Agenda / grands thèmes du cours</h2>
          <textarea
            rows={4}
            value={agenda}
            onChange={(e) => handleAgendaChange(e.target.value)}
            placeholder="Notions abordées, plan de la séquence…"
            className="w-full rounded-lg border border-border bg-white p-3 text-sm focus:outline-2 focus:outline-primary"
          />
          <div className="mt-1 min-h-[1.2em] text-sm">
            {saveState === 'saving' && <span className="text-primary">Enregistrement…</span>}
            {saveState === 'saved' && <span className="text-ok">Enregistré</span>}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={launchCourse}
            disabled={!creneau || launching}
            className="w-full rounded-lg bg-live px-4 py-3 font-semibold text-white hover:bg-[#c73631] disabled:opacity-50"
          >
            {launchLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
