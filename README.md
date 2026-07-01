# Entrenador de Carambola Guiada

Versión funcional completa con la jugada 080 eliminada y 148 jugadas jugables.

## Cambios v162

- La guía de referencia de cada jugada ya no se dibuja con puntos inventados.
- Se generó una imagen transparente `guia_referencia.png` para cada jugada, extraída directamente desde `recorrido_guia.webp` — la imagen 2 de cada carambola.
- La mesa muestra esa guía exacta cuando está activo el modo práctica y la guía está encendida.
- Se mantiene el disparo real: si el usuario taca mal, la bola sigue su trayectoria física normal y no se fuerza la carambola.
- El botón **Demostración** sigue usando la ruta modelo para estudiar la jugada.
- Se conserva la sincronización especial del video para las jugadas 115, 127, 132, 134, 135, 136, 140, 147 y 149.
- Si hay bola receptora en la guía dinámica, se muestra con el color real; si no hay bola receptora activa, no se muestra nada.

## Control de calidad incluido

- `qa_guia_referencia_imagen2_v162.json`: reporte de extracción y validación de las 148 guías desde la imagen 2.
- `qa_control_calidad_v161.json`
- `qa_guia_dinamica_v161.json`
- `qa_tiro_real_v160.json`

## Estructura relevante

Cada jugada tiene:

- `posicion_inicial.webp`
- `recorrido_guia.webp`
- `guia_referencia.png`


## Nota de extracción

En las jugadas donde la imagen 2 no trae recorrido visible suficiente, la guía se deja transparente para no inventar trayectorias. En esta versión quedaron sin guía visual extraída: 046 y 079.


Actualización v165: reemplazadas las imágenes de la jugada 042 (posición inicial y recorrido guía) con el material enviado por el usuario. La guía de referencia se regeneró a partir de la diferencia entre imagen 1 e imagen 2.

Actualización v166: reemplazadas las imágenes de la jugada 044 (posición inicial y recorrido guía) con el material enviado por el usuario. La guía de referencia se regeneró desde la imagen 2 comparada con la imagen 1.

Actualización v167: reemplazadas las imágenes de la jugada 045 (posición inicial y recorrido guía) con el material enviado por el usuario. La guía de referencia se regeneró desde la imagen 2 comparada con la imagen 1.

Actualización v168: reemplazadas las imágenes de la jugada 046 (posición inicial y recorrido guía) con el material enviado por el usuario. La guía de referencia se regeneró desde la imagen 2 comparada con la imagen 1.

Actualización v169: reemplazadas las imágenes de la jugada 058 (posición inicial y recorrido guía) con el material enviado por el usuario. La guía de referencia se regeneró desde la imagen 2 comparada con la imagen 1.

Control de calidad v170: integradas definitivamente las jugadas 042, 044, 045, 046 y 058 con sus nuevas imágenes (posición inicial y recorrido guía). Validado el paquete completo: 148 jugadas activas, 296 imágenes WEBP, guías de referencia presentes por jugada, selector sin la 080, y assets listos para carga.

Control de calidad visual v172: la guía principal de todas las jugadas se suavizó para que se vea como la referencia deseada (más sutil y elegante, similar a la imagen 2). Se redujo la intensidad del brillo, se limpiaron artefactos pequeños y se mantuvo la trayectoria exacta de cada jugada.

Actualización v173: la guía dinámica en modo Imagen jugada usa el efecto visual exacto del punto azul de la imagen/modal. Se agregaron correcciones de efecto para las jugadas 044 y 046 actualizadas, se conserva el efecto al mover el taco y la mini-guía sigue la dirección del taco.


## Actualización v174

- **Móvil corregido:** la botonera principal ya no queda fija encima de la mesa; los controles quedan debajo para no tapar la jugada.
- **Tirar = física real:** el botón **Tirar** nunca ejecuta la ruta calibrada ni suma punto de forma forzada. La bola sale hacia donde apunta el taco.
- **Demostración = ruta modelo:** la ejecución exacta de la jugada queda reservada únicamente para **Demostración**.
- **Código refactorizado:** CSS y JavaScript se separaron en `css/styles.css` y `js/app.js`; `index.html` queda más limpio para mantenimiento y alojamiento en GitHub Pages / Google Sites.
- **Física refinada:** se ajustaron rebote de bandas, restitución de bolas, fricción tangencial de banda, transferencia de efecto y velocidad de bolas objetivo para un comportamiento menos exagerado y más estable.


