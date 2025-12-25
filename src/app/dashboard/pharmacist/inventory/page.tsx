'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, PackageSearch, Edit, Save, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

const inventorySchema = z.object({
  medicineId: z.string().optional(),
  medicineName: z.string().min(1, 'Medicine name is required.'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative.'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  expiryDate: z.string().optional(), // Adding expiry date support
  supplier: z.string().optional(), // Kept for UI, though DB might not have it yet (will check schema)
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

export default function InventoryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{ quantity: number, price: number }>({ quantity: 0, price: 0 });

  const { profile } = useAuth();
  const {
    inventory,
    loading: inventoryLoading,
    createInventoryItem,
    updateInventoryItem
  } = useInventory();

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      medicineName: '',
      quantity: 0,
      price: 0,
    },
  });

  const medicineName = form.watch('medicineName');
  const existingMedicine = useMemo(() =>
    inventory.find(m => m.medicine_name.toLowerCase() === (medicineName || '').toLowerCase()),
    [inventory, medicineName]);

  const onSubmit = async (data: InventoryFormValues) => {
    if (!profile?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to manage inventory.',
      });
      return;
    }

    try {
      if (existingMedicine) {
        // Update existing medicine quantity
        const newQuantity = existingMedicine.quantity + data.quantity;
        await updateInventoryItem(existingMedicine.id, {
          quantity: newQuantity,
          price: data.price // Allow updating price too if supplied
        });

        toast({
          title: 'Stock Updated',
          description: `Added ${data.quantity} units to ${existingMedicine.medicine_name}. New total: ${newQuantity}.`,
        });
      } else {
        // Create new medicine
        if (data.price <= 0) {
          form.setError("price", { type: "manual", message: "Price is required for new medicines." });
          return;
        }

        await createInventoryItem({
          medicine_name: data.medicineName,
          quantity: data.quantity,
          price: data.price,
          expiry_date: data.expiryDate ? new Date(data.expiryDate) : undefined,
          pharmacist_id: profile.id
        });

        toast({
          title: 'Medicine Added',
          description: `${data.medicineName} has been added to the inventory.`,
        });
      }
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update inventory.',
      });
    }
  };

  const handleStartEditing = (medicine: InventoryItem) => {
    setEditingMedicineId(medicine.id);
    setEditingValues({ quantity: medicine.quantity, price: medicine.price || 0 });
  };

  const handleCancelEditing = () => {
    setEditingMedicineId(null);
  };

  const handleSaveEditing = async (medicineId: string) => {
    const medName = inventory.find(m => m.id === medicineId)?.medicine_name || 'Medicine';
    try {
      await updateInventoryItem(medicineId, {
        quantity: editingValues.quantity,
        price: editingValues.price
      });
      setEditingMedicineId(null);
      toast({
        title: 'Inventory Updated',
        description: `Stock details for ${medName} have been updated.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update ${medName}.`,
      });
    }
  };

  const handleEditingChange = (field: 'quantity' | 'price', value: string) => {
    setEditingValues(prev => ({ ...prev, [field]: Number(value) }));
  };

  const getStatusVariant = (quantity: number) => {
    if (quantity <= 0) return 'destructive';
    if (quantity < 50) return 'default'; // Low stock
    return 'secondary'; // In stock
  };

  const getStatusLabel = (quantity: number) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity < 50) return 'Low Stock';
    return 'In Stock';
  }

  const filteredInventory = useMemo(() => {
    return inventory.filter(
      (med) => med.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Inventory Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add or Update Stock</CardTitle>
          <CardDescription>
            Enter a medicine name to add a new entry or update an existing one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="medicineName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity to Add</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">{existingMedicine ? 'Update current price' : 'Required for new medicine'}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Supplier field removed as it's not in DB schema yet, could be added later */}
                <div className="flex items-end">
                  <Button type="submit" disabled={inventoryLoading} className="w-full">
                    {inventoryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {existingMedicine ? 'Update Stock' : 'Add New Medicine'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>A list of all medicines in stock.</CardDescription>
            </div>
            <div className="relative">
              <PackageSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for a medicine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:w-64 lg:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inventoryLoading && inventory.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="hidden sm:table-cell">Expiry</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length > 0 ? filteredInventory.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.medicine_name}</TableCell>
                    <TableCell>
                      {editingMedicineId === med.id ? (
                        <Input
                          type="number"
                          value={editingValues.quantity}
                          onChange={(e) => handleEditingChange('quantity', e.target.value)}
                          className="h-8 w-24"
                        />
                      ) : (
                        med.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {editingMedicineId === med.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingValues.price}
                          onChange={(e) => handleEditingChange('price', e.target.value)}
                          className="h-8 w-24"
                        />
                      ) : (
                        med.price?.toFixed(2)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(med.quantity)}>{getStatusLabel(med.quantity)}</Badge>
                    </TableCell>
                    {/* <TableCell className="hidden sm:table-cell">{med.expiry_date ? format(med.expiry_date, 'PP') : '-'}</TableCell> */}
                    <TableCell className="text-right">
                      {editingMedicineId === med.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveEditing(med.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEditing}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEditing(med)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No medicines found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
