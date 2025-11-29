
'use client';

import { cn } from "@/lib/utils";
import { Calendar, PackageCheck, Send, CheckCircle } from "lucide-react";
import { useTranslation } from "@/context/language-context";

interface SubscriptionTimelineProps {
    day: number;
}

const getStepStatus = (day: number): [string, string, string] => {
    if (day >= 1 && day <= 4) { // Selection open
        return ['completed', 'active', 'pending'];
    }
    if (day >= 5 && day <= 6) { // Preparing shipment
        return ['completed', 'completed', 'active'];
    }
    // Days 7-31 (and others), enjoy and wait
    return ['completed', 'completed', 'completed']; 
}

const Milestone = ({ label, icon: Icon, status }: { label: string; icon: React.ElementType, status: string }) => {
    const isCompleted = status === 'completed';
    const isActive = status === 'active';

    return (
        <div className="flex flex-col items-center space-y-2">
            <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-background",
                isActive ? "border-primary" : "border-muted",
            )}>
                {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />}
            </div>
            <p className={cn(
                "text-xs font-medium text-center transition-all",
                isActive ? "text-primary" : "text-muted-foreground",
                isCompleted && "text-foreground"
            )}>
                {label}
            </p>
        </div>
    );
};

export default function SubscriptionTimeline({ day }: SubscriptionTimelineProps) {
    const { t } = useTranslation();
    const [startStatus, selectionStatus, shippingStatus] = getStepStatus(day);
    
    // Day 1 is 0% progress, Day 7 is 100% progress of the "active" phase (selection + prep)
    const progressPercentage = Math.min(100, Math.max(0, ((day - 1) / 6) * 100));

    return (
        <div className="w-full">
            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Milestone label={t('account.subscription.timeline_step1')} icon={Calendar} status={startStatus} />
                <Milestone label={t('account.subscription.timeline_step2')} icon={PackageCheck} status={selectionStatus} />
                <Milestone label={t('account.subscription.timeline_step3')} icon={Send} status={shippingStatus} />
            </div>
        </div>
    );
}
