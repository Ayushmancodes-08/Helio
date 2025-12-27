'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MedicineSearchResult } from '@/types/medicine-map';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in Next.js
// The compatibility package handles most, but explicit icon definitions can help custom markers

interface MapProps {
    center?: [number, number];
    zoom?: number;
    results: MedicineSearchResult[];
    userLocation: [number, number] | null;
    onMarkerClick?: (pharmacyId: string) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center);
    return null;
}

export default function MedicineMap({
    center = [12.9716, 77.5946], // Default Bangalore
    zoom = 13,
    results,
    userLocation,
    onMarkerClick
}: MapProps) {
    const [activeCenter, setActiveCenter] = useState<[number, number]>(center);

    useEffect(() => {
        if (userLocation) {
            setActiveCenter(userLocation);
        }
    }, [userLocation]);

    return (
        <MapContainer
            center={activeCenter}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full rounded-xl z-0"
        >
            <ChangeView center={activeCenter} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })}
                >
                    <Popup>
                        <div className="text-sm font-semibold">You are here</div>
                    </Popup>
                </Marker>
            )}

            {/* Pharmacy Markers */}
            {results.map((result) => (
                <Marker
                    key={result.id}
                    position={[result.pharmacy.location.latitude, result.pharmacy.location.longitude]}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(result.pharmacy.id),
                    }}
                    icon={new L.Icon({
                        iconUrl: result.isAvailable
                            ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-green.png'
                            : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })}
                >
                    <Popup className="w-64">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-bold text-base">{result.pharmacy.name}</h3>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5" />
                                <span>{result.pharmacy.location.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Phone className="h-3 w-3" />
                                <span>{result.pharmacy.phone}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <Badge variant={result.isAvailable ? "default" : "destructive"}>
                                    {result.isAvailable ? `In Stock: ${result.quantity}` : "Out of Stock"}
                                </Badge>
                            </div>
                            {result.pharmacy.isOpen && (
                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <Clock className="h-3 w-3" /> Open Now
                                </div>
                            )}
                            <Button size="sm" className="w-full mt-2 h-8" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${result.pharmacy.location.latitude},${result.pharmacy.location.longitude}`, '_blank')}>
                                <Navigation className="h-3 w-3 mr-1" /> Directions
                            </Button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
