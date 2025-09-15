
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

// Placeholder data for addresses
const addresses = [
    {
        id: "addr_1",
        name: "Casa",
        street: "Calle Falsa 123, Piso 4, Puerta A",
        city: "Madrid",
        postalCode: "28001",
        country: "España",
        isDefault: true,
    },
    {
        id: "addr_2",
        name: "Trabajo",
        street: "Avenida del Éxito 456, Oficina 7",
        city: "Barcelona",
        postalCode: "08001",
        country: "España",
        isDefault: false,
    }
]

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">Mis Direcciones</h2>
            <p className="text-muted-foreground">
                Gestiona tus direcciones de envío y facturación.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2"/>
            Añadir Dirección
        </Button>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            {addresses.map((address) => (
                <Card key={address.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{address.name}</span>
                            {address.isDefault && <span className="text-xs font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">Por defecto</span>}
                        </CardTitle>
                        <CardDescription>{address.street}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.postalCode}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">Editar</Button>
                            <Button variant="destructive" size="sm">Eliminar</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
       </div>
    </div>
  )
}
