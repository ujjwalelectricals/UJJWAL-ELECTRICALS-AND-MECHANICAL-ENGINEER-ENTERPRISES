import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    default: "Industrial Machine Service in Ghaziabad | UJJWAL ELECTRICALS",
    template: "%s | UJJWAL ELECTRICALS"
  },
  description:
    "CNC, VMC, HMC, FANUC, welding, DG, air compressor, hydraulic, pneumatic, milling, gear shaper and radial drill machine service support in Ghaziabad and Delhi NCR.",
  keywords: [
    "CNC machine service Ghaziabad",
    "VMC machine service Ghaziabad",
    "HMC machine service Ghaziabad",
    "industrial machine maintenance Ghaziabad"
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    telephone: ["+91" + site.phone, "+91" + site.altPhone],
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sector-9, H.No. 2313, Block-51, Siddharth Vihar",
      addressLocality: "Ghaziabad",
      addressRegion: "Uttar Pradesh",
      postalCode: "201009",
      addressCountry: "IN"
    },
    areaServed: ["Ghaziabad", "Delhi NCR"]
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
        <header>
          <div className="wrap nav">
            <a href="/" className="brand"><b>UE</b><span>UJJWAL ELECTRICALS</span></a>
            <nav>
              <a href="/">Home</a>
              <a href="/services">Services</a>
              <a href="/contact">Request Service</a>
              <a className="call" href={"tel:+91" + site.phone}>Call Now</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="wrap foot">
            <div>
              <b>UJJWAL ELECTRICALS</b>
              <p>Industrial machine service & maintenance for Ghaziabad and Delhi NCR.</p>
            </div>
            <div>
              <b>Contact</b>
              <a href={"tel:+91" + site.phone}>{site.phone}</a>
              <a href={"tel:+91" + site.altPhone}>{site.altPhone}</a>
              <a href={"mailto:" + site.email}>{site.email}</a>
            </div>
            <div>
              <b>Location</b>
              <p>{site.address}</p>
            </div>
          </div>
          <div className="wrap bottom">
            © {new Date().getFullYear()} {site.name} · GSTIN {site.gstin}
          </div>
        </footer>
        <div className="mobilebar">
          <a href={"tel:+91" + site.phone}>Call</a>
          <a target="_blank" rel="noreferrer" href={"https://wa.me/91" + site.phone + "?text=Hello%2C%20I%20need%20industrial%20machine%20service."}>WhatsApp</a>
          <a href="/contact">Request</a>
        </div>
      </body>
    </html>
  );
}