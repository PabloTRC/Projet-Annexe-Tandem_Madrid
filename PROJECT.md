# El Tandem Educacion: description de notre valeur ajoutée

> Ce document décrit notre démarche, nos choix techniques, les obstacles rencontrés et ce que nous aurions fait avec davantage de temps.


## 1. Notre démarche

Le brief initial demandait une **application compagnon pour enseignants** avec une boucle centrale : *question de l'élève, synthèse LLM, suivi du professeur*. Nous avons adopté une approche **MVP incrémental** :

1. **Front d'abord, back ensuite.** Nous avons commencé par maquetter les deux interfaces (élève / professeur) pour valider le parcours utilisateur avant d'écrire une seule ligne de backend. Cela nous a évité de développer des endpoints inutiles. 

2. **Un flux vertical fonctionnel avant les extensions.** L'objectif de la première itération était simple : *un élève peut poser une question, le prof la voit apparaître en temps réel*. Tout le reste (synthèse LLM, catégorisation automatique, suivi individuel) est venu **après** cette base.

3. **Design pensé pour l'usage en salle de classe.** Contrairement à un outil pro classique, notre cible utilise l'app **pendant un cours**, pour ne pas perdre les élèves en chemin et permettre au professeur de repréciser au fil de la leçon les concepts qui n'ont pas été assimilés. D'où une interface colorée qui doit donner envie aux étudiants d'apprendre.

## 2. Choix techniques

### Frontend — React + Vite + Tailwind CSS

| Choix    | Pourquoi                                                               

| React    | Composants réutilisables, gestion d'état claire, familier de l'équipe.                       |
| Vite     | Hot reload quasi instantané, config minimale — gain de temps énorme en dev.                  |
| Tailwind | Styling directement dans le JSX, palette rose cohérente sans fichier CSS parallèle à gérer.  |

### Backend — Python + FastAPI

Nous avons privilégié **FastAPI** plutôt que Flask ou Django pour trois raisons :
- Support des WebSockets, indispensable pour le temps réel.
- Documentation swagger auto-générée (`/docs`) qui a servi de contrat entre front et back pendant le dev.
- Type hints Python qui limitent les erreurs à la frontière API.

exemple de endpoints FastAPI:

POST   /api/cours                        Créer un cours
POST   /api/cours/{id}/seances            Créer une séance
POST   /api/seances/{id}/contenus         Déposer un contenu pédagogique
GET    /api/seances/{id}                  Détail séance + contenus

POST   /api/seances/{id}/questions        Élève pose une question
GET    /api/seances/{id}/questions        Professeur liste les questions

POST   /api/seances/{id}/synthese-questions   Déclenche la synthèse LLM des questions
GET    /api/seances/{id}/synthese-cours       Récupère la synthèse de fin de cours (élève)
POST   /api/seances/{id}/synthese-cours       Génère la synthèse de fin de cours (professeur)

GET    /api/eleves/{id}/suivi             Historique des questions/catégories d'un élève

### Base de données — PostgreSQL 16 (Docker)

- Données **relationnelles** (cours → séances → questions → élèves) : SQL est le bon outil.
- **Docker Compose** pour éviter les "ça marche chez moi" entre nos machines et pour un déploiement futur simplifié.

### LLM — Ollama en local

- **Confidentialité** : les questions des élèves ne sortent pas de la machine.
- **Coût zéro** : pas de facture OpenAI/Anthropic à la fin du projet - OpenSource
- **Modèle par défaut** : `llama3` (compromis qualité / rapidité sur nos machines).

### Temps réel — WebSocket (Socket.io)

Un simple polling REST aurait suffi pour un prototype, mais nous voulions **la sensation "live"** côté prof. Une nouvelle question doit apparaître **immédiatement**, pas dans 5 secondes. Socket.io gère aussi la reconnexion automatique — utile si un élève perd le réseau.

### Design system — palette rose

Choix volontaire pour donner envie aux élèves d'apprendre et j'avais envie de rendre le projet un peu girly. La sidebar est décorée de **motifs floraux** et de **lampes de mineur** stylisées : un clin d'œil à notre super école.


## 3. Difficultés rencontrées & solutions trouvées

### 3.1 Créer l'arborescence du projet

Même si cela peut paraitre simple, créer l'arborescence du projet a été difficile car il fallait identifier les fichiers dont nous avions besoin et les répartir dans des dossiers différents. Pour cela le projet de messagerie que nous avions mené au cours de développemnt du 2e semestre a beaucoup aidé.

### 3.2 Synchroniser le temps réel entre plusieurs élèves et le prof

Avec plusieurs élèves connectés simultanément, tous devaient voir apparaître les questions des autres en direct — et le prof devait tout voir aussi: heureusement en arrangeant les websockets nous avons pu régler ce problème.

### 3.3 Séparer identité élève et matière choisie

Au départ, le nom de l'élève et la matière étaient stockés séparément — impossible pour le back de router correctement les questions sans les deux.

