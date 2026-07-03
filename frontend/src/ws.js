// Client WebSocket minimal, avec reconnexion automatique (backoff
// exponentiel), pour se brancher sur /ws/seances/{id} et remplacer le
// polling REST. Un seul salon par séance : tous les événements (question,
// contenu, synthèse, présence) arrivent sur la même connexion, distingués
// par le champ "type" du message JSON reçu.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, "ws");

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 10000;

/**
 * Ouvre une connexion WebSocket sur la séance donnée.
 *
 * @param {number|string} seanceId
 * @param {object} options
 * @param {number} [options.eleveId] - identifie la connexion comme un élève
 *   (nécessaire pour la présence) ; absent pour une connexion professeur.
 * @param {(message: object) => void} [options.onMessage]
 * @param {() => void} [options.onOpen]
 * @param {() => void} [options.onClose] - appelé à chaque déconnexion,
 *   y compris avant une tentative de reconnexion automatique.
 * @returns {{ close: () => void }}
 */
export function connectSeanceSocket(seanceId, { eleveId, onMessage, onOpen, onClose } = {}) {
  let socket = null;
  let closedByCaller = false;
  let reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
  let reconnectTimer = null;

  function buildUrl() {
    const params = eleveId != null ? `?eleve_id=${encodeURIComponent(eleveId)}` : "";
    return `${WS_URL}/ws/seances/${seanceId}${params}`;
  }

  function open() {
    socket = new WebSocket(buildUrl());

    socket.onopen = () => {
      reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
      onOpen?.();
    };

    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return; // message non-JSON, on ignore
      }
      onMessage?.(message);
    };

    socket.onclose = () => {
      onClose?.();
      if (closedByCaller) return;
      reconnectTimer = setTimeout(open, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
    };

    socket.onerror = () => {
      socket?.close();
    };
  }

  open();

  return {
    close() {
      closedByCaller = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    },
  };
}
