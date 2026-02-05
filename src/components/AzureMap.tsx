'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import 'azure-maps-control/dist/atlas.min.css';

interface AzureMapProps {
    locations?: {
        latitude: number;
        longitude: number;
        title?: string;
        description?: string;
    }[];
    center?: {
        latitude: number;
        longitude: number;
    };
    zoom?: number;
    className?: string;
}

export default function AzureMap({ locations = [], center, zoom = 13, className }: AzureMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        // Dynamic import to avoid SSR issues with window/document
        import('azure-maps-control').then((atlas) => {
            const apiKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;

            if (!apiKey) {
                setError('Azure Maps API Key is missing');
                return;
            }

            if (mapInstanceRef.current || !mapRef.current) return;

            try {
                const map = new atlas.Map(mapRef.current, {
                    center: center ? [center.longitude, center.latitude] : undefined,
                    zoom: zoom,
                    language: 'en-US',
                    authOptions: {
                        authType: atlas.AuthenticationType.subscriptionKey,
                        subscriptionKey: apiKey
                    }
                });

                map.events.add('ready', () => {
                    setIsLoaded(true);
                    mapInstanceRef.current = map;

                    // Add controls
                    map.controls.add([
                        new atlas.control.ZoomControl(),
                        new atlas.control.CompassControl(),
                        new atlas.control.PitchControl(),
                        new atlas.control.StyleControl()
                    ], {
                        position: atlas.ControlPosition.TopRight
                    });

                    updatePins(map, atlas, locations);
                });

            } catch (err) {
                console.error("Error initializing Azure Map:", err);
                setError("Failed to load map");
            }
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.dispose();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update effect
    useEffect(() => {
        if (isLoaded && mapInstanceRef.current) {
            import('azure-maps-control').then((atlas) => {
                const map = mapInstanceRef.current;
                if (center) {
                    map.setCamera({
                        center: [center.longitude, center.latitude],
                        zoom: zoom,
                        type: 'fly'
                    });
                }
                updatePins(map, atlas, locations);
            });
        }
    }, [locations, center, zoom, isLoaded]);

    const updatePins = (map: any, atlas: any, locs: any[]) => {
        map.events.add('ready', () => { // Ensure standard datasource logic });
            // Clear existing data logic would go here, simplified using data source
            const dataSource = new atlas.source.DataSource();
            map.sources.add(dataSource);

            locs.forEach(loc => {
                const point = new atlas.data.Point([loc.longitude, loc.latitude]);
                const feature = new atlas.data.Feature(point, {
                    title: loc.title,
                    description: loc.description
                });
                dataSource.add(feature);
            });

            const symbolLayer = new atlas.layer.SymbolLayer(dataSource, null, {
                iconOptions: {
                    image: 'pin-blue',
                    anchor: 'center',
                    allowOverlap: true
                },
                textOptions: {
                    textField: ['get', 'title'],
                    offset: [0, 1.2]
                }
            });
            map.layers.add(symbolLayer);

            // Add popups
            const popup = new atlas.Popup({
                pixelOffset: [0, -20],
                closeButton: false
            });

            map.events.add('mouseover', symbolLayer, (e: any) => {
                if (e.shapes && e.shapes.length > 0) {
                    const content = `<div style="padding:10px;font-weight:bold">${e.shapes[0].getProperties().title}</div>
                               <div style="padding:0 10px 10px 10px">${e.shapes[0].getProperties().description || ''}</div>`;
                    popup.setOptions({
                        content: content,
                        position: e.shapes[0].getCoordinates()
                    });
                    popup.open(map);
                }
            });
        };

        if (error) {
            return (
                <div className={`flex items-center justify-center bg-muted/20 border rounded-lg ${className}`}>
                    <p className="text-destructive text-sm">{error}</p>
                </div>
            );
        }

        return (
            <div className={`relative ${className}`}>
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/10 z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden shadow-sm" />
            </div>
        );
    }
