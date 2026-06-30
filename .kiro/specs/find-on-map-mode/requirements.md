# Requirements Document

## Introduction

El modo de juego "Find on Map" es una nueva modalidad interactiva para FlagIQ donde el jugador debe identificar la ubicación geográfica de un país en un mapa mundial al ver su bandera. Este modo respeta la configuración de la sesión (filtros de continentes, blitz mode, conteo de preguntas) y proporciona una experiencia visual e interactiva diferente a los modos existentes (type-it, choose-flag, name-it).

## Glossary

- **FindOnMap_Mode**: El modo de juego donde se muestra una bandera y el jugador debe hacer clic en la ubicación correcta del país en un mapa interactivo
- **Interactive_Map**: Componente visual que muestra el mapa mundial y detecta clics del usuario en regiones geográficas
- **Map_Region**: Área clickeable en el mapa que representa un país
- **Continent_Filter**: Filtro de la sesión que determina qué continentes están activos en el juego
- **Hint_System**: Sistema de pistas que permite revelar información adicional sin penalización
- **Click_Validation**: Sistema que determina si un clic del usuario corresponde al país correcto
- **Game_Store**: Store de Pinia que maneja la lógica del juego (questions, answers, scoring, timer)
- **Session_Store**: Store de Pinia que maneja la configuración de la sesión (continents, mode, count, blitz)
- **Question**: Estructura de datos que contiene la bandera correcta y las opciones (distractors)
- **Flag**: Estructura de datos que contiene id, name, nameEs, continent, emoji del país

## Requirements

### Requirement 1: Integración con el sistema de sesión existente

**User Story:** Como jugador, quiero que el modo "Find on Map" respete mi configuración de sesión, para que pueda jugar con los continentes y configuraciones que he elegido.

#### Acceptance Criteria

1. WHEN the user selects 'find-on-map' mode in SessionSetupPanel, THE Session_Store SHALL store 'find-on-map' as the selected mode
2. WHEN a session starts with 'find-on-map' mode, THE Game_Store SHALL generate questions using only flags from the selected continents in the Continent_Filter
3. WHEN the Continent_Filter includes only one continent, THE Interactive_Map SHALL display only that continent's geographic region
4. WHEN the Continent_Filter includes multiple continents, THE Interactive_Map SHALL display all selected continents on the map
5. WHEN the question count is set to a specific number (10, 25, 50), THE Game_Store SHALL generate exactly that many questions for find-on-map mode
6. WHEN the question count is set to 'all', THE Game_Store SHALL generate one question per flag in the selected continents

### Requirement 2: Componente de mapa interactivo

**User Story:** Como jugador, quiero ver un mapa interactivo donde pueda hacer clic para seleccionar países, para que pueda responder las preguntas de ubicación de manera intuitiva.

#### Acceptance Criteria

1. THE Interactive_Map SHALL render a visual representation of world continents with country boundaries
2. THE Interactive_Map SHALL highlight Map_Region boundaries when the user hovers over a country
3. WHEN the user clicks on a Map_Region, THE Interactive_Map SHALL emit the country id corresponding to that region
4. THE Interactive_Map SHALL display only the geographic regions corresponding to the active Continent_Filter
5. THE Interactive_Map SHALL scale and center the view to fit the visible continents within the viewport
6. WHERE a country is too small to click accurately, THE Interactive_Map SHALL enlarge the clickable area to a minimum of 20x20 pixels

### Requirement 3: Presentación de pregunta con bandera

**User Story:** Como jugador, quiero ver claramente qué bandera debo ubicar en el mapa, para que sepa qué país estoy buscando.

#### Acceptance Criteria

1. WHEN a find-on-map question is displayed, THE FindOnMap_Question_Component SHALL show the flag of the correct country
2. THE FindOnMap_Question_Component SHALL display the flag using emoji or SVG based on the Flag data structure
3. THE FindOnMap_Question_Component SHALL not display the country name before the user answers
4. WHEN blitz mode is enabled, THE FindOnMap_Question_Component SHALL display the countdown timer
5. THE FindOnMap_Question_Component SHALL render the Interactive_Map component alongside the flag display

### Requirement 4: Validación de respuestas mediante clics en el mapa

**User Story:** Como jugador, quiero que el juego determine automáticamente si hice clic en el país correcto, para que pueda avanzar a la siguiente pregunta.

#### Acceptance Criteria

1. WHEN the user clicks on a Map_Region, THE Click_Validation SHALL determine if the clicked region id matches the correct Flag id
2. WHEN the clicked region matches the correct answer, THE Game_Store SHALL record the answer as 'correct'
3. WHEN the clicked region does not match the correct answer, THE Game_Store SHALL record the answer as 'wrong'
4. WHEN an answer is recorded, THE Game_Store SHALL advance currentIndex to the next question
5. WHEN an answer is recorded, THE FindOnMap_Question_Component SHALL provide visual feedback showing the correct country location
6. THE Click_Validation SHALL complete within 100 milliseconds of the user click

