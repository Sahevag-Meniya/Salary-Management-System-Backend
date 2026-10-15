# Product Requirements Document (PRD)
## Global Employee Salary Management System

**Document Version:** 2.0.0  
**Target User Persona:** HR Manager of the Organization (Global Operations & Compensation)  
**System Scale:** 10,000 Employees across Multi-Country Jurisdictions  
**Architecture:** 3-Tier Web Application (React 19 + Express.js + MySQL Relational Database)

---

## 1. Project Goal & Overview

### 1.1 Goal
To replace the organization's legacy, spreadsheet-driven salary management process with a centralized, high-performance web-based software built specifically for the **HR Manager**. The software enables the HR manager to manage salary structures for **10,000 employees**, instantly answer strategic questions about organizational compensation ("how the organization pays people"), maintain strict currency isolation, and export audit-ready payroll records.

### 1.2 Target User Persona
* **Primary Persona:** HR Manager.
* **Core Responsibilities:**
  * Reviewing total payroll expenditure and headcount across global offices.
  * Ensuring equitable compensation across departments and job roles.
  * Creating, revising, and maintaining itemized salary structures for new and existing hires.
  * Generating filtered payroll reports for finance, tax, and auditing reviews.
* **Key Frustrations Solved:**
  * Massive Excel spreadsheets that crash when handling 10,000 rows.
  * Accidental mixing of different currencies (e.g., adding Japanese Yen to US Dollars).
  * Human error in formula recalculations (e.g., forgetting to recompute HRA, DA, or PF when basic pay changes).
  * Absence of instant visual dashboards to answer executive pay questions.

---

## 2. Problem Statement

Managing 10,000 employees across multiple international jurisdictions via spreadsheets leads to:
1. **Performance Breakdown:** Spreadsheets freeze and crash under 10,000 rows, making multi-field filtering and searching unusable.
2. **Formula Drift & Human Error:** Manual cell edits cause discrepancies between allowances, deductions, and gross/net salary totals.
3. **Currency Distortion:** Multi-country teams operate in local currencies (`USD`, `INR`, `EUR`, `GBP`, `JPY`, `SGD`). Flat spreadsheets often sum them into meaningless, misleading totals.
4. **Lack of Relational Integrity:** Deleting or changing an employee's role or department leaves orphan cells and broken VLOOKUP formulas.

---

## 3. Technology Stack & Current Implementation

* **Database:** MySQL 8 with Sequelize ORM. Relational 8-table 3NF schema with composite B-Tree indexes on `(country_id, department_id, net_salary)`.
* **Backend:** Node.js (v24), Express.js REST API with clean separation of models, controllers, services, and middlewares.
* **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, and Recharts.
* **Testing:** 53 Deterministic Automated Tests (22 Backend unit/integration tests with `node:test` + 31 Frontend unit tests with `vitest`).

---

## 4. In-Scope Functional Features

### 4.1. 10,000 Seeded Employee Records
* Production seed script that populates the relational database with **10,000 realistic employees** across 6 countries:
  * **USA** (USD - $), **UK** (GBP - £), **Germany** (EUR - €), **India** (INR - ₹), **Singapore** (SGD - S$), and **Japan** (JPY - ¥).
* Realistic department distributions (Engineering, Product, Marketing, Sales, Operations, HR, Finance, Legal) with designated job roles and salary bands.

### 4.2. Executive Analytics Dashboard ("How the Org Pays People")
* **Strict Currency Isolation:** A dedicated currency selector allows the HR Manager to view compensation strictly isolated by currency. The system **never** blends different currencies together.
* **KPI Metrics:** Headcount count, Total Gross Payroll, Total Deductions, Net In-Hand Payroll, and Average Compensation per country/currency.
* **Interactive Visualizations:**
  * Department-wise payroll breakdown.
  * Country-wise employee distribution and payroll spend.
  * Top earners ranking and role salary band spreads.

### 4.3. 10,000 Records Management Grid (CRUD)
* **High-Speed Prefix Search:** Sub-15ms search by employee name or email address.
* **Multi-Field Filters:** Country, Department, Designation, Currency, and Net Take-Home Salary Range.
* **Bounded Server-Side Pagination:** Fast pagination (10, 25, 50, 100 rows per page) preventing memory overflow on 10,000 rows.

