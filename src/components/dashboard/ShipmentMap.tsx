import { MapPin, Ship, Plane, Truck } from "lucide-react";

const shipmentLocations = [
  { id: 1, type: "ocean", lat: 35, lng: 139, label: "Tokyo Port", status: "in-transit" },
  { id: 2, type: "air", lat: 51, lng: -0.1, label: "London Heathrow", status: "arrived" },
  { id: 3, type: "ocean", lat: 1.3, lng: 103.8, label: "Singapore Port", status: "in-transit" },
  { id: 4, type: "road", lat: 40.7, lng: -74, label: "New York Hub", status: "delayed" },
  { id: 5, type: "air", lat: 25.2, lng: 55.3, label: "Dubai Airport", status: "in-transit" },
  { id: 6, type: "ocean", lat: 22.3, lng: 114.2, label: "Hong Kong", status: "in-transit" },
  { id: 7, type: "road", lat: 52.5, lng: 13.4, label: "Berlin DC", status: "arrived" },
];

const getIcon = (type: string) => {
  switch (type) {
    case "ocean":
      return Ship;
    case "air":
      return Plane;
    default:
      return Truck;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "arrived":
      return "bg-success text-success-light";
    case "delayed":
      return "bg-warning text-warning-light";
    default:
      return "bg-accent text-accent-foreground";
  }
};

export function ShipmentMap() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div>
          <h3 className="font-semibold text-foreground">Global Shipment Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Real-time visibility across all transport modes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">In Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Arrived</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Delayed</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px] bg-gradient-to-br from-navy/5 to-accent/5">
        {/* World Map SVG Background */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 h-full w-full opacity-20"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M150,200 Q200,180 250,200 T350,190 T450,200 T550,185 T650,195 T750,200 T850,190"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
          <path
            d="M100,250 Q200,230 300,250 T500,240 T700,250 T900,240"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
          <path
            d="M150,300 Q250,280 350,300 T550,290 T750,300 T900,290"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
          {/* Continents simplified shapes */}
          <ellipse cx="200" cy="200" rx="80" ry="60" className="fill-muted/30" />
          <ellipse cx="500" cy="180" rx="100" ry="70" className="fill-muted/30" />
          <ellipse cx="750" cy="220" rx="90" ry="80" className="fill-muted/30" />
          <ellipse cx="600" cy="320" rx="60" ry="40" className="fill-muted/30" />
          <ellipse cx="200" cy="350" rx="70" ry="50" className="fill-muted/30" />
        </svg>

        {/* Shipment Markers */}
        {shipmentLocations.map((location, index) => {
          const Icon = getIcon(location.type);
          // Convert lat/lng to approximate x/y positions
          const x = ((location.lng + 180) / 360) * 100;
          const y = ((90 - location.lat) / 180) * 100;

          return (
            <div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fade-in group cursor-pointer"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 ${getStatusColor(
                  location.status
                )}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-sm text-background shadow-lg">
                  <p className="font-medium">{location.label}</p>
                  <p className="text-xs capitalize opacity-80">{location.status}</p>
                </div>
              </div>
              {/* Pulse animation for in-transit */}
              {location.status === "in-transit" && (
                <div className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
              )}
            </div>
          );
        })}

        {/* Route Lines */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M 88% 28% Q 70% 35% 50% 35%"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="2"
            strokeDasharray="8,4"
          />
          <path
            d="M 50% 35% Q 40% 45% 27% 45%"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="2"
            strokeDasharray="8,4"
          />
        </svg>
      </div>
    </div>
  );
}