### Requirement 5: Sistema de pistas "Show Continent"

**User Story:** Como jugador, quiero poder revelar una pista sobre el continente del país, para que pueda tener ayuda cuando no estoy seguro de la ubicación.

#### Acceptance Criteria

1. THE Hint_System SHALL provide a "Show Continent" button visible to the user during each question
2. WHEN the user clicks "Show Continent", THE Hint_System SHALL display the continent name of the correct country
3. WHEN a hint is revealed, THE Game_Store SHALL not penalize the user's score
4. WHEN a hint is revealed, THE Game_Store SHALL record that a hint was used for that question
5. THE Hint_System SHALL allow only one hint per question
6. WHEN a hint has been used, THE Hint_System SHALL disable the "Show Continent" button for that question

### Requirement 6: Feedback visual después de responder

**User Story:** Como jugador, quiero ver feedback visual después de hacer clic en el mapa, para que sepa si mi respuesta fue correcta o incorrecta y dónde está ubicado el país correcto.

#### Acceptance Criteria

1. WHEN the user submits an answer, THE Interactive_Map SHALL highlight the correct Map_Region in green
2. WHEN the answer is incorrect, THE Interactive_Map SHALL highlight the clicked Map_Region in red
3. THE Interactive_Map SHALL maintain the visual feedback for 1500 milliseconds before transitioning to the next question
4. WHEN the answer is correct, THE FindOnMap_Question_Component SHALL display a success message
5. WHEN the answer is incorrect, THE FindOnMap_Question_Component SHALL display the correct country name
6. THE Interactive_Map SHALL display the country name label on the correct Map_Region during feedback

### Requirement 7: Integración con el sistema de puntuación existente

**User Story:** Como jugador, quiero que mis respuestas en el modo "Find on Map" sean contabilizadas como en los otros modos, para que pueda ver mi puntuación y estadísticas al final.

#### Acceptance Criteria

1. WHEN the user answers a find-on-map question, THE Game_Store SHALL create an AnsweredQuestion record with the question, chosenId, and result
2. THE Game_Store SHALL increment the score computed property when a find-on-map answer is correct
3. THE Game_Store SHALL update the streak computed property based on consecutive correct find-on-map answers
4. WHEN all find-on-map questions are answered, THE Game_Store SHALL set isFinished to true
5. WHEN all find-on-map questions are answered, THE Game_Store SHALL record finishedAt timestamp
6. THE GameResults_Component SHALL display the final score, elapsed time, and streak for find-on-map mode

### Requirement 8: Soporte multilingüe para el modo Find on Map

**User Story:** Como jugador que habla español, quiero ver las etiquetas del mapa y mensajes en mi idioma, para que pueda entender la interfaz fácilmente.

#### Acceptance Criteria

1. WHEN the locale is set to 'es', THE FindOnMap_Question_Component SHALL display all UI text in Spanish
2. WHEN the locale is set to 'en', THE FindOnMap_Question_Component SHALL display all UI text in English
3. WHEN displaying the correct country name after answering, THE FindOnMap_Question_Component SHALL use flagName function to get the localized country name
4. WHEN displaying the continent hint, THE Hint_System SHALL display the continent name in the current locale
5. THE Interactive_Map SHALL display country labels in the current locale when showing feedback

### Requirement 9: Comportamiento en modo Blitz

**User Story:** Como jugador en modo blitz, quiero que el temporizador funcione correctamente durante el modo "Find on Map", para que el juego sea desafiante y limitado por tiempo.

#### Acceptance Criteria

1. WHEN blitz mode is enabled AND a find-on-map question is active, THE Game_Store SHALL enforce the time limit per question
2. WHEN the time limit expires on a find-on-map question, THE Game_Store SHALL automatically record the answer as 'wrong' with an empty chosenId
3. WHEN the time limit expires, THE FindOnMap_Question_Component SHALL advance to the next question
4. WHILE blitz mode is active, THE FindOnMap_Question_Component SHALL display a countdown timer
5. THE FindOnMap_Question_Component SHALL visually indicate when time is running low (less than 3 seconds remaining)

### Requirement 10: Accesibilidad del componente de mapa

**User Story:** Como jugador con necesidades de accesibilidad, quiero poder usar el modo "Find on Map" con teclado y lectores de pantalla, para que pueda disfrutar del juego igual que otros usuarios.

#### Acceptance Criteria

1. THE Interactive_Map SHALL provide keyboard navigation support for selecting Map_Region elements
2. WHEN a Map_Region receives keyboard focus, THE Interactive_Map SHALL visually highlight that region
3. THE Interactive_Map SHALL support ARIA labels for each Map_Region with the country name
4. WHEN a Map_Region is selected via keyboard (Enter or Space key), THE Interactive_Map SHALL emit the country id
5. THE Interactive_Map SHALL maintain a logical tab order based on geographic proximity or alphabetical order
6. THE Hint_System button SHALL be keyboard accessible and include appropriate ARIA attributes

