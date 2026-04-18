# Crustaceans API

A RESTful API for managing crustaceans resources built with Express.js, TypeScript, and SQLite.

## Features

- Complete CRUD operations for crustaceans with flexible sub-group classification
- TypeScript for type safety
- SQLite database with unique name constraints
- Request validation with comprehensive error handling
- Page-based pagination with totalRows, totalPages, and navigation helpers
- Flexible filtering by group and sub-group
- CORS support and security headers with Helmet
- Repository pattern for clean data access layer
- Business logic separation in service layer
- Reusable pagination utilities

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the project directory:
```bash
cd src/problem5
```

2. Install dependencies:
```bash
npm install
```

## Configuration

The application uses the following default settings:
- **Port**: 3000 (configurable via `PORT` environment variable)
- **Database**: SQLite database stored in `data/crustaceans.db`
- **Auto-seeding**: The database is automatically seeded with sample data on first run
- **Unique Constraints**: Crustacean names must be unique across the database
- **Pagination**: Default limit is 10, maximum limit is 100, page-based (1-indexed)

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Development Mode with Watch
```bash
npm run dev:watch
```

### Production Mode
```bash
# Build the project
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000/api/crustaceans
```

### 1. Create a Crustacean
**POST** `/api/crustaceans`

**Request Body:**
```json
{
  "name": "Red Lobster",
  "subGroup": "Lobster",
  "description": "A popular lobster species with red coloration",
  "habitat": "Rocky coastal waters",
  "averageSize": 30,
  "scientificName": "Homarus gammarus"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Crustacean created successfully",
  "data": {
    "id": 4,
    "name": "Red Lobster",
    "group": "Crustaceans",
    "subGroup": "Lobster",
    "description": "A popular lobster species with red coloration",
    "habitat": "Rocky coastal waters",
    "averageSize": 30,
    "scientificName": "Homarus gammarus"
  }
}
```

**Response (Duplicate Name Error):**
```json
{
  "success": false,
  "message": "A crustacean with this name already exists"
}
```

### 2. Get All Crustaceans (Page-Based Pagination)
**GET** `/api/crustaceans`

**Query Parameters:**
- `group` (optional): Filter by group name (e.g., "Crustaceans")
- `subGroup` (optional): Filter by sub-group (accepts any string value)
- `limit` (optional): Number of items per page (1-100, default: 10)
- `page` (optional): Page number (1-based, default: 1)

**Examples:**
```
GET /api/crustaceans?subGroup=Lobster&limit=5&page=1
GET /api/crustaceans?subGroup=CustomSpecies&limit=20&page=2
GET /api/crustaceans?group=Crustaceans&page=3&limit=5
GET /api/crustaceans?limit=15
```

