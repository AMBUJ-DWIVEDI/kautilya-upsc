# Economy Secondary-Core Smart Notes Design

## Objective

Add an exhaustive second layer of 28 Economy Smart Notes to KAUTILYA IAS
without replacing or rewriting the 11 existing primary-core Economy notes. The
new layer will separate broad chapters into focused modules built around
economic mechanisms, accounting logic, Indian institutions, policy
transmission, prelims elimination, and mains analysis.

## Source Boundary

The secondary notes will be grounded in the uploaded and extracted sources:

- `tmp/pdfs/static_economy.txt`
- `tmp/pdfs/pyq_economic_agriculture.txt`

The static source supplies definitions, identities, institutional structures,
policy tools, and sectoral relationships. The PYQ source supplies recurring
question patterns and exam priority. Exact PYQ wording will be used only when
verified; otherwise, references will be labelled as patterns.

Economic figures, rates, policy thresholds, officeholders, rankings, and
Budget-year values can change. Notes will therefore emphasise stable concepts
and clearly direct aspirants to update time-sensitive figures from current
official RBI, Union Budget, Economic Survey, MoSPI, Finance Commission, WTO,
IMF, or World Bank sources.

## Relationship to the Primary Layer

Existing notes `local-eco-001` through `local-eco-011` remain unchanged. They
act as chapter-level command maps. New notes `local-eco-012` through
`local-eco-039` act as focused secondary-core modules.

Every new note must:

- have a narrower boundary than its parent primary note;
- explain a mechanism, identity, or policy-transmission chain;
- distinguish stocks, flows, rates, levels, nominal values, and real values;
- compare institutions or instruments where confusion is common;
- include distinct prelims traps and mains applications;
- connect concepts to Indian policy without becoming a current-affairs dump;
- remain independently readable.

## Topic Stack

### Macroeconomics and Public Finance

1. Demand, Supply, Elasticity and Market Failure
2. Growth, Savings, Investment, ICOR and Business Cycles
3. GDP, GVA, Deflators, Informal Economy and Welfare Accounting
4. Inflation Measurement, Causes, Effects and Indexation
5. Budget Architecture, Deficits, Public Debt and FRBM
6. Taxation, GST and Fiscal Federalism

### Money, Banking and Financial Markets

7. Money Supply, Liquidity and Credit Creation
8. RBI, Banking Architecture and Regulatory Institutions
9. Monetary Policy Instruments and Transmission
10. NPAs, Insolvency, Recapitalisation and Banking Reform
11. Money Market and Short-Term Instruments
12. Bonds, Government Securities, Yields and Interest-Rate Risk
13. Equity, Derivatives, Mutual Funds and Market Regulation
14. Financial Inclusion, Digital Payments, Fintech and Consumer Protection

### External Sector and Global Economy

15. Balance of Payments, Current Account and External Debt
16. Exchange Rates, NEER, REER and Forex Management
17. FDI, FPI, ECBs and Capital-Flow Management
18. Trade Policy, WTO, FTAs and India's IPR Framework
19. IMF, World Bank and Multilateral Development Banks

### Agriculture and Food Economy

20. Agricultural Productivity, Irrigation and Cropping Economics
21. MSP, Procurement, Buffer Stocks and Food Security
22. APMC, e-NAM, FPOs, Warehousing and Agricultural Markets
23. Farm Credit, Insurance, Fertiliser and Input Subsidies
24. Allied Sectors, Food Processing and Agricultural Value Chains

### Industry, Infrastructure and Development

25. Industrial Policy, MSMEs, PLI and Manufacturing Competitiveness
26. Infrastructure Finance, PPPs, Asset Monetisation and Logistics
27. LPG Reforms, Privatisation, Disinvestment and the Service Economy
28. Employment, Poverty, Inequality, Human Capital and Demographic Dividend

## Note Contract

Every file will conform to the current `SmartNote` JSON contract and preserve
the `upsc12` anatomy. Each note will include:

- a policy or household-facing issue story;
- a precise core concept and causal mechanism;
- at least six analytical dimensions;
- a genuine constitutional, statutory, federal, or governance link;
- source declaration and time-sensitive update marker;
- a case study or Indian institutional example;
- balanced benefits and limitations;
- a PYQ-pattern summary;
- a four-stage or longer mains answer framework;
- at least three mains examples;
- at least five prelims facts;
- at least four revision prompts;
- a mnemonic, structured mind map, key facts, and common traps;
- at least two PYQ-pattern references;
- yield, difficulty, reading-time, publication, and version metadata.

## Economy-Specific Depth Rules

The secondary layer will add depth through:

- identity chains such as output-income-expenditure and saving-investment;
- transmission chains such as policy rate-bank funding-loan rate-demand-price;
- instrument comparisons such as repo versus reverse repo, CRR versus SLR,
  FDI versus FPI, and money market versus capital market;
- stock-flow distinctions for debt, deficit, investment, income, wealth,
  reserves, and external liabilities;
- nominal-real distinctions and index-base interpretation;
- yield-price and exchange-rate direction rules;
- policy trade-offs involving efficiency, equity, stability, growth, and
  federalism;
- short reproducible diagrams, balance sheets, flowcharts, and formula boxes;
- elimination rules for absolute statements, institutional mandates, and
  accounting double counts.

## IDs, Files, and Metadata

- IDs: `local-eco-012` through `local-eco-039`
- Filenames: `local-eco-NNN-<descriptive-slug>.json`
- Section: `Economy`
- Source type: `uploaded-economy-static-pyq-secondary`
- Status: `published`
- Version: `1`
- Creation and update date: `2026-06-30T00:00:00+05:30`

IDs and slugs must remain unique across the complete Smart Notes library.

## Time-Sensitive Content Policy

Stable mechanisms belong in the core note. Changeable figures belong in the
`dataReport` block with an explicit instruction to update from an official
source. The notes must not present an old repo rate, tax slab, fiscal-deficit
target, poverty estimate, trade share, or institutional membership as if it
were permanently current.

Where an example requires a dated policy, the year will be stated. The example
will illustrate a mechanism rather than imply that the policy remains
unchanged.

## Quality Controls

Before completion:

1. Parse every generated JSON file.
2. Validate required fields and minimum depth against the loader contract.
3. Detect duplicate IDs and slugs across all Smart Notes.
4. Confirm exactly 39 local Economy notes exist.
5. Confirm IDs `local-eco-012` through `local-eco-039` are contiguous.
6. Search for accidental topic, subtopic, or core-concept duplication.
7. Search for unsupported claims of current rates or figures.
8. Run the Smart Notes loader and verify Economy counts.
9. Run project type checking and the complete test suite.
10. Run a production build after note and test verification passes.

## Error Handling

If OCR extraction is noisy, the note will use only concepts corroborated by
surrounding source material and will avoid false quotations or page-level
precision. If an economic figure cannot be confidently dated and attributed,
it will be omitted. If a constitutional link is not direct, the note will use
the relevant governance or statutory institution rather than inventing a
constitutional connection.

Generation or validation errors must stop the batch before a content commit.

## Delivery

The 28 notes will be generated in bounded batches with a dedicated Economy
contract test. Existing primary notes, completed Geography work, and unrelated
dirty product-shell files will not be modified. Pushing, merging, and
deployment remain separate actions after verification.
