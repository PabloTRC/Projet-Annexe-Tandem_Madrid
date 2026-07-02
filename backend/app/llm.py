"""
Client minimal pour Ollama (modele llama3.1 par defaut), utilise pour :
- categoriser automatiquement les questions des eleves (cours_precedent /
  elementaire / approfondie), appele depuis create_question dans main.py
- generer les syntheses (questions et cours) d'une seance, appele depuis les
  endpoints POST /seances/{id}/synthese-questions/generer et
  /synthese-cours/generer

Necessite qu'Ollama tourne en local (`ollama serve`) et que le modele soit
deja telecharge (`ollama pull llama3.1`). Si Ollama n'est pas joignable,
`OllamaUnavailableError` est levee ; c'est a l'appelant de decider si c'est
bloquant (syntheses -> 503) ou non (categorisation -> on laisse categorie a
None plutot que d'empecher la creation de la question).
"""
import os

import ollama

OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1")

CATEGORIES_VALIDES = {"cours_precedent", "elementaire", "approfondie"}


class OllamaUnavailableError(Exception):
    """Levee quand Ollama n'est pas joignable ou renvoie une reponse inexploitable."""


def _generate(prompt: str) -> str:
    try:
        response = ollama.generate(
            model=OLLAMA_MODEL,
            prompt=prompt,
            options={"temperature": 0.2},
        )
    except Exception as exc:  # connexion refusee, modele non telecharge, etc.
        raise OllamaUnavailableError(str(exc)) from exc
    return response.get("response", "").strip()


def categoriser_question(texte_question: str) -> str:
    """
    Renvoie une des 3 categories : cours_precedent / elementaire / approfondie.
    Retombe sur "elementaire" si la reponse du modele est ambigue (le modele
    ne renvoie pas toujours EXACTEMENT le mot attendu malgre le prompt).
    """
    prompt = f"""Tu es un assistant pedagogique. Classe la question d'eleve suivante
dans EXACTEMENT une de ces trois categories, et reponds uniquement avec le mot
de la categorie, sans aucune autre explication :

- cours_precedent : la question porte sur une notion deja vue dans un cours precedent
- elementaire : question de comprehension de base sur le cours actuel
- approfondie : question qui va au-dela du cours actuel, plus complexe

Question de l'eleve : "{texte_question}"

Categorie :"""

    reponse = _generate(prompt).lower().strip().strip(".").replace(" ", "_")

    for categorie in CATEGORIES_VALIDES:
        if categorie in reponse:
            return categorie

    return "elementaire"


def generer_synthese_questions(questions: list[dict]) -> str:
    """
    `questions` : liste de dicts {"texte": str, "categorie": str | None}
    """
    if not questions:
        return "Aucune question posee durant cette seance."

    lignes = "\n".join(
        f"- ({q['categorie'] or 'non categorisee'}) {q['texte']}" for q in questions
    )
    prompt = f"""Voici les questions posees par des eleves durant une seance de cours :

{lignes}

Redige une courte synthese (5 lignes maximum) a destination du professeur :
quels types de questions ont ete poses, quelles notions semblent poser
probleme, et une recommandation eventuelle."""

    return _generate(prompt)


def reduire_questions(textes_questions: list[str]) -> str:
    """
    Deduplique/reformule une liste de questions qui se ressemblent (meme
    reponse attendue), via le LLM. Reprise de l'idee originale de Keanu,
    adaptee pour recevoir directement les questions deja en base plutot
    qu'un stockage en memoire separe.
    """
    if not textes_questions:
        return ""

    # dict.fromkeys() enleve les doublons stricts tout en gardant l'ordre
    liste_txt = "\n".join(f"- {q}" for q in dict.fromkeys(textes_questions))
    prompt = f"""Tu es un assistant pedagogique. Voici une liste de questions posees par
des eleves pendant un cours :

{liste_txt}

Ta mission : reduire le nombre de questions en reperant les similitudes entre
celles qui attendent la meme reponse. Renvoie uniquement la liste finale des
questions reformulees de maniere claire, une par ligne."""

    return _generate(prompt)


def generer_synthese_cours(contenus: list[dict]) -> str:
    """
    `contenus` : liste de dicts {"type": str, "donnees": dict}
    """
    if not contenus:
        return "Aucun contenu enregistre pour cette seance."

    lignes = "\n".join(f"- [{c['type']}] {c['donnees']}" for c in contenus)
    prompt = f"""Voici le contenu diffuse durant une seance de cours :

{lignes}

Redige une courte synthese (5 lignes maximum) resumant les notions abordees
durant cette seance, du point de vue du contenu enseigne."""

    return _generate(prompt)
