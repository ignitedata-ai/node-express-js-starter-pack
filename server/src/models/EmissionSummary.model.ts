import type { EmissionSummary as PrismaEmissionSummary } from '@prisma/client';
import type { EmissionSummaryResponse } from '../types/cargo.types';

export class EmissionSummaryModel {
  readonly id: string;
  readonly upstreamCO2: number;
  readonly upstreamCH4: number;
  readonly upstreamN2O: number;
  readonly upstreamCO2e: number;
  readonly shippingCO2: number;
  readonly shippingCH4: number;
  readonly shippingN2O: number;
  readonly shippingCO2e: number;
  readonly downstreamCO2e: number;
  readonly totalWtWCO2e: number;
  readonly emissionIntensity: number;
  readonly methaneIntensity: number;

  constructor(row: PrismaEmissionSummary) {
    this.id = row.id;
    this.upstreamCO2 = row.upstreamCO2;
    this.upstreamCH4 = row.upstreamCH4;
    this.upstreamN2O = row.upstreamN2O;
    this.upstreamCO2e = row.upstreamCO2e;
    this.shippingCO2 = row.shippingCO2;
    this.shippingCH4 = row.shippingCH4;
    this.shippingN2O = row.shippingN2O;
    this.shippingCO2e = row.shippingCO2e;
    this.downstreamCO2e = row.downstreamCO2e;
    this.totalWtWCO2e = row.totalWtWCO2e;
    this.emissionIntensity = row.emissionIntensity;
    this.methaneIntensity = row.methaneIntensity;
  }

  breakdownByPhase() {
    return {
      upstream: this.upstreamCO2e,
      shipping: this.shippingCO2e,
      downstream: this.downstreamCO2e,
      total: this.totalWtWCO2e,
    };
  }

  toJSON(): EmissionSummaryResponse {
    return {
      id: this.id,
      upstreamCO2: this.upstreamCO2,
      upstreamCH4: this.upstreamCH4,
      upstreamN2O: this.upstreamN2O,
      upstreamCO2e: this.upstreamCO2e,
      shippingCO2: this.shippingCO2,
      shippingCH4: this.shippingCH4,
      shippingN2O: this.shippingN2O,
      shippingCO2e: this.shippingCO2e,
      downstreamCO2e: this.downstreamCO2e,
      totalWtWCO2e: this.totalWtWCO2e,
      emissionIntensity: this.emissionIntensity,
      methaneIntensity: this.methaneIntensity,
    };
  }
}
