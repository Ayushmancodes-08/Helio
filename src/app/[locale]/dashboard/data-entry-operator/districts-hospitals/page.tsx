'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Trash2, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';
import { useLanguage } from '@/hooks/useLanguage';

export default function DistrictsHospitalsPage() {
    const [districtName, setDistrictName] = useState('');
    const [newHospitalNames, setNewHospitalNames] = useState<Record<string, string>>({});
    const [isAddingDistrict, setIsAddingDistrict] = useState(false);
    const [addingHospitalTo, setAddingHospitalTo] = useState<string | null>(null);

    const { toast } = useToast();
    const { t } = useLanguage();
    const { districts, loading: districtsLoading, addDistrict, deleteDistrict } = useDistricts();
    const { hospitals, loading: hospitalsLoading, addHospital, deleteHospital } = useHospitals();

    const handleAddDistrict = async () => {
        if (!districtName.trim()) {
            toast({ variant: 'destructive', title: t('common.error'), description: t('dataEntryOperator.pleaseEnterDistrictName') });
            return;
        }

        setIsAddingDistrict(true);
        const result = await addDistrict(districtName.trim());
        setIsAddingDistrict(false);

        if (result.success) {
            toast({ title: t('common.success'), description: t('dataEntryOperator.districtAddedSuccessfully', { name: districtName }) });
            setDistrictName('');
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.error });
        }
    };

    const handleAddHospital = async (districtId: string) => {
        const name = newHospitalNames[districtId]?.trim();
        if (!name) {
            toast({ variant: 'destructive', title: t('common.error'), description: t('dataEntryOperator.pleaseEnterHospitalName') });
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
            toast({ title: t('common.success'), description: t('dataEntryOperator.hospitalAddedSuccessfully', { name }) });
            setNewHospitalNames(prev => ({ ...prev, [districtId]: '' }));
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.error });
        }
    };

    const handleDeleteDistrict = async (id: string, name: string) => {
        if (!confirm(t('dataEntryOperator.deleteDistrictConfirm', { name }))) {
            return;
        }

        const result = await deleteDistrict(id);
        if (result.success) {
            toast({ title: t('common.success'), description: t('dataEntryOperator.districtDeleted', { name }) });
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.error });
        }
    };

    const handleDeleteHospital = async (id: string, name: string) => {
        if (!confirm(t('dataEntryOperator.deleteHospitalConfirm', { name }))) {
            return;
        }

        const result = await deleteHospital(id);
        if (result.success) {
            toast({ title: t('common.success'), description: t('dataEntryOperator.hospitalDeleted', { name }) });
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.error });
        }
    };

    const getHospitalsByDistrict = (districtId: string) => {
        return hospitals.filter(h => h.district_id === districtId);
    };

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="font-headline text-3xl font-bold">{t('dataEntryOperator.manageDistrictsHospitals')}</h1>
                <p className="text-muted-foreground">
                    {t('dataEntryOperator.step1AddDistricts')}{' '}
                    <span className="text-primary cursor-pointer hover:underline">{t('dataEntryOperator.hospitalDataEntry')}</span> {t('dataEntryOperator.pageToAddCases')}
                </p>
            </div>

            {/* Add District Section */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dataEntryOperator.addNewDistrict')}</CardTitle>
                    <CardDescription>
                        {t('dataEntryOperator.enterDistrictName')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder={t('dataEntryOperator.districtNamePlaceholder')}
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
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dataEntryOperator.adding')}</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" /> {t('dataEntryOperator.addDistrict')}</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* District Cards */}
            {districtsLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('dataEntryOperator.loadingDistricts')}</div>
            ) : districts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {t('dataEntryOperator.noDistrictsYet')}
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
                                            <CardDescription>{t('dataEntryOperator.manageHospitalsForDistrict')}</CardDescription>
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
                                            {t('dataEntryOperator.noHospitalsForDistrict')}
                                        </div>
                                    )}

                                    {/* Add Hospital Input */}
                                    <div className="flex gap-4 pt-2">
                                        <Input
                                            placeholder={t('dataEntryOperator.newHospitalName')}
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
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dataEntryOperator.adding')}</>
                                            ) : (
                                                <><Plus className="mr-2 h-4 w-4" /> {t('dataEntryOperator.addHospital')}</>
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
                    <Save className="mr-2 h-4 w-4" /> {t('dataEntryOperator.saveAllChanges')}
                </Button>
            </div>
        </div>
    );
}
