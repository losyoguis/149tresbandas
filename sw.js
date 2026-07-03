const CACHE_NAME = 'entrenador-carambola-guiada-production-v234-github-sites';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/styles.css', './js/app.js', './qa_v177_guia_sincronizada.json', './qa_v178_guia_maestra_video.json', './qa_v179_guia_principal_seleccion.json', './qa_v180_guia_principal_persistente.json', './qa_v181_instrucciones_modal.json', './qa_v182_efecto_sincronizado.json', './qa_v183_efecto_precision_milimetrica.json', './qa_v184_iman_guia_carambola.json', './qa_v185_instrucciones_ajuste.json', './qa_v186_guia_seleccion_libre.json', './qa_v187_assets_jugadas_planas.json', './qa_v188_nota_instrucciones.json', './qa_v189_control_calidad_responsive_tv.json', './qa_v190_iman_fisico_realista.json', './qa_v191_videotutorial.json', './qa_v192_iluminacion_carambola.json', './qa_v193_inicio_5_potencia.json', './qa_v194_iluminacion_coincidencia_guias.json', './qa_v195_sistema_carambola_guiada.json', './qa_v196_iluminacion_carambola_real.json', './qa_v197_entrenador_carambola_guiada.json', './qa_v198_iluminacion_guia_predictiva.json', './qa_v199_efecto_visual_invisible_fisica.json', './qa_v200_efecto_interactivo_invisible.json', './qa_v201_neon_bola_blanca.json', './qa_v202_produccion_predictiva.json', './qa_v203_movil_mesa_completa.json', './qa_v204_video_movil_ios_android.json', './qa_v205_mesa_completa_controles.json', './qa_v206_mesa_max_controles_derecha.json', './qa_v207_movil_fullscreen_imagenes_modal.json', './qa_v208_movil_controles_ordenados.json', './qa_v209_movil_efecto_externo.json', './qa_v210_movil_ui_equilibrada.json', './qa_v211_movil_controles_verticales.json', './qa_v212_movil_controles_finales.json', './qa_v213_movil_controles_reordenados.json', './qa_v214_taco_suave_controlado.json', './qa_v215_taco_guia_mas_manejable.json', './qa_v216_menu_movil_fullscreen.json', './qa_v217_sin_guia_dinamica_movil.json', './qa_v218_potencia_acumulativa_taco.json', './qa_v219_salir_movil_fullscreen.json', './qa_v220_controles_moviles_desplazables.json', './qa_v221_potencia_movil_libre.json', './qa_v222_potencia_movil_reversible.json', './qa_v223_parada_rapida_carambola.json', './qa_v224_salir_movil_asegurado.json', './qa_v226_rango_jugadas_claro.json', './qa_v227_bloqueo_tiro_sin_jugada.json', './qa_v228_replay_bandas_persistentes.json', './qa_v229_guia_dinamica_placeholder.json', './qa_v230_reset_marcador.json', './qa_v231_estado_modo_libre.json', './qa_v232_tirar_bloqueado_animacion.json', './qa_v233_inicio_libre_sin_jugada.json', './qa_v234_github_sites_produccion.json',
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
