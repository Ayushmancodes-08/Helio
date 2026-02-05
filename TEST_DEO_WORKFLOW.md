# Test DEO Workflow - Step by Step

## Prerequisites
- You're logged in as a Data Entry Operator
- Browser console is open (F12)

## Test Scenario: Berhampur District

### Step 1: Create District

1. Navigate to: `/dashboard/data-entry-operator/districts-hospitals`
2. In "Add New District" section, enter: `Berhampur`
3. Click "Add District"
4. **Expected:** Green toast: "District added successfully"
5. **Console:** Should see `[Districts] Real-time change: ...`

### Step 2: Add Hospitals

1. In the "Berhampur" card, enter hospital name: `Amrut Hospital`
2. Click "Add Hospital"
3. **Expected:** Green toast: "Hospital added successfully"
4. **Console:** Should see `[Hospitals] Real-time change: ...`

Repeat for more hospitals:
- `City Hospital`
- `MKCG, Berhampur`
- `PHCs`
- `SUM hospital`

### Step 3: Enter Hospital Data

1. Navigate to: `/dashboard/data-entry-operator/regional-data`
2. Expand "Berhampur" district
3. Expand "Amrut Hospital"
4. Enter data:
   - Population: `307600`
   - Total Beds: `1268`
   - Occupied Beds: `1000`
   - Ambulances: `64`
   - Doctors: `417`
   - Nurses: `749`
5. Click "Save All Changes"
6. **Expected:** Green toast: "Updated infrastructure for 5 hospitals"

### Step 4: Verify Dashboard Update

1. Navigate to: `/dashboard/data-entry-operator`
2. **Expected Results:**
   - Total Population Covered: `0.31M` (307,600)
   - Monitored Districts: `1`
   - Total Ambulances: `64`
   - Data Quality: `OK`
3. **Table should show:**
   - District: Berhampur
   - Population: 307,600
   - Bed Occupancy: 1000/1268
   - Status: Stable (green)

### Step 5: Check Console Logs

Open browser console (F12) and look for:

```
[Districts] Real-time subscription active
[Hospitals] Real-time subscription active
[DEO Dashboard] Real-time subscription active
[DEO Dashboard] Hospital updated: ...
[DEO Dashboard] Received hospital-data-updated event, refreshing...
[DEO API] Fetched 5 hospitals
[DEO API] Aggregated into 1 district metrics
```

## Expected Console Output

```javascript
// After creating district
[Districts] Real-time change: {
  type: 'INSERT',
  new: { id: '...', name: 'Berhampur', ... }
}

// After adding hospital
[Hospitals] Real-time change: {
  type: 'INSERT',
  new: { id: '...', name: 'Amrut Hospital', district_id: '...', ... }
}

// After saving data
[DEO Dashboard] Hospital updated: {
  type: 'UPDATE',
  new: { id: '...', population: 307600, total_beds: 1268, ... }
}

[DEO Dashboard] Received hospital-data-updated event, refreshing...
[DEO API] Fetched 5 hospitals
[DEO API] Aggregated into 1 district metrics
```

## Verification Checklist

- [ ] District created successfully
- [ ] Hospitals added to district
- [ ] Hospital data saved without errors
- [ ] Dashboard shows correct population
- [ ] Dashboard shows correct district count
- [ ] Dashboard shows correct ambulance count
- [ ] Table displays district data
- [ ] Occupancy status shows correctly
- [ ] Console shows all expected logs
- [ ] Real-time subscriptions are active

## Common Issues & Solutions

### Issue: Dashboard still shows 0.00M

**Solution:**
1. Verify hospitals were created (check districts-hospitals page)
2. Verify data was saved (look for green toast)
3. Check console for errors
4. Refresh page (F5)
5. Try entering data again

### Issue: Toast shows "failed 5"

**Solution:**
1. Check console for error messages
2. Verify you're logged in as DEO
3. Check Supabase connection
4. Try saving individual hospitals instead of all at once

### Issue: Console shows no logs

**Solution:**
1. Verify real-time subscriptions are active
2. Check browser console is open before making changes
3. Try refreshing page and repeating steps
4. Check network tab for API errors

### Issue: Data saved but dashboard not updating

**Solution:**
1. Wait 2-3 seconds (real-time sync takes time)
2. Refresh page (F5)
3. Check console for subscription errors
4. Try navigating away and back to dashboard

## Performance Expectations

| Action | Expected Time |
|--------|----------------|
| Create district | < 1 second |
| Add hospital | < 1 second |
| Save hospital data | < 2 seconds |
| Dashboard update | 1-2 seconds |
| Real-time sync | < 500ms |

## Network Requests

Monitor Network tab (F12 → Network) for:

1. **POST** `/api/districts` - Create district
2. **POST** `/api/hospitals` - Add hospital
3. **PUT** `/api/hospitals/{id}` - Update hospital
4. **GET** `/api/dashboard/data-entry-operator` - Fetch dashboard data

All requests should return **200 OK** or **201 Created**.

## Database Verification

To verify data in Supabase:

1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Run:
```sql
SELECT d.name as district, COUNT(h.id) as hospital_count, 
       SUM(h.population) as total_population,
       SUM(h.total_beds) as total_beds,
       SUM(h.ambulances) as total_ambulances
FROM districts d
LEFT JOIN hospitals h ON d.id = h.district_id
GROUP BY d.id, d.name;
```

Expected output:
```
| district   | hospital_count | total_population | total_beds | total_ambulances |
|------------|----------------|------------------|------------|------------------|
| Berhampur  | 5              | 307600           | 1268       | 64               |
```

## Success Criteria

✅ All steps completed without errors
✅ Dashboard displays correct aggregated data
✅ Console shows all expected logs
✅ Real-time subscriptions are active
✅ Data persists after page refresh
✅ Multiple districts can be created
✅ Data updates are reflected immediately

## Next Steps

After successful test:
1. Create additional districts
2. Add more hospitals
3. Enter data for all hospitals
4. Verify dashboard aggregation
5. Test with different data values
6. Monitor performance with large datasets
