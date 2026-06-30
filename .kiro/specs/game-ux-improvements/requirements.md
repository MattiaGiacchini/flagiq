# Requirements Document

## Introduction

Este documento define los requisitos para mejoras de experiencia de usuario (UX) en la aplicación FlagIQ. Las mejoras incluyen: traducción completa al español de la interfaz, deshabilitación de la funcionalidad "Similar Flags", implementación del modo Blitz en todos los modos de juego, mejora del comportamiento del selector "All Regions", bloqueo del modo oscuro, y corrección de un bug de selección visual en el modo "Name It".

## Glossary

- **UI**: User Interface - La interfaz de usuario de la aplicación
- **FlagIQ_App**: La aplicación completa de juegos de banderas
- **Session_Setup**: El panel de configuración donde los usuarios eligen continentes, modo de juego y opciones
- **Game_Mode**: Uno de los cuatro modos de juego (Name It, Choose Flag, Type It, Find On Map)
- **Similar_Flags_Toggle**: El control de interfaz que habilita/deshabilita banderas similares
- **All_Regions_Button**: El botón especial en el filtro de continentes que selecciona/deselecciona todos los continentes
- **Continent_Filter**: El componente de UI que permite seleccionar continentes
- **Blitz_Mode**: Modo de juego cronometrado de 60 segundos
- **Name_It_Mode**: Modo de juego donde se muestra una bandera y el jugador elige el nombre del país
- **Option_Button**: Botón de respuesta en los modos de juego con opciones múltiples
- **Dark_Mode**: Esquema de colores oscuros de la interfaz (actualmente no implementado completamente)
- **Light_Mode**: Esquema de colores claros de la interfaz
- **Selected_Option_State**: Estado visual que indica que una opción fue seleccionada en la pregunta anterior

## Requirements

### Requirement 1: Traducción Completa de la Interfaz al Español

**User Story:** Como usuario hispanohablante, quiero que toda la interfaz de la aplicación esté en español, para poder entender completamente todas las opciones y mensajes.

#### Acceptance Criteria

1. THE UI SHALL mostrar todos los textos, etiquetas y mensajes en español cuando el locale está configurado a 'es'
2. WHEN el usuario visualiza Session_Setup, THE UI SHALL mostrar "Configuración de Sesión" en lugar de "Session Setup"
3. WHEN el usuario visualiza el panel de filtros de continentes, THE UI SHALL mostrar la etiqueta de sección "Filtro de Continentes" en español
4. WHEN el usuario visualiza el selector de modo de juego, THE UI SHALL mostrar la etiqueta de sección "Modo de Juego" en español
5. WHEN el usuario visualiza el selector de cantidad de preguntas, THE UI SHALL mostrar la etiqueta de sección "Preguntas" en español
6. WHEN el usuario visualiza Blitz_Mode toggle, THE UI SHALL mostrar el título "Modo Relámpago" y subtítulo "Prueba de 60 segundos" en español
7. WHEN el usuario visualiza Similar_Flags_Toggle, THE UI SHALL mostrar el título y subtítulo en español (si el toggle estuviera habilitado)
8. WHEN el usuario visualiza el botón de inicio de sesión, THE UI SHALL mostrar "Iniciar Sesión" en español
9. WHEN el usuario visualiza mensajes de error o validación, THE UI SHALL mostrar todos los mensajes en español
10. WHEN el usuario completa un juego, THE UI SHALL mostrar todos los textos de resultados en español incluyendo etiquetas de sección, estadísticas y botones

### Requirement 2: Deshabilitar Funcionalidad Similar Flags

**User Story:** Como administrador del producto, quiero que la funcionalidad "Similar Flags" esté deshabilitada, para simplificar la experiencia del usuario temporalmente.

#### Acceptance Criteria

1. THE Session_Setup SHALL ocultar completamente el componente Similar_Flags_Toggle de la interfaz
2. THE FlagIQ_App SHALL configurar el valor de similarityEnabled a false por defecto en todas las sesiones de juego
3. WHEN el usuario configura una nueva sesión, THE FlagIQ_App SHALL ignorar cualquier valor previo de useSimilarity almacenado en localStorage
4. WHEN el usuario inicia un juego, THE Game_Mode SHALL generar preguntas sin considerar similitud de banderas
5. THE Session_Setup SHALL mantener el espacio de diseño de la fila donde estaba Similar_Flags_Toggle eliminando la fila completa

### Requirement 3: Implementar Modo Blitz en Todos los Modos de Juego

**User Story:** Como jugador, quiero poder jugar en modo Blitz en cualquiera de los cuatro modos de juego, para tener una experiencia de juego rápida y desafiante en mi modo preferido.

#### Acceptance Criteria

