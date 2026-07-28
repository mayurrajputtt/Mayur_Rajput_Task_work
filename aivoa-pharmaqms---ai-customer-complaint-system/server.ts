import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// IN-MEMORY DATABASE & PRE-SEEDED DATA
// ==========================================

interface User {
  id: string;
  email: string;
  name: string;
  role: 'QA_MANAGER' | 'INVESTIGATOR' | 'REGULATORY_OFFICER' | 'ADMIN';
  department: string;
}

const users: User[] = [
  { id: 'usr-001', email: 'sarah.jenkins@aivoa.ai', name: 'Sarah Jenkins', role: 'QA_MANAGER', department: 'Quality Assurance - API & FDF' },
  { id: 'usr-002', email: 'david.chen@aivoa.ai', name: 'David Chen', role: 'INVESTIGATOR', department: 'Quality Control Laboratory' },
  { id: 'usr-003', email: 'elena.rostova@aivoa.ai', name: 'Dr. Elena Rostova', role: 'REGULATORY_OFFICER', department: 'Global Regulatory Affairs' },
  { id: 'usr-004', email: 'admin@aivoa.ai', name: 'Marcus Vance', role: 'ADMIN', department: 'QMS IT Systems' }
];

interface AuditLog {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name: string;
  action_type: string;
  previous_value: string;
  new_value: string;
  esign_reason: string;
  ip_address: string;
  timestamp: string;
}

let auditLogs: AuditLog[] = [
  {
    id: 'AUD-9001',
    complaint_id: 'CMP-2026-0041',
    user_id: 'usr-001',
    user_name: 'Sarah Jenkins',
    action_type: 'ESIGN_APPROVE_CAPA',
    previous_value: 'PROPOSED',
    new_value: 'APPROVED',
    esign_reason: 'I approve the recalibration of pre-compression nozzles and revision of SOP-MFG-014.',
    ip_address: '192.168.1.104',
    timestamp: '2026-07-20T09:15:22Z'
  },
  {
    id: 'AUD-9002',
    complaint_id: 'CMP-2026-0089',
    user_id: 'usr-002',
    user_name: 'David Chen',
    action_type: 'CREATE_COMPLAINT_INTAKE',
    previous_value: 'N/A',
    new_value: 'PENDING_TRIAGE',
    esign_reason: 'Initial intake of tablet capping report from Hospital Pharmacy.',
    ip_address: '10.0.4.55',
    timestamp: '2026-07-25T14:30:00Z'
  }
];

interface CAPAItem {
  id: string;
  complaint_id: string;
  title: string;
  action_type: 'Corrective' | 'Preventive';
  description: string;
  owner: string;
  target_days: number;
  status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  approved_by?: string;
  approved_at?: string;
}

let capas: CAPAItem[] = [
  {
    id: 'CAPA-101',
    complaint_id: 'CMP-2026-0089',
    title: 'Recalibrate Tablet Press Pre-Compression Nozzles & Adjust Dwell Time',
    action_type: 'Corrective',
    description: 'Adjust pre-compression force to 15 kN and limit turret speed to 65 RPM for Atorvastatin campaigns.',
    owner: 'Engineering Lead',
    target_days: 7,
    status: 'PROPOSED'
  },
  {
    id: 'CAPA-102',
    complaint_id: 'CMP-2026-0089',
    title: 'Revise SOP-MFG-014 Granulation Moisture Specifications',
    action_type: 'Preventive',
    description: 'Update batch manufacturing instructions to mandate lower control limit of 2.2% LOD before compression release.',
    owner: 'Quality Assurance Manager',
    target_days: 14,
    status: 'APPROVED',
    approved_by: 'Sarah Jenkins',
    approved_at: '2026-07-26T11:00:00Z'
  },
  {
    id: 'CAPA-103',
    complaint_id: 'CMP-2026-0092',
    title: 'Replace Induction Sealing Coil & Retrain Packaging Operators',
    action_type: 'Corrective',
    description: 'Replace defective induction sealer head on Line 3 and conduct mandatory retraining on seal integrity testing.',
    owner: 'Packaging Operations Lead',
    target_days: 5,
    status: 'IN_PROGRESS'
  }
];

interface ComplaintItem {
  id: string;
  complaint_code: string;
  title: string;
  source: string;
  customer_name: string;
  product_name: string;
  product_grade: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_affected: string;
  complaint_type: string;
  complaint_date: string;
  description: string;
  initial_severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'Immediate' | 'High' | 'Standard';
  status: 'PENDING_TRIAGE' | 'INVESTIGATION_IN_PROGRESS' | 'CAPA_PENDING' | 'CLOSED' | 'REJECTED';
  assigned_to: string;
  assigned_name: string;
  completeness_score: number;
  ich_risk_class: 'CRITICAL_CLASS_I' | 'MAJOR_CLASS_II' | 'MINOR_CLASS_III';
  risk_score: number;
  ich_justification: string;
  ai_summary: string;
  ishikawa_rca: {
    primary_category: string;
    fishbone: {
      Man: string;
      Machine: string;
      Material: string;
      Method: string;
      Measurement: string;
      Milieu: string;
    };
    five_whys: string[];
    root_cause: string;
  };
  created_at: string;
}

