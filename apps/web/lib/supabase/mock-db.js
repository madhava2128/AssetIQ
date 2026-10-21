// In-Memory & Supabase Database Abstraction Layer for AssetIQ (Stage 1, 2, 3 & Demo Seed Data)

const initialAssets = [
    {
        "id": "a0000000-0000-0000-0000-000000000001",
        "asset_tag": "AST-ANES-001",
        "name": "Mindray A7 Anesthesia System",
        "category": "ANESTHESIA_MACHINE",
        "model": "Mindray A7",
        "serial_number": "SN-ANES-101",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-11T14:44:00Z",
        "next_pm_due_date": "2027-02-07T14:44:00Z",
        "total_operating_hours": 1250,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Mindray Medical",
        "warranty_contract_number": "MND-2025-0912",
        "warranty_end_date": "2027-08-06T14:44:00Z",
        "warranty_expiration_date": "2027-08-06T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Mindray Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000002",
        "asset_tag": "AST-ANES-002",
        "name": "Drager Perseus A500",
        "category": "ANESTHESIA_MACHINE",
        "model": "Perseus A500",
        "serial_number": "SN-ANES-102",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-02T14:44:00Z",
        "next_pm_due_date": "2026-12-29T14:44:00Z",
        "total_operating_hours": 1840,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2024-4412",
        "warranty_end_date": "2027-06-27T14:44:00Z",
        "warranty_expiration_date": "2027-06-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000003",
        "asset_tag": "AST-ANES-003",
        "name": "GE Avance CS2 Workstation",
        "category": "ANESTHESIA_MACHINE",
        "model": "Avance CS2",
        "serial_number": "SN-ANES-103",
        "operating_room": "OR-3",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-12T14:44:00Z",
        "next_pm_due_date": "2027-01-08T14:44:00Z",
        "total_operating_hours": 2900,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "GE HealthCare",
        "warranty_contract_number": "GE-2023-8810",
        "warranty_end_date": "2026-08-06T14:44:00Z",
        "warranty_expiration_date": "2026-08-06T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "GE HealthCare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000004",
        "asset_tag": "AST-ANES-004",
        "name": "Drager Primus Workstation",
        "category": "ANESTHESIA_MACHINE",
        "model": "Primus IE",
        "serial_number": "SN-ANES-104",
        "operating_room": "OR-4",
        "status": "UNDER_MAINTENANCE",
        "last_pm_date": "2026-03-14T14:44:00Z",
        "next_pm_due_date": "2026-09-05T14:44:00Z",
        "total_operating_hours": 3400,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2024-9901",
        "warranty_end_date": "2026-10-10T14:44:00Z",
        "warranty_expiration_date": "2026-10-10T14:44:00Z",
        "contract_status": "Expiring Soon",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000005",
        "asset_tag": "AST-ANES-005",
        "name": "Mindray Wato EX-65",
        "category": "ANESTHESIA_MACHINE",
        "model": "Wato EX-65",
        "serial_number": "SN-ANES-105",
        "operating_room": "OR-5",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-21T14:44:00Z",
        "next_pm_due_date": "2027-02-17T14:44:00Z",
        "total_operating_hours": 950,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Mindray Medical",
        "warranty_contract_number": "MND-2025-0105",
        "warranty_end_date": "2027-10-25T14:44:00Z",
        "warranty_expiration_date": "2027-10-25T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Mindray Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000006",
        "asset_tag": "AST-ANES-006",
        "name": "GE Datex-Ohmeda Avance",
        "category": "ANESTHESIA_MACHINE",
        "model": "Avance CS2 Pro",
        "serial_number": "SN-ANES-106",
        "operating_room": "OR-6",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-02-22T14:44:00Z",
        "next_pm_due_date": "2026-08-21T14:44:00Z",
        "total_operating_hours": 4120,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "GE HealthCare",
        "warranty_contract_number": "GE-2023-7720",
        "warranty_end_date": "2026-07-22T14:44:00Z",
        "warranty_expiration_date": "2026-07-22T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "GE HealthCare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000007",
        "asset_tag": "AST-ANES-007",
        "name": "Drager Fabius GS Premium",
        "category": "ANESTHESIA_MACHINE",
        "model": "Fabius GS",
        "serial_number": "SN-ANES-107",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-01T14:44:00Z",
        "next_pm_due_date": "2027-01-28T14:44:00Z",
        "total_operating_hours": 1600,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2025-1107",
        "warranty_end_date": "2027-07-17T14:44:00Z",
        "warranty_expiration_date": "2027-07-17T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000008",
        "asset_tag": "AST-ANES-008",
        "name": "Penlon Prima 456 Workstation",
        "category": "ANESTHESIA_MACHINE",
        "model": "Prima 456",
        "serial_number": "SN-ANES-108",
        "operating_room": "OR-4",
        "status": "AVAILABLE",
        "last_pm_date": "2026-03-09T14:44:00Z",
        "next_pm_due_date": "2026-09-05T14:44:00Z",
        "total_operating_hours": 2100,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Philips Healthcare",
        "warranty_contract_number": "PHS-2024-8808",
        "warranty_end_date": "2027-03-19T14:44:00Z",
        "warranty_expiration_date": "2027-03-19T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Philips Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000010",
        "asset_tag": "AST-LAP-001",
        "name": "Stryker 1688 4K Tower",
        "category": "LAPAROSCOPIC_TOWER",
        "model": "Stryker 1688",
        "serial_number": "SN-LAP-201",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-06T14:44:00Z",
        "next_pm_due_date": "2027-02-02T14:44:00Z",
        "total_operating_hours": 1420,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Stryker Medical",
        "warranty_contract_number": "STR-2025-1688",
        "warranty_end_date": "2027-07-27T14:44:00Z",
        "warranty_expiration_date": "2027-07-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Stryker Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000011",
        "asset_tag": "AST-LAP-002",
        "name": "Olympus Visera Elite II",
        "category": "LAPAROSCOPIC_TOWER",
        "model": "Visera Elite II",
        "serial_number": "SN-LAP-202",
        "operating_room": "OR-6",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-22T14:44:00Z",
        "next_pm_due_date": "2027-01-18T14:44:00Z",
        "total_operating_hours": 1780,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Olympus Medical Systems",
        "warranty_contract_number": "OLY-2025-2202",
        "warranty_end_date": "2027-06-07T14:44:00Z",
        "warranty_expiration_date": "2027-06-07T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Olympus Medical Systems"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000012",
        "asset_tag": "AST-LAP-003",
        "name": "Karl Storz Image1 S 3D",
        "category": "LAPAROSCOPIC_TOWER",
        "model": "Image1 S",
        "serial_number": "SN-LAP-203",
        "operating_room": "OR-5",
        "status": "AVAILABLE",
        "last_pm_date": "2026-03-04T14:44:00Z",
        "next_pm_due_date": "2026-08-31T14:44:00Z",
        "total_operating_hours": 2350,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Olympus Medical Systems",
        "warranty_contract_number": "OLY-2024-1103",
        "warranty_end_date": "2026-10-05T14:44:00Z",
        "warranty_expiration_date": "2026-10-05T14:44:00Z",
        "contract_status": "Expiring Soon",
        "contract_vendor": "Olympus Medical Systems"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000013",
        "asset_tag": "AST-LAP-004",
        "name": "Stryker 1588 AIM Tower",
        "category": "LAPAROSCOPIC_TOWER",
        "model": "1588 AIM",
        "serial_number": "SN-LAP-204",
        "operating_room": "OR-3",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-03-24T14:44:00Z",
        "next_pm_due_date": "2026-09-15T14:44:00Z",
        "total_operating_hours": 3100,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Stryker Medical",
        "warranty_contract_number": "STR-2023-1588",
        "warranty_end_date": "2026-08-21T14:44:00Z",
        "warranty_expiration_date": "2026-08-21T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Stryker Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000014",
        "asset_tag": "AST-LAP-005",
        "name": "Olympus EVIS EXERA III",
        "category": "LAPAROSCOPIC_TOWER",
        "model": "EXERA III",
        "serial_number": "SN-LAP-205",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-16T14:44:00Z",
        "next_pm_due_date": "2027-02-12T14:44:00Z",
        "total_operating_hours": 1150,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Olympus Medical Systems",
        "warranty_contract_number": "OLY-2025-0005",
        "warranty_end_date": "2027-08-26T14:44:00Z",
        "warranty_expiration_date": "2027-08-26T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Olympus Medical Systems"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000015",
        "asset_tag": "AST-CARM-001",
        "name": "GE OEC 9900 Elite C-Arm",
        "category": "CARM_FLUOROSCOPY",
        "model": "OEC 9900",
        "serial_number": "SN-CARM-301",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-27T14:44:00Z",
        "next_pm_due_date": "2027-01-23T14:44:00Z",
        "total_operating_hours": 1950,
        "location": "OR Complex Floor 2",
        "department": "Orthopedics & Radiology",
        "warranty_vendor": "GE HealthCare",
        "warranty_contract_number": "GE-2025-9900",
        "warranty_end_date": "2027-07-07T14:44:00Z",
        "warranty_expiration_date": "2027-07-07T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "GE HealthCare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000016",
        "asset_tag": "AST-CARM-002",
        "name": "Ziehm Solo FD C-Arm",
        "category": "CARM_FLUOROSCOPY",
        "model": "Solo FD",
        "serial_number": "SN-CARM-302",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-06-22T14:44:00Z",
        "next_pm_due_date": "2026-12-19T14:44:00Z",
        "total_operating_hours": 2400,
        "location": "OR Complex Floor 2",
        "department": "Orthopedics & Radiology",
        "warranty_vendor": "Siemens Healthineers",
        "warranty_contract_number": "SIE-2023-3002",
        "warranty_end_date": "2026-08-11T14:44:00Z",
        "warranty_expiration_date": "2026-08-11T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Siemens Healthineers"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000017",
        "asset_tag": "AST-CARM-003",
        "name": "Philips Veradius Unity 3D",
        "category": "CARM_FLUOROSCOPY",
        "model": "Veradius Unity",
        "serial_number": "SN-CARM-303",
        "operating_room": "OR-4",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-03-14T14:44:00Z",
        "next_pm_due_date": "2026-09-10T14:44:00Z",
        "total_operating_hours": 3200,
        "location": "OR Complex Floor 2",
        "department": "Orthopedics & Radiology",
        "warranty_vendor": "Philips Healthcare",
        "warranty_contract_number": "PHS-2023-3303",
        "warranty_end_date": "2026-09-05T14:44:00Z",
        "warranty_expiration_date": "2026-09-05T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Philips Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000018",
        "asset_tag": "AST-CARM-004",
        "name": "Siemens Cios Alpha C-Arm",
        "category": "CARM_FLUOROSCOPY",
        "model": "Cios Alpha",
        "serial_number": "SN-CARM-304",
        "operating_room": "OR-6",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-26T14:44:00Z",
        "next_pm_due_date": "2027-02-22T14:44:00Z",
        "total_operating_hours": 880,
        "location": "OR Complex Floor 2",
        "department": "Orthopedics & Radiology",
        "warranty_vendor": "Siemens Healthineers",
        "warranty_contract_number": "SIE-2025-4404",
        "warranty_end_date": "2027-09-15T14:44:00Z",
        "warranty_expiration_date": "2027-09-15T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Siemens Healthineers"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000020",
        "asset_tag": "AST-VENT-001",
        "name": "Hamilton C6 ICU Ventilator",
        "category": "VENTILATOR",
        "model": "Hamilton C6",
        "serial_number": "SN-VENT-401",
        "operating_room": "ICU-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-11T14:44:00Z",
        "next_pm_due_date": "2027-02-07T14:44:00Z",
        "total_operating_hours": 1500,
        "location": "ICU Complex Floor 3",
        "department": "Critical Care",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2025-4001",
        "warranty_end_date": "2027-08-06T14:44:00Z",
        "warranty_expiration_date": "2027-08-06T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000021",
        "asset_tag": "AST-VENT-002",
        "name": "Puritan Bennett 980",
        "category": "VENTILATOR",
        "model": "PB980",
        "serial_number": "SN-VENT-402",
        "operating_room": "ICU-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-03-12T14:44:00Z",
        "next_pm_due_date": "2026-09-08T14:44:00Z",
        "total_operating_hours": 2800,
        "location": "ICU Complex Floor 3",
        "department": "Critical Care",
        "warranty_vendor": "Medtronic",
        "warranty_contract_number": "MDT-2024-9802",
        "warranty_end_date": "2026-10-12T14:44:00Z",
        "warranty_expiration_date": "2026-10-12T14:44:00Z",
        "contract_status": "Expiring Soon",
        "contract_vendor": "Medtronic"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000022",
        "asset_tag": "AST-VENT-003",
        "name": "Drager Evita V800",
        "category": "VENTILATOR",
        "model": "Evita V800",
        "serial_number": "SN-VENT-403",
        "operating_room": "OR-3",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-21T14:44:00Z",
        "next_pm_due_date": "2027-02-17T14:44:00Z",
        "total_operating_hours": 1200,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2025-8803",
        "warranty_end_date": "2027-09-05T14:44:00Z",
        "warranty_expiration_date": "2027-09-05T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000023",
        "asset_tag": "AST-VENT-004",
        "name": "Getinge Servo-u Ventilator",
        "category": "VENTILATOR",
        "model": "Servo-u",
        "serial_number": "SN-VENT-404",
        "operating_room": "ICU-1",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-02-12T14:44:00Z",
        "next_pm_due_date": "2026-08-11T14:44:00Z",
        "total_operating_hours": 3900,
        "location": "ICU Complex Floor 3",
        "department": "Critical Care",
        "warranty_vendor": "Siemens Healthineers",
        "warranty_contract_number": "SIE-2023-4404",
        "warranty_end_date": "2026-06-22T14:44:00Z",
        "warranty_expiration_date": "2026-06-22T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Siemens Healthineers"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000024",
        "asset_tag": "AST-VENT-005",
        "name": "Hamilton G5 ICU Ventilator",
        "category": "VENTILATOR",
        "model": "Hamilton G5",
        "serial_number": "SN-VENT-405",
        "operating_room": "ICU-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-01T14:44:00Z",
        "next_pm_due_date": "2027-01-28T14:44:00Z",
        "total_operating_hours": 1650,
        "location": "ICU Complex Floor 3",
        "department": "Critical Care",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2025-5505",
        "warranty_end_date": "2027-06-17T14:44:00Z",
        "warranty_expiration_date": "2027-06-17T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000028",
        "asset_tag": "AST-MON-001",
        "name": "Philips IntelliVue MX800",
        "category": "SURGICAL_MONITOR",
        "model": "MX800",
        "serial_number": "SN-MON-501",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-21T14:44:00Z",
        "next_pm_due_date": "2027-02-17T14:44:00Z",
        "total_operating_hours": 2100,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Philips Healthcare",
        "warranty_contract_number": "PHS-2025-5001",
        "warranty_end_date": "2027-08-16T14:44:00Z",
        "warranty_expiration_date": "2027-08-16T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Philips Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000029",
        "asset_tag": "AST-MON-002",
        "name": "GE B850 Patient Monitor",
        "category": "SURGICAL_MONITOR",
        "model": "B850",
        "serial_number": "SN-MON-502",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-11T14:44:00Z",
        "next_pm_due_date": "2027-02-07T14:44:00Z",
        "total_operating_hours": 1900,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "GE HealthCare",
        "warranty_contract_number": "GE-2025-8502",
        "warranty_end_date": "2027-07-27T14:44:00Z",
        "warranty_expiration_date": "2027-07-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "GE HealthCare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000030",
        "asset_tag": "AST-MON-003",
        "name": "Mindray BeneVision N22",
        "category": "SURGICAL_MONITOR",
        "model": "N22",
        "serial_number": "SN-MON-503",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-22T14:44:00Z",
        "next_pm_due_date": "2027-01-18T14:44:00Z",
        "total_operating_hours": 1400,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Mindray Medical",
        "warranty_contract_number": "MND-2025-5003",
        "warranty_end_date": "2027-07-07T14:44:00Z",
        "warranty_expiration_date": "2027-07-07T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Mindray Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000031",
        "asset_tag": "AST-MON-004",
        "name": "Nihon Kohden Life Scope",
        "category": "SURGICAL_MONITOR",
        "model": "Life Scope G9",
        "serial_number": "SN-MON-504",
        "operating_room": "OR-5",
        "status": "AVAILABLE",
        "last_pm_date": "2026-06-27T14:44:00Z",
        "next_pm_due_date": "2026-12-24T14:44:00Z",
        "total_operating_hours": 2600,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Philips Healthcare",
        "warranty_contract_number": "PHS-2023-5504",
        "warranty_end_date": "2026-08-01T14:44:00Z",
        "warranty_expiration_date": "2026-08-01T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Philips Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000032",
        "asset_tag": "AST-MON-005",
        "name": "Drager Infinity Delta",
        "category": "SURGICAL_MONITOR",
        "model": "Delta XL",
        "serial_number": "SN-MON-505",
        "operating_room": "OR-3",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-31T14:44:00Z",
        "next_pm_due_date": "2027-02-27T14:44:00Z",
        "total_operating_hours": 1100,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2025-5005",
        "warranty_end_date": "2027-09-20T14:44:00Z",
        "warranty_expiration_date": "2027-09-20T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000035",
        "asset_tag": "AST-DEFIB-001",
        "name": "Zoll R Series Defibrillator",
        "category": "DEFIBRILLATOR",
        "model": "R Series Plus",
        "serial_number": "SN-DEFIB-601",
        "operating_room": "OR Complex Hallway 2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-21T14:44:00Z",
        "next_pm_due_date": "2027-02-17T14:44:00Z",
        "total_operating_hours": 450,
        "location": "OR Complex Floor 2",
        "department": "Biomedical Engineering",
        "warranty_vendor": "Zoll Medical",
        "warranty_contract_number": "ZOL-2025-6001",
        "warranty_end_date": "2027-07-17T14:44:00Z",
        "warranty_expiration_date": "2027-07-17T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Zoll Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000036",
        "asset_tag": "AST-DEFIB-002",
        "name": "Physio-Control Lifepak 20",
        "category": "DEFIBRILLATOR",
        "model": "Lifepak 20e",
        "serial_number": "SN-DEFIB-602",
        "operating_room": "PACU-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-03-14T14:44:00Z",
        "next_pm_due_date": "2026-09-10T14:44:00Z",
        "total_operating_hours": 980,
        "location": "PACU Floor 2",
        "department": "Biomedical Engineering",
        "warranty_vendor": "Stryker Medical",
        "warranty_contract_number": "STR-2024-6002",
        "warranty_end_date": "2026-10-08T14:44:00Z",
        "warranty_expiration_date": "2026-10-08T14:44:00Z",
        "contract_status": "Expiring Soon",
        "contract_vendor": "Stryker Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000037",
        "asset_tag": "AST-ESU-001",
        "name": "Medtronic ForceTriad ESU",
        "category": "ELECTROSURGICAL_UNIT",
        "model": "ForceTriad FX",
        "serial_number": "SN-ESU-701",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-16T14:44:00Z",
        "next_pm_due_date": "2027-02-12T14:44:00Z",
        "total_operating_hours": 1600,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Medtronic",
        "warranty_contract_number": "MDT-2025-7001",
        "warranty_end_date": "2027-08-06T14:44:00Z",
        "warranty_expiration_date": "2027-08-06T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Medtronic"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000038",
        "asset_tag": "AST-ESU-002",
        "name": "Erbe VIO 300 S ESU",
        "category": "ELECTROSURGICAL_UNIT",
        "model": "VIO 300 S",
        "serial_number": "SN-ESU-702",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-01T14:44:00Z",
        "next_pm_due_date": "2027-01-28T14:44:00Z",
        "total_operating_hours": 1450,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Olympus Medical Systems",
        "warranty_contract_number": "OLY-2025-7002",
        "warranty_end_date": "2027-06-27T14:44:00Z",
        "warranty_expiration_date": "2027-06-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Olympus Medical Systems"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000039",
        "asset_tag": "AST-ESU-003",
        "name": "Covidien Valleylab FT10",
        "category": "ELECTROSURGICAL_UNIT",
        "model": "Valleylab FT10",
        "serial_number": "SN-ESU-703",
        "operating_room": "OR-3",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-03-19T14:44:00Z",
        "next_pm_due_date": "2026-09-15T14:44:00Z",
        "total_operating_hours": 2100,
        "location": "OR Complex Floor 2",
        "department": "General Surgery",
        "warranty_vendor": "Medtronic",
        "warranty_contract_number": "MDT-2023-7703",
        "warranty_end_date": "2026-07-12T14:44:00Z",
        "warranty_expiration_date": "2026-07-12T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Medtronic"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000040",
        "asset_tag": "AST-PUMP-001",
        "name": "Baxter Sigma Spectrum Pump",
        "category": "INFUSION_PUMP",
        "model": "Sigma Spectrum",
        "serial_number": "SN-PUMP-801",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-26T14:44:00Z",
        "next_pm_due_date": "2027-02-22T14:44:00Z",
        "total_operating_hours": 1800,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2025-8001",
        "warranty_end_date": "2027-07-27T14:44:00Z",
        "warranty_expiration_date": "2027-07-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Baxter Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000041",
        "asset_tag": "AST-PUMP-002",
        "name": "B. Braun Infusomat Space",
        "category": "INFUSION_PUMP",
        "model": "Infusomat Space",
        "serial_number": "SN-PUMP-802",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-11T14:44:00Z",
        "next_pm_due_date": "2027-02-07T14:44:00Z",
        "total_operating_hours": 1650,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2025-8002",
        "warranty_end_date": "2027-07-07T14:44:00Z",
        "warranty_expiration_date": "2027-07-07T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Baxter Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000042",
        "asset_tag": "AST-PUMP-003",
        "name": "Alaris 8015 Infusion System",
        "category": "INFUSION_PUMP",
        "model": "Alaris 8015",
        "serial_number": "SN-PUMP-803",
        "operating_room": "ICU-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-06-17T14:44:00Z",
        "next_pm_due_date": "2026-12-14T14:44:00Z",
        "total_operating_hours": 3100,
        "location": "ICU Complex Floor 3",
        "department": "Critical Care",
        "warranty_vendor": "Becton Dickinson",
        "warranty_contract_number": "BDK-2023-8803",
        "warranty_end_date": "2026-08-21T14:44:00Z",
        "warranty_expiration_date": "2026-08-21T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Becton Dickinson"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000043",
        "asset_tag": "AST-PUMP-004",
        "name": "Medtronic Minimed Pump",
        "category": "INFUSION_PUMP",
        "model": "Minimed 770G",
        "serial_number": "SN-PUMP-804",
        "operating_room": "OR-5",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-31T14:44:00Z",
        "next_pm_due_date": "2027-02-27T14:44:00Z",
        "total_operating_hours": 920,
        "location": "OR Complex Floor 2",
        "department": "Anesthesiology",
        "warranty_vendor": "Medtronic",
        "warranty_contract_number": "MDT-2025-8004",
        "warranty_end_date": "2027-09-05T14:44:00Z",
        "warranty_expiration_date": "2027-09-05T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Medtronic"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000044",
        "asset_tag": "AST-LGT-001",
        "name": "Steris HarmonyLED Surgical Light",
        "category": "SURGICAL_LIGHT",
        "model": "HarmonyLED 585",
        "serial_number": "SN-LGT-901",
        "operating_room": "OR-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-22T14:44:00Z",
        "next_pm_due_date": "2027-01-18T14:44:00Z",
        "total_operating_hours": 2400,
        "location": "OR Complex Floor 2",
        "department": "Biomedical Engineering",
        "warranty_vendor": "Stryker Medical",
        "warranty_contract_number": "STR-2025-9001",
        "warranty_end_date": "2027-07-17T14:44:00Z",
        "warranty_expiration_date": "2027-07-17T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Stryker Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000045",
        "asset_tag": "AST-LGT-002",
        "name": "Drager Polaris 600 Light System",
        "category": "SURGICAL_LIGHT",
        "model": "Polaris 600",
        "serial_number": "SN-LGT-902",
        "operating_room": "OR-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-06T14:44:00Z",
        "next_pm_due_date": "2027-02-02T14:44:00Z",
        "total_operating_hours": 1900,
        "location": "OR Complex Floor 2",
        "department": "Biomedical Engineering",
        "warranty_vendor": "Dr\u00e4ger Medical",
        "warranty_contract_number": "DRG-2025-9002",
        "warranty_end_date": "2027-08-06T14:44:00Z",
        "warranty_expiration_date": "2027-08-06T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Dr\u00e4ger Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000046",
        "asset_tag": "AST-LGT-003",
        "name": "Trumpf iLED 7 Surgical Light",
        "category": "SURGICAL_LIGHT",
        "model": "iLED 7",
        "serial_number": "SN-LGT-903",
        "operating_room": "OR-3",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-21T14:44:00Z",
        "next_pm_due_date": "2027-02-17T14:44:00Z",
        "total_operating_hours": 1300,
        "location": "OR Complex Floor 2",
        "department": "Biomedical Engineering",
        "warranty_vendor": "Siemens Healthineers",
        "warranty_contract_number": "SIE-2025-9003",
        "warranty_end_date": "2027-08-26T14:44:00Z",
        "warranty_expiration_date": "2027-08-26T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Siemens Healthineers"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000047",
        "asset_tag": "AST-STER-001",
        "name": "Tuttnauer Elara 11 Autoclave",
        "category": "STERILIZER_AUTOCLAVE",
        "model": "Elara 11",
        "serial_number": "SN-STER-001",
        "operating_room": "STERILIZATION-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-11T14:44:00Z",
        "next_pm_due_date": "2027-02-07T14:44:00Z",
        "total_operating_hours": 1750,
        "location": "Central Sterile Supply",
        "department": "Sterile Processing",
        "warranty_vendor": "Olympus Medical Systems",
        "warranty_contract_number": "OLY-2025-0001",
        "warranty_end_date": "2027-06-27T14:44:00Z",
        "warranty_expiration_date": "2027-06-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Olympus Medical Systems"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000048",
        "asset_tag": "AST-STER-002",
        "name": "Getinge AMSCO 400 Sterilizer",
        "category": "STERILIZER_AUTOCLAVE",
        "model": "AMSCO 400",
        "serial_number": "SN-STER-002",
        "operating_room": "STERILIZATION-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-02-27T14:44:00Z",
        "next_pm_due_date": "2026-08-26T14:44:00Z",
        "total_operating_hours": 3400,
        "location": "Central Sterile Supply",
        "department": "Sterile Processing",
        "warranty_vendor": "GE HealthCare",
        "warranty_contract_number": "GE-2024-0002",
        "warranty_end_date": "2026-10-02T14:44:00Z",
        "warranty_expiration_date": "2026-10-02T14:44:00Z",
        "contract_status": "Expiring Soon",
        "contract_vendor": "GE HealthCare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000049",
        "asset_tag": "AST-STER-003",
        "name": "Steris V-PRO Max Sterilizer",
        "category": "STERILIZER_AUTOCLAVE",
        "model": "V-PRO Max",
        "serial_number": "SN-STER-003",
        "operating_room": "STERILIZATION-1",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-03-14T14:44:00Z",
        "next_pm_due_date": "2026-09-10T14:44:00Z",
        "total_operating_hours": 2900,
        "location": "Central Sterile Supply",
        "department": "Sterile Processing",
        "warranty_vendor": "Stryker Medical",
        "warranty_contract_number": "STR-2023-0003",
        "warranty_end_date": "2026-07-22T14:44:00Z",
        "warranty_expiration_date": "2026-07-22T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Stryker Medical"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000050",
        "asset_tag": "AST-ECG-001",
        "name": "GE Mac 2000 12-Lead ECG",
        "category": "ECG_MACHINE",
        "model": "Mac 2000",
        "serial_number": "SN-ECG-101",
        "operating_room": "PACU-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-16T14:44:00Z",
        "next_pm_due_date": "2027-02-12T14:44:00Z",
        "total_operating_hours": 850,
        "location": "PACU Floor 2",
        "department": "Cardiology",
        "warranty_vendor": "GE HealthCare",
        "warranty_contract_number": "GE-2025-1101",
        "warranty_end_date": "2027-07-27T14:44:00Z",
        "warranty_expiration_date": "2027-07-27T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "GE HealthCare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000051",
        "asset_tag": "AST-ECG-002",
        "name": "Philips PageWriter TC70",
        "category": "ECG_MACHINE",
        "model": "PageWriter TC70",
        "serial_number": "SN-ECG-102",
        "operating_room": "OR-3",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-01T14:44:00Z",
        "next_pm_due_date": "2027-01-28T14:44:00Z",
        "total_operating_hours": 1100,
        "location": "OR Complex Floor 2",
        "department": "Cardiology",
        "warranty_vendor": "Philips Healthcare",
        "warranty_contract_number": "PHS-2025-1102",
        "warranty_end_date": "2027-07-07T14:44:00Z",
        "warranty_expiration_date": "2027-07-07T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Philips Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000052",
        "asset_tag": "AST-ECG-003",
        "name": "Nihon Kohden ECG-2350",
        "category": "ECG_MACHINE",
        "model": "ECG-2350",
        "serial_number": "SN-ECG-103",
        "operating_room": "OR-4",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-02T14:44:00Z",
        "next_pm_due_date": "2026-12-29T14:44:00Z",
        "total_operating_hours": 1400,
        "location": "OR Complex Floor 2",
        "department": "Cardiology",
        "warranty_vendor": "Philips Healthcare",
        "warranty_contract_number": "PHS-2023-1103",
        "warranty_end_date": "2026-08-16T14:44:00Z",
        "warranty_expiration_date": "2026-08-16T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Philips Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000053",
        "asset_tag": "AST-DIAL-001",
        "name": "Fresenius 5008S Hemodialysis System",
        "category": "DIALYSIS_MACHINE",
        "model": "5008S CorDiax",
        "serial_number": "SN-DIAL-201",
        "operating_room": "ICU-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-21T14:44:00Z",
        "next_pm_due_date": "2027-02-17T14:44:00Z",
        "total_operating_hours": 1900,
        "location": "Nephrology Unit Floor 3",
        "department": "Nephrology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2025-2201",
        "warranty_end_date": "2027-08-16T14:44:00Z",
        "warranty_expiration_date": "2027-08-16T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Baxter Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000054",
        "asset_tag": "AST-DIAL-002",
        "name": "Baxter Artis Physio System",
        "category": "DIALYSIS_MACHINE",
        "model": "Artis Physio",
        "serial_number": "SN-DIAL-202",
        "operating_room": "ICU-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-06T14:44:00Z",
        "next_pm_due_date": "2027-02-02T14:44:00Z",
        "total_operating_hours": 1600,
        "location": "Nephrology Unit Floor 3",
        "department": "Nephrology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2025-2202",
        "warranty_end_date": "2027-07-17T14:44:00Z",
        "warranty_expiration_date": "2027-07-17T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Baxter Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000055",
        "asset_tag": "AST-DIAL-003",
        "name": "Nipro Surdial X Dialysis Machine",
        "category": "DIALYSIS_MACHINE",
        "model": "Surdial X",
        "serial_number": "SN-DIAL-203",
        "operating_room": "ICU-1",
        "status": "UNDER_REPAIR",
        "last_pm_date": "2026-02-22T14:44:00Z",
        "next_pm_due_date": "2026-08-21T14:44:00Z",
        "total_operating_hours": 2800,
        "location": "Nephrology Unit Floor 3",
        "department": "Nephrology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2023-2203",
        "warranty_end_date": "2026-07-02T14:44:00Z",
        "warranty_expiration_date": "2026-07-02T14:44:00Z",
        "contract_status": "Expired",
        "contract_vendor": "Baxter Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000056",
        "asset_tag": "AST-DIAL-004",
        "name": "B. Braun Dialog+ Dialysis System",
        "category": "DIALYSIS_MACHINE",
        "model": "Dialog+",
        "serial_number": "SN-DIAL-204",
        "operating_room": "ICU-2",
        "status": "AVAILABLE",
        "last_pm_date": "2026-08-31T14:44:00Z",
        "next_pm_due_date": "2027-02-27T14:44:00Z",
        "total_operating_hours": 1250,
        "location": "Nephrology Unit Floor 3",
        "department": "Nephrology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2025-2204",
        "warranty_end_date": "2027-09-15T14:44:00Z",
        "warranty_expiration_date": "2027-09-15T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Baxter Healthcare"
    },
    {
        "id": "a0000000-0000-0000-0000-000000000057",
        "asset_tag": "AST-DIAL-005",
        "name": "Fresenius 2008T Dialysis System",
        "category": "DIALYSIS_MACHINE",
        "model": "2008T BlueStar",
        "serial_number": "SN-DIAL-205",
        "operating_room": "ICU-1",
        "status": "AVAILABLE",
        "last_pm_date": "2026-07-27T14:44:00Z",
        "next_pm_due_date": "2027-01-23T14:44:00Z",
        "total_operating_hours": 1400,
        "location": "Nephrology Unit Floor 3",
        "department": "Nephrology",
        "warranty_vendor": "Baxter Healthcare",
        "warranty_contract_number": "BAX-2025-2205",
        "warranty_end_date": "2027-06-17T14:44:00Z",
        "warranty_expiration_date": "2027-06-17T14:44:00Z",
        "contract_status": "Active",
        "contract_vendor": "Baxter Healthcare"
    }
];

