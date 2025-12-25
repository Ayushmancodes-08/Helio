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
    
    // Simulate API call
    setTimeout(() => {
        const results: PharmacyResult[] = [];
        const medicine = inventory.find(m => m.name.toLowerCase() === searchQuery.trim().toLowerCase());
        
        if (medicine) {
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
        return 'In Stock';
      case 'low':
        return 'Low Stock';
      case 'not-available':
        return 'Out of Stock';
      default:
        return 'N/A';
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Pharmacy Stock Checker</h1>
        <p className="text-muted-foreground">
          Find out which local pharmacies have your medicines in stock.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search for a Medicine</CardTitle>
          <CardDescription>Enter the name of the medicine you are looking for.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., Paracetamol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !pharmacyLocation}>
              {isLoading ? 'Searching...' : <><Search className="mr-2 h-4 w-4" /> Search</>}
            </Button>
          </form>
           {!pharmacyLocation?.address && <p className="mt-4 text-sm text-destructive">The pharmacy has not set their location yet. Please check back later.</p>}
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results for &quot;{searchQuery}&quot;</CardTitle>
            <CardDescription>
              {searchResults.length > 0
                ? `Found in ${searchResults.length} nearby ${searchResults.length === 1 ? 'pharmacy' : 'pharmacies'}.`
                : 'No pharmacies found with this medicine.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading results...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacy Name</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Action</TableHead>
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
                          Get Directions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <div className="text-center py-10">
                 <p className="text-muted-foreground">This medicine is not in stock at the registered pharmacy, or the pharmacy has not listed it. Try another medicine or check back later.</p>
               </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
