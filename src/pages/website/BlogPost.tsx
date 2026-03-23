import { useParams, Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPost, blogPosts } from "@/data/blogPosts";
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : null;

  // Get related posts
  const relatedPosts = post
    ? blogPosts
        .filter((p) => p.slug !== post.slug && p.category === post.category)
        .slice(0, 2)
    : [];

  if (!post) {
    return (
      <WebsiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Article not found</h1>
          <Button asChild className="mt-4">
            <Link to="/website/blog">Back to Blog</Link>
          </Button>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      {/* Article Header */}
      <article className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* Breadcrumb */}
            <Link
              to="/website/blog"
              className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>

            {/* Meta */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge variant="outline">{post.category}</Badge>
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-secondary/50">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              {post.title}
            </h1>

            {/* Author & Date */}
            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                  <User className="h-5 w-5 text-teal" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-xs">{post.author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="mb-8 text-lg text-muted-foreground">{post.excerpt}</p>

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="mb-4 mt-10 text-2xl font-bold text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-8 text-xl font-semibold text-foreground">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-4 list-disc space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-4 list-decimal space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 border-l-4 border-teal pl-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="mt-12 border-t border-border/40 pt-8">
              <p className="mb-3 text-sm font-medium text-foreground">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-2xl font-bold text-foreground">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.slug} to={`/website/blog/${relatedPost.slug}`} className="group">
                    <Card className="h-full border-border/50 transition-all hover:border-teal/30 hover:shadow-lg">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="mb-2 font-semibold text-foreground group-hover:text-teal">
                          {relatedPost.title}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <span className="flex items-center text-sm text-teal">
                          Read more
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Ready to Transform Your Operations?
            </h2>
            <p className="mb-6 text-muted-foreground">
              See how Foraxis can put these insights into action for your enterprise.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-teal to-ocean hover:opacity-90">
              <Link to="/website/demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