const initialBreakdowns = [
    {
        "id": "e0000000-0000-0000-0000-000000000001",
        "asset_id": "a0000000-0000-0000-0000-000000000029",
        "reported_at": "2026-09-10T14:44:00Z",
        "resolved_at": "2026-09-12T14:44:00Z",
        "severity": "CRITICAL",
        "failure_type": "ELECTRICAL",
        "description": "ECG telemetry signal drop during pre-op monitoring. Mainboard power relay swapped.",
        "resolution_notes": "Replaced internal power board, recalibrated channel signals. Unit cleared.",
        "downtime_hours": 48
    },
    {
        "id": "e0000000-0000-0000-0000-000000000002",
        "asset_id": "a0000000-0000-0000-0000-000000000006",
        "reported_at": "2026-08-21T14:44:00Z",
        "resolved_at": null,
        "severity": "CRITICAL",
        "failure_type": "MECHANICAL",
        "description": "Vaporizer locking mechanism jammed mid-procedure backup used",
        "resolution_notes": "Unit taken out of service for manufacturer repair",
        "downtime_hours": 720
    },
    {
        "id": "e0000000-0000-0000-0000-000000000003",
        "asset_id": "a0000000-0000-0000-0000-000000000013",
        "reported_at": "2026-09-06T14:44:00Z",
        "resolved_at": null,
        "severity": "HIGH",
        "failure_type": "SOFTWARE",
        "description": "Camera head coupling failure and video signal flickering on 4K display.",
        "resolution_notes": "Awaiting OEM replacement optical coupler.",
        "downtime_hours": 336
    },
    {
        "id": "e0000000-0000-0000-0000-000000000004",
        "asset_id": "a0000000-0000-0000-0000-000000000017",
        "reported_at": "2026-08-29T14:44:00Z",
        "resolved_at": null,
        "severity": "CRITICAL",
        "failure_type": "ELECTRICAL",
        "description": "Flat panel detector high-voltage generator fault alarm.",
        "resolution_notes": "Under repair by Philips field service engineer.",
        "downtime_hours": 528
    },
    {
        "id": "e0000000-0000-0000-0000-000000000005",
        "asset_id": "a0000000-0000-0000-0000-000000000023",
        "reported_at": "2026-09-15T14:44:00Z",
        "resolved_at": null,
        "severity": "CRITICAL",
        "failure_type": "MECHANICAL",
        "description": "Expiratory valve diaphragm leak detected during automated self-test.",
        "resolution_notes": "Diaphragm kit ordered from Siemens.",
        "downtime_hours": 120
    },
    {
        "id": "e0000000-0000-0000-0000-000000000006",
        "asset_id": "a0000000-0000-0000-0000-000000000039",
        "reported_at": "2026-09-02T14:44:00Z",
        "resolved_at": null,
        "severity": "HIGH",
        "failure_type": "CALIBRATION",
        "description": "Bipolar energy output impedance mismatch alarm.",
        "resolution_notes": "Internal RF transformer undergoing bench testing.",
        "downtime_hours": 432
    },
    {
        "id": "e0000000-0000-0000-0000-000000000007",
        "asset_id": "a0000000-0000-0000-0000-000000000049",
        "reported_at": "2026-09-08T14:44:00Z",
        "resolved_at": null,
        "severity": "HIGH",
        "failure_type": "MECHANICAL",
        "description": "Chamber pressure seal leak during low-temp plasma cycle.",
        "resolution_notes": "Gasket replaced, testing vacuum integrity.",
        "downtime_hours": 288
    },
    {
        "id": "e0000000-0000-0000-0000-000000000008",
        "asset_id": "a0000000-0000-0000-0000-000000000055",
        "reported_at": "2026-09-12T14:44:00Z",
        "resolved_at": null,
        "severity": "HIGH",
        "failure_type": "MECHANICAL",
        "description": "Blood pump roller pressure sensor out of spec.",
        "resolution_notes": "BioMed bench repair in progress.",
        "downtime_hours": 192
    },
    {
        "id": "e0000000-0000-0000-0000-000000000009",
        "asset_id": "a0000000-0000-0000-0000-000000000001",
        "reported_at": "2026-05-23T14:44:00Z",
        "resolved_at": "2026-05-25T14:44:00Z",
        "severity": "MEDIUM",
        "failure_type": "CALIBRATION",
        "description": "O2 sensor drift alarm during routine morning pre-flight.",
        "resolution_notes": "Replaced O2 cell sensor and recalibrated gas module.",
        "downtime_hours": 48
    },
    {
        "id": "e0000000-0000-0000-0000-000000000010",
        "asset_id": "a0000000-0000-0000-0000-000000000010",
        "reported_at": "2026-05-03T14:44:00Z",
        "resolved_at": "2026-05-04T14:44:00Z",
        "severity": "LOW",
        "failure_type": "OTHER",
        "description": "Light source LED module overheating warning.",
        "resolution_notes": "Cleaned dust filters and replaced cooling fan.",
        "downtime_hours": 24
    },
    {
        "id": "e0000000-0000-0000-0000-000000000011",
        "asset_id": "a0000000-0000-0000-0000-000000000015",
        "reported_at": "2026-06-17T14:44:00Z",
        "resolved_at": "2026-06-19T14:44:00Z",
        "severity": "MEDIUM",
        "failure_type": "SOFTWARE",
        "description": "Foot pedal switch intermittent response.",
        "resolution_notes": "Replaced heavy-duty foot cable assembly.",
        "downtime_hours": 48
    },
    {
        "id": "e0000000-0000-0000-0000-000000000012",
        "asset_id": "a0000000-0000-0000-0000-000000000020",
        "reported_at": "2026-07-02T14:44:00Z",
        "resolved_at": "2026-07-03T14:44:00Z",
        "severity": "LOW",
        "failure_type": "CALIBRATION",
        "description": "Flow sensor calibration offset warning.",
        "resolution_notes": "Calibrated flow transducer with test lung.",
        "downtime_hours": 24
    },
    {
        "id": "e0000000-0000-0000-0000-000000000013",
        "asset_id": "a0000000-0000-0000-0000-000000000035",
        "reported_at": "2026-04-13T14:44:00Z",
        "resolved_at": "2026-04-14T14:44:00Z",
        "severity": "MEDIUM",
        "failure_type": "ELECTRICAL",
        "description": "Internal battery capacity degraded during monthly discharge check.",
        "resolution_notes": "Replaced OEM rechargeable battery pack.",
        "downtime_hours": 24
    },
    {
        "id": "e0000000-0000-0000-0000-000000000014",
        "asset_id": "a0000000-0000-0000-0000-000000000040",
        "reported_at": "2026-06-02T14:44:00Z",
        "resolved_at": "2026-06-03T14:44:00Z",
        "severity": "LOW",
        "failure_type": "MECHANICAL",
        "description": "Pole clamp latch stickiness.",
        "resolution_notes": "Replaced mechanical clamp latch assembly.",
        "downtime_hours": 16
    },
    {
        "id": "e0000000-0000-0000-0000-000000000015",
        "asset_id": "a0000000-0000-0000-0000-000000000047",
        "reported_at": "2026-07-07T14:44:00Z",
        "resolved_at": "2026-07-08T14:44:00Z",
        "severity": "MEDIUM",
        "failure_type": "MECHANICAL",
        "description": "Door seal steam bypass detected during weekly Bowie-Dick test.",
        "resolution_notes": "Replaced silicone door gasket and verified cycle chamber pressure.",
        "downtime_hours": 36
    }
];

