'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/hooks/useLanguage';
import { useInventory } from '@/hooks/useInventory';
import { filterBySearchQuery, sortByRelevance } from '@/lib/search-utils';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(
  () => import('@/components/LeafletMap'),
  {
    loading: () => <div className="h-[450px] w-full flex items-center justify-center bg-muted/10 rounded-xl border border-border/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
    ssr: false
  }
);

const INVENTORY_STORAGE_KEY = 'pharmacistInventory';

type Medicine = {
  id: string;
  name: string;
  quantity: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

type PharmacyResult = {
  id: string;
  name: string;
  address: string;
  stockStatus: 'available' | 'low' | 'not-available';
  latitude?: number;
  longitude?: number;
};


export default function PharmacyStockPage() {
  const t = useTranslations('patient');
  const { t: tCommon } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PharmacyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Use real inventory data from Supabase instead of localStorage
  const { inventory, loading: inventoryLoading } = useInventory();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback to Berhampur, Odisha if location denied
          setUserLocation({ latitude: 19.314962, longitude: 84.794091 });
        }
      );
    }
  }, []);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    // Instant search on existing inventory data
    setTimeout(() => {
      const results: PharmacyResult[] = [];

      // Map inventory items to Medicine format
      const medicinesList = inventory.map(item => ({
        id: item.id,
        name: item.medicine_name,
        quantity: item.quantity,
        supplier: item.pharmacist_name || 'Unknown',
        // Pass through address
        raw_address: item.pharmacist_address || '',
        // Pass through coordinates
        latitude: item.pharmacist_latitude,
        longitude: item.pharmacist_longitude,
        status: item.quantity > 10 ? 'In Stock' as const : item.quantity > 0 ? 'Low Stock' as const : 'Out of Stock' as const
      }));

      // Use language-aware search that works across language variants
      const filteredMedicines = filterBySearchQuery(
        medicinesList,
        searchQuery,
        ['name']
      );

      // Sort by relevance
      const sortedMedicines = sortByRelevance(
        filteredMedicines,
        searchQuery,
        'name'
      );

      // Iterate through matching medicines to build pharmacy results
      sortedMedicines.forEach(medicine => {
        let stockStatus: PharmacyResult['stockStatus'] = 'not-available';
        if (medicine.status === 'In Stock') stockStatus = 'available';
        if (medicine.status === 'Low Stock') stockStatus = 'low';

        // Parse address in "Name || Address" format
        const rawAddress = medicine.raw_address || '';
        const addressParts = rawAddress.split(' || ');

        let pharmacyName = medicine.supplier;
        let pharmacyAddress = rawAddress;

        if (addressParts.length === 2) {
          pharmacyName = addressParts[0];
          pharmacyAddress = addressParts[1];
        } else if (!rawAddress) {
          // Fallback if no address found
          pharmacyName = medicine.supplier;
          pharmacyAddress = 'Location not available';
        }

        results.push({
          id: `pharm-${medicine.id}`,
          name: pharmacyName,
          address: pharmacyAddress,
          stockStatus: stockStatus,
          latitude: medicine.latitude,
          longitude: medicine.longitude
        });
      });

      setSearchResults(results);
      setIsLoading(false);
    }, 300); // Tiny delay for UI feel, but effectively instant

  };

  const getStockVariant = (stock: PharmacyResult['stockStatus']) => {
    switch (stock) {
      case 'available':
        return 'secondary';
      case 'low':
        return 'default';
      case 'not-available':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStockText = (stock: PharmacyResult['stockStatus']) => {
    switch (stock) {
      case 'available':
        return t('inStock');
      case 'low':
        return t('lowStock');
      case 'not-available':
        return t('outOfStock');
      default:
        return 'N/A';
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('pharmacyStock')}</h1>
        <p className="text-muted-foreground">
          {t('findPharmaciesWithMedicine')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('searchForMedicine')}</CardTitle>
          <CardDescription>{t('enterMedicineName')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder={t('medicineNamePlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? tCommon('common.loading') : <><Search className="mr-2 h-4 w-4" /> {tCommon('common.search')}</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>{tCommon('common.searchResultsFor', { query: searchQuery })}</CardTitle>
            <CardDescription>
              {searchResults.length > 0
                ? t('pharmaciesWithStock')
                : tCommon('common.noResultsFound', { query: searchQuery })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>{tCommon('common.loading')}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                {/* Leaflet/OpenStreetMap Integration */}
                <div className="mb-6 rounded-xl overflow-hidden border border-border/50 shadow-lg bg-card relative group">
                  <div className="absolute top-4 right-4 z-[500] bg-background/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-border/50 opacity-100">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-500" /> Live Inventory Map
                    </p>
                  </div>

                  <LeafletMap
                    className="h-[450px] w-full"
                    center={userLocation || { latitude: 19.314962, longitude: 84.794091 }}
                    userLocation={userLocation}
                    locations={searchResults.map((result, index) => ({
                      id: result.id,
                      latitude: result.latitude || (19.314962 + (Math.random() * 0.02 - 0.01)),
                      longitude: result.longitude || (84.794091 + (Math.random() * 0.02 - 0.01)),
                      title: result.name,
                      description: result.address,
                      type: 'pharmacy'
                    }))}
                  />

                  <div className="bg-card p-4 border-t border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg text-foreground">{searchResults[0].name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{searchResults[0].address}</p>
                          </div>
                          <Badge variant={getStockVariant(searchResults[0].stockStatus)} className="ml-2">
                            {getStockText(searchResults[0].stockStatus)}
                          </Badge>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Button
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all"
                            size="sm"
                            onClick={() => {
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchResults[0].address)}`,
                                '_blank'
                              );
                            }}
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            {tCommon('common.view')} Directions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Results Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pharmacyName')}</TableHead>
                      <TableHead>{t('stockStatus')}</TableHead>
                      <TableHead>{t('address')}</TableHead>
                      <TableHead className="text-right">{tCommon('common.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.name}</TableCell>
                        <TableCell>
                          <Badge variant={getStockVariant(result.stockStatus)}>
                            {result.stockStatus !== 'not-available' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {getStockText(result.stockStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>{result.address}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(result.address)}`, '_blank')}
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            {tCommon('common.view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">{tCommon('common.noResultsFound', { query: searchQuery })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
