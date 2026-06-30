# Manual Testing Suite - Real World SVG Map
## Tasks 13.1, 13.2, 13.3 - Visual Verification and Interactive Testing

---

## 📋 Overview

This testing suite covers manual visual verification and interactive testing of the real-world SVG map implementation for the FlagIQ "Find on Map" game mode.

**Tasks Covered:**
- **Task 13.1:** Visual verification of major countries
- **Task 13.2:** Small country clickability testing  
- **Task 13.3:** Interactive features and performance testing

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Server will start on: **http://localhost:5174/** (or next available port)

### 2. Open Application
Navigate to the URL shown in terminal

### 3. Begin Testing
Follow the documents in order:
1. Read `TESTING_INSTRUCTIONS.md` for overview
2. Use `MANUAL_TESTING_CHECKLIST.md` for detailed testing
3. Reference `VISUAL_REFERENCE_GUIDE.md` as needed
4. Document results in `TESTING_SUMMARY_TEMPLATE.md`

---

## 📁 Testing Documents

### TESTING_INSTRUCTIONS.md
**Purpose:** High-level overview and quick start guide  
**Use When:** Starting testing or need quick reference  
**Contains:**
- Quick start steps
- Task summaries
- Success criteria
- Testing tips
- Expected outcomes

### MANUAL_TESTING_CHECKLIST.md
**Purpose:** Comprehensive step-by-step testing checklist  
**Use When:** Performing actual testing  
**Contains:**
- Detailed test steps for each task
- Checkboxes to track progress
- Space for notes and observations
- Requirements coverage tracking
- Overall assessment section

### VISUAL_REFERENCE_GUIDE.md
**Purpose:** Visual aids and what to look for  
**Use When:** Need to identify specific features or troubleshoot  
**Contains:**
- What major countries should look like
- How to identify small country overlays
- Color specifications
- Visual comparison checklists
- Common issues and solutions

### TESTING_SUMMARY_TEMPLATE.md
**Purpose:** Final test report template  
**Use When:** Documenting final results  
**Contains:**
- Executive summary
- Task-by-task results
- Issues found (critical, major, minor)
- Requirements coverage assessment
- Recommendations
- Final conclusion

---

## 🎯 Testing Scope

### Task 13.1: Visual Verification of Major Countries
**Time:** ~15-20 minutes  
**Requirements:** 11.3, 14.1, 14.2

**What You'll Test:**
- [ ] United States recognition and shape accuracy
- [ ] Russia recognition and shape accuracy
- [ ] Brazil recognition and shape accuracy
- [ ] China recognition and shape accuracy
- [ ] Australia recognition and shape accuracy
- [ ] India recognition and shape accuracy
- [ ] Continent filtering (Europe, Asia, Americas, Africa, Oceania)
- [ ] Multiple continent selection

**Success Criteria:**
✅ All major countries visually recognizable  
✅ Continent filtering shows/hides correct countries  
✅ Geographic positioning accurate  
✅ Visual design preserved

---

### Task 13.2: Small Country Clickability
**Time:** ~10-15 minutes  
**Requirements:** 8.7, 6.2, 6.3

**What You'll Test:**
- [ ] Tonga circle overlay and clickability
- [ ] Samoa circle overlay and clickability
- [ ] Monaco, Vatican, San Marino overlays
- [ ] Other small Pacific island nations
- [ ] Circle overlay properties (size, position, visibility)
- [ ] Click registration accuracy
- [ ] Hover effects on small countries

**Success Criteria:**
✅ Small countries have visible circle overlays  
✅ Circles positioned correctly  
✅ Hover shows visual feedback  
✅ Clicks register reliably  
✅ No missed clicks or lag

---

### Task 13.3: Interactive Features
**Time:** ~15-20 minutes  
**Requirements:** 8.6, 8.4, 8.5, 9.2, 9.3, 9.4