Sur l'écran de connexion élève, on force la sélection des deux avant de passer à la phase 2. Le back reçoit systématiquement `{ student, classe, question, category }`.

### 3.4 Accès à l'espace professeur

Nous n'avions pas le temps de mettre en place un vrai système d'authentification (comptes, mots de passe etc) mais il nous paraissait important que les élèves n'est pas accès à l'interface professeur. Par exemple, le nombre de questions posées par chaque élève est une donnée privée...

Par défaut on a opté pour un **code d'accès simple** (`TANDEM2025`) codé en dur en constante en haut de `App.jsx`. Un vrai `POST /api/login` est à brancher plus tard sans changer l'UI (juste remplacer la vérification locale par un appel API).

### 3.5 Éviter les questions en double

On ne voulait pas que le prof réponde deux fois à des questions similaires posées par des élèves différents.

On a donc créé un bouton **"Synthèse LLM"** côté prof qui envoie l'ensemble des questions non répondues à Ollama, avec un prompt du type *"Regroupe les questions ci-dessous qui portent sur le même sujet"*. Le résultat est affiché comme une liste de clusters.

### 3.6 Gestion de l'état des questions (lue / répondue / épinglée)

On voulait garder une synchronisation entre tous les clients connectés quand le prof change quelque chose.

On a donc fait en sorte que chaque action côté prof (`markRead`, `markAnswered`, `pin`) émette un événement WebSocket que **tous** les clients de la room reçoivent.


### Intégration d'Ollama

**Choix de la version du modèle.** Le code a été écrit avec `llama3.1` comme modèle par défaut (voir le docstring de `backend/app/llm.py`), mais le `.env` réel utilise `llama3.2:1b`. `llama3.1` est trop lourd pour tourner confortablement en local sur une machine de dev standard (temps de réponse et RAM/VRAM), donc on est passé sur `llama3.2:1b`, beaucoup plus léger, quitte à perdre en qualité de génération. Le modèle est configurable via `OLLAMA_MODEL` dans `backend/.env`, donc pas besoin de retoucher le code pour changer de version — juste `ollama pull <modele>` puis mettre à jour la variable.

**Limiter les tokens générés.** Une réponse Ollama plus longue prend plus de temps à générer (chaque token coûte du temps), ce qui rend l'appli peu réactive pour un usage en direct pendant un cours. `OLLAMA_NUM_PREDICT` (dans `backend/.env`, lu dans `backend/app/llm.py`) plafonne le nombre de tokens générés par réponse — fixé à `200`, suffisant pour une synthèse de quelques lignes sans attendre une génération trop longue.

**Rechargement du modèle en mémoire.** Par défaut, Ollama décharge un modèle de la mémoire après 5 minutes d'inactivité ; le rechargement (souvent la partie la plus lente d'un appel) recommence alors de zéro à chaque question. `OLLAMA_KEEP_ALIVE=30m` garde le modèle chargé pendant une session de démo entière pour éviter ce coût répété.

**Disponibilité d'Ollama.** Le serveur Ollama doit tourner en local (`ollama serve`) et le modèle doit être déjà téléchargé (`ollama pull llama3.2:1b`) avant de lancer le backend. Si Ollama n'est pas joignable, `llm.py` lève une `OllamaUnavailableError` — gérée différemment selon le contexte : bloquante (503) pour la génération de synthèse explicitement demandée par le prof, mais non-bloquante pour la catégorisation automatique d'une question (la question est quand même créée, juste sans catégorie).

### Architecture Python : deux venv, deux requirements.txt

Le backend a longtemps eu deux environnements virtuels séparés : `backend/venv` (FastAPI, sans Alembic) et `backend/db/venv` (Alembic, sans FastAPI). Ça a provoqué une erreur récurrente — `alembic: command not found` — à chaque fois que le mauvais venv était activé. Contournée en appelant chaque `python` par son chemin complet dans `scripts/run_demo.sh` plutôt que de compter sur une activation manuelle (`source venv/bin/activate`), qui se mélangeait aussi avec un `conda base` actif en arrière-plan sur la machine de dev.

### `docker-compose.yml` à la racine, pas dans `backend/`

Un premier jet du script de démo faisait `cd backend && docker compose ...`, qui échouait silencieusement puisque le fichier est à la racine du projet. Le script a été corrigé pour lancer les commandes docker compose depuis la racine et ne `cd` dans `backend/` que pour les étapes Python.

### CORS : preflight qui échoue silencieusement

Le frontend renvoyait "Load failed" / "Failed to fetch" dans le navigateur alors que les mêmes requêtes fonctionnaient très bien en `curl`. Cause : `api.js` fixait `Content-Type: application/json` sur toutes les requêtes, y compris les `GET` sans corps, ce qui forçait un preflight CORS (`OPTIONS`) inutile — et ce preflight échouait sans message d'erreur exploitable côté navigateur. Corrigé en ne posant `Content-Type` que quand la requête a effectivement un corps (`options.body` présent).

### Secrets et fichiers versionnés par erreur

