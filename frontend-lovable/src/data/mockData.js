export const teacher = { name: "Mme Laurent" }
export const student = { name: "Alice Martin" }

export const classes = [
  {
    id: "c1",
    name: "3ème A",
    subject: "Mathématiques",
    room: "B12",
    today: { time: "10:00 – 11:00" },
    week: [{ day: "Ven", time: "10:00–11:00" }],
    nextSession: { day: "Jeu", time: "10:00", status: "planifiee" },
    agenda:
      "Théorème de Pythagore — applications et exercices. Introduction à la trigonométrie en fin de semaine.",
    documents: [
      { name: "Chapitre 4 - Pythagore.pdf", size: "1.1 Mo", date: "2026-06-28" },
      { name: "Exercices série 3.pdf", size: "480 Ko", date: "2026-06-30" },
    ],
    students: [
      {
        id: "s1",
        name: "Alice Martin",
        initials: "AM",
        status: "difficulte",
        history: [
          {
            date: "2026-06-28",
            questions: ["Je ne comprends pas la démonstration"],
            notions: ["Démonstration Pythagore"],
          },
        ],
      },
      { id: "s2", name: "Bruno Petit", initials: "BP", status: "a_jour", history: [] },
      {
        id: "s3",
        name: "Chloé Durand",
        initials: "CD",
        status: "difficulte",
        history: [
          {
            date: "2026-06-28",
            questions: ["Comment reconnaître l'hypoténuse dans un triangle rectangle ?"],
            notions: ["Identification de l'hypoténuse"],
          },
        ],
      },
      { id: "s4", name: "David Leroy", initials: "DL", status: "a_jour", history: [] },
      { id: "s5", name: "Emma Roux", initials: "ER", status: "pas_de_donnees", history: [] },
      { id: "s6", name: "Farid Bensaïd", initials: "FB", status: "a_jour", history: [] },
    ],
  },
  {
    id: "c2",
    name: "4ème B",
    subject: "Mathématiques",
    room: "C04",
    today: { time: "13:00 – 14:00" },
    week: [{ day: "Sam", time: "09:00–10:00" }],
    nextSession: { day: "Sam", time: "09:00", status: "planifiee" },
    agenda: "Fractions, priorités opératoires, résolution d'équations du premier degré.",
    documents: [{ name: "Fiche équations.pdf", size: "620 Ko", date: "2026-06-29" }],
    students: [
      { id: "s7", name: "Inès Cohen", initials: "IC", status: "a_jour", history: [] },
      { id: "s8", name: "Louis Fabre", initials: "LF", status: "a_jour", history: [] },
      { id: "s9", name: "Maya Simon", initials: "MS", status: "difficulte", history: [] },
      { id: "s10", name: "Noé Blanchard", initials: "NB", status: "pas_de_donnees", history: [] },
    ],
  },
  {
    id: "c3",
    name: "Seconde 2",
    subject: "Physique-Chimie",
    room: "D01",
    today: { time: "14:00 – 15:00" },
    week: [],
    nextSession: { day: "Aujourd'hui", time: "14:00", status: "en_cours" },
    agenda: "Réactions acide-base, mesure du pH, sécurité au laboratoire.",
    documents: [{ name: "Protocole titrage.pdf", size: "310 Ko", date: "2026-07-01" }],
    students: [
      { id: "s11", name: "Oscar Girard", initials: "OG", status: "a_jour", history: [] },
      { id: "s12", name: "Perrine Aubert", initials: "PA", status: "difficulte", history: [] },
      { id: "s13", name: "Quentin Roy", initials: "QR", status: "a_jour", history: [] },
    ],
  },
]

// Pool of questions already asked when the live session opens.
export const initialLiveQuestions = {
  c3: [
    {
      id: 1,
      studentId: "s12",
      text: "Pourquoi le pH diminue quand on ajoute l'acide goutte à goutte ?",
      category: "elementaire",
      time: "14:07",
    },
    {
      id: 2,
      studentId: "s11",
      text: "On doit porter des lunettes même pour une petite quantité d'acide ?",
      category: "elementaire",
      time: "14:09",
    },
  ],
}

// Simulated stream of incoming questions (polled every few seconds on the live page).
export const liveQuestionsQueue = {
  c3: [
    {
      studentId: "s13",
      text: "Pourquoi on utilise un indicateur coloré plutôt qu'un simple pH-mètre ?",
      category: "approfondie",
    },
    {
      studentId: "s12",
      text: "C'est quoi la différence entre équivalence et neutralisation ?",
      category: "approfondie",
    },
    {
      studentId: "s11",
      text: "Le pH peut être négatif dans certains cas ?",
      category: "cours_anterieur",
    },
  ],
}

export const statusLabels = {
  a_jour: "À jour",
  difficulte: "En difficulté",
  pas_de_donnees: "Pas de données",
}

export const statusClasses = {
  a_jour: "bg-ok-bg text-ok",
  difficulte: "bg-difficulte-bg text-difficulte",
  pas_de_donnees: "bg-inconnu-bg text-inconnu",
}

export const categoryLabels = {
  elementaire: "Élémentaire",
  approfondie: "Approfondie",
  cours_anterieur: "Cours antérieur",
}

export function getClass(id) {
  return classes.find((c) => c.id === id) ?? null
}

export function getStudent(classId, studentId) {
  const c = getClass(classId)
  if (!c) return null
  return c.students.find((s) => s.id === studentId) ?? null
}

export function strugglingCount(c) {
  return c.students.filter((s) => s.status === "difficulte").length
}
