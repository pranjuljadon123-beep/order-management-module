import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const platformLinks = [
  { title: "Platform Overview", href: "/website/platform", description: "See how all modules work together" },
  { title: "Order Management", href: "/website/solutions/orders", description: "Central execution spine for operations" },
  { title: "Document Intelligence", href: "/website/solutions/documents", description: "Smart document creation & management" },
  { title: "Procurement & Auctions", href: "/website/solutions/procurement", description: "RFQs and blind reverse auctions" },
  { title: "Tracking & Visibility", href: "/website/solutions/tracking", description: "Real-time multi-modal tracking" },
  { title: "Invoice Reconciliation", href: "/website/solutions/invoices", description: "Automated matching & validation" },
  { title: "AI Decision Engine", href: "/website/solutions/ai", description: "Intelligence layer for operations" },
];

const resourceLinks = [
  { title: "Blog", href: "/website/blog", description: "Insights and thought leadership" },
  { title: "Resources", href: "/website/resources", description: "Guides, whitepapers, and case studies" },
];

const companyLinks = [
  { title: "About Us", href: "/website/about", description: "Our story and mission" },
  { title: "Careers", href: "/website/careers", description: "Join our team" },
  { title: "Contact", href: "/website/contact", description: "Get in touch" },
];

export function WebsiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/website" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-ocean">
            <span className="text-lg font-bold text-white">O</span>
          </div>
          <span className="text-xl font-bold text-foreground">OpsFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Platform Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Platform</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[500px] gap-2 p-4 md:grid-cols-2">
                    {platformLinks.map((link) => (
                      <li key={link.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.href}
                            className={cn(
                              "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              location.pathname === link.href && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{link.title}</div>
                            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {link.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Solutions */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/website/how-it-works"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    )}
                  >
                    How It Works
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Resources Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-2 p-4">
                    {resourceLinks.map((link) => (
                      <li key={link.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.href}
                            className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{link.title}</div>
                            <p className="mt-1 text-xs leading-snug text-muted-foreground">
                              {link.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Company Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Company</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-2 p-4">
                    {companyLinks.map((link) => (
                      <li key={link.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.href}
                            className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{link.title}</div>
                            <p className="mt-1 text-xs leading-snug text-muted-foreground">
                              {link.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
            <Link to="/website/demo">Request a Demo</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background lg:hidden">
          <div className="container mx-auto space-y-4 px-4 py-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</p>
              {platformLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
              {resourceLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" asChild className="w-full">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-teal to-ocean">
                <Link to="/website/demo">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
