import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, BookOpen, Video, Download } from "lucide-react";

const resources = [
  {
    type: "Guide",
    icon: <BookOpen className="h-5 w-5" />,
    title: "The Complete Guide to Operational Execution",
    description: "Learn how to build an execution-first operations strategy for your enterprise.",
    tag: "Popular",
  },
  {
    type: "Whitepaper",
    icon: <FileText className="h-5 w-5" />,
    title: "AI in Supply Chain: From Hype to Reality",
    description: "A practical framework for implementing AI in enterprise operations.",
    tag: "New",
  },
  {
    type: "Case Study",
    icon: <FileText className="h-5 w-5" />,
    title: "How Fortune 500 Logistics Leader Achieved 40% Efficiency Gains",
    description: "Real results from a global implementation across 30+ countries.",
    tag: null,
  },
  {
    type: "Webinar",
    icon: <Video className="h-5 w-5" />,
    title: "Building the Execution Spine: Architecture Deep Dive",
    description: "Technical session on designing integrated operational platforms.",
    tag: "Recording",
  },
  {
    type: "Guide",
    icon: <BookOpen className="h-5 w-5" />,
    title: "Document Intelligence Best Practices",
    description: "Automate document creation and compliance for global trade.",
    tag: null,
  },
  {
    type: "Whitepaper",
    icon: <FileText className="h-5 w-5" />,
    title: "The ROI of Blind Reverse Auctions",
    description: "Data-driven analysis of procurement savings from competitive bidding.",
    tag: null,
  },
];

export default function Resources() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Resources &{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Learning
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Guides, whitepapers, case studies, and webinars to help you transform your operations.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Resource */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="overflow-hidden border-teal/30 bg-gradient-to-r from-teal/5 to-ocean/5">
            <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <Badge className="mb-4 bg-teal/10 text-teal">Featured Resource</Badge>
                <h2 className="mb-3 text-2xl font-bold text-foreground">
                  2026 State of Operations Report
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Insights from 500+ enterprise operations leaders on the trends, challenges, 
                  and opportunities shaping the industry.
                </p>
                <Button className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
              <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-ocean">
                <FileText className="h-16 w-16 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">All Resources</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="ghost" size="sm">Guides</Button>
              <Button variant="ghost" size="sm">Whitepapers</Button>
              <Button variant="ghost" size="sm">Case Studies</Button>
              <Button variant="ghost" size="sm">Webinars</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <Card key={index} className="group cursor-pointer border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
                      {resource.icon}
                    </div>
                    {resource.tag && (
                      <Badge variant="secondary" className="text-xs">
                        {resource.tag}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-3 w-fit text-xs">
                    {resource.type}
                  </Badge>
                  <h3 className="mb-2 font-semibold text-foreground group-hover:text-teal">
                    {resource.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground">{resource.description}</p>
                  <div className="flex items-center text-sm font-medium text-teal">
                    Access Resource
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog CTA */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Looking for more insights?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Check out our blog for the latest thinking on operations, AI, and enterprise execution.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
              <Link to="/website/blog">
                Visit the Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
