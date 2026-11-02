
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function AdminAccountingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting</h1>
          <p className="text-muted-foreground">Analyze profits, costs, and taxes for your store.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Page Under Construction</CardTitle>
            <CardDescription>
                This section for accounting and financial management is currently under development.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Detailed reports on profit margins, costs per product, and VAT totals will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