let complaints: ComplaintItem[] = [
  {
    id: 'CMP-2026-0089',
    complaint_code: 'CMP-2026-0089',
    title: 'Tablet Capping & Lamination - Atorvastatin 40mg',
    source: 'Hospital Pharmacy',
    customer_name: 'St. Jude Medical Center',
    product_name: 'Atorvastatin Calcium Tablets',
    product_grade: 'USP 40mg FDF',
    batch_number: 'B-4092-A',
    manufacturing_date: '2026-01-15',
    expiry_date: '2028-05-12',
    quantity_affected: '1,200 bottles',
    complaint_type: 'Physical Defect / Capping',
    complaint_date: '2026-07-25',
    description: 'Tablets separating into horizontal layers during dispensing in hospital pharmacy. Multiple bottles inspected from lot B-4092-A show identical capping defects upon lid removal.',
    initial_severity: 'High',
    priority: 'Immediate',
    status: 'INVESTIGATION_IN_PROGRESS',
    assigned_to: 'usr-002',
    assigned_name: 'David Chen',
    completeness_score: 95,
    ich_risk_class: 'MAJOR_CLASS_II',
    risk_score: 78,
    ich_justification: 'Defect involves physical integrity of dosage form without active ingredient toxicity. May cause inconsistent dosing or dissolution failure.',
    ai_summary: 'Executive Summary: On 2026-07-25, a quality defect report was received from Hospital Pharmacy (St. Jude Medical Center) regarding Atorvastatin Calcium Tablets, Batch #B-4092-A. The reported issue involves Physical Defect / Capping affecting 1,200 bottles. Immediate investigation is underway under ICH Q10 guidelines.',
    ishikawa_rca: {
      primary_category: 'Machine / Method',
      fishbone: {
        Man: 'No operator deviation noted in cleanroom logs.',
        Machine: 'Compression station pre-compression hydraulic pressure drop.',
        Material: 'Binder granulation moisture content near lower specification limit (1.8% LOD).',
        Method: 'Tablet press run speed exceeded optimal dwell time window by 5%.',
        Measurement: 'In-process friability testing did not catch edge chipping during initial hour.',
        Milieu: 'Compression room relative humidity within normal limits (42% RH).'
      },
      five_whys: [
        'Why did capping occur? -> Tablets separated along horizontal planes during bottle transport.',
        'Why did horizontal separation occur? -> Entrapped air expanded upon decompression in the tablet press.',
        'Why was air entrapped? -> Granulation fines percentage was excessive and dwell time was too brief.',
        'Why was dwell time brief? -> Press turret speed was set to maximum allowable SOP limit (80 RPM).',
        'Why was maximum speed selected without pre-compression adjustment? -> SOP-MFG-014 lacked specific dwell time calibration tables for low-moisture lots.'
      ],
      root_cause: 'Entrapped air during compression caused by high turret speed and low granulation moisture.'
    },
    created_at: '2026-07-25T14:30:00Z'
  },
  {
    id: 'CMP-2026-0092',
    complaint_code: 'CMP-2026-0092',
    title: 'Bottle Seal Leakage - Amoxicillin Suspension',
    source: 'Distributor Email',
    customer_name: 'MetroHealth Hospital Network',
    product_name: 'Amoxicillin Oral Suspension',
    product_grade: 'USP 250mg/5ml FDF',
    batch_number: 'AMX-8821-C',
    manufacturing_date: '2026-02-10',
    expiry_date: '2028-02-10',
    quantity_affected: '450 bottles',
    complaint_type: 'Packaging & Seal Integrity',
    complaint_date: '2026-07-26',
    description: 'Inner foil induction seal found detached or leaking upon opening cartons. Dry powder suspension partially spilled inside outer shipper box.',
    initial_severity: 'High',
    priority: 'High',
    status: 'CAPA_PENDING',
    assigned_to: 'usr-001',
    assigned_name: 'Sarah Jenkins',
    completeness_score: 100,
    ich_risk_class: 'MAJOR_CLASS_II',
    risk_score: 82,
    ich_justification: 'Loss of container closure integrity introduces microbial ingress hazard and stability degradation.',
    ai_summary: 'Executive Summary: MetroHealth reported 450 bottles of Amoxicillin Suspension (Batch AMX-8821-C) with detached induction foil seals. Packaging line inspection indicates induction sealer coil misalignment on Line 3.',
    ishikawa_rca: {
      primary_category: 'Machine',
      fishbone: {
        Man: 'Operator did not verify seal adhesion during hourly quality pull.',
        Machine: 'Induction sealing coil vertical height drifted upwards by 2.5mm due to vibration.',
        Material: 'Foil liner adhesive thickness within supplier specification.',
        Method: 'SOP-PKG-008 allows visual check without torque or vacuum decay testing.',
        Measurement: 'No automated vision inspection system installed after induction capper.',
        Milieu: 'Packaging hall temperature 20°C.'
      },
      five_whys: [
        'Why did bottles leak? -> Inner foil seal did not bond to bottle neck.',
        'Why did foil not bond? -> Insufficient electromagnetic induction heating.',
        'Why was heating insufficient? -> Sealing head height was 2.5mm higher than specification.',
        'Why was sealing head higher? -> Vibration locking nut loosened during continuous 24-hour shift.',
        'Why was loosened nut not detected? -> Preventative maintenance schedule did not mandate torque check on adjustment shafts.'
      ],
      root_cause: 'Induction sealing coil vertical drift caused by vibration and lack of lock-nut torque inspection.'
    },
    created_at: '2026-07-26T09:15:00Z'
  },
  {
    id: 'CMP-2026-0095',
    complaint_code: 'CMP-2026-0095',
    title: 'Particulate Matter in Sterile Injectable Vial',
    source: 'Hospital Pharmacy',
    customer_name: 'Johns Hopkins Medical Center',
    product_name: 'Ceftriaxone Sodium for Injection',
    product_grade: 'USP 1g Sterile FDF',
    batch_number: 'CEF-7719-S',
    manufacturing_date: '2026-03-01',
    expiry_date: '2028-03-01',
    quantity_affected: '12 vials',
    complaint_type: 'Particulate Matter',
    complaint_date: '2026-07-27',
    description: 'During intravenous preparation, hospital pharmacist observed dark microscopic particulate matter floating in reconstituted sterile solution.',
    initial_severity: 'Critical',
    priority: 'Immediate',
    status: 'PENDING_TRIAGE',
    assigned_to: 'usr-001',
    assigned_name: 'Sarah Jenkins',
    completeness_score: 90,
    ich_risk_class: 'CRITICAL_CLASS_I',
    risk_score: 96,
    ich_justification: 'Particulate matter in parenteral injectables presents immediate risk of vascular embolism, thrombosis, or sepsis. Class I recall evaluation required.',
    ai_summary: 'CRITICAL ALERT: Johns Hopkins reported particulate matter in sterile Ceftriaxone 1g vials (Batch CEF-7719-S). Immediate quarantine of remaining lot and sterility investigation initiated under 21 CFR Part 211.198.',
    ishikawa_rca: {
      primary_category: 'Material / Environment',
      fishbone: {
        Man: 'Gowning procedure compliance verified by cleanroom CCTV.',
        Machine: 'Vial washing machine final WFI rinse pressure nominal.',
        Material: 'Rubber stopper elastomeric shedding suspected from Batch RS-401.',
        Method: 'Siliconization process of rubber bungs evaluated.',
        Measurement: 'Automated particle inspection machine camera calibration check requested.',
        Milieu: 'Grade A laminar flow hood particulate counts normal during filling.'
      },
      five_whys: [
        'Why was particulate observed? -> Microscopic dark fragments present in reconstituted solution.',
        'Why were dark fragments present? -> Bromobutyl rubber stopper underwent micro-fragmentation during needle puncture.',
        'Why did rubber fragment? -> Stopper durometer hardness exceeded upper specification limit in supplier Lot RS-401.',
        'Why was hard stopper used? -> Raw material incoming inspection tested physical dimensions but did not perform durometer elasticity assay.',
        'Why was elasticity assay skipped? -> Vendor COA accepted under reduced testing protocol without biannual audit re-verification.'
      ],
      root_cause: 'Elastomeric shedding from out-of-specification rubber stopper durometer hardness.'
    },
    created_at: '2026-07-27T08:00:00Z'
  },
  {
    id: 'CMP-2026-0078',
    complaint_code: 'CMP-2026-0078',
    title: 'API Raw Material Crystallization Anomaly',
    source: 'Internal QA / Formulation Partner',
    customer_name: 'BioGen Pharma Formulations',
    product_name: 'Ibuprofen Active Pharmaceutical Ingredient',
    product_grade: 'API Raw Material Grade A',
    batch_number: 'IBU-5502-API',
    manufacturing_date: '2025-11-20',
    expiry_date: '2028-11-20',
    quantity_affected: '250 kg drum',
    complaint_type: 'Assay Sub-potency / Polymorphism',
    complaint_date: '2026-07-15',
    description: 'Secondary tablet manufacturer reported anomalous dissolution rate and DSC melting point shift during pre-formulation screening. Suspected polymorphic conversion from Form I to Form II.',
    initial_severity: 'High',
    priority: 'High',
    status: 'CLOSED',
    assigned_to: 'usr-002',
    assigned_name: 'David Chen',
    completeness_score: 100,
    ich_risk_class: 'MAJOR_CLASS_II',
    risk_score: 74,
    ich_justification: 'Polymorphic change affects bioavailability and dissolution profile of finished dosage form.',
    ai_summary: 'BioGen reported DSC melting point shift in 250kg drum of Ibuprofen API (Batch IBU-5502-API). XRD testing confirmed 12% polymorphic conversion to Form II caused by drying chamber temperature spike.',
    ishikawa_rca: {
      primary_category: 'Machine / Method',
      fishbone: {
        Man: 'Operator acknowledged high temperature alarm but delayed manual override by 15 minutes.',
        Machine: 'Vacuum drying oven controller thermocouple calibration offset.',
        Material: 'Solvent recovery purity within specification.',
        Method: 'Cooling ramp rate in drying protocol was too rapid (3°C/min vs 1°C/min target).',
        Measurement: 'In-line FTIR sensor lens required cleaning.',
        Milieu: 'Ambient warehouse storage humidity nominal.'
      },
      five_whys: [
        'Why did DSC melting point shift? -> API crystalline structure converted from Form I to Form II.',
        'Why did polymorphic conversion occur? -> Thermal stress during final solvent vacuum drying step.',
        'Why was there thermal stress? -> Drying oven temperature exceeded 65°C limit by 8°C for 20 minutes.',
        'Why did oven exceed temperature limit? -> Thermocouple sensor drift caused PID controller to output excessive heating steam.',
        'Why did thermocouple drift? -> Calibration interval was 12 months instead of recommended 6 months for corrosive solvent environment.'
      ],
      root_cause: 'Thermocouple sensor drift causing thermal overshooting during vacuum drying.'
    },
    created_at: '2026-07-15T10:00:00Z'
  },
  {
    id: 'CMP-2026-0065',
    complaint_code: 'CMP-2026-0065',
    title: 'Carton Label Scuffing & Barcode Unreadable',
    source: 'Distributor Email',
    customer_name: 'AmeriSource Health Logistics',
    product_name: 'Metformin HCl ER Tablets',
    product_grade: 'USP 500mg FDF',
    batch_number: 'MET-9931-L',
    manufacturing_date: '2026-04-10',
    expiry_date: '2029-04-10',
    quantity_affected: '2,000 cartons',
    complaint_type: 'Discoloration / Labeling Defect',
    complaint_date: '2026-07-02',
    description: 'Automated warehouse barcode scanners at distributor distribution hub unable to read 2D DataMatrix barcode on outer cartons due to ink scuffing and smearing.',
    initial_severity: 'Low',
    priority: 'Standard',
    status: 'CLOSED',
    assigned_to: 'usr-002',
    assigned_name: 'David Chen',
    completeness_score: 100,
    ich_risk_class: 'MINOR_CLASS_III',
    risk_score: 22,
    ich_justification: 'Minor packaging cosmetic and labeling scuffing. Drug product integrity, potency, and safety are unaffected.',
    ai_summary: 'AmeriSource reported barcode readability failure on 2,000 cartons of Metformin ER (Batch MET-9931-L). Investigation identified improper UV ink curing lamp intensity on packaging Line 1.',
    ishikawa_rca: {
      primary_category: 'Machine / Material',
      fishbone: {
        Man: 'Packaging line operator did not perform rub test at start of lot.',
        Machine: 'UV curing LED lamp intensity degraded to 65% of rated output.',
        Material: 'Carton gloss varnish coating repelled fast-dry black inkjet formulation.',
        Method: 'Conveyor belt speed increased by 10% to meet production quotas.',
        Measurement: 'Vision scanner threshold set too leniently for barcode contrast grade.',
        Milieu: 'High humidity in packaging hall slowed ink drying time.'
      },
      five_whys: [
        'Why was barcode unreadable? -> Black ink smeared during carton packing into shipping cases.',
        'Why did ink smear? -> Inkjet printing was not fully cured/dried when cartons contacted guide rails.',
        'Why was ink not cured? -> UV LED curing lamp output intensity dropped below minimum threshold.',
        'Why did lamp intensity drop? -> LED modules reached end of rated operating lifespan (10,000 hours).',
        'Why were expired LEDs not replaced? -> Maintenance management software did not track operating hours on accessory UV curing units.'
      ],
      root_cause: 'Degraded UV LED curing lamp output combined with lack of hour-meter tracking in PM schedule.'
    },
    created_at: '2026-07-02T16:20:00Z'
  }
];

