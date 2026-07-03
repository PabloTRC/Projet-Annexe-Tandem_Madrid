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
- **Docker Compose** pour éviter que ça ne marche que chez nous pour un déploiement futur simplifié.

### LLM — Ollama en local

- **Confidentialité** : les questions des élèves ne sortent pas de la machine.
- **Coût zéro** : pas de facture OpenAI/Anthropic à la fin du projet.
- **Modèle par défaut** : `llama3` (compromis qualité / rapidité sur nos machines).

### Temps réel — WebSocket (Socket.io)

Nous voulions **la sensation "live"** côté prof: une nouvelle question doit apparaître **immédiatement**.

### Design system — palette rose

Choix volontaire pour donner envie aux élèves d'apprendre et j'avais envie de rendre le projet un peu girly. La sidebar est décorée de **motifs floraux** et de **lampes de mineur** stylisées : un clin d'œil à notre super école.


## 3. Difficultés rencontrées & solutions trouvées

### 3.1 Créer l'arborescence du projet

Même si cela peut paraitre simple, créer l'arborescence du projet a été difficile car il fallait identifier les fichiers dont nous avions besoin et les répartir dans des dossiers différents. Pour cela le projet de messagerie que nous avions mené au cours de développemnt du 2e semestre a beaucoup aidé.

### 3.1 Synchroniser le temps réel entre plusieurs élèves et le prof

Avec plusieurs élèves connectés simultanément, tous devaient voir apparaître les questions des autres en direct — et le prof devait tout voir aussi: heureusement en arrangeant les websockets nous avons pu régler ce problème.

### 3.2 Séparer identité élève et matière choisie

Au départ, le nom de l'élève et la matière étaient stockés séparément — impossible pour le back de router correctement les questions sans les deux.

Sur l'écran de connexion élève, on force la sélection des deux avant de passer à la phase 2. Le back reçoit systématiquement `{ student, classe, question, category }`.

### 3.3 Accès à l'espace professeur

Nous n'avions pas le temps de mettre en place un vrai système d'authentification (comptes, mots de passe etc) mais il nous paraissait important que les élèves n'est pas accès à l'interface professeur. Par exemple, le nombre de questions posées par chaque élève est une donnée privée...

Par défaut on a opté pour un **code d'accès simple** (`TANDEM2025`) codé en dur en constante en haut de `App.jsx`. Un vrai `POST /api/login` est à brancher plus tard sans changer l'UI (juste remplacer la vérification locale par un appel API).

### 3.4 Éviter les questions en double

On ne voulait pas que le prof réponde deux fois à des questions similaires posées par des élèves différents.

On a donc créé un bouton **"Synthèse LLM"** côté prof qui envoie l'ensemble des questions non répondues à Ollama, avec un prompt du type *"Regroupe les questions ci-dessous qui portent sur le même sujet"*. Le résultat est affiché comme une liste de clusters.

### 3.5 Gestion de l'état des questions (lue / répondue / épinglée)

On voulait garder une synchronisation entre tous les clients connectés quand le prof change quelque chose.

On a donc fait en sorte que chaque action côté prof (`markRead`, `markAnswered`, `pin`) émette un événement WebSocket que **tous** les clients de la room reçoivent.

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