'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoutingMachine from './RoutingMachine';

interface Location {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
    type?: 'pharmacy' | 'hospital' | 'user';
}

interface LeafletMapProps {
    center: { latitude: number; longitude: number };
    zoom?: number;
    locations: Location[];
    className?: string;
    userLocation?: { latitude: number; longitude: number };
    onLocationSelect?: (lat: number, lng: number) => void;
    interactive?: boolean;
}

// Helper to update view when center changes
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center);
    return null;
}

// Helper for handling map clicks
function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LeafletMap({ center, zoom = 13, locations, className, userLocation, onLocationSelect, interactive = false }: LeafletMapProps) {
    const [mounted, setMounted] = useState(false);
    const [activeDestination, setActiveDestination] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Auto-select the first result as destination if available and no specific destination selected
        if (!activeDestination && locations.length > 0) {
            setActiveDestination({ latitude: locations[0].latitude, longitude: locations[0].longitude });
        }
    }, [locations, activeDestination]);

    if (!mounted) {
        return (
            <div className={`flex items-center justify-center bg-muted/20 border rounded-lg ${className}`}>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Custom Icon Factory to avoid "marker-icon-2x.png" 404 issues and add style
    const getIcon = (type: string = 'default') => {
        return new L.Icon({
            iconUrl: type === 'user'
                ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-blue.png'
                : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    };

    return (
        <div className={`relative overflow-hidden rounded-xl border border-border/50 shadow-lg ${className}`}>
            <MapContainer
                center={[center.latitude, center.longitude]}
                zoom={zoom}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
            >
                <ChangeView center={[center.latitude, center.longitude]} />

                {/* Wonderclass Aesthetics: CartoDB Voyager Tiles (Free, Premium Look) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Handle Picking Location */}
                {onLocationSelect && <LocationPicker onSelect={onLocationSelect} />}

                {/* User Location Marker with Pulsating Effect */}
                {userLocation && (
                    <Marker
                        position={[userLocation.latitude, userLocation.longitude]}
                        icon={getIcon('user')}
                    >
                        <Popup className="bg-card text-card-foreground border border-primary/20 rounded-lg shadow-xl">
                            <div className="font-semibold text-sm">Your Location</div>
                        </Popup>
                    </Marker>
                )}

                {/* Routing: Glowing Blue Path */}
                {userLocation && activeDestination && !interactive && (
                    <RoutingMachine
                        userLocation={[userLocation.latitude, userLocation.longitude]}
                        destination={[activeDestination.latitude, activeDestination.longitude]}
                        color="#3b82f6" // Tailwind Blue-500
                    />
                )}

                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        icon={getIcon(loc.type)}
                        eventHandlers={{
                            click: () => setActiveDestination({ latitude: loc.latitude, longitude: loc.longitude })
                        }}
                    >
                        <Popup className="min-w-[200px] bg-card text-card-foreground border border-border rounded-lg shadow-xl">
                            <div className="p-1">
                                <h3 className="font-bold text-sm mb-1 text-foreground">{loc.title}</h3>
                                {loc.description && <p className="text-xs text-muted-foreground mb-2">{loc.description}</p>}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-7 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`, '_blank')}
                                >
                                    <Navigation className="h-3 w-3 mr-1" /> Get Directions
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay attribution/badge */}
            <div className="absolute bottom-1 left-1 z-[1000] bg-background/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-muted-foreground border shadow-sm">
                data © OpenStreetMap contributors, © CARTO
            </div>
        </div>
    );
}
