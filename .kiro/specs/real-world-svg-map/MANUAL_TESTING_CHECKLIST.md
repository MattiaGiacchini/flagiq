# Manual Testing Checklist - Real World SVG Map
## Tasks 13.1, 13.2, 13.3

**Test Date:** _________________  
**Tester:** _________________  
**Browser:** _________________  
**Screen Resolution:** _________________

---

## Task 13.1: Visual Verification of Major Countries

### Requirements Coverage
- **Requirement 11.3:** Visually recognizable country shapes
- **Requirement 14.1:** Visual design preservation  
- **Requirement 14.2:** Panel layout preservation

### Test Steps

#### 1.1 Start Development Server
- [ ] Run `npm run dev`
- [ ] Navigate to `http://localhost:5173` (or displayed port)
- [ ] Verify application loads without errors

#### 1.2 Access Find on Map Mode
- [ ] Click "Find on Map" mode card on session setup screen
- [ ] Select "All Continents" filter (or ensure all are selected)
- [ ] Click "Start Session" button
- [ ] Verify the map renders on screen

#### 1.3 Verify Major Countries - United States
- [ ] **Visual Recognition:** US shape is recognizable (contiguous US + Alaska + Hawaii visible)
- [ ] **Geographic Accuracy:** US positioned in western hemisphere
- [ ] **Border Details:** Canada border visible at northern edge
- [ ] **Alaska:** Visible in upper left portion of map
- [ ] **Hawaii:** Visible as small islands in Pacific

**Notes:** _______________________________________________________________

#### 1.4 Verify Major Countries - Russia
- [ ] **Visual Recognition:** Russia shape is recognizable (largest country, spans Europe-Asia)
- [ ] **Geographic Accuracy:** Positioned across northern hemisphere
- [ ] **East-West Span:** Extends from Eastern Europe to Pacific Ocean
- [ ] **Northern Border:** Arctic coastline visible
- [ ] **Multiple Parts:** Both European and Asian portions visible

**Notes:** _______________________________________________________________

#### 1.5 Verify Major Countries - Brazil
- [ ] **Visual Recognition:** Brazil shape is recognizable (largest South American country)
- [ ] **Geographic Accuracy:** Positioned in South America, eastern side
- [ ] **Atlantic Coast:** Eastern coastline clearly visible
- [ ] **Size Dominance:** Visually dominant in South America
- [ ] **Amazon Region:** Northern portion visible

**Notes:** _______________________________________________________________

#### 1.6 Verify Major Countries - China
- [ ] **Visual Recognition:** China shape is recognizable
- [ ] **Geographic Accuracy:** Positioned in East Asia
- [ ] **Large Land Mass:** One of the largest countries visible
- [ ] **Eastern Coastline:** Pacific coast visible
- [ ] **Shape Accuracy:** Recognizable as China (not distorted)

**Notes:** _______________________________________________________________

#### 1.7 Verify Major Countries - Australia
- [ ] **Visual Recognition:** Australia shape is recognizable (distinctive island continent)
- [ ] **Geographic Accuracy:** Positioned in southern hemisphere, Oceania
- [ ] **Island Shape:** Complete island outline visible
- [ ] **Size:** Appropriately sized compared to other continents
- [ ] **Coastline:** Distinctive Australian coastline visible

**Notes:** _______________________________________________________________

#### 1.8 Verify Major Countries - India
- [ ] **Visual Recognition:** India shape is recognizable (distinctive peninsula)
- [ ] **Geographic Accuracy:** Positioned in South Asia
- [ ] **Peninsula Shape:** Triangular peninsula shape visible
- [ ] **Borders:** Himalayan northern border implied by shape
- [ ] **Coastline:** Both eastern and western coasts visible

**Notes:** _______________________________________________________________

#### 1.9 Continent Filtering - Europe
- [ ] Navigate back to session setup (or use existing session)
- [ ] Select only "Europe" continent filter
- [ ] Start or continue session
- [ ] **Verify:** Only European countries visible on map
- [ ] **Verify:** No Asian, African, American, or Oceanian countries visible
- [ ] **Count Check:** Approximately 50 European countries visible

**Notes:** _______________________________________________________________

#### 1.10 Continent Filtering - Asia
- [ ] Select only "Asia" continent filter
- [ ] **Verify:** Only Asian countries visible (including Russia, China, India, etc.)
- [ ] **Verify:** European countries now hidden
- [ ] **Count Check:** Approximately 50 Asian countries visible

**Notes:** _______________________________________________________________

#### 1.11 Continent Filtering - Americas
- [ ] Select only "Americas" continent filter
- [ ] **Verify:** Both North and South American countries visible
- [ ] **Verify:** US, Canada, Brazil, Argentina all visible
- [ ] **Verify:** Other continents hidden
- [ ] **Count Check:** Approximately 35 countries visible

