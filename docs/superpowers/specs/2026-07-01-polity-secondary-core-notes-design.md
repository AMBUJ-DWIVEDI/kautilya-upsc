# Polity Secondary-Core Smart Notes Design

## Objective

Add an exhaustive second layer of 32 Polity Smart Notes to KAUTILYA IAS
without replacing or rewriting the existing primary, uploaded, or legacy
Polity notes. The new layer will separate broad constitutional chapters into
focused modules built around Articles, doctrines, institutions, procedures,
case-law development, prelims elimination, and mains analysis.

## Existing Library and ID Boundary

The current library contains:

- 12 broad primary notes with IDs `local-pol-101` through `local-pol-112`;
- four uploaded notes with IDs `local-pol-001` through `local-pol-004`;
- one legacy Article 21 note without the same local-ID convention.

All existing records remain unchanged. New notes will use IDs
`local-pol-113` through `local-pol-144`, avoiding every current ID and
preserving the broad primary notes as chapter-level command maps.

## Source Boundary

The secondary notes will be grounded in:

- `tmp/pdfs/static_polity.txt`
- `tmp/pdfs/pyq_polity_governance.txt`

The static source supplies constitutional provisions, institutional
structures, procedures, classifications, comparisons, and doctrine
development. The PYQ source supplies recurring question patterns and exam
priority.

The Constitution of India is the controlling legal text. Exact Article,
Schedule, amendment, majority, tenure, removal, and institutional claims must
be checked for internal consistency. Exact PYQ wording and case holdings will
be used only when verified; otherwise, they will be labelled as patterns or
doctrinal summaries.

## Relationship to the Primary Layer

Primary notes remain broad maps. The secondary layer must:

- have a narrower boundary than its parent note;
- connect constitutional text, institutional practice, and judicial doctrine;
- distinguish constitutional, statutory, regulatory, and executive bodies;
- separate appointment, tenure, removal, powers, and accountability;
- distinguish ordinary, special, effective, and absolute majority rules;
- identify Union, State, concurrent, local, or intergovernmental authority;
- include distinct prelims traps and mains applications;
- remain independently readable.

## Topic Stack

### Constitutional Foundations

1. Colonial Constitutional Evolution and Landmark Acts
2. Constituent Assembly, Objective Resolution and Constitutional Sources
3. Constitutionalism, Parliamentary Government and Separation of Powers
4. Preamble, Amendment Procedure and Basic Structure
5. Union Territory, State Reorganisation and Article 1-4 Logic
6. Citizenship, OCI and Citizenship-Law Framework

### Rights, Principles and Duties

7. Article 14-18: Equality, Classification and Affirmative Action
8. Article 19: Six Freedoms and Reasonable Restrictions
9. Article 20-22: Criminal Safeguards, Life, Liberty and Preventive Detention
10. Articles 23-30: Exploitation, Religion and Minority Rights
11. Article 32, Article 226 and Constitutional Writs
12. DPSPs, Fundamental Duties and FR-DPSP Reconciliation

### Federalism and Special Constitutional Design

13. Legislative and Administrative Centre-State Relations
14. Fiscal Federalism, Finance Commission and GST Council
15. Inter-State Council, Zonal Councils and Water Disputes
16. National, State and Financial Emergencies
17. Fifth Schedule, Sixth Schedule and Article 371 Provisions

### Executive and Legislatures

18. President and Vice-President: Election, Powers and Removal
19. Governor: Appointment, Discretion and Federal Controversies
20. Prime Minister, Chief Minister and Council of Ministers
21. Parliament: Composition, Sessions and Presiding Officers
22. Ordinary, Money, Financial and Constitutional Amendment Bills
23. Budget, Grants, Parliamentary Committees and Financial Control
24. Privileges, Anti-Defection and Legislative Accountability
25. State Legislatures and Legislative Councils

### Judiciary and Justice

26. Supreme Court and High Courts: Appointment, Independence and Jurisdiction
27. Judicial Review, PIL, Activism, Overreach and Constitutional Doctrines
28. Subordinate Courts, Tribunals, ADR, Lok Adalats and Legal Aid

### Democracy and Governance

