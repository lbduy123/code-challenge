# Live Scoreboard API Module

## Overview

This module provides a real-time scoreboard system that allows users to update their scores through authenticated actions and broadcasts live updates to all connected clients. The system maintains a leaderboard of the top 10 users and ensures security against malicious score manipulation.

## Architecture

### System Components

1. **Authentication Service**: Handles user authentication and authorization
2. **Score Management Service**: Processes score updates and validates actions
3. **Real-time Communication Layer**: Broadcasts live updates to connected clients
4. **Database Layer**: Persistent storage for user scores and action logs
5. **Rate Limiting & Anti-Fraud**: Prevents abuse and malicious activities

> 📊 **Visual Diagrams**: For detailed system flow, architecture, and deployment diagrams, see [architecture-diagram.md](./architecture-diagram.md)

### Data Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │  Auth Service   │
│   Application   │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │ 1. User Action         │                        │
         │ (Score Update)         │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Score Update  │◄──►│  Rate Limiter    │◄──►│  JWT Validator  │
│   API Endpoint  │    │  & Validator     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │  Leaderboard     │    │  WebSocket      │
│   Score Store   │    │  Calculator      │    │  Broadcaster    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        ▼
         │                        │              ┌─────────────────┐
         │                        │              │  Connected      │
         │                        │              │  Clients        │
         │                        │              │  (Live Updates) │
         │                        │              └─────────────────┘
         │                        │
         └────────────────────────┼─────────────────────────────────┐
                                  │                                 │
                                  ▼                                 ▼
                         ┌──────────────────┐             ┌─────────────────┐
                         │  GET /leaderboard│             │  WebSocket      │
                         │  API Response    │             │  Event:         │
                         │  (Top 10 Users)  │             │  "score_update" │
                         └──────────────────┘             └─────────────────┘
