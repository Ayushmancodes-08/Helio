# Verify Data is Actually Being Saved to Database

## Quick Test (2 minutes)

### Step 1: Open Hospital Infrastructure Page
```
Navigate to: /dashboard/data-entry-operator/hospital-infrastructure
```

You should see:
- District name: "Berhampur"
- 5 hospitals listed
- Totals showing: 307,600 population, 1,268 beds, etc.

### Step 2: Open Browser Console
```
Press: F12
Click: Console tab
```

### Step 3: Make a Change
1. Click on "Amrut Hospital" to expand it
2. Change "Population Served" from current value to `999999`
3. **Look for "Save All Changes" button** in bottom-right corner

### Step 4: Click Save
1. Click the "Save All Changes" button
2. **Wait for green toast** saying "Updated X hospitals"
3. **Check console** - you should see:
```
[Hospital Infrastructure] Changed hospitals: 5
[Hospital Infrastructure] Updated Amrut Hospital successfully
[Hospital Infrastructure] Updated City Hospital successfully
[Hospital Infrastructure] Updated MKCG, Berhampur successfully
[Hospital Infrastructure] Updated PHCs successfully
[Hospital Infrastructure] Updated SUM hospital successfully
[Hospital Infrastructure] Dispatched hospital-data-updated event
```

### Step 5: Verify in Console
Run this in console:
```javascript
fetch('/api/dashboard/data-entry-operator')
  .then(r => r.json())
  .then(d => console.log('Population:', d.metrics[0]?.population))
```

**Expected output:** `Population: 999999` (or close to it)

If you see `0` or `undefined`, data wasn't saved.

### Step 6: Check Dashboard
1. Navigate to: `/dashboard/data-entry-operator`
2. **Wait 2-3 seconds**
3. Check if population updated

---

## Detailed Verification

### Method 1: Browser Console API Call

```javascript
// In browser console (F12 → Console)
fetch('/api/dashboard/data-entry-operator')
  .then(response => response.json())
  .then(data => {
    console.log('=== Dashboard Data ===');
    console.log('Metrics:', data.metrics);
    console.log('Total Districts:', data.metrics.length);
    console.log('Total Population:', data.metrics.reduce((sum, m) => sum + m.population, 0));
    console.log('Total Beds:', data.metrics.reduce((sum, m) => sum + m.total_beds, 0));
    console.log('Total Ambulances:', data.metrics.reduce((sum, m) => sum + m.total_ambulances, 0));
  })
  .catch(err => console.error('Error:', err));
```

**Expected output:**
```
=== Dashboard Data ===
Metrics: [
  {
    id: "uuid-here",
    district_name: "Berhampur",
    population: 307600,
    total_beds: 1268,
    occupied_beds: 1000,
    total_ambulances: 64,
    doctors: 417,
    nurses: 749,
    hospital_count: 5,
    last_updated: "2025-12-29T..."
  }
]
Total Districts: 1
Total Population: 307600
Total Beds: 1268
Total Ambulances: 64
```

If you see `0` for all values, data wasn't saved.

### Method 2: Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Make a change and click "Save All Changes"
4. Look for requests to `/api/hospitals` or similar
5. Click on each request and check Response tab
6. Should see `"success": true` in response

### Method 3: Supabase SQL Query

1. Go to Supabase dashboard
2. Click "SQL Editor"
3. Run this query:

```sql
SELECT 
  h.id,
  h.name,
  h.district_id,
  h.population,
  h.total_beds,
  h.occupied_beds,
  h.ambulances,
  h.doctors,
  h.nurses,
  h.updated_at,
  d.name as district_name
FROM hospitals h
LEFT JOIN districts d ON h.district_id = d.id
WHERE d.name = 'Berhampur'
ORDER BY h.name;
```

**Expected output:**
```
| name              | population | total_beds | ambulances | doctors | nurses | updated_at          |
|-------------------|------------|------------|------------|---------|--------|---------------------|
| Amrut Hospital    | 61520      | 254        | 13         | 83      | 150    | 2025-12-29 11:18:00 |
| City Hospital     | 61520      | 254        | 13         | 83      | 150    | 2025-12-29 11:18:00 |
| MKCG, Berhampur   | 61520      | 254        | 13         | 83      | 150    | 2025-12-29 11:18:00 |
| PHCs              | 61520      | 254        | 13         | 83      | 150    | 2025-12-29 11:18:00 |
| SUM hospital      | 61520      | 254        | 13         | 83      | 150    | 2025-12-29 11:18:00 |
```

If all values are `0`, data wasn't saved.

---

## Troubleshooting

### Problem: Console shows "Updated X hospitals" but API returns 0

**Cause:** Update succeeded but data wasn't actually persisted

**Check:**
1. Look at `updated_at` timestamp in Supabase
2. If it's old, update didn't work
3. Check for RLS policy errors in Supabase logs

**Solution:**
1. Try updating again
2. Check Supabase RLS policies
3. Verify DEO role is correct

### Problem: Console shows error "Failed to update"

**Cause:** Update request failed

**Check:**
1. Look at error message in console
2. Check Network tab for response details
3. Look for 403 (permission) or 500 (server) errors

**Solution:**
1. Check if you're logged in as DEO
2. Verify RLS policies allow updates
3. Check Supabase connection

### Problem: API returns data but Dashboard still shows 0

**Cause:** Real-time subscription not working

**Check:**
1. Wait 5 seconds
2. Manually refresh Dashboard (F5)
3. Check console for subscription errors

**Solution:**
1. Refresh page
2. Check browser console for errors
3. Try navigating away and back

---

## Expected Behavior

### When You Click "Save All Changes"

1. **Immediately:** Button shows loading spinner
2. **Within 1 second:** Toast appears saying "Updated X hospitals"
3. **In console:** Logs show each hospital updated
4. **Within 2 seconds:** Real-time event dispatched
5. **Within 3 seconds:** Dashboard refreshes automatically

### If Something Goes Wrong

1. **Toast shows error:** Check console for details
2. **No toast appears:** Check console for errors
3. **Console shows nothing:** Refresh page and try again

---

## Data Flow Verification

```
1. You change value in form
   ↓
2. "Save All Changes" button appears
   ↓
3. You click button
   ↓
4. API request sent to update hospitals
   ↓
5. Supabase updates database
   ↓
6. Real-time trigger fires
   ↓
7. Dashboard subscription receives update
   ↓
8. Dashboard refetches data
   ↓
9. Dashboard displays new values
```

If any step fails, data won't appear in dashboard.

---

## Final Verification Checklist

- [ ] Hospital Infrastructure page shows data
- [ ] I can expand hospitals and see fields
- [ ] I changed a value
- [ ] "Save All Changes" button appeared
- [ ] I clicked the button
- [ ] Green success toast appeared
- [ ] Console shows "Updated X hospitals successfully"
- [ ] Console shows "Dispatched hospital-data-updated event"
- [ ] I waited 2-3 seconds
- [ ] I navigated to Dashboard
- [ ] Dashboard now shows data (not 0.00M)
- [ ] Population matches what I entered

If all checked, data is saved correctly.

---

## Still Showing 0?

1. **Check console** (F12) for errors
2. **Run API test** (see Method 1 above)
3. **Check Supabase** (see Method 3 above)
4. **Refresh page** (F5)
5. **Try again** from Step 1

If still not working, there's a deeper issue. Check:
- Supabase connection
- RLS policies
- Database permissions
- Network connectivity
