import { Link } from 'react-router-dom'

export default function AppHeader({ role, roleHome, userName }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-5 sm:px-8">
      <Link to={roleHome} className="flex items-center gap-2 text-lg font-bold no-underline">
        📚 Assistant de Cours
      </Link>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-dark">
          {role}
        </span>
        <Link to="/" className="text-sm text-text-muted hover:text-black">
          Changer d&apos;espace
        </Link>
        {userName && <span className="text-sm font-medium">{userName}</span>}
      </div>
    </header>
  )
}
