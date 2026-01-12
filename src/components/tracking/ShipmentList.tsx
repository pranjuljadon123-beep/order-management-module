import { ShipmentCard } from "./ShipmentCard";

const mockShipments = [
  {
    containerId: "TRHU6873407",
    rfNumber: undefined,
    isNew: true,
    carrier: { code: "MSCU", name: "MSC" },
    origin: { port: "Ennore, India, INENR", country: "India", countryCode: "IN" },
    destination: { port: "Chicago, USA, USCHI", country: "USA", countryCode: "US" },
    consignee: "Demo_Con...",
    carrierEta: undefined,
    prediction: { daysLate: 13 },
    status: "delayed" as const,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    alert: "Carrier ETA Delayed by 1 day for New York, US. Old Carrier ETA: 2026-02-13 to New Carrier ETA: 2026-02-14.",
  },
  {
    containerId: "MEDUKJ783019",
    rfNumber: undefined,
    isNew: true,
    carrier: { code: "MSCU", name: "MSC" },
    origin: { port: "Rotterdam, Netherlands", country: "Netherlands", countryCode: "NL" },
    destination: { port: "Kampala, Uganda, UGKL", country: "Uganda", countryCode: "UG" },
    consignee: "Demo_Con...",
    carrierEta: undefined,
    prediction: { daysLate: 11 },
    status: "active" as const,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
    alert: "Carrier ETA Pre-poned by 1 day for Mombasa, KE. Old Carrier ETA: 2026-03-14 to New Carrier ETA: 2026-03-13.",
  },
  {
    containerId: "CXRU1542167",
    rfNumber: undefined,
    isNew: true,
    carrier: { code: "MSCU", name: "MSC" },
    origin: { port: "JNPT (Nhava Sheva), Mumbai", country: "India", countryCode: "IN" },
    destination: { port: "New York, USA, USNYC", country: "USA", countryCode: "US" },
    consignee: "Demo_Con...",
    carrierEta: "09 Feb 2026",
    prediction: { daysLate: 2 },
    status: "delayed" as const,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 2 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
  },
  {
    containerId: "HLBU2847592",
    rfNumber: "RF-2026-001",
    isNew: false,
    carrier: { code: "HLCU", name: "Hapag-Lloyd" },
    origin: { port: "Shanghai, China", country: "China", countryCode: "CN" },
    destination: { port: "Hamburg, Germany", country: "Germany", countryCode: "DE" },
    consignee: "Freight_Co...",
    carrierEta: "15 Feb 2026",
    prediction: { daysLate: 0 },
    status: "on-time" as const,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 1, total: 1 },
      destination: false,
      gateOut: false,
      emptyReturn: false,
    },
  },
  {
    containerId: "EGLV3948271",
    rfNumber: "RF-2026-002",
    isNew: false,
    carrier: { code: "EGLV", name: "Evergreen" },
    origin: { port: "Singapore", country: "Singapore", countryCode: "SG" },
    destination: { port: "Dubai, UAE", country: "UAE", countryCode: "AE" },
    consignee: "Global_Im...",
    carrierEta: "20 Jan 2026",
    prediction: { daysLate: 0 },
    status: "completed" as const,
    progress: {
      emptyPickup: true,
      gateIn: true,
      origin: true,
      transhipment: { current: 0, total: 0 },
      destination: true,
      gateOut: true,
      emptyReturn: true,
    },
  },
];

export function ShipmentList() {
  return (
    <div className="flex flex-col gap-4">
      {mockShipments.map((shipment) => (
        <ShipmentCard key={shipment.containerId} {...shipment} />
      ))}
    </div>
  );
}