**Notes:** _______________________________________________________________

#### 1.12 Continent Filtering - Africa
- [ ] Select only "Africa" continent filter
- [ ] **Verify:** Only African countries visible
- [ ] **Verify:** Distinctive Africa continent shape visible
- [ ] **Count Check:** Approximately 54 countries visible

**Notes:** _______________________________________________________________

#### 1.13 Continent Filtering - Oceania
- [ ] Select only "Oceania" continent filter
- [ ] **Verify:** Australia, New Zealand, and Pacific island nations visible
- [ ] **Verify:** Other continents hidden
- [ ] **Count Check:** Approximately 14 countries visible

**Notes:** _______________________________________________________________

#### 1.14 Multiple Continent Selection
- [ ] Select "Europe" + "Asia"
- [ ] **Verify:** Both continents visible simultaneously
- [ ] **Verify:** Americas, Africa, Oceania hidden
- [ ] **Transition:** Smooth transition when toggling continents

**Notes:** _______________________________________________________________

### Task 13.1 Results
- [ ] **PASS:** All major countries are visually recognizable
- [ ] **PASS:** Continent filtering works correctly
- [ ] **FAIL:** Issues found (document below)

**Issues/Observations:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## Task 13.2: Test Small Country Clickability

### Requirements Coverage
- **Requirement 8.7:** Clickable circle overlays for small countries
- **Requirement 6.2:** Centroid calculation for small countries
- **Requirement 6.3:** Countries < 100px² have centroids

### Test Steps

#### 2.1 Setup for Small Countries
- [ ] Navigate to session setup
- [ ] Select "Oceania" continent filter (contains small Pacific islands)
- [ ] Start session with Find on Map mode

#### 2.2 Identify Small Countries
**Note:** Small countries with centroids should have visible circle overlays

- [ ] Look for small circular overlays on the map
- [ ] Identify countries that are too small to see clearly without zoom
- [ ] Note: Tonga, Samoa, and other Pacific islands should have overlays

**Small countries visible:** _______________________________________________

#### 2.3 Test Tonga Clickability
**Location:** Pacific Ocean, east of Fiji

- [ ] Wait for a question asking for Tonga (or manually identify location)
- [ ] **Verify:** Small circle overlay visible at Tonga's location
- [ ] **Verify:** Circle is approximately 10px radius
- [ ] **Hover Test:** Hover over Tonga circle
  - [ ] Cursor changes to pointer
  - [ ] Visual feedback appears
- [ ] **Click Test:** Click on Tonga circle
  - [ ] Click registers (event fires)
  - [ ] Game responds to selection
  - [ ] Correct highlighting appears if correct answer

**Notes:** _______________________________________________________________

#### 2.4 Test Samoa Clickability
**Location:** Pacific Ocean, northeast of Fiji

- [ ] Find Samoa on the map (look for small circle overlay)
- [ ] **Verify:** Circle overlay visible at Samoa's location
- [ ] **Hover Test:** Hover over Samoa circle
  - [ ] Cursor changes to pointer
  - [ ] Visual feedback appears
- [ ] **Click Test:** Click on Samoa circle
  - [ ] Click registers immediately
  - [ ] Game responds correctly
  - [ ] No lag or missed clicks

**Notes:** _______________________________________________________________

#### 2.5 Test Other Small Countries
**Test the following small countries if they appear in your session:**

##### Monaco (Europe)
- [ ] Select "Europe" continent
- [ ] Locate Monaco (southern France, Mediterranean coast)
- [ ] **Verify:** Centroid overlay present
- [ ] **Click Test:** Click registers correctly

##### Vatican City (Europe)
- [ ] Locate Vatican (inside Rome, Italy)
- [ ] **Verify:** Centroid overlay present (should be one of the smallest)
- [ ] **Click Test:** Can successfully click

##### San Marino (Europe)
- [ ] Locate San Marino (inside Italy, near Adriatic coast)
- [ ] **Verify:** Centroid overlay present
- [ ] **Click Test:** Clickable

##### Palau (Oceania)
- [ ] Locate Palau (Pacific, east of Philippines)
- [ ] **Verify:** Centroid overlay present
- [ ] **Click Test:** Clickable

##### Nauru (Oceania)
- [ ] Locate Nauru (small Pacific island)
- [ ] **Verify:** Centroid overlay present
- [ ] **Click Test:** Clickable

**Notes:** _______________________________________________________________

#### 2.6 Circle Overlay Properties
- [ ] **Size:** All centroid circles are consistent size (~10px radius)
- [ ] **Position:** Circles positioned within country boundaries
- [ ] **Visibility:** Circles are visible but not overly prominent
- [ ] **Color:** Circles are transparent fill with clickable area
- [ ] **Z-index:** Circles appear above country paths

**Notes:** _______________________________________________________________