1. WHEN el usuario habilita Blitz_Mode y selecciona Name_It_Mode, THE FlagIQ_App SHALL iniciar un juego cronometrado de 60 segundos
2. WHEN el usuario habilita Blitz_Mode y selecciona Choose Flag mode, THE FlagIQ_App SHALL iniciar un juego cronometrado de 60 segundos
3. WHEN el usuario habilita Blitz_Mode y selecciona Type It mode, THE FlagIQ_App SHALL iniciar un juego cronometrado de 60 segundos
4. WHEN el usuario habilita Blitz_Mode y selecciona Find On Map mode, THE FlagIQ_App SHALL iniciar un juego cronometrado de 60 segundos
5. WHEN Blitz_Mode está activo en cualquier Game_Mode, THE FlagIQ_App SHALL mostrar un temporizador visible de cuenta regresiva
6. WHEN el temporizador de Blitz_Mode alcanza cero segundos, THE FlagIQ_App SHALL finalizar el juego automáticamente y mostrar los resultados
7. WHEN el usuario responde preguntas en Blitz_Mode, THE FlagIQ_App SHALL contabilizar todas las respuestas correctas antes de que termine el tiempo
8. WHEN Blitz_Mode finaliza, THE FlagIQ_App SHALL mostrar la cantidad de respuestas correctas, incorrectas, y el porcentaje de acierto

### Requirement 4: Mejorar Comportamiento del Botón All Regions

**User Story:** Como usuario, quiero que el botón "All Regions" me permita seleccionar y deseleccionar todos los continentes con clicks sucesivos, y quiero que el sistema me obligue a tener al menos una región seleccionada, para tener control completo sobre la selección de regiones.

#### Acceptance Criteria

1. WHEN el usuario hace click en All_Regions_Button y no todos los continentes están seleccionados, THE Continent_Filter SHALL seleccionar todos los continentes disponibles
2. WHEN el usuario hace click en All_Regions_Button y todos los continentes están seleccionados, THE Continent_Filter SHALL deseleccionar todos los continentes excepto uno
3. WHEN el usuario intenta deseleccionar el último continente seleccionado mediante click individual, THE Continent_Filter SHALL mantener ese continente seleccionado e impedir la deselección
4. WHEN el usuario tiene solo un continente seleccionado, THE Continent_Filter SHALL deshabilitar visualmente la acción de deselección para ese continente
5. WHEN el usuario intenta iniciar una sesión, THE Session_Setup SHALL verificar que al menos un continente esté seleccionado
6. IF ningún continente está seleccionado al intentar iniciar sesión, THEN THE Session_Setup SHALL mostrar un mensaje de error indicando que debe seleccionar al menos una región
7. THE All_Regions_Button SHALL mostrar un estado visual diferente cuando todos los continentes están seleccionados versus cuando no lo están

### Requirement 5: Bloquear Modo Oscuro

**User Story:** Como administrador del producto, quiero que la aplicación solo use el modo claro, para mantener consistencia visual hasta que el modo oscuro esté completamente diseñado.

#### Acceptance Criteria

1. THE FlagIQ_App SHALL mostrar siempre la interfaz en Light_Mode independientemente de las preferencias del sistema operativo
2. THE FlagIQ_App SHALL eliminar cualquier control de interfaz para cambiar entre Light_Mode y Dark_Mode
3. THE FlagIQ_App SHALL utilizar únicamente las variables CSS definidas para Light_Mode en todos los componentes
4. WHEN el sistema operativo del usuario está en modo oscuro, THE FlagIQ_App SHALL ignorar esta preferencia y mostrar Light_Mode
5. THE FlagIQ_App SHALL aplicar los colores de fondo, texto y bordes definidos para Light_Mode en toda la aplicación

### Requirement 6: Corregir Bug de Selección Visual en Name It Mode

**User Story:** Como jugador, quiero que los botones de opciones no muestren el estado de selección de la pregunta anterior, para evitar confusión sobre cuál opción estoy seleccionando actualmente.

#### Acceptance Criteria

1. WHEN Name_It_Mode muestra una nueva pregunta, THE Option_Button SHALL limpiar todos los estados visuales de la pregunta anterior
2. WHEN Name_It_Mode avanza a la siguiente pregunta, THE Option_Button SHALL resetear las clases CSS de 'correct', 'wrong' y 'disabled'
3. WHEN el usuario ve opciones en una nueva pregunta de Name_It_Mode, THE Option_Button SHALL mostrar el estado visual 'idle' sin indicadores de selección previa
4. WHEN Name_It_Mode reinicia el estado de opciones, THE Option_Button SHALL permitir interacción inmediata sin residuos visuales de la pregunta anterior
5. THE Name_It_Mode SHALL garantizar que optionStates se resetee a un objeto vacío al detectar cambio en la prop question
6. THE Name_It_Mode SHALL garantizar que chosen se resetee a null al detectar cambio en la prop question

## Notes

- El modo Blitz ya está parcialmente implementado para Find On Map mode, se requiere extenderlo a los otros tres modos
- El comportamiento actual de All Regions solo selecciona todos, no implementa el toggle de deseleccionar
- El bug de selección visual en Name It Mode es causado por falta de limpieza de estado al cambiar de pregunta
- La funcionalidad Similar Flags existe pero necesita ser deshabilitada a nivel de UI y lógica de juego
- Las traducciones al español ya existen parcialmente en algunos componentes, pero faltan en otros como Session Setup