## Actualización v175
- Potencia extendida hasta 160% para tiros largos de tres bandas.
- Detección automática de jugadas largas según longitud de la guía y descripción técnica.
- El taco mantiene el comportamiento normal hasta 100% y permite una reserva progresiva al halarlo más atrás.
- Aviso visual de tiro largo y recomendación de potencia cuando la jugada requiere más recorrido.
- Física recalibrada solo para tiros largos: menos pérdida por fricción, rebote de banda más vivo y efecto lateral más sostenido.
- Tirar sigue siendo física real; Demostración sigue reservada para la ruta modelo exacta.


## Actualización v176 — física profesional

- **Motor de paño estable:** se eliminó la física especial que cambiaba fricción y rebote solo por ser tiro largo. La potencia extendida sigue disponible, pero la mesa conserva un comportamiento único y más realista.
- **Bandas más reales:** el rebote ahora depende de ángulo de llegada, velocidad, pérdida tangencial y efecto lateral. El efecto a favor abre la ruta y el contrario la cierra con más naturalidad.
- **Efecto con vida propia:** la blanca conserva y pierde efecto progresivamente por paño, banda y choque, con una curvatura leve por efecto lateral sin exagerar el movimiento.
- **Choques por grosor:** se mejoró el throw entre bolas, la pérdida por deslizamiento y la transferencia de corrido/retroceso para que los impactos se sientan menos mecánicos.
- **Guía predictiva:** la línea de tiro se calcula con el mismo motor profesional del disparo real, para que el usuario vea una predicción física y no una carambola forzada.
- **Demostración sin puntaje:** el botón Demostración queda como estudio de la ruta modelo; no suma puntos ni intentos. Solo Tirar cuenta como práctica real.
- **Diagnóstico técnico:** después de fallar en modo práctica, la app entrega una corrección más útil: potencia, bandas, orden de bolas, grosor, efecto o cierre.

Versión recomendada para alojar en GitHub Pages o incrustar en Google Sites como entrenador final de billar tres bandas.


## v177 - Guía dinámica sincronizada con tiro real

Corrección aplicada después de detectar desfase entre la guía amarilla y el recorrido blanco real de la tacada:

- La guía dinámica y el botón **Tirar** usan la misma física de paño, banda, efecto y choque.
- El modo de tiro largo ya no se calcula distinto entre predicción y ejecución.
- El decaimiento de efecto al tocar banda/bola queda sincronizado.
- La colisión entre bolas en la guía replica la corrección física del tiro real.
- La ruta predictiva usa más pasos para no cortar recorridos de 3, 4 o 5 bandas.

Resultado esperado: lo que se muestra en la guía amarilla debe corresponder a lo que hace la bola blanca al disparar, sin rutas desfasadas.


## v178 - Guía maestra sincronizada con video

Corrección aplicada a partir de los pantallazos donde se veía una ruta calculada y otra ruta ejecutada. En modo **Imagen jugada** ahora se muestra una sola guía principal: la línea punteada corresponde a la ruta maestra del video y el botón **Tirar** ejecuta esa misma trayectoria mientras el usuario no modifique taco, potencia, efecto ni posición de bolas.

Cambios clave:

- Se evita la superposición confusa entre ruta de referencia, guía predictiva y estela real.
- En práctica con Imagen jugada armada, la guía visible y la tacada exacta usan el mismo `guidePath`.
- Si el usuario mueve manualmente el taco, cambia potencia/efecto o reubica bolas, la guía pasa a predicción física libre y se avisa que la sincronización maestra fue desactivada.
- **Demostración** conserva su función de estudio y no suma puntos ni intentos.
- **Tirar** en guía maestra sí suma intento y punto cuando completa la carambola.
- Service worker actualizado a v178 para evitar caché antiguo.


## v179 - Guía principal automática al seleccionar jugada

Corrección solicitada:

