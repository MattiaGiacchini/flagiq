# Requirements Document

## Introduction

This feature enhances the game results screen with comprehensive performance analytics, including incorrect answer review, continent-based performance breakdowns, and improved loading experience. The enhancements apply to both mobile and desktop layouts, providing players with detailed feedback on their performance.

## Glossary

- **Results_Screen**: The component displayed after a game session completes, showing performance metrics and options to play again or return home
- **Answered_Question**: A record containing the question asked, the chosen answer, the result (correct/wrong), and whether a hint was used
- **Flag**: A data object containing id, name, nameEs, continent, emoji, and optional svgPath
- **Continent**: A geographic region (Africa, Americas, Asia, Europe, Oceania) used to categorize countries
- **Session**: A single game instance with a specific configuration and set of questions
- **SVG_Loader**: The browser mechanism that loads SVG flag images from the public/flags directory
- **Performance_Bar**: A visual indicator showing the number of correct answers versus total questions for a specific continent
- **Question_Pool**: The collection of Flag objects used to generate questions for a session
- **Similarity_Matrix**: A data structure measuring visual or geographic similarity between flags

## Requirements

### Requirement 1: Display Incorrect Answers with Corrections

**User Story:** As a player, I want to see which questions I answered incorrectly along with the correct answers, so that I can learn from my mistakes.

#### Acceptance Criteria

1. WHEN the Results_Screen is displayed, THE Results_Screen SHALL display a list of all incorrect answers
2. FOR EACH incorrect answer, THE Results_Screen SHALL display the correct flag name in the user's locale
3. FOR EACH incorrect answer, THE Results_Screen SHALL display the player's chosen answer name in the user's locale
4. FOR EACH incorrect answer, THE Results_Screen SHALL display the continent of the correct answer
5. WHERE an incorrect answer exists, THE Results_Screen SHALL format the entry as "{Correct_Name} - You answered: {Chosen_Name}, {Continent_Name}"
6. WHERE the locale is Spanish, THE Results_Screen SHALL format the entry as "{Correct_Name} - Respondiste: {Chosen_Name}, {Continent_Name}"
7. WHEN all answers are correct, THE Results_Screen SHALL NOT display the incorrect answers section

### Requirement 2: Display Continent Performance Breakdown

**User Story:** As a player, I want to see my performance broken down by continent, so that I can identify which geographic regions I need to study more.

#### Acceptance Criteria

1. WHEN the Results_Screen is displayed, THE Results_Screen SHALL display Performance_Bars for each continent that appeared in the session
2. FOR EACH continent in the session, THE Results_Screen SHALL calculate the number of correct answers for that continent
3. FOR EACH continent in the session, THE Results_Screen SHALL calculate the total number of questions for that continent
4. FOR EACH continent in the session, THE Results_Screen SHALL calculate the percentage of correct answers rounded to the nearest integer
5. FOR EACH Performance_Bar, THE Results_Screen SHALL display the continent name in the user's locale
6. FOR EACH Performance_Bar, THE Results_Screen SHALL display the format "{Correct_Count}/{Total_Count} {Percentage}%"
7. FOR EACH Performance_Bar, THE Results_Screen SHALL display a visual bar indicator proportional to the percentage
8. WHEN the session includes questions from multiple continents, THE Results_Screen SHALL sort Performance_Bars by continent name alphabetically
9. WHEN a continent has 100% correct answers, THE Performance_Bar SHALL use a success color indicator
10. WHEN a continent has less than 100% correct answers, THE Performance_Bar SHALL use a neutral or warning color indicator based on percentage

### Requirement 3: Maintain Existing Summary Metrics

**User Story:** As a player, I want to continue seeing my overall score, percentage, and time metrics prominently displayed, so that I have a quick overview of my performance.

#### Acceptance Criteria

1. THE Results_Screen SHALL display the total number of correct answers
2. THE Results_Screen SHALL display the total number of questions
3. THE Results_Screen SHALL display the accuracy percentage rounded to the nearest integer
4. THE Results_Screen SHALL display the progress circle visualization showing accuracy percentage
5. THE Results_Screen SHALL display the elapsed time in the format "{minutes}m {seconds}s" when time exceeds 60 seconds
6. THE Results_Screen SHALL display the elapsed time in the format "{seconds}s" when time is less than 60 seconds
7. THE Results_Screen SHALL display the congratulatory message based on performance percentage
8. THE Results_Screen SHALL display the emoji indicator based on performance percentage
9. THE Results_Screen SHALL NOT display experience points or streak days

### Requirement 4: Improve SVG Loading Experience on Mobile

**User Story:** As a mobile player, I want flag images to load quickly without showing emoji fallbacks, so that I have a smooth visual experience during gameplay.