Le repo contenait 4 fichiers `.env` commités dans l'historique git (secrets/config de connexion à la base), ainsi que du bytecode Python compilé (`__pycache__/*.pyc`) versionné avant l'ajout de la règle `.gitignore` correspondante — ce dernier provoquait des diffs fantômes ("modified: ...pyc") à chaque exécution locale du backend. Les deux ont été retirés du suivi (`git rm --cached`), sans réécriture de l'historique existant.

### Branches divergentes et fusions

Plusieurs fonctionnalités ont été développées en parallèle sur des branches distinctes sans se baser les unes sur les autres (migration WebSocket, corrections de bugs, réorganisation du repo, mise à jour du README par un autre contributeur). Résultat : des fichiers corrigés sur une branche (ex. les modèles `Inscription`/`Presence` et `GestionEleves.jsx`, ajoutés pour corriger un bug) étaient absents d'une autre branche qui n'avait jamais récupéré ce correctif, provoquant des erreurs 500 ou des builds cassés selon la branche déployée. Plusieurs merges ont ensuite généré de vrais conflits texte (README, `schemas.py` reformaté par un autre contributeur en parallèle, `.pyc` supprimés d'un côté et régénérés de l'autre) qu'il a fallu résoudre manuellement, fichier par fichier.

### Duplication de configuration

`backend/.env` et `backend/db/.env` contenaient tous les deux le même `DATABASE_URL` copié-collé — un risque de désynchronisation si l'un était modifié sans l'autre. Fusionnés en un seul `backend/.env`, avec `backend/db/env.py` et `backend/db/reset_demo.py` qui vont désormais le chercher explicitement dans le dossier parent, peu importe le dossier depuis lequel le script est lancé.

### Repo peu organisé

Le dépôt accumulait des scories jamais nettoyées : scaffolding de départ mort à la racine (`main.py`, `pyproject.toml` et `requirements.txt` vides, `package-lock.json` orphelin), un ancien frontend abandonné (`frontend-lovable/`) laissé sur le disque sans plus être suivi par git, et deux scripts de seed redondants (`seed.py` et `reset_demo.py`, ce dernier étant la version à jour). Nettoyé et réorganisé en une structure claire (`backend/`, `frontend/`, `docs/`, `scripts/`).

## 4. Organisation de l'équipe

Équipe de **4 développeurs**. Répartition indicative :

| Membre                | Focus principal                                       |
| --------------------- | ----------------------------------------------------- |
| **Keanu Toofa**       | Backend FastAPI + intégration Ollama                  |
| **Amandine de Rocca et Amaury viaud**      | Frontend élève + design system Tailwind               |
| **Pablo Thoumyre**    | Frontend prof + WebSocket côté client                  |


## 5. Ce que nous aurions fait avec plus de temps

### Fonctionnel

- **Vraie authentification** pour le prof (email + mot de passe et comptes multiples).
- **Historique des séances** consultable après le cours par les élèves.
- **Synthèse de fin de cours** générée automatiquement par le LLM à la fermeture de la séance.
- **Détection des élèves en difficulté** via la catégorisation LLM (élémentaire / approfondie / porte sur un cours antérieur) pour mieux identifier les sujets à reprendre
- **Upload de fichiers pédagogiques** (PDF, images) par le professeur.
- **Réponses écrites** du prof directement dans l'app plutôt qu'à l'oral uniquement.
- **Scaling** : utiliser Supabase pour l'hébergement en ligne de la database

### Technique

- **Tests automatisés** : nous avons manqué de temps pour en écrire. Pytest côté back et Vitest côté front auraient sécurisé les régressions.
- **Version mobile** : l'app est actuellement pensée desktop / tablette. Un mode mobile natif (avec la nav sidebar en drawer) serait indispensable pour un usage quotidien.
- **Persistance côté élève** : si un élève rafraîchit la page, il perd sa session et doit se reconnecter. Un `localStorage` simple ou un cookie de session aurait suffi.
- **Gestion des erreurs réseau** : actuellement, si la connexion WebSocket tombe, l'utilisateur ne s'en rend pas compte. Une bannière "reconnexion en cours…" serait utile à installer.

### Design

- **Mode sombre** (bouton présent dans les Paramètres mais non fonctionnel).
- **Accessibilité** : audit lecteur d'écran, contrastes AAA, navigation clavier complète.
- **Animations plus poussées** : transitions entre les états des questions, arrivée d'une nouvelle question, etc.


## 6. Bilan personnel

Ce projet nous a permis de :

- **Concevoir un produit de bout en bout pour améliorer une situation d'enseignement** en partant d'un brief, pas de juste coder une feature isolée.

- **Travailler à 4 sur une base commune**, gérer les conflits Git et les décisions techniques collectives ne fut pas facile, surtout la répartition des taches en fonction de ceux qui maitrisait plus ou moins le backend etc

- **Faire des compromis** entre ce qu'on voulait et les 3 jours disponibles : le MVP est solide et démontrable, les extensions sont préparées mais non livrées.

**Équipe** : Keanu Toofa · Amaury Viaud · Pablo Thoumyre · Amandine de Rocca