const initialMaintenance = [
    {
        "id": "d0000000-0000-0000-0000-000000000001",
        "asset_id": "a0000000-0000-0000-0000-000000000001",
        "maintenance_type": "CALIBRATION",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-08-21T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Mindray A7 Anesthesia System.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 350
    },
    {
        "id": "d0000000-0000-0000-0000-000000000002",
        "asset_id": "a0000000-0000-0000-0000-000000000002",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-08-13T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Drager Perseus A500.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 375
    },
    {
        "id": "d0000000-0000-0000-0000-000000000003",
        "asset_id": "a0000000-0000-0000-0000-000000000003",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-08-05T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for GE Avance CS2 Workstation.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 400
    },
    {
        "id": "d0000000-0000-0000-0000-000000000004",
        "asset_id": "a0000000-0000-0000-0000-000000000004",
        "maintenance_type": "CALIBRATION",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-07-28T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Drager Primus Workstation.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 425
    },
    {
        "id": "d0000000-0000-0000-0000-000000000005",
        "asset_id": "a0000000-0000-0000-0000-000000000005",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-07-20T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Mindray Wato EX-65.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 450
    },
    {
        "id": "d0000000-0000-0000-0000-000000000006",
        "asset_id": "a0000000-0000-0000-0000-000000000006",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-07-12T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for GE Datex-Ohmeda Avance.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 475
    },
    {
        "id": "d0000000-0000-0000-0000-000000000007",
        "asset_id": "a0000000-0000-0000-0000-000000000007",
        "maintenance_type": "CALIBRATION",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-07-04T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Drager Fabius GS Premium.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 500
    },
    {
        "id": "d0000000-0000-0000-0000-000000000008",
        "asset_id": "a0000000-0000-0000-0000-000000000008",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-06-26T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Penlon Prima 456 Workstation.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 525
    },
    {
        "id": "d0000000-0000-0000-0000-000000000009",
        "asset_id": "a0000000-0000-0000-0000-000000000010",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-06-18T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Stryker 1688 4K Tower.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 550
    },
    {
        "id": "d0000000-0000-0000-0000-000000000010",
        "asset_id": "a0000000-0000-0000-0000-000000000011",
        "maintenance_type": "CALIBRATION",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-06-10T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Olympus Visera Elite II.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 575
    },
    {
        "id": "d0000000-0000-0000-0000-000000000011",
        "asset_id": "a0000000-0000-0000-0000-000000000012",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-06-02T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Karl Storz Image1 S 3D.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 600
    },
    {
        "id": "d0000000-0000-0000-0000-000000000012",
        "asset_id": "a0000000-0000-0000-0000-000000000013",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-05-25T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Stryker 1588 AIM Tower.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 625
    },
    {
        "id": "d0000000-0000-0000-0000-000000000013",
        "asset_id": "a0000000-0000-0000-0000-000000000014",
        "maintenance_type": "CALIBRATION",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-05-17T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Olympus EVIS EXERA III.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 650
    },
    {
        "id": "d0000000-0000-0000-0000-000000000014",
        "asset_id": "a0000000-0000-0000-0000-000000000015",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-05-09T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for GE OEC 9900 Elite C-Arm.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 675
    },
    {
        "id": "d0000000-0000-0000-0000-000000000015",
        "asset_id": "a0000000-0000-0000-0000-000000000016",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-05-01T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Ziehm Solo FD C-Arm.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 700
    },
    {
        "id": "d0000000-0000-0000-0000-000000000016",
        "asset_id": "a0000000-0000-0000-0000-000000000017",
        "maintenance_type": "CALIBRATION",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-04-23T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Philips Veradius Unity 3D.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 725
    },
    {
        "id": "d0000000-0000-0000-0000-000000000017",
        "asset_id": "a0000000-0000-0000-0000-000000000018",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-04-15T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Siemens Cios Alpha C-Arm.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 750
    },
    {
        "id": "d0000000-0000-0000-0000-000000000018",
        "asset_id": "a0000000-0000-0000-0000-000000000020",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-04-07T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Hamilton C6 ICU Ventilator.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 775
    },
    {
        "id": "d0000000-0000-0000-0000-000000000019",
        "asset_id": "a0000000-0000-0000-0000-000000000021",
        "maintenance_type": "CALIBRATION",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-03-30T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Puritan Bennett 980.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 800
    },
    {
        "id": "d0000000-0000-0000-0000-000000000020",
        "asset_id": "a0000000-0000-0000-0000-000000000022",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-03-22T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Drager Evita V800.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 825
    },
    {
        "id": "d0000000-0000-0000-0000-000000000021",
        "asset_id": "a0000000-0000-0000-0000-000000000023",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-03-14T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Getinge Servo-u Ventilator.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 850
    },
    {
        "id": "d0000000-0000-0000-0000-000000000022",
        "asset_id": "a0000000-0000-0000-0000-000000000024",
        "maintenance_type": "CALIBRATION",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-03-06T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Hamilton G5 ICU Ventilator.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 875
    },
    {
        "id": "d0000000-0000-0000-0000-000000000023",
        "asset_id": "a0000000-0000-0000-0000-000000000028",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-02-26T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Philips IntelliVue MX800.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 900
    },
    {
        "id": "d0000000-0000-0000-0000-000000000024",
        "asset_id": "a0000000-0000-0000-0000-000000000029",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-02-18T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for GE B850 Patient Monitor.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 925
    },
    {
        "id": "d0000000-0000-0000-0000-000000000025",
        "asset_id": "a0000000-0000-0000-0000-000000000030",
        "maintenance_type": "CALIBRATION",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-02-10T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Mindray BeneVision N22.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 950
    },
    {
        "id": "d0000000-0000-0000-0000-000000000026",
        "asset_id": "a0000000-0000-0000-0000-000000000031",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-02-02T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Nihon Kohden Life Scope.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 975
    },
    {
        "id": "d0000000-0000-0000-0000-000000000027",
        "asset_id": "a0000000-0000-0000-0000-000000000032",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-01-25T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Drager Infinity Delta.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 1000
    },
    {
        "id": "d0000000-0000-0000-0000-000000000028",
        "asset_id": "a0000000-0000-0000-0000-000000000035",
        "maintenance_type": "CALIBRATION",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-01-17T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Zoll R Series Defibrillator.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 1025
    },
    {
        "id": "d0000000-0000-0000-0000-000000000029",
        "asset_id": "a0000000-0000-0000-0000-000000000036",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2026-01-09T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Physio-Control Lifepak 20.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 1050
    },
    {
        "id": "d0000000-0000-0000-0000-000000000030",
        "asset_id": "a0000000-0000-0000-0000-000000000037",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2026-01-01T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Medtronic ForceTriad ESU.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 1075
    },
    {
        "id": "d0000000-0000-0000-0000-000000000031",
        "asset_id": "a0000000-0000-0000-0000-000000000038",
        "maintenance_type": "CALIBRATION",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2025-12-24T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Erbe VIO 300 S ESU.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 1100
    },
    {
        "id": "d0000000-0000-0000-0000-000000000032",
        "asset_id": "a0000000-0000-0000-0000-000000000039",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2025-12-16T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Covidien Valleylab FT10.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 1125
    },
    {
        "id": "d0000000-0000-0000-0000-000000000033",
        "asset_id": "a0000000-0000-0000-0000-000000000040",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2025-12-08T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Baxter Sigma Spectrum Pump.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 350
    },
    {
        "id": "d0000000-0000-0000-0000-000000000034",
        "asset_id": "a0000000-0000-0000-0000-000000000041",
        "maintenance_type": "CALIBRATION",
        "performed_by": "Senior Field Service Engineer",
        "performed_at": "2025-11-30T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for B. Braun Infusomat Space.",
        "parts_replaced": [
            "Battery Pack"
        ],
        "cost": 375
    },
    {
        "id": "d0000000-0000-0000-0000-000000000035",
        "asset_id": "a0000000-0000-0000-0000-000000000042",
        "maintenance_type": "PREVENTIVE",
        "performed_by": "BioMed Tech Lead A",
        "performed_at": "2025-11-22T14:44:00Z",
        "details": "Scheduled annual PM check & electrical safety inspection for Alaris 8015 Infusion System.",
        "parts_replaced": [
            "Filter Kit",
            "O-Rings"
        ],
        "cost": 400
    }
];

