'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MedicineSearch } from '@/components/map/MedicineSearch';
import { MOCK_INVENTORY, MOCK_PHARMACIES } from '@/mocks/medicine-map-data';
import { Medicine, MedicineSearchResult } from '@/types/medicine-map';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';

// Dynamically import Map to avoid SSR issues with Leaflet
const MedicineMap = dynamic(
    () => import('@/components/map/MedicineMap'),
    {
        loading: () => <div className="h-full w-full flex items-center justify-center bg-muted/20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
        ssr: false
    }
);

export default function FindMedicinePage() {
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // In a real app, we would fetch this from an API based on search
    const mapResults = useMemo(() => {
        if (!selectedMedicine) {
            // If no medicine selected, maybe show all pharmacies? 
            // Or show empty state. Let's show all pharmacies for now but without stock info (or just pharmacies)
            // Actually, let's just return empty arrays or generic pharmacy markers if needed.
            // For this demo, let's show nothing until searched.
            return [];
        }

        return MOCK_INVENTORY.filter(item => item.medicineId === selectedMedicine.id);
    }, [selectedMedicine]);

    // Get User Location on mount
    useState(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location", error);
                    // Default to Bangalore if denied
                    setUserLocation([12.9716, 77.5946]);
                }
            );
        }
    });

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
            {/* Search Overlay */}
            <div className="absolute top-4 left-0 right-0 z-10 px-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <MedicineSearch onSearch={setSelectedMedicine} />
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full bg-slate-100 relative">
                <MedicineMap
                    results={mapResults}
                    userLocation={userLocation}
                    zoom={12}
                />

                {/* Helper Text / Start State */}
                {!selectedMedicine && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-0 bg-background/80 backdrop-blur-sm p-4 rounded-xl shadow-sm text-center max-w-sm pointer-events-none">
                        <div className="flex justify-center mb-2">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg">Find Medicines Nearby</h3>
                        <p className="text-sm text-muted-foreground">
                            Search for a medicine above to see which local pharmacies have it in stock.
                        </p>
                    </div>
                )}
            </div>

            {/* Results List (Mobile / Desktop Split View could be added here) */}
            {/* For now, the map markers have popups, which is sufficient for MVP */}
        </div>
    );
}
