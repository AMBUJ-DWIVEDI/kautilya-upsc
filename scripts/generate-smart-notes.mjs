/**
 * CHANAKYA SSC — Batch Smart Note Generator
 * =========================================
 * Reads content from the uploaded PDFs (Pinnacle GS + Parmar SSC Polity Notes)
 * and generates 5-layer Smart Notes via Groq API.
 *
 * Usage:
 *   node scripts/generate-smart-notes.mjs
 *   node scripts/generate-smart-notes.mjs --topic "Article 21"
 *   node scripts/generate-smart-notes.mjs --section polity
 *
 * Output: data/smart-notes/<topic-slug>.json
 * These files can then be imported to Supabase via the admin UI or the import script.
 *
 * Prerequisites:
 *   .env.local must have:
 *     GROQ_API_KEY=gsk_...
 *     SUPABASE_URL=https://...supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *     ADMIN_EMAIL=your@email.com
 */

import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')

// ── Load .env.local ─────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env.local not found. Create it first.')
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [k, ...v] = line.trim().split('=')
    if (k && !k.startsWith('#')) process.env[k] = v.join('=')
  }
}
loadEnv()

const GROQ_KEY = process.env.GROQ_API_KEY
if (!GROQ_KEY || GROQ_KEY.includes('your_groq_key')) {
  console.error('❌  GROQ_API_KEY not set in .env.local')
  console.error('    Get it from: https://console.groq.com/keys')
  process.exit(1)
}

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

// ── Reference content extracted from uploaded PDFs ─────────────
// Source 1: Parmar SSC Polity Notes (text-extractable pages)
// Source 2: Pinnacle GS Question Bank (PYQs with solutions)