- Al seleccionar una jugada desde el selector, la mesa activa inmediatamente la guía principal.
- La guía principal se marca visualmente con una banda verde luminosa debajo de la línea punteada amarilla.
- La banda verde y la línea amarilla usan exactamente los mismos puntos de la ruta maestra; no son dos cálculos diferentes.
- Si se presiona Tirar sin modificar taco, potencia, efecto o bolas, la tacada sigue esa misma guía visible.
- Si el jugador modifica el taco, potencia, efecto o posición de las bolas, la banda verde se oculta y queda la predicción física libre del ajuste manual.
- Service worker actualizado a v179 para evitar caché viejo en navegador/PWA.


## v180 - Guía principal persistente durante la tacada

Corrección solicitada:

- La guía principal verde de la jugada queda siempre visible al seleccionar una carambola.
- La guía principal ya no se borra al presionar **Tirar**, al hacer doble toque ni mientras la bola blanca está rodando.
- Si el jugador modifica taco, potencia, efecto o bolas, la referencia principal verde permanece como ruta maestra de estudio.
- La línea amarilla puede seguir mostrando la predicción física del ajuste actual, pero la ruta principal no desaparece.
- En tiros sincronizados con Imagen jugada, la bola ejecuta la ruta visible y la guía queda como referencia durante todo el ataque.
- Service worker actualizado a v180 para evitar caché viejo en navegador/PWA.


## v181 - Modal de instrucciones para ejecutar la tacada

- Se agregó debajo del subtítulo principal un botón **Instrucciones**.
- El botón abre un modal accesible con los pasos para seleccionar jugada, observar video, memorizar figura, configurar efecto, apuntar, ajustar potencia y tirar.
- El modal se puede cerrar con la X, con el botón Entendido, clic fuera del panel o tecla Escape.
- Mientras el modal está abierto, Enter no ejecuta la tacada accidentalmente.
- Service worker actualizado a v181 para evitar caché viejo en navegador/PWA.


## v182 - Efecto sincronizado en guía dinámica

- El botón **Imagen jugada** fue renombrado a **Efecto**.
- En la guía dinámica, el **punto azul**, la **bola tacadora** y la **mini-guía** ahora usan la misma referencia de efecto para quedar sincronizados con mayor precisión respecto a la imagen de la jugada.
- Se unificó la escala visual del punto de efecto en:
  - control de efecto,
  - guía dinámica,
  - visor de contacto,
  - visor de bolas.
- Se conserva la guía principal persistente y la física libre profesional.
- Service worker actualizado a **v182** para evitar caché viejo.


## v183 - Efecto con precisión milimétrica

- El botón **Efecto** ahora no solo carga el punto azul y la potencia de referencia: también **reposiciona automáticamente el taco** con una corrección fina basada en la geometría visible de cada imagen.
- El cálculo combina:
  - solape visual entre bolas,
  - separación relativa,
  - lado del contacto,
  - microajuste derivado del ángulo mostrado en la imagen.
- Esto mejora la coincidencia entre la imagen de la jugada, la mini-guía y la tacada inicial cuando se selecciona una carambola.
- Service worker actualizado a **v183**.


## v184 - Imán inteligente de guía para carambola

- Se agregó un **imán inteligente** entre la guía principal verde y la guía de tacada.
- Cuando la guía de tacada se acerca a la ruta maestra de la jugada, la línea amarilla se engancha visualmente a la guía principal.
- Si el usuario tira con el imán activo, la app ejecuta la ruta maestra sincronizada para ayudar a completar la carambola.
- El imán solo actúa cuando hay cercanía real de trayectoria, dirección compatible, bolas en posición base y primera bola correcta.
- Si el jugador apunta lejos de la ruta, se mantiene la física libre profesional.
- Service worker actualizado a **v184**.


## v185 - Ajuste de instrucciones

- En el modal de **Instrucciones**, punto 1, se eliminó la frase “o el sistema de tres bandas”.
- El texto quedó: **Selecciona la jugada: Elige la carambola que deseas practicar.**
- Se conserva el imán de carambola, la guía principal persistente, el botón Efecto y la física profesional.
- Service worker actualizado a **v185** para evitar caché anterior.


## v186 - Guía libre al seleccionar jugada

