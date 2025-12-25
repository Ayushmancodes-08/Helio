# Patient Alerts - Quick Start Guide

## What's New

✅ Patients now have a dedicated **Health Alerts** page
✅ Alerts from health officials appear **in real-time**
✅ Patients can **search and filter** alerts
✅ Alerts are **color-coded by priority**

---

## How to Use

### For Patients

1. **Log in as Patient**
   - Email: patient@example.com
   - Password: your password

2. **Click "Health Alerts" in Sidebar**
   - New menu item with Bell icon
   - Located between Appointments and Health Records

3. **View Active Alerts**
   - See all health alerts from officials
   - Color-coded by priority:
     - 🔴 Red = High Priority
     - 🟡 Yellow = Medium Priority
     - 🔵 Blue = Low Priority

4. **Search Alerts**
   - Use search box to find specific alerts
   - Search by title or description
   - Results update instantly

5. **Refresh Alerts**
   - Click "Refresh" button to manually update
   - Or wait for automatic real-time updates

---

## For Health Officials

### Create an Alert

1. **Log in as Health Official**
   - Go to Health Official Dashboard

2. **Click "Issue Alert"**
   - Fill in alert title
   - Select priority (Low/Medium/High)
   - Enter description
   - Select region (optional)

3. **Click "Issue Alert"**
   - Alert is created
   - Patients see it immediately

---

## Features

### Real-Time Updates
- Alerts appear instantly when created
- No page refresh needed
- Automatic subscription to changes

### Search & Filter
- Search by alert title
- Search by alert description
- Real-time filtering

### Priority Indicators
- High priority alerts shown in red
- Medium priority in yellow
- Low priority in blue
- Icons for quick visual identification

### Statistics
- Count of high priority alerts
- Count of medium priority alerts
- Count of low priority alerts

### Responsive Design
- Works on desktop
- Works on tablet
- Works on mobile

---

## File Changes

### New Files
- `GSS/src/app/dashboard/patient/alerts/page.tsx` - Patient alerts page

### Updated Files
- `GSS/src/components/patient-sidebar.tsx` - Added alerts menu item

---

## Testing

### Test 1: View Alerts
```
1. Log in as patient
2. Click "Health Alerts"
3. Should see all active alerts
```

### Test 2: Create Alert (as Health Official)
```
1. Log in as health official
2. Go to Alerts page
3. Create a new alert
4. Switch to patient tab
5. Patient page should update automatically
```

### Test 3: Search Alerts
```
1. Go to patient alerts page
2. Type in search box
3. Alerts should filter in real-time
```

### Test 4: Priority Colors
```
1. View alerts with different priorities
2. Verify colors match:
   - High = Red
   - Medium = Yellow
   - Low = Blue
```

---

## How It Works

### Data Flow
```
Health Official Creates Alert
        ↓
Alert stored in health_alerts table
        ↓
Real-time subscription triggers
        ↓
Patient sees alert immediately
```

### Real-Time Technology
- Uses Supabase PostgreSQL subscriptions
- Listens for changes to health_alerts table
- Automatically refreshes when new alerts created

---

## Customization

### Change Colors
Edit `getPriorityColor()` in `patient/alerts/page.tsx`

### Change Icons
Edit `getPriorityIcon()` in `patient/alerts/page.tsx`

### Add More Filters
Modify `filteredAlerts` logic in `patient/alerts/page.tsx`

---

## Troubleshooting

### Alerts Not Showing
- Check if health officials created alerts
- Verify alerts have status = 'Active'
- Hard refresh: Ctrl + Shift + R

### Real-Time Not Working
- Restart dev server: `npm run dev`
- Check browser console for errors
- Verify Supabase connection

### Search Not Working
- Check search term is entered
- Verify alert titles exist
- Check browser console for errors

---

## Summary

✅ Patients can view health alerts
✅ Alerts appear in real-time
✅ Search and filter functionality
✅ Priority-based color coding
✅ Statistics dashboard
✅ Responsive design

**Ready to use!** 🎉

Hard refresh your app and start using the new Health Alerts feature.
