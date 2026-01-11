// Entity Types for Procurement Module

export interface Shipper {
  id: string;
  name: string;
  code?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  port_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Consignee {
  id: string;
  name: string;
  code?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  port_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  code?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  billing_address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Weight units
export const WEIGHT_UNITS = [
  { value: 'KG', label: 'Kilograms (kg)' },
  { value: 'MT', label: 'Metric Tons (MT)' },
  { value: 'LBS', label: 'Pounds (lbs)' },
  { value: 'TON', label: 'Short Tons' },
] as const;

// Volume units  
export const VOLUME_UNITS = [
  { value: 'CBM', label: 'Cubic Meters (CBM)' },
  { value: 'CFT', label: 'Cubic Feet (CFT)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'GAL', label: 'Gallons (GAL)' },
] as const;

// Dimension units
export const DIMENSION_UNITS = [
  { value: 'CM', label: 'Centimeters (cm)' },
  { value: 'M', label: 'Meters (m)' },
  { value: 'IN', label: 'Inches (in)' },
  { value: 'FT', label: 'Feet (ft)' },
] as const;

// Package types
export const PACKAGE_TYPES = [
  { value: 'pallet', label: 'Pallet' },
  { value: 'box', label: 'Box/Carton' },
  { value: 'crate', label: 'Crate' },
  { value: 'drum', label: 'Drum' },
  { value: 'bag', label: 'Bag' },
  { value: 'roll', label: 'Roll' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'container', label: 'Container' },
  { value: 'loose', label: 'Loose Cargo' },
] as const;

// Cargo types
export const CARGO_TYPES = [
  { value: 'general', label: 'General Cargo' },
  { value: 'dangerous', label: 'Dangerous Goods (DG)' },
  { value: 'refrigerated', label: 'Refrigerated/Reefer' },
  { value: 'oversized', label: 'Oversized/OOG' },
  { value: 'fragile', label: 'Fragile' },
  { value: 'perishable', label: 'Perishable' },
  { value: 'liquid', label: 'Liquid Bulk' },
  { value: 'dry_bulk', label: 'Dry Bulk' },
  { value: 'vehicles', label: 'Vehicles/RoRo' },
  { value: 'livestock', label: 'Livestock' },
] as const;

export type WeightUnit = typeof WEIGHT_UNITS[number]['value'];
export type VolumeUnit = typeof VOLUME_UNITS[number]['value'];
export type DimensionUnit = typeof DIMENSION_UNITS[number]['value'];
export type PackageType = typeof PACKAGE_TYPES[number]['value'];
export type CargoType = typeof CARGO_TYPES[number]['value'];
