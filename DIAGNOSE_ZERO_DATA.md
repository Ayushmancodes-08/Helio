# Diagnosing: Why Dashboard Shows 0 When Data Exists in Form

## The Problem
- Hospital Infrastructure page shows data (307,600 population, 1,268 beds, etc.)
- Dashboard shows 0.00M population and 0 districts
- Data is NOT being saved to the database

## Root Cause
The data you see in the form is **LOCAL STATE ONLY**. It's not saved to the database until you click "Save All Changes".

## How to Fix

### Step 1: Check if Save Button Appeared
1. Go to `/dashboard/data-entry-operator/hospital-infrastructure`
2. Expand a hospital and change any value (e.g., population)
3. **Look for a floating "Save All Changes" button** in the bottom-right corner
4. If you don't see it, the form didn't detect changes

### Step 2: Click Save Button
1. Click the "Save All Changes" button
2. **Wait for the green success toast** saying "Updated X hospitals"
3. **Check browser console** (F12 → Console tab)

### Step 3: Verify Console Logs
You should see:
```
[Hospital Infrastructure] Changed hospitals: 5
[Hospital Infrastructure] Updated Amrut Hospital successfully
[Hospital Infrastructure] Updated City Hospital successfully
[Hospital Infrastructure] Updated MKCG, Berhampur successfully
[Hospital Infrastructure] Updated PHCs successfully
[Hospital Infrastructure] Updated SUM hospital successfully
[Hospital Infrastructure] Dispatched hospital-data-updated event
```

### Step 4: Check Dashboard
1. Navigate to `/dashboard/data-entry-operator`
2. **Wait 2-3 seconds** for real-time sync
3. Data should now appear

## Troubleshooting

### Issue: No "Save All Changes" button appears

**Cause:** Form didn't detect changes

**Solution:**
1. Click on a hospital to expand it
2. Change a value (e.g., population from 0 to 1)
3. Button should appear in bottom-right
4. If not, try refreshing the page

### Issue: Save button appears but clicking does nothing

**Cause:** Save is in progress or failed silently

**Solution:**
1. Check console for errors (F12 → Console)
2. Look for red error messages
3. Check network tab (F12 → Network) for failed requests
4. Try saving again

### Issue: Toast shows "Updated 0 hospitals"

**Cause:** No changes were detected

**Solution:**
1. Make sure you actually changed values
2. Expand hospitals and modify fields
3. Check that values are different from original
4. Try changing multiple hospitals

### Issue: Toast shows "Updated X, failed Y"

**Cause:** Some hospitals failed to save

**Solution:**
1. Check console for error details
2. Verify you have permission to update hospitals
3. Check Supabase connection
4. Try saving again

### Issue: Save succeeds but dashboard still shows 0

**Cause:** Real-time sync not working

**Solution:**
1. Wait 3-5 seconds
2. Manually refresh dashboard (F5)
3. Check console for subscription errors
4. Try navigating away and back

## Verification Steps

### 1. Check if Data Was Saved to Database

Open browser console and run:
```javascript
// Check if hospitals have data
fetch('/api/dashboard/data-entry-operator')
  .then(r => r.json())
  .then(d => {
    console.log('Metrics:', d.metrics);
    console.log('Total Population:', d.metrics.reduce((s, m) => s + m.population, 0));
  });
```

Expected output:
```
Metrics: [
  {
    id: "...",
    district_name: "Berhampur",
    population: 307600,
    total_beds: 1268,
    ...
  }
]
Total Population: 307600
```

### 2. Check Supabase Directly

1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Run:
```sql
SELECT 
  d.name as district,
  COUNT(h.id) as hospitals,
  SUM(h.population) as total_population,
  SUM(h.total_beds) as total_beds
FROM districts d
LEFT JOIN hospitals h ON d.id = h.district_id
GROUP BY d.id, d.name;
```

Expected output:
```
| district   | hospitals | total_population | total_beds |
|------------|-----------|------------------|------------|
| Berhampur  | 5         | 307600           | 1268       |
```

If this shows 0 or NULL, data wasn't saved.

### 3. Check Individual Hospital Records

```sql
SELECT id, name, district_id, population, total_beds, ambulances, doctors, nurses
FROM hospitals
WHERE district_id = (SELECT id FROM districts WHERE name = 'Berhampur')
ORDER BY name;
```

Expected output:
```
| name              | population | total_beds | ambulances | doctors | nurses |
|-------------------|------------|------------|------------|---------|--------|
| Amrut Hospital    | 61520      | 254        | 13         | 83      | 150    |
| City Hospital     | 61520      | 254        | 13         | 83      | 150    |
| MKCG, Berhampur   | 61520      | 254        | 13         | 83      | 150    |
| PHCs              | 61520      | 254        | 13         | 83      | 150    |
| SUM hospital      | 61520      | 254        | 13         | 83      | 150    |
```

If all values are 0, data wasn't saved.

## Complete Workflow to Save Data

```
1. Go to Hospital Infrastructure page
   ↓
2. Expand a hospital
   ↓
3. Change a value (e.g., population)
   ↓
4. "Save All Changes" button appears (bottom-right)
   ↓
5. Click "Save All Changes"
   ↓
6. Wait for green success toast
   ↓
7. Check console for logs
   ↓
8. Go to Dashboard
   ↓
9. Wait 2-3 seconds
   ↓
10. Data should appear
```

## Console Logs to Look For

### Success Logs
```
[Hospital Infrastructure] Changed hospitals: 5
[Hospital Infrastructure] Updated Amrut Hospital successfully
[Hospital Infrastructure] Dispatched hospital-data-updated event
[DEO Dashboard] Received hospital-data-updated event, refreshing...
[DEO API] Fetched 5 hospitals
[DEO API] Aggregated into 1 district metrics
```

### Error Logs
```
[Hospital Infrastructure] Failed to update Amrut Hospital: ...
[Hospital Infrastructure] Error updating City Hospital: ...
```

## Quick Checklist

- [ ] Opened Hospital Infrastructure page
- [ ] Expanded a hospital
- [ ] Changed a value
- [ ] "Save All Changes" button appeared
- [ ] Clicked the button
- [ ] Got green success toast
- [ ] Checked console for logs
- [ ] Waited 2-3 seconds
- [ ] Went to Dashboard
- [ ] Data now appears

## Still Not Working?

1. **Check browser console** (F12) for errors
2. **Check network tab** (F12 → Network) for failed requests
3. **Verify Supabase connection** is working
4. **Try refreshing page** (F5)
5. **Check if you're logged in** as DEO
6. **Verify hospitals exist** in database
7. **Contact support** with console errors

---

**Key Point:** Data in the form is LOCAL. You MUST click "Save All Changes" to persist to database.