// Standard Surgery Equipment Templates per Procedure Type
const surgeryTemplates = [
    // LAPAROSCOPIC
    { procedure_type: 'LAPAROSCOPIC', required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'LAPAROSCOPIC', required_category: 'LAPAROSCOPIC_TOWER', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'LAPAROSCOPIC', required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'IMPORTANT' },
    { procedure_type: 'LAPAROSCOPIC', required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'CRITICAL' },

    // CARDIAC
    { procedure_type: 'CARDIAC', required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'CARDIAC', required_category: 'CARM_FLUOROSCOPY', quantity: 1, criticality: 'IMPORTANT' },
    { procedure_type: 'CARDIAC', required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'CARDIAC', required_category: 'SURGICAL_MONITOR', quantity: 2, criticality: 'CRITICAL' },

    // ORTHOPEDIC
    { procedure_type: 'ORTHOPEDIC', required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'ORTHOPEDIC', required_category: 'CARM_FLUOROSCOPY', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'ORTHOPEDIC', required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'IMPORTANT' },
    { procedure_type: 'ORTHOPEDIC', required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'STANDARD' },

    // NEUROSURGERY
    { procedure_type: 'NEUROSURGERY', required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'NEUROSURGERY', required_category: 'CARM_FLUOROSCOPY', quantity: 1, criticality: 'IMPORTANT' },
    { procedure_type: 'NEUROSURGERY', required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'NEUROSURGERY', required_category: 'SURGICAL_MONITOR', quantity: 2, criticality: 'CRITICAL' },

    // GENERAL_SURGERY
    { procedure_type: 'GENERAL_SURGERY', required_category: 'ANESTHESIA_MACHINE', quantity: 1, criticality: 'CRITICAL' },
    { procedure_type: 'GENERAL_SURGERY', required_category: 'ELECTROSURGICAL_UNIT', quantity: 1, criticality: 'IMPORTANT' },
    { procedure_type: 'GENERAL_SURGERY', required_category: 'SURGICAL_MONITOR', quantity: 1, criticality: 'CRITICAL' }
];

