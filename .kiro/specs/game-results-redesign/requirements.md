# Requirements Document: Game Results Screen Redesign

## Introduction

This document specifies the requirements for a complete visual and structural redesign of the game results screen. The redesign transforms the current single-column mobile-first layout into a sophisticated two-column desktop experience featuring a prominent circular progress indicator, enhanced visual hierarchy, flag imagery in error displays, achievement/streak indicators, and refined styling throughout.

## Glossary

- **Game_Results_Screen**: The screen displayed after completing a game session showing score and performance
- **Circular_Progress**: A circular SVG-based progress indicator showing percentage score
- **Continent_Performance**: A component showing performance breakdown by continent with color-coded bars
- **Incorrect_Answers**: A component displaying incorrect answers with flag images
- **Flag_Image**: A component that renders flag images with emoji fallback
- **Summary_Column**: The left column in desktop layout containing circular progress and actions
- **Details_Column**: The right column in desktop layout containing performance breakdowns
- **Viewport**: The visible area of the web page in the browser window
- **WCAG_AA**: Web Content Accessibility Guidelines Level AA conformance
- **Streak**: The number of consecutive days a user has played
- **Score_Percentage**: The percentage of correct answers (score/total * 100)

## Requirements

### Requirement 1: Circular Progress Component

**User Story:** As a user, I want to see my score as a prominent circular progress indicator, so that I can quickly understand my performance at a glance.

#### Acceptance Criteria

1. THE Circular_Progress component SHALL render an SVG-based circular progress ring
2. WHEN the component mounts, THE Circular_Progress SHALL animate from 0% to the target Score_Percentage over 1000ms
3. THE Circular_Progress SHALL display the Score_Percentage as text in the center of the circle
4. THE Circular_Progress SHALL accept a percentage prop with values between 0 and 100
5. THE Circular_Progress SHALL accept optional size, strokeWidth, duration, and color props
6. THE Circular_Progress SHALL use stroke-dasharray and stroke-dashoffset for the progress animation
7. THE Circular_Progress SHALL rotate the circle -90 degrees to start at the top
8. THE Circular_Progress SHALL use cubic-bezier(0.4, 0, 0.2, 1) easing for smooth animation
9. WHEN the percentage is calculated, THE Circular_Progress SHALL use the formula Math.round((score / total) * 100)
10. THE Circular_Progress SHALL scale responsively based on viewport size

### Requirement 2: Two-Column Responsive Layout

**User Story:** As a user on desktop, I want to see a two-column layout with summary on the left and details on the right, so that I can scan all information efficiently without excessive scrolling.

#### Acceptance Criteria

1. WHEN the Viewport width is greater than or equal to 768px, THE Game_Results_Screen SHALL render a two-column grid layout
2. WHEN rendering the desktop grid, THE Summary_Column SHALL occupy 40% of the width (2fr)
3. WHEN rendering the desktop grid, THE Details_Column SHALL occupy 60% of the width (3fr)
4. WHEN rendering the desktop grid, THE columns SHALL have a gap of 1.5rem between them
5. WHEN the Viewport width is less than 768px, THE Game_Results_Screen SHALL render a single-column stack layout
6. WHEN rendering mobile layout, THE components SHALL render in order: Circular_Progress, Achievement_Banner, Continent_Performance, Incorrect_Answers, action buttons
7. THE Game_Results_Screen SHALL have a maximum width of 1200px on desktop
8. THE Game_Results_Screen SHALL have padding of 2rem on desktop and 1rem on mobile
9. WHEN rendering desktop layout, THE Summary_Column SHALL display components in order: Circular_Progress, session title, stats summary, Achievement_Banner, action buttons
10. WHEN rendering desktop layout, THE Details_Column SHALL display components in order: Continent_Performance, Incorrect_Answers

### Requirement 3: Enhanced Incorrect Answers with Flag Images

**User Story:** As a user reviewing my mistakes, I want to see flag images for both my answer and the correct answer, so that I can visually remember the flags and learn from my errors.

#### Acceptance Criteria

