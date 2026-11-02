'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function AdminB2BPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">B2B Management</h1>
          <p className="text-muted-foreground">Manage your wholesale clients and bulk orders.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Page Under Construction</CardTitle>
            <CardDescription>
                This section for B2B (Business-to-Business) client management is currently under development.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Soon you will be able to manage special rates, bulk orders, and business accounts from here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
