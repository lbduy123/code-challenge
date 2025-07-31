import { Database, database } from "../database/database";
import {
  Crustacean,
  CreateCrustaceanRequest,
  UpdateCrustaceanRequest,
  CrustaceanFilters,
} from "../types/Crustacean";

export interface PaginatedResult<T> {
  data: T[];
  totalRows: number;
}

export class CrustaceanRepository {
  private db: Database;

  constructor() {
    this.db = database;
  }

  async create(crustaceanData: CreateCrustaceanRequest): Promise<Crustacean> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO crustaceans (name, sub_group, description, habitat, average_size, scientific_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db
        .getDatabase()
        .run(
          query,
          [
            crustaceanData.name,
            crustaceanData.subGroup,
            crustaceanData.description,
            crustaceanData.habitat,
            crustaceanData.averageSize,
            crustaceanData.scientificName,
          ],
          function (this: any, err: Error | null) {
            if (err) {
              // Handle unique constraint violation
              if (
                err.message &&
                err.message.includes("UNIQUE constraint failed")
              ) {
                reject(new Error("A crustacean with this name already exists"));
              } else {
                reject(err);
              }
            } else {
              resolve({
                id: this.lastID,
                name: crustaceanData.name,
                group: "Crustaceans",
                subGroup: crustaceanData.subGroup,
                description: crustaceanData.description,
                habitat: crustaceanData.habitat,
                averageSize: crustaceanData.averageSize,
                scientificName: crustaceanData.scientificName,
              });
            }
          }
        );
    });
  }

  async findAll(
    filters: { group?: string; subGroup?: string },
    limit: number = 10,
    offset: number = 0
  ): Promise<PaginatedResult<Crustacean>> {
    return new Promise((resolve, reject) => {
      // First, get total count with filters
      let countQuery = "SELECT COUNT(*) as total FROM crustaceans WHERE 1=1";
      const countParams: any[] = [];

      if (filters.group) {
        countQuery += " AND group_name = ?";
        countParams.push(filters.group);
      }

      if (filters.subGroup) {
        countQuery += " AND sub_group = ?";
        countParams.push(filters.subGroup);
      }

      this.db
        .getDatabase()
        .get(countQuery, countParams, (countErr, countRow: any) => {
          if (countErr) {
            reject(countErr);
            return;
          }

          const totalRows = countRow.total;

          // Then get the actual data
          let dataQuery = "SELECT * FROM crustaceans WHERE 1=1";
          const dataParams: any[] = [];

          if (filters.group) {
            dataQuery += " AND group_name = ?";
            dataParams.push(filters.group);
          }

          if (filters.subGroup) {
            dataQuery += " AND sub_group = ?";
            dataParams.push(filters.subGroup);
          }

          dataQuery += " ORDER BY created_at DESC";

          // Always apply LIMIT and OFFSET
          dataQuery += " LIMIT ? OFFSET ?";
          dataParams.push(limit, offset);

          this.db
            .getDatabase()
            .all(dataQuery, dataParams, (err, rows: any[]) => {
              if (err) {
                reject(err);
              } else {
                const crustaceans: Crustacean[] = rows.map((row) => ({
                  id: row.id,
                  name: row.name,
                  group: row.group_name,
                  subGroup: row.sub_group,
                  description: row.description,
                  habitat: row.habitat,
                  averageSize: row.average_size,
                  scientificName: row.scientific_name,
                  createdAt: row.created_at,
                  updatedAt: row.updated_at,
                }));

                resolve({
                  data: crustaceans,
                  totalRows: totalRows,
                });
              }
            });
        });
    });
  }

  async findById(id: number): Promise<Crustacean | null> {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM crustaceans WHERE id = ?";

      this.db.getDatabase().get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            name: row.name,
            group: row.group_name,
            subGroup: row.sub_group,
            description: row.description,
            habitat: row.habitat,
            averageSize: row.average_size,
            scientificName: row.scientific_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        }
      });
    });
  }

  async findByName(name: string): Promise<Crustacean | null> {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM crustaceans WHERE name = ?";

      this.db.getDatabase().get(query, [name], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            name: row.name,
            group: row.group_name,
            subGroup: row.sub_group,
            description: row.description,
            habitat: row.habitat,
            averageSize: row.average_size,
            scientificName: row.scientific_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        }
      });
    });
  }

  async update(
    id: number,
    updateData: UpdateCrustaceanRequest
  ): Promise<Crustacean | null> {
    return new Promise((resolve, reject) => {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (updateData.name !== undefined) {
        updateFields.push("name = ?");
        params.push(updateData.name);
      }
      if (updateData.subGroup !== undefined) {
        updateFields.push("sub_group = ?");
        params.push(updateData.subGroup);
      }
      if (updateData.description !== undefined) {
        updateFields.push("description = ?");
        params.push(updateData.description);
      }
      if (updateData.habitat !== undefined) {
        updateFields.push("habitat = ?");
        params.push(updateData.habitat);
      }
      if (updateData.averageSize !== undefined) {
        updateFields.push("average_size = ?");
        params.push(updateData.averageSize);
      }
      if (updateData.scientificName !== undefined) {
        updateFields.push("scientific_name = ?");
        params.push(updateData.scientificName);
      }

      if (updateFields.length === 0) {
        // No fields to update, return the existing record
        this.findById(id).then(resolve).catch(reject);
        return;
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      params.push(id);

      const query = `UPDATE crustaceans SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;

      this.db.getDatabase().run(query, params, (err) => {
        if (err) {
          // Handle unique constraint violation
          if (err.message && err.message.includes("UNIQUE constraint failed")) {
            reject(new Error("A crustacean with this name already exists"));
          } else {
            reject(err);
          }
        } else {
          this.findById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM crustaceans WHERE id = ?";

      this.db
        .getDatabase()
        .run(query, [id], function (this: any, err: Error | null) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
    });
  }

  async exists(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) as count FROM crustaceans WHERE id = ?";

      this.db.getDatabase().get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let query = "SELECT COUNT(*) as count FROM crustaceans WHERE name = ?";
      const params: any[] = [name];

      if (excludeId !== undefined) {
        query += " AND id != ?";
        params.push(excludeId);
      }

      this.db.getDatabase().get(query, params, (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }
}
