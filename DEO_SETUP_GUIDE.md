# Data Entry Operator (DEO) - Complete Setup & Usage Guide

## Why Dashboard Shows 0.00M?

The dashboard shows all zeros because **no districts or hospitals have been created yet**. This is expected on first login.

## Complete Workflow

### Step 1: Create Districts & Hospitals

**Navigate to:** `/dashboard/data-entry-operator/districts-hospitals`

This page allows you to:
1. Create districts (e.g., "Berhampur", "Cuttack", "Bhubaneswar")
2. Add hospitals to each district (e.g., "Amrut Hospital", "City Hospital")

**How to use:**
1. Enter a district name in the input field
2. Click "Add District"
3. For each district, enter hospital names and click "Add Hospital"
4. Hospitals are created with default values (0 for all metrics)

**Example:**
```
District: Berhampur
  ├─ Amrut Hospital
  ├─ City Hospital
  ├─ MKCG, Berhampur
  ├─ PHCs
  └─ SUM hospital

District: Cuttack
  ├─ SCB Medical College
  └─ Acharya Harihar Hospital
```

### Step 2: Enter Hospital Infrastructure Data

**Navigate to:** `/dashboard/data-entry-operator/regional-data`

This page shows all districts with their hospitals. For each hospital, you can update:
- **Population**: Population served by the hospital
- **Total Beds**: Total bed capacity
- **Occupied Beds**: Currently occupied beds
- **Ambulances**: Number of ambulances available
- **Doctors**: Number of doctors
- **Nurses**: Number of nurses

**How to use:**
1. Expand a district to see its hospitals
2. Click on a hospital to expand its details
3. Enter/update the metrics
4. Click "Save All Changes" at the bottom
5. You'll see a success message
6. Dashboard will update automatically within 1-2 seconds

**Example Data Entry:**
```
Berhampur District:
  Amrut Hospital:
    - Population: 150,000
    - Total Beds: 200
    - Occupied Beds: 180
    - Ambulances: 5
    - Doctors: 25
    - Nurses: 50
```

### Step 3: View Dashboard

**Navigate to:** `/dashboard/data-entry-operator`

The dashboard now shows:
- **Total Population Covered**: Sum of all hospital populations
- **Monitored Districts**: Number of districts with data
- **Total Ambulances**: Sum of all ambulances
- **Data Quality**: Number of districts with incomplete data

**Table shows:**
- District name
- Total population
- Bed occupancy (occupied/total)
- Status (Stable, Strained, Critical)

## Real-Time Updates

After you save hospital data:
1. The system automatically detects the changes
2. Dashboard refreshes within 1-2 seconds
3. All metrics update to reflect new data
4. No manual refresh needed

## Troubleshooting

### Dashboard still shows 0.00M after entering data?

**Check:**
1. Did you create districts first? (Go to districts-hospitals page)
2. Did you create hospitals? (Each district needs at least one hospital)
3. Did you click "Save All Changes"? (Changes must be saved)
4. Check browser console for errors (F12 → Console tab)

**Solution:**
1. Go to `/dashboard/data-entry-operator/districts-hospitals`
2. Create at least one district
3. Add at least one hospital to that district
4. Go to `/dashboard/data-entry-operator/regional-data`
5. Enter data for the hospital
6. Click "Save All Changes"
7. Return to dashboard - it should now show data

### Data not updating after save?

**Check:**
1. Look for green success toast notification
2. Check browser console for errors
3. Verify hospital data was saved (check Supabase dashboard)

**Solution:**
1. Refresh the page (F5)
2. Try saving again
3. Check your internet connection
4. Contact support if issue persists

### Can't find the districts-hospitals page?

**Navigate directly:**
- English: `/en/dashboard/data-entry-operator/districts-hospitals`
- Hindi: `/hi/dashboard/data-entry-operator/districts-hospitals`
- Or use the "Set Up Districts & Hospitals" button on the dashboard

## Data Flow

```
1. Create Districts & Hospitals
   ↓
2. Enter Hospital Infrastructure Data
   ↓
3. Click "Save All Changes"
   ↓
4. Real-time sync to database
   ↓
5. Dashboard automatically updates
   ↓
6. View aggregated metrics
```

## Important Notes

- **Districts must be created first** before adding hospitals
- **Hospitals must exist** before entering data
- **All metrics are optional** - you can enter partial data
- **Changes are saved immediately** - no need to click a separate save button
- **Dashboard updates automatically** - no manual refresh needed
- **Data is aggregated by district** - totals are calculated from all hospitals in each district

## Metrics Explained

| Metric | Description | Example |
|--------|-------------|---------|
| Population | Total population served by all hospitals in district | 500,000 |
| Total Beds | Sum of all hospital beds in district | 1,500 |
| Occupied Beds | Sum of currently occupied beds | 1,200 |
| Occupancy % | (Occupied / Total) × 100 | 80% |
| Ambulances | Total ambulances available | 50 |
| Doctors | Total doctors across all hospitals | 300 |
| Nurses | Total nurses across all hospitals | 800 |

## Status Indicators

| Status | Occupancy | Color |
|--------|-----------|-------|
| Stable | < 80% | Green |
| Strained | 80-95% | Yellow |
| Critical | ≥ 95% | Red |

## Quick Start Checklist

- [ ] Navigate to districts-hospitals page
- [ ] Create at least one district
- [ ] Add at least one hospital to the district
- [ ] Go to regional-data page
- [ ] Enter hospital metrics
- [ ] Click "Save All Changes"
- [ ] Return to dashboard
- [ ] Verify data is displayed

## Support

If you encounter issues:
1. Check the browser console (F12 → Console)
2. Verify all districts and hospitals are created
3. Ensure data was saved (look for success toast)
4. Try refreshing the page
5. Contact your system administrator