#### 2.7 Edge Cases
- [ ] **Double-click:** Test double-clicking on small country
  - [ ] Does not cause errors
  - [ ] Only registers once
- [ ] **Rapid clicks:** Click multiple small countries quickly
  - [ ] All clicks register correctly
  - [ ] No lag or freezing
- [ ] **Mobile simulation:** If testing responsive design
  - [ ] Small countries still clickable on smaller screens
  - [ ] Touch targets adequate

**Notes:** _______________________________________________________________

### Task 13.2 Results
- [ ] **PASS:** Tonga is clickable with centroid overlay
- [ ] **PASS:** Samoa is clickable with centroid overlay
- [ ] **PASS:** All tested small countries are clickable
- [ ] **PASS:** Circle overlays render correctly
- [ ] **FAIL:** Issues found (document below)

**Issues/Observations:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## Task 13.3: Test Interactive Features

### Requirements Coverage
- **Requirement 8.6:** Hover effects work on all countries
- **Requirement 8.4:** Green highlighting for correct answers
- **Requirement 8.5:** Red highlighting for incorrect answers
- **Requirement 9.2:** Visual response < 50ms on hover
- **Requirement 9.3:** Event handling < 50ms on click
- **Requirement 9.4:** No lag on interactions

### Test Steps

#### 3.1 Hover Effects - Large Countries

- [ ] Start a Find on Map session with all continents
- [ ] **Test USA:**
  - [ ] Hover over United States
  - [ ] Country color changes (lighter gray → darker gray)
  - [ ] Border highlight appears (blue stroke)
  - [ ] Cursor changes to pointer
  - [ ] Response feels instant (< 50ms)
- [ ] **Test Russia:**
  - [ ] Hover over Russia
  - [ ] Hover effect applies to entire country (both European and Asian parts)
  - [ ] Smooth transition
- [ ] **Test Brazil:**
  - [ ] Hover over Brazil
  - [ ] Hover effect consistent with other countries

**Notes:** _______________________________________________________________

#### 3.2 Hover Effects - Small Countries

- [ ] **Test with centroid overlays:**
  - [ ] Hover over a small country circle (e.g., Tonga)
  - [ ] Cursor changes to pointer
  - [ ] Visual feedback appears
  - [ ] No delay in hover response

**Notes:** _______________________________________________________________

#### 3.3 Correct Answer Highlighting

