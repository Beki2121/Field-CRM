# Original Product Spec

This is the original prompt/spec this project was built from. Kept here so
it stays attached to the codebase — useful context for yourself later, or
for an AI coding assistant continuing the work (e.g. when you add the
backend + MySQL phase).

---

# Build a Simple Field Sales CRM for My SaaS Business

I want you to build a **simple, professional, lightweight Field Sales CRM / Customer Visit Tracking System** for my SaaS business.

## BUSINESS CONTEXT

I have developed a Sales, Inventory and Business Management SaaS product for businesses in Ethiopia.

My target sectors are:

1. Pharmacy
2. Cosmetics & Beauty
3. Mini-Market
4. Supermarket
5. Perfume
6. Mart / General Retail
7. Other

I personally visit businesses to introduce my software, demonstrate it, collect feedback, understand why they are interested or not interested, and follow up later.

I currently have paying customers and prospects, so I need a very simple system to remember every conversation and know what to do next.

The application should NOT be a complicated enterprise CRM.

It should be a **fast personal sales assistant** that I can use every day from my laptop and phone.

---

# MAIN OBJECTIVE

The most important workflow is:

**Visit business → record feedback → schedule next action → return later → immediately see previous conversation → continue the sales process.**

The system must make this workflow extremely fast.

I should be able to record a visit in **less than 60 seconds**.

---

# TECHNICAL REQUIREMENTS

Before coding:

1. Inspect the existing project.
2. Understand the existing architecture.
3. Reuse the current technology stack if practical.
4. Do NOT unnecessarily introduce a new framework.
5. Keep the implementation simple and maintainable.
6. Use TypeScript where appropriate.
7. Make the UI responsive for desktop and mobile.
8. Do not build unnecessary features.

If the project already has authentication, database, API, UI components, or styling conventions, reuse them.

If no existing project is provided, ask only the minimum necessary technical questions before implementation.

---

# CORE DATA MODEL

Create these main entities.

## 1. Business

Fields:

* id
* businessName
* sector
* contactPerson
* position
* phone
* whatsapp
* email
* location
* notes
* status
* createdAt
* updatedAt

### Sector options

* Pharmacy
* Cosmetics & Beauty
* Mini-Market
* Supermarket
* Perfume
* Mart / General Retail
* Other

### Business status

* Lead
* Interested
* Maybe
* Customer
* One-Time Customer
* Not Interested
* Lost

---

# 2. VISIT / FEEDBACK

Every time I visit or communicate with a business, create a visit record.

Fields:

* id
* businessId
* visitDate
* contactMethod
* interestStatus
* feedback
* reason
* liked
* objection
* requestedFeature
* nextAction
* nextFollowUpDate
* nextFollowUpMethod
* notes
* createdAt

### Contact method

* On-site
* Phone
* WhatsApp
* Online
* Other

### Interest status

* Interested
* Maybe
* Not Interested
* Existing Customer

### Next follow-up method

* On-site
* Phone
* WhatsApp
* Online

---

# 3. PRODUCT / SALES STATUS

Do not overcomplicate this.

A business should have a simple sales status:

* New Lead
* Contacted
* Demo Scheduled
* Demo Completed
* Trial
* Negotiation
* Ready to Buy
* Customer
* One-Time Customer
* Lost
* Not Interested

---

# MAIN SCREENS

Build only these screens initially.

---

# SCREEN 1 — DASHBOARD

Create a clean dashboard.

Show:

### Today's Follow-ups

Display businesses whose follow-up date is today.

Example:

```text
Today's Follow-ups

ABC Pharmacy
Interested
Call owner
10:00 AM

Beauty Store
Maybe
WhatsApp
2:00 PM
```

Each item should have buttons:

* View
* Call
* WhatsApp
* Complete
* Reschedule

---

### Overdue Follow-ups

Show follow-ups where the date has passed and the action has not been completed.

---

### Quick Statistics

Show:

* Total Leads
* Interested
* Maybe
* Customers
* Follow-ups Today
* Overdue

---

### Sector Summary

Show simple counts:

```text
Pharmacy       15
Cosmetics       8
Mini-Market    12
Supermarket     4
Perfume         3
Mart            7
```

Do not create complicated analytics.

---

# SCREEN 2 — ADD BUSINESS

Create a very fast form.

Required:

* Business Name
* Sector
* Contact Person
* Phone

Optional:

* WhatsApp
* Location
* Position
* Notes

After saving the business, allow me to immediately record the first visit.

---

