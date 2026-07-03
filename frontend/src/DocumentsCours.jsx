import { useEffect, useRef, useState } from "react";
import api from "./api";
import { connectSeanceSocket } from "./ws";

function fileLabel(contenu) {
  return contenu.donnees?.file_name || contenu.donnees?.titre || `Document #${contenu.id}`;
}

function canDownload(contenu) {
  return Boolean(contenu.donnees?.file_path);
}

// Document séance, liste élève
export default function DocumentsCours({ seanceId, cours, onBack }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const fileInputRef = useRef(null);

  //sans recharger la page, apparition du document ou de la question
  useEffect(() => {
    if (!seanceId) return;
    let cancelled = false;

    (async () => {
      try {
        const docs = await api.getContenus(seanceId);
        if (!cancelled) setDocuments(docs);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const socket = connectSeanceSocket(seanceId, {
      onOpen: () => setWsConnected(true),
      onClose: () => setWsConnected(false),
      onMessage: (message) => {
        if (message.type === "contenu_created") {
          const d = message.data;
          setDocuments((prev) => (prev.some((x) => x.id === d.id) ? prev : [...prev, d]));
        }
      },
    });

    return () => {
      cancelled = true;
      socket.close();
    };
  }, [seanceId]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        await api.uploadContenu(seanceId, file, "fichier");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du fichier.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Documents du cours</h2>
            <p className="mt-1 text-sm text-slate-500">
              {cours?.titre} — dépose ici les fichiers que tes élèves pourront télécharger.
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                wsConnected
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  wsConnected ? "animate-pulse bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {wsConnected ? "Connecté en direct" : "Reconnexion en cours…"}
            </span>
          </div>
          <button
            onClick={onBack}
            className="shrink-0 rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50"
          >
            ← Retour aux questions
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-8 text-center text-sm transition ${
            dragActive
              ? "border-pink-400 bg-pink-50 text-pink-600"
              : "border-pink-200 bg-white text-slate-500"
          }`}
        >
          {uploading ? (
            "Envoi en cours…"
          ) : (
            <>
              Glisse-dépose un fichier ici, ou{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-semibold text-pink-600 hover:underline"
              >
                choisis un fichier
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
          {loading && <p className="p-4 text-center text-sm text-slate-400">Chargement…</p>}

          {!loading && documents.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
              Aucun document partagé pour l'instant.
            </div>
          )}

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-pink-100 bg-white p-4"
              >
                <span className="truncate text-sm text-slate-700">📄 {fileLabel(doc)}</span>
                {canDownload(doc) ? (
                  <a
                    href={api.downloadContenuUrl(seanceId, doc.id)}
                    className="shrink-0 rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-100"
                  >
                    Télécharger
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-slate-400">{doc.type}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
