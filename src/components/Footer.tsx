import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">CF</span>
              </div>
              <span className="font-heading font-bold text-lg">ContentForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Turn one blog post into a week of content across 7 platforms.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://bengalinnovative.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="https://bengalinnovative.com/contact" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 Bengal Innovative Limited. All rights reserved.
        </div>
      </div>
    </footer>
  );
}