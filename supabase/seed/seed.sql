-- AssetIQ Idempotent Seed SQL Data with Full Demo Mock Dataset
-- Section 1: Readiness Config
INSERT INTO readiness_config (id, at_risk_threshold, not_ready_threshold, pm_overdue_grace_days)
VALUES ('00000000-0000-0000-0000-000000000001', 0.35, 0.70, 7)
ON CONFLICT (id) DO UPDATE SET 
    at_risk_threshold = EXCLUDED.at_risk_threshold,
    not_ready_threshold = EXCLUDED.not_ready_threshold,
    pm_overdue_grace_days = EXCLUDED.pm_overdue_grace_days;

-- Section 2: Medical Assets (50 assets)
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'AST-ANES-001', 'Mindray A7 Anesthesia System', 'ANESTHESIA_MACHINE', 'Mindray A7', 'SN-ANES-101', 'OR-1', 'AVAILABLE', '2026-08-11T14:44:00Z', '2027-02-07T14:44:00Z', 1250, 'OR Complex Floor 2', 'Anesthesiology', 'Mindray Medical', 'MND-2025-0912', '2027-08-06T14:44:00Z', '2027-08-06T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000002', 'AST-ANES-002', 'Drager Perseus A500', 'ANESTHESIA_MACHINE', 'Perseus A500', 'SN-ANES-102', 'OR-2', 'AVAILABLE', '2026-07-02T14:44:00Z', '2026-12-29T14:44:00Z', 1840, 'OR Complex Floor 2', 'Anesthesiology', 'Dräger Medical', 'DRG-2024-4412', '2027-06-27T14:44:00Z', '2027-06-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000003', 'AST-ANES-003', 'GE Avance CS2 Workstation', 'ANESTHESIA_MACHINE', 'Avance CS2', 'SN-ANES-103', 'OR-3', 'AVAILABLE', '2026-07-12T14:44:00Z', '2027-01-08T14:44:00Z', 2900, 'OR Complex Floor 2', 'Anesthesiology', 'GE HealthCare', 'GE-2023-8810', '2026-08-06T14:44:00Z', '2026-08-06T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000004', 'AST-ANES-004', 'Drager Primus Workstation', 'ANESTHESIA_MACHINE', 'Primus IE', 'SN-ANES-104', 'OR-4', 'UNDER_MAINTENANCE', '2026-03-14T14:44:00Z', '2026-09-05T14:44:00Z', 3400, 'OR Complex Floor 2', 'Anesthesiology', 'Dräger Medical', 'DRG-2024-9901', '2026-10-10T14:44:00Z', '2026-10-10T14:44:00Z', 'Expiring Soon')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000005', 'AST-ANES-005', 'Mindray Wato EX-65', 'ANESTHESIA_MACHINE', 'Wato EX-65', 'SN-ANES-105', 'OR-5', 'AVAILABLE', '2026-08-21T14:44:00Z', '2027-02-17T14:44:00Z', 950, 'OR Complex Floor 2', 'Anesthesiology', 'Mindray Medical', 'MND-2025-0105', '2027-10-25T14:44:00Z', '2027-10-25T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000006', 'AST-ANES-006', 'GE Datex-Ohmeda Avance', 'ANESTHESIA_MACHINE', 'Avance CS2 Pro', 'SN-ANES-106', 'OR-6', 'UNDER_REPAIR', '2026-02-22T14:44:00Z', '2026-08-21T14:44:00Z', 4120, 'OR Complex Floor 2', 'Anesthesiology', 'GE HealthCare', 'GE-2023-7720', '2026-07-22T14:44:00Z', '2026-07-22T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000007', 'AST-ANES-007', 'Drager Fabius GS Premium', 'ANESTHESIA_MACHINE', 'Fabius GS', 'SN-ANES-107', 'OR-1', 'AVAILABLE', '2026-08-01T14:44:00Z', '2027-01-28T14:44:00Z', 1600, 'OR Complex Floor 2', 'Anesthesiology', 'Dräger Medical', 'DRG-2025-1107', '2027-07-17T14:44:00Z', '2027-07-17T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000008', 'AST-ANES-008', 'Penlon Prima 456 Workstation', 'ANESTHESIA_MACHINE', 'Prima 456', 'SN-ANES-108', 'OR-4', 'AVAILABLE', '2026-03-09T14:44:00Z', '2026-09-05T14:44:00Z', 2100, 'OR Complex Floor 2', 'Anesthesiology', 'Philips Healthcare', 'PHS-2024-8808', '2027-03-19T14:44:00Z', '2027-03-19T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000010', 'AST-LAP-001', 'Stryker 1688 4K Tower', 'LAPAROSCOPIC_TOWER', 'Stryker 1688', 'SN-LAP-201', 'OR-1', 'AVAILABLE', '2026-08-06T14:44:00Z', '2027-02-02T14:44:00Z', 1420, 'OR Complex Floor 2', 'General Surgery', 'Stryker Medical', 'STR-2025-1688', '2027-07-27T14:44:00Z', '2027-07-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000011', 'AST-LAP-002', 'Olympus Visera Elite II', 'LAPAROSCOPIC_TOWER', 'Visera Elite II', 'SN-LAP-202', 'OR-6', 'AVAILABLE', '2026-07-22T14:44:00Z', '2027-01-18T14:44:00Z', 1780, 'OR Complex Floor 2', 'General Surgery', 'Olympus Medical Systems', 'OLY-2025-2202', '2027-06-07T14:44:00Z', '2027-06-07T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000012', 'AST-LAP-003', 'Karl Storz Image1 S 3D', 'LAPAROSCOPIC_TOWER', 'Image1 S', 'SN-LAP-203', 'OR-5', 'AVAILABLE', '2026-03-04T14:44:00Z', '2026-08-31T14:44:00Z', 2350, 'OR Complex Floor 2', 'General Surgery', 'Olympus Medical Systems', 'OLY-2024-1103', '2026-10-05T14:44:00Z', '2026-10-05T14:44:00Z', 'Expiring Soon')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000013', 'AST-LAP-004', 'Stryker 1588 AIM Tower', 'LAPAROSCOPIC_TOWER', '1588 AIM', 'SN-LAP-204', 'OR-3', 'UNDER_REPAIR', '2026-03-24T14:44:00Z', '2026-09-15T14:44:00Z', 3100, 'OR Complex Floor 2', 'General Surgery', 'Stryker Medical', 'STR-2023-1588', '2026-08-21T14:44:00Z', '2026-08-21T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000014', 'AST-LAP-005', 'Olympus EVIS EXERA III', 'LAPAROSCOPIC_TOWER', 'EXERA III', 'SN-LAP-205', 'OR-2', 'AVAILABLE', '2026-08-16T14:44:00Z', '2027-02-12T14:44:00Z', 1150, 'OR Complex Floor 2', 'General Surgery', 'Olympus Medical Systems', 'OLY-2025-0005', '2027-08-26T14:44:00Z', '2027-08-26T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000015', 'AST-CARM-001', 'GE OEC 9900 Elite C-Arm', 'CARM_FLUOROSCOPY', 'OEC 9900', 'SN-CARM-301', 'OR-1', 'AVAILABLE', '2026-07-27T14:44:00Z', '2027-01-23T14:44:00Z', 1950, 'OR Complex Floor 2', 'Orthopedics & Radiology', 'GE HealthCare', 'GE-2025-9900', '2027-07-07T14:44:00Z', '2027-07-07T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000016', 'AST-CARM-002', 'Ziehm Solo FD C-Arm', 'CARM_FLUOROSCOPY', 'Solo FD', 'SN-CARM-302', 'OR-2', 'AVAILABLE', '2026-06-22T14:44:00Z', '2026-12-19T14:44:00Z', 2400, 'OR Complex Floor 2', 'Orthopedics & Radiology', 'Siemens Healthineers', 'SIE-2023-3002', '2026-08-11T14:44:00Z', '2026-08-11T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000017', 'AST-CARM-003', 'Philips Veradius Unity 3D', 'CARM_FLUOROSCOPY', 'Veradius Unity', 'SN-CARM-303', 'OR-4', 'UNDER_REPAIR', '2026-03-14T14:44:00Z', '2026-09-10T14:44:00Z', 3200, 'OR Complex Floor 2', 'Orthopedics & Radiology', 'Philips Healthcare', 'PHS-2023-3303', '2026-09-05T14:44:00Z', '2026-09-05T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000018', 'AST-CARM-004', 'Siemens Cios Alpha C-Arm', 'CARM_FLUOROSCOPY', 'Cios Alpha', 'SN-CARM-304', 'OR-6', 'AVAILABLE', '2026-08-26T14:44:00Z', '2027-02-22T14:44:00Z', 880, 'OR Complex Floor 2', 'Orthopedics & Radiology', 'Siemens Healthineers', 'SIE-2025-4404', '2027-09-15T14:44:00Z', '2027-09-15T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000020', 'AST-VENT-001', 'Hamilton C6 ICU Ventilator', 'VENTILATOR', 'Hamilton C6', 'SN-VENT-401', 'ICU-1', 'AVAILABLE', '2026-08-11T14:44:00Z', '2027-02-07T14:44:00Z', 1500, 'ICU Complex Floor 3', 'Critical Care', 'Dräger Medical', 'DRG-2025-4001', '2027-08-06T14:44:00Z', '2027-08-06T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000021', 'AST-VENT-002', 'Puritan Bennett 980', 'VENTILATOR', 'PB980', 'SN-VENT-402', 'ICU-2', 'AVAILABLE', '2026-03-12T14:44:00Z', '2026-09-08T14:44:00Z', 2800, 'ICU Complex Floor 3', 'Critical Care', 'Medtronic', 'MDT-2024-9802', '2026-10-12T14:44:00Z', '2026-10-12T14:44:00Z', 'Expiring Soon')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000022', 'AST-VENT-003', 'Drager Evita V800', 'VENTILATOR', 'Evita V800', 'SN-VENT-403', 'OR-3', 'AVAILABLE', '2026-08-21T14:44:00Z', '2027-02-17T14:44:00Z', 1200, 'OR Complex Floor 2', 'Anesthesiology', 'Dräger Medical', 'DRG-2025-8803', '2027-09-05T14:44:00Z', '2027-09-05T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000023', 'AST-VENT-004', 'Getinge Servo-u Ventilator', 'VENTILATOR', 'Servo-u', 'SN-VENT-404', 'ICU-1', 'UNDER_REPAIR', '2026-02-12T14:44:00Z', '2026-08-11T14:44:00Z', 3900, 'ICU Complex Floor 3', 'Critical Care', 'Siemens Healthineers', 'SIE-2023-4404', '2026-06-22T14:44:00Z', '2026-06-22T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000024', 'AST-VENT-005', 'Hamilton G5 ICU Ventilator', 'VENTILATOR', 'Hamilton G5', 'SN-VENT-405', 'ICU-2', 'AVAILABLE', '2026-08-01T14:44:00Z', '2027-01-28T14:44:00Z', 1650, 'ICU Complex Floor 3', 'Critical Care', 'Dräger Medical', 'DRG-2025-5505', '2027-06-17T14:44:00Z', '2027-06-17T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000028', 'AST-MON-001', 'Philips IntelliVue MX800', 'SURGICAL_MONITOR', 'MX800', 'SN-MON-501', 'OR-1', 'AVAILABLE', '2026-08-21T14:44:00Z', '2027-02-17T14:44:00Z', 2100, 'OR Complex Floor 2', 'Anesthesiology', 'Philips Healthcare', 'PHS-2025-5001', '2027-08-16T14:44:00Z', '2027-08-16T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000029', 'AST-MON-002', 'GE B850 Patient Monitor', 'SURGICAL_MONITOR', 'B850', 'SN-MON-502', 'OR-1', 'AVAILABLE', '2026-08-11T14:44:00Z', '2027-02-07T14:44:00Z', 1900, 'OR Complex Floor 2', 'Anesthesiology', 'GE HealthCare', 'GE-2025-8502', '2027-07-27T14:44:00Z', '2027-07-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000030', 'AST-MON-003', 'Mindray BeneVision N22', 'SURGICAL_MONITOR', 'N22', 'SN-MON-503', 'OR-2', 'AVAILABLE', '2026-07-22T14:44:00Z', '2027-01-18T14:44:00Z', 1400, 'OR Complex Floor 2', 'Anesthesiology', 'Mindray Medical', 'MND-2025-5003', '2027-07-07T14:44:00Z', '2027-07-07T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000031', 'AST-MON-004', 'Nihon Kohden Life Scope', 'SURGICAL_MONITOR', 'Life Scope G9', 'SN-MON-504', 'OR-5', 'AVAILABLE', '2026-06-27T14:44:00Z', '2026-12-24T14:44:00Z', 2600, 'OR Complex Floor 2', 'Anesthesiology', 'Philips Healthcare', 'PHS-2023-5504', '2026-08-01T14:44:00Z', '2026-08-01T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000032', 'AST-MON-005', 'Drager Infinity Delta', 'SURGICAL_MONITOR', 'Delta XL', 'SN-MON-505', 'OR-3', 'AVAILABLE', '2026-08-31T14:44:00Z', '2027-02-27T14:44:00Z', 1100, 'OR Complex Floor 2', 'Anesthesiology', 'Dräger Medical', 'DRG-2025-5005', '2027-09-20T14:44:00Z', '2027-09-20T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000035', 'AST-DEFIB-001', 'Zoll R Series Defibrillator', 'DEFIBRILLATOR', 'R Series Plus', 'SN-DEFIB-601', 'OR Complex Hallway 2', 'AVAILABLE', '2026-08-21T14:44:00Z', '2027-02-17T14:44:00Z', 450, 'OR Complex Floor 2', 'Biomedical Engineering', 'Zoll Medical', 'ZOL-2025-6001', '2027-07-17T14:44:00Z', '2027-07-17T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000036', 'AST-DEFIB-002', 'Physio-Control Lifepak 20', 'DEFIBRILLATOR', 'Lifepak 20e', 'SN-DEFIB-602', 'PACU-1', 'AVAILABLE', '2026-03-14T14:44:00Z', '2026-09-10T14:44:00Z', 980, 'PACU Floor 2', 'Biomedical Engineering', 'Stryker Medical', 'STR-2024-6002', '2026-10-08T14:44:00Z', '2026-10-08T14:44:00Z', 'Expiring Soon')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000037', 'AST-ESU-001', 'Medtronic ForceTriad ESU', 'ELECTROSURGICAL_UNIT', 'ForceTriad FX', 'SN-ESU-701', 'OR-1', 'AVAILABLE', '2026-08-16T14:44:00Z', '2027-02-12T14:44:00Z', 1600, 'OR Complex Floor 2', 'General Surgery', 'Medtronic', 'MDT-2025-7001', '2027-08-06T14:44:00Z', '2027-08-06T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000038', 'AST-ESU-002', 'Erbe VIO 300 S ESU', 'ELECTROSURGICAL_UNIT', 'VIO 300 S', 'SN-ESU-702', 'OR-2', 'AVAILABLE', '2026-08-01T14:44:00Z', '2027-01-28T14:44:00Z', 1450, 'OR Complex Floor 2', 'General Surgery', 'Olympus Medical Systems', 'OLY-2025-7002', '2027-06-27T14:44:00Z', '2027-06-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000039', 'AST-ESU-003', 'Covidien Valleylab FT10', 'ELECTROSURGICAL_UNIT', 'Valleylab FT10', 'SN-ESU-703', 'OR-3', 'UNDER_REPAIR', '2026-03-19T14:44:00Z', '2026-09-15T14:44:00Z', 2100, 'OR Complex Floor 2', 'General Surgery', 'Medtronic', 'MDT-2023-7703', '2026-07-12T14:44:00Z', '2026-07-12T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000040', 'AST-PUMP-001', 'Baxter Sigma Spectrum Pump', 'INFUSION_PUMP', 'Sigma Spectrum', 'SN-PUMP-801', 'OR-1', 'AVAILABLE', '2026-08-26T14:44:00Z', '2027-02-22T14:44:00Z', 1800, 'OR Complex Floor 2', 'Anesthesiology', 'Baxter Healthcare', 'BAX-2025-8001', '2027-07-27T14:44:00Z', '2027-07-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000041', 'AST-PUMP-002', 'B. Braun Infusomat Space', 'INFUSION_PUMP', 'Infusomat Space', 'SN-PUMP-802', 'OR-2', 'AVAILABLE', '2026-08-11T14:44:00Z', '2027-02-07T14:44:00Z', 1650, 'OR Complex Floor 2', 'Anesthesiology', 'Baxter Healthcare', 'BAX-2025-8002', '2027-07-07T14:44:00Z', '2027-07-07T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000042', 'AST-PUMP-003', 'Alaris 8015 Infusion System', 'INFUSION_PUMP', 'Alaris 8015', 'SN-PUMP-803', 'ICU-1', 'AVAILABLE', '2026-06-17T14:44:00Z', '2026-12-14T14:44:00Z', 3100, 'ICU Complex Floor 3', 'Critical Care', 'Becton Dickinson', 'BDK-2023-8803', '2026-08-21T14:44:00Z', '2026-08-21T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000043', 'AST-PUMP-004', 'Medtronic Minimed Pump', 'INFUSION_PUMP', 'Minimed 770G', 'SN-PUMP-804', 'OR-5', 'AVAILABLE', '2026-08-31T14:44:00Z', '2027-02-27T14:44:00Z', 920, 'OR Complex Floor 2', 'Anesthesiology', 'Medtronic', 'MDT-2025-8004', '2027-09-05T14:44:00Z', '2027-09-05T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000044', 'AST-LGT-001', 'Steris HarmonyLED Surgical Light', 'SURGICAL_LIGHT', 'HarmonyLED 585', 'SN-LGT-901', 'OR-1', 'AVAILABLE', '2026-07-22T14:44:00Z', '2027-01-18T14:44:00Z', 2400, 'OR Complex Floor 2', 'Biomedical Engineering', 'Stryker Medical', 'STR-2025-9001', '2027-07-17T14:44:00Z', '2027-07-17T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000045', 'AST-LGT-002', 'Drager Polaris 600 Light System', 'SURGICAL_LIGHT', 'Polaris 600', 'SN-LGT-902', 'OR-2', 'AVAILABLE', '2026-08-06T14:44:00Z', '2027-02-02T14:44:00Z', 1900, 'OR Complex Floor 2', 'Biomedical Engineering', 'Dräger Medical', 'DRG-2025-9002', '2027-08-06T14:44:00Z', '2027-08-06T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000046', 'AST-LGT-003', 'Trumpf iLED 7 Surgical Light', 'SURGICAL_LIGHT', 'iLED 7', 'SN-LGT-903', 'OR-3', 'AVAILABLE', '2026-08-21T14:44:00Z', '2027-02-17T14:44:00Z', 1300, 'OR Complex Floor 2', 'Biomedical Engineering', 'Siemens Healthineers', 'SIE-2025-9003', '2027-08-26T14:44:00Z', '2027-08-26T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000047', 'AST-STER-001', 'Tuttnauer Elara 11 Autoclave', 'STERILIZER_AUTOCLAVE', 'Elara 11', 'SN-STER-001', 'STERILIZATION-1', 'AVAILABLE', '2026-08-11T14:44:00Z', '2027-02-07T14:44:00Z', 1750, 'Central Sterile Supply', 'Sterile Processing', 'Olympus Medical Systems', 'OLY-2025-0001', '2027-06-27T14:44:00Z', '2027-06-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000048', 'AST-STER-002', 'Getinge AMSCO 400 Sterilizer', 'STERILIZER_AUTOCLAVE', 'AMSCO 400', 'SN-STER-002', 'STERILIZATION-1', 'AVAILABLE', '2026-02-27T14:44:00Z', '2026-08-26T14:44:00Z', 3400, 'Central Sterile Supply', 'Sterile Processing', 'GE HealthCare', 'GE-2024-0002', '2026-10-02T14:44:00Z', '2026-10-02T14:44:00Z', 'Expiring Soon')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000049', 'AST-STER-003', 'Steris V-PRO Max Sterilizer', 'STERILIZER_AUTOCLAVE', 'V-PRO Max', 'SN-STER-003', 'STERILIZATION-1', 'UNDER_REPAIR', '2026-03-14T14:44:00Z', '2026-09-10T14:44:00Z', 2900, 'Central Sterile Supply', 'Sterile Processing', 'Stryker Medical', 'STR-2023-0003', '2026-07-22T14:44:00Z', '2026-07-22T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000050', 'AST-ECG-001', 'GE Mac 2000 12-Lead ECG', 'ECG_MACHINE', 'Mac 2000', 'SN-ECG-101', 'PACU-1', 'AVAILABLE', '2026-08-16T14:44:00Z', '2027-02-12T14:44:00Z', 850, 'PACU Floor 2', 'Cardiology', 'GE HealthCare', 'GE-2025-1101', '2027-07-27T14:44:00Z', '2027-07-27T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000051', 'AST-ECG-002', 'Philips PageWriter TC70', 'ECG_MACHINE', 'PageWriter TC70', 'SN-ECG-102', 'OR-3', 'AVAILABLE', '2026-08-01T14:44:00Z', '2027-01-28T14:44:00Z', 1100, 'OR Complex Floor 2', 'Cardiology', 'Philips Healthcare', 'PHS-2025-1102', '2027-07-07T14:44:00Z', '2027-07-07T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000052', 'AST-ECG-003', 'Nihon Kohden ECG-2350', 'ECG_MACHINE', 'ECG-2350', 'SN-ECG-103', 'OR-4', 'AVAILABLE', '2026-07-02T14:44:00Z', '2026-12-29T14:44:00Z', 1400, 'OR Complex Floor 2', 'Cardiology', 'Philips Healthcare', 'PHS-2023-1103', '2026-08-16T14:44:00Z', '2026-08-16T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000053', 'AST-DIAL-001', 'Fresenius 5008S Hemodialysis System', 'DIALYSIS_MACHINE', '5008S CorDiax', 'SN-DIAL-201', 'ICU-1', 'AVAILABLE', '2026-08-21T14:44:00Z', '2027-02-17T14:44:00Z', 1900, 'Nephrology Unit Floor 3', 'Nephrology', 'Baxter Healthcare', 'BAX-2025-2201', '2027-08-16T14:44:00Z', '2027-08-16T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000054', 'AST-DIAL-002', 'Baxter Artis Physio System', 'DIALYSIS_MACHINE', 'Artis Physio', 'SN-DIAL-202', 'ICU-2', 'AVAILABLE', '2026-08-06T14:44:00Z', '2027-02-02T14:44:00Z', 1600, 'Nephrology Unit Floor 3', 'Nephrology', 'Baxter Healthcare', 'BAX-2025-2202', '2027-07-17T14:44:00Z', '2027-07-17T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000055', 'AST-DIAL-003', 'Nipro Surdial X Dialysis Machine', 'DIALYSIS_MACHINE', 'Surdial X', 'SN-DIAL-203', 'ICU-1', 'UNDER_REPAIR', '2026-02-22T14:44:00Z', '2026-08-21T14:44:00Z', 2800, 'Nephrology Unit Floor 3', 'Nephrology', 'Baxter Healthcare', 'BAX-2023-2203', '2026-07-02T14:44:00Z', '2026-07-02T14:44:00Z', 'Expired')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000056', 'AST-DIAL-004', 'B. Braun Dialog+ Dialysis System', 'DIALYSIS_MACHINE', 'Dialog+', 'SN-DIAL-204', 'ICU-2', 'AVAILABLE', '2026-08-31T14:44:00Z', '2027-02-27T14:44:00Z', 1250, 'Nephrology Unit Floor 3', 'Nephrology', 'Baxter Healthcare', 'BAX-2025-2204', '2027-09-15T14:44:00Z', '2027-09-15T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;
INSERT INTO assets (id, asset_tag, name, category, model, serial_number, operating_room, status, last_pm_date, next_pm_due_date, total_operating_hours, location, department, warranty_vendor, warranty_contract_number, warranty_end_date, warranty_expiration_date, contract_status)
VALUES ('a0000000-0000-0000-0000-000000000057', 'AST-DIAL-005', 'Fresenius 2008T Dialysis System', 'DIALYSIS_MACHINE', '2008T BlueStar', 'SN-DIAL-205', 'ICU-1', 'AVAILABLE', '2026-07-27T14:44:00Z', '2027-01-23T14:44:00Z', 1400, 'Nephrology Unit Floor 3', 'Nephrology', 'Baxter Healthcare', 'BAX-2025-2205', '2027-06-17T14:44:00Z', '2027-06-17T14:44:00Z', 'Active')
ON CONFLICT (id) DO UPDATE SET
    asset_tag = EXCLUDED.asset_tag,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    operating_room = EXCLUDED.operating_room,
    status = EXCLUDED.status,
    last_pm_date = EXCLUDED.last_pm_date,
    next_pm_due_date = EXCLUDED.next_pm_due_date,
    total_operating_hours = EXCLUDED.total_operating_hours,
    location = EXCLUDED.location,
    department = EXCLUDED.department,
    warranty_vendor = EXCLUDED.warranty_vendor,
    warranty_contract_number = EXCLUDED.warranty_contract_number,
    warranty_end_date = EXCLUDED.warranty_end_date,
    warranty_expiration_date = EXCLUDED.warranty_expiration_date,
    contract_status = EXCLUDED.contract_status;