- Al seleccionar una jugada, la **guía principal verde** queda visible como referencia, pero la **guía de tacada** ya no se arma automáticamente perfecta para hacer la carambola.
- La tacada inicia ligeramente separada de la ruta maestra para que el jugador deba ajustar dirección, potencia o efecto.
- El **imán de carambola** queda bloqueado justo al cargar la jugada y solo se activa después de que el jugador haga un ajuste y acerque la guía de tacada a la guía principal.
- El botón **Efecto** y el ajuste manual de taco/potencia permiten sincronizar la tacada; se retiraron referencias a controles antiguos de la interfaz de producción.
- Service worker actualizado a **v186**.


## v187 - Assets de jugadas en carpeta plana

- Se eliminó la estructura de subcarpetas numeradas dentro de `assets/jugadas`.
- Ahora todos los archivos quedan directamente dentro de `assets/jugadas/` con el número de jugada al final:
  - `posicion_inicial_001.webp`
  - `recorrido_guia_001.webp`
  - `guia_referencia_001.png`
- Se actualizaron las rutas internas del juego para cargar las 148 jugadas desde la nueva estructura plana.
- Service worker actualizado a **v187** para evitar caché viejo.


## v188 - Nota adicional en instrucciones

- Se agregó una nota en el modal de **Instrucciones**.
- Texto agregado: *Si no deseas practicar las 148 jugadas activas, puedes utilizar los botones de Modo libre y Ubicar bolas para practicar tu sistema.*
- Se conserva la estructura plana de `assets/jugadas` y el resto de mejoras previas.
- Service worker actualizado a **v188**.


## v189 - Control de calidad responsive, móvil y TV

- Se cambió la nota del modal de instrucciones a: *Si no deseas practicar las 148 jugadas activas predefinidas, puedes utilizar los botones de Modo libre y Ubicar bolas para entrenar tu propio sistema.*
- Se agregó el botón **Mesa completa** para activar un modo de mesa a pantalla completa compatible con móviles, tablets, TV y escenarios donde la Fullscreen API esté limitada por Google Sites.
- Se reforzó el juego táctil en móviles: la mesa conserva `touch-action: none`, el área de juego ocupa el mayor espacio posible y los controles se mantienen accesibles con zonas táctiles grandes.
- Se agregó soporte para control remoto/teclado de TV:
  - flechas izquierda/derecha: ajustar dirección del taco,
  - flechas arriba/abajo: ajustar potencia,
  - OK/Enter/Espacio: tirar,
  - Atrás/Escape: salir de mesa completa,
  - F: alternar Mesa completa.
- Se añadieron estilos de foco visibles para navegación con control remoto.
- Se conserva la estructura plana de `assets/jugadas`, la guía persistente, el imán de carambola y el botón **Efecto**.
- Service worker actualizado a **v189** para evitar caché viejo en GitHub Pages y Google Sites.


## v190 - Imán físico realista

- Cuando la guía de tacada se acerca a la guía principal, el imán ya no dispara una ruta lineal automática.
- El imán ahora funciona como **asistencia física**: corrige suavemente salida, potencia y efecto, pero el disparo se calcula con el motor físico real.
- La tacada mueve las tres bolas con colisiones, bandas, fricción, efecto lateral, corrido/retroceso y pérdida de energía.
- La línea verde sigue siendo referencia; la línea de tacada muestra la predicción física actual.
- La **Demostración** conserva la ruta exacta del video para estudiar la figura.
- Service worker actualizado a **v190**.


## v191 - Botón Videotutorial

- El botón **Video guía** fue renombrado a **Videotutorial**.
- Se actualizaron el título del modal, textos de estado y etiquetas accesibles relacionadas.
- Se conserva el imán físico realista, la guía principal persistente, la estructura plana de assets, la compatibilidad GitHub Pages/Google Sites, responsive móvil/TV y pantalla completa.
- Service worker actualizado a **v191** para evitar caché viejo.


## v192 - Iluminación de carambola lograda

- Al lograrse una carambola válida, la app ilumina la jugada con una línea de éxito y brillo sobre la mesa.
- La iluminación aparece tanto si la carambola se logra con guía base/imán como si se logra con una jugada propia en modo físico libre.
- Se resaltan temporalmente las tres bolas involucradas y aparece un aviso de carambola lograda.
- La física del tiro se conserva: la iluminación no fuerza el recorrido, solo celebra visualmente el resultado válido.
- Service worker actualizado a **v192**.


## v193 - Inicio de jugada al 5% de potencia

