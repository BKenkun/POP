
export function Footer() {
    return (
      <footer className="border-t border-border/40 mt-16 pt-12 pb-8">
        <div className="container">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Popper España. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    );
  }
