import type { Cargo as PrismaCargo, EmissionSummary as PrismaEmissionSummary } from '@prisma/client';
import type { CargoStatus, CargoResponse } from '../types/cargo.types';
import { EmissionSummaryModel } from './EmissionSummary.model';

type PrismaCargoWithSummary = PrismaCargo & {
  emissionSummary?: PrismaEmissionSummary | null;
};

export class CargoModel {
  readonly id: string;
  readonly cargoId: string;
  readonly vesselName: string;
  readonly quantity: number;
  readonly energyContent: number;
  readonly loadingDate: string;
  readonly deliveryDate: string | null;
  readonly status: CargoStatus;
  readonly emissionSummary: EmissionSummaryModel | null;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(row: PrismaCargoWithSummary) {
    this.id = row.id;
    this.cargoId = row.cargoId;
    this.vesselName = row.vesselName;
    this.quantity = row.quantity;
    this.energyContent = row.energyContent;
    this.loadingDate = row.loadingDate.toISOString();
    this.deliveryDate = row.deliveryDate?.toISOString() ?? null;
    this.status = row.status as CargoStatus;
    this.emissionSummary = row.emissionSummary ? new EmissionSummaryModel(row.emissionSummary) : null;
    this.createdAt = row.createdAt.toISOString();
    this.updatedAt = row.updatedAt.toISOString();
  }

  isPending(): boolean { return this.status === 'PENDING'; }
  isInTransit(): boolean { return this.status === 'IN_TRANSIT'; }
  isDelivered(): boolean { return this.status === 'DELIVERED'; }
  isCancelled(): boolean { return this.status === 'CANCELLED'; }

  hasEmissions(): boolean { return this.emissionSummary !== null; }

  toJSON(): CargoResponse {
    return {
      id: this.id,
      cargoId: this.cargoId,
      vesselName: this.vesselName,
      quantity: this.quantity,
      energyContent: this.energyContent,
      loadingDate: this.loadingDate,
      deliveryDate: this.deliveryDate,
      status: this.status,
      emissionSummary: this.emissionSummary?.toJSON() ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
