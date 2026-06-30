# Requirements Document

## Introduction

This document specifies requirements for improving the session setup panel in the FlagIQ application. The improvements address four specific initialization and default value issues that affect user experience during session configuration. These fixes ensure proper state initialization from saved configuration, enforce mode selection before session start, set appropriate regional defaults, and reorder question count options for better usability.

## Glossary

- **SessionSetupPanel**: The UI component that allows users to configure session parameters before starting a game
- **SessionStore**: The Pinia store that manages session configuration state and localStorage persistence
- **GameMode**: The question format for the session (type-it, choose-flag, find-on-map, or name-it)
- **ContinentFilter**: The UI component that allows users to select geographic regions for flag questions
- **QuestionCountPicker**: The UI component that allows users to select the number of questions per session
- **StartButton**: The UI button that initiates a game session with the configured parameters
- **SavedConfig**: The session configuration stored in localStorage under the key 'flagiq:sessionConfig'
- **VALID_COUNTS**: The array defining the order and values of question count options
- **DEFAULT_SESSION_CONFIG**: The default configuration object used when no saved configuration exists

## Requirements

### Requirement 1: Restore Saved Configuration

**User Story:** As a returning user, I want my previous session configuration to be restored when I open the setup panel, so that I don't have to reconfigure my preferences every time.

#### Acceptance Criteria

1.1 WHEN the SessionSetupPanel initializes, THE SessionSetupPanel SHALL read the SavedConfig from SessionStore

1.2 WHEN the SavedConfig exists and is valid, THE SessionSetupPanel SHALL initialize all configuration fields with values from SavedConfig

1.3 WHEN the SavedConfig does not exist, THE SessionSetupPanel SHALL initialize all configuration fields with values from DEFAULT_SESSION_CONFIG

1.4 THE SessionSetupPanel SHALL apply SavedConfig values to selectedContinents, selectedMode, selectedCount, and blitzEnabled state variables

### Requirement 2: Require Mode Selection

**User Story:** As a user starting a new session, I want to be forced to consciously choose a game mode, so that I don't accidentally start a session with an unintended mode.

#### Acceptance Criteria

2.1 WHEN the SessionSetupPanel initializes AND no SavedConfig exists, THE SessionSetupPanel SHALL initialize selectedMode to null

2.2 WHILE selectedMode is null, THE StartButton SHALL be disabled

2.3 WHEN the user selects a GameMode, THE SessionSetupPanel SHALL update selectedMode to the selected GameMode

2.4 WHEN selectedMode is not null AND selectedContinents is not empty, THE StartButton SHALL be enabled

2.5 WHEN the SavedConfig exists and contains a valid mode, THE SessionSetupPanel SHALL initialize selectedMode with the SavedConfig mode value

### Requirement 3: Default Regional Selection

**User Story:** As a user setting up a new session, I want all regions to be selected by default, so that I can practice with flags from all continents unless I specifically choose to narrow the scope.

#### Acceptance Criteria

3.1 THE DEFAULT_SESSION_CONFIG SHALL include all continents in the continents array

3.2 WHEN the SessionSetupPanel initializes AND no SavedConfig exists, THE ContinentFilter SHALL display all continents as selected

3.3 WHEN the SavedConfig exists, THE ContinentFilter SHALL display the continents from SavedConfig as selected

3.4 THE ContinentFilter SHALL render the "All Regions" button in an active state when all five continents are selected

### Requirement 4: Question Count Default and Order

**User Story:** As a user configuring question count, I want 'all' to be the first option and the default value, so that I can easily select comprehensive practice sessions without hunting for the option.

#### Acceptance Criteria

4.1 THE VALID_COUNTS array SHALL contain 'all' as the first element

4.2 THE VALID_COUNTS array SHALL maintain the order: ['all', 10, 25, 50]

4.3 THE DEFAULT_SESSION_CONFIG SHALL set count to 'all'

4.4 WHEN the SessionSetupPanel initializes AND no SavedConfig exists, THE QuestionCountPicker SHALL display 'all' as the selected option

4.5 WHEN the QuestionCountPicker renders, THE QuestionCountPicker SHALL display options in the order defined by VALID_COUNTS

4.6 WHEN the SavedConfig exists, THE QuestionCountPicker SHALL display the count value from SavedConfig as selected
