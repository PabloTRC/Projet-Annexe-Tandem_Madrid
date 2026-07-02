/* ==========================================================================
   Client API — point d'entrée réseau unique (voir frontend-professeur pour
   le même composant, dupliqué volontairement pour garder les deux
   frontends indépendants).
   ========================================================================== */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const BASE_URL = "/api";
  const USE_MOCKS = true;
  const SIMULATED_LATENCY_MS = 150;

  function delay(value, ms) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
  }

  async function request(path, options = {}) {
    if (USE_MOCKS) {
      if (!options.mockResolver) {
        throw new Error(`Aucun mockResolver fourni pour ${options.method || "GET"} ${path}`);
      }
      return delay(options.mockResolver(), options.latencyMs ?? SIMULATED_LATENCY_MS);
    }

    const response = await fetch(BASE_URL + path, {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status} sur ${path}`);
    }

    return response.status === 204 ? null : response.json();
  }

  window.App.services.apiClient = { request };
})();
