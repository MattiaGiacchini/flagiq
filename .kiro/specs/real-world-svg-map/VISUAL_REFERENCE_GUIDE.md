# Visual Reference Guide
## What to Look For During Manual Testing

---

## Task 13.1: Major Country Recognition

### United States
**What to Look For:**
- **Contiguous 48 states**: Recognizable rectangular shape in North America
- **Alaska**: Large landmass in upper left, west of Canada
- **Hawaii**: Small island chain in Pacific Ocean
- **Position**: Western hemisphere, between Canada and Mexico
- **Shape**: Should resemble actual US map with Atlantic and Pacific coasts
- **Key Features**: Great Lakes region visible on northern border

### Russia
**What to Look For:**
- **Size**: Largest country on map by far
- **Position**: Spans from Eastern Europe to Pacific Ocean
- **European Part**: West of Ural Mountains
- **Asian Part**: Siberia extending to Pacific coast
- **Shape**: Very wide east-west span, narrower north-south
- **Key Features**: Arctic coastline along northern edge

### Brazil
**What to Look For:**
- **Size**: Largest country in South America
- **Position**: Eastern South America, along Atlantic coast
- **Shape**: Roughly triangular/wedge shape
- **Key Features**: 
  - Long Atlantic coastline on eastern side
  - Amazon region in north
  - Should dominate South American continent visually

### China
**What to Look For:**
- **Size**: One of largest countries in Asia
- **Position**: East Asia, bordering many countries
- **Shape**: Complex shape with long coastline
- **Key Features**:
  - Pacific coastline on eastern side
  - Large land mass
  - Should be prominent in East Asia

### Australia
**What to Look For:**
- **Island Continent**: Complete island with no land borders
- **Position**: Southern hemisphere, below Indonesia
- **Shape**: Distinctive Australian outline
- **Key Features**:
  - Completely surrounded by water
  - Roughly rectangular with curved edges
  - Should be isolated in Oceania

### India
**What to Look For:**
- **Peninsula Shape**: Triangular peninsula extending into Indian Ocean
- **Position**: South Asia, below China/Nepal/Bhutan
- **Shape**: Distinctive inverted triangle
- **Key Features**:
  - Point extending south into ocean
  - Both eastern and western coasts visible
  - Himalayan region implied at northern border

---

## Task 13.2: Small Country Overlays

### What Circle Overlays Look Like

**Visual Characteristics:**
```
○ ← Small circle like this (approximately 10px radius)
```

- **Appearance**: Transparent filled circles
- **Size**: Consistent ~10px radius (about the size of 'O' character)
- **Color**: Transparent fill, but clickable area
- **Position**: Centered within or near the country's actual location
- **Behavior**: Cursor becomes pointer when hovering

### Where to Find Small Countries

#### Oceania (Easiest to Test)
**Filter:** Select "Oceania" only

**Tonga**
- Location: Pacific Ocean, east of Fiji, northeast of New Zealand
- Look for: Small circle in open ocean area
- Approximate position: Eastern Oceania region

**Samoa**
- Location: Pacific Ocean, northeast of Fiji
- Look for: Small circle near Tonga
- Approximate position: Central Pacific

**Other Pacific Islands**
- Palau, Nauru, Tuvalu, Kiribati
- Look for: Multiple small circles scattered in Pacific

#### Europe
**Filter:** Select "Europe" only

**Monaco**
- Location: French Riviera, Mediterranean coast
- Look for: Small circle on southern France coast
- Near: Between France and Italy on Mediterranean

**Vatican City**
- Location: Inside Rome, Italy
- Look for: Small circle in central Italy
- Smallest country - should have overlay

**San Marino**
- Location: Inside Italy, near Adriatic Sea
- Look for: Small circle in northeastern Italy
- Between central and coastal Italy

#### Caribbean
**Filter:** Select "Americas"

**Small Caribbean Nations**
- Saint Kitts and Nevis
- Grenada
- Barbados
- Saint Vincent and the Grenadines
- Look for: Small circles in Caribbean Sea region