### 4.4. Itemized Salary Component & Formula Engine
* **Itemized Breakdown View:** Two-column visual breakdown separating Monthly Earnings (Basic, HRA, DA, Conveyance, Medical, Special Allowance) from Monthly Deductions (PF, TDS, Professional Tax, Health Insurance).
* **Automated Formula Calculations:**
  * Entering Basic Pay automatically recalculates percentage components:
    * **HRA (House Rent Allowance):** 40% of Basic Pay
    * **DA (Dearness Allowance):** 10% of Basic Pay
    * **PF (Provident Fund):** 12% of Basic Pay
  * Pre-populates statutory fixed defaults (Conveyance, Medical, Professional Tax, Health Insurance).
  * "Sync %" button allows one-click formula re-synchronization after manual overrides.
* **Mathematical Invariants:**
  * $\text{Gross Salary} = \text{Basic Salary} + \text{Allowances}$
  * $\text{Net Salary} = \text{Gross Salary} - \text{Deductions}$
  * Strict guard preventing $\text{Deductions} > \text{Gross Salary}$.
  * IEEE 754 2-decimal rounding precision to prevent floating-point drift.

### 4.5. Chunked Streaming CSV Export
* One-click export of filtered employee salary records into an audit-ready **CSV file**.
* Uses chunked streaming pipeline with `Content-Disposition: attachment` header to stream 10,000 records without loading everything into server memory.

---

## 5. Deliberately Left Out (Scope Omissions & Architectural Reasoning)

To deliver a reliable, focused, and production-grade solution within engineering constraints, the following features were **deliberately excluded**:

| Omitted Feature | Architectural & Business Reasoning |
| :--- | :--- |
| **1. Direct Bank Payouts / Escrow APIs** | **Reasoning:** This is a compensation management and planning tool for HR, not a banking rail. Integrating direct disbursement APIs (like Stripe Treasury or RazorpayX) introduces heavy financial compliance, KYC overhead, and cross-border banking variance without helping HR answer compensation questions. Providing audit-ready CSV exports allows finance teams to feed verified records into existing banking portals safely. |
| **2. Employee Self-Service / Employee Login Portal** | **Reasoning:** The user persona is explicitly the **HR Manager of the organization**. Adding employee logins requires authentication, password resets, role-based access control (RBAC), and session state management. This would divert engineering focus away from 10k data grid performance, relational schema integrity, and compensation analytics. |
| **3. Biometric Attendance & Daily Punch Timesheets** | **Reasoning:** Attendance tracking belongs to a separate domain (Time & Attendance systems). Tight coupling daily punch-in hours with salary structure definitions violates separation of concerns and degrades query latency across 10,000 records. Base compensation structures are modeled on standard monthly cycles. |
| **4. Hardcoded Country-Specific Progressive Tax Slabs** | **Reasoning:** Hardcoding complex, shifting tax brackets for 6+ global jurisdictions into the codebase creates extreme maintenance debt. Instead, we designed a flexible **Component Architecture** where statutory deductions (`TDS`, `PF`, `PROF_TAX`) can be managed through formula percentages or configured standard amounts. |
| **5. Real-Time Forex Currency Conversion** | **Reasoning:** Live exchange rates fluctuate constantly. Converting salaries dynamically would distort historical compensation records and legal employment contracts. Employees are paid and tracked in their native contracted currencies. |

---

## 6. Success Metrics & Quality Standards

* **Query Latency:** fast search and filter query latency across 10,000 database records using indexed MySQL queries.
* **Data Precision:** 100% mathematical integrity with zero IEEE 754 floating-point rounding anomalies.
* **Full-Stack Automated Test Coverage:** 53 deterministic automated tests (22 Backend tests in ~4.6s + 31 Frontend tests in ~5.2s) with 0 failures.
* **Code Cleanliness:** Pure JavaScript throughout (`.js` and `.jsx`), zero TypeScript compilation overhead, zero console warnings.
