
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HelpCircle, Eye, HeartPulse, ShieldCheck, Info, ChevronRight, AlertTriangle, Syringe, Skull, BrainCircuit, Droplets } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Popper: Todo lo que Debes Saber | Popper Online',
  description: 'Una guía completa sobre qué son los poppers, sus efectos, usos, riesgos y consejos de seguridad. Infórmate antes de usar.',
};

const effectsList = [
    "Euforia inicial y sensación de calor.",
    "Enrojecimiento de la cara y aumento del ritmo cardíaco.",
    "Mareos y, en ocasiones, dolores de cabeza.",
    "Relajación involuntaria de los músculos lisos (esfínter anal y vaginal).",
    "Disminución de las inhibiciones y alteración del juicio.",
    "Posibles distorsiones visuales y aumento de la conciencia sensual.",
    "Náuseas, visión borrosa o hemorragias nasales en algunos casos."
];

const longTermEffects = [
    "Irritación de la piel (erupción) alrededor de la boca, nariz y ojos con el uso frecuente.",
    "Quemaduras en la piel si el líquido entra en contacto directo.",
    "Riesgo de maculopatía (pérdida de visión), asociado principalmente al nitrito de isopropilo.",
    "Aumento de la presión ocular, peligroso para personas con glaucoma.",
    "Posible afectación del suministro de sangre a largo plazo si el uso es abusivo y continuado."
];

const combinations = [
    { drug: "Viagra (o similares)", effect: "Caída extrema y peligrosa de la presión arterial, riesgo de desmayo y emergencia médica.", variant: "destructive" as const },
    { drug: "Anfetaminas (Speed)", effect: "Aumento drástico de la presión sobre el corazón, sometiendo al cuerpo a un estrés adicional.", variant: "destructive" as const },
];

export default function PopperInfoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-tight font-bold">Popper: Todo lo que Debes Saber</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Una guía completa sobre su composición, efectos, riesgos y las mejores prácticas de seguridad.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-primary"/>
                    <span>¿Qué es el Popper Exactamente?</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    "Popper" es el término coloquial para los <strong>nitritos de alquilo</strong>. Se trata de un líquido químico volátil clasificado como depresor, lo que significa que ralentiza la comunicación entre el cerebro y el cuerpo.
                </p>
                <p className="text-muted-foreground">
                    Su principal característica es que son <strong>vasodilatadores</strong>: dilatan los vasos sanguíneos y relajan los músculos lisos (aquellos que no controlamos voluntariamente), lo que provoca una caída temporal de la presión arterial.
                </p>
                <Alert>
                    <Droplets className="h-4 w-4"/>
                    <AlertTitle>Tipos Comunes de Nitritos</AlertTitle>
                    <AlertDescription>
                        Existen varias fórmulas, como el nitrito de amilo, nitrito de pentilo, nitrito de propilo y el nitrito de isopropilo. Cada uno tiene matices diferentes en su efecto y duración.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-primary"/>
                    <span>Forma, Olor y Uso Histórico</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    Se presentan como un líquido incoloro o amarillento en pequeñas botellas de vidrio (generalmente de 9 a 30 ml). Su olor es muy característico y a menudo descrito como fuerte y químico, similar a disolventes o "calcetines sucios".
                </p>
                <p className="text-muted-foreground">
                    Originalmente, el nitrito de amilo se utilizaba en medicina para tratar la angina de pecho. Su uso recreativo se popularizó más tarde, especialmente en la cultura de club y entre hombres que tienen sexo con hombres, debido a su capacidad para desinhibir y relajar los músculos, facilitando el sexo anal. Hoy en día, su uso se ha extendido como "droga de fiesta".
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="h-6 w-6 text-primary"/>
                    <span>Efectos Inmediatos y Duración</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className='text-muted-foreground'>Los efectos son casi instantáneos pero muy breves, durando entre <strong>2 y 5 minutos</strong>. El cuerpo de cada persona reacciona de manera diferente dependiendo de su salud, peso, la cantidad inhalada y si se combina con otras sustancias. Los efectos más comunes incluyen:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {effectsList.map((effect, index) => (
                        <li key={index}>{effect}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary"/>
                    <span>¿El Popper es Adictivo?</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className='text-muted-foreground'>
                   El uso de poppers <strong>no se considera físicamente adictivo</strong>, ya que no genera síndrome de abstinencia. Sin embargo, puede crear una <strong>dependencia psicológica</strong>, especialmente ligada al sexo. Algunos usuarios pueden llegar a sentir que no pueden disfrutar de las relaciones sexuales de la misma manera sin su efecto.
                </p>
            </CardContent>
        </Card>

        <Alert variant="destructive">
            <Skull className="h-4 w-4" />
            <AlertTitle>Salud y Seguridad: Advertencias Cruciales</AlertTitle>
            <AlertDescription className="space-y-3 mt-2">
                 <p><strong>¡NUNCA INGERIR!</strong> El líquido es altamente tóxico si se ingiere. Puede causar ceguera, daño cerebral, fallo orgánico y la muerte.</p>
                 <p><strong>CONTACTO CON LA PIEL:</strong> El líquido es un irritante fuerte. Evita el contacto directo con la piel, ya que puede causar quemaduras químicas. Si ocurre, lava la zona con abundante agua.</p>
                 <p><strong>GRUPOS DE RIESGO:</strong> Deben evitar su uso personas con anemia, problemas cardíacos, presión arterial alta o baja, glaucoma, o quienes hayan sufrido traumatismos craneoencefálicos.</p>
            </AlertDescription>
        </Alert>

        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-6 w-6 text-primary"/>
                    <span>Riesgos al Mezclar con Otras Drogas</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {combinations.map(combo => (
                     <Alert key={combo.drug} variant={combo.variant}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Poppers + {combo.drug}</AlertTitle>
                        <AlertDescription>
                            {combo.effect}
                        </AlertDescription>
                    </Alert>
                 ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary"/>
                    <span>Efectos a Largo Plazo</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Aunque no se han demostrado efectos graves a largo plazo con un uso esporádico y correcto, el uso frecuente y prolongado puede conllevar riesgos:</p>
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {longTermEffects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <Button asChild size="lg">
                <Link href="/products">
                    Ver Nuestro Catálogo
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    </div>
  );
}
