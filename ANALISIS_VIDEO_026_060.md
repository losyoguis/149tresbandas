# Análisis del video original – Jugadas 026 a 060

Fuente revisada: `clases de billar.mp4`.

Se reemplazaron las imágenes de posición inicial y recorrido por fotogramas extraídos directamente del MP4. La app conserva la opción de abrir el video de YouTube, pero las referencias internas de las jugadas 026–060 quedan basadas en el archivo subido.

## Tiempos usados

| Jugada | Posición inicial | Recorrido guía |
|---|---:|---:|
| 026 | 23:45 | 23:55 |
| 027 | 24:40 | 24:50 |
| 028 | 25:40 | 25:55 |
| 029 | 26:40 | 26:50 |
| 030 | 27:35 | 27:45 |
| 031 | 28:35 | 28:45 |
| 032 | 29:35 | 29:45 |
| 033 | 30:30 | 30:45 |
| 034 | 31:45 | 32:00 |
| 035 | 32:49 | 33:00 |
| 036 | 34:05 | 34:10 |
| 037 | 35:05 | 35:15 |
| 038 | 36:05 | 36:17 |
| 039 | 37:04 | 37:15 |
| 040 | 38:04 | 38:17 |
| 041 | 38:59 | 39:08 |
| 042 | 39:55 | 40:05 |
| 043 | 40:40 | 40:50 |
| 044 | 41:25 | 41:40 |
| 045 | 42:25 | 42:30 |
| 046 | 43:25 | 43:35 |
| 047 | 43:55 | 44:03 |
| 048 | 44:45 | 44:52 |
| 049 | 45:35 | 45:41 |
| 050 | 46:10 | 46:15 |
| 051 | 46:50 | 46:55 |
| 052 | 47:50 | 47:55 |
| 053 | 48:28 | 48:36 |
| 054 | 49:10 | 49:18 |
| 055 | 49:55 | 50:00 |
| 056 | 50:45 | 50:50 |
| 057 | 51:40 | 51:50 |
| 058 | 52:40 | 52:45 |
| 059 | 53:38 | 53:48 |
| 060 | 54:30 | 54:38 |

## Correcciones de juego

- Se recalibró la física: fricción de paño, restitución de banda, pérdida de energía bola-bola y respuesta del efecto lateral.
- En `Técnica video`, la bola jugadora sigue la ruta de cada jugada para reproducir la carambola como entrenamiento visual.
- En `Juego real libre`, el tiro usa física con rebote, fricción, efecto, choque bola-bola y validación de tres bandas.
- La validación mantiene: primer contacto correcto, mínimo tres bandas y cierre con la segunda bola.
- Se generó `assets/verificacion_video_026_060.jpg` como hoja de control de los fotogramas de recorrido extraídos.
Actualización video Drive: el reproductor usa iframe de Google Drive para conservar el audio sin incluir un MP4 local pesado.

## Corrección de movimiento de bolas objetivo
Se corrigió el modo Técnica video para que la bola receptora y la bola de cierre también se animen después del contacto. La blanca conserva la ruta exacta del video, pero ahora cada contacto genera desplazamiento visual realista con fricción y rebote de banda para las bolas objetivo.

Actualización video Drive: el botón Video guía abre el iframe embebido y actualiza la jugada, imágenes y descripción; el tiempo se muestra como referencia porque Google Drive no permite salto automático desde JavaScript.


Nota imágenes 1 y 2: el visor de imágenes muestra únicamente la posición inicial y el recorrido guiado; se eliminó la Imagen 3 del modal para que la práctica sea más limpia.

Actualización imágenes 061–149: las imágenes generadas posteriores al tramo exacto del MP4 se ajustaron con diamantes visibles en todas las bandas para que funcionen mejor como referencia visual de entrenamiento.