// Demo sample files for instant UI testing
const demoFiles = [
  {
    id: 'DEMO-PDF-01',
    name: 'lab_report_atorvastatin_capping.pdf',
    type: 'PDF',
    size: '1.4 MB',
    category: 'Finished Dosage Form (FDF)',
    previewText: `PHARMACEUTICAL QUALITY ASSURANCE LABORATORY REPORT
Report Date: July 25, 2026
Origin: Hospital Pharmacy - St. Jude Medical Center
Product: Atorvastatin Calcium Tablets USP 40mg
Batch / Lot Number: B-4092-A
Manufacturing Date: 2026-01-15 | Expiry Date: 2028-05-12
Quantity Affected: 1,200 bottles (100 count)

DEFECT DESCRIPTION:
During routine hospital inpatient pharmacy dispensing, pharmacists noted that multiple tablets separated horizontally into two distinct layers upon opening bottle caps (Tablet Capping / Lamination). Physical friability testing confirms edge chipping and upper crown separation under minimal mechanical stress. No active ingredient toxicity observed, but physical integrity failure risks inconsistent dosing.`
  },
  {
    id: 'DEMO-EML-02',
    name: 'distributor_alert_amoxicillin_seals.eml',
    type: 'EML',
    size: '420 KB',
    category: 'Packaging & Seal Integrity',
    previewText: `From: qa.alerts@metrohealth-network.org
To: quality.intake@aivoa.ai
Subject: URGENT: Defective Induction Foil Seals - Amoxicillin Suspension Lot AMX-8821-C
Date: July 26, 2026

Dear AiVoA Pharma Quality Team,

We are writing to officially log a high-priority quality complaint regarding Amoxicillin Oral Suspension USP 250mg/5ml (Batch # AMX-8821-C, Mfg: 2026-02-10, Exp: 2028-02-10).

Upon receiving shipment of 500 bottles at our central warehouse, our intake inspection discovered that approximately 450 bottles have inner foil induction seals that are completely detached or loosely adhering to the bottle rim. Dry suspension powder has spilled into several outer shipping cartons. Please provide immediate quarantine instructions and RCA/CAPA timeline.`
  },
  {
    id: 'DEMO-IMG-03',
    name: 'ceftriaxone_vial_particulate_photo.jpg',
    type: 'IMAGE',
    size: '2.8 MB',
    category: 'Sterile Injectables (Critical Class I)',
    previewText: `[IMAGE OCR TEXT EXTRACTION SUMMARY]
Visual Evidence Document: Ceftriaxone Sodium for Injection USP 1g
Lot Number visible on vial label: CEF-7719-S (Exp: 03/2028)
Observation: High-resolution macro photography shows dark elastomeric micro-fragments suspended inside reconstituted clear intravenous solution. Estimated fragment size: 150 to 300 microns. Origin appears to be bromobutyl rubber stopper coring during needle insertion. IMMEDIATE CRITICAL CLASS I INVESTIGATION REQUIRED.`
  },
  {
    id: 'DEMO-PDF-04',
    name: 'coa_ibuprofen_api_polymorphism.pdf',
    type: 'PDF',
    size: '3.1 MB',
    category: 'Active Pharmaceutical Ingredient (API)',
    previewText: `CERTIFICATE OF ANALYSIS & INVESTIGATION MEMO - API RAW MATERIAL
Product: Ibuprofen Active Pharmaceutical Ingredient (Grade A Micronized)
Batch Number: IBU-5502-API | Quantity: 250 kg Fiber Drum
Customer: BioGen Pharma Formulations

Anomalous Analytical Finding:
Differential Scanning Calorimetry (DSC) and X-Ray Powder Diffraction (XRPD) performed during secondary formulation admission testing revealed an unexpected endothermic transition peak at 72°C, indicating a 12% polymorphic transition from Form I to Form II. Investigation points to thermal overshooting during vacuum drying stage in API synthesis.`
  },
  {
    id: 'DEMO-EML-05',
    name: 'warehouse_barcode_scuffing_report.eml',
    type: 'EML',
    size: '310 KB',
    category: 'Labeling & Packaging Cosmetic',
    previewText: `From: logistics.qa@amerisource.com
To: pharmaqms.support@aivoa.ai
Subject: Non-conforming Barcodes - Metformin ER 500mg (Lot MET-9931-L)
Date: July 02, 2026

We are reporting a minor labeling defect on Metformin HCl ER Tablets 500mg, Lot MET-9931-L (2,000 cartons). Automated optical conveyors are rejecting 35% of cartons due to ink smearing across the 2D DataMatrix serialization barcode. Manual handheld scanners can read the human-readable GTIN and serial numbers, but high-speed automated sorting fails. Please advise on CAPA for packaging ink curing.`
  }
];

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user || password !== 'password123') {
    return res.status(401).json({ error: 'Invalid credentials. Use password123 with demo accounts.' });
  }
  const token = `jwt_mock_${user.id}_${Date.now()}`;
  return res.json({ access_token: token, token_type: 'bearer', user });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const user = users[0]; // Default Sarah Jenkins for demo
  return res.json(user);
});

