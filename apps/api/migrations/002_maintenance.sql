-- Maintenance requests for tenants and admin tracking

CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE maintenance_priority AS ENUM ('low', 'normal', 'urgent');

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority maintenance_priority NOT NULL DEFAULT 'normal',
  status maintenance_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_created_at ON maintenance_requests(created_at DESC);
