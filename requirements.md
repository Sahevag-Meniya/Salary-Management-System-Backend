# Salary Management System — Requirements Document (PRD)

## 1. Project Goal & Overview
The HR team currently manages salary data for **10,000 employees across multiple countries** using spreadsheets, which is slow, manual, and error-prone. 

The goal of this project is to build a centralized, web-based Salary Management System that allows the HR Manager to:
- Easily view, search, filter, and manage 10,000 employee salary records.
- Understand and visualize how the organization pays people across countries, departments, and roles.
- Export filtered salary data for reporting and payroll review.

---

## 2. Target User Persona
- **Primary User:** HR Manager.
- **Key Need:** Fast access to compensation data, instant calculations, clear visual answers to organizational pay questions, and reliable reports.

---

## 3. Technology Stack
- **Database:** MySQL (Relational database with optimized indexes for fast queries across 10,000+ records).
- **Backend:** Node.js + Express.js (REST APIs, calculation engine, validation, and CSV export).
- **Frontend:** React.js (Vite, Tailwind CSS).
- **Testing:** Unit tests for core salary calculations, filtering, and currency rules.

---

## 4. Scope & Key Features

### 4.1. 10,000 Records Seeding
- Seed script that populates the database with **10,000 realistic employee records** across 6 countries (USA, UK, Germany, India, Singapore, Japan).
- Each employee has a unique code, country, department, role, local currency, and realistic salary figures.

### 4.2. Salary Records Management (CRUD)
- **View Records:** Paginated list of employee salaries (10, 25, 50, 100 per page).
- **Add / Edit Record:** Simple form with real-time gross and net salary calculation.
- **Delete Record:** Safe removal with confirmation prompt.
- **Calculation Rules:**
  - `Gross Salary = Basic Salary + Allowances`
  - `Net Salary = Gross Salary - Deductions`
- **Validation:** Input fields cannot be empty; salary values must be positive numbers.

### 4.3. Search, Filtering & Sorting
- **Search:** Instant search by Employee Name or Employee ID (Code).
- **Filters:** By Country, Department, Designation, and Salary Range.
- **Sorting:** By Employee Name, Basic Salary, or Net Salary.
- Search, filters, sorting, and pagination work seamlessly together.

### 4.4. Analytics Dashboard ("How the Org Pays People")
- **Summary Cards:** Total Headcount (10,000), Total Payroll per Currency, Average Pay per Country.
- **Currency Rule:** Different currencies are **never** added together into one misleading number. Figures are grouped clearly by currency (USD, GBP, EUR, INR, SGD, JPY).
- **Visual Charts:**
  - Country-wise salary distribution and headcount.
  - Department-wise payroll breakdown.
  - Role/Designation salary ranges (min, max, average).

### 4.5. Reports & Export
- View filtered compensation records.
- One-click export of filtered records to a **CSV file** for finance and auditing.

---

## 5. Deliberately Left Out (Scope Omissions & Reasoning)

To keep the system focused, reliable, and fast, the following features are intentionally out of scope:

1. **Direct Bank Payouts / Payment Gateways:**
   - *Reason:* This is a compensation planning and records system for HR, not a banking tool. Adding banking APIs (Stripe, Wise) introduces heavy regulatory compliance without helping HR answer pay questions.
2. **Multi-tier Approval / Maker-Checker Workflows:**
   - *Reason:* The primary user is the HR Manager. Adding complex multi-step approval gates adds friction to the core problem of managing and querying records.
3. **Biometric Attendance & Leave Tracking:**
   - *Reason:* Attendance tracking is a separate HR domain. Keeping salary structures independent ensures high database performance (sub-50ms query times) over 10,000 rows.
4. **Real-time Live Forex Currency Conversion:**
   - *Reason:* Daily exchange rate fluctuations distort historical payroll records. Salaries are reported and evaluated in their local contract currency.

---
