import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import { StatusBadge } from "../components/Badge"
import { getClass, strugglingCount, teacher } from "../data/mockData"

export default function TeacherClass() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const classData = getClass(classId)

  const [onlyStruggling, setOnlyStruggling] = useState(false)
  const [documents, setDocuments] = useState(classData?.documents ?? [])
  const [dragActive, setDragActive] = useState(false)
  const [agenda, setAgenda] = useState(classData?.agenda ?? "")
  const [saveState, setSaveState] = useState("")
  const fileInputRef = useRef(null)
  const saveTimeout = useRef(null)

  useEffect(() => () => clearTimeout(saveTimeout.current), [])

  if (!classData) {
    return (
      <div>
        <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacher.name} />
        <main className="mx-auto max-w-4xl px-5 py-8">Classe introuvable.</main>
      </div>
    )
  }

  const students = onlyStruggling
    ? classData.students.filter((s) => s.status === "difficulte")
    : classData.students

  const isLive = classData.nextSession.status === "en_cours"

  function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    const added = files.map((f) => {
      const ko = Math.max(1, Math.round(f.size / 1024))
      const size = ko >= 1024 ? `${(ko / 1024).toFixed(1)} Mo` : `${ko} Ko`
      return { name: f.name, size, date: new Date().toISOString().slice(0, 10) }
    })
    if (added.length) setDocuments((docs) => [...added, ...docs])
  }

  function handleAgendaChange(value) {
    setAgenda(value)
    setSaveState("")
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      setSaveState("saving")
      setTimeout(() => setSaveState("saved"), 500)
    }, 500)
  }

  function launchCourse() {
    navigate(`/teacher/class/${classId}/live`)
  }

  return (
    <div className="pb-24">
      <AppHeader role="Espace professeur" roleHome="/teacher" userName={teacher.name} />
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link to="/teacher" className="mb-4 inline-block text-sm text-text-muted hover:text-black">
          ← Retour aux classes
        </Link>
        <h1 className="text-2xl font-bold">
          {classData.name} <span className="font-normal text-text-muted">{classData.subject}</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {classData.students.length} élèves
          {strugglingCount(classData) > 0 && ` · ${strugglingCount(classData)} en difficulté`}
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
                    i !== 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <StatusBadge status={s.status} />
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
              dragActive ? "border-primary bg-primary-light" : "border-border"
            }`}
          >
            Glissez-déposez un fichier ici, ou{" "}
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
              <div className="py-4 text-center text-sm text-text-muted">Aucun document partagé pour l'instant.</div>
            ) : (
              documents.map((d, i) => (
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
          <h2 className="mb-3 text-lg font-bold">Agenda / grands thèmes du cours</h2>
          <textarea
            rows={4}
            value={agenda}
            onChange={(e) => handleAgendaChange(e.target.value)}
            placeholder="Notions abordées, plan de la séquence…"
            className="w-full rounded-lg border border-border bg-white p-3 text-sm focus:outline-2 focus:outline-primary"
          />
          <div className="mt-1 min-h-[1.2em] text-sm">
            {saveState === "saving" && <span className="text-primary">Enregistrement…</span>}
            {saveState === "saved" && <span className="text-ok">Enregistré</span>}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={launchCourse}
            className="w-full rounded-lg bg-live px-4 py-3 font-semibold text-white hover:bg-[#c73631]"
          >
            {isLive ? "Reprendre le cours" : "Lancer le cours"}
          </button>
        </div>
      </div>
    </div>
  )
}
