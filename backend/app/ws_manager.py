"""
Gestion des connexions WebSocket "en direct" par séance.

Un salon (room) = une séance. Chaque client (professeur ou élève) qui suit
une séance ouvre une connexion WS sur `/ws/seances/{seance_id}` et reçoit
tous les événements de cette séance (nouvelle question, nouveau document,
synthèse générée, élève connecté/déconnecté), sans avoir à faire de polling.

Etat gardé en mémoire process (pas en base) : si le serveur redémarre, tout
le monde doit se reconnecter, ce qui est le comportement attendu pour du
"qui est en ligne maintenant".
"""
import json
import logging

from fastapi import WebSocket

logger = logging.getLogger("ws_manager")


class ConnectionManager:
    def __init__(self):
        # seance_id -> liste de connexions actives
        self._rooms: dict[int, list[WebSocket]] = {}
        # WebSocket -> eleve_id (None si c'est une connexion professeur / anonyme)
        self._eleve_par_connexion: dict[WebSocket, int | None] = {}

    async def connect(self, seance_id: int, websocket: WebSocket, eleve_id: int | None):
        await websocket.accept()
        self._rooms.setdefault(seance_id, []).append(websocket)
        self._eleve_par_connexion[websocket] = eleve_id

    def disconnect(self, seance_id: int, websocket: WebSocket):
        connexions = self._rooms.get(seance_id, [])
        if websocket in connexions:
            connexions.remove(websocket)
        if not connexions and seance_id in self._rooms:
            del self._rooms[seance_id]
        self._eleve_par_connexion.pop(websocket, None)

    def eleves_en_ligne(self, seance_id: int) -> list[int]:
        """IDs des eleves actuellement connectes sur cette seance (dedupliques,
        un meme eleve peut avoir plusieurs onglets ouverts)."""
        connexions = self._rooms.get(seance_id, [])
        ids = {
            self._eleve_par_connexion.get(ws)
            for ws in connexions
            if self._eleve_par_connexion.get(ws) is not None
        }
        return list(ids)

    async def broadcast(self, seance_id: int, message: dict):
        """Envoie `message` (serialise en JSON) a tous les clients connectes
        sur cette seance. Les connexions mortes sont nettoyees au passage."""
        connexions = list(self._rooms.get(seance_id, []))
        if not connexions:
            return
        payload = json.dumps(message, default=str)
        mortes = []
        for ws in connexions:
            try:
                await ws.send_text(payload)
            except Exception:
                mortes.append(ws)
        for ws in mortes:
            self.disconnect(seance_id, ws)


# Instance unique partagee par toute l'app (importee dans main.py).
manager = ConnectionManager()
