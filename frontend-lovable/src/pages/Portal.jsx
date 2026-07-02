import { Link } from "react-router-dom"

export default function Portal() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <span className="mb-3 inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-dark">
          Prototype
        </span>
        <h1 className="text-3xl font-bold">📚 Assistant de Cours</h1>
        <p className="mx-auto mt-3 max-w-xl text-text-muted">
          Pendant le cours, les élèves posent leurs questions sans lever la main. Le professeur suit les
          questions en direct, les regroupe et lance des synthèses pour adapter sa séance.
        </p>
      </div>

      <div className="grid w-full gap-5 sm:grid-cols-2">
        <Link
          to="/teacher"
          className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-3xl">🧑‍🏫</span>
          <span className="text-lg font-bold">Espace professeur</span>
          <span className="text-sm text-text-muted">
            Gérer vos classes, lancer vos séances et suivre les questions en direct.
          </span>
          <span className="mt-2 font-semibold text-primary group-hover:text-primary-dark">Entrer →</span>
        </Link>

        <Link
          to="/student"
          className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-3xl">🎓</span>
          <span className="text-lg font-bold">Espace élève</span>
          <span className="text-sm text-text-muted">
            Accéder à vos cours, rejoindre vos séances en direct et poser vos questions.
          </span>
          <span className="mt-2 font-semibold text-primary group-hover:text-primary-dark">Entrer →</span>
        </Link>
      </div>
    </div>
  )
}
