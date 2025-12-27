'use client';

import { useEffect, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { MOCK_MEDICINES } from '@/mocks/medicine-map-data';
import { Medicine } from '@/types/medicine-map';
import { cn } from '@/lib/utils';

interface MedicineSearchProps {
    onSearch: (medicine: Medicine | null) => void;
    className?: string;
}

export function MedicineSearch({ onSearch, className }: MedicineSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<Medicine[]>([]);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery.length > 2) {
            // Create mock search logic here (later replace with real API)
            const filtered = MOCK_MEDICINES.filter(med =>
                med.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                med.genericName?.toLowerCase().includes(debouncedQuery.toLowerCase())
            );
            setResults(filtered);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [debouncedQuery]);

    const handleSelect = (medicine: Medicine) => {
        setQuery(medicine.name);
        setIsOpen(false);
        onSearch(medicine);
    };

    return (
        <div className={cn("relative w-full max-w-xl mx-auto z-20", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for medicines (e.g., Dolo, Paracetamol)..."
                    className="pl-10 h-12 text-lg shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/20 focus-visible:ring-primary/50 rounded-full"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted"
                        onClick={() => { setQuery(''); onSearch(null); }}
                    >
                        ×
                    </Button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <Card className="absolute top-14 left-0 right-0 mt-2 p-1 shadow-xl max-h-[300px] overflow-auto animate-in fade-in slide-in-from-top-2 border-primary/10">
                    <ul className="space-y-1">
                        {results.map((med) => (
                            <li key={med.id}>
                                <button
                                    onClick={() => handleSelect(med)}
                                    className="w-full text-left px-4 py-3 hover:bg-accent rounded-md transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-medium group-hover:text-primary transition-colors">{med.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            {med.genericName} • {med.form}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                                        {med.category}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {isOpen && results.length === 0 && debouncedQuery.length > 2 && (
                <Card className="absolute top-14 left-0 right-0 mt-2 p-4 text-center text-muted-foreground shadow-lg">
                    No medicines found matching "{query}"
                </Card>
            )}
        </div>
    );
}