# SCREEN 3 — ADD VISIT / FEEDBACK

This is the MOST IMPORTANT SCREEN.

Make it extremely fast.

Fields:

### Business

Select existing business.

### Date

Default to today.

### Contact Method

On-site / Phone / WhatsApp / Online

### Interest

Use large buttons:

🟢 Interested

🟡 Maybe

🔴 Not Interested

### Why?

Large text area:

```text
Why did they say yes/maybe/no?
```

### What did they like?

Small optional text area.

### Main objection / concern

Small optional text area.

### Requested feature

Optional.

### Next action

Examples:

* Call
* WhatsApp
* Visit
* Demo
* Send Price
* Start Trial
* Setup
* Follow Up
* No Action

### Next follow-up date

Date picker.

### Next follow-up method

Phone / WhatsApp / On-site / Online

### Save Visit

After saving, show:

**"Visit recorded successfully."**

Then show the next scheduled action.

---

# IMPORTANT UX REQUIREMENT

The user should NOT need to fill every field.

Only require:

* Business
* Interest
* Feedback/reason
* Next action
* Next follow-up date

Everything else can be optional.

The system should be usable in under one minute.

---

# SCREEN 4 — BUSINESSES

Create a searchable list.

Columns/cards:

* Business
* Sector
* Contact
* Interest/status
* Last visit
* Next follow-up
* Sales status

Filters:

* Sector
* Status
* Interest
* Follow-up
* Customer / Prospect

Search:

* Business name
* Contact person
* Phone

---

# SCREEN 5 — BUSINESS PROFILE

This is the MOST IMPORTANT screen when I revisit a customer.

At the top show:

```text
ABC Pharmacy

Pharmacy
Owner: Abebe
Phone: 09XXXXXXXX

Status: Interested
Sales Stage: Demo Completed
```

Then show:

## LAST VISIT

Example:

```text
12 August 2026
On-site

Interest: Maybe

Reason:
Interested in inventory and expiry tracking,
but wants to compare the price with current software.

Liked:
Expiry alerts and stock reports.

Objection:
Price.

Requested:
Monthly payment option.

Next Action:
Call owner.

Follow-up:
20 August 2026
Phone
```

This information should be visible immediately.

---

# VISIT HISTORY

Below the last visit, show a timeline.

Example:

```text
20 Aug
Phone
Follow-up completed

12 Aug
On-site
Demo completed

5 Aug
WhatsApp
Initial contact
```

Clicking any visit should show its full feedback.

---

# QUICK ACTIONS

On the business profile provide:

* Add Visit
* Call
* WhatsApp
* Schedule Follow-up
* Edit Business

If a phone number exists, use a `tel:` link.

If WhatsApp exists, provide a WhatsApp link.

---

# SCREEN 6 — FOLLOW-UPS

Create a simple follow-up management screen.

Tabs:

### Today

### Overdue

### Upcoming

### Completed

Each follow-up should show:

* Business
* Sector
* Previous feedback
* Interest
* Next action
* Date
* Method

When I click a follow-up, open the business profile and show the previous conversation first.

---

# CRITICAL FEATURE: PRE-VISIT SUMMARY

When I open a business that I am about to visit, show a small summary at the top:

## Before You Visit

```text
ABC Pharmacy

Last contact:
12 Aug 2026

Interest:
Maybe

Main reason:
Interested in inventory management.

Main objection:
Price.

What they liked:
Expiry tracking.

Last requested:
Monthly payment.

Your next move:
Discuss pricing.

Follow-up:
Today — On-site
```

This is the most important feature of the whole application.

I should be able to open a customer profile **30 seconds before entering the business** and know exactly what happened previously.

---

# AI FEATURE

Do NOT build complicated AI initially.

Create a simple optional AI assistant that can summarize the customer's history.

Example:

Input:

All previous visits for ABC Pharmacy.

Output:

```text
Customer Summary

ABC Pharmacy is interested in the system mainly
because of inventory and expiry management.

Their main concern is pricing.

They previously requested monthly payment.

They have had 2 interactions with us.

Recommended next move:
Focus the next conversation on ROI and
demonstrate how the system can reduce stock
and expiry losses.
```

The AI summary must be based only on recorded information.

Do not invent facts.

If AI integration is not already configured, create the UI/service interface but do not add unnecessary complexity.

---

# FOLLOW-UP AUTOMATION

When creating a visit:

If I select:

**Next follow-up: 25 August**

automatically create a pending follow-up.

If the date arrives:

show it under:

**Today's Follow-ups**