**Response:**
```json
{
  "success": true,
  "message": "Crustaceans retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "American Lobster",
      "group": "Crustaceans",
      "subGroup": "Lobster",
      "description": "Large marine crustacean with large claws",
      "habitat": "North Atlantic Ocean",
      "averageSize": 25,
      "scientificName": "Homarus americanus",
      "createdAt": "2024-01-01 12:00:00",
      "updatedAt": "2024-01-01 12:00:00"
    }
  ],
  "totalRows": 15,
  "totalPages": 3,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

**Pagination Fields Explanation:**
- `totalRows`: Total number of items matching the filter
- `totalPages`: Total number of pages available
- `currentPage`: Current page number (1-based)
- `hasNextPage`: Boolean indicating if there are more pages
- `hasPreviousPage`: Boolean indicating if there are previous pages

### 3. Get Crustacean by ID
**GET** `/api/crustaceans/:id`

**Response:**
```json
{
  "success": true,
  "message": "Crustacean retrieved successfully",
  "data": {
    "id": 1,
    "name": "American Lobster",
    "group": "Crustaceans",
    "subGroup": "Lobster",
    "description": "Large marine crustacean with large claws",
    "habitat": "North Atlantic Ocean",
    "averageSize": 25,
    "scientificName": "Homarus americanus",
    "createdAt": "2024-01-01 12:00:00",
    "updatedAt": "2024-01-01 12:00:00"
  }
}
```

### 4. Update a Crustacean
**PUT** `/api/crustaceans/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Lobster",
  "subGroup": "CustomLobsterType",
  "description": "Updated description",
  "averageSize": 35
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Crustacean updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Lobster",
    "group": "Crustaceans",
    "subGroup": "CustomLobsterType",
    "description": "Updated description",
    "habitat": "North Atlantic Ocean",
    "averageSize": 35,
    "scientificName": "Homarus americanus",
    "createdAt": "2024-01-01 12:00:00",
    "updatedAt": "2024-01-01 13:00:00"
  }
}
```

**Response (Duplicate Name Error):**
```json
{
  "success": false,
  "message": "A crustacean with this name already exists"
}
```

### 5. Delete a Crustacean
**DELETE** `/api/crustaceans/:id`

**Response:**
```json
{
  "success": true,
  "message": "Crustacean deleted successfully"
}
```

## Data Model

### Crustacean Schema
```typescript
interface Crustacean {
  id?: number;
  name: string; // UNIQUE constraint enforced
  group: string; // Always "Crustaceans"
  subGroup: string; // Flexible string - any value allowed
  description: string;
  habitat: string;
  averageSize: number; // in centimeters
  scientificName: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Validation Rules

### Create Crustacean:
- **name**: Required, 2-100 characters, must be unique
- **subGroup**: Required, 1-50 characters (any string allowed)
- **description**: Required, 10-500 characters
- **habitat**: Required, 5-200 characters
- **averageSize**: Required, number between 0.1-100
- **scientificName**: Required, 5-100 characters

### Update Crustacean:
- **name**: Optional, 2-100 characters, must be unique if provided
- **subGroup**: Optional, 1-50 characters (any string allowed)
- **description**: Optional, 10-500 characters
- **habitat**: Optional, 5-200 characters
- **averageSize**: Optional, number between 0.1-100
- **scientificName**: Optional, 5-100 characters

### Pagination Parameters:
- **limit**: Optional, 1-100 (default: 10)
- **page**: Optional, >= 1 (default: 1)

## Error Handling

The API returns consistent error responses:

**Validation Errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be between 2 and 100 characters"
    }
  ]
}
```

**Pagination Errors:**
```json
{
  "success": false,
  "message": "Invalid pagination parameters",
  "errors": [
    "Limit cannot exceed 100",
    "Page must be greater than 0"
  ]
}
```

**Duplicate Name Error:**
```json
{
  "success": false,
  "message": "A crustacean with this name already exists"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate name)
- `500`: Internal Server Error

## Additional Endpoints

### Health Check
**GET** `/health`
```json
{
  "success": true,
  "message": "Crustaceans API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### API Information
**GET** `/`
Returns API documentation and available endpoints.

## Sample Data

The application comes with pre-seeded data:
1. **American Lobster** (Lobster)
2. **Giant Tiger Prawn** (Prawn)
3. **White Shrimp** (Shrimp)

## Database

- **Type**: SQLite
- **Location**: `data/crustaceans.db`
- **Auto-creation**: Database and tables are created automatically
- **Auto-seeding**: Sample data is inserted on first run
- **Constraints**: UNIQUE constraint on `name` field

## Development

### Project Structure
```
src/problem5/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── database/        # Database connection and setup
│   ├── middleware/      # Validation middleware
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions (pagination, etc.)
│   └── index.ts         # Application entry point
├── data/                # SQLite database (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

### Architecture Layers

1. **Controllers**: Handle HTTP requests/responses and validation
2. **Services**: Contain business logic and orchestration
3. **Repositories**: Handle direct database operations and queries
4. **Utils**: Reusable utility functions (pagination, formatting, etc.)
5. **Database**: SQLite connection and schema management