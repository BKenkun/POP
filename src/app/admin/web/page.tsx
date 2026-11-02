'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Construction, PackagePlus, Calendar as CalendarIcon } from 'lucide-react';
import { updateSiteSettings, getSiteSettings } from '@/app/actions/site-settings';
import type { SiteSettings } from '@/app/actions/site-settings';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function AdminWebPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // State for time input
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const currentSettings = await getSiteSettings();
      setSettings(currentSettings);
      if (currentSettings.launchDate) {
        const date = new Date(currentSettings.launchDate);
        setTime(format(date, 'HH:mm'));
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !settings) return;
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours, minutes);
    handleToggleChange('launchDate', date.toISOString());
  }

  const handleToggleChange = (key: keyof SiteSettings, value: boolean | string | null) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Website settings have been updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!settings) {
    return <div>Failed to load settings.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Customization</h1>
          <p className="text-muted-foreground">Enable and disable global store features.</p>
        </div>
         <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><PackagePlus />Monthly Dose</CardTitle>
            <CardDescription>
                Enable or disable monthly subscription features across the store.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="subscription-toggle" className="text-base font-medium">
                        Show "Monthly Dose" feature
                    </Label>
                    <p className="text-sm text-muted-foreground">
                       When inactive, subscription links and pages will not be visible to customers.
                    </p>
                </div>
                 <Switch
                    id="subscription-toggle"
                    checked={settings.showSubscriptionFeature}
                    onCheckedChange={(checked) => handleToggleChange('showSubscriptionFeature', checked)}
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Construction />"Under Construction" Mode</CardTitle>
            <CardDescription>
                Show a landing page to hide the website from the public while making changes.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="construction-toggle" className="text-base font-medium">
                        Enable "Under construction" mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                       Visitors will see the maintenance page. Administrators will still be able to browse the site.
                    </p>
                </div>
                 <Switch
                    id="construction-toggle"
                    checked={settings.underConstruction}
                    onCheckedChange={(checked) => handleToggleChange('underConstruction', checked)}
                />
            </div>
            
            {settings.underConstruction && (
                 <div className="flex flex-col gap-4 rounded-lg border p-4 shadow-sm">
                     <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <Label htmlFor="countdown-toggle" className="text-base font-medium">
                                Show countdown timer
                            </Label>
                        </div>
                        <Switch
                            id="countdown-toggle"
                            checked={settings.showCountdown}
                            onCheckedChange={(checked) => handleToggleChange('showCountdown', checked)}
                        />
                     </div>
                     
                      {settings.showCountdown && (
                        <div className="space-y-2 pt-2 border-t">
                            <Label>Launch date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !settings.launchDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {settings.launchDate ? format(new Date(settings.launchDate), "MM/dd/yyyy, HH:mm") : <span>Select date and time</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={settings.launchDate ? new Date(settings.launchDate) : undefined}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                        locale={enUS}
                                    />
                                     <div className="p-3 border-t border-border">
                                        <Label htmlFor="time" className="text-sm font-medium">Launch time</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={time}
                                            onChange={(e) => {
                                                setTime(e.target.value);
                                                if (settings.launchDate) {
                                                    const newDate = new Date(settings.launchDate);
                                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                                    newDate.setHours(hours, minutes);
                                                    handleToggleChange('launchDate', newDate.toISOString());
                                                }
                                            }}
                                            className="mt-1"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                      )}
                 </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
