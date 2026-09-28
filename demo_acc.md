# NLAMS Government-Grade Demo Accounts Directory

This document lists all the seeded demo government identities and citizen accounts across the administrative hierarchy for the **National Land Acquisition & Management System (NLAMS)**.

---

## 🔑 Authentication Rules & Credentials

* **Approved Government Identity Domain:** `@nlams.gov.demo`
* **Password (for Direct SSO mode):** `Password@123`
* **OTP Verification (for Email OTP 2FA mode):** 6-digit dynamic numeric OTP dispatched via `EmailService` (printed directly to the Backend Terminal console during local development).
* **Personal Email Policy:** Gmail, Yahoo, Hotmail, etc., are strictly prohibited for Government Official logins.

---

## 🏛️ 1. Central Administration (National Level)

| Department / Ministry | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **Department of Land Resources (DoLR), MoRD** | Central Platform Administrator | `central.admin@nlams.gov.demo` | `CADM-001` | `CENTRAL_ADMIN` |

---

## 🏢 2. State Government (Maharashtra State Level)

| Department / Agency | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **Revenue & Forest Department, Govt of Maharashtra** | Maharashtra State Revenue Secretary | `state.maharashtra@nlams.gov.demo` | `SADM-MH-001` | `STATE_ADMIN` |

---

## 🏗️ 3. Project Implementing Agencies (PIAs)

| Implementing Agency | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **National Highways Authority of India (NHAI)** | NHAI Project Director | `officer.nhai@nlams.gov.demo` | `PIA-NHAI-001` | `PIA` |
| **Mumbai Metropolitan Region Dev Authority (MMRDA)** | MMRDA Land Officer | `officer.mmrda@nlams.gov.demo` | `PIA-MMRDA-001` | `PIA` |
| **City and Industrial Dev Corporation (CIDCO)** | CIDCO Acquisition Manager | `officer.cidco@nlams.gov.demo` | `PIA-CIDCO-001` | `PIA` |
| **Maharashtra Public Works Department (PWD)** | PWD Executive Engineer | `officer.pwd@nlams.gov.demo` | `PIA-PWD-001` | `PIA` |

---

## 📍 4. District Collectorates (All 36 Districts of Maharashtra)

> **Email Format:** `collector.<district_slug>@nlams.gov.demo`  
> **Total Seeded Accounts:** 36

