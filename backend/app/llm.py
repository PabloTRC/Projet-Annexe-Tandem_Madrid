"""
Client minimal pour Ollama (modele llama3.1 par defaut), utilisé pour :
- categoriser automatiquement les questions des élèves (cours_precedent /
  elementaire / approfondie), appelé depuis create_question dans main.py
- generer les syntheses (questions et cours) d'une seance, appelé depuis les
  endpoints POST /seances/{id}/synthese-questions/generer et
  /synthese-cours/generer

Nécessite qu'Ollama tourne en local (`ollama serve`) et que le modèle soit
deja telechargé (`ollama pull llama3.1`). Si Ollama n'est pas joignable,
`OllamaUnavailableError` est levée ; c'est à l'appelant de decider si c'est
bloquant (synthèses -> 503) ou non (categorisation -> on laisse categorie a
None plutot que d'empêcher la creation de la question).
"""
import os
import ollama

OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1")
CATEGORIES_VALIDES = {"cours_precedent", "elementaire", "approfondie"}


class OllamaUnavailableError(Exception):
    """Levée quand Ollama n'est pas joignable ou renvoie une reponse inexploitable."""

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
    Renvoie une des 3 catégories : cours_precedent / elementaire / approfondie.
    Retombe sur "elementaire" si la réponse du modele est ambigue (le modele
    ne renvoie pas toujours EXACTEMENT le mot attendu malgré le prompt).
    """
    prompt = f"""Tu es un assistant pédagogique. Classe la question d'élève suivante
dans EXACTEMENT une de ces trois catégories, et réponds uniquement avec le mot
de la catégorie, sans aucune autre explication :

- cours_precedent : la question porte sur une notion déjà vue dans un cours précédent
- elementaire : question de compréhension de base sur le cours actuel
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
        return "Aucune question posée durant cette seance."
    lignes = "\n".join(
        f"- ({q['categorie'] or 'non categorisee'}) {q['texte']}" for q in questions
    )
    prompt = f"""Voici les questions posees par des eleves durant une seance de cours :{lignes}
Rédige une courte synthèse (5 lignes maximum) à destination du professeur :
quels types de questions ont été posés, quelles notions semblent poser
problème, et une recommandation éventuelle."""

    return _generate(prompt)


def reduire_questions(textes_questions: list[str]) -> str:
    """
    Déduplique/reformule une liste de questions qui se ressemblent (meme
    réponse attendue), via le LLM.
    """
    if not textes_questions:
        return ""
    # dict.fromkeys() enlève les doublons stricts tout en gardant l'ordre
    liste_txt = "\n".join(f"- {q}" for q in dict.fromkeys(textes_questions))
    prompt = f"""Tu es un assistant pédagogique. Voici une liste de questions posees par
des eleves pendant un cours : {liste_txt}
Ta mission : réduire le nombre de questions en repérant les similitudes entre
celles qui attendent la même réponse. Renvoie uniquement la liste finale des
questions reformulées de manière claire, une par ligne."""
    return _generate(prompt)


def generer_synthese_cours(contenus: list[dict]) -> str:
    """
    contenus = liste de dicts {"type": str, "donnees": dict}
    """
    if not contenus:
        return "Aucun contenu enregistré pour cette séance."
    lignes = "\n".join(f"- [{c['type']}] {c['donnees']}" for c in contenus)
    prompt = f"""Voici le contenu diffusé durant une séance de cours : {lignes} Rédige une courte synthèse (5 lignes maximum) résumant les notions abordées
durant cette séance, du point de vue du contenu enseigné."""
    return _generate(prompt)
