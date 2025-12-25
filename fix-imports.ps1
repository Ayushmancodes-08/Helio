# Fix all localStorage constant imports
# This script replaces old imports with the new legacy-constants location

$files = @(
    "src/app/dashboard/patient/records/page.tsx",
    "src/app/dashboard/pharmacist/profile/page.tsx",
    "src/app/dashboard/patient/profile/page.tsx",
    "src/app/dashboard/pharmacist/page.tsx",
    "src/app/dashboard/patient/page.tsx",
    "src/app/dashboard/patient/appointments/page.tsx",
    "src/app/dashboard/health-official/profile/page.tsx",
    "src/app/dashboard/health-official/page.tsx",
    "src/app/dashboard/doctor/profile/page.tsx",
    "src/app/dashboard/doctor/patients/page.tsx",
    "src/app/dashboard/doctor/appointments/page.tsx",
    "src/app/dashboard/data-entry-operator/profile/page.tsx",
    "src/app/dashboard/data-entry-operator/page.tsx",
    "src/app/dashboard/health-official/analytics/page.tsx",
    "src/app/dashboard/doctor/patients/[patientId]/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..."
        $content = Get-Content $file -Raw
        
        # Replace all three import patterns
        $content = $content -replace "import \{ LOGGED_IN_USER_KEY \} from '@/app/login/page';", "import { LOGGED_IN_USER_KEY } from '@/lib/legacy-constants';"
        $content = $content -replace "import \{ PATIENT_ACCOUNT_KEY \} from '@/app/signup/patient/page';", "import { PATIENT_ACCOUNT_KEY } from '@/lib/legacy-constants';"
        $content = $content -replace "import \{ PROFESSIONAL_ACCOUNT_KEY \} from '@/app/signup/professional/page';", "import { PROFESSIONAL_ACCOUNT_KEY } from '@/lib/legacy-constants';"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "  ✓ Fixed"
    }
}

Write-Host "`nAll files updated!"
