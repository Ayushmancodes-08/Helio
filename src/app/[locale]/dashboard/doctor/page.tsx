'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck,
  Users,
  Video,
  Search,
  CheckSquare,
  Trash2,
  Edit,
  Save,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { PatientDemographicsChart } from '@/components/patient-demographics-chart';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format, isToday } from 'date-fns';
import { useLanguage } from '@/hooks/useLanguage';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';

export type AgeGroupData = {
  age: string;
  patients: number;
};

export default function DoctorDashboardPage() {
  const [tasks, setTasks] = useState<{ id: string, description: string, completed: boolean }[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  // Use the new aggregator hook
  const { data: dashboardData, loading: dashboardLoading, error } = useDoctorDashboard();
  const { t, locale } = useLanguage();

  // Extract data from the aggregated response
  const profile = dashboardData?.profile;
  const appointments = dashboardData?.appointments || [];
  const demographicsData = dashboardData?.demographics || [
    { age: '0-18', patients: 0 },
    { age: '19-30', patients: 0 },
    { age: '31-45', patients: 0 },
    { age: '46-60', patients: 0 },
    { age: '60+', patients: 0 },
  ];

  // Load tasks from localStorage (keep this for simple todos)
  useEffect(() => {
    if (profile?.full_name) {
      try {
        const doctorTasksKey = `doctorTasks_${profile.full_name}`;
        const storedTasks = localStorage.getItem(doctorTasksKey);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Failed to load tasks", error);
      }
    }
  }, [profile]);

  // Save tasks to localStorage
  useEffect(() => {
    if (profile?.full_name) {
      try {
        const doctorTasksKey = `doctorTasks_${profile.full_name}`;
        localStorage.setItem(doctorTasksKey, JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks", error);
      }
    }
  }, [tasks, profile]);

  // NOTE: Patient demographics calculation and Appointments fetching are now handled server-side!


  const todaysAppointments = useMemo(() => {
    return appointments.filter(
      (appt) => {
        const status = (appt.status || '').toLowerCase();
        const isUpcoming = status === 'upcoming' || status === 'scheduled' || !status;
        return appt.appointment_date && isToday(new Date(appt.appointment_date)) && isUpcoming;
      }
    );
  }, [appointments]);

  const totalPatients = useMemo(() => {
    return new Set(appointments.map(a => a.patient_id)).size;
  }, [appointments]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskDescription.trim()) {
      setTasks([
        ...tasks,
        {
          id: `task-${Date.now()}`,
          description: newTaskDescription,
          completed: false,
        },
      ]);
      setNewTaskDescription('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleStartEditing = (task: typeof tasks[0]) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.description);
  };

  const handleSaveEditing = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, description: editingTaskText } : task
      )
    );
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/dashboard/doctor/patients?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('doctor.doctorDashboard')}</h1>
          <p className="text-muted-foreground">
            {t('doctor.dailyOverview', { name: profile?.full_name || 'Doctor' })}
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('doctor.searchPatient')}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('doctor.todaysAppointments')}
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                todaysAppointments.filter((a) => a.consultation_type === 'Video').length
              }{' '}
              {t('doctor.videoConsultations')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('doctor.totalPatients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">{t('doctor.allTimeHistory')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('doctor.pendingTasks')}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => !t.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {tasks.length} {t('doctor.totalTasks')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('doctor.patientDemographics')}</CardTitle>
            <CardDescription>
              {t('doctor.ageBreakdown')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientDemographicsChart chartData={demographicsData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('doctor.pendingTasks')}</CardTitle>
            <CardDescription>
              {t('doctor.manageTasks')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddTask} className="flex items-center gap-2">
              <Input
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder={t('doctor.addNewTask')}
              />
              <Button type="submit" size="icon">
                <PlusCircle />
                <span className="sr-only">{t('doctor.addTask')}</span>
              </Button>
            </form>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                  />
                  {editingTaskId === task.id ? (
                    <Input
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      className="h-8 flex-1"
                    />
                  ) : (
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 text-sm leading-snug ${task.completed
                        ? 'text-muted-foreground line-through'
                        : ''
                        }`}
                    >
                      {task.description}
                    </label>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    {editingTaskId === task.id ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleSaveEditing(task.id)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleStartEditing(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('common.delete')} {t('common.cancel')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            {t('common.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-center text-muted-foreground pt-4">{t('doctor.noTasks')}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('doctor.upcomingAppointmentsToday')}</CardTitle>
          <CardDescription>
            {t('doctor.appointmentsScheduledToday')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('doctor.patientName')}</TableHead>
                <TableHead>{t('doctor.time')}</TableHead>
                <TableHead>{t('doctor.type')}</TableHead>
                <TableHead className="text-right">{t('doctor.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaysAppointments.length > 0 ? todaysAppointments.map((appt) => {
                const patientAvatar = PlaceHolderImages.find(
                  (img) => img.id === 'avatar-patient'
                );
                return (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {patientAvatar && (
                            <AvatarImage
                              src={patientAvatar.imageUrl}
                              alt={appt.patient_name || 'Patient'}
                              data-ai-hint={patientAvatar.imageHint}
                            />
                          )}
                          <AvatarFallback>
                            {(appt.patient_name || 'P').split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{appt.patient_name || 'Unknown'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appt.appointment_time || (appt.appointment_date ? format(new Date(appt.appointment_date), 'h:mm a') : 'N/A')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appt.consultation_type === 'Video' ? 'default' : 'secondary'
                        }
                      >
                        {appt.consultation_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${locale}/dashboard/doctor/consultations`} passHref>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={appt.consultation_type !== 'Video'}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          {t('doctor.joinCall')}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {t('doctor.noAppointmentsToday')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
