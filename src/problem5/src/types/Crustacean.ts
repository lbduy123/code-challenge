export interface Crustacean {
  id?: number;
  name: string;
  group: string;
  subGroup: string;
  description: string;
  habitat: string;
  averageSize: number; // in centimeters
  scientificName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrustaceanFilters {
  group?: string;
  subGroup?: string;
  limit?: number;
  page?: number;
}

export interface CreateCrustaceanRequest {
  name: string;
  subGroup: string;
  description: string;
  habitat: string;
  averageSize: number;
  scientificName: string;
}

export interface UpdateCrustaceanRequest {
  name?: string;
  subGroup?: string;
  description?: string;
  habitat?: string;
  averageSize?: number;
  scientificName?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  totalRows: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
