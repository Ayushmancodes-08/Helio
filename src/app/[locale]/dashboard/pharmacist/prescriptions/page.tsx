'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';

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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useInventory } from '@/hooks/useInventory';
import { useSales } from '@/hooks/useSales';
import { useLanguage } from '@/hooks/useLanguage';
import { getSuccessMessageTranslation, getErrorMessageTranslation, getWarningMessageTranslation } from '@/lib/notification-translations';

export default function PharmacistPrescriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { formatCurrency, t } = useLanguage();
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  // Use real hooks
  const { prescriptions, updatePrescriptionStatus, loading: prescriptionsLoading } = usePrescriptions();
  const { inventory, updateInventoryItem, loading: inventoryLoading } = useInventory();
  const { recordSale, loading: salesLoading } = useSales();

  const handleMarkAsFilled = async (prescription: any) => {
    // 1. Check if we have the medication in stock
    const medicine = inventory.find(m =>
      m.medicine_name.toLowerCase() === prescription.medication.toLowerCase()
    );

    if (!medicine) {
      toast({
        variant: 'destructive',
        title: getErrorMessageTranslation('recordNotFound', t),
        description: `"${prescription.medication}" is not in your inventory. Update inventory first.`,
      });
      return;
    }

    // Default deduction quantity (could be improved with regex parsing of dosage)
    const deductQuantity = 1;

    if (medicine.quantity < deductQuantity) {
      toast({
        variant: 'destructive',
        title: getWarningMessageTranslation('lowStock', t, { medicineName: medicine.medicine_name }),
        description: `Only ${medicine.quantity} units of "${medicine.medicine_name}" available.`,
      });
      return;
    }

    try {
      // 2. Deduct from Inventory
      const inventoryResult = await updateInventoryItem(medicine.id, {
        quantity: medicine.quantity - deductQuantity
      });

      if (!inventoryResult) throw new Error("Failed to update inventory");

      // 3. Mark Prescription as Filled (in DB)
      const statusResult = await updatePrescriptionStatus(prescription.id, 'Filled');
      if (!statusResult) throw new Error("Failed to update prescription status");

      // 4. Record the Sale (Transaction)
      // Assuming price is set in inventory, else 0
      const saleAmount = (medicine.price || 0) * deductQuantity;
      await recordSale({
        medicine_name: medicine.medicine_name,
        quantity: deductQuantity,
        total_amount: saleAmount,
        sale_date: new Date().toISOString()
      });

      toast({
        title: getSuccessMessageTranslation('prescriptionFilled', t),
        description: `Marked as filled and recorded transaction of ${formatCurrency(saleAmount)}.`,
      });

      // Update local state to show "Filled" immediately without closing dialog (better UX)
      setSelectedPrescription((prev: any) => ({ ...prev, status: 'Filled' }));

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: getErrorMessageTranslation('operationFailed', t),
        description: 'Failed to process prescription. Check console for details.',
      });
    }
  };

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription);
    setIsDetailDialogOpen(true);
  };

  const filteredPrescriptions = useMemo(() => {
    if (!prescriptions) return [];
    return prescriptions.filter(
      (presc) =>
        (presc.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        presc.medication.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prescriptions, searchTerm]);

  const isLoading = prescriptionsLoading || inventoryLoading || salesLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Manage Prescriptions</h1>
          <p className="text-muted-foreground">
            View incoming prescriptions from doctors and mark them as filled.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Prescription Queue</CardTitle>
              <CardDescription>Live list of patient prescriptions.</CardDescription>
            </div>
            <div className="relative">
              <FileSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:w-64 lg:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.length > 0 ? filteredPrescriptions.map((presc) => (
                  <TableRow key={presc.id}>
                    <TableCell className="font-medium">
                      {presc.patient_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {presc.doctor_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{presc.medication} {presc.dosage}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(new Date(presc.issued_date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge variant={presc.status === 'Filled' ? 'secondary' : 'default'}>
                        {presc.status || 'Issued'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(presc)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Prescription Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Review details and fill this prescription.
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Patient</h4>
                  <p>{selectedPrescription.patient_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Doctor</h4>
                  <p>{selectedPrescription.doctor_name}</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-semibold mb-2">Medication Order</h4>
                <p className="text-lg font-bold">{selectedPrescription.medication}</p>
                <p className="text-sm">Dosage: {selectedPrescription.dosage}</p>
                {selectedPrescription.instructions && (
                  <p className="text-sm">Instructions: {selectedPrescription.instructions}</p>
                )}
              </div>

              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Doctor's Notes</h4>
                  <p className="italic text-sm">{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <div className="flex-1">
                  Status: <span className="font-bold">{selectedPrescription.status || 'Pending'}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedPrescription?.status !== 'Filled' && (
              <Button onClick={() => handleMarkAsFilled(selectedPrescription)} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Filled
              </Button>
            )}
            {selectedPrescription?.status === 'Filled' && (
              <Button disabled variant="secondary">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Already Filled
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