-- Section 3: Breakdown Incidents (15 records)
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000029', '2026-09-10T14:44:00Z', '2026-09-12T14:44:00Z', 'CRITICAL', 'ELECTRICAL', 'ECG telemetry signal drop during pre-op monitoring. Mainboard power relay swapped.', 'Replaced internal power board, recalibrated channel signals. Unit cleared.', 48)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', '2026-08-21T14:44:00Z', NULL, 'CRITICAL', 'MECHANICAL', 'Vaporizer locking mechanism jammed mid-procedure backup used', 'Unit taken out of service for manufacturer repair', 720)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000013', '2026-09-06T14:44:00Z', NULL, 'HIGH', 'SOFTWARE', 'Camera head coupling failure and video signal flickering on 4K display.', 'Awaiting OEM replacement optical coupler.', 336)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000017', '2026-08-29T14:44:00Z', NULL, 'CRITICAL', 'ELECTRICAL', 'Flat panel detector high-voltage generator fault alarm.', 'Under repair by Philips field service engineer.', 528)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000023', '2026-09-15T14:44:00Z', NULL, 'CRITICAL', 'MECHANICAL', 'Expiratory valve diaphragm leak detected during automated self-test.', 'Diaphragm kit ordered from Siemens.', 120)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000039', '2026-09-02T14:44:00Z', NULL, 'HIGH', 'CALIBRATION', 'Bipolar energy output impedance mismatch alarm.', 'Internal RF transformer undergoing bench testing.', 432)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000049', '2026-09-08T14:44:00Z', NULL, 'HIGH', 'MECHANICAL', 'Chamber pressure seal leak during low-temp plasma cycle.', 'Gasket replaced, testing vacuum integrity.', 288)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000055', '2026-09-12T14:44:00Z', NULL, 'HIGH', 'MECHANICAL', 'Blood pump roller pressure sensor out of spec.', 'BioMed bench repair in progress.', 192)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '2026-05-23T14:44:00Z', '2026-05-25T14:44:00Z', 'MEDIUM', 'CALIBRATION', 'O2 sensor drift alarm during routine morning pre-flight.', 'Replaced O2 cell sensor and recalibrated gas module.', 48)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', '2026-05-03T14:44:00Z', '2026-05-04T14:44:00Z', 'LOW', 'OTHER', 'Light source LED module overheating warning.', 'Cleaned dust filters and replaced cooling fan.', 24)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000015', '2026-06-17T14:44:00Z', '2026-06-19T14:44:00Z', 'MEDIUM', 'SOFTWARE', 'Foot pedal switch intermittent response.', 'Replaced heavy-duty foot cable assembly.', 48)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000020', '2026-07-02T14:44:00Z', '2026-07-03T14:44:00Z', 'LOW', 'CALIBRATION', 'Flow sensor calibration offset warning.', 'Calibrated flow transducer with test lung.', 24)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000035', '2026-04-13T14:44:00Z', '2026-04-14T14:44:00Z', 'MEDIUM', 'ELECTRICAL', 'Internal battery capacity degraded during monthly discharge check.', 'Replaced OEM rechargeable battery pack.', 24)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000040', '2026-06-02T14:44:00Z', '2026-06-03T14:44:00Z', 'LOW', 'MECHANICAL', 'Pole clamp latch stickiness.', 'Replaced mechanical clamp latch assembly.', 16)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;
INSERT INTO breakdown_incidents (id, asset_id, reported_at, resolved_at, severity, failure_type, description, resolution_notes, downtime_hours)
VALUES ('e0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000047', '2026-07-07T14:44:00Z', '2026-07-08T14:44:00Z', 'MEDIUM', 'MECHANICAL', 'Door seal steam bypass detected during weekly Bowie-Dick test.', 'Replaced silicone door gasket and verified cycle chamber pressure.', 36)
ON CONFLICT (id) DO UPDATE SET
    reported_at = EXCLUDED.reported_at,
    resolved_at = EXCLUDED.resolved_at,
    severity = EXCLUDED.severity,
    failure_type = EXCLUDED.failure_type,
    description = EXCLUDED.description,
    resolution_notes = EXCLUDED.resolution_notes,
    downtime_hours = EXCLUDED.downtime_hours;

