# Billar Tres Bandas Pro - Versión final usuario

Esta versión queda optimizada para GitHub Pages, Google Sites y uso móvil tipo app/PWA.

Cambios finales principales:

- Física recalibrada: mayor rodaje, menor frenado artificial, bandas más naturales y transferencia de bola más estable.
- Botón **Tirar** visible para móvil y escritorio. También funcionan doble toque, Enter y barra espaciadora.
- Botón **Demostración** en modo práctica para ver la ruta modelo sin confundirla con el tiro físico real.
- Diseño responsive tipo app móvil con controles inferiores y modo horizontal compacto.
- PWA activada: manifest enlazado y Service Worker registrado desde `index.html`.
- Video local con `preload=metadata` para reducir carga inicial.
- Compatible con publicación en GitHub Pages e incrustación por URL en Google Sites.

Ver también: `INSTRUCCIONES_GITHUB_SITES.txt` y `CAMBIOS_VERSION_FINAL_USUARIO.txt`.

---

# Billar Tres Bandas Pro

Aplicación web/PWA para practicar billar tres bandas con sonido, replay, ubicación libre de bolas, video guía y modo técnica del video.

## Novedades de esta versión

- Modo **Técnica video** con 149 carambolas.
- Imágenes de referencia generadas para las jugadas **026–149**: posición inicial y recorrido guiado.
- En modo técnica, al tocar **Tirar** o hacer doble toque, la blanca sigue la ruta guiada y valida la carambola para que se pueda practicar como en el video.
- En modo libre se conserva el tiro físico real con taco, efecto y potencia.
- Botones de ayuda: **Video guía**, **Técnica video**, **Ver imágenes**, **Cuadrar carambola**, **Alinear fácil**, **Ubicar bolas**, **Repetir tiro** y **Ver replay**.

## Cómo publicarla en GitHub Pages

1. Sube todos los archivos de esta carpeta al repositorio.
2. En GitHub ve a **Settings > Pages**.
3. En **Source**, selecciona la rama `main` y la carpeta `/root`.
4. Abre la URL que GitHub Pages genere.

## Estructura importante

- `index.html`: aplicación completa.
- `assets/jugadas/001/` hasta `assets/jugadas/149/`: imágenes de referencia.
- `manifest.webmanifest` y `sw.js`: soporte PWA.
- `icon-*.png`: íconos de instalación.

## Uso recomendado

1. Abre **Técnica video**.
2. Selecciona una jugada.
3. Pulsa **Ver imágenes** para comparar posición y recorrido.
4. Usa **Cuadrar carambola** o **Alinear fácil**.
5. Toca **Tirar** o haz doble toque sobre la mesa para ejecutar la carambola guiada.
Actualización: jugadas 026, 027 y 028 integradas con imágenes exactas del video y recorrido guiado para completar la carambola en Técnica video.


Actualización 029: se integró la jugada 029 con posición inicial y recorrido guía y carambola guiada en Técnica video.

Actualización 030: se integró la jugada 030 con posición inicial y recorrido guía y carambola guiada en Técnica video.

Actualización 031: se integró la jugada 031 con posición inicial y recorrido guía y carambola guiada en Técnica video.

Actualización lógica: se corrigió el cálculo de potencia, efecto, punto fantasma de golpe a la bola receptora, conteo real de bandas y validación de primer/segundo contacto para las jugadas guiadas.

Actualización 033: se integraron y corrigieron las jugadas 032 y 033 con posición inicial y recorrido guía, potencia, efecto y golpe a la receptora en Técnica video.

Actualización 034: se integró la jugada 034 con posición inicial y recorrido guía, potencia, efecto y golpe a la receptora en Técnica video.

Actualización 035: se integró la jugada 035 con posición inicial y recorrido guía, potencia, efecto y golpe a la receptora en Técnica video.

Actualización 036: se integró la jugada 036 con primera bola amarilla, cierre a la roja, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 037-038: se integraron las jugadas 037 y 038 con primera bola amarilla, cierre a la roja, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 039: se integró la jugada 039 con primera bola amarilla, cierre a la roja inferior izquierda, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 040: se integró la jugada 040 con primera bola amarilla, cierre a la roja superior izquierda, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 041: se integró la jugada 041 con primera bola roja, cierre a la amarilla inferior izquierda, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 042: se integró la jugada 042 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 043: se integró la jugada 043 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 044: se integró la jugada 044 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 045: se integró la jugada 045 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 046: se integró la jugada 046 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto y golpe a la receptora.

Actualización 047: se integró la jugada 047 con posición inicial y recorrido guía y lógica corregida de potencia, efecto y contacto.

Actualización 048: se integró la jugada 048 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto abajo-izquierda y golpe fino a la receptora.

Actualización 049: se integró la jugada 049 con primera bola amarilla, cierre a la roja, posición inicial y recorrido guía, potencia, efecto arriba-izquierda y golpe fino a la receptora.

Actualización 050: se integró la jugada 050 con primera bola amarilla, cierre a la roja, posición inicial y recorrido guía, potencia, efecto arriba-izquierda y golpe fino a la receptora.

Actualización 051: se integró la jugada 051 con primera bola roja, cierre a la amarilla, posición inicial y recorrido guía, potencia, efecto arriba-izquierda y golpe fino a la receptora.

Actualización 052: se integró la jugada 052 con primera bola amarilla, cierre a la roja, posición inicial y recorrido guía, potencia, efecto arriba-izquierda y golpe fino a la receptora.

Actualización 053: se integró la jugada 053 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización 054: se integró la jugada 054 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización 055: se integró la jugada 055 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización 057: se integró la jugada 057 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización 058: se integró la jugada 058 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización 059: se integró la jugada 059 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización 060: se integró la jugada 060 con posición inicial y recorrido guía, potencia, efecto y contacto corregidos.

Actualización video exacto: se reanalizó el MP4 subido y se reemplazaron las jugadas 026–060 con fotogramas reales del video; además se recalibró la física de fricción, banda, efecto y colisión.

Actualización video Drive: el video guía se reproduce mediante iframe de Google Drive para conservar audio y evitar incluir un MP4 pesado dentro del ZIP.

Actualización video Drive: el botón Video guía abre el iframe embebido y actualiza la jugada, imágenes y descripción; el tiempo se muestra como referencia porque Google Drive no permite salto automático desde JavaScript.


Nota imágenes 1 y 2: el visor de imágenes muestra únicamente la posición inicial y el recorrido guiado; se eliminó la Imagen 3 del modal para que la práctica sea más limpia.

Actualización imágenes 061–149: se reforzaron las imágenes generadas con diamantes visibles en las cuatro bandas, manteniendo el formato de Imagen 1 (posición inicial) e Imagen 2 (recorrido guiado).