// 2. Demo Files Endpoint
app.get('/api/demo-files', (req, res) => {
  res.json(demoFiles);
});

// 3. Complaints Endpoints
app.get('/api/complaints', (req, res) => {
  const { search, status, risk_class, page = 1, limit = 10 } = req.query;
  let filtered = [...complaints];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(c => c.status === status);
  }
  if (risk_class && risk_class !== 'ALL') {
    filtered = filtered.filter(c => c.ich_risk_class === risk_class);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.complaint_code.toLowerCase().includes(q) ||
      c.batch_number.toLowerCase().includes(q) ||
      c.customer_name.toLowerCase().includes(q) ||
      c.product_name.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const p = Number(page);
  const l = Number(limit);
  const start = (p - 1) * l;
  const paginated = filtered.slice(start, start + l);

  res.json({ total, page: p, limit: l, data: paginated });
});

app.get('/api/complaints/:id', (req, res) => {
  const c = complaints.find(item => item.id === req.params.id || item.complaint_code === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  
  const relatedCapas = capas.filter(cp => cp.complaint_id === c.id);
  const relatedLogs = auditLogs.filter(al => al.complaint_id === c.id);
  
  res.json({ ...c, capas: relatedCapas, audit_logs: relatedLogs });
});

app.post('/api/complaints', (req, res) => {
  const body = req.body;
  const newId = `CMP-2026-${String(Math.floor(1000 + Math.random() * 9000)).slice(1)}`;
  
  const newComplaint: ComplaintItem = {
    id: newId,
    complaint_code: newId,
    title: `${body.complaint_type || 'Quality Defect'} - ${body.product_name || 'Pharmaceutical Product'}`,
    source: body.source || 'Hospital Pharmacy',
    customer_name: body.customer_name || 'Anonymous Customer',
    product_name: body.product_name || 'Pharmaceutical Dosage Form',
    product_grade: body.product_grade || 'USP FDF',
    batch_number: body.batch_number || 'BATCH-NEW-01',
    manufacturing_date: body.manufacturing_date || '2026-01-01',
    expiry_date: body.expiry_date || '2028-01-01',
    quantity_affected: body.quantity_affected || '100 units',
    complaint_type: body.complaint_type || 'General Defect',
    complaint_date: body.complaint_date || new Date().toISOString().split('T')[0],
    description: body.description || 'No detailed description provided.',
    initial_severity: body.initial_severity || 'Medium',
    priority: body.priority || 'Standard',
    status: 'PENDING_TRIAGE',
    assigned_to: body.assigned_to || 'usr-002',
    assigned_name: body.assigned_to === 'usr-001' ? 'Sarah Jenkins' : 'David Chen',
    completeness_score: body.completeness_score || 85,
    ich_risk_class: body.ich_risk_class || 'MAJOR_CLASS_II',
    risk_score: body.risk_score || 70,
    ich_justification: body.ich_justification || 'Automated classification based on initial intake metrics.',
    ai_summary: body.ai_summary || `Summary for ${body.product_name} batch ${body.batch_number}: ${body.description}`,
    ishikawa_rca: body.ishikawa_rca || {
      primary_category: 'Machine / Method',
      fishbone: {
        Man: 'Operator adherence under verification.',
        Machine: 'Equipment calibration inspection required.',
        Material: 'Raw material lot inspection pending.',
        Method: 'SOP batch record compliance check under review.',
        Measurement: 'Quality control analytical re-assay requested.',
        Milieu: 'Cleanroom environmental monitoring data review initiated.'
      },
      five_whys: [
        'Why did defect occur? -> Immediate manifestation observed during customer usage.',
        'Why was manifestation present? -> Manufacturing parameter variation.',
        'Why did variation occur? -> Equipment or material tolerance drift.',
        'Why was drift not caught? -> In-process sampling frequency limits.',
        'Why? -> Need to enhance vision inspection or calibration frequency.'
      ],
      root_cause: 'Pending formal laboratory investigation.'
    },
    created_at: new Date().toISOString()
  };

  complaints.unshift(newComplaint);

  // Add immutable audit log
  auditLogs.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    complaint_id: newId,
    user_id: 'usr-001',
    user_name: 'Sarah Jenkins',
    action_type: 'CREATE_COMPLAINT',
    previous_value: 'N/A',
    new_value: 'PENDING_TRIAGE',
    esign_reason: 'Created complaint via AI Copilot intake module.',
    ip_address: '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newComplaint);
});

app.patch('/api/complaints/:id/status', (req, res) => {
  const { status, esign_reason, user_name = 'Sarah Jenkins' } = req.body;
  const c = complaints.find(item => item.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  
  const oldStatus = c.status;
  c.status = status;

  auditLogs.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    complaint_id: c.id,
    user_id: 'usr-001',
    user_name,
    action_type: 'STATUS_CHANGE',
    previous_value: oldStatus,
    new_value: status,
    esign_reason: esign_reason || `Status advanced from ${oldStatus} to ${status}`,
    ip_address: '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json(c);
});

// 4. LangGraph AI Analysis Endpoint
app.post('/api/ai/analyze-document', (req, res) => {
  const { text = '', doc_type = 'PDF', file_name = 'complaint_document.pdf' } = req.body;
  
  // Simulate intelligent 10-step LangGraph processing
  const lower = text.toLowerCase();
  
  let isCritical = lower.includes('sterile') || lower.includes('particulate') || lower.includes('injectable') || lower.includes('ceftriaxone');
  let isCapping = lower.includes('capping') || lower.includes('lamination') || lower.includes('atorvastatin');
  let isLeak = lower.includes('seal') || lower.includes('leak') || lower.includes('amoxicillin');
  
  const product_name = isCritical ? 'Ceftriaxone Sodium for Injection USP 1g' :
                       isCapping ? 'Atorvastatin Calcium Tablets USP 40mg' :
                       isLeak ? 'Amoxicillin Oral Suspension USP 250mg/5ml' : 'Ibuprofen Active Pharmaceutical Ingredient';
                       
  const batch_number = isCritical ? 'CEF-7719-S' :
                       isCapping ? 'B-4092-A' :
                       isLeak ? 'AMX-8821-C' : 'IBU-5502-API';
                       
  const customer_name = isCritical ? 'Johns Hopkins Medical Center' :
                        isCapping ? 'St. Jude Medical Center' :
                        isLeak ? 'MetroHealth Hospital Network' : 'BioGen Pharma Formulations';
                        
  const complaint_type = isCritical ? 'Particulate Matter in Sterile Vial' :
                         isCapping ? 'Tablet Capping & Lamination Defect' :
                         isLeak ? 'Bottle Induction Seal Leakage' : 'Polymorphic Crystallization Anomaly';
                         
  const ich_risk_class = isCritical ? 'CRITICAL_CLASS_I' : 'MAJOR_CLASS_II';
  const risk_score = isCritical ? 96 : isCapping ? 78 : isLeak ? 82 : 74;
  
  const analysisResult = {
    status: 'COMPLETED',
    progress_percentage: 100,
    steps_executed: [
      'Step 1: Ingested document & completed OCR binary extraction',
      'Step 2: Extracted pharmaceutical metadata via Groq Gemma2-9b LLM',
      'Step 3: Validated mandatory batch and alphanumeric date formats',
      'Step 4: Formulated objective executive summary for QA Review Board',
      'Step 5: Assigned ICH Q9 Quality Risk Classification (' + ich_risk_class + ')',
      'Step 6: Executed vector cosine similarity check against historical DB (0.89 match)',
      'Step 7: Synthesized Ishikawa Fishbone categorization & 5-Whys RCA',
      'Step 8: Formulated Corrective & Preventive Action (CAPA) plan',
      'Step 9: Verified record completeness score (95% - GMP ready)',
      'Step 10: Prepared payload for database commit & 21 CFR Part 11 audit log'
    ],
    extraction: {
      source: doc_type === 'EML' ? 'Distributor Email' : 'Hospital Pharmacy',
      customer_name,
      product_name,
      product_grade: isCritical ? 'USP 1g Sterile FDF' : 'USP 40mg FDF',
      batch_number,
      manufacturing_date: '2026-01-15',
      expiry_date: '2028-05-12',
      quantity_affected: isCritical ? '12 sterile vials' : '1,200 bottles',
      complaint_type,
      complaint_date: new Date().toISOString().split('T')[0],
      description: text || `Customer reported ${complaint_type} on lot ${batch_number}. Quality inspection confirms anomaly requires CAPA remediation.`,
      initial_severity: isCritical ? 'Critical' : 'High',
      priority: isCritical ? 'Immediate' : 'High'
    },
    risk_assessment: {
      ich_risk_class,
      severity: isCritical ? 'Critical' : 'High',
      risk_score,
      ich_justification: isCritical ? 
        'Particulate matter in parenteral injectables presents immediate risk of vascular embolism or sepsis. Class I recall evaluation required under ICH Q9.' :
        'Physical dosage form breakdown or seal integrity failure; medically reversible but requires immediate CAPA under ICH Q9.'
    },
    duplicate_detection: {
      is_duplicate: true,
      similarity_score: 0.89,
      matched_complaint_id: 'CMP-2026-0041',
      rationale: 'Vector cosine similarity matches 89% with historical complaint CMP-2026-0041 involving identical compression tooling pressure drops.'
    },
    root_cause: {
      primary_category: isCritical ? 'Material / Environment' : 'Machine / Method',
      fishbone: {
        Man: 'Cleanroom operator gowning and SOP adherence verified by QA logs.',
        Machine: isCritical ? 'Vial washing and sterilization tunnel pressure differentials nominal.' : 'Tablet press pre-compression hydraulic pressure drop noted.',
        Material: isCritical ? 'Elastomeric bromobutyl rubber stopper hardness exceeded specification.' : 'Granulation moisture content near lower specification limit (1.8% LOD).',
        Method: isCritical ? 'Siliconization recipe for rubber stoppers under review.' : 'Turret run speed exceeded optimal dwell time window by 5%.',
        Measurement: 'In-process QC friability sampling frequency did not detect initial edge chipping.',
        Milieu: 'Cleanroom relative humidity within nominal target limits.'
      },
      five_whys: [
        `Why did ${complaint_type} occur? -> Physical anomaly manifested during product dispensing or reconstitution.`,
        'Why did anomaly manifest? -> Equipment parameter drift or material hardness variation during campaign.',
        'Why was variation present? -> High turret speed or out-of-spec elastomer durometer.',
        'Why was equipment speed high? -> SOP-MFG-014 lacked specific dwell time calibration tables for low-moisture lots.',
        'Why? -> Preventive maintenance and supplier audit frequencies require tightening under CAPA.'
      ],
      most_probable_root_cause: isCritical ? 'Elastomeric shedding from out-of-specification rubber stopper durometer hardness.' : 'Entrapped air during compression caused by high turret speed and low granulation moisture.'
    },
    capa_recommendations: [
      {
        title: isCritical ? 'Quarantine Lot & Initiate Vendor Audit of Rubber Stopper Supplier' : 'Recalibrate Tablet Press Pre-Compression Nozzles & Adjust Dwell Time',
        action_type: 'Corrective',
        description: isCritical ? 'Quarantine all remaining vials of lot CEF-7719-S and issue formal supplier CAPA request.' : 'Adjust pre-compression force to 15 kN and limit turret speed to 65 RPM.',
        owner: isCritical ? 'QA Director' : 'Engineering Lead',
        target_days: 7
      },
      {
        title: 'Revise Standard Operating Procedure SOP-QA-042',
        action_type: 'Preventive',
        description: 'Update batch manufacturing instructions and mandate hourly torque and visual checks.',
        owner: 'Quality Assurance Manager',
        target_days: 14
      }
    ],
    completeness_score: 95
  };

  res.json(analysisResult);
});

// 5. AI Chat Assistant Endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message, complaint_id } = req.body;
  const c = complaints.find(item => item.id === complaint_id) || complaints[0];
  
  const query = message?.toLowerCase() || '';
  let reply = `Based on my analysis of **${c.complaint_code}: ${c.title}** (Batch \`${c.batch_number}\`):\n\n`;
  
  if (query.includes('duplicate') || query.includes('history') || query.includes('similar')) {
    reply += `🔍 **Vector Search Analysis:** Our embeddings search found an **89% similarity match** with historical complaint **CMP-2026-0041** from three months ago. Both cases exhibit identical hydraulic pressure drops during the initial compression hour.`;
  } else if (query.includes('root cause') || query.includes('rca') || query.includes('why')) {
    reply += `⚙️ **Root Cause Recommendation:** The Ishikawa Fishbone model isolates **${c.ishikawa_rca.primary_category}** as the primary factor. Specifically, \`${c.ishikawa_rca.root_cause}\`. I recommend checking the pre-compression calibration logs.`;
  } else if (query.includes('capa') || query.includes('action') || query.includes('prevent')) {
    reply += `🛡️ **Recommended CAPA Plan:**\n1. **Corrective:** Recalibrate pre-compression nozzles to 15 kN within 7 days.\n2. **Preventive:** Revise SOP-MFG-014 to mandate lower control limits for granulation moisture before batch release.`;
  } else if (query.includes('risk') || query.includes('ich') || query.includes('severity')) {
    reply += `📊 **ICH Q9 Risk Assessment:** This case is classified as **${c.ich_risk_class}** with a severity score of **${c.risk_score}/100**. ${c.ich_justification}`;
  } else {
    reply += `I have reviewed the full 21 CFR Part 11 audit trail and batch records for lot \`${c.batch_number}\`. The complaint originated from **${c.source}** on ${c.complaint_date}. You can ask me about **duplicates**, **root causes**, **ICH risk classes**, or **CAPA proposals**!`;
  }

  res.json({ reply, timestamp: new Date().toISOString() });
});

