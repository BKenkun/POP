import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function Footer() {
    return (
      <footer className="border-t border-border/40 mt-16 pt-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="font-semibold text-lg mb-3">Popper España</h3>
              <p className="text-sm text-muted-foreground">
                La tienda oficial de productos Popper en España. Calidad y discreción garantizadas.
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-3">Suscríbete a nuestro boletín</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Puede cancelar su suscripción en cualquier momento. Para ello, consulte nuestra información de contacto en la declaración legal.
              </p>
              <form className="flex w-full max-w-md items-center space-x-2">
                <Input type="email" placeholder="Enter your email..." className="flex-1" />
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Suscribirse</span>
                </Button>
              </form>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Popper España. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    );
  }