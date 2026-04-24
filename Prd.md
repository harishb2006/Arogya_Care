# Product Requirements Document (PRD)

## AarogyaID – AI-Powered Insurance Recommendation Platform

---

## 1. User Profile

The primary user is an Indian adult (25–60 years old) looking for health insurance, with limited insurance knowledge and concern about choosing the wrong plan, hidden costs, or claim rejection.

Many users may be purchasing insurance for the first time or disclosing health conditions such as diabetes, hypertension, or cardiac history in a digital setting.

---

## 2. Problem Statement

Choosing health insurance in India is difficult because policy documents are long, complex, and filled with jargon. Users struggle to compare waiting periods, co-pay clauses, exclusions, and affordability.

Existing comparison platforms focus on price, but users need recommendations based on their personal health profile, financial capacity, and real coverage needs.

The platform solves this by converting policy documents into understandable, profile-aware recommendations.

---

## 3. Feature Priority

### High Priority (Built)

1. **6-field user profile form** – Required to personalize recommendations.
2. **AI recommendation engine** – Core feature of the platform.
3. **Comparison table** – Helps users compare multiple plans clearly.
4. **Coverage details table** – Shows inclusions, exclusions, co-pay, and claim type.
5. **Why This Policy explanation** – Builds trust with clear reasoning.
6. **Follow-up chat assistant** – Explains insurance terms in simple language.
7. **Admin panel** – Upload and manage policy documents.

### Lower Priority (Not Built)

* Payment integration
* Real insurer APIs
* OCR for scanned PDFs
* Email/SMS notifications
* User accounts and dashboards

These were excluded due to the 54-hour time constraint and lower relevance to the evaluation rubric.

---

## 4. Recommendation Logic

The system matches users to policies using profile data and retrieved policy clauses.

### Input Fields

1. Age
2. City / Tier
3. Annual Income
4. Existing Conditions
5. Family Size
6. Coverage Need / Budget Preference

### Decision Rules

* Filter plans that do not support the user’s age or needs.
* Prefer lower waiting periods for users with pre-existing conditions.
* Prefer lower co-pay for budget-sensitive users.
* Prefer higher cover amount when family size is larger.
* Penalize plans with exclusions related to declared conditions.
* Rank plans by total suitability score.
* Generate a personalized explanation referencing at least 3 user fields.

---

## 5. Assumptions

* Uploaded policy PDFs contain readable text.
* Policy documents include enough details for comparison.
* Users provide honest profile information.
* Recommendation quality depends on uploaded document quality.
* Premium values in sample documents are representative.

---

## 6. Out of Scope

* Medical diagnosis or treatment advice.
* Guaranteeing claim approval.
* Real-time insurer pricing APIs.
* KYC, payments, or policy purchase flow.
* Multi-language support.
* Production-scale infrastructure.

---

## 7. Success Criteria

* User receives at least one relevant recommendation.
* Output includes all three required sections.
* Chat remembers profile context during session.
* Admin can upload and delete documents successfully.
* AI avoids hallucinations and only uses uploaded documents.

---