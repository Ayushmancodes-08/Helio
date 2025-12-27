import { Medicine, Pharmacy, PharmacyInventory, MedicineSearchResult } from '@/types/medicine-map';

export const MOCK_MEDICINES: Medicine[] = [
    {
        id: 'med_1',
        name: 'Dolo 650',
        genericName: 'Paracetamol',
        manufacturer: 'Micro Labs Ltd',
        form: 'tablet',
        strength: '650mg',
        category: 'Pain Relief',
        requiresPrescription: false,
    },
    {
        id: 'med_2',
        name: 'Azithral 500',
        genericName: 'Azithromycin',
        manufacturer: 'Alembic Pharmaceuticals',
        form: 'tablet',
        strength: '500mg',
        category: 'Antibiotics',
        requiresPrescription: true,
    },
    {
        id: 'med_3',
        name: 'Ascoril LS',
        genericName: 'Levosalbutamol + Ambroxol + Guaiphenesin',
        manufacturer: 'Glenmark',
        form: 'syrup',
        category: 'Cough',
        requiresPrescription: true,
    },
    {
        id: 'med_4',
        name: 'Pan D',
        genericName: 'Pantoprazole + Domperidone',
        manufacturer: 'Alkem Laboratories',
        form: 'capsule',
        category: 'Acidity',
        requiresPrescription: true,
    },
    {
        id: 'med_5',
        name: 'Volini',
        genericName: 'Diclofenac',
        manufacturer: 'Sun Pharma',
        form: 'cream',
        category: 'Pain Relief',
        requiresPrescription: false,
    },
];

export const MOCK_PHARMACIES: Pharmacy[] = [
    {
        id: 'pharm_1',
        name: 'Apollo Pharmacy',
        location: {
            latitude: 12.9716, // Example: Bangalore Central
            longitude: 77.5946,
            address: 'MG Road, Bangalore',
        },
        phone: '+91 9876543210',
        isOpen: true,
        rating: 4.5,
        reviewCount: 128,
        openingHours: '24 Hours',
    },
    {
        id: 'pharm_2',
        name: 'MedPlus',
        location: {
            latitude: 12.9784,
            longitude: 77.6408, // Example: Indiranagar
            address: 'Indiranagar, Bangalore',
        },
        phone: '+91 9876543211',
        isOpen: true,
        rating: 4.2,
        reviewCount: 95,
        openingHours: '8:00 AM - 11:00 PM',
    },
    {
        id: 'pharm_3',
        name: 'Wellness Forever',
        location: {
            latitude: 12.9352,
            longitude: 77.6245, // Example: Koramangala
            address: 'Koramangala, Bangalore',
        },
        phone: '+91 9876543212',
        isOpen: false,
        rating: 4.8,
        reviewCount: 204,
        openingHours: '24 Hours',
    },
];

// Helper to generate mock inventory
export const generateMockInventory = (): MedicineSearchResult[] => {
    const inventory: MedicineSearchResult[] = [];

    MOCK_PHARMACIES.forEach((pharmacy) => {
        MOCK_MEDICINES.forEach((medicine) => {
            // Randomly decide if pharmacy has medicine
            if (Math.random() > 0.3) {
                inventory.push({
                    id: `inv_${pharmacy.id}_${medicine.id}`,
                    pharmacyId: pharmacy.id,
                    medicineId: medicine.id,
                    quantity: Math.floor(Math.random() * 50) + 1,
                    price: Math.floor(Math.random() * 500) + 10,
                    isAvailable: true,
                    lastUpdated: new Date(),
                    medicine: medicine,
                    pharmacy: pharmacy,
                });
            }
        });
    });

    return inventory;
};

export const MOCK_INVENTORY = generateMockInventory();