-- Section 4: Maintenance Records (35 records)
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CALIBRATION', 'BioMed Tech Lead A', '2026-08-21T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Mindray A7 Anesthesia System.', 350)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-08-13T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Drager Perseus A500.', 375)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-08-05T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for GE Avance CS2 Workstation.', 400)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'CALIBRATION', 'Senior Field Service Engineer', '2026-07-28T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Drager Primus Workstation.', 425)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-07-20T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Mindray Wato EX-65.', 450)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-07-12T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for GE Datex-Ohmeda Avance.', 475)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'CALIBRATION', 'BioMed Tech Lead A', '2026-07-04T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Drager Fabius GS Premium.', 500)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-06-26T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Penlon Prima 456 Workstation.', 525)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000010', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-06-18T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Stryker 1688 4K Tower.', 550)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000011', 'CALIBRATION', 'Senior Field Service Engineer', '2026-06-10T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Olympus Visera Elite II.', 575)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000012', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-06-02T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Karl Storz Image1 S 3D.', 600)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000013', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-05-25T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Stryker 1588 AIM Tower.', 625)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000014', 'CALIBRATION', 'BioMed Tech Lead A', '2026-05-17T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Olympus EVIS EXERA III.', 650)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000015', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-05-09T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for GE OEC 9900 Elite C-Arm.', 675)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000016', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-05-01T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Ziehm Solo FD C-Arm.', 700)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000017', 'CALIBRATION', 'Senior Field Service Engineer', '2026-04-23T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Philips Veradius Unity 3D.', 725)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000018', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-04-15T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Siemens Cios Alpha C-Arm.', 750)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000020', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-04-07T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Hamilton C6 ICU Ventilator.', 775)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000021', 'CALIBRATION', 'BioMed Tech Lead A', '2026-03-30T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Puritan Bennett 980.', 800)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000022', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-03-22T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Drager Evita V800.', 825)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000023', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-03-14T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Getinge Servo-u Ventilator.', 850)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000024', 'CALIBRATION', 'Senior Field Service Engineer', '2026-03-06T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Hamilton G5 ICU Ventilator.', 875)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000028', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-02-26T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Philips IntelliVue MX800.', 900)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000029', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-02-18T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for GE B850 Patient Monitor.', 925)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000030', 'CALIBRATION', 'BioMed Tech Lead A', '2026-02-10T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Mindray BeneVision N22.', 950)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000031', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-02-02T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Nihon Kohden Life Scope.', 975)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000032', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-01-25T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Drager Infinity Delta.', 1000)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000035', 'CALIBRATION', 'Senior Field Service Engineer', '2026-01-17T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Zoll R Series Defibrillator.', 1025)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000036', 'PREVENTIVE', 'BioMed Tech Lead A', '2026-01-09T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Physio-Control Lifepak 20.', 1050)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000037', 'PREVENTIVE', 'Senior Field Service Engineer', '2026-01-01T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Medtronic ForceTriad ESU.', 1075)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000038', 'CALIBRATION', 'BioMed Tech Lead A', '2025-12-24T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Erbe VIO 300 S ESU.', 1100)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000039', 'PREVENTIVE', 'Senior Field Service Engineer', '2025-12-16T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Covidien Valleylab FT10.', 1125)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000040', 'PREVENTIVE', 'BioMed Tech Lead A', '2025-12-08T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Baxter Sigma Spectrum Pump.', 350)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000041', 'CALIBRATION', 'Senior Field Service Engineer', '2025-11-30T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for B. Braun Infusomat Space.', 375)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;
INSERT INTO maintenance_records (id, asset_id, maintenance_type, performed_by, performed_at, details, cost)
VALUES ('d0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000042', 'PREVENTIVE', 'BioMed Tech Lead A', '2025-11-22T14:44:00Z', 'Scheduled annual PM check & electrical safety inspection for Alaris 8015 Infusion System.', 400)
ON CONFLICT (id) DO UPDATE SET
    maintenance_type = EXCLUDED.maintenance_type,
    performed_by = EXCLUDED.performed_by,
    performed_at = EXCLUDED.performed_at,
    details = EXCLUDED.details,
    cost = EXCLUDED.cost;

