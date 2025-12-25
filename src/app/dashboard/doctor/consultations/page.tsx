'use client';

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
import { Badge } from '@/components/ui/badge';
import { Phone, Video } from 'lucide-react';
import Link from 'next/link';

const upcomingConsultations = [
  {
    id: 'consult-1',
    patient: 'Aarav Sharma',
    time: '10:30 AM',
    status: 'Upcoming',
  },
  {
    id: 'consult-2',
    patient: 'Rohan Verma',
    time: '11:30 AM',
    status: 'Upcoming',
  },
];

const pastConsultations = [
  {
    id: 'consult-3',
    patient: 'Ananya Gupta',
    time: 'Yesterday',
    status: 'Completed',
  },
];

export default function DoctorConsultationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Manage Consultations
        </h1>
        <p className="text-muted-foreground">
          Join upcoming video calls and view past consultation details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingConsultations.map((consult) => (
                <TableRow key={consult.id}>
                  <TableCell className="font-medium">
                    {consult.patient}
                  </TableCell>
                  <TableCell>{consult.time}</TableCell>
                  <TableCell>
                    <Badge variant="default">{consult.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Video className="mr-2 h-4 w-4" />
                      Start Call
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastConsultations.map((consult) => (
                <TableRow key={consult.id}>
                  <TableCell className="font-medium">
                    {consult.patient}
                  </TableCell>
                  <TableCell>{consult.time}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{consult.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
