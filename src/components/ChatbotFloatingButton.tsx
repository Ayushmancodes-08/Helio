'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { MessageCircle, X } from 'lucide-react';
import { SymptomCheckerClient } from './symptom-checker-client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function ChatbotFloatingButton() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-0"
                    size="icon"
                >
                    <MessageCircle className="h-8 w-8" />
                    <span className="sr-only">Open Symptom Checker</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] p-0 h-[80vh] flex flex-col gap-0 overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>AI Symptom Checker</DialogTitle>
                    <DialogDescription>
                        Describe your symptoms to get a preliminary assessment.
                    </DialogDescription>
                </VisuallyHidden>
                {/* We use VisuallyHidden or just let the custom header in SymptomCheckerClient handle the 'title' visually, 
            but for accessibility DialogContent needs Title/Description usually. 
            The SymptomCheckerClient has its own header.
        */}
                <div className="absolute right-4 top-4 z-50 opacity-0 pointer-events-none">
                    {/* This X is hidden because DialogContent usually has one. 
                 But since we have p-0, the default close button might overlay weirdly or we might want to style it. 
                 Let's check if we want to rely on default close or not. 
                 Default close is usually top-4 right-4.
                 
                 Actually, since we are using p-0, the default close button might be inside the header area of SymptomCheckerClient.
                 Let's just use the default close button mostly, or we can hide it if SymptomCheckerClient has a close action.
                 SymptomCheckerClient doesn't have a close action.
              */}
                </div>
                <SymptomCheckerClient />
            </DialogContent>
        </Dialog>
    );
}