```

## API Endpoints

### 1. Score Update Endpoint

**POST** `/api/v1/scores/update`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action_type": "completed_task",
  "action_id": "unique_action_identifier",
  "score_increment": 10,
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "action_details": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user123",
  "new_total_score": 150,
  "leaderboard_position": 5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Leaderboard Endpoint

**GET** `/api/v1/leaderboard`

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "user456",
      "username": "player1",
      "score": 500,
      "last_updated": "2024-01-15T10:25:00Z"
    }
  ],
  "total_users": 1000,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### 3. WebSocket Connection

**WebSocket** `/ws/scoreboard`

**Connection Requirements:**
- **Public access**: No authentication required for viewing live scoreboard updates
- **Optional authentication**: Authenticated users can receive personalized events
- Client sends heartbeat every 30 seconds
- Connection automatically subscribes to leaderboard updates

**Authentication (Optional):**
```
ws://localhost:3000/ws/scoreboard?token=<JWT_TOKEN>
```

**Event Types:**

**Public Events (All Clients):**
```json
{
  "type": "leaderboard_update",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "username": "player1",
        "score": 500,
        "score_change": "+25"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Authenticated User Events (Only for authenticated connections):**
```json
{
  "type": "personal_update",
  "data": {
    "user_id": "user123",
    "new_score": 150,
    "old_rank": 7,
    "new_rank": 5,
    "position_change": "+2",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**System Events:**
```json
{
  "type": "system_message",
  "data": {
    "message": "Leaderboard will reset in 5 minutes",
    "level": "info"
  }
}
```

## Security Measures

### 1. Authentication & Authorization
- **JWT-based authentication**: Score update requests must include valid JWT tokens
- **User authorization**: Verify user can only update their own score
- **Token expiration**: Implement reasonable token expiration (e.g., 1 hour)
- **Refresh token mechanism**: Allow secure token renewal
- **Public WebSocket access**: Allow unauthenticated connections for viewing live updates
- **Authenticated WebSocket features**: Personalized events only for authenticated connections

### 2. Rate Limiting
- **Per-user limits**: Maximum 10 score updates per minute per user
- **Global limits**: Maximum 1000 requests per minute across all users
- **Progressive penalties**: Temporary bans for repeated violations

### 3. Anti-Fraud Measures
- **Action validation**: Verify action_id hasn't been used before
- **Score increment limits**: Maximum allowed score per action (configurable)
- **Anomaly detection**: Flag unusual scoring patterns
- **Audit logging**: Log all score updates with metadata

### 4. Input Validation
- **Schema validation**: Validate all incoming request data
- **Sanitization**: Clean and validate user inputs
- **Type checking**: Ensure correct data types

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    total_score INTEGER DEFAULT 0,
    last_score_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Score_Updates Table
```sql
CREATE TABLE score_updates (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    action_id VARCHAR(255) UNIQUE NOT NULL,
    score_increment INTEGER NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);
```

### Leaderboard_Cache Table
```sql
CREATE TABLE leaderboard_cache (
    rank INTEGER PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    username VARCHAR(100),
    score INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Guidelines

### 1. Error Handling
- Use consistent HTTP status codes
- Provide meaningful error messages
- Log errors for debugging
- Implement graceful degradation

### 2. Performance Optimization
- **Database indexing**: Index on user_id, score, and timestamp fields
- **Caching**: Cache leaderboard data (Redis recommended)
- **Connection pooling**: Manage database connections efficiently
- **Batch processing**: Process multiple score updates in batches when possible

### 3. Monitoring & Observability
- **Metrics**: Track API response times, error rates, concurrent connections
- **Logging**: Structured logging with correlation IDs
- **Health checks**: Implement health check endpoints
- **Alerting**: Set up alerts for critical issues

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/scoreboard
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Rate Limiting
RATE_LIMIT_PER_USER=10
RATE_LIMIT_WINDOW=60

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_MAX_CONNECTIONS=1000

# Scoring
MAX_SCORE_INCREMENT=100
LEADERBOARD_SIZE=10
```

## Additional Improvements & Considerations

### 1. Scalability Enhancements
- **Horizontal scaling**: Design for multiple API server instances
- **Database sharding**: Consider sharding strategies for large user bases
- **CDN integration**: Cache static leaderboard data at edge locations
- **Message queues**: Use message queues (Redis/RabbitMQ) for async processing

### 2. Advanced Security Features
- **CAPTCHA integration**: Add CAPTCHA for suspicious activities
- **Machine learning**: Implement ML-based fraud detection
- **IP whitelisting**: Allow IP restrictions for high-value users
- **Multi-factor authentication**: Add MFA for sensitive operations

### 3. User Experience Improvements
- **Offline support**: Cache scores locally and sync when online
- **Real-time notifications**: Push notifications for rank changes
- **Historical data**: Track user score history and progress
- **Personalization**: Show user's rank progression and achievements

### 4. Operational Excellence
- **Blue-green deployment**: Zero-downtime deployments
- **Circuit breaker**: Prevent cascade failures
- **Graceful shutdown**: Handle server restarts without data loss
- **Backup strategy**: Regular database backups and disaster recovery

### 5. Analytics & Business Intelligence
- **User engagement metrics**: Track user activity patterns
- **Score distribution analysis**: Understand scoring behaviors
- **Leaderboard turnover**: Monitor how often rankings change
- **Performance analytics**: Measure system performance under load

### 6. Future Extensibility
- **Multiple leaderboards**: Support different game modes or categories
- **Seasonal resets**: Implement periodic leaderboard resets
- **Team competitions**: Support team-based scoring
- **Achievement system**: Expand beyond simple scoring to achievements

## Testing Strategy

### 1. Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Cover edge cases and error conditions

### 2. Integration Tests
- Test API endpoints end-to-end
- Test database interactions
- Test WebSocket connections

### 3. Load Testing
- Simulate high concurrent user loads
- Test rate limiting effectiveness
- Measure response times under stress

### 4. Security Testing
- Test authentication and authorization
- Test for common vulnerabilities (OWASP Top 10)
- Penetration testing for fraud prevention

## Deployment Architecture

### Production Environment
```
Load Balancer (nginx/AWS ALB)
    │
    ├─ API Server Instance 1
    ├─ API Server Instance 2
    └─ API Server Instance N
         │
         ├─ PostgreSQL (Primary/Replica)
         ├─ Redis (Cache & Sessions)
         └─ Message Queue (Optional)
```

### Development Setup
1. Clone repository
2. Install dependencies
3. Set up local database
4. Configure environment variables
5. Run migrations
6. Start development server

This specification provides a comprehensive foundation for implementing a secure, scalable, and maintainable live scoreboard system that meets all the stated requirements while being prepared for future growth and enhancements. 

### 5. WebSocket Security Considerations
- **Connection limits**: Implement per-IP connection limits to prevent DoS attacks
- **Message throttling**: Limit message frequency to prevent spam
- **Data filtering**: Only broadcast non-sensitive leaderboard data to public connections
- **Connection monitoring**: Monitor and log WebSocket connection patterns
- **Graceful degradation**: Handle high connection loads without affecting core functionality 