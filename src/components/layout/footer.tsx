export function Footer() {
    return (
      <footer className="border-t border-border/40">
        <div className="container flex items-center justify-center h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PuroRush. All Rights Reserved.
          </p>
        </div>
      </footer>
    );
  }
  