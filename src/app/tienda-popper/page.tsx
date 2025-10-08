
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Star, HelpCircle, Package, ShieldCheck, Truck, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { cbdProducts } from '@/lib/cbd-products';

export const metadata = {
    title: 'Tienda Popper – Venta de los Mejores Aromas | Popper Online',
    description: 'Bienvenido a la mejor tienda de poppers en España. Descubre una gran variedad de poppers, con las mejores ofertas y los precios más bajos.',
};

// Revalidate every time to get a new random list
export const revalidate = 0; 

// Function to shuffle an array and take the first N items
const getShuffledItems = (array: Product[], numItems: number): Product[] => {
    if (!array || array.length === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numItems);
};


export default async function TiendaPopperPage() {
    let allProducts = cbdProducts;
    
    const randomProducts = getShuffledItems(allProducts, 6);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
                Bienvenido a la mejor tienda de poppers en España. Descubre aquí la gran variedad de poppers, siempre con las mejores ofertas y los precios más bajos.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Users className="h-7 w-7 text-primary"/>
                    <span>¿Quiénes Somos?</span>
                </CardTitle>
                <CardDescription>Tu tienda de confianza con más de 30 años de experiencia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>
                    Somos una de las mejores tiendas de popper online, y en nuestra tienda podrás encontrar los mejores poppers del mercado actual a los precios más competitivos. Contamos con un equipo altamente cualificado y especializado, a tu disposición 5 días a la semana para darte el soporte necesario o proveer cualquier tipo de información.
                </p>
                <Alert>
                    <Star className="h-4 w-4"/>
                    <AlertTitle>Calidad y Legalidad Garantizadas</AlertTitle>
                    <AlertDescription>
                        Al comprar en nuestra tienda, tienes acceso a una amplia gama de poppers, todos ellos originales, de gran calidad y fabricados solo con nitritos legales como el nitrito de amilo, pentilo e isopropilo.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <HelpCircle className="h-7 w-7 text-primary"/>
                    <span>¿Cómo Comprar en Nuestra Tienda? Guía de Productos</span>
                </CardTitle>
                <CardDescription>Te ayudamos a elegir el aroma perfecto para tus necesidades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Poppers de Propilo: Ideal para Principiantes</h3>
                    <p className="text-muted-foreground">
                        Muy popular por sus efectos más suaves, es ideal para iniciarse en el mundo de los poppers. Lo encontrarás en marcas famosas como <span className="font-semibold">Rush, Platinum y Blue Lad</span>. Aquí puedes comprar Popper online con total seguridad.
                    </p>
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Poppers de Amilo: El Más Fuerte y Poderoso</h3>
                    <p className="text-muted-foreground">
                       Recomendamos los poppers a base de amilo para usuarios experimentados que buscan una experiencia intensa. El <span className="font-semibold">Popper Rise Up</span>, con una concentración de más del 98% de amilo, es especialmente apreciado para prácticas intensas. Si buscas venta de Popper de alta calidad, esta es tu mejor opción.
                    </p>
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Poppers de Pentilo: Efectos Prolongados e Intensos</h3>
                    <p className="text-muted-foreground">
                        Uno de los más potentes, el popper de pentilo es muy buscado por la durabilidad de sus efectos. Fórmulas como <span className="font-semibold">Extreme Ultra Strong</span> son perfectas para quienes buscan experiencias más fuertes y es un formato muy solicitado en la venta de popper online para fiestas.
                    </p>
                </div>
            </CardContent>
        </Card>
        
        {randomProducts.length > 0 && (
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-primary">Las Mejores Marcas para los Mejores Clientes</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {randomProducts.map(product => (
                        <Button key={product.id} variant="secondary" asChild>
                            <Link href={`/product/${product.id}`}>{product.name}</Link>
                        </Button>
                    ))}
                </div>
            </div>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Truck className="h-7 w-7 text-primary"/>
                    <span>Velocidad y Seguridad en Cada Envío</span>
                </CardTitle>
                <CardDescription>Tu privacidad y satisfacción son nuestra prioridad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <Package className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Envío Rápido y Discreto</h4>
                            <p className="text-sm text-muted-foreground">Servicio de entrega en 24/48 horas para España Peninsular. Los pedidos realizados antes de las 16h se envían el mismo día. El embalaje es siempre neutro, sin ninguna marca que identifique el contenido.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Pago 100% Seguro</h4>
                            <p className="text-sm text-muted-foreground">No verás ninguna referencia a nuestra tienda en tu extracto bancario. Además, tu información personal está protegida por cifrado SSL para evitar accesos no autorizados.</p>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground text-center pt-2">Aceptamos transferencia bancaria, tarjeta de crédito/débito y contra reembolso.</p>
            </CardContent>
        </Card>
        
        <Card className="text-center">
            <CardHeader>
                <CardTitle>¿Tienes Alguna Duda?</CardTitle>
                <CardDescription>Ponte en contacto con nuestro equipo de expertos.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-6">
                 <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary"/>
                    <a href="mailto:info@comprarpopperonline.com" className="font-semibold hover:text-primary">info@comprarpopperonline.com</a>
                </div>
            </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    Explorar Catálogo
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>

    </div>
  );
}
