import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./ModeToggle";

export function NavBar() {
  const [, setLocation] = useLocation();
  const { session, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileMenuOpen(false);
  };

  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/energy-zone", label: "Energy Zone" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover-elevate rounded-lg px-2 py-1" data-testid="link-home">
          <Zap className="h-6 w-6 text-primary" />
          <span>EquiGrid AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="font-medium">{session?.companyName}</div>
                <div className="text-xs text-muted-foreground capitalize">{session?.role}</div>
              </div>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setLocation("/demo")} data-testid="button-demo">
                Request Demo
              </Button>
              <Button variant="default" onClick={() => setLocation("/login")} data-testid="button-login">
                Login
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors block py-2"
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="py-2 border-t">
                <div className="text-sm mb-2">
                  <div className="font-medium">{session?.companyName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{session?.role}</div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleLogout} data-testid="button-mobile-logout">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation("/demo");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-mobile-demo"
                >
                  Request Demo
                </Button>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setLocation("/login");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-mobile-login"
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