| District Office | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **Office of District Collector, Pune** | District Collector & DM | `collector.pune@nlams.gov.demo` | `COLL-PUNE` | `DIST_COLLECTOR` |
| **Office of District Collector, Mumbai City** | District Collector & DM | `collector.mumbai.city@nlams.gov.demo` | `COLL-MUMBAICITY` | `DIST_COLLECTOR` |
| **Office of District Collector, Mumbai Suburban** | District Collector & DM | `collector.mumbai.suburban@nlams.gov.demo` | `COLL-MUMBAISUBURBAN` | `DIST_COLLECTOR` |
| **Office of District Collector, Thane** | District Collector & DM | `collector.thane@nlams.gov.demo` | `COLL-THANE` | `DIST_COLLECTOR` |
| **Office of District Collector, Nagpur** | District Collector & DM | `collector.nagpur@nlams.gov.demo` | `COLL-NAGPUR` | `DIST_COLLECTOR` |
| **Office of District Collector, Nashik** | District Collector & DM | `collector.nashik@nlams.gov.demo` | `COLL-NASHIK` | `DIST_COLLECTOR` |
| **Office of District Collector, Chhatrapati Sambhajinagar** | District Collector & DM | `collector.chhatrapati.sambhajinagar@nlams.gov.demo` | `COLL-CHHATRAPATISAMBHAJINAGAR` | `DIST_COLLECTOR` |
| **Office of District Collector, Kolhapur** | District Collector & DM | `collector.kolhapur@nlams.gov.demo` | `COLL-KOLHAPUR` | `DIST_COLLECTOR` |
| **Office of District Collector, Solapur** | District Collector & DM | `collector.solapur@nlams.gov.demo` | `COLL-SOLAPUR` | `DIST_COLLECTOR` |
| **Office of District Collector, Raigad** | District Collector & DM | `collector.raigad@nlams.gov.demo` | `COLL-RAIGAD` | `DIST_COLLECTOR` |
| **Office of District Collector, Palghar** | District Collector & DM | `collector.palghar@nlams.gov.demo` | `COLL-PALGHAR` | `DIST_COLLECTOR` |
| **Office of District Collector, Satara** | District Collector & DM | `collector.satara@nlams.gov.demo` | `COLL-SATARA` | `DIST_COLLECTOR` |
| **Office of District Collector, Sangli** | District Collector & DM | `collector.sangli@nlams.gov.demo` | `COLL-SANGLI` | `DIST_COLLECTOR` |
| **Office of District Collector, Ahmednagar** | District Collector & DM | `collector.ahmednagar@nlams.gov.demo` | `COLL-AHMEDNAGAR` | `DIST_COLLECTOR` |
| **Office of District Collector, Amravati** | District Collector & DM | `collector.amravati@nlams.gov.demo` | `COLL-AMRAVATI` | `DIST_COLLECTOR` |
| **Office of District Collector, Akola** | District Collector & DM | `collector.akola@nlams.gov.demo` | `COLL-AKOLA` | `DIST_COLLECTOR` |
| **Office of District Collector, Latur** | District Collector & DM | `collector.latur@nlams.gov.demo` | `COLL-LATUR` | `DIST_COLLECTOR` |
| **Office of District Collector, Nanded** | District Collector & DM | `collector.nanded@nlams.gov.demo` | `COLL-NANDED` | `DIST_COLLECTOR` |
| **Office of District Collector, Jalgaon** | District Collector & DM | `collector.jalgaon@nlams.gov.demo` | `COLL-JALGAON` | `DIST_COLLECTOR` |
| **Office of District Collector, Dhule** | District Collector & DM | `collector.dhule@nlams.gov.demo` | `COLL-DHULE` | `DIST_COLLECTOR` |
| **Office of District Collector, Ratnagiri** | District Collector & DM | `collector.ratnagiri@nlams.gov.demo` | `COLL-RATNAGIRI` | `DIST_COLLECTOR` |
| **Office of District Collector, Sindhudurg** | District Collector & DM | `collector.sindhudurg@nlams.gov.demo` | `COLL-SINDHUDURG` | `DIST_COLLECTOR` |
| **Office of District Collector, Chandrapur** | District Collector & DM | `collector.chandrapur@nlams.gov.demo` | `COLL-CHANDRAPUR` | `DIST_COLLECTOR` |
| **Office of District Collector, Gadchiroli** | District Collector & DM | `collector.gadchiroli@nlams.gov.demo` | `COLL-GADCHIROLI` | `DIST_COLLECTOR` |
| **Office of District Collector, Bhandara** | District Collector & DM | `collector.bhandara@nlams.gov.demo` | `COLL-BHANDARA` | `DIST_COLLECTOR` |
| **Office of District Collector, Gondia** | District Collector & DM | `collector.gondia@nlams.gov.demo` | `COLL-GONDIA` | `DIST_COLLECTOR` |
| **Office of District Collector, Wardha** | District Collector & DM | `collector.wardha@nlams.gov.demo` | `COLL-WARDHA` | `DIST_COLLECTOR` |
| **Office of District Collector, Yavatmal** | District Collector & DM | `collector.yavatmal@nlams.gov.demo` | `COLL-YAVATMAL` | `DIST_COLLECTOR` |
| **Office of District Collector, Buldhana** | District Collector & DM | `collector.buldhana@nlams.gov.demo` | `COLL-BULDHANA` | `DIST_COLLECTOR` |
| **Office of District Collector, Washim** | District Collector & DM | `collector.washim@nlams.gov.demo` | `COLL-WASHIM` | `DIST_COLLECTOR` |
| **Office of District Collector, Beed** | District Collector & DM | `collector.beed@nlams.gov.demo` | `COLL-BEED` | `DIST_COLLECTOR` |
| **Office of District Collector, Jalna** | District Collector & DM | `collector.jalna@nlams.gov.demo` | `COLL-JALNA` | `DIST_COLLECTOR` |
| **Office of District Collector, Parbhani** | District Collector & DM | `collector.parbhani@nlams.gov.demo` | `COLL-PARBHANI` | `DIST_COLLECTOR` |
| **Office of District Collector, Hingoli** | District Collector & DM | `collector.hingoli@nlams.gov.demo` | `COLL-HINGOLI` | `DIST_COLLECTOR` |
| **Office of District Collector, Dharashiv** | District Collector & DM | `collector.dharashiv@nlams.gov.demo` | `COLL-DHARASHIV` | `DIST_COLLECTOR` |
| **Office of District Collector, Nandurbar** | District Collector & DM | `collector.nandurbar@nlams.gov.demo` | `COLL-NANDURBAR` | `DIST_COLLECTOR` |

