'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, Loader2, Hospital, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useHospitals, useDistricts } from '@/hooks/useHealthData';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { createClient } from '@/lib/supabase/client';

interface DiseaseEntry {
  id: string; // temporary ID for local list
  db_id?: string; // Real DB ID for updates
  date: string;
  diseaseName: string;
  caseCount: number | '';
  error?: string;
  isSaved?: boolean;
}

export default function HospitalDataPage() {
  const { toast } = useToast();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');

  // Bulk Entry State
  const [entries, setEntries] = useState<DiseaseEntry[]>([
    { id: '1', date: format(new Date(), 'yyyy-MM-dd'), diseaseName: '', caseCount: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Hooks
  const { hospitals, loading: hospitalsLoading } = useHospitals(selectedDistrictId); // Filter by district
  const { districts, loading: districtsLoading } = useDistricts();
  const { addDiseaseReport, updateDiseaseReport, deleteDiseaseReport } = useHealthMetrics();

  // Reset hospital when district changes
  useEffect(() => {
    setSelectedHospitalId('');
  }, [selectedDistrictId]);

  // Fetch data when hospital changes
  useEffect(() => {
    if (!selectedHospitalId) return;

    const fetchTodayEntries = async () => {
      const supabase = createClient();
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch entries for this hospital (filtering by today)
      const { data, error } = await supabase
        .from('disease_reports')
        .select('*')
        .eq('hospital_id', selectedHospitalId)
        .eq('report_date', today);

      if (data && data.length > 0) {
        const fetched: DiseaseEntry[] = data.map(d => ({
          id: Math.random().toString(36).substr(2, 9),
          db_id: d.id,
          date: d.report_date,
          diseaseName: d.disease_name,
          caseCount: d.case_count,
          isSaved: true
        }));
        // Append blank row
        fetched.push({
          id: Math.random().toString(36).substr(2, 9),
          date: today,
          diseaseName: '',
          caseCount: '',
          isSaved: false
        });
        setEntries(fetched);
      } else {
        // Reset to one blank row
        setEntries([{ id: Math.random().toString(36).substr(2, 9), date: today, diseaseName: '', caseCount: '' }]);
      }
    };

    fetchTodayEntries();
  }, [selectedHospitalId]);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: Math.random().toString(36).substr(2, 9),
        date: entries.length > 0 ? entries[entries.length - 1].date : format(new Date(), 'yyyy-MM-dd'),
        diseaseName: '',
        caseCount: ''
      }
    ]);
  };

  const handleRemoveEntry = async (id: string) => {
    const entryToRemove = entries.find(e => e.id === id);
    if (!entryToRemove) return;

    if (entryToRemove.db_id) {
      // It's a saved entry, delete from DB
      const confirmDelete = window.confirm("Are you sure you want to delete this saved record?");
      if (!confirmDelete) return;

      const res = await deleteDiseaseReport(entryToRemove.db_id);
      if (res.success) {
        toast({ title: "Deleted", description: "Record deleted successfully." });
        // Remove from UI
        if (entries.length === 1) {
          setEntries([{ id: Math.random().toString(36).substr(2, 9), date: format(new Date(), 'yyyy-MM-dd'), diseaseName: '', caseCount: '' }]);
        } else {
          setEntries(entries.filter(e => e.id !== id));
        }
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete record." });
      }
    } else {
      // Local only
      if (entries.length === 1) {
        setEntries([{ id: Math.random().toString(36).substr(2, 9), date: format(new Date(), 'yyyy-MM-dd'), diseaseName: '', caseCount: '' }]);
      } else {
        setEntries(entries.filter(e => e.id !== id));
      }
    }
  };

  const handleEntryChange = (id: string, field: keyof DiseaseEntry, value: string | number | boolean) => {
    setEntries(entries.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSaveAll = async () => {
    if (!selectedHospital) return;

    // Filter for valid entries (either unsaved OR saved but possibly edited)
    // We just iterate standardly.
    const validEntries = entries.filter(e => e.diseaseName.trim() !== '' && (Number(e.caseCount) > 0));

    if (validEntries.length === 0) {
      toast({ variant: 'destructive', title: 'Nothing to Save', description: 'Please add new valid entries before saving.' });
      return;
    }

    setIsSaving(true);

    // Find district name for legacy requirement
    const district = districts.find(d => d.id === selectedHospital.district_id);
    const districtName = district ? district.name : 'Unknown District';

    let successCount = 0;
    let errorCount = 0;

    // Clone entries to update status
    let updatedEntries = [...entries];

    for (const entry of validEntries) {
      let res;
      // If it has a DB ID, it's an update
      if (entry.db_id) {
        res = await updateDiseaseReport(entry.db_id, {
          disease_name: entry.diseaseName,
          case_count: Number(entry.caseCount),
          report_date: entry.date
        });
      } else {
        // New Insert
        res = await addDiseaseReport({
          district_name: districtName,
          district_id: selectedHospital.district_id,
          hospital_id: selectedHospital.id,
          disease_name: entry.diseaseName,
          case_count: Number(entry.caseCount),
          report_date: entry.date
        });
      }

      if (res.success) {
        successCount++;
        // Mark as saved and store DB ID if new
        updatedEntries = updatedEntries.map(e =>
          e.id === entry.id ? { ...e, isSaved: true, db_id: entry.db_id || (res.data ? res.data.id : undefined) } : e
        );
      } else {
        errorCount++;
      }
    }

    setIsSaving(false);

    if (errorCount === 0) {
      toast({ title: 'Success', description: `Successfully saved ${successCount} entries.` });
      // Add a new fresh line for continuous entry
      updatedEntries.push({
        id: Math.random().toString(36).substr(2, 9),
        date: format(new Date(), 'yyyy-MM-dd'),
        diseaseName: '',
        caseCount: '',
        isSaved: false
      });
      setEntries(updatedEntries);
    } else {
      toast({ variant: 'destructive', title: 'Partial Success', description: `Saved ${successCount} entries, but failed to save ${errorCount}.` });
      setEntries(updatedEntries); // Update at least the successful ones
    }
  };

  if (hospitalsLoading && hospitals.length === 0 && !selectedDistrictId) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-headline text-3xl font-bold">Hospital Data Entry</h1>
        <p className="text-muted-foreground">
          Select a hospital and log its daily disease case numbers.
        </p>
      </div>

      {/* Hospital Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Hospital</CardTitle>
          <CardDescription>Choose a hospital to view and manage its case data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">District</label>
            <Select onValueChange={setSelectedDistrictId} value={selectedDistrictId}>
              <SelectTrigger className="w-full max-w-md bg-muted/30">
                <SelectValue placeholder="Select a district..." />
              </SelectTrigger>
              <SelectContent>
                {districts.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hospital</label>
            <Select onValueChange={setSelectedHospitalId} value={selectedHospitalId} disabled={!selectedDistrictId}>
              <SelectTrigger className="w-full max-w-md bg-muted/30">
                <SelectValue placeholder={!selectedDistrictId ? "Select a district first" : "Select a hospital..."} />
              </SelectTrigger>
              <SelectContent>
                {hospitals.length > 0 ? (
                  hospitals.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">No hospitals found</div>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Section */}
      {selectedHospital && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedHospital.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Daily case entries for <span className="font-medium text-foreground">{districts.find(d => d.id === selectedHospital.district_id)?.name}</span> district.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-1 text-sm font-medium text-muted-foreground md:visible invisible h-0 md:h-auto">
                  <div className="col-span-12 md:col-span-3">Date</div>
                  <div className="col-span-12 md:col-span-5">Disease Name</div>
                  <div className="col-span-12 md:col-span-3">Number of Cases</div>
                  <div className="col-span-12 md:col-span-1"></div>
                </div>

                {/* Entry Rows */}
                {entries.map((entry, index) => (
                  <div key={entry.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 md:p-0 rounded-lg border md:border-0 ${entry.isSaved ? 'bg-green-50/50 opacity-75' : 'bg-muted/20 md:bg-transparent'}`}>
                    <div className="col-span-1 md:col-span-3">
                      <label className="md:hidden text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => handleEntryChange(entry.id, 'date', e.target.value)}
                          className="pl-9 bg-muted/30"
                        // disabled={entry.isSaved} // Allow editing
                        />
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-5">
                      <label className="md:hidden text-xs font-medium text-muted-foreground mb-1 block">Disease Name</label>
                      <Input
                        placeholder="e.g., Dengue"
                        value={entry.diseaseName}
                        onChange={(e) => handleEntryChange(entry.id, 'diseaseName', e.target.value)}
                        className="bg-muted/30"
                      // disabled={entry.isSaved} // Allow editing
                      />
                    </div>
                    <div className="col-span-1 md:col-span-3">
                      <label className="md:hidden text-xs font-medium text-muted-foreground mb-1 block">Number of Cases</label>
                      <Input
                        type={entry.caseCount === '' ? 'text' : 'number'}
                        placeholder="0"
                        value={entry.caseCount}
                        onChange={(e) => handleEntryChange(entry.id, 'caseCount', e.target.value)}
                        className="bg-muted/30"
                      // disabled={entry.isSaved} // Allow editing
                      />
                    </div>
                    <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center items-center gap-2">
                      {entry.isSaved && (
                        <span className="text-[10px] font-bold text-green-600 px-1.5 py-0.5 bg-green-100 rounded-full">Saved</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={handleAddEntry}
                  className="w-full md:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="shadow-xl"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save All Changes</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
