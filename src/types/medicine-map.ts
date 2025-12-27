export interface Location {
    latitude: number;
    longitude: number;
    address: string;
}

export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drop' | 'inhaler';

export interface Medicine {
    id: string;
    name: string;
    genericName?: string;
    manufacturer?: string;
    form: MedicineForm;
    strength?: string;
    category: string;
    image?: string;
    requiresPrescription: boolean;
}

export interface Pharmacy {
    id: string;
    name: string;
    location: Location;
    phone: string;
    email?: string;
    licenseNumber?: string;
    isOpen: boolean;
    rating: number;
    reviewCount: number;
    openingHours?: string;
}

export interface PharmacyInventory {
    id: string; // unique inventory item id
    pharmacyId: string;
    medicineId: string;
    quantity: number;
    price: number;
    isAvailable: boolean;
    lastUpdated: Date;
}

// Combined type for search results
export interface MedicineSearchResult extends PharmacyInventory {
    medicine: Medicine;
    pharmacy: Pharmacy;
    distance?: number; // Calculated distance from user
}
