# Manual Testing Instructions - Tasks 13.1, 13.2, 13.3

## Overview
These tasks require manual visual verification and interactive testing of the real-world SVG map implementation in the Find on Map game mode.

## Prerequisites
✅ Development server is running on **http://localhost:5174/**

## Quick Start Guide

### 1. Open the Application
- Navigate to: **http://localhost:5174/**
- The application should load the session setup screen

### 2. Access Find on Map Mode
- Click on the **"Find on Map"** mode card
- You should see the interactive map with session configuration options

### 3. Begin Testing
- Use the comprehensive checklist in `MANUAL_TESTING_CHECKLIST.md`
- Test all three tasks systematically

---

## Task 13.1: Visual Verification of Major Countries
**Time Estimate:** 15-20 minutes

### What to Test
1. **Major Country Recognition** - Verify these countries are visually recognizable:
   - United States (including Alaska and Hawaii)
   - Russia (spanning Europe and Asia)
   - Brazil (South America)
   - China (East Asia)
   - Australia (Oceania)
   - India (South Asia peninsula)

2. **Continent Filtering** - Test filtering by:
   - Europe only (~50 countries)
   - Asia only (~50 countries)
   - Americas only (~35 countries)
   - Africa only (~54 countries)
   - Oceania only (~14 countries)
   - Multiple continents simultaneously

### Success Criteria
✅ All major countries have recognizable, realistic shapes  
✅ Continent filtering correctly shows/hides countries  
✅ Geographic positioning is accurate  
✅ Visual design matches existing style

---

## Task 13.2: Test Small Country Clickability
**Time Estimate:** 10-15 minutes

### What to Test
1. **Small Country Overlays** - Look for circular overlays on:
   - Tonga (Pacific Ocean, east of Fiji)
   - Samoa (Pacific Ocean, northeast of Fiji)
   - Monaco (Southern France, Mediterranean coast)
   - Vatican City (Inside Rome, Italy)
   - San Marino (Inside Italy, near Adriatic)

2. **Click Functionality**:
   - Hover over small country circles
   - Verify cursor changes to pointer
   - Click on circles
   - Verify clicks register correctly

### Success Criteria
✅ Small countries have visible circle overlays (~10px radius)  
✅ Circles are positioned within country boundaries  
✅ Hovering over circles shows visual feedback  
✅ Clicking circles registers and responds correctly  
✅ No missed clicks or lag

---

## Task 13.3: Test Interactive Features
**Time Estimate:** 15-20 minutes

### What to Test

#### 1. Hover Effects
- Hover over various countries (large and small)
- Verify color change (gray → darker gray/blue)
- Verify border highlight appears
- Verify cursor changes to pointer
- Verify response feels instant (<50ms)

#### 2. Correct Answer Highlighting
- Play through Find on Map questions
- When answering correctly:
  - Verify country fills with green (#10b981)
  - Verify green border appears
  - Verify highlighting is immediate
  - Test with large, medium, and small countries

#### 3. Incorrect Answer Highlighting
- When answering incorrectly:
  - Verify country fills with red (#ef4444)
  - Verify red border appears
  - Verify highlighting is immediate
  - Test multiple wrong answers

#### 4. Game Flow
- Complete a full Find on Map session
- Verify smooth transitions between questions
- Verify progress bar updates correctly
- Verify results screen displays properly

#### 5. Performance
- Test rapid hovering over multiple countries
- Test rapid clicking
- Verify no lag or stuttering
- Verify smooth animations/transitions

### Success Criteria
✅ Hover effects work on all visible countries  
✅ Correct highlighting (green) appears properly  
✅ Incorrect highlighting (red) appears properly  
✅ Performance feels smooth with no lag  
✅ Game flow works correctly end-to-end

---

## Testing Tips

### Browser Console Debugging
Open browser DevTools (F12) and use these commands:

```javascript
// Check number of rendered countries
document.querySelectorAll('.country-path').length

// Check number of small country overlays
document.querySelectorAll('.country-overlay').length

// Get list of visible country IDs
Array.from(document.querySelectorAll('.country-path')).map(el => el.id)

// Check for console errors
// (Keep console open while testing)
```

### Finding Small Countries

**Oceania** (easiest to find small countries):
- Select only "Oceania" continent
- Look for small circular overlays in the Pacific Ocean
- Tonga and Samoa should be visible as circles east of Australia/Fiji

**Europe** (for Vatican, Monaco, San Marino):
- Select only "Europe" continent
- Zoom or look carefully at:
  - Monaco: French Riviera (Mediterranean coast)
  - Vatican: Center of Italy (Rome area)
  - San Marino: Eastern Italy (near Adriatic Sea)

### Common Issues to Watch For

❌ **Countries not rendering**: Check browser console for errors  
❌ **Clicks not registering**: Verify JavaScript is enabled  
❌ **Lag on hover**: Check if too many countries are visible  
❌ **Missing overlays**: Verify centroid data exists for small countries  
❌ **Wrong colors**: Verify CSS is loading correctly

---

## Reporting Results

### During Testing
- Use the `MANUAL_TESTING_CHECKLIST.md` file to record findings
- Check boxes as you complete each test
- Document any issues in the "Notes" sections

### After Testing
- Complete the "Overall Test Summary" section
- List all critical and minor issues found
- Provide recommendations
- Mark overall assessment (PASS/PARTIAL/FAIL)

---

## Expected Outcomes

### If Everything Works Correctly:
✅ All 6 major countries are easily recognizable  
✅ Continent filtering shows correct country subsets  
✅ Small countries have clickable circular overlays  
✅ Hover effects are instant and smooth  
✅ Correct/incorrect highlighting works perfectly  
✅ Game flows smoothly from start to finish  
✅ No lag, stuttering, or performance issues

### If Issues Are Found:
- Document them clearly in the checklist
- Include screenshots if possible (save to spec folder)
- Note severity (critical vs minor)
- Describe steps to reproduce
- Suggest potential fixes if obvious

---

## Additional Testing (Optional)

### Browser Compatibility
Test in multiple browsers if available:
- Chrome/Chromium
- Firefox
- Safari
- Edge

### Responsive Design
Test at different screen sizes:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet simulation (768x1024)
- Mobile simulation (375x667)

### Accessibility
- Test keyboard navigation (Tab, Enter, Space)
- Test with screen reader (if available)
- Verify ARIA labels are present

---

## Questions or Issues?

If you encounter problems or have questions during testing:
1. Check browser console for error messages
2. Verify dev server is still running (http://localhost:5174/)
3. Try refreshing the page
4. Document the issue in the checklist

---

## Completion

After completing all three tasks:
1. ✅ Fill out the checklist completely
2. ✅ Mark overall pass/fail status
3. ✅ Document all findings
4. ✅ Save the completed checklist
5. ✅ Report back with summary

**Good luck with testing!** 🗺️ 🌍