-- Section 5: Surgeries (13 surgeries)
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000001', 'SURG-2026-001', 'PAT-1001', 'Laparoscopic Cholecystectomy', 'LAPAROSCOPIC', 'OR-1', '2026-09-21T16:44:00Z', '2026-09-21T19:44:00Z', 'Dr. Ananya Sharma', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000002', 'SURG-2026-002', 'PAT-1002', 'Total Knee Arthroplasty', 'ORTHOPEDIC', 'OR-2', '2026-09-21T22:44:00Z', '2026-09-22T02:44:00Z', 'Dr. Vikram Malhotra', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000003', 'SURG-2026-003', 'PAT-1003', 'Thyroidectomy & Neck Dissection', 'GENERAL_SURGERY', 'OR-3', '2026-09-22T14:44:00Z', '2026-09-22T17:44:00Z', 'Dr. Meera Nair', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000004', 'SURG-2026-004', 'PAT-1004', 'Lumbar Spinal Fusion', 'NEUROSURGERY', 'OR-4', '2026-09-22T21:44:00Z', '2026-09-23T02:44:00Z', 'Dr. Rajesh Kulkarni', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000005', 'SURG-2026-005', 'PAT-1005', 'Laparoscopic Appendectomy', 'LAPAROSCOPIC', 'OR-5', '2026-09-23T14:44:00Z', '2026-09-23T17:44:00Z', 'Dr. Sanjay Gupta', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000006', 'SURG-2026-006', 'PAT-1006', 'Coronary Artery Bypass Graft (CABG)', 'CARDIAC', 'OR-6', '2026-09-23T22:44:00Z', '2026-09-24T04:44:00Z', 'Dr. Priya Deshmukh', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000007', 'SURG-2026-007', 'PAT-1007', 'Pediatric Craniotomy', 'NEUROSURGERY', 'OR-1', '2026-09-24T14:44:00Z', '2026-09-24T19:44:00Z', 'Dr. Rajesh Kulkarni', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000008', 'SURG-2026-008', 'PAT-1008', 'Total Hip Arthroplasty', 'ORTHOPEDIC', 'OR-2', '2026-09-24T23:44:00Z', '2026-09-25T03:44:00Z', 'Dr. Vikram Malhotra', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000009', 'SURG-2026-009', 'PAT-1009', 'Emergency Trauma Laparotomy', 'LAPAROSCOPIC', 'OR-3', '2026-09-25T14:44:00Z', '2026-09-25T18:44:00Z', 'Dr. Ananya Sharma', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000010', 'SURG-2026-010', 'PAT-1010', 'Pediatric Hernia Repair', 'GENERAL_SURGERY', 'OR-4', '2026-09-26T00:44:00Z', '2026-09-26T02:44:00Z', 'Dr. Meera Nair', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000011', 'SURG-2026-011', 'PAT-1011', 'Radical Mastectomy', 'GENERAL_SURGERY', 'OR-5', '2026-09-26T15:44:00Z', '2026-09-26T18:44:00Z', 'Dr. Sanjay Gupta', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000012', 'SURG-2026-012', 'PAT-1012', 'Gastric Bypass Bariatric', 'LAPAROSCOPIC', 'OR-6', '2026-09-27T06:44:00Z', '2026-09-27T10:44:00Z', 'Dr. Ananya Sharma', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000013', 'SURG-2026-013', 'PAT-1013', 'ACL Knee Reconstruction', 'ORTHOPEDIC', 'OR-1', '2026-09-28T02:44:00Z', '2026-09-28T05:44:00Z', 'Dr. Vikram Malhotra', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000014', 'SURG-2026-014', 'PAT-1014', 'Pacemaker Implantation', 'CARDIAC', 'OR-2', '2026-09-28T22:44:00Z', '2026-09-29T01:44:00Z', 'Dr. Priya Deshmukh', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;
INSERT INTO surgeries (id, surgery_code, patient_id, procedure_name, surgery_type, operating_room, scheduled_start_time, scheduled_end_time, surgeon_name, status)
VALUES ('b0000000-0000-0000-0000-000000000015', 'SURG-2026-015', 'PAT-1015', 'AV Fistula Dialysis Access Creation', 'GENERAL_SURGERY', 'OR-3', '2026-09-29T18:44:00Z', '2026-09-29T21:44:00Z', 'Dr. Meera Nair', 'SCHEDULED')
ON CONFLICT (id) DO UPDATE SET
    surgery_code = EXCLUDED.surgery_code,
    patient_id = EXCLUDED.patient_id,
    procedure_name = EXCLUDED.procedure_name,
    surgery_type = EXCLUDED.surgery_type,
    operating_room = EXCLUDED.operating_room,
    scheduled_start_time = EXCLUDED.scheduled_start_time,
    scheduled_end_time = EXCLUDED.scheduled_end_time,
    surgeon_name = EXCLUDED.surgeon_name,
    status = EXCLUDED.status;