1. THE Incorrect_Answers component SHALL display flag images using the Flag_Image component
2. WHEN rendering each incorrect answer, THE Incorrect_Answers SHALL display the correct flag's image prominently
3. WHEN rendering each incorrect answer, THE Incorrect_Answers SHALL display "You answered: [chosen flag name]" with the chosen flag's emoji
4. WHEN rendering each incorrect answer, THE Incorrect_Answers SHALL display the continent name
5. WHEN a flag image fails to load, THE Flag_Image component SHALL fall back to emoji rendering
6. THE Incorrect_Answers SHALL use a card-based layout with clear visual separation between items
7. THE Incorrect_Answers SHALL apply hover effects on card items
8. WHEN no incorrect answers exist, THE Game_Results_Screen SHALL hide the Incorrect_Answers component entirely
9. THE Incorrect_Answers SHALL accept a showFlags prop (default: true) to toggle flag display
10. THE Incorrect_Answers SHALL load flag images from the path /public/flags/{code}.svg

### Requirement 4: Enhanced Continent Performance with Color Coding

**User Story:** As a user, I want to see my performance by continent with color-coded bars, so that I can quickly identify which regions I need to practice more.

#### Acceptance Criteria

1. THE Continent_Performance component SHALL display performance data as horizontal bar charts
2. WHEN a continent has 100% accuracy, THE Continent_Performance SHALL color the bar green (#10b981)
3. WHEN a continent has 78% or higher accuracy, THE Continent_Performance SHALL color the bar blue (#4a5af7)
4. WHEN a continent has 50-77% accuracy, THE Continent_Performance SHALL color the bar orange (#f59e0b)
5. WHEN a continent has less than 50% accuracy, THE Continent_Performance SHALL color the bar red (#ef4444)
6. THE Continent_Performance SHALL display percentage labels inline with the bars
7. THE Continent_Performance SHALL have a prominent section title
8. THE Continent_Performance SHALL have larger and more visible progress bars than the previous version
9. WHEN no continent data exists, THE Game_Results_Screen SHALL hide the Continent_Performance component
10. THE Continent_Performance SHALL accept a compact prop for rendering in the right column

### Requirement 5: Styling and Design System

**User Story:** As a user, I want the results screen to have a polished, modern appearance, so that the application feels professional and engaging.

#### Acceptance Criteria

1. THE Game_Results_Screen SHALL use the primary brand color #4a5af7 for main interactive elements
2. THE Game_Results_Screen SHALL use the color palette defined in the design system (primary, perfect, high, medium, low, neutrals)
3. THE Game_Results_Screen SHALL apply shadow elevation using the defined shadow system (sm, md, lg, xl)
4. THE Game_Results_Screen SHALL use border radius values from the scale (sm: 0.5rem, md: 0.75rem, lg: 1rem, xl: 1.5rem)
5. THE Game_Results_Screen SHALL use spacing values from the defined spacing system (xs through xxl)
6. THE Game_Results_Screen SHALL use typography scale for consistent text sizing (h1: 2rem, h2: 1.5rem, body: 1rem)
7. THE Game_Results_Screen SHALL use font weights from the defined scale (regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800)
8. THE Game_Results_Screen SHALL apply card padding of 1.5rem on mobile and 2.5rem on desktop for large cards
9. THE Game_Results_Screen SHALL use a white background (#ffffff) with subtle backgrounds (#f9fafb) for distinction
10. THE Game_Results_Screen SHALL apply consistent border colors (#e8ebf0) throughout

### Requirement 6: Animation and Transitions

**User Story:** As a user, I want smooth animations when the results screen loads, so that the experience feels fluid and professional.

#### Acceptance Criteria

1. WHEN the Circular_Progress component mounts, THE animation SHALL complete within 1000ms
2. THE Circular_Progress animation SHALL use CSS transitions instead of JavaScript for performance
3. THE Circular_Progress animation SHALL animate only the stroke-dashoffset property
4. THE Circular_Progress animation SHALL use cubic-bezier(0.4, 0, 0.2, 1) easing function
5. THE Circular_Progress animation SHALL hint the browser using will-change: stroke-dashoffset
6. WHEN the animation completes, THE stroke-dashoffset SHALL equal circumference * (1 - percentage/100)
7. THE Circular_Progress animation SHALL start from stroke-dashoffset equal to the circumference (0% filled)
8. THE Circular_Progress animation SHALL have no visual artifacts or incomplete rendering
9. THE card hover effects SHALL transition smoothly using CSS transitions
10. THE button hover states SHALL transition color and shadow smoothly

### Requirement 7: Accessibility Compliance

**User Story:** As a user relying on assistive technology, I want the results screen to be fully accessible, so that I can navigate and understand all information presented.

#### Acceptance Criteria

1. THE Game_Results_Screen SHALL provide ARIA labels for all interactive elements
2. THE Game_Results_Screen SHALL support keyboard navigation through all buttons and links
3. THE Game_Results_Screen SHALL announce results to screen readers using appropriate ARIA live regions
4. THE Game_Results_Screen SHALL meet WCAG_AA color contrast ratios of 4.5:1 for normal text
5. THE Game_Results_Screen SHALL meet WCAG_AA color contrast ratios of 3:1 for large text
6. THE Circular_Progress SHALL have an aria-label describing the score percentage
7. THE Incorrect_Answers component SHALL have semantic HTML structure with proper headings
8. THE Continent_Performance component SHALL have semantic HTML structure with proper headings
9. THE action buttons SHALL have clear, descriptive labels for screen readers
10. THE focus states SHALL be clearly visible for all interactive elements

### Requirement 8: Error Handling and Fallbacks

**User Story:** As a user, I want the results screen to handle missing data gracefully, so that I always see a functional interface even when some data is unavailable.

#### Acceptance Criteria

1. WHEN a flag image fails to load, THE Flag_Image component SHALL display the emoji fallback without layout shift
2. WHEN the user achieves 100% score, THE Incorrect_Answers section SHALL be hidden entirely
3. WHEN no continent data is available, THE Continent_Performance section SHALL be hidden
4. WHEN the Incorrect_Answers section is hidden on desktop, THE layout SHALL adjust to maintain visual balance
5. WHEN percentage validation fails, THE Circular_Progress SHALL clamp values to 0-100 range
6. WHEN flag image loading is delayed, THE Flag_Image component SHALL show a subtle loading state
7. WHEN calculations result in NaN, THE components SHALL display fallback values (e.g., 0% or "N/A")
8. WHEN no game data is available, THE Game_Results_Screen SHALL display an error message

### Requirement 9: Data Integrity and Calculations

**User Story:** As a user, I want all displayed statistics to be accurate, so that I can trust the results and track my progress reliably.

#### Acceptance Criteria

1. THE Game_Results_Screen SHALL calculate percentage as Math.round((score / total) * 100)
2. THE Game_Results_Screen SHALL ensure correct count plus incorrect count equals total questions
3. THE Continent_Performance SHALL calculate continent percentages as (correct / total) * 100 per continent
4. THE Continent_Performance SHALL derive color coding directly from calculated percentages without manual overrides
5. THE Incorrect_Answers SHALL extract data from the answers array without mutation
6. THE Game_Results_Screen SHALL format elapsed time correctly from milliseconds to readable format
7. THE Game_Results_Screen SHALL pass immutable data to child components (no direct prop mutation)
8. THE circular progress dash offset SHALL calculate as circumference * (1 - percentage/100)
9. THE circular progress circumference SHALL calculate as 2 * π * radius
10. THE Flag_Image paths SHALL construct as /public/flags/${code}.svg where code is lowercase

### Requirement 10: Component Interactions and Events

**User Story:** As a user, I want to interact with buttons to review errors or start a new game, so that I can continue my learning journey.

#### Acceptance Criteria

1. WHEN the user clicks "Play Again", THE Game_Results_Screen SHALL emit a restart event
2. WHEN the user clicks "Home", THE Game_Results_Screen SHALL emit a home event
3. THE "Play Again" button SHALL be styled as the primary action button
4. THE action buttons SHALL span full width on mobile
5. THE action buttons SHALL have appropriate spacing between them
6. THE action buttons SHALL have hover and active states for visual feedback
7. THE buttons SHALL be keyboard accessible with Enter and Space key activation
8. THE buttons SHALL have focus indicators meeting WCAG_AA standards
9. THE "Play Again" button SHALL restart a game with the same configuration
10. THE "Home" button SHALL navigate to the home screen

### Requirement 11: Performance Optimization

**User Story:** As a user, I want the results screen to load and render quickly, so that I can see my results without delay.

#### Acceptance Criteria

1. THE Circular_Progress animation SHALL use CSS transitions for hardware acceleration
2. THE Game_Results_Screen SHALL use CSS Grid for layout rendering (hardware accelerated)
3. THE Game_Results_Screen SHALL apply contain: layout on card containers for layout isolation
4. THE Game_Results_Screen SHALL batch DOM reads and writes to avoid layout thrashing
5. THE Flag_Image component SHALL leverage lazy loading for flags below the fold
6. THE Flag_Image component SHALL use eager loading for flags in the viewport
7. THE Flag_Image component SHALL cache loaded images in the browser using the flagLoader service
8. THE Circular_Progress component SHALL add minimal overhead (SVG + small CSS only)
9. THE Game_Results_Screen SHALL require no external dependencies beyond existing Vue ecosystem tools
