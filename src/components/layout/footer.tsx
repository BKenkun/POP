import Link from "next/link";

export function Footer() {
    return (
      <footer className="border-t border-border/40 mt-16 pt-12 pb-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} Popper España. Todos los derechos reservados.
            </p>
            <nav className="flex items-center gap-4">
               <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    );
  }
