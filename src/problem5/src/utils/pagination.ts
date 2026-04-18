export interface PaginationParams {
  limit?: number;
  page?: number; // Changed from offset to page (1-based)
}

export interface PaginationResult {
  limit: number;
  offset: number; // Still needed internally for SQL
  page: number;
}

export interface PaginationInfo {
  totalRows: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginationUtils {
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;

  /**
   * Parse pagination parameters from request
   */
  static parsePaginationParams(params: PaginationParams): PaginationResult {
    let limit = params.limit || this.DEFAULT_LIMIT;
    let page = params.page || 1;

    // Validate and adjust limit
    if (limit > this.MAX_LIMIT) {
      limit = this.MAX_LIMIT;
    }
    if (limit < 1) {
      limit = this.DEFAULT_LIMIT;
    }

    // Validate and adjust page
    if (page < 1) {
      page = 1;
    }

    // Calculate offset from page (0-based for SQL)
    const offset = (page - 1) * limit;

    return {
      limit,
      offset,
      page,
    };
  }

  /**
   * Calculate pagination information
   */
  static calculatePaginationInfo(
    totalRows: number,
    limit: number,
    page: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalRows / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      totalRows,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Format paginated response
   */
  static formatPaginatedResponse<T>(
    data: T[],
    totalRows: number,
    limit: number,
    page: number,
    message: string = "Data retrieved successfully"
  ) {
    const paginationInfo = this.calculatePaginationInfo(totalRows, limit, page);

    return {
      success: true,
      message,
      data,
      totalRows,
      totalPages: paginationInfo.totalPages,
      currentPage: paginationInfo.currentPage,
      hasNextPage: paginationInfo.hasNextPage,
      hasPreviousPage: paginationInfo.hasPreviousPage,
    };
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(params: PaginationParams): string[] {
    const errors: string[] = [];

    if (params.limit !== undefined) {
      if (params.limit < 1) {
        errors.push("Limit must be greater than 0");
      }
      if (params.limit > this.MAX_LIMIT) {
        errors.push(`Limit cannot exceed ${this.MAX_LIMIT}`);
      }
    }

    if (params.page !== undefined && params.page < 1) {
      errors.push("Page must be greater than 0");
    }

    return errors;
  }
}
