# Requirements Document

## Introduction

Esta feature reemplaza los emojis de banderas actuales con imágenes reales de banderas de alta calidad en toda la aplicación FlagIQ. El objetivo es mejorar la experiencia visual, proporcionar banderas más reconocibles y consistentes en todos los dispositivos, y resolver limitaciones de los emojis (variaciones entre plataformas, calidad de renderizado).

## Glossary

- **Flag Image**: Imagen raster (PNG/WebP) o vectorial (SVG) que representa una bandera nacional
- **Emoji Flag**: Representación Unicode actual de banderas (🇫🇷, 🇺🇸, etc.)
- **Flag Display Component**: Cualquier componente Vue que muestre una bandera (FindOnMapQuestion, ChooseFlagQuestion, NameItQuestion, TypeItQuestion)
- **Aspect Ratio**: Proporción ancho:alto de la bandera (típicamente 3:2 o 2:3)
- **CDN**: Content Delivery Network para servir imágenes de forma eficiente
- **Lazy Loading**: Técnica de carga diferida de imágenes para mejorar rendimiento
- **Fallback**: Comportamiento alternativo cuando la imagen no se puede cargar

## Requirements

### Requirement 1: Reemplazar Emojis con Imágenes

**User Story:** Como usuario de FlagIQ, quiero ver imágenes reales de banderas en lugar de emojis para que las banderas sean más reconocibles y consistentes en todos los dispositivos.

#### Acceptance Criteria

1. WHEN el sistema renderiza cualquier bandera en la aplicación THEN el sistema SHALL mostrar una imagen real de bandera en lugar del emoji Unicode
2. WHEN el sistema muestra una bandera THEN el sistema SHALL mantener la relación de aspecto correcta (3:2 para banderas rectangulares, 1:1 para banderas cuadradas como Suiza y Nepal)
3. WHEN el usuario ve la aplicación en diferentes dispositivos THEN el sistema SHALL mostrar la misma bandera visual sin variaciones de plataforma
4. WHEN el sistema carga una bandera THEN el sistema SHALL aplicar el mismo estilo CSS existente (box-shadow, border, border-radius) para mantener consistencia visual

### Requirement 2: Fuente de Imágenes de Banderas

**User Story:** Como desarrollador de FlagIQ, quiero descargar y almacenar todas las banderas localmente para asegurar disponibilidad offline y rendimiento óptimo.

#### Acceptance Criteria

1. WHEN el sistema necesita una imagen de bandera THEN el sistema SHALL obtener la imagen de la carpeta local `public/flags/`
2. THE Sistema SHALL descargar todas las 197 banderas a la carpeta `public/flags/` en formato SVG cuando esté disponible, o el mejor formato disponible (PNG de alta resolución)
3. WHEN se descarga una bandera THEN cada bandera descargada SHALL mantener su aspect ratio original correcto
4. THE Sistema SHALL crear un script de descarga `scripts/downloadFlags.ts` que se pueda ejecutar una vez para obtener todas las banderas
5. WHEN se ejecuta el script de descarga THEN el sistema SHALL usar flagcdn.com como fuente para la descarga inicial
6. WHEN se descarga una bandera THEN el sistema SHALL intentar descargar formato SVG primero, y si no está disponible, descargar PNG de alta resolución

### Requirement 3: Diseño Responsive y Rendimiento

**User Story:** Como usuario móvil de FlagIQ, quiero que las banderas se carguen rápidamente y se vean nítidas en mi dispositivo para una experiencia fluida.

#### Acceptance Criteria

1. WHEN el sistema implementa carga de imágenes THEN el sistema SHALL usar lazy loading para banderas fuera del viewport inicial
2. WHEN el sistema usa formato SVG local THEN el sistema SHALL escalar sin pérdida de calidad en cualquier tamaño
3. WHEN el sistema carga banderas locales THEN el sistema SHALL asegurar que los SVG escalen sin pérdida de calidad en pantallas de alta densidad (Retina, 4K)

### Requirement 4: Fallback y Manejo de Errores

**User Story:** Como usuario de FlagIQ, quiero que la aplicación funcione correctamente incluso si una imagen de bandera local no se puede cargar.

#### Acceptance Criteria

1. WHEN una imagen de bandera local falla al cargar THEN el sistema SHALL mostrar el emoji original como fallback
2. WHEN el sistema detecta error de carga de imagen THEN el sistema SHALL registrar el error en la consola para debugging
3. WHEN un archivo de bandera local no existe THEN el sistema SHALL mostrar emoji fallback sin bloquear la interfaz
4. WHEN una bandera no tiene imagen disponible THEN el sistema SHALL mostrar el emoji sin mostrar imagen rota o placeholder

### Requirement 5: Accesibilidad

**User Story:** Como usuario con lector de pantalla, quiero que las imágenes de banderas tengan texto alternativo descriptivo para entender qué país representa cada bandera.

#### Acceptance Criteria

1. WHEN el sistema renderiza una imagen de bandera THEN el sistema SHALL incluir atributo alt con el nombre del país en el idioma actual de la aplicación
2. WHEN el usuario usa lector de pantalla en inglés THEN el alt text SHALL ser "Flag of [Country Name]" (ej: "Flag of France")
3. WHEN el usuario usa lector de pantalla en español THEN el alt text SHALL ser "Bandera de [Nombre del País]" (ej: "Bandera de Francia")
4. WHEN la imagen de bandera es decorativa (ya existe texto del país visible) THEN el sistema SHALL usar aria-hidden="true" para evitar redundancia

### Requirement 6: Actualizar Estructura de Datos

**User Story:** Como desarrollador, quiero que la estructura de datos de banderas incluya rutas locales para facilitar la migración de emojis a imágenes locales.

