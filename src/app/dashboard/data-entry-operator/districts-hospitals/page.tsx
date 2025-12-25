'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Trash2, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';

export default function DistrictsHospitalsPage() {
    const [districtName, setDistrictName] = useState('');
    const [newHospitalNames, setNewHospitalNames] = useState<Record<string, string>>({});
    const [isAddingDistrict, setIsAddingDistrict] = useState(false);
    const [addingHospitalTo, setAddingHospitalTo] = useState<string | null>(null);

    const { toast } = useToast();
    const { districts, loading: districtsLoading, addDistrict, deleteDistrict } = useDistricts();
    const { hospitals, loading: hospitalsLoading, addHospital, deleteHospital } = useHospitals();

    const handleAddDistrict = async () => {
        if (!districtName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a district name' });
            return;
        }

        setIsAddingDistrict(true);
        const result = await addDistrict(districtName.trim());
        setIsAddingDistrict(false);

        if (result.success) {
            toast({ title: 'Success', description: `District "${districtName}" added successfully` });
            setDistrictName('');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    const handleAddHospital = async (districtId: string) => {
        const name = newHospitalNames[districtId]?.trim();
        if (!name) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a hospital name' });
            return;
        }

        setAddingHospitalTo(districtId);
        const result = await addHospital({
            district_id: districtId,
            name: name,
            population: 0,
            total_beds: 0,
            occupied_beds: 0,
            ambulances: 0,
            doctors: 0,
            nurses: 0,
        });
        setAddingHospitalTo(null);

        if (result.success) {
            toast({ title: 'Success', description: `Hospital "${name}" added successfully` });
            setNewHospitalNames(prev => ({ ...prev, [districtId]: '' }));
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    const handleDeleteDistrict = async (id: string, name: string) => {
        if (!confirm(`Delete district "${name}"? This will also delete all hospitals in this district.`)) {
            return;
        }

        const result = await deleteDistrict(id);
        if (result.success) {
            toast({ title: 'Success', description: `District "${name}" deleted` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    const handleDeleteHospital = async (id: string, name: string) => {
        if (!confirm(`Delete hospital "${name}"?`)) {
            return;
        }

        const result = await deleteHospital(id);
        if (result.success) {
            toast({ title: 'Success', description: `Hospital "${name}" deleted` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    };

    const getHospitalsByDistrict = (districtId: string) => {
        return hospitals.filter(h => h.district_id === districtId);
    };

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Districts & Hospitals</h1>
                <p className="text-muted-foreground">
                    Step 1: Add districts. Step 2: Add hospitals to those districts. Step 3: Go to the{' '}
                    <span className="text-primary cursor-pointer hover:underline">Hospital Data Entry</span> page to add cases.
                </p>
            </div>

            {/* Add District Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New District</CardTitle>
                    <CardDescription>
                        Enter the name of a new district to start adding hospitals to it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="e.g., Lucknow"
                            value={districtName}
                            onChange={(e) => setDistrictName(e.target.value)}
                            className="max-w-sm bg-muted/30"
                            disabled={isAddingDistrict}
                        />
                        <Button
                            onClick={handleAddDistrict}
                            disabled={isAddingDistrict}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isAddingDistrict ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" /> Add District</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* District Cards */}
            {districtsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading districts...</div>
            ) : districts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No districts added yet. Add your first district above.
                </div>
            ) : (
                <div className="space-y-4">
                    {districts.map(district => {
                        const districtHospitals = getHospitalsByDistrict(district.id);
                        return (
                            <Card key={district.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{district.name}</CardTitle>
                                            <CardDescription>Manage hospitals for this district.</CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDistrict(district.id, district.name)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Existing Hospitals List */}
                                    {districtHospitals.length > 0 ? (
                                        <div className="space-y-2">
                                            {districtHospitals.map(hospital => (
                                                <div
                                                    key={hospital.id}
                                                    className="flex items-center justify-between p-3 rounded-md bg-muted/30 border"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium text-sm">{hospital.name}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteHospital(hospital.id, hospital.name)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic py-2">
                                            No hospitals added for this district yet.
                                        </div>
                                    )}

                                    {/* Add Hospital Input */}
                                    <div className="flex gap-4 pt-2">
                                        <Input
                                            placeholder="New Hospital Name"
                                            value={newHospitalNames[district.id] || ''}
                                            onChange={(e) => setNewHospitalNames(prev => ({ ...prev, [district.id]: e.target.value }))}
                                            className="bg-muted/30"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddHospital(district.id);
                                            }}
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleAddHospital(district.id)}
                                            disabled={addingHospitalTo === district.id}
                                            className="shrink-0"
                                        >
                                            {addingHospitalTo === district.id ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                                            ) : (
                                                <><Plus className="mr-2 h-4 w-4" /> Add Hospital</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Floating Save Button (Visual or Refresh) */}
            <div className="flex justify-end pt-4">
                <Button className="bg-primary hover:bg-primary/90 min-w-[200px]">
                    <Save className="mr-2 h-4 w-4" /> Save All Changes
                </Button>
            </div>
        </div>
    );
}