const initialSurgeries = [
    {
        "id": "b0000000-0000-0000-0000-000000000001",
        "surgery_code": "SURG-2026-001",
        "patient_id": "PAT-1001",
        "procedure_name": "Laparoscopic Cholecystectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "scheduled_start_time": "2026-09-21T16:44:00Z",
        "scheduled_end_time": "2026-09-21T19:44:00Z",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000002",
        "surgery_code": "SURG-2026-002",
        "patient_id": "PAT-1002",
        "procedure_name": "Total Knee Arthroplasty",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-2",
        "scheduled_start_time": "2026-09-21T22:44:00Z",
        "scheduled_end_time": "2026-09-22T02:44:00Z",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000003",
        "surgery_code": "SURG-2026-003",
        "patient_id": "PAT-1003",
        "procedure_name": "Thyroidectomy & Neck Dissection",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-3",
        "scheduled_start_time": "2026-09-22T14:44:00Z",
        "scheduled_end_time": "2026-09-22T17:44:00Z",
        "surgeon_name": "Dr. Meera Nair",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000004",
        "surgery_code": "SURG-2026-004",
        "patient_id": "PAT-1004",
        "procedure_name": "Lumbar Spinal Fusion",
        "surgery_type": "NEUROSURGERY",
        "operating_room": "OR-4",
        "scheduled_start_time": "2026-09-22T21:44:00Z",
        "scheduled_end_time": "2026-09-23T02:44:00Z",
        "surgeon_name": "Dr. Rajesh Kulkarni",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000005",
        "surgery_code": "SURG-2026-005",
        "patient_id": "PAT-1005",
        "procedure_name": "Laparoscopic Appendectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-5",
        "scheduled_start_time": "2026-09-23T14:44:00Z",
        "scheduled_end_time": "2026-09-23T17:44:00Z",
        "surgeon_name": "Dr. Sanjay Gupta",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000006",
        "surgery_code": "SURG-2026-006",
        "patient_id": "PAT-1006",
        "procedure_name": "Coronary Artery Bypass Graft (CABG)",
        "surgery_type": "CARDIAC",
        "operating_room": "OR-6",
        "scheduled_start_time": "2026-09-23T22:44:00Z",
        "scheduled_end_time": "2026-09-24T04:44:00Z",
        "surgeon_name": "Dr. Priya Deshmukh",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000007",
        "surgery_code": "SURG-2026-007",
        "patient_id": "PAT-1007",
        "procedure_name": "Pediatric Craniotomy",
        "surgery_type": "NEUROSURGERY",
        "operating_room": "OR-1",
        "scheduled_start_time": "2026-09-24T14:44:00Z",
        "scheduled_end_time": "2026-09-24T19:44:00Z",
        "surgeon_name": "Dr. Rajesh Kulkarni",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000008",
        "surgery_code": "SURG-2026-008",
        "patient_id": "PAT-1008",
        "procedure_name": "Total Hip Arthroplasty",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-2",
        "scheduled_start_time": "2026-09-24T23:44:00Z",
        "scheduled_end_time": "2026-09-25T03:44:00Z",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000009",
        "surgery_code": "SURG-2026-009",
        "patient_id": "PAT-1009",
        "procedure_name": "Emergency Trauma Laparotomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-3",
        "scheduled_start_time": "2026-09-25T14:44:00Z",
        "scheduled_end_time": "2026-09-25T18:44:00Z",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000010",
        "surgery_code": "SURG-2026-010",
        "patient_id": "PAT-1010",
        "procedure_name": "Pediatric Hernia Repair",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-4",
        "scheduled_start_time": "2026-09-26T00:44:00Z",
        "scheduled_end_time": "2026-09-26T02:44:00Z",
        "surgeon_name": "Dr. Meera Nair",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000011",
        "surgery_code": "SURG-2026-011",
        "patient_id": "PAT-1011",
        "procedure_name": "Radical Mastectomy",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-5",
        "scheduled_start_time": "2026-09-26T15:44:00Z",
        "scheduled_end_time": "2026-09-26T18:44:00Z",
        "surgeon_name": "Dr. Sanjay Gupta",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000012",
        "surgery_code": "SURG-2026-012",
        "patient_id": "PAT-1012",
        "procedure_name": "Gastric Bypass Bariatric",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-6",
        "scheduled_start_time": "2026-09-27T06:44:00Z",
        "scheduled_end_time": "2026-09-27T10:44:00Z",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000013",
        "surgery_code": "SURG-2026-013",
        "patient_id": "PAT-1013",
        "procedure_name": "ACL Knee Reconstruction",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-1",
        "scheduled_start_time": "2026-09-28T02:44:00Z",
        "scheduled_end_time": "2026-09-28T05:44:00Z",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000014",
        "surgery_code": "SURG-2026-014",
        "patient_id": "PAT-1014",
        "procedure_name": "Pacemaker Implantation",
        "surgery_type": "CARDIAC",
        "operating_room": "OR-2",
        "scheduled_start_time": "2026-09-28T22:44:00Z",
        "scheduled_end_time": "2026-09-29T01:44:00Z",
        "surgeon_name": "Dr. Priya Deshmukh",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000015",
        "surgery_code": "SURG-2026-015",
        "patient_id": "PAT-1015",
        "procedure_name": "AV Fistula Dialysis Access Creation",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-3",
        "scheduled_start_time": "2026-09-29T18:44:00Z",
        "scheduled_end_time": "2026-09-29T21:44:00Z",
        "surgeon_name": "Dr. Meera Nair",
        "status": "SCHEDULED"
    },
    // October & November 2026 Demo Surgeries
    {
        "id": "b0000000-0000-0000-0000-000000000020",
        "surgery_code": "SURG-2026-020",
        "patient_id": "PAT-2020",
        "procedure_name": "Laparoscopic Appendectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-05T09:00:00+05:30",
        "scheduled_end_time": "2026-10-05T11:00:00+05:30",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "COMPLETED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000021",
        "surgery_code": "SURG-2026-021",
        "patient_id": "PAT-2021",
        "procedure_name": "Total Knee Replacement",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-2",
        "department": "Orthopedics",
        "scheduled_start_time": "2026-10-08T10:00:00+05:30",
        "scheduled_end_time": "2026-10-08T13:00:00+05:30",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "COMPLETED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000022",
        "surgery_code": "SURG-2026-022",
        "patient_id": "PAT-2022",
        "procedure_name": "Elective Inguinal Hernia Repair",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-3",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-12T14:00:00+05:30",
        "scheduled_end_time": "2026-10-12T16:00:00+05:30",
        "surgeon_name": "Dr. Meera Nair",
        "status": "COMPLETED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000023",
        "surgery_code": "SURG-2026-023",
        "patient_id": "PAT-2023",
        "procedure_name": "Cardiac Valve Repair",
        "surgery_type": "CARDIAC",
        "operating_room": "OR-5",
        "department": "Cardiology",
        "scheduled_start_time": "2026-10-15T11:00:00+05:30",
        "scheduled_end_time": "2026-10-15T15:00:00+05:30",
        "surgeon_name": "Dr. Priya Deshmukh",
        "status": "CANCELLED"
    },
    // TODAY: 19 October 2026 (4 procedures demonstrating +1 more in Month view & distinct ORs in Day view)
    {
        "id": "b0000000-0000-0000-0000-000000000024",
        "surgery_code": "SURG-2026-024",
        "patient_id": "PAT-2024",
        "procedure_name": "Laparoscopic Cholecystectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-19T08:30:00+05:30",
        "scheduled_end_time": "2026-10-19T11:00:00+05:30",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000025",
        "surgery_code": "SURG-2026-025",
        "patient_id": "PAT-2025",
        "procedure_name": "Total Knee Arthroplasty",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-2",
        "department": "Orthopedics",
        "scheduled_start_time": "2026-10-19T09:00:00+05:30",
        "scheduled_end_time": "2026-10-19T12:30:00+05:30",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000026",
        "surgery_code": "SURG-2026-026",
        "patient_id": "PAT-2026",
        "procedure_name": "Coronary Artery Bypass Graft",
        "surgery_type": "CARDIAC",
        "operating_room": "OR-3",
        "department": "Cardiology",
        "scheduled_start_time": "2026-10-19T10:00:00+05:30",
        "scheduled_end_time": "2026-10-19T13:30:00+05:30",
        "surgeon_name": "Dr. Priya Deshmukh",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000027",
        "surgery_code": "SURG-2026-027",
        "patient_id": "PAT-2027",
        "procedure_name": "Lumbar Spinal Fusion",
        "surgery_type": "NEUROSURGERY",
        "operating_room": "OR-4",
        "department": "Neurosurgery",
        "scheduled_start_time": "2026-10-19T14:00:00+05:30",
        "scheduled_end_time": "2026-10-19T17:30:00+05:30",
        "surgeon_name": "Dr. Rajesh Kulkarni",
        "status": "SCHEDULED"
    },
    // Remainder of current week
    {
        "id": "b0000000-0000-0000-0000-000000000028",
        "surgery_code": "SURG-2026-028",
        "patient_id": "PAT-2028",
        "procedure_name": "Laparoscopic Inguinal Hernia",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-20T09:00:00+05:30",
        "scheduled_end_time": "2026-10-20T11:30:00+05:30",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000029",
        "surgery_code": "SURG-2026-029",
        "patient_id": "PAT-2029",
        "procedure_name": "Carotid Endarterectomy",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-5",
        "department": "Vascular Surgery",
        "scheduled_start_time": "2026-10-20T13:00:00+05:30",
        "scheduled_end_time": "2026-10-20T15:30:00+05:30",
        "surgeon_name": "Dr. Sanjay Gupta",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000030",
        "surgery_code": "SURG-2026-030",
        "patient_id": "PAT-2030",
        "procedure_name": "Total Hip Replacement",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-2",
        "department": "Orthopedics",
        "scheduled_start_time": "2026-10-21T08:30:00+05:30",
        "scheduled_end_time": "2026-10-21T11:30:00+05:30",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000031",
        "surgery_code": "SURG-2026-031",
        "patient_id": "PAT-2031",
        "procedure_name": "Thyroidectomy & Neck Dissection",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-3",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-21T12:00:00+05:30",
        "scheduled_end_time": "2026-10-21T14:30:00+05:30",
        "surgeon_name": "Dr. Meera Nair",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000032",
        "surgery_code": "SURG-2026-032",
        "patient_id": "PAT-2032",
        "procedure_name": "Craniotomy Tumor Resection",
        "surgery_type": "NEUROSURGERY",
        "operating_room": "OR-4",
        "department": "Neurosurgery",
        "scheduled_start_time": "2026-10-22T09:00:00+05:30",
        "scheduled_end_time": "2026-10-22T13:00:00+05:30",
        "surgeon_name": "Dr. Rajesh Kulkarni",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000033",
        "surgery_code": "SURG-2026-033",
        "patient_id": "PAT-2033",
        "procedure_name": "Pediatric Strabismus Surgery",
        "surgery_type": "GENERAL_SURGERY",
        "operating_room": "OR-6",
        "department": "Pediatric Surgery",
        "scheduled_start_time": "2026-10-23T10:00:00+05:30",
        "scheduled_end_time": "2026-10-23T12:30:00+05:30",
        "surgeon_name": "Dr. Sanjay Gupta",
        "status": "SCHEDULED"
    },
    {
        "id": "b0000000-0000-0000-0000-000000000034",
        "surgery_code": "SURG-2026-034",
        "patient_id": "PAT-2034",
        "procedure_name": "Emergency Appendectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-23T14:00:00+05:30",
        "scheduled_end_time": "2026-10-23T16:30:00+05:30",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "CANCELLED"
    },
    // Late October & November (Scheduled in advance - Not yet checked)
    {
        "id": "b0000000-0000-0000-0000-000000000035",
        "surgery_code": "SURG-2026-035",
        "patient_id": "PAT-2035",
        "procedure_name": "Robotic Prostatectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-5",
        "department": "Urology",
        "scheduled_start_time": "2026-10-26T08:30:00+05:30",
        "scheduled_end_time": "2026-10-26T11:30:00+05:30",
        "surgeon_name": "Dr. Sanjay Gupta",
        "status": "SCHEDULED",
        "readiness_checked": false
    },
    {
        "id": "b0000000-0000-0000-0000-000000000036",
        "surgery_code": "SURG-2026-036",
        "patient_id": "PAT-2036",
        "procedure_name": "Spinal Decompression",
        "surgery_type": "NEUROSURGERY",
        "operating_room": "OR-4",
        "department": "Neurosurgery",
        "scheduled_start_time": "2026-10-27T09:00:00+05:30",
        "scheduled_end_time": "2026-10-27T12:00:00+05:30",
        "surgeon_name": "Dr. Rajesh Kulkarni",
        "status": "SCHEDULED",
        "readiness_checked": false
    },
    {
        "id": "b0000000-0000-0000-0000-000000000037",
        "surgery_code": "SURG-2026-037",
        "patient_id": "PAT-2037",
        "procedure_name": "Aortic Valve Replacement",
        "surgery_type": "CARDIAC",
        "operating_room": "OR-3",
        "department": "Cardiology",
        "scheduled_start_time": "2026-10-28T10:00:00+05:30",
        "scheduled_end_time": "2026-10-28T13:30:00+05:30",
        "surgeon_name": "Dr. Priya Deshmukh",
        "status": "SCHEDULED",
        "readiness_checked": false
    },
    {
        "id": "b0000000-0000-0000-0000-000000000038",
        "surgery_code": "SURG-2026-038",
        "patient_id": "PAT-2038",
        "procedure_name": "Laparoscopic Sleeve Gastrectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "scheduled_start_time": "2026-10-30T11:00:00+05:30",
        "scheduled_end_time": "2026-10-30T13:30:00+05:30",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED",
        "readiness_checked": false
    },
    // Next two weeks: November 2026
    {
        "id": "b0000000-0000-0000-0000-000000000039",
        "surgery_code": "SURG-2026-039",
        "patient_id": "PAT-2039",
        "procedure_name": "Anterior Cervical Discectomy",
        "surgery_type": "NEUROSURGERY",
        "operating_room": "OR-4",
        "department": "Neurosurgery",
        "scheduled_start_time": "2026-11-02T09:00:00+05:30",
        "scheduled_end_time": "2026-11-02T12:00:00+05:30",
        "surgeon_name": "Dr. Rajesh Kulkarni",
        "status": "SCHEDULED",
        "readiness_checked": false
    },
    {
        "id": "b0000000-0000-0000-0000-000000000040",
        "surgery_code": "SURG-2026-040",
        "patient_id": "PAT-2040",
        "procedure_name": "Revision Knee Arthroplasty",
        "surgery_type": "ORTHOPEDIC",
        "operating_room": "OR-2",
        "department": "Orthopedics",
        "scheduled_start_time": "2026-11-04T10:00:00+05:30",
        "scheduled_end_time": "2026-11-04T13:00:00+05:30",
        "surgeon_name": "Dr. Vikram Malhotra",
        "status": "SCHEDULED",
        "readiness_checked": false
    },
    {
        "id": "b0000000-0000-0000-0000-000000000041",
        "surgery_code": "SURG-2026-041",
        "patient_id": "PAT-2041",
        "procedure_name": "Laparoscopic Fundoplication",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "scheduled_start_time": "2026-11-06T08:30:00+05:30",
        "scheduled_end_time": "2026-11-06T11:00:00+05:30",
        "surgeon_name": "Dr. Ananya Sharma",
        "status": "SCHEDULED",
        "readiness_checked": false
    }
];