---

## Task 13.3: Interactive Features

### Hover Effects

**Default State (No Hover):**
- Fill color: Light gray (#e8ebf0)
- Border: White (#ffffff)
- Border width: 0.5px
- Cursor: Default arrow

**Hover State:**
- Fill color: Darker gray (#d1d5db)
- Border: Blue (#4a5af7) - becomes more prominent
- Border width: 1px (thicker)
- Cursor: Pointer (hand icon)
- Transition: Smooth 0.2s ease animation

**What to Feel:**
- Response should be INSTANT (< 50ms)
- No delay between mouse movement and color change
- Smooth color transition, not abrupt

### Correct Answer Highlighting

**Appearance:**
- Fill color: Green (#10b981) - bright, vivid green
- Border: Darker green (#059669)
- Border width: 1.5px (thicker than hover)
- Cursor: Default (no longer clickable)

**Timing:**
- Should appear IMMEDIATELY upon clicking correct country
- No delay between click and green highlight
- Should be very obvious and celebratory

**Persistence:**
- Green should remain until next question
- Should not fade or disappear prematurely

### Incorrect Answer Highlighting

**Appearance:**
- Fill color: Red (#ef4444) - bright, vivid red
- Border: Darker red (#dc2626)
- Border width: 1.5px (thicker than hover)
- Cursor: Default (no longer clickable)

**Timing:**
- Should appear IMMEDIATELY upon clicking wrong country
- No delay between click and red highlight
- Should be very obvious

**Persistence:**
- Red should remain visible
- Should clearly indicate the mistake

### Performance Expectations

**What "Smooth" Feels Like:**
- ✅ Hover changes happen instantly as mouse moves
- ✅ No stuttering or frame drops
- ✅ Clicks register immediately
- ✅ Transitions are smooth and polished
- ✅ No lag when many countries are visible

**What "Laggy" Feels Like:**
- ❌ Delay between mouse movement and hover effect
- ❌ Stuttering animations
- ❌ Clicks don't register immediately
- ❌ Frame drops during transitions
- ❌ Slow response when switching continents

---

## Visual Comparison Checklist

### Colors Should Match Design

| Element | Expected Color | Hex Code | Check |
|---------|---------------|----------|-------|
| Default fill | Light gray | #e8ebf0 | ⬜ |
| Default border | White | #ffffff | ⬜ |
| Hover fill | Darker gray | #d1d5db | ⬜ |
| Hover border | Blue | #4a5af7 | ⬜ |
| Correct fill | Green | #10b981 | ⬜ |
| Correct border | Dark green | #059669 | ⬜ |
| Incorrect fill | Red | #ef4444 | ⬜ |
| Incorrect border | Dark red | #dc2626 | ⬜ |

### Layout Should Match Design

**Map Container:**
- ⬜ Map fills available space appropriately
- ⬜ Map maintains aspect ratio (1000:500)
- ⬜ Map scales responsively

**Controls:**
- ⬜ Controls remain on left side (if present)
- ⬜ Map on right side
- ⬜ No overlapping elements

**ViewBox:**
- ⬜ All countries visible within viewport
- ⬜ No countries cut off at edges
- ⬜ Centered properly

---

## Common Visual Issues to Watch For

### 🚫 Countries Not Rendering
**Symptoms:**
- Blank map
- Missing countries
- Only some countries visible

**Check:**
- Browser console for errors
- Network tab for failed loads
- Filter settings (is a continent selected?)

### 🚫 Hover Not Working
**Symptoms:**
- No color change on hover
- Cursor doesn't change to pointer
- No visual feedback

**Check:**
- CSS loading correctly
- JavaScript running without errors
- Not in disabled state

### 🚫 Clicks Not Registering
**Symptoms:**
- Clicking country does nothing
- No highlighting appears
- No game progress

**Check:**
- Event handlers attached
- Console errors
- Country has valid ID

### 🚫 Small Countries Not Clickable
**Symptoms:**
- Can't click tiny countries
- No circle overlays visible
- Hover works but click doesn't

**Check:**
- Circle overlays rendering (inspect DOM)
- Centroid data exists
- z-index correct (circles on top)

### 🚫 Wrong Colors
**Symptoms:**
- Colors don't match design
- Highlighting wrong color
- Inconsistent colors

**Check:**
- CSS loaded correctly
- Correct classes applied
- No conflicting styles

### 🚫 Performance Issues
**Symptoms:**
- Lag on hover
- Stuttering animations
- Slow response

**Check:**
- Too many countries rendering?
- Browser performance (DevTools)
- Memory usage

---

## Browser DevTools Tips

### Inspecting the Map

**Open DevTools:** Press F12 (or Cmd+Option+I on Mac)

**Useful Checks:**

1. **Elements Tab**
   ```html
   <!-- Look for this structure -->
   <svg viewBox="0 0 1000 500" class="interactive-map">
     <path class="country-path" id="US" d="M..."></path>
     <path class="country-path" id="RU" d="M..."></path>
     <!-- ... more countries ... -->
     <circle class="country-overlay" cx="509" cy="205" r="10"></circle>
     <!-- ... more circles for small countries ... -->
   </svg>
   ```

2. **Console Tab**
   ```javascript
   // Check country count
   document.querySelectorAll('.country-path').length
   // Should return number of visible countries
   
   // Check overlay count
   document.querySelectorAll('.country-overlay').length
   // Should return number of small countries
   
   // Get country IDs
   Array.from(document.querySelectorAll('.country-path')).map(el => el.id)
   // Should return array of ISO codes like ['US', 'RU', 'BR', ...]
   ```

3. **Performance Tab**
   - Click "Record"
   - Interact with map (hover, click)
   - Stop recording
   - Look for frame drops or slow operations

4. **Network Tab**
   - Check if all resources loaded
   - Look for 404 errors
   - Verify no failed requests

---

## Quick Reference: ISO Country Codes

### Major Countries
- **US** - United States
- **RU** - Russia
- **BR** - Brazil
- **CN** - China
- **AU** - Australia
- **IN** - India

### Small Countries (With Overlays)
- **VA** - Vatican City
- **MC** - Monaco
- **SM** - San Marino
- **TO** - Tonga
- **WS** - Samoa
- **PW** - Palau
- **NR** - Nauru

### Continent Counts (Approximate)
- Europe: ~50 countries
- Asia: ~50 countries
- Americas: ~35 countries
- Africa: ~54 countries
- Oceania: ~14 countries
- **Total: ~245 countries**

---

## Success Indicators

### ✅ Everything Working Correctly

**Visual Indicators:**
- Map renders with realistic country shapes
- All major countries easily identifiable
- Small circles visible on tiny countries
- Hover effects smooth and instant
- Highlighting clear and immediate
- Colors match design specs

**Interaction Indicators:**
- Cursor changes appropriately
- All clicks register immediately
- No lag or stuttering
- Game flows smoothly
- Filters work correctly

**Performance Indicators:**
- No console errors
- Fast load time
- Instant response
- Smooth animations
- No frame drops

### ❌ Issues Present

**Red Flags:**
- Countries don't look realistic
- Missing or distorted shapes
- No hover effects
- Clicks don't work
- Lag or stuttering
- Console errors
- Wrong colors
- Poor performance

---

## Questions During Testing?

**Can't find a small country?**
- Check you have the right continent selected
- Look for small circles, not just country shapes
- Use browser zoom if needed

**Not sure if hover is working?**
- Move mouse slowly over country
- Watch for color change from light to darker gray
- Watch for cursor change to pointer

**Performance seems slow?**
- Check how many countries are visible
- Try selecting just one continent
- Check browser DevTools performance tab

**Colors look wrong?**
- Check CSS is loaded (look in DevTools)
- Compare with hex codes in this guide
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

**Remember:** These are manual tests - use your judgment and document what you observe!