// 6. Duplicate Detection Endpoint
app.post('/api/complaints/check-duplicate', (req, res) => {
  const { batch_number, description } = req.body;
  const isDup = batch_number?.includes('4092') || batch_number?.includes('8821');
  res.json({
    is_duplicate: isDup,
    similarity_score: isDup ? 0.89 : 0.14,
    matched_complaint_id: isDup ? 'CMP-2026-0041' : null,
    rationale: isDup ? 'High cosine similarity across 768-dimensional text vectors and matching batch prefix.' : 'No statistically significant similarity found in vector database.'
  });
});

// 7. CAPA Endpoints
app.get('/api/capa', (req, res) => {
  res.json(capas);
});

app.post('/api/capa/approve', (req, res) => {
  const { capa_id, password, esign_reason, user_name = 'Sarah Jenkins' } = req.body;
  
  if (password !== 'password123') {
    return res.status(401).json({ error: '21 CFR Part 11 Electronic Signature Failed: Invalid Password.' });
  }

  const cp = capas.find(item => item.id === capa_id);
  if (!cp) return res.status(404).json({ error: 'CAPA not found' });

  const oldStatus = cp.status;
  cp.status = 'APPROVED';
  cp.approved_by = user_name;
  cp.approved_at = new Date().toISOString();

  auditLogs.unshift({
    id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    complaint_id: cp.complaint_id,
    user_id: 'usr-001',
    user_name,
    action_type: 'ESIGN_APPROVE_CAPA',
    previous_value: oldStatus,
    new_value: 'APPROVED',
    esign_reason: esign_reason || `Approved CAPA ${cp.title} via 21 CFR Part 11 electronic signature.`,
    ip_address: '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, capa: cp });
});

// 8. Audit Logs Endpoint
app.get('/api/audit-logs', (req, res) => {
  const { complaint_id } = req.query;
  if (complaint_id) {
    return res.json(auditLogs.filter(al => al.complaint_id === complaint_id));
  }
  res.json(auditLogs);
});

// 9. Analytics Endpoint
app.get('/api/analytics', (req, res) => {
  const total = complaints.length;
  const criticalCount = complaints.filter(c => c.ich_risk_class === 'CRITICAL_CLASS_I').length;
  const majorCount = complaints.filter(c => c.ich_risk_class === 'MAJOR_CLASS_II').length;
  const minorCount = complaints.filter(c => c.ich_risk_class === 'MINOR_CLASS_III').length;
  
  const statusDistribution = [
    { name: 'Pending Triage', value: complaints.filter(c => c.status === 'PENDING_TRIAGE').length },
    { name: 'In Investigation', value: complaints.filter(c => c.status === 'INVESTIGATION_IN_PROGRESS').length },
    { name: 'CAPA Pending', value: complaints.filter(c => c.status === 'CAPA_PENDING').length },
    { name: 'Closed & Archived', value: complaints.filter(c => c.status === 'CLOSED').length }
  ];

  const monthlyTrends = [
    { month: 'Feb', complaints: 8, resolved: 7, avgCloseDays: 4.2 },
    { month: 'Mar', complaints: 12, resolved: 10, avgCloseDays: 3.8 },
    { month: 'Apr', complaints: 15, resolved: 14, avgCloseDays: 3.5 },
    { month: 'May', complaints: 11, resolved: 11, avgCloseDays: 3.1 },
    { month: 'Jun', complaints: 14, resolved: 13, avgCloseDays: 2.9 },
    { month: 'Jul', complaints: total, resolved: 2, avgCloseDays: 2.5 }
  ];

  const rootCauseDistribution = [
    { category: 'Machine / Equipment', count: 6 },
    { category: 'Method / SOP Deviation', count: 4 },
    { category: 'Material / Raw API', count: 3 },
    { category: 'Man / Training', count: 1 },
    { category: 'Milieu / Environment', count: 1 }
  ];

  res.json({
    metrics: {
      totalComplaints: total,
      criticalClassI: criticalCount,
      majorClassII: majorCount,
      minorClassIII: minorCount,
      avgResolutionDays: 2.8,
      duplicateRate: '18.4%',
      aiAccuracyScore: '96.2%'
    },
    statusDistribution,
    monthlyTrends,
    rootCauseDistribution
  });
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AiVoA PharmaQMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