const PDF_CONTENT = {

  // ─── SUPREME COURT ──────────────────────────────────────────
  supreme_court: {
    reference: `
SUPREME COURT OF INDIA — PARMAR SSC POLITY NOTES
[Art. 124-147, Part V, Chapter IV]

BASIC FACTS:
- Judiciary in India is Integrated (borrowed from GoI Act 1935) and Independent
- SC replaced the Federal Court (established 1937 under GoI Act 1935) after Independence
- 1st sitting of SC: 28 January 1950. SC = "Guardian of the Constitution"
- 1st Chief Justice: Sir Harilal Jekisundas Kania
- 53rd CJI: Justice Surya Kant | 52nd CJI: Bhushan Ramkrishna Gavai
- First Female Judge of SC: Justice Fathima Beevi (1989). No Female CJI till date.

Article 124 — Establishment:
- Original strength: 1 CJ + 7 = 8 judges
- Present strength: 1 CJ + 33 = 34 judges (maximum sanctioned)
- Tenure: Till age 65. Resign by writing to President.
- Appointment: By President after consultation with CJI (collegium)
- Qualifications: Indian citizen + 5 yrs as HC judge OR 10 yrs as HC advocate OR distinguished jurist
- Removal: By President after Parliament passes address by SPECIAL MAJORITY (majority of total membership + 2/3 present & voting)
  on grounds of: Proved misbehaviour or Incapacity
- Judges Enquiry Act, 1968 governs removal procedure
- Motion to remove: signed by 50 RS members OR 100 LS members
- NO SC judge removed till date.
- After retirement: SC judge CANNOT practice in ANY court in India.

Collegium System (Not mentioned in Constitution):
- 1st Judges Case 1982 (SP Gupta): Recommendation of CJI NOT binding on President
- 2nd Judges Case 1993: "Consultation" means Concurrence. CJI + 2 seniors recommend. Binding on President.
- 3rd Judges Case 1998: Collegium expanded to CJI + 4 senior-most judges
- 4th Judges Case 2015: 99th CA declared unconstitutional; NJAC struck down; Collegium restored
- NJAC was created by 99th CA 2014

Jurisdiction Articles:
- Art 129: SC = Court of Record (decisions = legal precedents; can punish for contempt)
- Art 130: Seat = Delhi (can sit elsewhere if CJI recommends + President approves)
- Art 131: ORIGINAL jurisdiction — disputes between GoI & states, or between states
  Exceptions: Pre-constitution treaties, Inter-state water disputes, Finance Commission matters
- Art 132: Appellate — Constitutional matters from HC
- Art 133: Appellate — Civil matters from HC
- Art 134: Appellate — Criminal matters
- Art 136: Special Leave to Appeal (from any court/tribunal, EXCEPT armed forces courts)
- Art 137: Review of its own judgments
- Art 139: Issue writs for Fundamental Rights (Art 32)
- Art 141: Law declared by SC = binding on ALL courts
- Art 142: SC can pass any decree for complete justice
- Art 143: Advisory jurisdiction — President can refer matters of general importance

TRICK: "SC ne SAARC countries ko SEAT OFFER Kari"
SC=124, S=125(Salaries), A=126(Acting CJ), A=127(Ad Hoc), R=128(Retired), C=129(Court of Record),
SEAT=130(Delhi), OFFER=131(Original Jurisdiction)`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Provisions related to seat of Supreme Court is mentioned in which Article?", answer: "Article 130" },
      { year: 2025, exam: "SSC Stenographer", question: "Which Article empowers the SC to review its own judgements?", answer: "Article 137" },
      { year: 2025, exam: "SSC Stenographer", question: "SC can grant Special Leave to Appeal under which Article?", answer: "Article 136" },
      { year: 2024, exam: "SSC CGL", question: "What is the maximum strength of judges in the Supreme Court of India?", answer: "34 (including CJI)" },
      { year: 2024, exam: "SSC CGL", question: "The collegium system was restored after which Judges Case?", answer: "Fourth Judges Case, 2015" },
    ]
  },

  // ─── EMERGENCY PROVISIONS ───────────────────────────────────
  emergency_provisions: {
    reference: `
EMERGENCY PROVISIONS — PARMAR SSC POLITY NOTES
[Art. 352-360, Part XVIII, borrowed from Weimar Constitution of Germany]

THREE TYPES:
1. National Emergency (Art. 352) — War/External Aggression/Armed Rebellion
2. President's Rule/State Emergency (Art. 356) — Failure of Constitutional Machinery
3. Financial Emergency (Art. 360) — Financial stability threatened

NATIONAL EMERGENCY (Art. 352):
- Proclamation: President declares after receiving CABINET decision (44th CA inserted "Cabinet")
- Grounds: War, External Aggression, Armed Rebellion (term "Armed Rebellion" added by 44th CA 1978; before = "Internal Disturbance")
- Approval: Both Houses within 1 MONTH by SPECIAL MAJORITY → continues for 6 months, extendable indefinitely (every 6 months)
- Revocation: President anytime WITHOUT Parliamentary approval
  BUT if LS passes resolution by SIMPLE MAJORITY → President MUST revoke
- Minerva Mills Case 1980: Proclamation subject to Judicial Review
- Effect on Centre-State: Federal → Unitary; Parliament can legislate on State List; laws inoperative 6 months after emergency ceases
- Effect on FRs:
  * Art 358: Art 19 suspended ONLY on grounds of War + External Aggression (NOT armed rebellion)
  * Art 359: President can suspend RIGHT TO MOVE COURT for all FRs EXCEPT Art 20 and 21 (CAN NEVER BE SUSPENDED)

NATIONAL EMERGENCIES DECLARED:
- 1962: Indo-China War → PM Nehru
- 1971: India-Pakistan War → PM Indira Gandhi
- 1975: Internal Disturbances → PM Indira Gandhi, President Fakruddin Ali Ahmed
  25th June = Samvidhan Hatya Diwas

PRESIDENT'S RULE (Art. 356):
- Grounds: Government of state cannot be carried on per Constitution; state fails to comply with Centre's directions
- Proclamation: President, only after cabinet approval (44th CAA 1978)
- Approval: Both Houses within 2 MONTHS by SIMPLE MAJORITY → 6 months, max 3 years
- Revocation: President anytime or if LS passes resolution by Simple Majority
- Consequences: President takes functions of Governor; Parliament takes functions of State Legislature; Executive dismissed; Legislature suspended or dissolved
- NO EFFECT on FRs during President's Rule
- 1st use: Punjab 1951 | Most times: Manipur (11) | UP: 10 times
- SR Bommai Case 1994: President's Rule subject to Judicial Review; curtailed misuse of Art 356
- BR Ambedkar: "Should be used as last resort"

FINANCIAL EMERGENCY (Art. 360):
- Proclamation: President if financial stability threatened
- Approval: Parliament within 2 MONTHS by SIMPLE MAJORITY (same as President's Rule)
- NO Financial Emergency imposed till now
- During: President can ask states to reduce salaries/allowances of all government servants`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Which Article mentions duty of Centre to protect every state against external aggression?", answer: "Article 355" },
      { year: 2025, exam: "SSC CGL", question: "Which term was inserted by the 44th Amendment in place of 'Internal Disturbance' in Article 352?", answer: "Armed Rebellion" },
      { year: 2024, exam: "SSC CGL", question: "Articles 20 and 21 can never be suspended even during National Emergency. True or False?", answer: "True — they can NEVER be suspended" },
      { year: 2024, exam: "SSC MTS", question: "How many times has National Emergency been proclaimed in India?", answer: "Three times — 1962, 1971, 1975" },
      { year: 2023, exam: "SSC CGL", question: "SR Bommai case (1994) is related to which provision?", answer: "Article 356 — President's Rule" },
    ]
  },

  // ─── PREAMBLE ───────────────────────────────────────────────
  preamble: {
    reference: `
PREAMBLE OF INDIA — FROM PINNACLE GS PYQs + PARMAR SSC

TEXT: "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a
SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:
JUSTICE, social, economic and political;
LIBERTY of thought, expression, belief, faith and worship;
EQUALITY of status and of opportunity;
and to promote among them all
FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation"

KEY FACTS:
- Based on the "Objective Resolution" moved by Nehru on 13 December 1946; adopted 22 January 1947
- Preamble CANNOT be used to override Constitution; it is a guide to interpretation
- Amended only ONCE — by 42nd CA 1976 (during Emergency under Indira Gandhi)
  Added: "Socialist", "Secular" (between "Sovereign" and "Democratic"), "Integrity" (in "Unity and Integrity")
  Before: "Sovereign Democratic Republic" → After: "Sovereign Socialist Secular Democratic Republic"

KEY PEOPLE & QUOTES:
- "Soul of the Constitution": Thakurdas Bhargav (NOT KM Munshi, NOT Palkhiwala)
- "Identity card of the Constitution": N.A. Palkhiwala
- "Keynote of the Constitution": Sir Ernest Barker
- "Political Horoscope of the Constitution": KM Munshi (Drafting Committee member)

CONSTITUENT ASSEMBLY FACTS:
- 1st session: 9 December 1946 | Temporary President: Dr. Sachchidananda Sinha
- Permanent President: Dr. Rajendra Prasad | Vice President: HC Mukherjee
- 11 sessions total; 165 days of sitting; 114 days on Draft Constitution
- Constitution ADOPTED: 26 November 1949 (Now = Constitution Day / Samvidhan Diwas)
- Constitution ENFORCED: 26 January 1950 (Republic Day)
- Time taken: 2 years, 11 months, 18 days
- Chairman of Drafting Committee: Dr. BR Ambedkar (Chief Architect)
- Calligrapher of original Constitution (English): Prem Behari Narayan Raizada (italic style)
- Calligrapher (Hindi version): Vasant Krishan Vaidya
- Artists (decoration): Nand Lal Bose and Beohar Rammanohar Sinha (from Shantiniketan)
- Legal Advisor to Constituent Assembly: BN Rau
- Chief Draftsman: SN Mukherjee

BORROWED FEATURES:
- USA: Fundamental Rights, Judicial Review, Impeachment of President, Vice-President post
- UK: Parliamentary system, Rule of Law, Single Citizenship
- Ireland: DPSPs, Election of President (indirect)
- Australia: Freedom of trade/commerce, Joint sitting of Houses (Art 108)
- Canada: Federal structure with strong centre, Residuary powers, Advisory jurisdiction of SC
- USSR: Ideals of Justice in Preamble, Fundamental Duties
- Germany (Weimar): Emergency provisions
- South Africa: Amending procedure (Art 368)
- Japan: "Due process of law"`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Which terms were added to the Preamble by the 42nd Constitutional Amendment Act, 1976?", answer: "Socialist and Secular" },
      { year: 2025, exam: "SSC Stenographer", question: "Who called the Preamble the 'Political Horoscope of the Constitution'?", answer: "KM Munshi" },
      { year: 2025, exam: "SSC Stenographer", question: "Who was the Chairman of the Drafting Committee of the Constituent Assembly?", answer: "Dr. BR Ambedkar" },
      { year: 2025, exam: "SSC Stenographer", question: "When was the Constitution of India adopted?", answer: "26 November 1949" },
      { year: 2025, exam: "SSC Stenographer", question: "The Preamble has been amended how many times?", answer: "Only once — by the 42nd Amendment, 1976" },
      { year: 2024, exam: "SSC CGL", question: "From which Constitution did India borrow the idea of Directive Principles of State Policy?", answer: "Ireland" },
      { year: 2024, exam: "SSC CGL", question: "Who called the Preamble the 'Identity card of the Constitution'?", answer: "N.A. Palkhiwala" },
    ]
  },

  // ─── ARTICLE 21 — RIGHT TO LIFE ─────────────────────────────
  article_21: {
    reference: `
ARTICLE 21 — PROTECTION OF LIFE AND PERSONAL LIBERTY
[Part III — Fundamental Rights, Article 12-35]

TEXT: "No person shall be deprived of his life or personal liberty except according to
procedure established by law."

SCOPE AND EVOLUTION:
- Originally (Gopalan Case 1950): Narrow interpretation — "procedure established by law" meant any law passed by Parliament, however arbitrary
- After Maneka Gandhi vs Union of India 1978: WIDE interpretation — procedure must be FAIR, JUST, and REASONABLE
  This overruled the Gopalan Case and expanded Art 21 enormously

WHAT'S INCLUDED IN "RIGHT TO LIFE" (judicial expansions):
- Right to livelihood
- Right to education (Article 21A added by 86th CA 2002 — free & compulsory education 6-14 yrs)
- Right to health and medical care
- Right to live with human dignity
- Right to speedy trial (Q233 — categorised under Right to Life)
- Right to privacy (KS Puttaswamy vs Union of India, 2017 — 9-judge bench)
- Right to a pollution-free environment
- Right to die with dignity (passive euthanasia — Common Cause case 2018)
- Right against handcuffing
- Right to fair trial

ARTICLE 21A (added by 86th CA 2002):
- Right to free and compulsory education for children 6-14 years
- Made elementary education a Fundamental Right
- Article 45 (DPSP) was amended correspondingly (now covers children below 6 yrs — early childhood care)

CASES:
- A.K. Gopalan vs State of Madras, 1950: Narrow interpretation
- Maneka Gandhi vs Union of India, 1978: Wide interpretation — "golden triangle" Art 14+19+21
- KS Puttaswamy vs Union of India, 2017: Right to Privacy is FR under Art 21
- KA Najeeb vs Union of India: Violation of Art 21 (bail in long-pending trial)
- Olga Tellis Case: Right to livelihood under Art 21
- Parmanand Katara Case: Right to medical treatment under Art 21

CANNOT BE SUSPENDED:
- Art 20 and Art 21 CANNOT be suspended even during National Emergency (Art 359)
- They are the ONLY two FRs that can never be suspended

AVAILABLE TO ALL PERSONS (not just citizens):
- Art 14 (equality), Art 20, Art 21, Art 21A, Art 22, Art 23, Art 24, Art 25-28 — available to ALL persons including foreigners
- Art 15, Art 16, Art 19, Art 29, Art 30 — available ONLY to citizens

GOVERNMENT BOUND UNDER ART 21:
- Government must ensure observance of social welfare and labour laws to secure a life compatible with human dignity`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Article 21 provides which Fundamental Right?", answer: "Protection of Life and Personal Liberty" },
      { year: 2025, exam: "SSC Stenographer", question: "Right of a prisoner to speedy trial is categorised under which Fundamental Right?", answer: "Right to Life (Article 21)" },
      { year: 2025, exam: "SSC Stenographer", question: "In Maneka Gandhi vs Union of India 1978, what did the SC hold about Article 21?", answer: "Wider interpretation — procedure must be fair, just, and reasonable" },
      { year: 2025, exam: "SSC Stenographer", question: "Article 21A deals with?", answer: "Right to free and compulsory education for children 6-14 years (added by 86th CA 2002)" },
      { year: 2024, exam: "SSC CGL", question: "Which articles cannot be suspended even during National Emergency?", answer: "Article 20 and Article 21" },
      { year: 2024, exam: "SSC CGL", question: "The government is bound to ensure observance of social welfare laws under which Article?", answer: "Article 21" },
    ]
  },

  // ─── CONSTITUTIONAL AMENDMENTS ──────────────────────────────
  constitutional_amendments: {
    reference: `
CONSTITUTIONAL AMENDMENTS — PARMAR SSC POLITY NOTES
[Article 368, Part XX — Borrowed from South Africa]

BASIC STRUCTURE:
- Parliament CANNOT amend provisions forming the Basic Structure of Constitution
  (Kesavananda Bharati Case, 1973)
- Basic Structure includes: Judicial Review, Independent Judiciary, Separation of Powers,
  Federal Structure, Secularism, Supremacy of Constitution
- Constitutional Amendment Bill: Can be introduced in EITHER house (not state legislature)
- Introduced by: Any minister OR private member (no prior Presidential recommendation needed)
- President MUST give assent — NO VETO in Constitutional Amendment (24th CA 1971)
- NO provision for joint sitting in case of Constitutional Amendment Bill

THREE TYPES OF AMENDMENT:
1. Simple Majority (outside Art 368 purview): New states, 2nd Schedule, 5th/6th Schedule, Quorum, Delimitation, LegCouncil, Official Language, UTs, salaries of MPs
2. Special Majority (Art 368): FRs, DPSPs, Fundamental Duties + most provisions
3. Special Majority + Ratification by ≥½ States: Election of President, SC/HC, Art 368 itself, 7th Schedule, distribution of legislative powers, representation of states in Parliament

IMPORTANT AMENDMENTS:
- 1st CA 1951: Added 9th Schedule (land reforms), restrictions on Art 19
- 7th CA 1956: State reorganisation, common HCs
- 24th CA 1971: Parliament can amend any part including FRs
- 42nd CA 1976 (Mini Constitution): Added "Socialist", "Secular", "Integrity" to Preamble; FR to DPSP priority; 10 FDs added; emergency provisions changed
- 44th CA 1978: Restored democratic values; "Armed Rebellion" replaced "Internal Disturbance"; Cabinet approval for emergency; Right to Property removed as FR (now Art 300A)
- 61st CA 1989: Voting age lowered from 21 to 18
- 73rd CA 1992: Panchayati Raj (Part IX, Art 243) — 3-tier system
- 74th CA 1992: Municipalities (Part IXA, Art 243P-243ZG)
- 86th CA 2002: Art 21A (Right to Education 6-14 yrs)
- 99th CA 2014: NJAC — struck down by 4th Judges Case 2015
- 100th CA 2015: India-Bangladesh land boundary agreement
- 101st CA 2016: GST
- 102nd CA 2018: NCBC Constitutional status
- 103rd CA 2019: 10% EWS reservation
- 104th CA 2020: Removed Anglo-Indian nomination from LS and state assemblies
- 105th CA 2021: States' power to identify SEBCs restored
- 106th CA 2023: Women's reservation — 1/3 seats in LS/State Assemblies

COMMENTS ON AMENDMENT PROCEDURE:
- "This variety in amending process is wise, but rarely found": KC Wheare
- "Strikes a good balance between rigidity and flexibility": KC Wheare
- "Amending process proved one of the most ably conceived aspects": Granville Austin`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Which Constitutional Amendment is also known as the 'Mini Constitution'?", answer: "42nd Constitutional Amendment, 1976" },
      { year: 2025, exam: "SSC Stenographer", question: "Which words were added to the Preamble by the 42nd Amendment?", answer: "Socialist, Secular, and Integrity" },
      { year: 2025, exam: "SSC Stenographer", question: "The Kesavananda Bharati case (1973) established which doctrine?", answer: "Basic Structure Doctrine" },
      { year: 2025, exam: "SSC Stenographer", question: "Which CA gave Constitutional status to NCBC?", answer: "102nd Constitutional Amendment, 2018" },
      { year: 2024, exam: "SSC CGL", question: "GST was introduced by which Constitutional Amendment?", answer: "101st Constitutional Amendment, 2016" },
      { year: 2024, exam: "SSC CGL", question: "Right to Education (Art 21A) was added by which Constitutional Amendment?", answer: "86th Constitutional Amendment, 2002" },
    ]
  },

  // ─── RBI & MONETARY POLICY ──────────────────────────────────
  rbi_monetary_policy: {
    reference: `
RBI & MONETARY POLICY — PARMAR SSC ECONOMY NOTES

RESERVE BANK OF INDIA (RBI):
- Established: Based on Hilton Young Commission (1926), RBI Act 1934
- Operations began: 1 April 1935 in Calcutta; HQ shifted to Mumbai in 1937
- Nationalised: 1 January 1949 via Transfer to Public Ownership Act 1948
- 1st Governor: Sir Osborne Smith | 1st Indian Governor: Sir CD Deshmukh
- Current Governor: Sanjay Malhotra | Logo: Tiger and Palm Tree
- RBI = "Father of all Banks" / Central Bank / Banker's Bank

RESERVE RATIOS (Based on NDTL — Net Demand and Time Liabilities):
1. CRR (Cash Reserve Ratio):
   - % of NDTL kept WITH RBI | Form: CASH ONLY | NO interest earned
   - Banks cannot use this for lending
2. SLR (Statutory Liquidity Ratio):
   - % of NDTL kept WITH BANK ITSELF | Form: Cash, Gold, G-Secs | Earns interest
   - Penalty: Bank Rate + 3% (1st default), Bank Rate + 5% (subsequent)
   - Narasimham Committee (1991): Recommended reducing SLR
3. NDTL = Demand Deposits (Savings, Current) + Time Deposits (FD, RD)

MONETARY POLICY TOOLS:
1. Bank Rate: Rate at which RBI lends to banks LONG TERM; NO collateral required
2. Repo Rate: Rate at which banks borrow from RBI SHORT TERM with G-Sec collateral
3. Reverse Repo Rate: Rate at which RBI borrows from banks (replaced by SDF from 2022-23)
4. SDF (Standing Deposit Facility): Banks park surplus funds with RBI WITHOUT collateral (from 2022); now acts as FLOOR of interest rate corridor
5. MSF (Marginal Standing Facility): Emergency overnight lending at Repo Rate + 1% (100 bps); banks can use SLR securities; ONLY scheduled commercial banks eligible; max 1-2% of NDTL
6. OMO (Open Market Operations): RBI buys/sells G-Secs; also called Sterilization
7. MPC (Monetary Policy Committee): 6 members (3 RBI + 3 Govt); Chairperson = RBI Governor; meets bi-monthly; decides repo rate; established 2016 (Urjit Patel Committee)

INFLATION vs DEFLATION POLICY:
- Inflation → INCREASE CRR, SLR, Repo Rate → CONTRACTIONARY/TIGHT/DEAR/HAWKISH policy
- Deflation → DECREASE CRR, SLR, Repo Rate → EXPANSIONARY/EASY/DOVISH policy

MONEY MULTIPLIER = 1 / CRR (higher CRR = lower money multiplier)
Call Money: Overnight interbank lending (< 1 day)
Notice Money: 2-14 days interbank
NBFC and NBFC-MFI: Do NOT maintain CRR and SLR`,
    pyqs: [
      { year: 2025, exam: "SSC CGL", question: "The RBI was established based on the recommendations of which Commission?", answer: "Hilton Young Commission (1926)" },
      { year: 2025, exam: "SSC CGL", question: "CRR must be maintained in which form?", answer: "Cash only, kept with RBI (no interest earned)" },
      { year: 2025, exam: "SSC CGL", question: "SLR can be maintained in which forms?", answer: "Cash, Gold, or Government Securities (G-Secs) — kept with bank itself" },
      { year: 2024, exam: "SSC CGL", question: "MSF rate is typically how much above the Repo Rate?", answer: "1% (100 basis points) above the Repo Rate" },
      { year: 2024, exam: "SSC MTS", question: "Who was the first Indian Governor of RBI?", answer: "Sir CD Deshmukh" },
      { year: 2024, exam: "SSC CGL", question: "MPC (Monetary Policy Committee) has how many members and who chairs it?", answer: "6 members — chaired by RBI Governor" },
    ]
  },

  // ─── BUDGET & FISCAL POLICY ──────────────────────────────────
  budget_fiscal_policy: {
    reference: `
BUDGET & FISCAL POLICY — PARMAR SSC ECONOMY NOTES

TYPES OF BUDGET:
1. Balanced Budget: Total revenue = Total expenditure
2. Surplus Budget: Total revenue > Total expenditure
3. Deficit Budget: Total expenditure > Total revenue

TYPES OF DEFICIT:
1. Budget Deficit = Total expenditure - Total receipts
2. Revenue Deficit = Revenue expenditure - Revenue receipts
3. Fiscal Deficit = Total expenditure - (Total receipts EXCLUDING borrowings) [most important!]
4. Primary Deficit = Fiscal deficit - Interest payments (FD minus interest paid on previous debt)
5. Effective Revenue Deficit = Revenue deficit - Grants for creation of capital assets

DEFICIT FINANCING (popularized by John Maynard Keynes):
1. Debt Financing: Raising money by BORROWING → Liabilities increase
2. Equity Financing: Raising money by selling OWNERSHIP (shares) → Assets decrease

FISCAL POLICY: Government strategy to manage economy via taxes, govt spending, borrowing
- To CONTROL INFLATION: Increase taxes, lower subsidies, lower MSP
- MSP = Minimum Support Price (set by govt for agricultural products)
- Monetary Policy = used by RBI | Fiscal Policy = used by GOVERNMENT

UNION BUDGET:
- Presented by Finance Minister on 1st February (earlier: last day of February)
- Introduced in India by James Wilson in 1860
- Railway Budget merged with Union Budget in 2017
- Budget presented in Parliament under Article 112 (Annual Financial Statement)
- Consolidated Fund of India (Article 266): All revenues + loans go here; all expenditure paid from here

IMPORTANT COMMITTEES:
- FRBM Act 2003: Fiscal Responsibility and Budget Management Act — targets for fiscal deficit
- Finance Commission (Article 280): Recommends distribution of taxes between Centre and states; constituted every 5 years`,
    pyqs: [
      { year: 2025, exam: "SSC CGL", question: "Primary Deficit = ?", answer: "Fiscal Deficit minus Interest Payments" },
      { year: 2025, exam: "SSC CGL", question: "Fiscal Deficit = ?", answer: "Total expenditure minus (Total receipts excluding borrowings)" },
      { year: 2024, exam: "SSC CGL", question: "Who introduced the concept of Deficit Financing?", answer: "John Maynard Keynes" },
      { year: 2024, exam: "SSC MTS", question: "Union Budget is presented under which Article of the Constitution?", answer: "Article 112 (Annual Financial Statement)" },
      { year: 2024, exam: "SSC CGL", question: "Monetary Policy is used by whom? Fiscal Policy by whom?", answer: "Monetary Policy by RBI; Fiscal Policy by Government" },
    ]
  },

  // ─── VITAMINS & DEFICIENCY DISEASES ─────────────────────────
  vitamins_deficiency: {
    reference: `
VITAMINS & DEFICIENCY DISEASES — PARMAR SSC BIOLOGY NOTES

COINED BY: Casimir Funk coined the term "Vitamin" in 1912.

FAT SOLUBLE VITAMINS (stored in body's fatty tissues and liver): A, D, E, K
WATER SOLUBLE VITAMINS (not stored, excreted in urine): B complex, C

COMPLETE VITAMIN TABLE:
Vitamin A (Retinol): Deficiency → Night blindness; Sources → Spinach, carrots, sweet potatoes
Vitamin B1 (Thiamine): Deficiency → Beriberi; Sources → Meat, eggs, dairy
Vitamin B2 (Riboflavin): Deficiency → Decrease in RBC; Sources → Meat, green leafy vegetables
Vitamin B3 (Niacin): Deficiency → PELLAGRA (3D disease: Dementia, Dermatitis, Diarrhea)
Vitamin B5 (Pantothenic Acid): Deficiency → Fatigue, numbness, muscle cramps
Vitamin B6 (Pyridoxine): Deficiency → Anaemia
Vitamin B7 (Biotin): Deficiency → Hair loss, brittle nails, skin rashes
Vitamin B9 (Folic Acid): Deficiency → Neural tube defects in babies, fatigue
Vitamin B12 (Cyanocobalamin): Deficiency → Pernicious anemia, memory loss; ONLY vitamin with Cobalt
Vitamin C (Ascorbic Acid): Deficiency → SCURVY (bleeding gums); Important for COLLAGEN synthesis
Vitamin D (Calciferol/Sunshine Vitamin): Deficiency → Rickets (children), Osteomalacia, Osteoporosis
  - Also considered a HORMONE; Produced by SKIN in sunlight
  - D2 = Ergocalciferol, D3 = Cholecalciferol (more effective)
Vitamin E (Tocopherol): Deficiency → Anti-sterility, vision problems
Vitamin K (Phylloquinone): Deficiency → Excessive bleeding, poor blood clotting

QUICK MNEMONICS:
- Fat soluble = A, D, E, K → "All Dogs Eat Kibble"
- Night blindness = Vitamin A | Scurvy = Vitamin C | Beriberi = Vitamin B1 | Rickets = Vitamin D
- Pellagra = B3 (Niacin) = 3D disease
- Vitamin C important for COLLAGEN (skin/joints protein); discovered by G.N. Ramachandran (triple helix structure)
- Excess fluoride in water → Fluorosis
- Wilson disease → excess COPPER accumulation
- Minamata disease → MERCURY poisoning (also called Mad Hatter Disease)
- Siderosis → excess IRON deposition`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Which disease is caused by deficiency of Vitamin C?", answer: "Scurvy (bleeding gums)" },
      { year: 2025, exam: "SSC CGL", question: "Pellagra disease is caused by deficiency of which vitamin?", answer: "Vitamin B3 (Niacin) — also called 3D disease (Dementia, Dermatitis, Diarrhea)" },
      { year: 2025, exam: "SSC CGL", question: "Vitamin D is also known as?", answer: "Sunshine Vitamin (also considered a hormone)" },
      { year: 2025, exam: "SSC MTS", question: "Which vitamin is important for blood clotting?", answer: "Vitamin K (Phylloquinone)" },
      { year: 2024, exam: "SSC CGL", question: "Who coined the term 'Vitamin'?", answer: "Casimir Funk (1912)" },
      { year: 2024, exam: "SSC CGL", question: "Rickets disease in children is caused by deficiency of which vitamin?", answer: "Vitamin D (Calciferol)" },
    ]
  },

  // ─── NEWTON'S LAWS OF MOTION ─────────────────────────────────
  newtons_laws_motion: {
    reference: `
NEWTON'S LAWS OF MOTION — PARMAR SSC PHYSICS NOTES

BACKGROUND:
- Galileo Galilei FIRST proposed the concept of INERTIA (observed motion on inclined planes)
- Newton FORMULATED the three laws of motion
- Galileo's books: De Motu ("On Motion"), La Bilancetta (1586)

1ST LAW (LAW OF INERTIA):
"An object at rest remains at rest and an object in motion remains in motion at constant velocity unless acted upon by an external force."
Types of Inertia:
1. Inertia of Rest: Object stays at rest. E.g. Dry leaves fall when tree is shaken
2. Inertia of Motion: Object keeps moving. E.g. Person pushed forward when car stops abruptly
3. Inertia of Direction: Object keeps direction. E.g. Body leans when car turns
Key: Inertia ∝ Mass (heavier object = more inertia)

2ND LAW:
F = ma (Force = mass × acceleration)
F = Rate of change of momentum (dp/dt)
SI unit of Force: Newton (N) = 1 kg m/s²
E.g. Cricketer pulling back hand while catching = increasing time → reducing force

3RD LAW:
"For every action, there is an equal and opposite reaction."
E.g. When gun fires, bullet goes forward, gun recoils backward
E.g. Rocket propulsion — exhaust gases go down, rocket goes up

MOMENTUM:
- Momentum (p) = mass × velocity; SI unit = kg m/s; p is a VECTOR quantity
- Conservation of Momentum: In a closed system, total momentum remains constant
- Impulse = Change in momentum = F × t = m × ΔV

GRAVITATION (Newton's Universal Law, 1687):
"Every particle attracts every other particle with force directly proportional to product of masses
and inversely proportional to square of distance between them."
- G = 6.673 × 10⁻¹¹ N m²/kg² (discovered experimentally by Henry Cavendish, 1798)
- Gravitational force: non-contact + conservative force

KEPLER'S PLANETARY LAWS (1609):
1. Law of Orbit: Planets move in ELLIPTICAL orbits with Sun as a focus
2. Law of Area: Line joining planet-Sun sweeps equal areas in equal time
3. Law of Time Period: T² ∝ r³ (square of time period ∝ cube of distance from Sun)`,
    pyqs: [
      { year: 2025, exam: "SSC CGL", question: "Who first proposed the concept of Inertia?", answer: "Galileo Galilei" },
      { year: 2025, exam: "SSC CGL", question: "Newton's 2nd Law of Motion states F = ?", answer: "F = ma (Force = mass × acceleration) OR rate of change of momentum" },
      { year: 2025, exam: "SSC CGL", question: "The SI unit of Force is?", answer: "Newton (N) = 1 kg m/s²" },
      { year: 2024, exam: "SSC CGL", question: "Kepler's 3rd law states the relationship between?", answer: "Square of time period (T²) and cube of mean distance from Sun (r³): T² ∝ r³" },
      { year: 2024, exam: "SSC MTS", question: "The value of Universal Gravitational Constant G was discovered experimentally by?", answer: "Henry Cavendish (1798)" },
    ]
  },

  // ─── LIGHT & OPTICS ──────────────────────────────────────────
  light_optics: {
    reference: `
LIGHT & OPTICS — PARMAR SSC PHYSICS NOTES

ELECTROMAGNETIC SPECTRUM (Memory trick: Rich Man In Victoria Uses Xtra Gold):
Radio waves (Heinrich Hertz) → Microwaves (Percy Spencer) → Infrared (William Herschel) →
Visible light (Isaac Newton) → UV rays (Johann Wilhelm Ritter) → X-rays (Wilhelm Roentgen) →
Gamma rays (Paul Villard)
Planck's constant h = 6.626 × 10⁻³⁴ J-sec; Energy E = hf (frequency) = hc/λ (wavelength)
Energy ∝ frequency; Energy ∝ 1/wavelength

RAINBOW:
- Formed by: Refraction (×2) + Dispersion + Internal Reflection of sunlight in water droplets
- Primary Rainbow: 1 refraction + 1 internal reflection; color order VIBGYOR (V top, R bottom)
- Secondary Rainbow: 2 internal reflections; color order REVERSED (R top, V bottom); FAINTER

SCATTERING OF LIGHT (Rayleigh Scattering, 1871):
- Shorter wavelengths scatter MORE; longer wavelengths scatter LESS
- Blue sky: Blue/violet scatters most → sky looks BLUE
- Red sunrise/sunset: Sun low → long path → blue scattered away → only RED remains
- Red for danger signals: Longest wavelength, scatters LEAST → visible from far in fog/smoke
- Tyndall Effect: Scattering of light by colloid particles (e.g., milk in water, beam in dusty room)

TWINKLING OF STARS vs PLANETS:
- Stars TWINKLE: Due to atmospheric refraction (light bends through layers of varying density)
- Planets do NOT twinkle (appear as disc, not point source)

ATMOSPHERIC REFRACTION:
- Advanced Sunrise + Delayed Sunset: Both caused by atmospheric refraction
  (Sun appears slightly higher than actual position due to bending)

TOTAL INTERNAL REFLECTION (TIR):
- Conditions: Light from denser to rarer medium; angle of incidence > critical angle
- Applications: Optical fibres, Mirage, Sparkling of diamond

LENSES & MIRRORS:
- Convex lens = Converging; Concave lens = Diverging
- Convex mirror = Diverging (used in rear-view mirrors) — forms virtual, erect, diminished image
- Concave mirror = Converging (used in torches, headlights) — used by doctors to examine ear/nose
- Power of lens = 1/Focal length (in metres); unit = Dioptre (D)`,
    pyqs: [
      { year: 2025, exam: "SSC CGL", question: "Who discovered X-rays?", answer: "Wilhelm Roentgen" },
      { year: 2025, exam: "SSC CGL", question: "Why is the sky blue?", answer: "Rayleigh scattering — blue light (shorter wavelength) scatters more in all directions" },
      { year: 2025, exam: "SSC CGL", question: "Rainbow is formed due to which phenomena?", answer: "Refraction, Dispersion, and Total Internal Reflection of sunlight in water droplets" },
      { year: 2024, exam: "SSC CGL", question: "Which type of mirror is used in rear-view mirrors of vehicles?", answer: "Convex mirror (gives wider field of view)" },
      { year: 2024, exam: "SSC MTS", question: "The Tyndall Effect is associated with?", answer: "Scattering of light by particles in a colloid" },
    ]
  },

  // ─── CHOLA DYNASTY ───────────────────────────────────────────
  chola_dynasty: {
    reference: `
CHOLA DYNASTY — PARMAR SSC HISTORY NOTES

BASICS:
- Region: Tamil Nadu, parts of Andhra, Kerala, Sri Lanka, Southeast Asia
- Religion: Primarily Shaivism (Lord Shiva worship)
- Known For: Naval power, Dravidian temple architecture, LOCAL SELF-GOVERNMENT
- Initial Capital: Uraiyur → Later: Thanjavur → Gangaikonda Cholapuram

KEY RULERS:
1. Vijayalaya Chola: Founder of Imperial Chola dynasty; captured Thanjavur from Muttaraiyars; title: Narkesari
2. Aditya I: Defeated Pallavas king Aprajita; title: Maduraikonda (Conqueror of Madurai)
3. Parantaka I: Described in Uttaramerur inscription; defeated Pandyas and occupied Lanka; coins: Kasu, Kalanju
4. Rajaraja I (985-1014 AD): REAL founder of Chola imperialism; conquered Sri Lanka, Maldives
   - Built: Rajarajeswara Temple (= Brihadeshwara Temple) at Thanjavur — UNESCO 1987
   - Interlocking stone method (no mortar); bronze Nataraja sculptures
5. Rajendra I (1014-1044 AD): Son of Rajaraja I; MOST POWERFUL
   - Completely conquered Sri Lanka (Anuradhapur); Gangaikonda Chola (brought Ganga water)
   - Built: Gangaikonda Cholapuram as new capital; UNESCO 2004
   - Naval expeditions to SE Asia (Srivijaya); Contemporary of Mahmud Ghazni

THREE GREAT CHOLA TEMPLES (UNESCO):
- Brihadeshwara Temple, Thanjavur (Rajaraja I) — UNESCO 1987
- Shiva Temple, Gangaikondacholapuram (Rajendra I) — UNESCO 2004
- Airavatesvara Temple, Kumbakonam/Dharasuram (Raja Raja II) — UNESCO 2004

CHOLA LOCAL GOVERNMENT (Most important for SSC!):
- Villages divided into 30 Kudumbus (yards), governed by Variyam (local committee)
- TWO ASSEMBLIES: Ur (assembly of common people) + Sabha (assembly of Brahmin scholars)
- Uttaramerur Inscription: Describes village election system (Kudavolal = lottery method)
- Kudavolal System: Members selected by lottery; each served 3 years
- COMMITTEES (Variyam): Eri Variyam (irrigation), Tottavariyam (gardens), Pon Variyam (gold/finance), Nyaya Variyam (justice)
- TAXES: Vetti (forced labour), Kadamai (land revenue)
- Land donations: Brahmadeya (to Brahmins), Devadana (to temples), Pallichchhandam (to Jains)

CHOLA ART:
- Bronze Nataraja (Dancing Shiva): Made using lost-wax casting technique; stands on right leg; on Apasmara (demon of ignorance)
- Dravidian Style temples: Large gopurams (towers), temple tanks`,
    pyqs: [
      { year: 2025, exam: "SSC CGL", question: "Brihadeshwara Temple was built by which Chola ruler?", answer: "Rajaraja I (also called Rajarajeswara Temple, at Thanjavur — UNESCO 1987)" },
      { year: 2025, exam: "SSC CGL", question: "The Chola village assembly of common people was called?", answer: "Ur (Sabha was the assembly of Brahmin scholars)" },
      { year: 2025, exam: "SSC CGL", question: "Which Chola ruler is called 'Gangaikonda Chola'?", answer: "Rajendra I — because he marched to the Ganga and brought Ganga water in a golden pot" },
      { year: 2024, exam: "SSC CGL", question: "Uttaramerur inscription is related to which dynasty?", answer: "Chola Dynasty — describes village administration and the Kudavolal (lottery) election system" },
      { year: 2024, exam: "SSC MTS", question: "The Chola bronze Nataraja was made using which technique?", answer: "Lost-wax casting technique (cire perdue)" },
    ]
  },

  // ─── CLASSICAL DANCES OF INDIA ───────────────────────────────
  classical_dances: {
    reference: `
CLASSICAL DANCES OF INDIA — PARMAR SSC STATIC GK NOTES

8 CLASSICAL DANCES (Officially recognized by Sangeet Natak Akademi):
1. Bharatanatyam — Tamil Nadu (oldest; uses Mudras + Abhinaya for storytelling; devotional)
2. Kathak — Uttar Pradesh (3 gharanas: Jaipur, Banaras, Lucknow; famous exponent: Pandit Birju Maharaj)
3. Kathakali — Kerala (male performers; elaborate costumes and makeup; blend of drama, dance, music)
4. Kuchipudi — Andhra Pradesh (uniquely blends dance + singing + acting; temple dance-drama)
5. Manipuri — Manipur (graceful; devotional; based on Vaishnavism; Raas Lila themes)
6. Mohiniyattam — Kerala (performed by women; graceful, lyrical; name means "Dance of Mohini")
7. Odissi — Odisha (from temples of Odisha; devotional to Lord Jagannath; depicted in Konark Sun Temple)
8. Sattriya — Assam (created by saint Srimanta Sankardev in 15th-16th century; Neo-Vaishnavite movement; performed in Sattras/monasteries; 8th classical dance added in 2000)

FOLK DANCES (NOT classical — common trap!):
- Garba: Gujarat (NOT classical) | Bhangra: Punjab (NOT classical) | Bihu: Assam (NOT classical)
- Lavani: Maharashtra | Ghoomar: Rajasthan | Koli: Maharashtra (fishermen dance)
- Bihar folk dances: Karma, Kajri, Jhumar (NOT Garba/Ghoomar/Bihu which are from other states)

BIHU (Assam):
- 3 types: Rongali/Bohag (April — new year + spring harvest, most celebrated),
  Bhogali/Magh (January — harvest), Kongali/Kati (October — scarce harvest)

IMPORTANT FACTS:
- Odissi depicted in Konark Sun Temple and Jagannath Temple (Puri)
- Bharatnatyam: Tamil Nadu — uses Mudras (hand gestures) + Abhinaya (facial expressions)
- Kuchipudi: Only dance with performers who sing AND dance AND deliver dialogues
- Sattriya: Added as 8th classical dance in 2000 by Sangeet Natak Akademi
- Yakshagana: Traditional theatre from coastal Karnataka (NOT classical dance)
- Chad Laho: Dance-festival of Jaintia tribe of Meghalaya (thanksgiving to God after harvest)
- Ka Shad Suk Mynsiem: Khasi festival (NOT Garos!)
- Wangala: GAROS festival (NOT Jaintias!)`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "Which is the correct classical dance associated with Tamil Nadu?", answer: "Bharatanatyam (uses Mudras and Abhinaya for storytelling)" },
      { year: 2025, exam: "SSC Stenographer", question: "Kathak dance has 3 gharanas named after which cities?", answer: "Jaipur, Banaras (Varanasi), and Lucknow" },
      { year: 2025, exam: "SSC Stenographer", question: "Sattriya classical dance was created by?", answer: "Saint Srimanta Sankardev in the 15th-16th century, in Assam's Vaishnavite monasteries (Sattras)" },
      { year: 2025, exam: "SSC Stenographer", question: "Which is NOT a classical dance: Odissi, Garba, Kuchipudi, Manipuri?", answer: "Garba (folk dance of Gujarat)" },
      { year: 2025, exam: "SSC Stenographer", question: "Bihu festival celebrated to mark new harvest season is associated with which state?", answer: "Assam (Rongali Bihu in April marks new year + spring harvest)" },
    ]
  },

  // ─── MEDIEVAL HISTORY — DELHI SULTANATE ──────────────────────
  delhi_sultanate: {
    reference: `
DELHI SULTANATE & MEDIEVAL INVASIONS — PARMAR SSC HISTORY NOTES

EARLY INVASIONS:
- Muhammad bin Qasim (712 AD): 1st Muslim invasion in India; attacked Sindh; killed Raja Dahir
  (last Hindu ruler of Sindh); first to introduce JIZYA in Indian subcontinent
- Mahmud of Ghazni (999-1027 AD): Son of Subuktgin; made 17 invasions into India
  - Battle of Peshawar (1001 AD): Defeated Hindu Shahi ruler Jayapala
  - Battle of Waihind/Chaach (1008 AD): Defeated Anandpala (son of Jayapala)
  - 16th Attack (1025 AD): Plundered Somnath Temple, Gujarat (last major expedition)
  - Final (1027 AD): Punitive naval campaign against Jats near Indus
  - Could NOT capture Kashmir (ruled by Queen Didda)
  - Historians: Ferishta and Utbi (17th CE); Kitab-ul-Yamini written by Utbi
  - Reason for Turkish victory: Iqta System, excellent horses, "Spirit of Ghazi"

DELHI SULTANATE — FIVE DYNASTIES:
1. SLAVE/MAMLUK DYNASTY (1206-1290):
   - Qutub-ud-din Aibak: Founder; Delhi Sultanate established 1206; built Qutub Minar (started); Adhai din ka Jhopra (Ajmer); died playing Chaugan (polo)
   - Iltutmish: Real consolidator; completed Qutub Minar; introduced Iqta system; Silver Tanka + Copper Jital coins; first sultan to get Caliph recognition; daughter: Razia Sultana
   - Razia Sultana (1236-1240): 1st female sultan of Delhi; deposed and killed
   - Balban (1266-1286): Theory of Divine Right of Kingship; Sijda (prostration) + Paibos (kissing feet) customs; "Blood and Iron" policy; Diwan-i-Arz (military department)

2. KHILJI DYNASTY (1290-1320):
   - Jalaluddin Khilji: Founder
   - Alauddin Khilji (1296-1316): Market reforms (4 markets: grain, cloth, cattle, slaves);
     Diwan-i-Riyasat (market controller); first to introduce Token Currency;
     Conquests: Gujarat, Ranthambore, Chittor (1303), Malwa, Devagiri
     Generals: Malik Kafur (southern campaigns); Khizr Khan (son)
     Architecture: Alai Darwaza (1311) — 1st true arch in India; Hauz-i-Khas; started Alai Minar

3. TUGHLAQ DYNASTY (1320-1414):
   - Ghiyasuddin Tughlaq: Founder; built Tughlaqabad Fort
   - Muhammad bin Tughlaq: Shift of capital Delhi → Devagiri/Daulatabad; Token Currency (failed); Khorasan expedition (failed); Doab tax increase;
     Famous travelers: Ibn Battuta (visited court; wrote Kitab-ul-Rihla), Moroccan traveler
   - Firuz Shah Tughlaq: Welfare policies; 24 canals; banned torture; established Diwan-i-Khairat (charity); city builder

4. SAYYID DYNASTY (1414-1451): Founded by Khizr Khan

5. LODI DYNASTY (1451-1526):
   - Bahlul Lodi: Founder; Afghan dynasty
   - Ibrahim Lodi: Last; defeated by Babur in FIRST Battle of Panipat (1526) → End of Sultanate`,
    pyqs: [
      { year: 2025, exam: "SSC CGL", question: "Who was the first Muslim ruler to introduce Jizya tax in India?", answer: "Muhammad bin Qasim (712 AD, in Sindh)" },
      { year: 2025, exam: "SSC CGL", question: "Alauddin Khilji's 'Alai Darwaza' (1311) is significant because?", answer: "It is the first true arch in India using the true arch (voussoir) technique" },
      { year: 2025, exam: "SSC CGL", question: "Muhammad bin Tughlaq shifted the capital from Delhi to?", answer: "Devagiri (renamed Daulatabad) in Deccan" },
      { year: 2024, exam: "SSC CGL", question: "Who was the first female Sultan of Delhi?", answer: "Razia Sultana (1236-1240), daughter of Iltutmish" },
      { year: 2024, exam: "SSC CGL", question: "Qutub Minar was started by whom and completed by whom?", answer: "Started by Qutub-ud-din Aibak, completed by Iltutmish" },
      { year: 2024, exam: "SSC MTS", question: "Iltutmish introduced which coins?", answer: "Silver Tanka and Copper Jital" },
    ]
  },

  // ─── PANCHAYATI RAJ ─────────────────────────────────────────
  panchayati_raj: {
    reference: `
PANCHAYATI RAJ — 73rd CONSTITUTIONAL AMENDMENT (1992)

BASICS:
- Added Part IX (Articles 243-243O) to the Constitution
- Gave Constitutional status to Panchayati Raj institutions
- Also added 11th Schedule: 29 subjects of Panchayats (including agriculture, minor irrigation, education)
- Came into force: 24 April 1993 — National Panchayati Raj Day

THREE-TIER SYSTEM:
- Gram Panchayat (village level)
- Panchayat Samiti / Block/Taluka (intermediate level)
- Zila Parishad (district level)
- Note: Intermediate tier is optional for states with population < 20 lakh

KEY PROVISIONS:
- Elections held by State Election Commission (SEC) — independent body
- State Finance Commission (SFC): every 5 years to review financial position of panchayats
- Duration: 5 years term; elections before expiry (if dissolved, elections within 6 months)
- Reservation: SCs, STs (proportional to population); women — NOT LESS THAN 1/3 of seats reserved (including chairperson seats)
  Many states have raised reservation to 50% for women
- Article 243G: Powers and functions of Panchayats; Legislature can endow economic development and social justice functions
- Article 243D: Reservation of seats

GANDHIAN PRINCIPLE CONNECTION:
- Article 40 (DPSP): State shall take steps to organise village panchayats — this was the Gandhian principle
- Art 243 Panchayats made this a justiciable right through 73rd CA

BALWANTRAI MEHTA COMMITTEE (1957): First recommended 3-tier Panchayati Raj
ASHOK MEHTA COMMITTEE (1977): Recommended 2-tier system
LM SINGHVI COMMITTEE (1986): Recommended Constitutional status for PRIs

FIRST STATE: Rajasthan (inaugurated by Pt. Nehru in Nagaur, 2 October 1959)

74th CA (1992) — MUNICIPALITIES:
- Added Part IXA (Articles 243P-243ZG) and 12th Schedule (18 subjects)
- Nagar Panchayat (transitional area), Municipal Council (smaller urban), Municipal Corporation (larger urban)
- Came into force: 1 June 1993`,
    pyqs: [
      { year: 2025, exam: "SSC Stenographer", question: "73rd Constitutional Amendment gave Constitutional status to which institutions?", answer: "Panchayati Raj Institutions (Gram Panchayat, Panchayat Samiti, Zila Parishad)" },
      { year: 2025, exam: "SSC Stenographer", question: "How many subjects are in the 11th Schedule added by the 73rd CA?", answer: "29 subjects" },
      { year: 2025, exam: "SSC Stenographer", question: "What is the minimum reservation for women in Panchayati Raj institutions?", answer: "Not less than 1/3 (one-third) of total seats" },
      { year: 2024, exam: "SSC CGL", question: "Which committee first recommended the 3-tier Panchayati Raj system?", answer: "Balwantrai Mehta Committee, 1957" },
      { year: 2024, exam: "SSC CGL", question: "National Panchayati Raj Day is observed on?", answer: "24 April" },
    ]
  },

  himalayas: {
    reference: `
HIMALAYAS — PARMAR SSC GEOGRAPHY

FORMATION:
- Formed when Indo-Australian plate collided with Eurasian plate → closed Tethys Sea
- Youngest fold mountains in the world; composed mainly of Sedimentary Rocks
- Theory by McKenzie and Parker (1967) — Plate Tectonic Theory

4 PARALLEL RANGES (N to S):
1. TRANS-HIMALAYAS (north of Great Himalayas): Karakoram, Ladakh, Zanskar ranges. Avg elevation 3000m
2. GREATER HIMALAYAS / HIMADRI: Avg height 6000m, width 120-190km, length 2500km
   - Westernmost: Nanga Parbat (8126m), Easternmost: Namcha Barwa
   - Major peaks: Mt Everest (8849m, Nepal) — world's highest; K2/Godwin Austin (8611m) — India's highest; Kanchenjunga (8586m)
3. LESSER HIMALAYAS / HIMACHAL: Avg 4000m, width 60-80km
   - Known as: Pirpanjal (Kashmir), Dhaula Dhar (HP), Mussoorie (Uttarakhand), Mahabharat (Nepal)
   - Kashmir Valley: between Great & Lesser Himalayas; Kangra Valley = longitudinal; Kullu = transverse
   - Famous Duns: Dehradun (largest), formed between Lesser Himalayas and Shivaliks
4. OUTER HIMALAYAS / SHIVALIK: Avg 1000m. In Nepal = Churia Range. In east = Duars replace Shivaliks

REGIONAL DIVISIONS:
- Punjab Himalayas: Indus to Sutlej
- Kumaon Himalayas: Sutlej to Kali
- Nepal Himalayas: Kali to Teesta
- Assam Himalayas: Teesta to Dihang

KEY PASSES:
- Zoji La (Greater Him, J&K) → Srinagar to Leh
- Banihal (Pir Panjal) → connects Kashmir Valley to Jammu
- Khardung La (Zanskar) — one of world's highest motorable roads
- Nathu La (Sikkim) → India-China trade route
- Bom Di La → Arunachal to Lhasa (Tibet)
- Yangyap Pass: where Brahmaputra enters India from Tibet

GLACIERS:
- Siachen Glacier — largest glacier in India and Karakoram; second longest in world outside polar regions
- Gangotri Glacier — source of Ganga (Bhagirathi)
- Zemu Glacier — Sikkim (2nd largest in India)`,
    pyqs: [
      { year: 2024, exam: "SSC CGL", question: "Which is the highest peak of India?", answer: "K2 (Godwin Austen) — 8611m in Karakoram range" },
      { year: 2024, exam: "SSC CGL", question: "Himalayas were formed due to collision of which tectonic plates?", answer: "Indo-Australian plate and Eurasian plate" },
      { year: 2023, exam: "SSC CHSL", question: "Siachen Glacier is located in which mountain range?", answer: "Karakoram range" },
      { year: 2023, exam: "SSC CGL", question: "Duars are found in which part of Himalayas?", answer: "Eastern foothills (replaces Shivalik range in the east)" },
      { year: 2022, exam: "SSC CGL", question: "The Shivalik range is also known as?", answer: "Outer Himalayas" },
      { year: 2022, exam: "SSC CHSL", question: "Nathu La pass connects India with which country?", answer: "China (Sikkim border)" },
    ]
  },

  indian_soils: {
    reference: `
SOILS OF INDIA — PARMAR SSC GEOGRAPHY
ICAR (Indian Council of Agricultural Research, HQ: New Delhi) classified Indian soils into 8 types.

1. ALLUVIAL SOIL — Most widespread (40% of India's area)
   - Found in: Northern Plains (UP, Bihar, WB, Assam), deltas of Mahanadi, Godavari, Krishna, Kaveri
   - Formed by: 3 Himalayan river systems — Indus, Ganga, Brahmaputra
   - Rich in: Potash | Poor in: Phosphorus
   - Khadar = new alluvium (light coloured, fertile, near rivers)
   - Bangar = old alluvium (dark, upland, less fertile, has kankar nodules)
   - Best for: Rice, wheat, sugarcane, jute

2. BLACK SOIL (Regur Soil) — 2nd largest (15%)
   - Found in: Deccan Plateau (Maharashtra, MP, Gujarat, AP)
   - Made of: volcanic (basaltic) rock
   - Properties: retains moisture long (cotton grows without irrigation), self-ploughing
   - Rich in: Calcium, Magnesium, Potash | Poor in: Nitrogen, Phosphorus
   - Also known as: Cotton soil / Regur (Telugu word)

3. RED SOIL
   - Found in: Tamil Nadu, Andhra, Odisha, Jharkhand, parts of MP
   - Red colour due to: Iron oxide (ferric oxide)
   - Poor in: Nitrogen, Phosphorus, Lime
   - Best for: Groundnut, pulses

4. LATERITE SOIL
   - Found in: Kerala, Karnataka, Tamil Nadu hills, Odisha hills, Assam
   - Formed by: intense leaching (silica washed away; iron and aluminium concentrated)
   - Name from Latin 'later' = brick (bricklike when dried)
   - Slightly acidic; low fertility
   - Suitable for: Tea, coffee (Karnataka)

5. ARID/DESERT SOIL
   - Found in: Rajasthan, Gujarat
   - Sandy, saline; kankar layer restricts water infiltration

6. SALINE / ALKALINE SOIL (Usar soil)
   - Found in: arid/semi-arid areas, waterlogged areas
   - Treatment: Gypsum (CaSO4·2H2O)

7. PEATY / MARSHY SOIL
   - Found in: Kerala, coastal WB, Odisha, coastal Tamil Nadu
   - High organic matter (humus); waterlogged areas

8. MOUNTAIN / FOREST SOIL
   - Found in: Himalayan slopes, hilly areas
   - Acidic; high humus; low mineral nutrients

SOIL EROSION TYPES:
- Sheet erosion: top layer washed off in sheets
- Gully erosion: deep cuts by running water (creates ravines = bad land)
- Rill erosion: shallow channels
- Wind erosion: deserts (Rajasthan)

SOIL CONSERVATION:
- Contour ploughing, Mulching, Shelter belts, Terrace farming, Strip farming`,
    pyqs: [
      { year: 2024, exam: "SSC CGL", question: "Which soil is known as 'Regur soil'?", answer: "Black soil (Cotton soil)" },
      { year: 2024, exam: "SSC CGL", question: "The most widely spread soil in India is?", answer: "Alluvial soil (covers ~40% of India)" },
      { year: 2023, exam: "SSC CHSL", question: "Red colour of Red soil is due to?", answer: "Iron oxide (ferric oxide)" },
      { year: 2023, exam: "SSC CGL", question: "Laterite soil is suitable for which crops?", answer: "Tea and coffee" },
      { year: 2022, exam: "SSC CGL", question: "Saline soil is treated with which substance?", answer: "Gypsum (CaSO4·2H2O)" },
      { year: 2022, exam: "SSC CHSL", question: "Alluvial soil is rich in which nutrient but poor in?", answer: "Rich in Potash; poor in Phosphorus" },
    ]
  },
}

