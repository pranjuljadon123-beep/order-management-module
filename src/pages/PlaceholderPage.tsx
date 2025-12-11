import { AppLayout } from "@/components/layout/AppLayout";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <AppLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mb-6">
          <Construction className="h-10 w-10 text-accent" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          {description}
        </p>
      </div>
    </AppLayout>
  );
};

export default PlaceholderPage;
