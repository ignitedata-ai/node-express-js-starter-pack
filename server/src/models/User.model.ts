import type { User as PrismaUser } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export class UserModel {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'user' | 'admin';
  readonly createdAt: string;
  readonly updatedAt: string;

  private readonly _passwordHash: string;
  private readonly _refreshToken: string | null;

  constructor(row: PrismaUser) {
    this.id = row.id;
    this.email = row.email;
    this.name = row.name;
    this.role = row.role as 'user' | 'admin';
    this.createdAt = row.createdAt.toISOString();
    this.updatedAt = row.updatedAt.toISOString();
    this._passwordHash = row.passwordHash;
    this._refreshToken = row.refreshToken ?? null;
  }

  get passwordHash(): string { return this._passwordHash; }
  get refreshToken(): string | null { return this._refreshToken; }

  isAdmin(): boolean { return this.role === 'admin'; }
  hasRefreshToken(): boolean { return this._refreshToken !== null; }

  toPublic(): PublicUser {
    return { id: this.id, email: this.email, name: this.name, role: this.role, createdAt: this.createdAt };
  }

  toJSON(): PublicUser { return this.toPublic(); }
}