// ── Groq API call ────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature:     0.7,
      max_tokens:      2048,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content
}

// ── Smart Note generation ────────────────────────────────────────
const SYSTEM_PROMPT = `You are CHANAKYA — India's most strategic SSC CGL mentor.
Your job: generate a smart note that makes a topic memorable, exam-ready, and genuinely fun to read.

Rules:
- story: 150-200 words. Set in historical/real context. NOT a textbook summary. Creates emotion or surprise. Must make aspirants feel the topic, not just remember it.
- core_concept: 80-120 words. Every sentence is exam-relevant. No filler.
- mnemonic: ONE memory trick — acronym, rhyme, or vivid association. Max 2 sentences.
- mindmap_json: Central topic with 3-5 main branches. Each branch has 2-4 leaf nodes. Keep labels short (1-4 words).
- key_facts: Exactly 5 bullet points. Each must be directly askable in SSC CGL. Start each with a number/year/article.
- common_traps: 3 things SSC examiners deliberately twist to fool aspirants. Be specific.

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`

async function generateNote(topicKey, topicDisplayName, section, category) {
  const data = PDF_CONTENT[topicKey]
  if (!data) {
    console.error(`❌  No content found for topic key: ${topicKey}`)
    return null
  }

  const pyqBlock = data.pyqs.length > 0
    ? `\nPREVIOUS YEAR QUESTIONS (SSC actually asked these):\n${
        data.pyqs.map(p => `${p.year} ${p.exam}: "${p.question}" → Answer: ${p.answer}`).join('\n')
      }`
    : ''

  const userPrompt = `
TOPIC: ${topicDisplayName}
SECTION: ${section}
CATEGORY: ${category}
${pyqBlock}

REFERENCE MATERIAL (from Parmar SSC Polity Notes + Pinnacle GS PYQ Bank):
${data.reference}

Generate the smart note JSON:
{
  "story": "...",
  "core_concept": "...",
  "mnemonic": "...",
  "mindmap_json": {
    "center": "${topicDisplayName}",
    "branches": [
      { "label": "Branch Name", "children": ["Child 1", "Child 2"] }
    ]
  },
  "key_facts": ["fact1", "fact2", "fact3", "fact4", "fact5"],
  "common_traps": ["trap1", "trap2", "trap3"]
}`

  console.log(`\n📖  Generating note: ${topicDisplayName}...`)

  try {
    const raw = await callGroq(SYSTEM_PROMPT, userPrompt)
    if (!raw) throw new Error('Empty Groq response')

    const parsed = JSON.parse(raw)

    // Validate
    if (!parsed.story || !parsed.core_concept || !parsed.mnemonic) {
      throw new Error('Missing required fields in Groq response')
    }

    const note = {
      topic:       topicDisplayName,
      section,
      category,
      slug:        topicKey,
      status:      'draft',
      generated_at: new Date().toISOString(),
      content:     parsed,
      pyq_refs:    data.pyqs,
    }

    // Save to file
    const outDir  = path.join(ROOT, 'data', 'smart-notes')
    const outPath = path.join(outDir, `${topicKey}.json`)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify(note, null, 2), 'utf-8')

    console.log(`  ✅  Saved: data/smart-notes/${topicKey}.json`)
    console.log(`  📝  Story preview: ${parsed.story?.substring(0, 80)}...`)
    console.log(`  🧠  Mnemonic: ${parsed.mnemonic}`)

    return note
  } catch (err) {
    console.error(`  ❌  Failed to generate "${topicDisplayName}": ${err.message}`)
    return null
  }
}

