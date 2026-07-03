const STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "est", "ce", "que",
  "qui", "on", "il", "elle", "je", "vous", "tu", "pour", "avec", "dans", "quand",
  "comment", "pourquoi", "est-ce", "ça", "a", "au", "aux", "sur", "pas", "plus",
  "toujours", "encore", "quel", "quelle", "vos", "notre", "cette", "cet",
])

function tokenize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter((w) => setB.has(w)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

// Groups questions whose wording overlaps (rough stand-in for an LLM-based
// similarity grouping) so the teacher sees clusters instead of a flat list.
export function groupSimilarQuestions(questions, threshold = 0.22) {
  const withTokens = questions.map((q) => ({ question: q, tokens: tokenize(q.text) }))
  const groups = []

  withTokens.forEach(({ question, tokens }) => {
    let bestGroup = null
    let bestScore = 0

    groups.forEach((group) => {
      const score = jaccardSimilarity(tokens, group.tokens)
      if (score > bestScore) {
        bestScore = score
        bestGroup = group
      }
    })

    if (bestGroup && bestScore >= threshold) {
      bestGroup.questions.push(question)
      bestGroup.tokens = [...new Set([...bestGroup.tokens, ...tokens])]
    } else {
      groups.push({ tokens, questions: [question] })
    }
  })

  return groups
    .map((g) => ({ questions: g.questions, count: g.questions.length }))
    .sort((a, b) => b.count - a.count)
}

export const SYNTHESIS_TEMPLATE = [
  "La majorité des questions portent sur le lien entre concentration en acide et pH : un rappel de l'échelle logarithmique peut aider.",
  "Plusieurs élèves demandent des précisions sur la sécurité au laboratoire — redonner les consignes avant la suite du protocole.",
  "Une question porte sur un prérequis de l'année précédente : un rappel rapide en début de prochaine séance pourrait sécuriser le groupe.",
].join("\n\n")
