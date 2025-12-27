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
import { useLanguage } from '@/hooks/useLanguage';
import { filterBySearchQuery, sortByRelevance } from '@/lib/search-utils';

const PHARMACY_LOCATION_KEY = 'pharmacistLocation';
const INVENTORY_STORAGE_KEY = 'pharmacistInventory';

type Medicine = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    supplier: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

type PharmacyResult = {
  id: string;
  name: string;
  address: string;
  stockStatus: 'available' | 'low' | 'not-available';
};


export default function PharmacyStockPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PharmacyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [inventory, setInventory] = useState<Medicine[]>([]);
  const [pharmacyLocation, setPharmacyLocation] = useState<{name: string, address: string} | null>(null);

  useEffect(() => {
    try {
        const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (storedInventory) {
            setInventory(JSON.parse(storedInventory));
        }
        const storedLocation = localStorage.getItem(PHARMACY_LOCATION_KEY);
        if (storedLocation) {
            setPharmacyLocation(JSON.parse(storedLocation));
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !pharmacyLocation) return;

    setIsLoading(true);
    setHasSearched(true);
    
    // Simulate API call with language-aware search
    setTimeout(() => {
        const results: PharmacyResult[] = [];
        
        // Use language-aware search that works across language variants
        const filteredMedicines = filterBySearchQuery(
          inventory,
          searchQuery,
          ['name']
        );
        
        // Sort by relevance
        const sortedMedicines = sortByRelevance(
          filteredMedicines,
          searchQuery,
          'name'
        );
        
        if (sortedMedicines.length > 0) {
            const medicine = sortedMedicines[0];
            let stockStatus: PharmacyResult['stockStatus'] = 'not-available';
            if (medicine.status === 'In Stock') stockStatus = 'available';
            if (medicine.status === 'Low Stock') stockStatus = 'low';

            results.push({
                id: 'pharm-1',
                name: pharmacyLocation.name,
                address: pharmacyLocation.address,
                stockStatus: stockStatus,
            });
        }

        setSearchResults(results);
        setIsLoading(false);
    }, 1000);
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
        return t('dashboard.pharmacist.inStock');
      case 'low':
        return t('dashboard.pharmacist.lowStock');
      case 'not-available':
        return t('dashboard.pharmacist.outOfStock');
      default:
        return 'N/A';
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('dashboard.pharmacist.pharmacyLocation')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.pharmacist.enterPreciseAddressForDeliveryLogistics')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.pharmacist.searchForMedicine')}</CardTitle>
          <CardDescription>{t('dashboard.pharmacist.enterMedicineNameToAddOrUpdate')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder={t('dashboard.pharmacist.medicineNamePlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !pharmacyLocation}>
              {isLoading ? t('common.loading') : <><Search className="mr-2 h-4 w-4" /> {t('common.search')}</>}
            </Button>
          </form>
           {!pharmacyLocation?.address && <p className="mt-4 text-sm text-destructive">{t('dashboard.pharmacist.couldNotSavePharmacyDetails')}</p>}
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>{t('common.searchResultsFor', { query: searchQuery })}</CardTitle>
            <CardDescription>
              {searchResults.length > 0
                ? t('dashboard.pharmacist.searchForMedicine')
                : t('common.noResultsFound', { query: searchQuery })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>{t('common.loading')}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.pharmacist.pharmacyName')}</TableHead>
                    <TableHead>{t('common.filter')}</TableHead>
                    <TableHead>{t('dashboard.pharmacist.fullAddress')}</TableHead>
                    <TableHead className="text-right">{t('common.action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.name}</TableCell>
                       <TableCell>
                         <Badge variant={getStockVariant(result.stockStatus)}>
                           {result.stockStatus !== 'not-available' && <CheckCircle2 className="mr-1 h-3 w-3"/>}
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
                          {t('common.view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <div className="text-center py-10">
                 <p className="text-muted-foreground">{t('common.noResultsFound', { query: searchQuery })}</p>
               </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
