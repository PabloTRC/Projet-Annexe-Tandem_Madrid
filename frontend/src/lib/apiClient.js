/**
 * Client API — point d'entrée réseau unique.
 *
 * Pour l'instant, `request()` lit/écrit dans les données mockées (en
 * mémoire) avec une latence simulée. Le jour où le backend REST est branché,
 * seule cette fonction change (fetch(BASE_URL + path, ...)) : les services
 * métier (coursService, elevesService, etc.) n'ont pas à être réécrits.
 */

const BASE_URL = '/api' // utilisé quand USE_MOCKS passera à false
const USE_MOCKS = true
const SIMULATED_LATENCY_MS = 150

function delay(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * @param {string} path chemin logique de la ressource (ex: "/cours/1")
 * @param {{ method?: string, body?: any, mockResolver?: () => any, latencyMs?: number }} options
 */
export async function request(path, options = {}) {
  if (USE_MOCKS) {
    if (!options.mockResolver) {
      throw new Error(`Aucun mockResolver fourni pour ${options.method || 'GET'} ${path}`)
    }
    return delay(options.mockResolver(), options.latencyMs ?? SIMULATED_LATENCY_MS)
  }

  const response = await fetch(BASE_URL + path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status} sur ${path}`)
  }

  return response.status === 204 ? null : response.json()
}