-- Section 6: Surgery Required Assets
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000001', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'LAPAROSCOPIC_TOWER', 'a0000000-0000-0000-0000-000000000010', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000037', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'SURGICAL_MONITOR', 'a0000000-0000-0000-0000-000000000028', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000002', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000016', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000038', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'SURGICAL_MONITOR', 'a0000000-0000-0000-0000-000000000030', 'STANDARD', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000005', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000037', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', 'SURGICAL_MONITOR', 'a0000000-0000-0000-0000-000000000032', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000004', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000004', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000004', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000015', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000004', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000038', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000005', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000007', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000005', 'LAPAROSCOPIC_TOWER', 'a0000000-0000-0000-0000-000000000012', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000005', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000037', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000006', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000006', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000006', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000018', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000006', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000038', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000007', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000001', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000007', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000015', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000007', 'SURGICAL_MONITOR', 'a0000000-0000-0000-0000-000000000029', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000008', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000002', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000008', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000018', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000026', 'b0000000-0000-0000-0000-000000000008', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000038', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000027', 'b0000000-0000-0000-0000-000000000009', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000005', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000028', 'b0000000-0000-0000-0000-000000000009', 'LAPAROSCOPIC_TOWER', 'a0000000-0000-0000-0000-000000000013', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000029', 'b0000000-0000-0000-0000-000000000010', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000008', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000030', 'b0000000-0000-0000-0000-000000000010', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000038', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000031', 'b0000000-0000-0000-0000-000000000011', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000007', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000032', 'b0000000-0000-0000-0000-000000000011', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000037', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000033', 'b0000000-0000-0000-0000-000000000012', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000001', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000034', 'b0000000-0000-0000-0000-000000000012', 'LAPAROSCOPIC_TOWER', 'a0000000-0000-0000-0000-000000000011', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000035', 'b0000000-0000-0000-0000-000000000013', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000002', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000036', 'b0000000-0000-0000-0000-000000000013', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000015', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000037', 'b0000000-0000-0000-0000-000000000014', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000002', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000038', 'b0000000-0000-0000-0000-000000000014', 'CARM_FLUOROSCOPY', 'a0000000-0000-0000-0000-000000000018', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000039', 'b0000000-0000-0000-0000-000000000015', 'ANESTHESIA_MACHINE', 'a0000000-0000-0000-0000-000000000005', 'CRITICAL', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;
INSERT INTO surgery_required_assets (id, surgery_id, required_category, assigned_asset_id, criticality, quantity, is_manual_override)
VALUES ('c0000000-0000-0000-0000-000000000040', 'b0000000-0000-0000-0000-000000000015', 'ELECTROSURGICAL_UNIT', 'a0000000-0000-0000-0000-000000000037', 'IMPORTANT', 1, false)
ON CONFLICT (id) DO UPDATE SET
    surgery_id = EXCLUDED.surgery_id,
    required_category = EXCLUDED.required_category,
    assigned_asset_id = EXCLUDED.assigned_asset_id,
    criticality = EXCLUDED.criticality,
    quantity = EXCLUDED.quantity,
    is_manual_override = EXCLUDED.is_manual_override;