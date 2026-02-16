# QClearance Database Schema Design

## 1. Users & Authentication
Stores operator credentials and role-based access control.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('controller', 'supervisor', 'admin')),
  badge_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Flight Management
Real-time state of aircraft.

```sql
CREATE TABLE flights (
  id VARCHAR(20) PRIMARY KEY, -- ICAO flight ID or similar
  callsign VARCHAR(10) NOT NULL,
  aircraft_type VARCHAR(10),
  sub_type VARCHAR(10), -- e.g. A320, B737
  airline VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('queued', 'taxiing', 'cleared', 'holding', 'active', 'approaching')),
  type VARCHAR(10) CHECK (type IN ('arrival', 'departure')),
  runway VARCHAR(10),
  gate VARCHAR(10),
  fuel_percentage INTEGER CHECK (fuel_percentage BETWEEN 0 AND 100),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  actual_time TIMESTAMP WITH TIME ZONE,
  position_x FLOAT, -- For map visualization
  position_y FLOAT,
  heading FLOAT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Slot Requests & Clearances
The core workflow entities.

```sql
CREATE TABLE slot_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id VARCHAR(20) REFERENCES flights(id),
  request_type VARCHAR(10) CHECK (request_type IN ('takeoff', 'landing', 'taxi')),
  requested_time TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pending', 'reviewing', 'approved', 'denied')),
  -- Constraints snapshot at time of request
  constraint_fuel INTEGER,
  constraint_weather VARCHAR(50),
  constraint_congestion VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clearances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id VARCHAR(20) REFERENCES flights(id),
  slot_request_id UUID REFERENCES slot_requests(id),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) CHECK (status IN ('under_monitoring', 'completed', 'revoked')),
  risk_level VARCHAR(10) CHECK (risk_level IN ('safe', 'borderline', 'unsafe')),
  risk_score INTEGER,
  -- Snapshot of conditions when cleared
  weather_condition VARCHAR(50),
  congestion_level VARCHAR(20),
  visibility INTEGER -- km/miles
);
```

## 4. Agent Analysis & Decisions
AI and Quantum outputs.

```sql
CREATE TABLE agent_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clearance_id UUID REFERENCES clearances(id),
  agent_type VARCHAR(20) CHECK (agent_type IN ('fuel', 'weather', 'congestion', 'safety', 'fairness')),
  result VARCHAR(10) CHECK (result IN ('safe', 'borderline', 'unsafe')),
  confidence INTEGER,
  reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quantum_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_type VARCHAR(20), -- 'periodic', 'manual', 'event'
  input_order JSONB, -- Array of flight IDs
  optimized_order JSONB,
  current_risk_score INTEGER,
  optimized_risk_score INTEGER,
  improvement_percentage INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id VARCHAR(20) REFERENCES flights(id),
  type VARCHAR(20) CHECK (type IN ('clearance', 'hold', 'reorder', 'alert')),
  recommendation TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  source VARCHAR(20) CHECK (source IN ('agent', 'quantum', 'system')), -- What triggered this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Audit & Compliance
Immutable log of all safety-critical events.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(50), -- 'clearance_issued', 'risk_alert', 'decision_override'
  severity VARCHAR(10) CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT,
  details JSONB, -- Flexible payload for specific data
  actor_id UUID REFERENCES users(id), -- Nullable if system action
  actor_name VARCHAR(100) -- Fallback if system
);
```

## Indexes & Performance
- Index on `flights(status, type)` for rapid queue retrieval.
- Index on `clearances(status)` for monitoring loop.
- Index on `audit_logs(timestamp)` for replay and timeline views.
