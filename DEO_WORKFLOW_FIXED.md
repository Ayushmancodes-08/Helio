# Data Entry Operator (DEO) Dashboard - Fixed Workflow

## Overview
The DEO dashboard now properly syncs hospital infrastructure data from the data entry form to the dashboard display with real-time updates.

## Complete Data Flow

### 1. **Data Entry Phase** (Regional Data Page)
```
DEO opens: /dashboard/data-entry-operator/regional-data
    ↓
useDistricts() + useHospitals() fetch current data
    ↓
Form displays districts with expandable hospitals
    ↓
DEO edits hospital metrics:
  - Population
  - Total Beds / Occupied Beds
  - Ambulances
  - Doctors / Nurses
    ↓
DEO clicks "Save All Changes"
```

### 2. **Update Processing** (Form Submission)
```
onSubmit() triggered
    ↓
For each hospital in form:
  - Call updateHospital(id, updates)
  - updateHospital() calls Supabase directly
  - Hospital record updated in database
  - Real-time trigger fires
    ↓
After all updates complete:
  - Count successes/failures
  - Show toast notification
  - Call refreshHospitals() to sync local state
  - Dispatch custom event: 'hospital-data-updated'
```

### 3. **Real-Time Synchronization** (Supabase)
```
Hospital UPDATE in database
    ↓
Supabase real-time trigger fires
    ↓
Two listeners respond:
  
  A) useHospitals() hook (in regional-data page)
     - Refetches hospitals
     - Updates form data
  
  B) useDataEntryDashboard() hook (in dashboard page)
     - Debounced refetch (500ms delay)
     - Prevents excessive API calls
     - Triggers /api/dashboard/data-entry-operator
```

### 4. **Dashboard Update** (Dashboard Page)
```
Custom event 'hospital-data-updated' dispatched
    ↓
Dashboard page listener catches event
    ↓
Calls refresh() from useDataEntryDashboard hook
    ↓
SWR mutate() triggers immediate refetch
    ↓
/api/dashboard/data-entry-operator GET request
    ↓
API aggregates latest hospital data:
  - Fetches all hospitals with districts
  - Groups by district_id
  - Sums metrics (beds, ambulances, doctors, nurses)
  - Returns aggregated metrics
    ↓
Dashboard receives new metrics
    ↓
Stats cards update:
  - Total Population
  - Monitored Districts
  - Total Ambulances
  - Data Quality
    ↓
Table updates with district-level data
```

## Key Improvements

### 1. **Debounced Real-Time Subscription**
- Waits 500ms after last change before refetching
- Prevents multiple rapid API calls
- Reduces server load

### 2. **Explicit Event Dispatch**
- Custom event 'hospital-data-updated' ensures dashboard refresh
- Bridges the gap between data entry and dashboard
- Provides manual trigger in addition to real-time

### 3. **Enhanced Error Handling**
- Tracks success/failure count
- Shows detailed error messages
- Logs errors to console for debugging

### 4. **Improved Logging**
- API logs hospital count and aggregation
- Real-time subscription logs connection status
- Helps diagnose sync issues

### 5. **Better Subscription Management**
- Prevents duplicate subscriptions
- Proper cleanup on unmount
- Retry logic for failed subscriptions

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEO Regional Data Page                    │
│  (src/app/[locale]/dashboard/data-entry-operator/regional-data)
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─ useDistricts()
                         ├─ useHospitals()
                         └─ Form with hospital fields
                         │
                         ▼
                    ┌─────────────┐
                    │  onSubmit() │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────────┐
                    │ updateHospital() x N    │
                    │ (for each hospital)     │
                    └──────┬──────────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ Supabase hospitals   │
                    │ table UPDATE         │
                    └──────┬───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
   │ Real-time   │  │ Real-time    │  │ Custom Event     │
   │ trigger     │  │ trigger      │  │ 'hospital-data-  │
   │ (useHospitals)  │ (useDataEntry)  │ updated'         │
   └──────┬──────┘  └──────┬───────┘  └──────┬───────────┘
          │                │                 │
          ▼                ▼                 ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
   │ Refetch     │  │ Debounced    │  │ Dashboard page   │
   │ hospitals   │  │ refetch      │  │ listener         │
   │ (500ms)     │  │ (500ms)      │  │ calls refresh()  │
   └──────┬──────┘  └──────┬───────┘  └──────┬───────────┘
          │                │                 │
          └────────────────┼─────────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ /api/dashboard/      │
                    │ data-entry-operator  │
                    │ GET request          │
                    └──────┬───────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ Aggregate hospitals  │
                    │ by district          │
                    └──────┬───────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ Return metrics       │
                    │ (population, beds,   │
                    │  ambulances, etc)    │
                    └──────┬───────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ DEO Dashboard Page   │
                    │ Updates stats cards  │
                    │ Updates table        │
                    └──────────────────────┘
```

## Testing the Workflow

### Step 1: Open DEO Dashboard
- Navigate to `/dashboard/data-entry-operator`
- Note the current values (should show 0.00M population if no data)

### Step 2: Enter Data
- Go to `/dashboard/data-entry-operator/regional-data`
- Expand a district and hospital
- Change a value (e.g., population from 0 to 100000)
- Click "Save All Changes"

### Step 3: Verify Update
- Check browser console for logs:
  - `[DEO Dashboard] Hospital updated: ...`
  - `[DEO Dashboard] Received hospital-data-updated event, refreshing...`
  - `[DEO API] Fetched X hospitals`
  - `[DEO API] Aggregated into Y district metrics`

### Step 4: Check Dashboard
- Return to `/dashboard/data-entry-operator`
- Stats should update within 1-2 seconds
- Population should now show the new value

## Troubleshooting

### Dashboard not updating after save?
1. Check browser console for errors
2. Verify real-time subscription is active: `[DEO Dashboard] Real-time subscription active`
3. Check API response: Network tab → `/api/dashboard/data-entry-operator`
4. Verify hospital data was saved: Check Supabase dashboard

### Real-time subscription failing?
1. Check Supabase connection status
2. Verify RLS policies allow DEO to read hospitals
3. Check browser console for `CHANNEL_ERROR`
4. Subscription will auto-retry after 2 seconds

### Metrics showing zero?
1. Verify hospitals exist in database
2. Check that hospitals have district_id set
3. Verify districts exist and are linked
4. Check API logs for aggregation count

## Performance Considerations

- **Debounce delay**: 500ms (prevents excessive API calls)
- **SWR deduping**: 1000ms (prevents duplicate requests)
- **Real-time subscription**: Automatic retry on failure
- **Error retry**: 3 attempts with 1000ms interval

## Security

- DEO can only update hospitals (RLS policy enforced)
- DEO can only view their own profile
- All updates logged with timestamp
- API validates DEO role before returning data
