export function Footer() {
    return (
      <footer className="border-t border-border/40 mt-12">
        <div className="container flex items-center justify-center h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Popper España. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    );
  }
  