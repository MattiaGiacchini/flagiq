# Requirements Document

## Introduction

FlagIQ is a flag-training application built with Vue 3 (Composition API), PrimeVue v5, TypeScript, Vite, Vue Router, and Pinia. This feature covers the **Session Setup** screen — the first screen a user sees before starting a training session. It allows the user to configure all parameters of their training session: which regions to cover, which game mode to play, how many questions to answer, and whether to enable timed (Blitz) mode. Once configured, the user can launch the session via a "Start Session" button.

The layout includes a persistent header and a session setup panel that occupies a left sidebar (~30% width) on desktop and full height on mobile. The right portion of the desktop layout is reserved for future game-area content.

---

## Glossary

- **Session_Setup_Panel**: The UI panel where the user configures a training session before starting it.
- **Session_Config**: The data object holding all user-selected session parameters (continent filter, game mode, question count, blitz mode).
- **Continent_Filter**: The set of continents selected by the user to restrict which flags appear in the session.
- **Game_Mode**: The type of interaction used during a training session (Type It, Choose Flag, Find on Map, Name It).
- **Question_Count**: The number of flags/questions the user will be trained on in a session.
- **Blitz_Mode**: A timed variant of the session that imposes a 60-second countdown.
- **Region_Chip**: A selectable UI element representing a single continent in the Continent Filter.
- **Mode_Card**: A selectable UI element representing a single Game Mode option.
- **Session_Store**: The Pinia store that holds and exposes the current Session_Config.
- **Header**: The persistent top bar visible on all pages of the application.
- **App_Layout**: The top-level layout component that renders the Header and the page content area.

---

## Requirements

### Requirement 1: Continent Filter Selection

**User Story:** As a user, I want to filter training flags by continent, so that I can focus my practice on a specific region of the world.

#### Acceptance Criteria

1. THE Session_Setup_Panel SHALL display a Continent_Filter section containing one chip for "All Regions" and one Region_Chip for each of the five continents: Europe, Asia, Americas, Africa, and Oceania. On initial render, the "All Regions" chip SHALL be the only chip in the selected state.
2. WHEN the user selects "All Regions", THE Session_Setup_Panel SHALL deselect all individual continent chips and set the Continent_Filter to include all five continents.
3. WHEN the user selects one or more individual Region_Chips, THE Session_Setup_Panel SHALL deselect the "All Regions" chip and update the Continent_Filter to reflect only the selected continents.
4. WHEN the last individually selected Region_Chip is deselected (leaving no individual chip selected), THE Session_Setup_Panel SHALL automatically set the "All Regions" chip to the selected state and restore the Continent_Filter to all five continents.
5. THE Session_Setup_Panel SHALL allow simultaneous selection of multiple Region_Chips. WHEN all five individual Region_Chips are selected, THE Session_Setup_Panel SHALL treat this state as equivalent to "All Regions" and display the "All Regions" chip as selected with all individual chips deselected.
6. THE Session_Setup_Panel SHALL render each Region_Chip with a unique background color that is consistently associated with that continent and visually distinguishable from the other four continent chips.

---

### Requirement 2: Game Mode Selection

**User Story:** As a user, I want to choose a game mode, so that I can train flag recognition in the way that suits me best.

#### Acceptance Criteria

1. THE Session_Setup_Panel SHALL display a Game_Mode section containing exactly four Mode_Cards: "Type It" (Mode A), "Choose Flag" (Mode B), "Find on Map" (Mode C), and "Name It" (Mode D).
2. WHEN the user clicks a Mode_Card that is not currently selected, THE Session_Setup_Panel SHALL mark that card as selected, deselect any previously selected Mode_Card, and update the Session_Store's selected game mode to the clicked mode's value.
3. THE Session_Setup_Panel SHALL display one Mode_Card selected at all times; the default selected mode SHALL be "Name It" (Mode D).
4. EACH Mode_Card SHALL display an icon, a mode title, and a subtitle describing the interaction. The subtitle SHALL be no longer than 60 characters.

---

### Requirement 3: Question Count Selection

**User Story:** As a user, I want to choose how many questions my session will contain, so that I can fit my practice into the time I have available.

#### Acceptance Criteria

1. THE Session_Setup_Panel SHALL display a Question_Count section containing four pill-style selector buttons with the values: 10, 25, 50, and "All".
2. WHEN the user clicks a Question_Count pill that is not currently selected, THE Session_Setup_Panel SHALL mark that pill as selected and deselect the previously selected pill. Re-clicking the already-selected pill SHALL have no effect.
3. THE Session_Setup_Panel SHALL display one Question_Count pill selected at all times; the default selected value SHALL be 10.
4. WHEN the user selects "All", THE Session_Config SHALL set the question count to the total number of flags available for the current Continent_Filter selection. IF the Continent_Filter changes while "All" is the selected pill, THE Session_Config SHALL reactively update the question count to reflect the new total number of available flags.
5. WHEN a fixed Question_Count value (10, 25, or 50) is selected and the number of flags available for the current Continent_Filter is less than the selected count, THE Session_Config SHALL cap the effective question count to the number of available flags for that session.