// ── Import to Supabase ───────────────────────────────────────────
async function importToSupabase(note) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey || serviceKey.includes('your')) {
    console.log('  ⚠️   Supabase keys not set — note saved to file only.')
    console.log('      To import to Supabase, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    return
  }

  const body = {
    topic:          note.topic,
    section:        note.section,
    category:       note.category,
    story:          note.content.story,
    core_concept:   note.content.core_concept,
    mnemonic:       note.content.mnemonic,
    mindmap_json:   note.content.mindmap_json,
    key_facts:      note.content.key_facts,
    common_traps:   note.content.common_traps,
    status:         'draft',
    version:        1,
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/smart_notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey':       serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer':       'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(body),
  })

  if (res.ok) {
    const row = await res.json()
    console.log(`  ✅  Imported to Supabase: id=${row[0]?.id}`)
  } else {
    const err = await res.text()
    console.error(`  ❌  Supabase import failed: ${err}`)
  }
}

// ── Main ─────────────────────────────────────────────────────────
const TOPICS = [
  // Polity
  { key: 'preamble',                  name: 'Preamble of India',                  section: 'gk', category: 'Polity' },
  { key: 'article_21',                name: 'Article 21 — Right to Life',          section: 'gk', category: 'Polity' },
  { key: 'supreme_court',             name: 'Supreme Court of India',              section: 'gk', category: 'Polity' },
  { key: 'emergency_provisions',      name: 'Emergency Provisions',                section: 'gk', category: 'Polity' },
  { key: 'constitutional_amendments', name: 'Constitutional Amendments',           section: 'gk', category: 'Polity' },
  { key: 'panchayati_raj',            name: 'Panchayati Raj — 73rd Amendment',     section: 'gk', category: 'Polity' },
  // Economy
  { key: 'rbi_monetary_policy',       name: 'RBI & Monetary Policy',               section: 'gk', category: 'Economy' },
  { key: 'budget_fiscal_policy',      name: 'Budget & Fiscal Policy',              section: 'gk', category: 'Economy' },
  // Science
  { key: 'vitamins_deficiency',       name: 'Vitamins & Deficiency Diseases',      section: 'gk', category: 'Science' },
  { key: 'newtons_laws_motion',       name: "Newton's Laws of Motion",             section: 'gk', category: 'Science' },
  { key: 'light_optics',              name: 'Light & Optics',                      section: 'gk', category: 'Science' },
  // History
  { key: 'chola_dynasty',             name: 'Chola Dynasty',                       section: 'gk', category: 'History' },
  { key: 'delhi_sultanate',           name: 'Delhi Sultanate',                     section: 'gk', category: 'History' },
  // Miscellaneous
  { key: 'classical_dances',          name: 'Classical Dances of India',           section: 'gk', category: 'Miscellaneous' },
  // Geography
  { key: 'himalayas',                 name: 'Himalayas — Mountain Ranges',         section: 'gk', category: 'Geography' },
  { key: 'indian_soils',              name: 'Soils of India',                      section: 'gk', category: 'Geography' },
]

