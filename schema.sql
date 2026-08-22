CREATE DATABASE IF NOT EXISTS ilinkmth_crm;
USE ilinkmth_crm;

DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS businesses;

CREATE TABLE businesses (
  id VARCHAR(64) NOT NULL,
  businessName VARCHAR(255) NOT NULL,
  sector ENUM(
    'Pharmacy',
    'Cosmetics & Beauty',
    'Mini-Market',
    'Supermarket',
    'Perfume',
    'Mart / General Retail',
    'Other'
  ) NOT NULL,
  contactPerson VARCHAR(150) NOT NULL,
  position VARCHAR(150) DEFAULT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  location VARCHAR(200) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  status ENUM(
    'Lead',
    'Interested',
    'Maybe',
    'Customer',
    'One-Time Customer',
    'Not Interested',
    'Lost'
  ) NOT NULL DEFAULT 'Lead',
  salesStage ENUM(
    'New Lead',
    'Contacted',
    'Demo Scheduled',
    'Demo Completed',
    'Trial',
    'Negotiation',
    'Ready to Buy',
    'Customer',
    'One-Time Customer',
    'Lost',
    'Not Interested'
  ) NOT NULL DEFAULT 'New Lead',
  sectorFields JSON DEFAULT NULL,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sector (sector),
  KEY idx_status (status),
  KEY idx_updated_at (updatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE visits (
  id VARCHAR(64) NOT NULL,
  businessId VARCHAR(64) NOT NULL,
  visitDate DATE NOT NULL,
  contactMethod ENUM(
    'On-site',
    'Phone',
    'WhatsApp',
    'Online',
    'Other'
  ) NOT NULL,
  interestStatus ENUM(
    'Interested',
    'Maybe',
    'Not Interested',
    'Existing Customer'
  ) NOT NULL,
  feedback TEXT NOT NULL,
  reason TEXT DEFAULT NULL,
  liked TEXT DEFAULT NULL,
  objection TEXT DEFAULT NULL,
  requestedFeature TEXT DEFAULT NULL,
  nextAction ENUM(
    'Call',
    'WhatsApp',
    'Visit',
    'Demo',
    'Send Price',
    'Start Trial',
    'Setup',
    'Follow Up',
    'No Action'
  ) NOT NULL,
  nextFollowUpDate DATE DEFAULT NULL,
  nextFollowUpMethod ENUM(
    'On-site',
    'Phone',
    'WhatsApp',
    'Online'
  ) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  followUpCompleted TINYINT(1) NOT NULL DEFAULT 0,
  createdAt BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_business_id (businessId),
  KEY idx_visit_date (visitDate),
  KEY idx_next_follow_up_date (nextFollowUpDate),
  CONSTRAINT fk_visits_business
    FOREIGN KEY (businessId)
    REFERENCES businesses(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional data-quality checks for follow-up fields.
-- If your MySQL version supports generated checks, you can also add app-level validation in the backend.

-- Example import query for exported data from the existing frontend:
-- INSERT INTO businesses (id, businessName, sector, contactPerson, position, phone, whatsapp, email, location, notes, status, salesStage, sectorFields, createdAt, updatedAt)
-- VALUES (...);
--
-- INSERT INTO visits (id, businessId, visitDate, contactMethod, interestStatus, feedback, reason, liked, objection, requestedFeature, nextAction, nextFollowUpDate, nextFollowUpMethod, notes, followUpCompleted, createdAt)
-- VALUES (...);
