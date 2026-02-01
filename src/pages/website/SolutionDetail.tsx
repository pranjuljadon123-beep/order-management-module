import { Link, useParams } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Check,
  Package,
  FileText,
  Gavel,
  Truck,
  Receipt,
  Brain,
} from "lucide-react";

interface SolutionData {
  slug: string;
  icon: JSX.Element;
  title: string;
  subtitle: string;
  description: string;
  problem: string;
  benefits: string[];
  features: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

const solutionsData: Record<string, SolutionData> = {
  orders: {
    slug: "orders",
    icon: <Package className="h-8 w-8" />,
    title: "Order Management",
    subtitle: "The Execution Spine of Your Operations",
    description: "Create, track, and manage orders across your entire operational workflow. OpsFlow Order Management serves as the central system of record, connecting all downstream processes.",
    problem: "Enterprises struggle with fragmented order data across multiple systems, leading to execution delays, lack of visibility, and compliance gaps. Without a unified order management system, teams waste hours reconciling data and chasing updates.",
    benefits: [
      "Single source of truth for all order data",
      "Complete lifecycle visibility from creation to delivery",
      "Automatic linking to documents, shipments, and invoices",
      "Full audit trails for compliance and governance",
      "Real-time status updates and exception alerts",
      "Bulk operations and smart automation rules",
    ],
    features: [
      { title: "Order Creation & Templates", description: "Create orders from templates, import from ERP systems, or generate from incoming customer requests." },
      { title: "Lifecycle Management", description: "Track every order through its complete lifecycle with automatic status transitions and milestone tracking." },
      { title: "Exception Handling", description: "Automated alerts for delays, discrepancies, and issues that need attention." },
      { title: "Integration Hub", description: "Connect to your ERP, WMS, and TMS systems with pre-built connectors and REST APIs." },
    ],
    faqs: [
      { question: "How does Order Management connect to other modules?", answer: "Orders serve as the execution spine. When you create an order, it automatically creates links to relevant documents, triggers procurement workflows, and establishes tracking requirements. All downstream data flows back to the order record." },
      { question: "Can we import existing orders from our ERP?", answer: "Yes, OpsFlow supports bulk import from major ERP systems including SAP, Oracle, and Microsoft Dynamics. We also provide REST APIs and webhooks for real-time integration." },
      { question: "How are audit trails maintained?", answer: "Every change to an order is logged with timestamp, user, and before/after values. You can view the complete history of any order and export audit reports for compliance purposes." },
    ],
  },
  documents: {
    slug: "documents",
    icon: <FileText className="h-8 w-8" />,
    title: "Document Intelligence",
    subtitle: "Smart Document Creation & Compliance Automation",
    description: "Auto-generate documents from operational data, manage versions, and ensure compliance with built-in validation rules. Every document is linked to its operational context.",
    problem: "Manual document creation is error-prone, time-consuming, and creates compliance risk. Teams spend countless hours creating, reviewing, and chasing approvals on documents that could be automated.",
    benefits: [
      "Auto-generate documents from order and execution data",
      "Version control with full change history",
      "Approval workflows with configurable rules",
      "Compliance validation and risk scoring",
      "Template library for standardized documents",
      "Digital signatures and secure sharing",
    ],
    features: [
      { title: "Template Engine", description: "Create document templates that auto-populate from your operational data. No manual data entry required." },
      { title: "Version Control", description: "Track every change with complete version history. Compare versions and restore previous states." },
      { title: "Approval Workflows", description: "Configure multi-step approval processes with role-based routing and escalation rules." },
      { title: "Compliance Validation", description: "Built-in rules validate documents against regulatory requirements and flag issues before submission." },
    ],
    faqs: [
      { question: "What document types can be auto-generated?", answer: "OpsFlow supports all common trade documents including commercial invoices, packing lists, certificates of origin, bills of lading, and customs declarations. You can also create custom templates for your specific needs." },
      { question: "How does compliance validation work?", answer: "Our AI-powered validation engine checks documents against regulatory requirements based on origin/destination countries, product types, and trade agreements. It flags missing fields, inconsistencies, and potential compliance issues." },
      { question: "Can we integrate with e-signature providers?", answer: "Yes, we integrate with DocuSign, Adobe Sign, and other major e-signature providers. You can also use our built-in digital signature capability." },
    ],
  },
  procurement: {
    slug: "procurement",
    icon: <Gavel className="h-8 w-8" />,
    title: "Procurement & Reverse Auctions",
    subtitle: "Fair, Transparent, and Efficient Sourcing",
    description: "Run spot and contract RFQs with blind reverse auctions. Vendors see only their rank, not competitor quotes, ensuring fair competition and optimal pricing.",
    problem: "Traditional procurement is opaque, time-consuming, and often favors incumbent vendors. Without proper tools, procurement teams can't ensure fair competition or optimize for best value.",
    benefits: [
      "Blind reverse auctions for fair competition",
      "Automated vendor onboarding and qualification",
      "Real-time bid comparison and analysis",
      "Contract management with rate card generation",
      "Vendor performance tracking and scoring",
      "Significant cost savings through competition",
    ],
    features: [
      { title: "RFQ Management", description: "Create and distribute RFQs to qualified vendors. Track responses and manage the entire bidding process." },
      { title: "Blind Auctions", description: "Run reverse auctions where vendors see only their rank. No bid details visible to competitors." },
      { title: "Vendor Portal", description: "Dedicated portal for vendors to receive RFQs, submit quotes, and track their performance." },
      { title: "Award & Contracts", description: "Make award decisions with full audit trails. Auto-generate rate cards and contracts." },
    ],
    faqs: [
      { question: "How do blind reverse auctions work?", answer: "In a blind auction, vendors submit their bids without seeing competitor quotes. They only see their current rank (e.g., 'You are ranked #2 of 5 bidders'). This ensures fair competition based on value, not just matching competitor prices." },
      { question: "Can we run multi-round auctions?", answer: "Yes, you can configure multi-round auctions with minimum bid decrements, auto-extend rules, and round-specific visibility settings." },
      { question: "How are vendors qualified?", answer: "Our vendor management system includes qualification workflows, document collection, performance scoring, and compliance verification. Only qualified vendors can participate in relevant RFQs." },
    ],
  },
  tracking: {
    slug: "tracking",
    icon: <Truck className="h-8 w-8" />,
    title: "Tracking & Visibility",
    subtitle: "Real-Time Multi-Modal Shipment Tracking",
    description: "Track shipments across all modes with predictive ETAs and exception alerts. Complete visibility from origin to destination, connected to your orders.",
    problem: "Shipment visibility is fragmented across carriers and modes. Teams spend hours checking carrier portals, making calls, and manually updating systems. Exceptions are discovered too late to take corrective action.",
    benefits: [
      "Multi-modal tracking in one unified view",
      "Predictive ETAs using AI and historical data",
      "Proactive exception alerts and notifications",
      "Milestone tracking with SLA monitoring",
      "Connected to orders and documents",
      "Customer-facing visibility portals",
    ],
    features: [
      { title: "Unified Tracking", description: "Track ocean, air, road, and rail shipments in one platform. No more switching between carrier portals." },
      { title: "Predictive ETAs", description: "AI-powered predictions that learn from historical data and current conditions to provide accurate arrival estimates." },
      { title: "Exception Management", description: "Automated detection of delays, route deviations, and other exceptions. Get alerts before problems escalate." },
      { title: "Customer Portal", description: "Provide customers with self-service tracking without exposing sensitive operational details." },
    ],
    faqs: [
      { question: "What carriers and modes are supported?", answer: "We support all major ocean carriers (Maersk, MSC, CMA CGM, etc.), airlines, trucking companies, and rail operators. Our integration layer connects to carrier APIs and tracking services automatically." },
      { question: "How accurate are predictive ETAs?", answer: "Our AI model achieves 95%+ accuracy within 24 hours of arrival. Predictions improve over time as the system learns from your specific lanes and carriers." },
      { question: "Can customers track their own shipments?", answer: "Yes, you can provide customers with a branded portal or embed tracking widgets in your own systems. You control exactly what information is visible to each customer." },
    ],
  },
  invoices: {
    slug: "invoices",
    icon: <Receipt className="h-8 w-8" />,
    title: "Invoice Reconciliation",
    subtitle: "Automated Matching & Discrepancy Detection",
    description: "Match invoices with contracts, orders, and actual execution. Automatically detect discrepancies and reduce manual finance effort.",
    problem: "Finance teams spend enormous time manually reconciling invoices against contracts and orders. Discrepancies are discovered late, leading to payment delays, vendor disputes, and revenue leakage.",
    benefits: [
      "Automatic three-way matching (order, contract, invoice)",
      "Instant discrepancy detection and flagging",
      "AI-powered extraction from PDF invoices",
      "Approval workflows with exception routing",
      "Analytics on spend and vendor performance",
      "Integration with ERP and payment systems",
    ],
    features: [
      { title: "Intelligent Matching", description: "Automatic matching of invoices to orders, contracts, and actual execution data. Flags mismatches instantly." },
      { title: "Invoice Capture", description: "AI extracts data from PDF and image invoices. No manual data entry required." },
      { title: "Discrepancy Resolution", description: "Workflow for investigating and resolving discrepancies. Maintain audit trails for all decisions." },
      { title: "Analytics & Reporting", description: "Spend analytics, vendor scorecards, and payment optimization recommendations." },
    ],
    faqs: [
      { question: "What types of discrepancies are detected?", answer: "We detect quantity mismatches, rate differences, surcharge discrepancies, duplicate invoices, and timing issues. Each discrepancy is categorized and routed to the appropriate team." },
      { question: "How does AI invoice capture work?", answer: "Our AI extracts key fields (vendor, amounts, line items, dates) from PDF and image invoices with 98%+ accuracy. Uncertain fields are flagged for human review." },
      { question: "Can we integrate with our ERP for payments?", answer: "Yes, we integrate with SAP, Oracle, NetSuite, and other major ERPs. Approved invoices can be automatically pushed to your payment system." },
    ],
  },
  ai: {
    slug: "ai",
    icon: <Brain className="h-8 w-8" />,
    title: "AI Decision Engine",
    subtitle: "Predictive Intelligence with Explainable AI",
    description: "AI agents analyze your operational data to predict issues, recommend actions, and automate decisions — with full explainability. No black boxes.",
    problem: "Operations teams are drowning in data but starving for insights. Traditional BI tools show what happened, but don't predict what will happen or recommend what to do about it.",
    benefits: [
      "Predictive insights across all operations",
      "Explainable AI with clear reasoning",
      "Automated recommendations and alerts",
      "Continuous learning from your data",
      "Configurable automation rules",
      "Human-in-the-loop for critical decisions",
    ],
    features: [
      { title: "Prediction Engine", description: "Predict delays, exceptions, and issues before they happen. Take proactive action to prevent problems." },
      { title: "Recommendation System", description: "AI-powered recommendations for routing, carrier selection, and process optimization." },
      { title: "Anomaly Detection", description: "Automatically detect unusual patterns in orders, invoices, and execution data." },
      { title: "Automation Rules", description: "Configure rules to automate routine decisions. AI handles the simple cases, humans focus on exceptions." },
    ],
    faqs: [
      { question: "How does explainable AI work?", answer: "Every prediction and recommendation comes with clear reasoning. You can see what factors influenced the AI's decision and how confident it is. No black boxes." },
      { question: "What data does the AI use?", answer: "The AI learns from your historical operational data — orders, shipments, invoices, exceptions, and outcomes. It also incorporates external data like weather, port congestion, and market conditions." },
      { question: "Can we control what the AI automates?", answer: "Absolutely. You configure automation rules and thresholds. The AI can suggest actions (human approval required), auto-execute low-risk decisions, or escalate uncertain cases." },
    ],
  },
};

export default function SolutionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const solution = slug ? solutionsData[slug] : null;

  if (!solution) {
    return (
      <WebsiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Solution not found</h1>
          <Button asChild className="mt-4">
            <Link to="/website/platform">Back to Platform</Link>
          </Button>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal to-ocean text-white">
              {solution.icon}
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              {solution.title}
            </h1>
            <p className="mb-2 text-xl font-medium text-teal">{solution.subtitle}</p>
            <p className="mb-8 text-lg text-muted-foreground">{solution.description}</p>
            <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
              <Link to="/website/demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-6 lg:p-8">
                <h2 className="mb-4 text-xl font-semibold text-foreground">The Problem</h2>
                <p className="text-muted-foreground">{solution.problem}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
              Key Benefits
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {solution.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-lg bg-background p-4">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal/10">
                    <Check className="h-4 w-4 text-teal" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
              Key Features
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {solution.features.map((feature) => (
                <Card key={feature.title} className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {solution.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="rounded-lg border border-border/50 bg-background px-6"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              See {solution.title} in action. Request a personalized demo with our team.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
                <Link to="/website/demo">
                  Request a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/website/platform">Explore All Modules</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
