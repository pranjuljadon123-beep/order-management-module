import { AppLayout } from "@/components/layout/AppLayout";
import { Construction, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 mb-6">
          <Construction className="h-10 w-10 text-accent" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Open Dashboard
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlaceholderPage;
