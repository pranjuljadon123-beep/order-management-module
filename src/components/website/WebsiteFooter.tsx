import { Link } from "react-router-dom";
import { Linkedin, Twitter, Youtube } from "lucide-react";
import foraxisLogo from "@/assets/foraxis-logo.png";

const footerLinks = {
  platform: [
    { title: "Platform Overview", href: "/website/platform" },
    { title: "Order Management", href: "/website/solutions/orders" },
    { title: "Document Intelligence", href: "/website/solutions/documents" },
    { title: "Procurement & Auctions", href: "/website/solutions/procurement" },
    { title: "Tracking & Visibility", href: "/website/solutions/tracking" },
    { title: "Invoice Reconciliation", href: "/website/solutions/invoices" },
    { title: "AI Decision Engine", href: "/website/solutions/ai" },
  ],
  resources: [
    { title: "Blog", href: "/website/blog" },
    { title: "Resources", href: "/website/resources" },
    { title: "Documentation", href: "#" },
    { title: "API Reference", href: "#" },
  ],
  company: [
    { title: "About Us", href: "/website/about" },
    { title: "Careers", href: "/website/careers" },
    { title: "Contact", href: "/website/contact" },
    { title: "Partners", href: "#" },
  ],
  legal: [
    { title: "Privacy Policy", href: "#" },
    { title: "Terms of Service", href: "#" },
    { title: "Security", href: "#" },
    { title: "Compliance", href: "#" },
  ],
};

export function WebsiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-secondary/30">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/website" className="flex items-center gap-2">
              <img src={foraxisLogo} alt="Foraxis" className="h-9 w-auto" />
              <span className="text-xl font-bold text-foreground">Foraxis</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The execution backbone for enterprise operations, with intelligence layered on top.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Foraxis. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
