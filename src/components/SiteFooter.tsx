import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} VolumCalc · volumcalc.com</p>
        <div className="flex gap-5">
          <Link to="/upload" className="transition-colors hover:text-foreground">
            Upload
          </Link>
          <Link to="/moving-inventory-list" className="transition-colors hover:text-foreground">
            Inventory guide
          </Link>
          <Link to="/en/moving-van-calculator" className="transition-colors hover:text-foreground">
            Van calculator
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/auth" className="transition-colors hover:text-foreground">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
