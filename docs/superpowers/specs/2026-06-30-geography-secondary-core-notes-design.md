# Geography Secondary-Core Smart Notes Design

## Objective

Add a second, exhaustive Geography layer to KAUTILYA IAS without replacing or
rewriting the 12 existing primary-core notes. The new layer will split broad
chapters into 24 exam-oriented notes that deepen process understanding, spatial
reasoning, map recall, prelims elimination, and mains answer construction.

## Source Boundary

The notes will be grounded in the Geography sources already extracted under
`tmp/pdfs/`:

- `static_physical_geography.txt`
- `static_indian_human_geography.txt`
- `pyq_geography.txt`

The static sources supply concepts, classifications, examples, and spatial
relationships. The PYQ source supplies recurring question patterns and exam
priority. Unsupported precision, fabricated quotations, and invented PYQ text
are prohibited. Time-sensitive figures will be avoided unless clearly
attributed and necessary.

## Relationship to the Primary Layer

Existing notes `local-geo-001` through `local-geo-012` remain unchanged. They
serve as chapter-level command maps. New notes `local-geo-013` through
`local-geo-036` serve as focused secondary-core modules.

Each new note must:

- have a narrower topic boundary than its parent primary note;
- explain mechanisms rather than merely repeat definitions;
- add spatial or regional comparison;
- include distinct prelims traps and mains uses;
- cross-connect physical, Indian, economic, or human geography where useful;
- remain independently readable.

## Topic Stack

### Physical and Applied Geography

1. Geological Time, Rocks and Mineral Formation
2. Plate Boundaries, Hotspots and Tectonic Landscapes
3. Earthquakes, Volcanoes and Tsunami Geography
4. Weathering, Mass Wasting and Slope Development
5. River Processes, Drainage Evolution and Fluvial Landforms
6. Karst, Glacial, Aeolian and Coastal Landscapes
7. Air Masses, Fronts and Temperate Weather Systems
8. Tropical Cyclones, Jet Streams and Extreme Weather
9. ENSO, IOD, MJO and Ocean-Atmosphere Teleconnections
10. Ocean Relief, Marine Resources and Coastal Processes

### Indian and Economic Geography

11. Himalayan Regional Geography and Fragility
12. Peninsular Plateau, Ghats and Deccan Landscapes
13. Indian Coasts, Islands, Straits and Maritime Geography
14. River Basins, Interlinking, Water Conflicts and Management
15. Indian Monsoon Variability and Regional Rainfall
16. Floods, Droughts, Landslides and Vulnerability Mapping
17. Soil Degradation, Watershed Management and Dryland Geography
18. Crop Geography, Agro-climatic Regions and Irrigation
19. Minerals, Industrial Location and Manufacturing Belts
20. Conventional and Renewable Energy Geography
21. Transport Corridors, Ports, Inland Waterways and Logistics

### Human and Regional Geography

22. Population Transition, Migration and Demographic Geography
23. Urbanisation, Settlement Systems and Regional Planning
24. World Mapping: Strategic Seas, Straits, Mountains, Rivers and Resource Regions

## Note Contract

Every file will conform to the current `SmartNote` JSON schema and preserve the
existing `upsc12` anatomy. Each note will include:

- issue story and precise core concept;
- six or more analytical dimensions;
- relevant constitutional or governance link where genuinely applicable;
- source declaration and PYQ-pattern summary;
- case study or spatial example;
- balanced arguments where the topic supports debate;
- a structured mains answer framework;
- mains examples and prelims facts;
- at least four revision prompts;
- mnemonic, mind map, key facts, and common traps;
- PYQ references described as patterns unless exact source text is verified;
- difficulty, read time, yield, publication, and version metadata.

The secondary layer will add depth through:

- cause-process-landform or cause-process-impact chains;
- region-to-feature and feature-to-region map cues;
- paired comparisons such as Himalayan versus Peninsular rivers;
- hazard, vulnerability, exposure, and resilience distinctions;
- location-factor logic for agriculture, industry, energy, and transport;
- diagrams that an aspirant can reproduce in a mains answer;
- multi-statement elimination rules for prelims.

## IDs, Files, and Metadata

- IDs: `local-geo-013` through `local-geo-036`
- Filenames: `local-geo-NNN-<descriptive-slug>.json`
- Section: `Geography`
- Source type: `uploaded-geography-static-pyq-secondary`
- Status: `published`
- Version: `1`
- Creation and update date: `2026-06-30T00:00:00+05:30`

Slugs and IDs must be unique across the complete Smart Notes library.

## Quality Controls

Before completion:

1. Parse every generated JSON file.
2. Validate required fields against the loader's expectations.
3. Detect duplicate IDs and slugs across all Smart Notes.
4. Confirm exactly 36 local Geography notes exist.
5. Search the new topics for accidental title or subtopic duplication.
6. Run the Smart Notes loader and verify Geography counts.
7. Run project type checking and tests.
8. Run a production build if the note-only verification and tests pass.

## Error Handling

If a source section is incomplete or extraction is noisy, the note will use
stable conceptual knowledge already supported elsewhere in the uploaded static
material and will avoid false page-level precision. If a field is inapplicable,
it will contain a concise, relevant governance connection rather than filler.
Generation errors will fail validation before any commit.

## Delivery

The 24 notes will be added in one coherent batch. Existing primary notes and
unrelated dirty application files will not be modified. Deployment and pushing
are separate actions unless explicitly requested after validation.
