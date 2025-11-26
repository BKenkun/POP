'use client';

import { cn } from "@/lib/utils";
import { Calendar, PackageCheck, Send, CheckCircle } from "lucide-react";
import { useTranslation } from "@/context/language-context";

interface SubscriptionTimelineProps {
    day: number;
}

const getStepStatus = (day: number): [string, string, string] => {
    if (day >= 26 || day < 4) { // Preparing shipment
        return ['completed', 'completed', 'active'];
    }
    if (day >= 4 && day < 26) { // Selection open
        return ['completed', 'active', 'pending'];
    }
    return ['pending', 'pending', 'pending']; // Should not happen
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
                "text-xs font-medium transition-all",
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
    const progressPercentage = Math.min(100, Math.max(0, (day / 31) * 100));

    return (
        <div className="w-full">
            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div 
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            <div className="flex justify-between">
                <Milestone label={t('account.subscription.timeline_step1')} icon={Calendar} status={startStatus} />
                <Milestone label={t('account.subscription.timeline_step2')} icon={PackageCheck} status={selectionStatus} />
                <Milestone label={t('account.subscription.timeline_step3')} icon={Send} status={shippingStatus} />
            </div>
        </div>
    );
}
