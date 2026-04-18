# Live Scoreboard API - Architecture Diagrams

## System Flow Diagram

```mermaid
sequenceDiagram
    participant User as User/Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Score as Score API
    participant DB as Database
    participant Cache as Redis Cache
    participant WS as WebSocket Server
    participant Clients as Connected Clients

    Note over User,Clients: User Score Update Flow

    User->>Gateway: POST /api/v1/scores/update
    Note right of User: JWT Token + Action Data
    
    Gateway->>Auth: Validate JWT Token
    Auth->>Gateway: Token Valid + User Info
    
    Gateway->>Score: Process Score Update
    Note right of Gateway: Rate Limiting Applied
    
    Score->>Score: Validate Action ID
    Note right of Score: Check for duplicate actions
    
    Score->>DB: Update User Score
    DB->>Score: Score Updated
    
    Score->>Cache: Update Leaderboard Cache
    Cache->>Score: Cache Updated
    
    Score->>WS: Broadcast Score Update
    Note right of Score: New leaderboard data
    
    WS->>Clients: Live Update Event
    Note right of WS: WebSocket broadcast
    
    Score->>Gateway: Success Response
    Gateway->>User: Updated Score + Position
```

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        FE[Frontend Application]
        MOB[Mobile App]
    end
    
    subgraph "API Gateway Layer"
        LB[Load Balancer]
        GW[API Gateway]
        RL[Rate Limiter]
    end
    
    subgraph "Authentication Layer"
        AUTH[Auth Service]
        JWT[JWT Validator]
    end
    
    subgraph "Application Layer"
        SCORE[Score Update Service]
        LB_SVC[Leaderboard Service]
        WS[WebSocket Service]
        VALID[Validation Service]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
        LOGS[(Audit Logs)]
    end
    
    subgraph "External Services"
        MONITOR[Monitoring]
        ALERT[Alerting]
    end

    FE --> LB
    MOB --> LB
    LB --> GW
    GW --> RL
    RL --> AUTH
    AUTH --> JWT
    
    GW --> SCORE
    GW --> LB_SVC
    GW --> WS
    
    SCORE --> VALID
    SCORE --> PG
    SCORE --> REDIS
    SCORE --> WS
    
    LB_SVC --> REDIS
    LB_SVC --> PG
    
    WS --> FE
    WS --> MOB
    
    SCORE --> LOGS
    
    SCORE --> MONITOR
    WS --> MONITOR
    MONITOR --> ALERT
    
    classDef clientLayer fill:#e1f5fe
    classDef gatewayLayer fill:#f3e5f5
    classDef authLayer fill:#e8f5e8
    classDef appLayer fill:#fff3e0
    classDef dataLayer fill:#fce4ec
    classDef externalLayer fill:#f1f8e9
    
    class FE,MOB clientLayer
    class LB,GW,RL gatewayLayer
    class AUTH,JWT authLayer
    class SCORE,LB_SVC,WS,VALID appLayer
    class PG,REDIS,LOGS dataLayer
    class MONITOR,ALERT externalLayer
```

## Security Flow Diagram

```mermaid
flowchart TD
    START[User Action] --> AUTH_CHECK{Valid JWT?}
    AUTH_CHECK -->|No| REJECT[Reject Request]
    AUTH_CHECK -->|Yes| RATE_CHECK{Rate Limit OK?}
    
    RATE_CHECK -->|No| RATE_REJECT[Rate Limit Exceeded]
    RATE_CHECK -->|Yes| ACTION_CHECK{Valid Action ID?}
    
    ACTION_CHECK -->|Duplicate| DUP_REJECT[Duplicate Action]
    ACTION_CHECK -->|Valid| SCORE_CHECK{Score Increment Valid?}
    
    SCORE_CHECK -->|Too High| SCORE_REJECT[Invalid Score]
    SCORE_CHECK -->|Valid| FRAUD_CHECK{Fraud Detection}
    
    FRAUD_CHECK -->|Suspicious| FRAUD_REJECT[Suspicious Activity]
    FRAUD_CHECK -->|Clean| PROCESS[Process Update]
    
    PROCESS --> LOG[Audit Log]
    LOG --> UPDATE_DB[Update Database]
    UPDATE_DB --> BROADCAST[Broadcast Update]
    BROADCAST --> SUCCESS[Success Response]
    
    REJECT --> ERROR_LOG[Log Error]
    RATE_REJECT --> ERROR_LOG
    DUP_REJECT --> ERROR_LOG
    SCORE_REJECT --> ERROR_LOG
    FRAUD_REJECT --> ERROR_LOG
    
    classDef startEnd fill:#c8e6c9
    classDef decision fill:#fff3e0
    classDef process fill:#e3f2fd
    classDef reject fill:#ffebee
    
    class START,SUCCESS startEnd
    class AUTH_CHECK,RATE_CHECK,ACTION_CHECK,SCORE_CHECK,FRAUD_CHECK decision
    class PROCESS,LOG,UPDATE_DB,BROADCAST process
    class REJECT,RATE_REJECT,DUP_REJECT,SCORE_REJECT,FRAUD_REJECT,ERROR_LOG reject
