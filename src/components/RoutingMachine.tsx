'use client';

import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';

interface RoutingMachineProps {
    userLocation: [number, number];
    destination: [number, number];
    color?: string;
}

const createRoutineMachineLayer = (props: RoutingMachineProps) => {
    const instance = L.Routing.control({
        waypoints: [
            L.latLng(props.userLocation[0], props.userLocation[1]),
            L.latLng(props.destination[0], props.destination[1])
        ],
        lineOptions: {
            styles: [{ color: props.color || '#0078D4', opacity: 0.8, weight: 6, className: 'animate-pulse' }], // Blue light effect
            extendToWaypoints: true,
            missingRouteTolerance: 10
        },
        show: false, // Hide the turn-by-turn instructions text box
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        containerClassName: 'hidden', // Ensure container is hidden
    });

    return instance;
};

const RoutingMachine: any = createControlComponent(createRoutineMachineLayer as any);

export default RoutingMachine;
