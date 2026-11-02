'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse } from "lucide-react";

export default function AdminStockPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
          <p className="text-muted-foreground">Manage your product inventory.</p>
        </div>
      </div>
      
      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Warehouse className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Page Under Construction</CardTitle>
            <CardDescription>
                This section for stock and warehouse management is currently under development.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Soon you will be able to view inventory reports, adjust stock levels, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