29. Panchayats, Municipalities and Cooperative Societies
30. ECI, CAG, UPSC and Finance Commission
31. Elections, RPA, Delimitation, Political Parties and Electoral Reform
32. CIC, CVC, Lokpal, CBI, NIA, NITI Aayog and Accountability Architecture

## Note Contract

Every file will conform to the existing `SmartNote` JSON contract and preserve
the `upsc12` anatomy. Each note will include:

- a live constitutional or governance issue story;
- a precise constitutional principle or institutional mechanism;
- at least six analytical dimensions;
- relevant Articles, Schedules, amendments, statutes, or doctrines;
- a source declaration and legal-update marker;
- a verified or carefully summarised case-law example where relevant;
- balanced arguments and institutional trade-offs;
- a PYQ-pattern summary;
- a four-stage or longer mains answer framework;
- at least three mains examples;
- at least five prelims facts;
- at least four revision prompts;
- a mnemonic, structured mind map, key facts, and common traps;
- at least two PYQ-pattern references;
- yield, difficulty, reading-time, publication, and version metadata.

## Polity-Specific Depth Rules

The secondary layer will add depth through:

- Article-to-principle-to-restriction chains;
- composition-appointment-tenure-removal-power comparisons;
- constitutional-statutory-executive body classification;
- ordinary, special, absolute, effective, and simple-majority distinctions;
- Union-State-local and intergovernmental competence maps;
- bill-type and legislative-procedure flowcharts;
- writ purpose, standing, respondent, and jurisdiction comparisons;
- emergency trigger-approval-duration-effect-revocation matrices;
- case-law sequences showing how doctrines evolved;
- issue-constitutional tension-institutional safeguard-reform answer structures;
- prelims elimination rules for absolute statements and office comparisons.

## Case-Law and Legal-Update Policy

Stable constitutional text and settled doctrines belong in the core note.
Changeable statutory provisions, current officeholders, pending bills,
recent judgments, delimitation status, institutional vacancies, and live
procedural rules must be dated and attributed.

Each note must direct aspirants to refresh changing legal positions from
official sources such as:

- the Constitution of India and India Code;
- Supreme Court and High Court judgment databases;
- Parliament and State Legislature websites;
- Election Commission of India;
- CAG, UPSC, Finance Commission, GST Council, CIC, CVC and Lokpal;
- relevant ministry or statutory-body notifications.

No note may describe a pending proposal as enacted law or an old officeholder,
threshold, vacancy, judgment status, or institutional arrangement as
permanently current.

## IDs, Files, and Metadata

- IDs: `local-pol-113` through `local-pol-144`
- Filenames: `local-pol-NNN-<descriptive-slug>.json`
- Section: `Polity`
- Source type: `uploaded-polity-static-pyq-secondary`
- Status: `published`
- Version: `1`
- Creation and update date: `2026-07-01T00:00:00+05:30`

IDs and slugs must remain unique across the complete Smart Notes library.

## Quality Controls

Before completion:

1. Parse every generated JSON file.
2. Validate required fields and minimum depth against the loader contract.
3. Detect duplicate IDs and slugs across all Smart Notes.
4. Confirm 32 secondary Polity notes exist.
5. Confirm IDs `local-pol-113` through `local-pol-144` are contiguous.
6. Confirm all pre-existing Polity records remain unchanged.
7. Search for accidental topic, subtopic, or core-concept duplication.
8. Search for unsupported current officeholders, legal statuses, thresholds,
   case outcomes, or pending proposals.
9. Validate Article, Schedule, amendment, majority, tenure, and removal
   references for internal consistency.
10. Run the Smart Notes loader and verify Polity counts.
11. Run project type checking and the complete test suite.
12. Run a production build after note and test verification passes.

## Error Handling

If OCR extraction is noisy, the note will use only concepts corroborated by
surrounding source material and the constitutional structure. It will avoid
false quotations and false page-level precision.

If a case holding cannot be stated confidently, the note will describe the
settled doctrine without inventing facts. If a legal position may have changed,
the note will state the dated baseline and direct the aspirant to the relevant
official source. Generation, reference, or validation errors must stop the
batch before a content commit.

## Delivery

The 32 notes will be generated in bounded batches with a dedicated Polity
contract test. Existing Polity records, completed Geography and Economy
branches, and unrelated dirty product-shell files will not be modified.
Pushing, merging, and deployment remain separate actions after verification.