- Cada vez que se carga o comienza una jugada de práctica, la potencia inicial queda en **5%**.
- La guía principal verde sigue como referencia, pero el jugador debe ajustar la fuerza manualmente.
- Se conserva la iluminación de carambola lograda tanto con guía base como con sistema propio.
- El botón **Efecto** y el ajuste manual de taco/potencia siguen disponibles para acercar la guía predictiva a la referencia cuando se necesite.
- Service worker actualizado a **v193** para evitar caché viejo.


## v194 - Iluminación por coincidencia de guías

- La iluminación ya no se activa por lograr la carambola.
- Ahora la iluminación aparece cuando la **guía de tacada** coincide o se acerca a la **guía principal**.
- Funciona al cargar/sincronizar una jugada y también cuando el jugador ajusta libremente el taco hasta acercarse a la ruta base.
- La carambola sigue validándose normalmente, pero la iluminación queda reservada para la coincidencia visual de guías.
- Service worker actualizado a **v194**.


## v195 - Nombre oficial de la app

- Se cambió el nombre visible de **Billar tres bandas Pro** a **Sistema de Carambola Guiada**.
- Se actualizó el título HTML, la cabecera principal, el nombre PWA del manifest y el caché del service worker.
- Se conservan las mejoras previas: guía principal persistente, iluminación por coincidencia de guías, inicio al 5% de potencia, imán físico realista, Videotutorial, pantalla completa móvil/TV, estructura plana de assets y compatibilidad GitHub Pages / Google Sites.
- Service worker actualizado a **v195**.


## v196 - Iluminación al marcar carambola real

- Se recuperó y reforzó la iluminación cuando se marca una carambola real.
- Funciona en **Modo libre** y también con una jugada seleccionada.
- Si la carambola se logra con la guía base, se ilumina como carambola de referencia.
- Si se logra con otro sistema físico, se ilumina como carambola alternativa.
- Se conserva la iluminación por coincidencia de guías: ahora existen ambos comportamientos.
- Service worker actualizado a **v196**.


## v197 - Nombre Entrenador de Carambola Guiada

- Se cambió el título principal visible de **Sistema de Carambola Guiada** a **Entrenador de Carambola Guiada**.
- Se actualizó el título del navegador, el manifest/PWA, el nombre corto para móviles y el caché del service worker.
- Se conservan todas las funciones previas: iluminación de carambola real, imán físico, guía principal persistente, Videotutorial, modo móvil/TV y assets planos.
- Service worker actualizado a **v197**.


## v198 - Iluminación predictiva por guía

- La iluminación ya no se dispara por el resultado final de la carambola.
- La iluminación aparece cuando la **guía de tacada/predicción** anticipa una carambola de **3 o más bandas**.
- En una jugada cargada, también se ilumina cuando la guía predictiva coincide o se acerca a la guía base.
- En **Modo libre**, si la guía generada por la potencia/efecto/dirección actual muestra una carambola de 3+ bandas por cualquier sistema, esa guía se ilumina.
- Al tacar, la iluminación predictiva se conserva como referencia; el tiro sigue con física real.
- Service worker actualizado a **v198**.


## v199 - Efecto visual invisible para la física

- La bola blanca visual del control de efecto queda 100% transparente para la tacada, la guía predictiva y los toques sobre la mesa.
- Visualmente se sigue viendo igual para el jugador, pero el cuerpo blanco del control ya no bloquea ni intercepta el arrastre del taco.
- Solo el punto rojo/azul del efecto queda como zona interactiva para ajustar el efecto.
- La física, la guía, el imán y la validación no consideran el control visual como objeto de juego.
- Se mantiene iluminación predictiva por guías de 3+ bandas, modo móvil/TV, assets planos y PWA para GitHub/Google Sites.


## v200 - Efecto interactivo sin interferir con la física

- Se corrigió el control de efecto para que el punto rojo/azul vuelva a poder arrastrarse con mouse o dedo.
- La bola visual de efecto sigue sin participar en la física, guía, colisiones ni rutas de tacada.
- Se agregó detección de toque dentro de la bola visual de efecto desde la mesa: si el usuario toca esa zona, se interpreta como ajuste de efecto; fuera de ella, se mantiene el control normal del taco.
- Se añadió arrastre global durante el movimiento del punto para que no se corte al salir del círculo.
- Service worker actualizado a **v200**.


