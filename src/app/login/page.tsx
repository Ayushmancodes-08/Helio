'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';


export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');

  const handleRoleSelection = () => {
    if (!selectedRole) return;
    if (selectedRole === 'patient') {
      router.push('/login/patient');
    } else {
      router.push(`/login/professional?role=${selectedRole}`);
    }
  };

  const roles = [
    { value: 'patient', label: 'Patient' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'health-official', label: 'Health Official' },
    { value: 'data-entry-operator', label: 'Data Entry Operator' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Grameen Swasthya Setu</span>
          </Link>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>Choose your role to login or create a new account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select onValueChange={setSelectedRole} value={selectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role..." />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value} className="capitalize">
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRoleSelection} disabled={!selectedRole} className="w-full">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
