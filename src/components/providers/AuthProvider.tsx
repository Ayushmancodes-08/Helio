'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface Profile {
    id: string;
    user_id: string | null;
    auth_user_id: string;
    role: 'patient' | 'doctor' | 'pharmacist' | 'health-official' | 'data-entry-operator';
    full_name: string;
    email: string | null;
    phone: string | null;
    age: number | null;
    gender: string | null;
    address: string | null;
    photo: string | null;
    license_number: string | null;
    specialization: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Memoize the client to prevent re-creation on every render
    const [supabase] = useState(() => createClient());

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_user_id', userId)
                .single();

            if (error) {
                console.error('Profile fetch error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                });
                throw error;
            }

            if (!data) {
                console.warn('No profile found for user:', userId);
            }

            setProfile(data);
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            console.log('User ID attempting to fetch:', userId);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Check for hardcoded admin session first (ONLY on mount)
        const hardcodedAdmin = sessionStorage.getItem('hardcoded_admin');
        if (hardcodedAdmin) {
            try {
                const adminData = JSON.parse(hardcodedAdmin);
                // Create a mock profile from hardcoded data
                const mockProfile: Profile = {
                    id: adminData.user_id,
                    user_id: adminData.user_id,
                    auth_user_id: 'hardcoded', // Placeholder
                    role: adminData.role,
                    full_name: adminData.full_name,
                    email: adminData.email,
                    phone: null,
                    age: null,
                    gender: null,
                    address: null,
                    photo: null,
                    license_number: null,
                    specialization: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                setProfile(mockProfile);
                setLoading(false);
                return; // Exit early - don't set up Supabase listeners
            } catch (e) {
                console.error('Error parsing hardcoded admin:', e);
            }
        }

        // 1. Initial Session Check (Local First)
        supabase.auth.getSession().then(({ data: { session } }) => {
            // Check expiry locally before assuming it's valid
            if (session && session.expires_at) {
                const now = Math.floor(Date.now() / 1000);
                if (session.expires_at < now) {
                    console.log("Session expired locally, not setting user.");
                    setUser(null);
                    setLoading(false);
                    return;
                }
            }

            setUser(session?.user ?? null);
            if (!session?.user) {
                setLoading(false);
            }
        });

        // 2. Listen for Auth Changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            // Optional: Debounce or check event type if needed
            // But main fix is memoizing the client so this doesn't re-subscribe endlessly
            setUser(session?.user ?? null);
            if (!session?.user) {
                setLoading(false);
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]); // Add supabase dependency, though it's stable now

    // 3. Effect to Fetch Profile & Subscribe to Changes when User is present
    useEffect(() => {
        let channel: any = null;

        if (user) {
            // Fetch initial profile
            fetchProfile(user.id).finally(() => setLoading(false));

            // Setup Realtime Subscription
            channel = supabase
                .channel('profile-changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `auth_user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        if (payload.new) {
                            setProfile(payload.new as Profile);
                        }
                    }
                )
                .subscribe();
        } else {
            // If user logged out, ensure loading is false
            // setLoading(false); 
        }

        // Cleanup: Remove channel when user changes or component unmounts
        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user?.id, supabase]);

    const signOut = async () => {
        // Clear hardcoded admin if present
        sessionStorage.removeItem('hardcoded_admin');

        // Clear legacy localStorage keys to prevent session bleeding
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('patientAccount_undefined'); // Common artifact

        // Ideally we should clear critical legacy keys if we know them
        localStorage.removeItem('loggedInUser');

        // Sign out from Supabase
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