const initialSurgeryRequiredAssets = [
    {
        "id": "c0000000-0000-0000-0000-000000000001",
        "surgery_id": "b0000000-0000-0000-0000-000000000001",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000001",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000002",
        "surgery_id": "b0000000-0000-0000-0000-000000000001",
        "required_category": "LAPAROSCOPIC_TOWER",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000010",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000003",
        "surgery_id": "b0000000-0000-0000-0000-000000000001",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000004",
        "surgery_id": "b0000000-0000-0000-0000-000000000001",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000028",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000005",
        "surgery_id": "b0000000-0000-0000-0000-000000000002",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000002",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000006",
        "surgery_id": "b0000000-0000-0000-0000-000000000002",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000016",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000007",
        "surgery_id": "b0000000-0000-0000-0000-000000000002",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000038",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000008",
        "surgery_id": "b0000000-0000-0000-0000-000000000002",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000030",
        "criticality": "STANDARD",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000009",
        "surgery_id": "b0000000-0000-0000-0000-000000000003",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000005",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000010",
        "surgery_id": "b0000000-0000-0000-0000-000000000003",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000011",
        "surgery_id": "b0000000-0000-0000-0000-000000000003",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000032",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000012",
        "surgery_id": "b0000000-0000-0000-0000-000000000004",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000004",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000013",
        "surgery_id": "b0000000-0000-0000-0000-000000000004",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000015",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000014",
        "surgery_id": "b0000000-0000-0000-0000-000000000004",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000038",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000015",
        "surgery_id": "b0000000-0000-0000-0000-000000000005",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000007",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000016",
        "surgery_id": "b0000000-0000-0000-0000-000000000005",
        "required_category": "LAPAROSCOPIC_TOWER",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000012",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000017",
        "surgery_id": "b0000000-0000-0000-0000-000000000005",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000018",
        "surgery_id": "b0000000-0000-0000-0000-000000000006",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000006",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000019",
        "surgery_id": "b0000000-0000-0000-0000-000000000006",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000018",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000020",
        "surgery_id": "b0000000-0000-0000-0000-000000000006",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000038",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000021",
        "surgery_id": "b0000000-0000-0000-0000-000000000007",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000001",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000022",
        "surgery_id": "b0000000-0000-0000-0000-000000000007",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000015",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000023",
        "surgery_id": "b0000000-0000-0000-0000-000000000007",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000029",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000024",
        "surgery_id": "b0000000-0000-0000-0000-000000000008",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000002",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000025",
        "surgery_id": "b0000000-0000-0000-0000-000000000008",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000018",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000026",
        "surgery_id": "b0000000-0000-0000-0000-000000000008",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000038",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000027",
        "surgery_id": "b0000000-0000-0000-0000-000000000009",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000005",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000028",
        "surgery_id": "b0000000-0000-0000-0000-000000000009",
        "required_category": "LAPAROSCOPIC_TOWER",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000013",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000029",
        "surgery_id": "b0000000-0000-0000-0000-000000000010",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000008",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000030",
        "surgery_id": "b0000000-0000-0000-0000-000000000010",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000038",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000031",
        "surgery_id": "b0000000-0000-0000-0000-000000000011",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000007",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000032",
        "surgery_id": "b0000000-0000-0000-0000-000000000011",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000033",
        "surgery_id": "b0000000-0000-0000-0000-000000000012",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000001",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000034",
        "surgery_id": "b0000000-0000-0000-0000-000000000012",
        "required_category": "LAPAROSCOPIC_TOWER",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000011",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000035",
        "surgery_id": "b0000000-0000-0000-0000-000000000013",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000002",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000036",
        "surgery_id": "b0000000-0000-0000-0000-000000000013",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000015",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000037",
        "surgery_id": "b0000000-0000-0000-0000-000000000014",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000002",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000038",
        "surgery_id": "b0000000-0000-0000-0000-000000000014",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000018",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000039",
        "surgery_id": "b0000000-0000-0000-0000-000000000015",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000005",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000040",
        "surgery_id": "b0000000-0000-0000-0000-000000000015",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    // October 2026 Required Assets
    // Surgery 24 (Today 19 Oct - OR-1 - READY)
    {
        "id": "c0000000-0000-0000-0000-000000000050",
        "surgery_id": "b0000000-0000-0000-0000-000000000024",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000001",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000051",
        "surgery_id": "b0000000-0000-0000-0000-000000000024",
        "required_category": "LAPAROSCOPIC_TOWER",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000010",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000052",
        "surgery_id": "b0000000-0000-0000-0000-000000000024",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000053",
        "surgery_id": "b0000000-0000-0000-0000-000000000024",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000028",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 25 (Today 19 Oct - OR-2 - AT RISK: PM Overdue on Anesthesia)
    {
        "id": "c0000000-0000-0000-0000-000000000054",
        "surgery_id": "b0000000-0000-0000-0000-000000000025",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000008",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000055",
        "surgery_id": "b0000000-0000-0000-0000-000000000025",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000019",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000056",
        "surgery_id": "b0000000-0000-0000-0000-000000000025",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000038",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000057",
        "surgery_id": "b0000000-0000-0000-0000-000000000025",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000029",
        "criticality": "STANDARD",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 26 (Today 19 Oct - OR-3 - NOT READY: Anesthesia UNDER_REPAIR)
    {
        "id": "c0000000-0000-0000-0000-000000000058",
        "surgery_id": "b0000000-0000-0000-0000-000000000026",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000006",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000059",
        "surgery_id": "b0000000-0000-0000-0000-000000000026",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000020",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000060",
        "surgery_id": "b0000000-0000-0000-0000-000000000026",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000039",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000061",
        "surgery_id": "b0000000-0000-0000-0000-000000000026",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000030",
        "criticality": "CRITICAL",
        "quantity": 2,
        "is_manual_override": false
    },
    // Surgery 27 (Today 19 Oct - OR-4 - READY)
    {
        "id": "c0000000-0000-0000-0000-000000000062",
        "surgery_id": "b0000000-0000-0000-0000-000000000027",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000002",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000063",
        "surgery_id": "b0000000-0000-0000-0000-000000000027",
        "required_category": "CARM_FLUOROSCOPY",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000018",
        "criticality": "IMPORTANT",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000064",
        "surgery_id": "b0000000-0000-0000-0000-000000000027",
        "required_category": "ELECTROSURGICAL_UNIT",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000037",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000065",
        "surgery_id": "b0000000-0000-0000-0000-000000000027",
        "required_category": "SURGICAL_MONITOR",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000031",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 28 (20 Oct - OR-1 - READY)
    {
        "id": "c0000000-0000-0000-0000-000000000066",
        "surgery_id": "b0000000-0000-0000-0000-000000000028",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000001",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    {
        "id": "c0000000-0000-0000-0000-000000000067",
        "surgery_id": "b0000000-0000-0000-0000-000000000028",
        "required_category": "LAPAROSCOPIC_TOWER",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000010",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 29 (20 Oct - OR-5 - AT RISK: Anesthesia AST-ANES-004)
    {
        "id": "c0000000-0000-0000-0000-000000000068",
        "surgery_id": "b0000000-0000-0000-0000-000000000029",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000004",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 30 (21 Oct - OR-2 - READY)
    {
        "id": "c0000000-0000-0000-0000-000000000069",
        "surgery_id": "b0000000-0000-0000-0000-000000000030",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000003",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 31 (21 Oct - OR-3 - READY)
    {
        "id": "c0000000-0000-0000-0000-000000000070",
        "surgery_id": "b0000000-0000-0000-0000-000000000031",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000005",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 32 (22 Oct - OR-4 - NOT READY: AST-ANES-006 assigned)
    {
        "id": "c0000000-0000-0000-0000-000000000071",
        "surgery_id": "b0000000-0000-0000-0000-000000000032",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000006",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    },
    // Surgery 33 (23 Oct - OR-6 - READY)
    {
        "id": "c0000000-0000-0000-0000-000000000072",
        "surgery_id": "b0000000-0000-0000-0000-000000000033",
        "required_category": "ANESTHESIA_MACHINE",
        "assigned_asset_id": "a0000000-0000-0000-0000-000000000001",
        "criticality": "CRITICAL",
        "quantity": 1,
        "is_manual_override": false
    }
];

let assetsStore = [...initialAssets];
let breakdownsStore = [...initialBreakdowns];
let maintenanceStore = initialMaintenance.map(m => ({
    ...m,
    cost: m.cost && m.cost < 5000 ? m.cost * 80 : (m.cost || 0)
}));
let surgeriesStore = [...initialSurgeries];
let surgeryRequiredAssetsStore = [...initialSurgeryRequiredAssets];

let readinessConfig = {
    id: '00000000-0000-0000-0000-000000000001',
    at_risk_threshold: 0.35,
    not_ready_threshold: 0.70,
    pm_overdue_grace_days: 7
};

// Config & Asset Helpers
async function getReadinessConfig() { return readinessConfig; }
async function getAssets() { return assetsStore; }
async function getAssetById(id) { return assetsStore.find(a => a.id === id) || null; }

async function createAsset(data) {
    const id = data.id || `a${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`;
    const newAsset = {
        id,
        asset_tag: data.asset_tag || `AST-${Date.now()}`,
        name: data.name || 'Unnamed Asset',
        category: data.category || 'ANESTHESIA_MACHINE',
        model: data.model || 'Standard Model',
        serial_number: data.serial_number || `SN-${Date.now()}`,
        operating_room: data.operating_room || 'OR-1',
        status: data.status || 'UNDER_REPAIR',
        last_pm_date: data.last_pm_date || new Date().toISOString(),
        next_pm_due_date: data.next_pm_due_date || new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
        total_operating_hours: data.total_operating_hours || 0,
        location: data.location || 'Main Hospital Building',
        department: data.department || 'Biomedical Engineering',
        warranty_vendor: data.warranty_vendor || data.contract_vendor || 'Philips Healthcare',
        warranty_contract_number: data.warranty_contract_number || 'PHS-2024-0192',
        warranty_end_date: data.warranty_end_date || data.warranty_expiration_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        warranty_expiration_date: data.warranty_expiration_date || data.warranty_end_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        contract_status: data.contract_status || 'Active',
        contract_vendor: data.warranty_vendor || data.contract_vendor || 'Philips Healthcare',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    assetsStore.push(newAsset);
    return newAsset;
}

async function updateAsset(id, updates) {
    const index = assetsStore.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Asset not found: ${id}`);

    const currentAsset = assetsStore[index];
    const targetStatus = updates.status !== undefined ? updates.status : currentAsset.status;

    if (targetStatus.toUpperCase() === 'AVAILABLE') {
        const hasOpenBreakdown = breakdownsStore.some(
            b => b.asset_id === id && (b.resolved_at === null || b.resolved_at === undefined)
        );
        if (hasOpenBreakdown) {
            throw new Error(`Cannot mark asset AVAILABLE while an unresolved breakdown incident exists (Asset ID: ${id})`);
        }
    }

    const updatedAsset = { ...currentAsset, ...updates, updated_at: new Date().toISOString() };
    assetsStore[index] = updatedAsset;
    return updatedAsset;
}

async function deleteAsset(id) {
    const initialLen = assetsStore.length;
    assetsStore = assetsStore.filter(a => a.id !== id);
    return assetsStore.length < initialLen;
}

// Maintenance & Breakdown Helpers
async function getMaintenanceRecords(assetId) {
    return assetId ? maintenanceStore.filter(m => m.asset_id === assetId) : maintenanceStore;
}

async function createMaintenanceRecord(data) {
    if (!data.asset_id) throw new Error('asset_id is required for maintenance record');
    const asset = assetsStore.find(a => a.id === data.asset_id);
    if (!asset) throw new Error(`Referenced asset does not exist: ${data.asset_id}`);

    const record = {
        id: data.id || `d${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`,
        asset_id: data.asset_id,
        maintenance_type: data.maintenance_type || 'PREVENTIVE',
        performed_by: data.performed_by || 'Biomedical Technician',
        performed_at: data.performed_at || new Date().toISOString(),
        status: data.status || 'COMPLETED',
        next_due_date: data.next_due_date || null,
        details: data.details || '',
        parts_replaced: data.parts_replaced || [],
        cost: data.cost !== undefined ? Number(data.cost) : 0,
        time_taken_hours: data.time_taken_hours !== undefined && data.time_taken_hours !== null && data.time_taken_hours !== '' ? Number(data.time_taken_hours) : null,
        action_needed: data.action_needed || '',
        created_at: new Date().toISOString()
    };
    maintenanceStore.push(record);

    // Update asset's last maintenance date and next due date
    asset.last_pm_date = record.performed_at;
    if (record.next_due_date) {
        asset.next_pm_due_date = record.next_due_date;
        const dueDate = new Date(record.next_due_date);
        const now = new Date();
        asset.is_pm_overdue = dueDate < now;
    }

    // If maintenance was completed and asset was UNDER_MAINTENANCE:
    // Only return to AVAILABLE if there are NO open breakdowns for this asset
    const hasOpenBreakdown = breakdownsStore.some(
        b => b.asset_id === data.asset_id && (b.resolved_at === null || b.resolved_at === undefined)
    );
    if (record.status === 'COMPLETED' && asset.status === 'UNDER_MAINTENANCE' && !hasOpenBreakdown) {
        asset.status = 'AVAILABLE';
    }

    return record;
}

async function getBreakdownIncidents(assetId) {
    return assetId ? breakdownsStore.filter(b => b.asset_id === assetId) : breakdownsStore;
}

async function createBreakdownIncident(data) {
    if (!data.asset_id) throw new Error('asset_id is required for breakdown incident');
    const asset = assetsStore.find(a => a.id === data.asset_id);
    if (!asset) throw new Error(`Referenced asset does not exist: ${data.asset_id}`);

    const incident = {
        id: data.id || `e${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`,
        asset_id: data.asset_id,
        reported_at: new Date().toISOString(),
        resolved_at: null,
        severity: data.severity || 'MEDIUM',
        failure_type: data.failure_type || 'OTHER',
        description: data.description || 'Equipment failure reported',
        reported_by: data.reported_by || null,
        resolution_notes: '',
        downtime_hours: 0,
        created_at: new Date().toISOString()
    };
    breakdownsStore.push(incident);

    const assetIndex = assetsStore.findIndex(a => a.id === data.asset_id);
    if (assetIndex !== -1) assetsStore[assetIndex].status = 'UNDER_REPAIR';

    return incident;
}

async function resolveBreakdownIncident(id, resolutionData) {
    const incident = breakdownsStore.find(b => b.id === id);
    if (!incident) throw new Error(`Breakdown incident not found: ${id}`);

    const finalSeverity = resolutionData.severity || incident.severity;
    const finalFailureType = resolutionData.failure_type || incident.failure_type;

    if (!finalSeverity) throw new Error('Severity must be specified before resolving breakdown incident.');
    if (!finalFailureType) throw new Error('Failure type must be specified before resolving breakdown incident.');

    incident.resolved_at = new Date().toISOString();
    incident.severity = finalSeverity;
    incident.failure_type = finalFailureType;
    incident.resolution_notes = resolutionData.resolution_notes || incident.resolution_notes;
    incident.downtime_hours = resolutionData.downtime_hours || incident.downtime_hours;
    return incident;
}

async function getSurgeryTemplates(type) {
    if (type) {
        return surgeryTemplates.filter(t => t.procedure_type.toUpperCase() === type.toUpperCase());
    }
    return surgeryTemplates;
}

async function getSurgeries() {
    return surgeriesStore.map(s => {
        const requiredAssets = surgeryRequiredAssetsStore
            .filter(r => r.surgery_id === s.id)
            .map(r => {
                const assignedAsset = assetsStore.find(a => a.id === r.assigned_asset_id) || null;
                return {
                    ...r,
                    assigned_asset: assignedAsset
                };
            });
        return {
            ...s,
            required_assets: requiredAssets
        };
    });
}

async function getSurgeryById(id) {
    const surgery = surgeriesStore.find(s => s.id === id);
    if (!surgery) return null;

    const requiredAssets = surgeryRequiredAssetsStore
        .filter(r => r.surgery_id === id)
        .map(r => {
            const assignedAsset = assetsStore.find(a => a.id === r.assigned_asset_id) || null;
            return {
                ...r,
                assigned_asset: assignedAsset
            };
        });

    return {
        ...surgery,
        required_assets: requiredAssets
    };
}

function isOtDoubleBooked(operatingRoom, startTime, endTime, excludeSurgeryId = null) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return surgeriesStore.some(s => {
        if (s.id === excludeSurgeryId) return false;
        if (s.operating_room !== operatingRoom) return false;
        if (s.status === 'CANCELLED' || s.status === 'COMPLETED') return false;

        const sStart = new Date(s.scheduled_start_time).getTime();
        const sEnd = new Date(s.scheduled_end_time).getTime();

        return start < sEnd && end > sStart;
    });
}

async function createSurgery(data) {
    if (!data.procedure_name || !data.operating_room || !data.scheduled_start_time || !data.scheduled_end_time) {
        throw new Error('Missing required surgery parameters (procedure_name, operating_room, start_time, end_time)');
    }

    if (isOtDoubleBooked(data.operating_room, data.scheduled_start_time, data.scheduled_end_time)) {
        throw new Error(`Double-booking rejected: Operating Room ${data.operating_room} is already booked for another active surgery during the requested window.`);
    }

    const surgeryId = data.id || `b${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`;
    const surgeryType = (data.surgery_type || 'GENERAL_SURGERY').toUpperCase();

    const newSurgery = {
        id: surgeryId,
        surgery_code: data.surgery_code || `SURG-2026-${Math.floor(Math.random() * 900 + 100)}`,
        patient_id: data.patient_id || `PAT-${Math.floor(Math.random() * 9000 + 1000)}`,
        procedure_name: data.procedure_name,
        surgery_type: surgeryType,
        operating_room: data.operating_room,
        scheduled_start_time: data.scheduled_start_time,
        scheduled_end_time: data.scheduled_end_time,
        surgeon_name: data.surgeon_name || 'Dr. On-Call Surgeon',
        status: data.status || 'SCHEDULED',
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    surgeriesStore.push(newSurgery);

    if (data.required_assets && Array.isArray(data.required_assets) && data.required_assets.length > 0) {
        for (const req of data.required_assets) {
            surgeryRequiredAssetsStore.push({
                id: `c${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`,
                surgery_id: surgeryId,
                required_category: req.required_category,
                assigned_asset_id: req.assigned_asset_id || null,
                criticality: req.criticality || 'STANDARD',
                quantity: req.quantity || 1,
                is_manual_override: true
            });
        }
    } else {
        const templateItems = surgeryTemplates.filter(t => t.procedure_type === surgeryType);
        const templateToUse = templateItems.length > 0
            ? templateItems
            : surgeryTemplates.filter(t => t.procedure_type === 'GENERAL_SURGERY');

        for (const item of templateToUse) {
            const matchingAsset = assetsStore.find(a => a.category === item.required_category && a.status === 'AVAILABLE');
            surgeryRequiredAssetsStore.push({
                id: `c${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`,
                surgery_id: surgeryId,
                required_category: item.required_category,
                assigned_asset_id: matchingAsset ? matchingAsset.id : null,
                criticality: item.criticality,
                quantity: item.quantity,
                is_manual_override: false
            });
        }
    }

    return getSurgeryById(surgeryId);
}

async function updateSurgery(id, updates) {
    const index = surgeriesStore.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Surgery not found: ${id}`);

    const currentSurgery = surgeriesStore[index];

    const targetRoom = updates.operating_room || currentSurgery.operating_room;
    const targetStart = updates.scheduled_start_time || currentSurgery.scheduled_start_time;
    const targetEnd = updates.scheduled_end_time || currentSurgery.scheduled_end_time;
    const targetStatus = updates.status || currentSurgery.status;

    if (targetStatus !== 'CANCELLED' && isOtDoubleBooked(targetRoom, targetStart, targetEnd, id)) {
        throw new Error(`Double-booking rejected: Operating Room ${targetRoom} is already booked for another active surgery during the requested window.`);
    }

    const updatedSurgery = {
        ...currentSurgery,
        ...updates,
        updated_at: new Date().toISOString()
    };

    surgeriesStore[index] = updatedSurgery;

    if (updates.required_assets && Array.isArray(updates.required_assets)) {
        surgeryRequiredAssetsStore = surgeryRequiredAssetsStore.filter(r => r.surgery_id !== id);
        for (const req of updates.required_assets) {
            surgeryRequiredAssetsStore.push({
                id: req.id || `c${Math.random().toString(36).substring(2, 10)}-0000-0000-0000-000000000000`,
                surgery_id: id,
                required_category: req.required_category,
                assigned_asset_id: req.assigned_asset_id || null,
                criticality: req.criticality || 'STANDARD',
                quantity: req.quantity || 1,
                is_manual_override: true
            });
        }
    }

    return getSurgeryById(id);
}

async function cancelSurgery(id) {
    const surgery = await getSurgeryById(id);
    if (!surgery) throw new Error(`Surgery not found: ${id}`);

    return updateSurgery(id, { status: 'CANCELLED' });
}

module.exports = {
    getReadinessConfig,
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    getMaintenanceRecords,
    createMaintenanceRecord,
    getBreakdownIncidents,
    createBreakdownIncident,
    resolveBreakdownIncident,

    getSurgeryTemplates,
    getSurgeries,
    getSurgeryById,
    createSurgery,
    updateSurgery,
    cancelSurgery
};