---

## 📑 5. Land Acquisition Offices (LAO / SLAO across 36 Districts)

> **Email Format:** `lao.<district_slug>@nlams.gov.demo`  
> **Total Seeded Accounts:** 36

| Land Acquisition Office | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **SLAO Office, Pune** | Special Land Acquisition Officer | `lao.pune@nlams.gov.demo` | `LAO-PUNE` | `LAO` |
| **SLAO Office, Thane** | Special Land Acquisition Officer | `lao.thane@nlams.gov.demo` | `LAO-THANE` | `LAO` |
| **SLAO Office, Nagpur** | Special Land Acquisition Officer | `lao.nagpur@nlams.gov.demo` | `LAO-NAGPUR` | `LAO` |
| **SLAO Office, Nashik** | Special Land Acquisition Officer | `lao.nashik@nlams.gov.demo` | `LAO-NASHIK` | `LAO` |
| **SLAO Office, Raigad** | Special Land Acquisition Officer | `lao.raigad@nlams.gov.demo` | `LAO-RAIGAD` | `LAO` |
| **SLAO Office, Palghar** | Special Land Acquisition Officer | `lao.palghar@nlams.gov.demo` | `LAO-PALGHAR` | `LAO` |
| **SLAO Office, Kolhapur** | Special Land Acquisition Officer | `lao.kolhapur@nlams.gov.demo` | `LAO-KOLHAPUR` | `LAO` |
| **SLAO Office, Chhatrapati Sambhajinagar** | Special Land Acquisition Officer | `lao.chhatrapati.sambhajinagar@nlams.gov.demo` | `LAO-CHHATRAPATISAMBHAJINAGAR` | `LAO` |
| *(All 28 other districts)* | Special Land Acquisition Officer | `lao.<district_name>@nlams.gov.demo` | `LAO-<DISTRICT>` | `LAO` |

---

## ⚖️ 6. Tehsil Revenue Offices (Tehsildars across all 359 Talukas)

> **Email Format:** `tehsildar.<taluka_slug>.<district_slug>@nlams.gov.demo`  
> **Total Seeded Accounts:** 359

| Tehsil Jurisdiction | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **Tehsil Haveli (Pune)** | Tehsildar & Executive Magistrate | `tehsildar.haveli.pune@nlams.gov.demo` | `TEH-PUN-HAVELI` | `TEHSILDAR` |
| **Tehsil Baramati (Pune)** | Tehsildar & Executive Magistrate | `tehsildar.baramati.pune@nlams.gov.demo` | `TEH-PUN-BARAMATI` | `TEHSILDAR` |
| **Tehsil Maval (Pune)** | Tehsildar & Executive Magistrate | `tehsildar.maval.pune@nlams.gov.demo` | `TEH-PUN-MAVAL` | `TEHSILDAR` |
| **Tehsil Junnar (Pune)** | Tehsildar & Executive Magistrate | `tehsildar.junnar.pune@nlams.gov.demo` | `TEH-PUN-JUNNAR` | `TEHSILDAR` |
| **Tehsil Kalyan (Thane)** | Tehsildar & Executive Magistrate | `tehsildar.kalyan.thane@nlams.gov.demo` | `TEH-THA-KALYAN` | `TEHSILDAR` |
| **Tehsil Bhiwandi (Thane)** | Tehsildar & Executive Magistrate | `tehsildar.bhiwandi.thane@nlams.gov.demo` | `TEH-THA-BHIWANDI` | `TEHSILDAR` |
| **Tehsil Panvel (Raigad)** | Tehsildar & Executive Magistrate | `tehsildar.panvel.raigad@nlams.gov.demo` | `TEH-RAI-PANVEL` | `TEHSILDAR` |
| **Tehsil Karjat (Raigad)** | Tehsildar & Executive Magistrate | `tehsildar.karjat.raigad@nlams.gov.demo` | `TEH-RAI-KARJAT` | `TEHSILDAR` |
| **Tehsil Karjat (Ahmednagar)** | Tehsildar & Executive Magistrate | `tehsildar.karjat.ahmednagar@nlams.gov.demo` | `TEH-AHM-KARJAT` | `TEHSILDAR` |
| **Tehsil Andheri (Mumbai Suburban)** | Tehsildar & Executive Magistrate | `tehsildar.andheri.mumbai.suburban@nlams.gov.demo` | `TEH-MUM-ANDHERI` | `TEHSILDAR` |
| **Tehsil Borivali (Mumbai Suburban)** | Tehsildar & Executive Magistrate | `tehsildar.borivali.mumbai.suburban@nlams.gov.demo` | `TEH-MUM-BORIVALI` | `TEHSILDAR` |
| **Tehsil Kurla (Mumbai Suburban)** | Tehsildar & Executive Magistrate | `tehsildar.kurla.mumbai.suburban@nlams.gov.demo` | `TEH-MUM-KURLA` | `TEHSILDAR` |
| **Tehsil Hingna (Nagpur)** | Tehsildar & Executive Magistrate | `tehsildar.hingna.nagpur@nlams.gov.demo` | `TEH-NAG-HINGNA` | `TEHSILDAR` |
| **Tehsil Dindori (Nashik)** | Tehsildar & Executive Magistrate | `tehsildar.dindori.nashik@nlams.gov.demo` | `TEH-NAS-DINDORI` | `TEHSILDAR` |
| *(All other 345 talukas)* | Tehsildar & Executive Magistrate | `tehsildar.<taluka>.<district>@nlams.gov.demo` | `TEH-<DIS>-<TALUKA>` | `TEHSILDAR` |

