# DEO Dashboard - Quick Start (2 Minutes)

## Why is everything 0?
**No districts/hospitals created yet.** This is normal on first login.

## 3-Step Setup

### Step 1: Create Infrastructure (1 min)
```
Go to: /dashboard/data-entry-operator/districts-hospitals

1. Enter district name: "Berhampur"
2. Click "Add District"
3. Enter hospital name: "Amrut Hospital"
4. Click "Add Hospital"
5. Repeat for more hospitals
```

### Step 2: Enter Data (1 min)
```
Go to: /dashboard/data-entry-operator/regional-data

1. Expand district
2. Expand hospital
3. Enter metrics:
   - Population: 307,600
   - Total Beds: 1,268
   - Occupied Beds: 1,000
   - Ambulances: 64
   - Doctors: 417
   - Nurses: 749
4. Click "Save All Changes"
```

### Step 3: View Dashboard
```
Go to: /dashboard/data-entry-operator

✅ Dashboard now shows:
   - Total Population: 0.31M
   - Monitored Districts: 1
   - Total Ambulances: 64
   - Data Quality: OK
```

## That's It! 🎉

Dashboard updates automatically. No manual refresh needed.

## Quick Links

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard/data-entry-operator` | View metrics |
| Setup | `/dashboard/data-entry-operator/districts-hospitals` | Create districts/hospitals |
| Data Entry | `/dashboard/data-entry-operator/regional-data` | Enter hospital data |

## Common Issues

| Problem | Solution |
|---------|----------|
| Still shows 0? | Create districts first |
| Data not saving? | Check for error toast |
| Dashboard not updating? | Wait 2 seconds, then refresh |

## What Gets Aggregated?

Dashboard shows **totals** from all hospitals:
- Population = Sum of all hospital populations
- Beds = Sum of all hospital beds
- Ambulances = Sum of all ambulances
- Doctors = Sum of all doctors
- Nurses = Sum of all nurses

## Status Colors

- 🟢 **Stable** = < 80% bed occupancy
- 🟡 **Strained** = 80-95% bed occupancy
- 🔴 **Critical** = ≥ 95% bed occupancy

## Need Help?

1. Check browser console (F12)
2. Read `DEO_SETUP_GUIDE.md`
3. Follow `TEST_DEO_WORKFLOW.md`
4. Contact admin

---

**Ready?** Go to `/dashboard/data-entry-operator/districts-hospitals` and start! 🚀