**What You'll Test:**
- [ ] Hover effects on large countries
- [ ] Hover effects on small countries
- [ ] Correct answer highlighting (green)
- [ ] Incorrect answer highlighting (red)
- [ ] Game flow from start to finish
- [ ] Performance and responsiveness
- [ ] Smooth transitions
- [ ] Overall user experience

**Success Criteria:**
✅ Hover works on all countries  
✅ Correct highlighting (green) appears properly  
✅ Incorrect highlighting (red) appears properly  
✅ Performance smooth with no lag  
✅ Game flow works end-to-end

---

## 🛠️ Setup Requirements

### System Requirements
- **Node.js:** v22.18.0 or >=24.12.0
- **Browser:** Modern browser (Chrome, Firefox, Safari, Edge)
- **Screen:** Minimum 1366x768 recommended
- **Connection:** Local development (no internet required)

### Before Testing
1. ✅ Dependencies installed (`npm install`)
2. ✅ Map data generated (should already exist in `src/data/mapPaths.ts`)
3. ✅ Development server starts without errors
4. ✅ Application loads in browser

---

## 📊 Testing Workflow

```
┌─────────────────────────────────────┐
│  1. START DEV SERVER                │
│     npm run dev                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. READ TESTING INSTRUCTIONS       │
│     TESTING_INSTRUCTIONS.md         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. PERFORM TASK 13.1               │
│     - Visual verification           │
│     - Major countries               │
│     - Continent filtering           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. PERFORM TASK 13.2               │
│     - Small country overlays        │
│     - Clickability testing          │
│     - Tonga, Samoa, etc.           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. PERFORM TASK 13.3               │
│     - Hover effects                 │
│     - Highlighting                  │
│     - Game flow                     │
│     - Performance                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. DOCUMENT RESULTS                │
│     - Fill out checklist            │
│     - Complete summary              │
│     - Note issues                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. REVIEW AND REPORT               │
│     - Overall assessment            │
│     - Recommendations               │
│     - Sign off                      │
└─────────────────────────────────────┘
```

---

## 🔍 Key Areas of Focus

### Geography Accuracy
**Why It Matters:** Users learn geography from this game  
**What to Check:**
- Countries have realistic, recognizable shapes
- Positioning matches real-world geography
- Major geographic features visible (coastlines, borders)

### Clickability
**Why It Matters:** Core game mechanic  
**What to Check:**
- All countries can be clicked (including tiny ones)
- Clicks register immediately
- Small countries have helpful overlays
- No missed or double clicks

### Visual Feedback
**Why It Matters:** User needs clear feedback  
**What to Check:**
- Hover effects are obvious
- Correct answers clearly shown (green)
- Incorrect answers clearly shown (red)
- Colors match design specifications

### Performance
**Why It Matters:** Smooth UX is critical for gaming  
**What to Check:**
- Hover response feels instant (<50ms)
- Click response feels instant (<50ms)
- No lag when many countries visible
- Smooth transitions and animations

---

## 🐛 Common Issues and Solutions

### Issue: Dev Server Won't Start
**Symptoms:** npm run dev fails  
**Solutions:**
1. Check Node version: `node --version`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for port conflicts (5173/5174 already in use)

### Issue: Map Not Rendering
**Symptoms:** Blank map area  
**Solutions:**
1. Check browser console for errors
2. Verify mapPaths.ts exists and has data
3. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache

### Issue: Can't Find Small Countries
**Symptoms:** No circle overlays visible  
**Solutions:**
1. Select correct continent (Oceania for Tonga/Samoa)
2. Look for small circles, not country shapes
3. Inspect DOM to verify circles rendered
4. Check centroid data exists in mapPaths.ts

### Issue: Hover Not Working
**Symptoms:** No color change on hover  
**Solutions:**
1. Check CSS loaded (DevTools → Elements → Styles)
2. Verify JavaScript running (check console)
3. Ensure not in "disabled" state
4. Try different browser

