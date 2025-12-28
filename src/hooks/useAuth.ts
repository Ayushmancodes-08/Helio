import { useAuthContext } from '@/components/providers/AuthProvider';
export type { Profile } from '@/components/providers/AuthProvider';

export function useAuth() {
    return useAuthContext();
}
