import { useState } from "react";
import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { blogPosts, getAllCategories, getFeaturedPosts } from "@/data/blogPosts";
import { ArrowRight, Search, Calendar, Clock } from "lucide-react";

export default function BlogListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getAllCategories();
  const featuredPosts = getFeaturedPosts();

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary/50 to-background py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Insights &{" "}
              <span className="bg-gradient-to-r from-teal to-ocean bg-clip-text text-transparent">
                Thought Leadership
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Expert perspectives on operations, AI, supply chain, and the future of enterprise execution.
            </p>

            {/* Search */}
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border/40 py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {!searchQuery && !selectedCategory && featuredPosts.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-foreground">Featured Articles</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredPosts.slice(0, 2).map((post) => (
                <Link key={post.slug} to={`/website/blog/${post.slug}`} className="group">
                  <Card className="h-full overflow-hidden border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-teal/10 text-teal">
                          Featured
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground group-hover:text-teal">
                        {post.title}
                      </h3>
                      <p className="mb-4 flex-1 text-muted-foreground">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="flex items-center text-teal">
                          Read more
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            {searchQuery || selectedCategory ? "Results" : "All Articles"}
            {filteredPosts.length > 0 && (
              <span className="ml-2 text-lg font-normal text-muted-foreground">
                ({filteredPosts.length})
              </span>
            )}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">No articles found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Link key={post.slug} to={`/website/blog/${post.slug}`} className="group">
                  <Card className="h-full overflow-hidden border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <Badge variant="outline" className="mb-3 w-fit">
                        {post.category}
                      </Badge>
                      <h3 className="mb-3 text-lg font-semibold text-foreground group-hover:text-teal">
                        {post.title}
                      </h3>
                      <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{post.author.name}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-secondary/30 py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Stay Updated
            </h2>
            <p className="mb-6 text-muted-foreground">
              Get the latest insights on enterprise operations, AI, and supply chain delivered to your inbox.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Input placeholder="Enter your email" className="max-w-xs" />
              <Button className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