## v201 - Iluminación neón breve y bola blanca resaltada

- Se cambió el color de iluminación a un neón más limpio tipo cian/violeta.
- La animación de iluminación ahora es más breve y menos invasiva.
- Siempre que una guía se ilumina, la bola blanca queda resaltada con un halo más claro para que el jugador ubique la tacadora.
- Se conserva la interacción del efecto invisible para la física y compatible con móvil/TV.
- Service worker actualizado a **v201**.

## v202 - Producción predictiva y limpieza final

- Interfaz actualizada a **148 jugadas activas**; la jugada 080 se mantiene excluida por falta de assets.
- Limpieza de textos que mencionaban botones inexistentes o acciones antiguas de carga manual.
- La jugada **001** fue revisada: la guía base ahora registra tres bandas antes del cierre a la segunda bola.
- La iluminación final queda basada en la **predicción previa** de la guía cuando anticipa carambola de 3 o más bandas; no depende de una celebración posterior del resultado.
- Service worker actualizado a **v202** para evitar caché vieja en producción.
- Archivo QA agregado: `qa_v202_produccion_predictiva.json`.


## v203 - Móvil limpio y Mesa completa

- Se ocultó el aviso flotante de **Control remoto** en modo móvil y pantallas táctiles para no tapar la mesa ni generar distracciones.
- En vista normal el aviso de control remoto permanece oculto; solo puede aparecer en Mesa completa de escritorio/TV.
- Se corrigió el modo **Mesa completa** para que el fullscreen nativo incluya también la barra inferior de acciones.
- El botón **Tirar** queda visible en Mesa completa para móviles, tablets, escritorio y TV.
- Se reforzó por CSS la visibilidad de la barra inferior y del botón **Tirar** en todos los tamaños de pantalla.


## v204 - Video móvil Android/iOS
- El modal de videotutorial detecta pantallas táctiles/móviles y usa reproductor YouTube móvil compatible con Android/iOS.
- Se conserva Google Drive para escritorio, pero en celular se evita el recorte oscuro del iframe de Drive.
- El video queda en proporción 16:9, con alto controlado por `dvh` y safe-area para navegadores móviles.
- En móvil se oculta el panel lateral de imágenes dentro del modal para priorizar el video y los controles.
- Se actualizó caché del service worker para evitar que cargue la versión anterior.

## v205 - Mesa completa con controles laterales compactos
- En modo Mesa completa se muestra un panel lateral compacto.
- El selector de carambolas queda visible a un lado sin ocupar el HUD completo.
- Los botones principales quedan disponibles en el lateral: Tirar, Repetir, Replay, Guía, Libre, Ubicar, Nueva y Salir.
- En pantallas anchas se reserva espacio para que los controles no tapen la mesa; en móviles se usa un lateral compacto para conservar área de juego.


## v206 - Mesa completa maximizada con controles derechos mínimos

Ajustes de producción:

- En Mesa completa se ocultan los botones **Ver replay**, **Demostración** y **Nueva posición**.
- El selector de carambolas se conserva como control compacto en el lateral derecho.
- Los controles visibles quedan a la derecha: **Tirar**, **Repetir tiro**, **Guía**, **Modo libre**, **Ubicar bolas** y **Salir de mesa completa**.
- La mesa ya no reserva espacio lateral; ocupa el máximo espacio posible y los controles flotan encima con tamaño reducido.
- Se actualiza el service worker para evitar caché vieja.


## v207 - Mesa completa móvil y modal con imágenes visibles
- En Mesa completa para móvil Android/iOS, la mesa ocupa el mayor espacio posible.
- Botón Tirar grande, circular y fijo en la esquina inferior derecha.
- Controles superiores izquierdos: selector de jugada, Repetir tiro y Guía.
- Controles superiores derechos: Modo libre, Ubicar bolas y Salir de Mesa completa.
- En el modal de video móvil se vuelven a mostrar siempre las imágenes de referencia de la jugada.


## v208 - Mesa completa móvil con controles ordenados

Ajustes de producción:

