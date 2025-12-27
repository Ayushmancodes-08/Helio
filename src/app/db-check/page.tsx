'use client';

// Force dynamic rendering to prevent build-time static generation
// This page needs runtime environment variables for Supabase
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function DatabaseCheckPage() {
    const [checking, setChecking] = useState(true);
    const [results, setResults] = useState<any>({});
    const supabase = createClient();

    const checkDatabase = async () => {
        setChecking(true);
        const checks: any = {};

        try {
            // 1. Check if profiles table exists
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('count')
                .limit(1);

            checks.profilesTable = {
                exists: !profilesError,
                error: profilesError?.message,
                status: !profilesError ? 'success' : 'error',
            };

            // 2. Check if appointments table exists
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('appointments')
                .select('count')
                .limit(1);

            checks.appointmentsTable = {
                exists: !appointmentsError,
                error: appointmentsError?.message,
                status: !appointmentsError ? 'success' : 'error',
            };

            // 3. Check if prescriptions table exists
            const { data: prescriptionsData, error: prescriptionsError } = await supabase
                .from('prescriptions')
                .select('count')
                .limit(1);

            checks.prescriptionsTable = {
                exists: !prescriptionsError,
                error: prescriptionsError?.message,
                status: !prescriptionsError ? 'success' : 'error',
            };

            // 4. Check if lab_reports table exists
            const { data: labReportsData, error: labReportsError } = await supabase
                .from('lab_reports')
                .select('count')
                .limit(1);

            checks.labReportsTable = {
                exists: !labReportsError,
                error: labReportsError?.message,
                status: !labReportsError ? 'success' : 'error',
            };

            // 5. Check if inventory table exists
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('count')
                .limit(1);

            checks.inventoryTable = {
                exists: !inventoryError,
                error: inventoryError?.message,
                status: !inventoryError ? 'success' : 'error',
            };

            // 6. Check current user
            const { data: { user } } = await supabase.auth.getUser();
            checks.currentUser = {
                authenticated: !!user,
                userId: user?.id,
                email: user?.email,
                phone: user?.phone,
                status: user ? 'success' : 'warning',
            };

            // 7. If user exists, check their profile
            if (user) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('auth_user_id', user.id)
                    .single();

                checks.userProfile = {
                    exists: !!profileData,
                    profile: profileData,
                    error: profileError?.message,
                    status: profileData ? 'success' : 'error',
                };
            }

            setResults(checks);
        } catch (error: any) {
            console.error('Database check error:', error);
            checks.error = error.message;
        }

        setChecking(false);
    };

    useEffect(() => {
        checkDatabase();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const allTablesExist = results.profilesTable?.exists &&
        results.appointmentsTable?.exists &&
        results.prescriptionsTable?.exists &&
        results.labReportsTable?.exists &&
        results.inventoryTable?.exists;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Database Status Check</h1>
                    <p className="text-muted-foreground mt-2">
                        Verify that all database tables are set up correctly
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Database Tables</CardTitle>
                            <Button onClick={checkDatabase} disabled={checking} variant="outline" size="sm">
                                <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                        <CardDescription>
                            {allTablesExist ?
                                '✅ All tables exist and are accessible' :
                                '⚠️ Some tables are missing - run SQL migration'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(results).map(([key, value]: [string, any]) => {
                            if (key === 'currentUser' || key === 'userProfile' || key === 'error') return null;

                            return (
                                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(value.status)}
                                        <div>
                                            <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            {value.error && (
                                                <p className="text-sm text-red-500">{value.error}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant={value.status === 'success' ? 'default' : 'destructive'}>
                                        {value.exists ? 'Exists' : 'Missing'}
                                    </Badge>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {results.currentUser && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Current User</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Authentication Status</span>
                                <Badge variant={results.currentUser.authenticated ? 'default' : 'secondary'}>
                                    {results.currentUser.authenticated ? 'Logged In' : 'Not Logged In'}
                                </Badge>
                            </div>
                            {results.currentUser.authenticated && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">User ID</span>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {results.currentUser.userId}
                                        </code>
                                    </div>
                                    {results.currentUser.email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Email</span>
                                            <span className="text-sm">{results.currentUser.email}</span>
                                        </div>
                                    )}
                                    {results.currentUser.phone && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Phone</span>
                                            <span className="text-sm">{results.currentUser.phone}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {results.userProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle>User Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {results.userProfile.exists ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="font-medium">Profile found in database</span>
                                    </div>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <pre className="text-xs overflow-auto">
                                            {JSON.stringify(results.userProfile.profile, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <span className="font-medium">No profile found</span>
                                    </div>
                                    {results.userProfile.error && (
                                        <p className="text-sm text-red-500">{results.userProfile.error}</p>
                                    )}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Action Required:</strong> Your user account exists but has no profile entry.
                                            This usually happens when the database tables were created after signup.
                                            Please contact support or sign up again.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!allTablesExist && (
                    <Card className="border-yellow-500">
                        <CardHeader>
                            <CardTitle className="text-yellow-600 dark:text-yellow-500">⚠️ Setup Required</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Some database tables are missing. You need to run the SQL migration script:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>Open your Supabase Dashboard</li>
                                <li>Go to <strong>SQL Editor</strong></li>
                                <li>Create a <strong>New Query</strong></li>
                                <li>Copy the entire contents of <code>supabase-schema.sql</code></li>
                                <li>Paste and click <strong>Run</strong></li>
                            </ol>
                            <Button asChild className="w-full">
                                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                                    Open Supabase Dashboard →
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