#### Acceptance Criteria

1. WHEN a flag SVG is loading on mobile, THE SVG_Loader SHALL display a loading skeleton or placeholder instead of the emoji fallback
2. WHEN a flag SVG completes loading, THE SVG_Loader SHALL display the SVG image immediately
3. WHEN a flag SVG fails to load after 3 seconds, THE SVG_Loader SHALL display the emoji fallback
4. THE SVG_Loader SHALL preload flag SVGs for the current question and the next 2 questions in the queue
5. WHEN a session starts, THE SVG_Loader SHALL preload the first 3 flag SVGs in the Question_Pool
6. THE SVG_Loader SHALL cache loaded SVGs in browser memory for the duration of the session
7. WHEN the same flag appears multiple times in a session, THE SVG_Loader SHALL use the cached version without re-fetching

### Requirement 5: Randomize Country Order in Sessions

**User Story:** As a player, I want the order of countries to be randomized each time I start a session, so that I don't memorize the sequence and get a fresh challenge every time.

#### Acceptance Criteria

1. WHEN a session starts, THE Question_Pool SHALL shuffle the selected flags using a random algorithm
2. WHEN a session starts with count "all", THE Question_Pool SHALL include all flags matching the continent filter in random order
3. WHEN a session starts with a specific count, THE Question_Pool SHALL randomly select that number of flags from the available pool
4. FOR ANY two consecutive sessions with identical configuration, THE Question_Pool SHALL produce different question orders with high probability
5. THE Question_Pool shuffle algorithm SHALL distribute countries uniformly across all positions
6. WHEN a session is restarted using the "Play again" button, THE Question_Pool SHALL generate a new random order

### Requirement 6: Flag Similarity Matrix for Exercise Generation

**User Story:** As a player, I want to receive more challenging multiple-choice options based on flag similarity, so that I develop better flag recognition skills.

#### Acceptance Criteria

1. THE Similarity_Matrix SHALL define similarity scores between flags based on visual and geographic characteristics
2. WHEN generating distractor options for a question, THE Question_Pool SHALL prioritize flags with higher similarity scores to the correct answer
3. THE Similarity_Matrix SHALL consider color palette similarity between flags
4. THE Similarity_Matrix SHALL consider geographic proximity between countries
5. THE Similarity_Matrix SHALL consider pattern similarity between flags (stripes, stars, emblems)
6. WHEN no similar flags are available from the selected continents, THE Question_Pool SHALL fall back to random distractor selection
7. WHERE similarity-based selection is enabled, THE Question_Pool SHALL select at least 2 out of 3 distractors based on similarity scores
8. THE Similarity_Matrix SHALL be configurable via session settings to enable or disable similarity-based selection
9. WHEN similarity-based selection is disabled, THE Question_Pool SHALL use random distractor selection as before

### Requirement 7: Parse Flag Similarity Data

**User Story:** As a developer, I want to parse a flag similarity configuration file, so that the system can use similarity data for exercise generation.

#### Acceptance Criteria

1. WHEN a valid similarity configuration file is provided, THE Similarity_Parser SHALL parse it into a Similarity_Matrix object
2. WHEN an invalid similarity configuration file is provided, THE Similarity_Parser SHALL return a descriptive error message
3. THE Similarity_Printer SHALL format Similarity_Matrix objects back into valid similarity configuration files
4. FOR ALL valid Similarity_Matrix objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property)
5. THE Similarity_Parser SHALL validate that similarity scores are between 0 and 1
6. THE Similarity_Parser SHALL validate that all flag IDs in the matrix exist in the FLAGS dataset
7. THE Similarity_Parser SHALL support JSON format for the similarity configuration file

### Requirement 8: Results Screen Layout Responsiveness

**User Story:** As a player on any device, I want the enhanced results screen to adapt to my screen size, so that all information is readable and well-organized.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768 pixels, THE Results_Screen SHALL use a mobile-optimized single-column layout
2. WHEN the viewport width is 768 pixels or greater, THE Results_Screen SHALL use a desktop-optimized multi-column layout
3. ON mobile, THE Results_Screen SHALL stack sections vertically in the order: summary, continent breakdown, incorrect answers, actions
4. ON desktop, THE Results_Screen SHALL display summary metrics prominently with continent breakdown and incorrect answers in adjacent columns
5. ON mobile, THE Performance_Bars SHALL span the full width of the container
6. ON desktop, THE Performance_Bars SHALL be contained within a dedicated column with maximum width constraints
7. THE Results_Screen SHALL maintain touch-friendly button sizes on mobile (minimum 44x44 pixels)
8. THE Results_Screen SHALL maintain readable font sizes on all devices (minimum 14px for body text)