- En Mesa completa móvil se reordenan los controles para Android/iOS.
- Izquierda superior: selector de jugada, Repetir y Guía.
- Derecha superior: Libre, Ubicar y Salir.
- Botón Tirar grande, circular y fijo en la parte inferior derecha.
- La mesa ocupa el máximo espacio posible; los botones flotan encima sin reservar ancho ni alto.
- Se mantienen ocultos Ver replay, Demostración y Nueva posición dentro de Mesa completa móvil.
- El modal móvil conserva las imágenes de referencia visibles junto al video.


## v209 - Mesa completa móvil con bola de efecto externa

- En móviles Android/iOS, cuando se activa Mesa completa, el control de efecto ya no aparece sobre la mesa.
- La bola blanca de efecto queda fija abajo a la izquierda, del mismo tamaño que el botón Tirar.
- El punto rojo se puede mover tocando o arrastrando cualquier zona de la bola de efecto.
- El botón Tirar permanece grande, circular y fijo abajo a la derecha.
- Se mantiene la distribución superior: izquierda selector/Repetir/Guía; derecha Libre/Ubicar/Salir.
- La mesa conserva el máximo espacio posible porque los controles flotan sobre los bordes.

## v210 - Mesa completa móvil con UI equilibrada

- Se reorganizaron los controles en Mesa completa móvil para evitar que queden regados sobre la mesa.
- La mesa queda centrada y con el mayor tamaño lógico posible.
- Izquierda superior: selector de jugada, Repetir y Guía.
- Derecha superior: Libre, Ubicar y Salir.
- Inferior derecha: botón Tirar grande y circular.
- Inferior izquierda: bola blanca de efecto, táctil, del mismo tamaño que Tirar.
- Se limpian posiciones CSS heredadas (`top/right/bottom/left`) para evitar reacomodos incorrectos en Android/iOS.
- Se mantiene el modal móvil con imágenes visibles.
- Service worker actualizado a **v210**.
- Archivo QA agregado: `qa_v210_movil_ui_equilibrada.json`.


## v211 · Controles móviles verticales y diamantes visibles

- Mesa completa móvil reorganizada para Android/iOS en horizontal.
- Columna izquierda: Jugada, Guía, Repetir.
- Columna derecha: Libre, Ubicar, Salir.
- Botón Tirar abajo a la izquierda, frente a la bola de efecto.
- La mesa se centra y conserva el mayor tamaño lógico sin tapar los diamantes.


## v212 · Controles móviles finales y botones grandes

- En Mesa completa móvil se reorganizan los controles para que no tapen los diamantes.
- Columna izquierda: selector de jugada, Repetir y Guía.
- Columna derecha: Libre, Ubicar y Salir.
- La bola blanca de efecto queda grande abajo a la izquierda, fuera de la mesa.
- El botón Tirar queda grande abajo a la derecha, debajo visualmente de Salir.
- Se conserva el modal móvil con imágenes visibles en Android/iOS.


## v213 · Controles móviles reordenados

- En Mesa completa móvil, la columna izquierda queda con Guía encima del selector de jugada.
- En el lado derecho se ordenan los controles en columna: Libre, Ubicar, Repetir y Salir.
- Se conservan Tirar y la bola de efecto grandes en la parte inferior, fuera del área útil de la mesa.
- Se mantiene la prioridad de mesa grande y diamantes visibles en Android/iOS.


## v214 · Taco suave y potencia controlada

- Se suavizó el apuntado del taco para evitar saltos por micro-movimientos del dedo.
- En móviles Android/iOS se amplió el recorrido necesario para subir potencia.
- La potencia ahora crece con curva progresiva y pasos discretos, evitando tiros demasiado rápidos por accidente.
- Se conserva la física profesional, la guía predictiva, el modo mesa completa móvil y la bola de efecto externa.
- Service worker actualizado a v214 para evitar caché vieja.


## v215 · Taco y guía más manejables

- Se redujo la sensibilidad angular del taco en Android/iOS.
- Se agregó zona muerta para evitar que micro movimientos del dedo muevan la guía amarilla.
- Se suavizó más la actualización de potencia y dirección durante el arrastre.
- Se aumentó el recorrido necesario para subir potencia en móvil.
- Se mantiene la física profesional, la guía principal, la bola de efecto externa y los controles móviles de v213/v214.
- Service worker actualizado a v215 para evitar caché vieja.