### Issue: Performance Lag
**Symptoms:** Stuttering, slow response  
**Solutions:**
1. Test with single continent first
2. Close other browser tabs
3. Check DevTools → Performance tab
4. Try different browser
5. Check system resources (CPU/memory)

---

## 📈 Success Metrics

### Quantitative Metrics
- [ ] All 6 major countries recognizable: **6/6**
- [ ] All 5 continent filters working: **5/5**
- [ ] All tested small countries clickable: **X/X**
- [ ] Hover response time: **< 50ms**
- [ ] Click response time: **< 50ms**
- [ ] Console errors: **0**

### Qualitative Metrics
- [ ] Geography accuracy: **Excellent / Good / Fair / Poor**
- [ ] Visual design: **Matches / Minor deviations / Major deviations**
- [ ] User experience: **Smooth / Acceptable / Needs improvement**
- [ ] Overall polish: **Professional / Good / Needs work**

---

## 📝 Reporting Results

### During Testing
1. Use `MANUAL_TESTING_CHECKLIST.md`
2. Check boxes as you complete steps
3. Add notes in provided spaces
4. Document any issues immediately

### After Testing
1. Complete `TESTING_SUMMARY_TEMPLATE.md`
2. List all issues found (critical, major, minor)
3. Provide recommendations
4. Give overall assessment (PASS/PARTIAL/FAIL)

### Deliverables
- ✅ Completed checklist with all boxes checked/unchecked
- ✅ Summary document with findings
- ✅ Screenshots of any issues (optional but helpful)
- ✅ Overall pass/fail recommendation

---

## 🎓 Testing Tips

### Best Practices
1. **Test systematically** - Follow checklist in order
2. **Document as you go** - Don't wait until end
3. **Be thorough** - Check every item
4. **Be honest** - Report all issues found
5. **Include context** - Describe what you see

### What Makes a Good Test Report
✅ All checkboxes marked (yes or no)  
✅ Issues clearly described  
✅ Steps to reproduce provided  
✅ Severity levels assigned  
✅ Screenshots included (if applicable)  
✅ Recommendations specific and actionable

### What to Avoid
❌ Skipping steps  
❌ Assuming something works without testing  
❌ Vague issue descriptions ("it doesn't work")  
❌ Not documenting minor issues  
❌ Rushing through tests

---

## 🤝 Getting Help

### If You're Stuck
1. Check `VISUAL_REFERENCE_GUIDE.md` for visual examples
2. Check browser console for error messages
3. Review `TESTING_INSTRUCTIONS.md` for tips
4. Try refreshing the page
5. Restart dev server

### Questions to Ask
- **For geography:** Does this look like the real country?
- **For clickability:** Did my click register immediately?
- **For visuals:** Does the color/effect match the spec?
- **For performance:** Does this feel smooth and instant?

---

## ✅ Final Checklist Before Starting

Before you begin testing, ensure:
- [ ] Dev server is running (http://localhost:5174/)
- [ ] Application loads in browser without errors
- [ ] You have all testing documents open/accessible
- [ ] You have a way to take notes (checklist)
- [ ] Browser DevTools accessible (F12)
- [ ] You understand what to test (read instructions)
- [ ] You have 40-60 minutes available for complete testing

---

## 📞 Support

### Resources
- **Requirements:** `requirements.md` (full requirements document)
- **Design:** `design.md` (design specifications)
- **Tasks:** `tasks.md` (all implementation tasks)
- **Code:** `src/components/game/InteractiveMap.vue`
- **Data:** `src/data/mapPaths.ts`

### Development Commands
```bash
# Start dev server
npm run dev

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Generate map data (if needed)
npm run generate:map

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🎉 Ready to Test!

You now have everything you need to test Tasks 13.1, 13.2, and 13.3!

**Good luck, and thank you for testing!** 🗺️ 🌍

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Testing

