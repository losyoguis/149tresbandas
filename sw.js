const CACHE_NAME = 'entrenador-carambola-guiada-v202-produccion-predictiva';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/styles.css', './js/app.js', './qa_v177_guia_sincronizada.json', './qa_v178_guia_maestra_video.json', './qa_v179_guia_principal_seleccion.json', './qa_v180_guia_principal_persistente.json', './qa_v181_instrucciones_modal.json', './qa_v182_efecto_sincronizado.json', './qa_v183_efecto_precision_milimetrica.json', './qa_v184_iman_guia_carambola.json', './qa_v185_instrucciones_ajuste.json', './qa_v186_guia_seleccion_libre.json', './qa_v187_assets_jugadas_planas.json', './qa_v188_nota_instrucciones.json', './qa_v189_control_calidad_responsive_tv.json', './qa_v190_iman_fisico_realista.json', './qa_v191_videotutorial.json', './qa_v192_iluminacion_carambola.json', './qa_v193_inicio_5_potencia.json', './qa_v194_iluminacion_coincidencia_guias.json', './qa_v195_sistema_carambola_guiada.json', './qa_v196_iluminacion_carambola_real.json', './qa_v197_entrenador_carambola_guiada.json', './qa_v198_iluminacion_guia_predictiva.json', './qa_v199_efecto_visual_invisible_fisica.json', './qa_v200_efecto_interactivo_invisible.json', './qa_v201_neon_bola_blanca.json', './qa_v202_produccion_predictiva.json',
  './qa_control_calidad_v161.json', './qa_guia_dinamica_v161.json', './qa_tiro_real_v160.json', './qa_guia_referencia_imagen2_v162.json', './icon-48.png', './icon-72.png', './icon-96.png', './icon-128.png', './icon-144.png', './icon-152.png', './icon-192.png', './icon-384.png', './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        if (request.method === 'GET' && (request.destination === 'image' || request.url.includes('/assets/jugadas/'))) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});
