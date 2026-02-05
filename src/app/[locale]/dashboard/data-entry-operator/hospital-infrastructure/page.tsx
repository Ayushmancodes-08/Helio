'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDistricts, useHospitals } from '@/hooks/useHealthData';
import { Loader2, Save, Hospital, Ambulance, Users, Activity, Bed, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';



// Icons mapping for visual appeal
const MetricIcon = ({ type, className }: { type: string, className?: string }) => {
    const icons = {
        population: Users,
        beds: Bed,
        ambulances: Ambulance,
        doctors: Activity,
        nurses: Users,
    };
    const Icon = icons[type as keyof typeof icons] || Users;
    return <Icon className={className} />;
};

const HospitalAccordion = ({ hospital, handleInputChange }: { hospital: any, handleInputChange: any }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Auto-open if it's the only hospital, or just default closed to keep clean as per screenshot
    // Screenshot shows distinct cards. Let's make the hospital name a header.

    return (
        <div className="border rounded-lg bg-card text-card-foreground shadow-sm mb-4 overflow-hidden">
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        {hospital.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        District-wide resource totals. Expand to edit individual hospitals.
                    </p>
                </div>
                <Button variant="ghost" size="icon">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
            </div>

            {isOpen && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Population Served</label>
                            <Input
                                type="number"
                                value={hospital.population}
                                onChange={(e) => handleInputChange(hospital.id, 'population', e.target.value)}
                                className="bg-blue-50/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all h-12"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Occupied Beds</label>
                            <Input
                                type="number"
                                value={hospital.occupied_beds}
                                onChange={(e) => handleInputChange(hospital.id, 'occupied_beds', e.target.value)}
                                className="bg-blue-50/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all h-12"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Total Beds</label>
                            <Input
                                type="number"
                                value={hospital.total_beds}
                                onChange={(e) => handleInputChange(hospital.id, 'total_beds', e.target.value)}
                                className="bg-blue-50/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all h-12"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Ambulances</label>
                            <Input
                                type="number"
                                value={hospital.ambulances}
                                onChange={(e) => handleInputChange(hospital.id, 'ambulances', e.target.value)}
                                className="bg-blue-50/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all h-12"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Doctors</label>
                            <Input
                                type="number"
                                value={hospital.doctors}
                                onChange={(e) => handleInputChange(hospital.id, 'doctors', e.target.value)}
                                className="bg-blue-50/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all h-12"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Nurses</label>
                            <Input
                                type="number"
                                value={hospital.nurses}
                                onChange={(e) => handleInputChange(hospital.id, 'nurses', e.target.value)}
                                className="bg-blue-50/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all h-12"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function HospitalInfrastructurePage() {
    const [localHospitals, setLocalHospitals] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const { toast } = useToast();
    const { t } = useLanguage();
    const { districts, loading: districtsLoading } = useDistricts();
    const { hospitals, loading: hospitalsLoading, updateHospital } = useHospitals();

    // Initialize local state when hospitals load
    useEffect(() => {
        if (hospitals.length > 0 && localHospitals.length === 0) {
            setLocalHospitals(JSON.parse(JSON.stringify(hospitals)));
        } else if (hospitals.length > 0 && !hasChanges) {
            // If no changes yet, keep safely syncing strictly new additions if any, 
            // but simpler to just set if we assume no background updates. 
            // Actually, to assume user inputs are preserved, we only set if empty.
            // But if we want to reset on successful save, we'll handle that there.
        }
    }, [hospitals]);

    const handleInputChange = (id: string, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setLocalHospitals(prev => prev.map(h =>
            h.id === id ? { ...h, [field]: numValue } : h
        ));
        setHasChanges(true);
    };

    const handleSaveAll = async () => {
        if (!hasChanges) {
            toast({
                description: 'No changes to save.',
            });
            return;
        }

        setIsSaving(true);
        let errorCount = 0;
        let successCount = 0;
        const errors: string[] = [];

        // Identify changed hospitals
        const changedHospitals = localHospitals.filter(localH => {
            const original = hospitals.find(h => h.id === localH.id);
            if (!original) return true;
            return JSON.stringify({
                population: localH.population,
                total_beds: localH.total_beds,
                occupied_beds: localH.occupied_beds,
                ambulances: localH.ambulances,
                doctors: localH.doctors,
                nurses: localH.nurses
            }) !== JSON.stringify({
                population: original.population,
                total_beds: original.total_beds,
                occupied_beds: original.occupied_beds,
                ambulances: original.ambulances,
                doctors: original.doctors,
                nurses: original.nurses
            });
        });

        console.log('[Hospital Infrastructure] Changed hospitals:', changedHospitals.length);

        if (changedHospitals.length === 0) {
            setIsSaving(false);
            toast({
                description: 'No changes detected.',
            });
            return;
        }

        // Parallel execution
        const promises = changedHospitals.map(h =>
            updateHospital(h.id, {
                population: h.population,
                total_beds: h.total_beds,
                occupied_beds: h.occupied_beds,
                ambulances: h.ambulances,
                doctors: h.doctors,
                nurses: h.nurses,
            }).then(res => {
                if (res.success) {
                    successCount++;
                    console.log(`[Hospital Infrastructure] Updated ${h.name} successfully`);
                } else {
                    errorCount++;
                    errors.push(`${h.name}: ${res.error}`);
                    console.error(`[Hospital Infrastructure] Failed to update ${h.name}:`, res.error);
                }
                return res;
            }).catch(err => {
                errorCount++;
                errors.push(`${h.name}: ${err.message}`);
                console.error(`[Hospital Infrastructure] Error updating ${h.name}:`, err);
            })
        );

        await Promise.all(promises);

        setIsSaving(false);

        if (errorCount === 0 && successCount > 0) {
            toast({
                title: 'Success!',
                description: `Updated ${successCount} hospital${successCount !== 1 ? 's' : ''}. Dashboard will update in a moment.`,
            });
            setHasChanges(false);
            
            // Dispatch event to trigger dashboard refresh
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('hospital-data-updated'));
                console.log('[Hospital Infrastructure] Dispatched hospital-data-updated event');
            }, 1000);
        } else if (errorCount > 0) {
            toast({
                variant: 'destructive',
                title: 'Update Issues',
                description: `Updated ${successCount}, failed ${errorCount}.`,
            });
            if (errors.length > 0) {
                console.error('[Hospital Infrastructure] Errors:', errors);
            }
        }
    };

    const getDistrictTotals = (districtId: string) => {
        const districtHospitals = localHospitals.filter(h => h.district_id === districtId);
        return {
            population: districtHospitals.reduce((sum, h) => sum + (h.population || 0), 0),
            total_beds: districtHospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0),
            occupied_beds: districtHospitals.reduce((sum, h) => sum + (h.occupied_beds || 0), 0),
            ambulances: districtHospitals.reduce((sum, h) => sum + (h.ambulances || 0), 0),
            doctors: districtHospitals.reduce((sum, h) => sum + (h.doctors || 0), 0),
            nurses: districtHospitals.reduce((sum, h) => sum + (h.nurses || 0), 0),
        };
    };

    if (districtsLoading || hospitalsLoading && localHospitals.length === 0) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="font-headline text-3xl font-bold">{t('dataEntryOperator.manageHospitalInfrastructure')}</h1>
                <p className="text-muted-foreground">
                    {t('dataEntryOperator.updateInfrastructure')}
                </p>
            </div>

            {districts.map(district => {
                const totals = getDistrictTotals(district.id);
                const districtHospitals = localHospitals.filter(h => h.district_id === district.id);

                if (districtHospitals.length === 0) return null;

                return (
                    <div key={district.id} className="space-y-4">
                        {/* District Header & Totals */}
                        <div className="pb-2">
                            <h2 className="text-xl font-bold">{district.name}</h2>
                            <p className="text-sm text-muted-foreground">District-wide resource totals. Expand to edit individual hospitals.</p>
                        </div>

                        {/* Totals Cards Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { label: t('dataEntryOperator.population'), value: totals.population, icon: Users },
                                { label: t('dataEntryOperator.occupiedBeds'), value: totals.occupied_beds, icon: Bed },
                                { label: t('dataEntryOperator.totalBeds'), value: totals.total_beds, icon: Bed },
                                { label: t('dataEntryOperator.ambulances'), value: totals.ambulances, icon: Ambulance },
                                { label: t('dataEntryOperator.doctors'), value: totals.doctors, icon: Activity },
                                { label: t('dataEntryOperator.nurses'), value: totals.nurses, icon: Users },
                            ].map((stat, i) => (
                                <Card key={i} className="bg-white border shadow-sm hover:shadow-md transition-all">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <stat.icon className="h-6 w-6 mb-3 text-blue-600" />
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</div>
                                        <div className="text-lg font-bold mt-1">{stat.value.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Hospitals List */}
                        <div className="space-y-4">
                            {districtHospitals.map((hospital) => (
                                <HospitalAccordion
                                    key={hospital.id}
                                    hospital={hospital}
                                    handleInputChange={handleInputChange}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}


            {
                hasChanges && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
                        <Button
                            size="lg"
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="shadow-xl"
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.saving')}...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> {t('dataEntryOperator.saveAllChanges')}</>
                            )}
                        </Button>
                    </div>
                )
            }
        </div >
    );
}