async function main() {
  // Parse CLI args
  const args       = process.argv.slice(2)
  const topicArg   = args[args.indexOf('--topic')   + 1]
  const sectionArg = args[args.indexOf('--section') + 1]

  let targets = TOPICS
  if (topicArg) {
    targets = TOPICS.filter(t => t.name.toLowerCase().includes(topicArg.toLowerCase()) ||
                                  t.key.toLowerCase().includes(topicArg.toLowerCase()))
    if (targets.length === 0) {
      console.error(`❌  No topic matched "${topicArg}". Available:`)
      TOPICS.forEach(t => console.log(`    --topic "${t.key}"`))
      process.exit(1)
    }
  }
  if (sectionArg) {
    targets = targets.filter(t => t.section === sectionArg)
  }

  console.log(`\n🏛️  CHANAKYA SSC — Smart Note Generator`)
  console.log(`📚  Generating ${targets.length} note(s) from PDF content...`)
  console.log(`    Source 1: Parmar SSC Polity Complete Notes (705 pages)`)
  console.log(`    Source 2: Pinnacle GS Question Bank (6658 questions)`)
  console.log()

  const results = []
  for (const topic of targets) {
    const note = await generateNote(topic.key, topic.name, topic.section, topic.category)
    if (note) {
      results.push(note)
      await importToSupabase(note)
    }
    // Rate limit pause
    if (targets.indexOf(topic) < targets.length - 1) {
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  console.log(`\n═══════════════════════════════════════`)
  console.log(`✅  Generated ${results.length}/${targets.length} notes`)
  console.log(`📂  Files saved to: data/smart-notes/`)
  console.log()
  console.log(`Next steps:`)
  console.log(`  1. Review notes in data/smart-notes/*.json`)
  console.log(`  2. Visit /admin/notes/generate to publish them`)
  console.log(`  3. Use "Link Mock Questions" panel to connect to gate question IDs`)
  console.log(`  4. Publish → students see notes after getting linked questions wrong`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
