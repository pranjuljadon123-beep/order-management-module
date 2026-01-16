import { useState, useCallback, useMemo } from "react";
import type { Invoice, InvoiceFilter, InvoiceStats, TransportMode } from "@/types/invoices";

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "PLDS/60/24-2...",
    title: "OB1949 / 5453-40 Container",
    gid: "250226WXPG",
    mode: "fcl",
    vendor: { id: "v1", name: "Dachser Demo Distributor" },
    origin: { port: "JNPT (Nhava Sheva), Mumbai", country: "India", countryCode: "IN" },
    destination: { port: "Abidjan, Ivory Coast", country: "Ivory Coast", countryCode: "CI" },
    status: "pending",
    approvers: [],
    uploadedAt: new Date("2025-02-26T20:06:00"),
    invoiceAmount: 524885.99,
    expectedAmount: 100000,
    currency: "INR",
    hasAttachment: true,
    isStarred: false,
    isPriority: false,
    createdAt: new Date("2025-02-26"),
    updatedAt: new Date("2025-02-26"),
  },
  {
    id: "2",
    invoiceNumber: "7085645406",
    title: "Air 3 Way Matching",
    gid: "240923W5J2",
    mode: "air",
    vendor: { id: "v2", name: "DSV Demo Distributor" },
    origin: { port: "Laage Airport, Rostock-Laage", country: "Germany", countryCode: "DE" },
    destination: { port: "CSIA (Sahar) Airport, Mumbai", country: "India", countryCode: "IN" },
    status: "rejected",
    approvers: [],
    uploadedAt: new Date("2024-09-23T23:22:00"),
    reuploadedAt: new Date("2024-09-23T23:43:00"),
    invoiceAmount: 104076.71,
    expectedAmount: 100000,
    currency: "INR",
    hasAttachment: true,
    isStarred: false,
    isPriority: false,
    createdAt: new Date("2024-09-23"),
    updatedAt: new Date("2024-09-23"),
  },
  {
    id: "3",
    invoiceNumber: "5641001538",
    title: "FCL 3 Way Matching",
    gid: "240923568B",
    mode: "fcl",
    vendor: { id: "v2", name: "DSV Demo Distributor" },
    origin: { port: "Durban", country: "South Africa", countryCode: "ZA" },
    destination: { port: "Rotterdam", country: "Netherlands", countryCode: "NL" },
    status: "pending",
    approvers: [],
    uploadedAt: new Date("2024-09-23T23:21:00"),
    reuploadedAt: new Date("2024-09-23T23:36:00"),
    invoiceAmount: 109943.51,
    expectedAmount: 100000,
    currency: "INR",
    hasAttachment: true,
    isStarred: false,
    isPriority: false,
    createdAt: new Date("2024-09-23"),
    updatedAt: new Date("2024-09-23"),
  },
  {
    id: "4",
    invoiceNumber: "7033439760",
    title: "Air Demo",
    gid: "240923Y4TZ",
    mode: "air",
    vendor: { id: "v2", name: "DSV Demo Distributor" },
    origin: { port: "Laage Airport, Rostock-Laage", country: "Germany", countryCode: "DE" },
    destination: { port: "CSIA (Sahar) Airport, Mumbai", country: "India", countryCode: "IN" },
    status: "auto_approved",
    approvers: [],
    uploadedAt: new Date("2024-09-23T23:22:00"),
    invoiceAmount: 100000.42,
    expectedAmount: 100000,
    currency: "INR",
    hasAttachment: true,
    isStarred: false,
    isPriority: false,
    createdAt: new Date("2024-09-23"),
    updatedAt: new Date("2024-09-23"),
  },
  {
    id: "5",
    invoiceNumber: "",
    title: "Duplicate Invoice",
    gid: "2409237VLG",
    mode: "fcl",
    vendor: { id: "v2", name: "DSV Demo Distributor" },
    origin: { port: "JNPT (Nhava Sheva), Mumbai", country: "India", countryCode: "IN" },
    destination: { port: "Los Angeles", country: "USA", countryCode: "US" },
    status: "pending_approval",
    approvers: [],
    uploadedAt: new Date("2024-09-23T23:19:00"),
    invoiceAmount: 100000,
    expectedAmount: 100000,
    currency: "INR",
    hasAttachment: true,
    isStarred: false,
    isPriority: true,
    createdAt: new Date("2024-09-23"),
    updatedAt: new Date("2024-09-23"),
  },
  {
    id: "6",
    invoiceNumber: "MY10547576",
    title: "FCL Demo",
    gid: "240923ABCD",
    mode: "fcl",
    vendor: { id: "v2", name: "DSV Demo Distributor" },
    origin: { port: "JNPT (Nhava Sheva), Mumbai", country: "India", countryCode: "IN" },
    destination: { port: "Singapore", country: "Singapore", countryCode: "SG" },
    status: "approved",
    approvers: [],
    uploadedAt: new Date("2024-09-23T23:18:00"),
    invoiceAmount: 115000,
    expectedAmount: 100000,
    currency: "INR",
    hasAttachment: true,
    isStarred: true,
    isPriority: false,
    createdAt: new Date("2024-09-23"),
    updatedAt: new Date("2024-09-23"),
  },
  {
    id: "7",
    invoiceNumber: "PAY-2024-001",
    title: "Q3 Freight Charges",
    gid: "240901XYZQ",
    mode: "fcl",
    vendor: { id: "v1", name: "Dachser Demo Distributor" },
    origin: { port: "Shanghai", country: "China", countryCode: "CN" },
    destination: { port: "Hamburg", country: "Germany", countryCode: "DE" },
    status: "payment_processed",
    approvers: ["Finance Team"],
    uploadedAt: new Date("2024-09-01T10:00:00"),
    invoiceAmount: 250000,
    expectedAmount: 250000,
    currency: "USD",
    hasAttachment: true,
    isStarred: false,
    isPriority: false,
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2024-09-15"),
  },
];

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const stats: InvoiceStats = useMemo(() => ({
    all: invoices.length,
    paymentProcessed: invoices.filter(i => i.status === "payment_processed").length,
    approved: invoices.filter(i => i.status === "approved" || i.status === "auto_approved").length,
    pendingApproval: invoices.filter(i => i.status === "pending_approval" || i.status === "pending").length,
    rejected: invoices.filter(i => i.status === "rejected").length,
    canceled: invoices.filter(i => i.status === "canceled").length,
    archived: invoices.filter(i => i.status === "archived").length,
    starred: invoices.filter(i => i.isStarred).length,
  }), [invoices]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Apply filter
    switch (filter) {
      case "payment_processed":
        result = result.filter(i => i.status === "payment_processed");
        break;
      case "approved":
        result = result.filter(i => i.status === "approved" || i.status === "auto_approved");
        break;
      case "pending_approval":
        result = result.filter(i => i.status === "pending_approval" || i.status === "pending");
        break;
      case "rejected":
        result = result.filter(i => i.status === "rejected");
        break;
      case "canceled":
        result = result.filter(i => i.status === "canceled");
        break;
      case "archived":
        result = result.filter(i => i.status === "archived");
        break;
      case "starred":
        result = result.filter(i => i.isStarred);
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.gid.toLowerCase().includes(query) ||
        i.vendor.name.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }, [invoices, filter, searchQuery]);

  const toggleStar = useCallback((id: string) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, isStarred: !inv.isStarred } : inv)
    );
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedInvoices(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(i => i.id));
    }
  }, [filteredInvoices, selectedInvoices]);

  const approveInvoice = useCallback((id: string) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status: "approved" as const, updatedAt: new Date() } : inv)
    );
  }, []);

  const rejectInvoice = useCallback((id: string) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status: "rejected" as const, updatedAt: new Date() } : inv)
    );
  }, []);

  const deleteInvoices = useCallback((ids: string[]) => {
    setInvoices(prev => prev.filter(inv => !ids.includes(inv.id)));
    setSelectedInvoices([]);
  }, []);

  const archiveInvoices = useCallback((ids: string[]) => {
    setInvoices(prev =>
      prev.map(inv => ids.includes(inv.id) ? { ...inv, status: "archived" as const } : inv)
    );
    setSelectedInvoices([]);
  }, []);

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedInvoices,
    selectedInvoice,
    setSelectedInvoice,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    toggleStar,
    toggleSelect,
    selectAll,
    approveInvoice,
    rejectInvoice,
    deleteInvoices,
    archiveInvoices,
  };
}