If the date passes:

show it under:

**Overdue**

Allow:

* Complete
* Reschedule
* Add Visit

When I complete a follow-up by adding a new visit, automatically connect the new visit to the business history.

---

# SECTOR-SPECIFIC INFORMATION

Do NOT create separate complicated systems for every sector.

Use the same core Business + Visit structure.

Only display optional sector-specific fields where useful.

### Pharmacy

Optional:

* Number of products
* Expiry management need
* Batch management need
* Current pharmacy software

### Cosmetics

Optional:

* Brands
* Product variants
* Customer loyalty needs

### Mini-Market / Supermarket

Optional:

* Number of products
* Number of branches
* Number of cashiers
* Barcode/POS usage

### Perfume

Optional:

* Brands
* Product variants

### Mart

Optional:

* Product categories
* Number of products

Keep these optional.

---

# CUSTOMER PRIVACY

This system contains business contact information.

Implement:

* Authentication
* Authorization
* Secure database access
* Input validation
* No unnecessary exposure of customer information

If this is a personal/internal CRM, keep it private to authorized users.

---

# DESIGN

The design should be:

* Modern
* Professional
* Clean
* Fast
* Mobile responsive
* Minimal

Do not create a complicated dashboard.

Use clear colors for status:

🟢 Interested

🟡 Maybe

🔴 Not Interested

🔵 Customer

Use cards and timelines where appropriate.

The application should feel like a **simple sales notebook upgraded into a professional CRM**.

---

# MOBILE-FIRST REQUIREMENT

I frequently visit businesses.

Therefore, the application must work extremely well on a phone.

The most important mobile workflow is:

```text
Open app
↓
Search business
↓
Open profile
↓
See previous feedback
↓
Add new visit
↓
Select Interest
↓
Write short feedback
↓
Set next action/date
↓
Save
```

This should take less than one minute.

---

# DO NOT BUILD

Do NOT build these in version 1:

* Complex accounting
* Marketing automation
* Email campaigns
* Inventory management
* Customer invoicing
* Payroll
* Complex AI agents
* Complicated charts
* Large enterprise CRM features
* Social media management
* Unnecessary integrations

This is a **personal field-sales CRM**, not another ERP.

---

# IMPORTANT DEVELOPMENT PROCESS

Before implementing:

1. Inspect the existing repository.
2. Identify the current frontend/backend/database architecture.
3. Identify existing authentication.
4. Identify existing UI components.
5. Identify existing database conventions.
6. Propose the smallest implementation plan.
7. Then implement it.

Do not rewrite the existing application unless absolutely necessary.

If there is already a database, create migrations rather than destroying existing data.

Use reusable components.

Keep the code clean and production-ready.

---

# FINAL SUCCESS CRITERIA

The system is successful if I can do this:

### Before a visit

Open:

**ABC Pharmacy**

and immediately see:

> They are interested in inventory and expiry management.
> Their concern is price.
> They previously asked about monthly payment.
> Today I need to discuss pricing.

### After the visit

Tap:

**Add Visit**

Then enter:

> Maybe — liked inventory — price concern — call Friday.

Select:

**Friday → Phone**

Press:

**Save**

Done.

That is the entire purpose of the application.

Build the simplest professional system that achieves this workflow.

---

## Implementation notes (added after phase 1 build)

- Built with Vite + React (no existing project was provided, so this was
  the minimum viable stack: no router needed given only ~6 screens, no
  state library needed given the data size, Tailwind for speed of
  styling).
- **Phase 1 (current): frontend-only, no backend.** Data lives in the
  browser's localStorage via `src/lib/storage.js`. This intentionally
  covers "up to ~50 businesses" comfortably — see `RECORD_SOFT_CAP` in
  `src/lib/constants.js`. The Businesses screen shows a soft warning once
  you're close to that, prompting a move to Phase 2.
- Real authentication/authorization, secure database access, and
  multi-device access all require a backend — they can't be done safely
  in a frontend-only app. `src/lib/storage.js` documents exactly what
  changes when that backend (+ MySQL) is added: every screen keeps
  calling the same `getBusinesses`/`saveBusinesses`/`getVisits`/
  `saveVisits` functions, only their implementation changes from
  localStorage to `fetch()` calls.
- The AI customer-summary feature (`src/lib/aiSummary.js`) is a local,
  deterministic summarizer for the same reason — no API key can live
  safely in frontend code. It's written as a drop-in service so it can be
  pointed at a real backend endpoint (which calls the Anthropic API
  server-side) once that exists.
