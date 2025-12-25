'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
    id: string
    user_id: string | null
    auth_user_id: string
    role: 'patient' | 'doctor' | 'pharmacist' | 'health-official' | 'data-entry-operator'
    full_name: string
    email: string | null
    phone: string | null
    age: number | null
    gender: string | null
    address: string | null
    photo: string | null
    license_number: string | null
    specialization: string | null
    created_at: string
    updated_at: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_user_id', userId)
                .single()

            if (error) {
                console.error('Profile fetch error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                throw error
            }

            if (!data) {
                console.warn('No profile found for user:', userId)
            }

            setProfile(data)
        } catch (error: any) {
            console.error('Error fetching profile:', error)
            console.log('User ID attempting to fetch:', userId)
            setProfile(null)
        }
    }

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
                    updated_at: new Date().toISOString()
                };
                setProfile(mockProfile);
                setLoading(false);
                return; // Exit early - don't set up Supabase listeners
            } catch (e) {
                console.error('Error parsing hardcoded admin:', e);
            }
        }

        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // 2. Listen for Auth Changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    // 3. Effect to Fetch Profile & Subscribe to Changes when User is present
    useEffect(() => {
        let channel: any = null;

        if (user) {
            // Fetch initial profile
            fetchProfile(user.id);

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
            setProfile(null);
        }

        // Cleanup: Remove channel when user changes or component unmounts
        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        }
    }, [user]);

    const signOut = async () => {
        // Clear hardcoded admin if present
        sessionStorage.removeItem('hardcoded_admin');

        // Clear legacy localStorage keys to prevent session bleeding
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('patientAccount_undefined'); // Common artifact

        // Ideally we should clear critical legacy keys if we know them
        // Imported from legacy-constants, but hardcoding strings here to avoid circular depends if unnecessary
        localStorage.removeItem('loggedInUser');

        // Sign out from Supabase
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    return {
        user,
        profile,
        loading,
        signOut,
        isAuthenticated: !!user,
    }
}