---

## 🌾 7. Village Revenue Sazas (Talathis / 7-12 Officers across all 359 Talukas)

> **Email Format:** `talathi.<taluka_slug>.<district_slug>@nlams.gov.demo`  
> **Total Seeded Accounts:** 359

| Village Revenue Saza | Designation | Official Demo Email | Employee ID | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **Talathi Saza, Haveli (Pune)** | Talathi Saza Incharge | `talathi.haveli.pune@nlams.gov.demo` | `TAL-PUN-HAVELI` | `TALATHI` |
| **Talathi Saza, Baramati (Pune)** | Talathi Saza Incharge | `talathi.baramati.pune@nlams.gov.demo` | `TAL-PUN-BARAMATI` | `TALATHI` |
| **Talathi Saza, Maval (Pune)** | Talathi Saza Incharge | `talathi.maval.pune@nlams.gov.demo` | `TAL-PUN-MAVAL` | `TALATHI` |
| **Talathi Saza, Kalyan (Thane)** | Talathi Saza Incharge | `talathi.kalyan.thane@nlams.gov.demo` | `TAL-THA-KALYAN` | `TALATHI` |
| **Talathi Saza, Panvel (Raigad)** | Talathi Saza Incharge | `talathi.panvel.raigad@nlams.gov.demo` | `TAL-RAI-PANVEL` | `TALATHI` |
| **Talathi Saza, Karjat (Raigad)** | Talathi Saza Incharge | `talathi.karjat.raigad@nlams.gov.demo` | `TAL-RAI-KARJAT` | `TALATHI` |
| **Talathi Saza, Karjat (Ahmednagar)** | Talathi Saza Incharge | `talathi.karjat.ahmednagar@nlams.gov.demo` | `TAL-AHM-KARJAT` | `TALATHI` |
| *(All other 352 talukas)* | Talathi Saza Incharge | `talathi.<taluka>.<district>@nlams.gov.demo` | `TAL-<DIS>-<TALUKA>` | `TALATHI` |

---

## 👤 8. Citizen Portal Demo Accounts

| Name | Type | Email / Mobile | Description | Role Code |
| :--- | :--- | :--- | :--- | :--- |
| **Rajesh Patil** | Citizen / Landowner | `citizen@example.com` / `9876543210` | Landowner tracking land records and award status | `CITIZEN` |
| **Auto-Registration** | General Citizen | `<any_citizen_email>@example.com` | Automatically created on first OTP verification | `CITIZEN` |

---

## 🚀 Quick 1-Click Demo Accounts in UI

In the [LoginPage.tsx](file:///c:/Users/soham/NLAMS/frontend/src/pages/LoginPage.tsx), click any button under **"Maharashtra Hierarchy Demo Accounts"**:
* `Collector (Pune)` &rarr; `collector.pune@nlams.gov.demo`
* `LAO (Pune)` &rarr; `lao.pune@nlams.gov.demo`
* `Tehsildar (Haveli)` &rarr; `tehsildar.haveli.pune@nlams.gov.demo`
* `Talathi (Haveli)` &rarr; `talathi.haveli.pune@nlams.gov.demo`
* `PIA (NHAI)` &rarr; `officer.nhai@nlams.gov.demo`
* `State Admin (MH)` &rarr; `state.maharashtra@nlams.gov.demo`
* `Central Admin` &rarr; `central.admin@nlams.gov.demo`