#### Acceptance Criteria

1. WHEN se actualiza flags.ts THEN el sistema SHALL agregar propiedad `imageUrl` a cada flag object
2. WHEN se actualiza flags.ts THEN el sistema SHALL mantener propiedad `emoji` como fallback
3. WHEN se genera imageUrl THEN el sistema SHALL usar el código ISO 3166-1 alpha-2 (`id`) en minúsculas para construir la ruta local
4. THE Sistema SHALL crear función helper `getLocalFlagPath(countryCode: string): string` que retorna la ruta local a la bandera
5. WHEN se construye la ruta local THEN la estructura de archivos SHALL ser: `public/flags/{countryCode}.svg` (o `.png` si SVG no disponible)

### Requirement 7: Actualizar Componentes Vue

**User Story:** Como desarrollador, quiero actualizar todos los componentes que muestran banderas para usar el nuevo sistema de imágenes.

#### Acceptance Criteria

1. WHEN se actualiza FindOnMapQuestion.vue THEN el sistema SHALL reemplazar `.flag-emoji` con `<img>` tag que use imageUrl
2. WHEN se actualiza ChooseFlagQuestion.vue THEN el sistema SHALL reemplazar emojis en botones de opción con imágenes
3. WHEN se actualiza NameItQuestion.vue THEN el sistema SHALL reemplazar emoji en display con imagen
4. WHEN se actualiza TypeItQuestion.vue THEN el sistema SHALL reemplazar emoji en display con imagen
5. WHEN se actualiza GameResults.vue (si muestra banderas) THEN el sistema SHALL reemplazar emojis con imágenes
6. WHEN se implementan imágenes THEN el sistema SHALL crear componente reutilizable `FlagImage.vue` que maneje loading, error, y fallback

### Requirement 8: Mantener Estilos Visuales

**User Story:** Como usuario de FlagIQ, quiero que las nuevas imágenes de banderas se vean limpias sin bordes blancos no deseados.

#### Acceptance Criteria

1. WHEN se reemplaza emoji con imagen THEN el sistema SHALL mantener las mismas dimensiones del contenedor (.flag-display: aspect-ratio 3/2)
2. WHEN se renderiza imagen THEN el sistema SHALL aplicar object-fit: cover para llenar completamente el contenedor sin bordes blancos
3. WHEN se renderiza imagen THEN el sistema SHALL eliminar cualquier borde blanco o padding que aparecía con los emojis
4. WHEN se renderiza imagen THEN el sistema SHALL mantener box-shadow y border-radius del contenedor
5. WHEN se renderiza imagen en mobile THEN el sistema SHALL aplicar tamaño reducido consistente con emoji actual (2.5rem → ~80px width)
6. WHEN se renderiza imagen en desktop THEN el sistema SHALL mantener tamaño actual (4rem → ~120-160px width)
7. WHEN se renderiza imagen THEN el sistema SHALL asegurar que la bandera llene completamente el contenedor sin espacios blancos visibles

### Requirement 9: Eliminar Scroll Vertical Durante el Juego

**User Story:** Como usuario jugando FlagIQ, quiero que la pantalla no tenga scroll vertical durante las preguntas para evitar distracciones y mantener foco en el juego.

#### Acceptance Criteria

1. WHEN el usuario está en una pregunta de juego (cualquier modo) THEN la pantalla SHALL NOT mostrar scrollbar vertical
2. WHEN el contenido de la pregunta se renderiza THEN el sistema SHALL ajustar el layout para que todo el contenido quepa en el viewport sin necesidad de scroll
3. WHEN se cambia entre preguntas THEN el sistema SHALL mantener la posición de scroll en top (scrollY = 0)
4. WHEN el usuario está en modo Find on Map THEN el contenedor SHALL usar height: calc(100vh - [header-height]) para ocupar exactamente el espacio disponible
5. WHEN el usuario está en modo Choose Flag, Name It, o Type It THEN el contenedor SHALL usar overflow: hidden para prevenir scroll accidental
6. WHEN el usuario está en pantalla de resultados THEN el scroll vertical SHALL estar permitido solo si el contenido excede la altura disponible
7. WHEN el teclado virtual aparece en mobile THEN el sistema SHALL ajustar el viewport para mantener visibilidad del contenido sin scroll

## Correctness Properties

**Property 1: Image Load Success Rate**
_For any_ flag rendering attempt where the local file exists in `public/flags/`, the system SHALL successfully load and display the flag image in >99% of cases within 500ms.

**Property 2: Fallback Reliability**
_For any_ flag rendering attempt where the local image file fails to load or does not exist, the system SHALL display the emoji fallback within 500ms without UI freeze or error message to the user.

**Property 3: Accessibility Compliance**
_For any_ flag image rendered in the application, the system SHALL include proper alt text in the current locale language that accurately identifies the country represented.

**Property 4: Visual Consistency**
_For any_ two devices viewing the same flag, the system SHALL display visually identical flag representations (same colors, proportions, symbols) regardless of device OS or browser.

**Property 5: Performance Budget**
_For any_ page load containing up to 4 flags (typical question with choices), the total image payload SHALL NOT exceed 200KB and SHALL load within 500ms from local storage.

**Property 6: No White Borders**
_For any_ flag image rendered in the application, the system SHALL display the flag edge-to-edge within its container with zero visible white space or borders around the flag content.

**Property 7: No Vertical Scroll During Gameplay**
_For any_ game question screen (Find on Map, Choose Flag, Name It, Type It), the system SHALL NOT display vertical scrollbar and SHALL fit all content within the available viewport height without requiring user scrolling.

