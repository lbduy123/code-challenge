import {
  CrustaceanRepository,
  PaginatedResult,
} from "../repositories/CrustaceanRepository";
import {
  Crustacean,
  CreateCrustaceanRequest,
  UpdateCrustaceanRequest,
  CrustaceanFilters,
} from "../types/Crustacean";

export interface PaginatedCrustaceanResult {
  data: Crustacean[];
  totalRows: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class CrustaceanService {
  private crustaceanRepository: CrustaceanRepository;

  constructor() {
    this.crustaceanRepository = new CrustaceanRepository();
  }

  async create(crustaceanData: CreateCrustaceanRequest): Promise<Crustacean> {
    try {
      // Check if name already exists
      const existingCrustacean = await this.crustaceanRepository.findByName(
        crustaceanData.name
      );
      if (existingCrustacean) {
        throw new Error("A crustacean with this name already exists");
      }

      return await this.crustaceanRepository.create(crustaceanData);
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    filters: CrustaceanFilters = {}
  ): Promise<PaginatedCrustaceanResult> {
    try {
      // Extract pagination info and calculate offset
      const limit = filters.limit || 10;
      const page = filters.page || 1;
      const offset = (page - 1) * limit;

      // Create filter object for repository (without pagination info)
      const repositoryFilters = {
        group: filters.group,
        subGroup: filters.subGroup,
      };

      const result = await this.crustaceanRepository.findAll(
        repositoryFilters,
        limit,
        offset
      );

      // Calculate pagination info
      const totalPages = Math.ceil(result.totalRows / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        data: result.data,
        totalRows: result.totalRows,
        totalPages,
        currentPage: page,
        hasNextPage,
        hasPreviousPage,
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<Crustacean | null> {
    try {
      return await this.crustaceanRepository.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateData: UpdateCrustaceanRequest
  ): Promise<Crustacean | null> {
    try {
      // Check if the record exists
      const existingCrustacean = await this.crustaceanRepository.findById(id);
      if (!existingCrustacean) {
        return null;
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingCrustacean.name) {
        const nameExists = await this.crustaceanRepository.nameExists(
          updateData.name,
          id
        );
        if (nameExists) {
          throw new Error("A crustacean with this name already exists");
        }
      }

      return await this.crustaceanRepository.update(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Check if the record exists first
      const exists = await this.crustaceanRepository.exists(id);
      if (!exists) {
        return false;
      }

      return await this.crustaceanRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async validateNameUniqueness(
    name: string,
    excludeId?: number
  ): Promise<boolean> {
    try {
      return !(await this.crustaceanRepository.nameExists(name, excludeId));
    } catch (error) {
      throw error;
    }
  }
}