---

### Requirement 4: Blitz Mode Toggle

**User Story:** As a user, I want to enable a timed Blitz mode, so that I can challenge myself to answer as many flags as possible within 60 seconds.

#### Acceptance Criteria

1. THE Session_Setup_Panel SHALL display a Blitz_Mode section containing a toggle switch and a visible label reading "⚡ Blitz Mode" with a subtitle reading "60-second trial".
2. WHEN the user activates the Blitz_Mode toggle, THE Session_Config SHALL set blitz mode to enabled, and the Session_Setup_Panel SHALL display a visible countdown indicator showing 60 seconds as the starting value.
3. WHEN the user deactivates the Blitz_Mode toggle, THE Session_Config SHALL set blitz mode to disabled, and the Session_Setup_Panel SHALL hide the countdown indicator.
4. THE Session_Setup_Panel SHALL display the Blitz_Mode toggle in the disabled (off) state by default.

---

### Requirement 5: Start Session Action

**User Story:** As a user, I want to start my configured training session with a single tap, so that I can begin practicing immediately.

#### Acceptance Criteria

1. THE Session_Setup_Panel SHALL display a "Start Session" button with a visually prominent gradient style and a drop shadow that distinguishes it from other interactive elements on the panel.
2. WHEN the user clicks the "Start Session" button, THE Session_Store SHALL invoke its update action with the current Session_Config values (continent filter, game mode, question count, blitz mode enabled/disabled) before any navigation occurs.
3. WHEN the user clicks the "Start Session" button and the Session_Store update completes successfully, THE App_Layout SHALL navigate to the game session route using Vue Router.
4. THE "Start Session" button SHALL be enabled and interactive at all times, given that a valid Session_Config always exists due to the default selection invariants in Requirements 1, 2, 3, and 4.

---

### Requirement 6: Responsive Layout

**User Story:** As a user, I want the session setup screen to be usable on both desktop and mobile, so that I can configure and start a session on any device.

#### Acceptance Criteria

1. WHILE the viewport width is 768px or greater, THE App_Layout SHALL render the Session_Setup_Panel as a left sidebar occupying between 28% and 32% of the viewport width, with the remaining area reserved for future game content.
2. WHILE the viewport width is less than 768px, THE App_Layout SHALL render the Session_Setup_Panel at 100% of the available viewport width and fill the available vertical space below the Header, with its content independently scrollable if it overflows.
3. THE Header SHALL be positioned as a sticky element at the top of the viewport and SHALL remain visible on all screen sizes at all times, including when the Session_Setup_Panel content is scrolled.
4. WHEN the viewport width crosses the 768px breakpoint in either direction, THE App_Layout SHALL transition between the sidebar and full-width layouts without a page reload.

---

### Requirement 7: Persistent Header

**User Story:** As a user, I want to always see the application header, so that I have consistent navigation and branding context throughout the app.

#### Acceptance Criteria

1. THE Header SHALL display the FlagIQ application name and logo.
2. THE App_Layout SHALL render the Header above the page content area on all routes.
3. WHILE the Session_Store indicates no session is currently active, THE Header SHALL not display session-specific controls (such as the "Start Session" button or a Session_Config summary).
4. WHEN the Session_Store indicates a session is currently active, THE Header SHALL display the relevant session-specific controls.

---

### Requirement 8: Session Configuration State Management

**User Story:** As a developer, I want session configuration to be managed in a Pinia store, so that other components can access the selected parameters without prop drilling.

#### Acceptance Criteria

1. THE Session_Store SHALL expose the current Session_Config such that any component can read all five fields (selected continents, selected game mode, selected question count, blitz mode enabled flag) and will observe the latest committed value after any update action completes.
2. THE Session_Store SHALL provide an update action that accepts a complete Session_Config object and replaces the current state with the provided values. After the action returns, any component reading the store SHALL observe the new values.
3. THE Session_Store SHALL initialise with default values: all five continents (Europe, Asia, Americas, Africa, Oceania) selected, game mode set to "Name It" (Mode D), question count set to 10, and blitz mode disabled.
4. IF the update action is called with an invalid Session_Config (e.g., an empty continent selection, an unrecognised game mode, a question count outside the allowed set, or a non-boolean blitz flag), THE Session_Store SHALL reject the update and retain the previous valid state without throwing an unhandled exception.
