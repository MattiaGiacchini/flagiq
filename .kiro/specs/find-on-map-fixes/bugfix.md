# Bugfix Requirements Document

## Introduction

Este bugfix aborda múltiples problemas visuales y de experiencia de usuario en el modo de juego "Find on Map" del sistema FlagIQ. Los problemas incluyen: mapa no centrado correctamente al seleccionar un solo continente, inconsistencia de colores en el gap entre contenedores, experiencia móvil deficiente con layout inadecuado, y deformación visual del mapa en ciertos continentes. Estos problemas afectan la usabilidad del juego, especialmente en dispositivos móviles, y crean una experiencia visual inconsistente.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN el usuario selecciona un solo continente en la configuración de sesión y juega en modo "find-on-map" THEN el mapa no está centrado correctamente en ese continente, mostrando una vista desplazada o mal encuadrada

1.2 WHEN el usuario visualiza el modo "find-on-map" en desktop THEN existe un gap blanco entre el contenedor del mapa y el panel de control, que no coincide con el color de fondo de la aplicación (#f0f2f8)

1.3 WHEN el usuario accede al modo "find-on-map" en dispositivos móviles THEN el panel lateral ocupa espacio valioso de la pantalla, reduciendo el área disponible para el mapa y generando una experiencia de usuario deficiente

1.4 WHEN el usuario visualiza países en Asia, Australia o Europa en el mapa interactivo THEN los países se muestran con formas deformadas o distorsionadas respecto a su geografía real

### Expected Behavior (Correct)

2.1 WHEN el usuario selecciona un solo continente en la configuración de sesión y juega en modo "find-on-map" THEN el sistema SHALL centrar el mapa correctamente en ese continente específico, ajustando el viewBox dinámico para mostrar el continente completo y centrado

2.2 WHEN el usuario visualiza el modo "find-on-map" en desktop THEN el sistema SHALL aplicar el color de fondo #f0f2f8 al gap entre contenedores para mantener consistencia visual con el resto de la aplicación

2.3 WHEN el usuario accede al modo "find-on-map" en dispositivos móviles THEN el sistema SHALL reorganizar el layout para que el header se mantenga arriba y el mapa ocupe el resto de la pantalla completa, moviendo el panel de control a una posición que no compita por espacio con el mapa

2.4 WHEN el usuario visualiza países en Asia, Australia o Europa en el mapa interactivo THEN el sistema SHALL mostrar los países con formas geográficamente correctas y proporcionales, investigando si el problema está en los datos SVG o si se requiere una librería de mapas diferente

### Unchanged Behavior (Regression Prevention)

3.1 WHEN el usuario selecciona múltiples continentes o todos los continentes THEN el sistema SHALL CONTINUE TO mostrar la vista mundial completa con el viewBox predeterminado (0, 0, 1000, 500)

3.2 WHEN el usuario visualiza el modo "find-on-map" en desktop THEN el sistema SHALL CONTINUE TO mantener el layout grid con panel lateral (25%) y área de mapa (75%)

3.3 WHEN el usuario hace clic en un país del mapa THEN el sistema SHALL CONTINUE TO registrar la respuesta, aplicar el highlighting correcto (verde para correcto, rojo para incorrecto), y emitir el evento de respuesta después de 1500ms

3.4 WHEN el usuario utiliza las funcionalidades de pan y zoom en el mapa THEN el sistema SHALL CONTINUE TO permitir desplazamiento con mouse drag y zoom con scroll wheel manteniendo los límites establecidos (scale entre 0.5 y 5)

3.5 WHEN el usuario utiliza el botón de hint para revelar el continente THEN el sistema SHALL CONTINUE TO mostrar el nombre del continente sin afectar el centrado o visualización del mapa

3.6 WHEN el usuario interactúa con países en América y África THEN el sistema SHALL CONTINUE TO mostrar las formas geográficas correctamente sin deformaciones

3.7 WHEN el usuario juega en modo blitz con temporizador THEN el sistema SHALL CONTINUE TO mostrar el timer en el panel lateral con la animación de alerta cuando quedan menos de 3 segundos

3.8 WHEN el usuario responde incorrectamente THEN el sistema SHALL CONTINUE TO mostrar el mensaje de feedback con el nombre correcto del país en el panel lateral
