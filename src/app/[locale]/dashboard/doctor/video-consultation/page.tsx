'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { VideoConsultationContent } from './video-consultation-content';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading video consultation...</p>
      </div>
    </div>
  );
}

export default function DoctorVideoConsultationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VideoConsultationContent />
    </Suspense>
  );
}