```

## Real-time Communication Flow

```mermaid
sequenceDiagram
    participant Guest as Guest Client
    participant Auth as Authenticated Client
    participant WS as WebSocket Server
    participant Score as Score Service
    participant Cache as Redis Cache

    Note over Guest,Cache: WebSocket Connection Setup
    
    Guest->>WS: Connect (No Auth)
    Auth->>WS: Connect with JWT
    WS->>Guest: Public Connection Established
    WS->>Auth: Authenticated Connection Established
    
    Note over Guest,Cache: Score Update & Broadcast
    
    Score->>Cache: Update Leaderboard
    Score->>WS: New Score Event
    
    WS->>WS: Prepare Public Event
    WS->>Guest: Public Leaderboard Update
    WS->>Auth: Public Leaderboard Update
    
    WS->>WS: Prepare Personal Event
    WS->>Auth: Personal Update (Rank Change)
    Note right of WS: Only for authenticated users
    
    Note over Guest,Cache: Heartbeat Mechanism
    
    loop Every 30 seconds
        Guest->>WS: Heartbeat
        WS->>Guest: Heartbeat ACK
        Auth->>WS: Heartbeat
        WS->>Auth: Heartbeat ACK
    end
    
    Note over Guest,Cache: Connection Management
    
    Guest->>WS: Disconnect
    WS->>WS: Clean up Guest connection
    WS->>Auth: Continue normal operation
```

## Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ SCORE_UPDATES : creates
    USERS ||--o{ LEADERBOARD_CACHE : appears_in
    USERS {
        string id PK
        string username UK
        string email UK
        int total_score
        timestamp last_score_update
        timestamp created_at
        timestamp updated_at
    }
    
    SCORE_UPDATES {
        serial id PK
        string user_id FK
        string action_type
        string action_id UK
        int score_increment
        jsonb metadata
        timestamp timestamp
        inet ip_address
        text user_agent
    }
    
    LEADERBOARD_CACHE {
        int rank PK
        string user_id FK
        string username
        int score
        timestamp last_updated
    }
    
    ACTION_TYPES ||--o{ SCORE_UPDATES : categorizes
    ACTION_TYPES {
        string type PK
        int max_score_increment
        string description
        boolean enabled
    }
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        ALB[AWS Application Load Balancer]
        NGINX[Nginx Reverse Proxy]
    end
    
    subgraph "Application Servers"
        API1[API Server 1]
        API2[API Server 2]
        API3[API Server 3]
    end
    
    subgraph "Database Layer"
        PG_PRIMARY[(PostgreSQL Primary)]
        PG_REPLICA[(PostgreSQL Replica)]
        REDIS_CLUSTER[(Redis Cluster)]
    end
    
    subgraph "Monitoring & Logging"
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        ELK[ELK Stack]
    end
    
    subgraph "External Services"
        CDN[CloudFront CDN]
        S3[S3 Storage]
    end

    ALB --> NGINX
    NGINX --> API1
    NGINX --> API2
    NGINX --> API3
    
    API1 --> PG_PRIMARY
    API2 --> PG_PRIMARY
    API3 --> PG_PRIMARY
    
    API1 --> PG_REPLICA
    API2 --> PG_REPLICA
    API3 --> PG_REPLICA
    
    API1 --> REDIS_CLUSTER
    API2 --> REDIS_CLUSTER
    API3 --> REDIS_CLUSTER
    
    API1 --> PROMETHEUS
    API2 --> PROMETHEUS
    API3 --> PROMETHEUS
    
    PROMETHEUS --> GRAFANA
    
    API1 --> ELK
    API2 --> ELK
    API3 --> ELK
    
    NGINX --> CDN
    ELK --> S3
```

These diagrams provide visual representations of:

1. **System Flow**: Step-by-step sequence of operations for score updates
2. **System Architecture**: High-level component relationships and data flow
3. **Security Flow**: Decision tree for request validation and fraud prevention
4. **Real-time Communication**: WebSocket connection lifecycle and event broadcasting (including public access)
5. **Database Schema**: Entity relationships and data structure
6. **Deployment Architecture**: Production infrastructure layout

The diagrams can be rendered using any Mermaid-compatible viewer or integrated into documentation systems that support Mermaid syntax.