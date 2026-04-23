export type CargoStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface EmissionSummaryResponse {
  id: string;
  upstreamCO2: number;
  upstreamCH4: number;
  upstreamN2O: number;
  upstreamCO2e: number;
  shippingCO2: number;
  shippingCH4: number;
  shippingN2O: number;
  shippingCO2e: number;
  downstreamCO2e: number;
  totalWtWCO2e: number;
  emissionIntensity: number;
  methaneIntensity: number;
}

export interface CargoResponse {
  id: string;
  cargoId: string;
  vesselName: string;
  quantity: number;
  energyContent: number;
  loadingDate: string;
  deliveryDate: string | null;
  status: CargoStatus;
  emissionSummary: EmissionSummaryResponse | null;
  createdAt: string;
  updatedAt: string;
}
