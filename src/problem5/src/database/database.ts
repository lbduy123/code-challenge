import sqlite3 from "sqlite3";
import path from "path";

export class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(__dirname, "../../data/crustaceans.db");
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err);
      } else {
        console.log("Connected to SQLite database");
        this.initializeTables();
      }
    });
  }

  private initializeTables(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS crustaceans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        group_name TEXT NOT NULL DEFAULT 'Crustaceans',
        sub_group TEXT NOT NULL,
        description TEXT NOT NULL,
        habitat TEXT NOT NULL,
        average_size REAL NOT NULL,
        scientific_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Crustaceans table ready");
        this.seedData();
      }
    });
  }

  private seedData(): void {
    const checkQuery = "SELECT COUNT(*) as count FROM crustaceans";
    this.db.get(checkQuery, (err, row: any) => {
      if (err) {
        console.error("Error checking data:", err);
        return;
      }

      if (row.count === 0) {
        const seedData = [
          {
            name: "American Lobster",
            subGroup: "Lobster",
            description: "Large marine crustacean with large claws",
            habitat: "North Atlantic Ocean",
            averageSize: 25,
            scientificName: "Homarus americanus",
          },
          {
            name: "Giant Tiger Prawn",
            subGroup: "Prawn",
            description: "Large commercial prawn species",
            habitat: "Indo-Pacific waters",
            averageSize: 15,
            scientificName: "Penaeus monodon",
          },
          {
            name: "White Shrimp",
            subGroup: "Shrimp",
            description: "Common commercial shrimp species",
            habitat: "Atlantic and Gulf coasts",
            averageSize: 8,
            scientificName: "Litopenaeus setiferus",
          },
        ];

        const insertQuery = `
          INSERT INTO crustaceans (name, sub_group, description, habitat, average_size, scientific_name)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        seedData.forEach((item) => {
          this.db.run(insertQuery, [
            item.name,
            item.subGroup,
            item.description,
            item.habitat,
            item.averageSize,
            item.scientificName,
          ]);
        });

        console.log("Database seeded with initial data");
      }
    });
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const database = new Database();