- [ ] Play through a Find on Map question
- [ ] **When correct answer is given:**
  - [ ] Country fills with green color (#10b981 or similar)
  - [ ] Green border appears (darker green stroke)
  - [ ] Color change is immediate
  - [ ] Green highlighting is clearly visible
  - [ ] Correct country is easily identifiable
  - [ ] Highlighting persists appropriately

**Test with multiple countries:**
- [ ] Large country (e.g., Canada)
- [ ] Medium country (e.g., France)
- [ ] Small country with centroid (e.g., Luxembourg)

**Notes:** _______________________________________________________________

#### 3.4 Incorrect Answer Highlighting

- [ ] **When incorrect answer is given:**
  - [ ] Wrong country fills with red color (#ef4444 or similar)
  - [ ] Red border appears (darker red stroke)
  - [ ] Color change is immediate
  - [ ] Red highlighting is clearly visible
  - [ ] Wrong selection is obvious
  - [ ] Highlighting persists appropriately

**Test scenarios:**
- [ ] Click wrong large country
- [ ] Click wrong small country
- [ ] Multiple wrong answers in sequence

**Notes:** _______________________________________________________________

#### 3.5 Game Flow - Find on Map Mode

**Start to Finish Flow:**
- [ ] **Question 1:**
  - [ ] Country name displays
  - [ ] Map is interactive
  - [ ] Click country
  - [ ] Immediate feedback (correct or incorrect highlighting)
  - [ ] Progress bar updates
- [ ] **Question 2:**
  - [ ] Previous highlights clear
  - [ ] New question appears
  - [ ] Map remains responsive
- [ ] **Continue through all questions**
- [ ] **Results screen:**
  - [ ] Score displays correctly
  - [ ] All interactions felt smooth

**Notes:** _______________________________________________________________

#### 3.6 Performance - Hover Responsiveness

**Subjective Performance Test:**
- [ ] Hover over 10 different countries rapidly
- [ ] **Assessment:** All hover effects feel instant
- [ ] **Assessment:** No lag or delay
- [ ] **Assessment:** Smooth transitions
- [ ] **Assessment:** No frame drops or stuttering

**Specific checks:**
- [ ] Hovering over complex shapes (countries with many islands)
- [ ] Hovering during answer highlighting
- [ ] Hovering immediately after continent filter change

**Notes:** _______________________________________________________________

#### 3.7 Performance - Click Responsiveness

**Subjective Performance Test:**
- [ ] Click 10 different countries in sequence
- [ ] **Assessment:** Every click registers immediately
- [ ] **Assessment:** Feedback appears without delay
- [ ] **Assessment:** No missed clicks
- [ ] **Assessment:** No double-click issues

**Edge cases:**
- [ ] Rapid clicking
- [ ] Clicking immediately after hover
- [ ] Clicking during transition

**Notes:** _______________________________________________________________

#### 3.8 Accessibility Features

- [ ] **Keyboard Navigation:**
  - [ ] Tab through countries (if keyboard navigation enabled)
  - [ ] Focus indicator visible
  - [ ] Enter/Space to select country
- [ ] **ARIA Labels:**
  - [ ] Open browser inspector
  - [ ] Check country paths have aria-label attributes
  - [ ] Labels contain country names in correct language
- [ ] **Screen Reader (Optional):**
  - [ ] Country names announced correctly

**Notes:** _______________________________________________________________

#### 3.9 Multi-Continent Performance

- [ ] Select "Europe" + "Asia" (largest subset)
- [ ] **Performance Check:**
  - [ ] Map renders smoothly
  - [ ] Hover effects still instant
  - [ ] No performance degradation with ~100 countries
- [ ] Toggle continents on/off rapidly
- [ ] **Performance Check:**
  - [ ] Smooth transitions
  - [ ] No lag or stuttering

**Notes:** _______________________________________________________________

#### 3.10 Visual Consistency

**Compare with design requirements:**
- [ ] Country fill color matches existing design (#e8ebf0 default)
- [ ] Border color matches existing design (#ffffff)
- [ ] Hover color matches existing design (#d1d5db)
- [ ] Correct highlight color is green (#10b981)
- [ ] Incorrect highlight color is red (#ef4444)
- [ ] Stroke widths are consistent
- [ ] Transitions are smooth (0.2s ease)

**Notes:** _______________________________________________________________

#### 3.11 Edge Case Testing

- [ ] **Blitz Mode (if implemented):**
  - [ ] Timed interactions work correctly
  - [ ] No performance issues under time pressure
- [ ] **Language Switching:**
  - [ ] Switch between English and Spanish
  - [ ] Country names update correctly
  - [ ] Map functionality unaffected
- [ ] **Browser Zoom:**
  - [ ] Zoom in (Ctrl/Cmd +)
  - [ ] Zoom out (Ctrl/Cmd -)
  - [ ] Map scales correctly
  - [ ] Interactions still work

**Notes:** _______________________________________________________________

### Task 13.3 Results
- [ ] **PASS:** Hover effects work on all visible countries
- [ ] **PASS:** Correct highlighting appears correctly (green)
- [ ] **PASS:** Incorrect highlighting appears correctly (red)
- [ ] **PASS:** Performance feels smooth (no lag)
- [ ] **PASS:** Game flow works correctly in Find on Map mode
- [ ] **FAIL:** Issues found (document below)

**Issues/Observations:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## Overall Test Summary

### All Tasks Results

| Task | Status | Notes |
|------|--------|-------|
| 13.1 Visual Verification | ⬜ PASS ⬜ FAIL | |
| 13.2 Small Country Clickability | ⬜ PASS ⬜ FAIL | |
| 13.3 Interactive Features | ⬜ PASS ⬜ FAIL | |

### Critical Issues Found
_(Issues that prevent task completion)_
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Minor Issues Found
_(Issues that don't prevent task completion but should be noted)_
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Recommendations
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

### Overall Assessment
- [ ] **PASS:** All tasks completed successfully, real-world map is functional
- [ ] **PARTIAL:** Some issues found but core functionality works
- [ ] **FAIL:** Critical issues prevent proper testing or functionality

**Tester Signature:** _________________  **Date:** _________________

---

## Appendix: Quick Reference

### Countries with Known Centroids (Small Countries)
These should have visible circle overlays:

**Europe:**
- Vatican City (VA)
- Monaco (MC)
- San Marino (SM)
- Liechtenstein (LI)
- Malta (MT)
- Andorra (AD)

**Oceania:**
- Tonga (TO)
- Samoa (WS)
- Palau (PW)
- Nauru (NR)
- Tuvalu (TV)
- Marshall Islands (MH)
- Kiribati (KI)

**Americas:**
- Saint Kitts and Nevis (KN)
- Grenada (GD)
- Saint Vincent and the Grenadines (VC)
- Barbados (BB)

### Browser Console Commands for Debugging
```javascript
// Check how many countries are rendered
document.querySelectorAll('.country-path').length

// Check how many centroid circles are rendered
document.querySelectorAll('.country-overlay').length

// Get list of visible country IDs
Array.from(document.querySelectorAll('.country-path')).map(el => el.id)
```

### Performance Monitoring
Open browser DevTools → Performance tab → Record while interacting with map to identify any lag or performance issues.

