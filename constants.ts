
import { Standard } from './types';

export const BIO_STANDARDS: Standard[] = [
  {
    id: '1A',
    title: 'Studying Life',
    description: 'Understand the foundations of biology, including the scientific method, characteristics of life, and cell theory.',
    keywords: ['1a', '1.a', 'studying life', 'scientific method', 'characteristics of life', 'cell theory', 'viruses', 'biotic', 'abiotic'],
    content: `All living things share key characteristics: they are organized (cells), grow/develop, have a metabolism (use energy), have genetic material (DNA), evolve, reproduce, respond to stimuli, and maintain homeostasis. Non-living things lack these (e.g., viruses, atoms, movement alone). Viruses are considered non-living because they lack cells, can't grow/reproduce without a host, and lack ribosomes. 
Cell Theory: Hooke (coined 'cell'), Leeuwenhoek (first living cells), Schleiden (plants), Schwann (animals), Virchow (cells come from cells). 
Organization: Cells -> Tissues -> Organs -> Organ Systems -> Organism.`
  },
  {
    id: '1B',
    title: 'Biochemistry',
    description: 'Examine the chemistry of life, specifically the structure and function of the four major macromolecules and enzymes.',
    keywords: ['1b', '1.b', 'biochemistry', 'macromolecules', 'carbohydrates', 'lipids', 'proteins', 'enzymes', 'nucleic acids'],
    content: `Macromolecules: 
1. Carbohydrates: Quick energy (glucose), structural support (cellulose), storage (starch, glycogen). Monomer: Monosaccharide (Ring/Chain). 
2. Lipids: Long-term energy, insulation, cell membranes (phospholipids). Insoluble (hydrophobic). Monomer: Glycerol/Fatty acids. 
3. Proteins: Enzymes, transport, structure (muscles). Monomer: Amino acid (CHON). Peptide bonds link them. 
4. Nucleic Acids: Store/transmit genetic info (DNA, RNA). Monomer: Nucleotide (Sugar, Phosphate, Base). 
Enzymes: Biological catalysts that speed up reactions by lowering activation energy. They are specific (lock and key) and reusable. Activity is affected by Temperature and pH; they can denature if conditions are not optimum.`
  },
  {
    id: '1C',
    title: 'Cells',
    description: 'Compare and contrast the structure and function of prokaryotic and eukaryotic cells, and their organelles.',
    keywords: ['1c', '1.c', 'cells', 'organelles', 'prokaryote', 'eukaryote', 'nucleus', 'mitochondria', 'ribosome', 'chloroplast'],
    content: `Cell Types: Prokaryotes (Bacteria) lack a nucleus and membrane-bound organelles; DNA is circular. Eukaryotes (Plants, Animals, Fungi, Protists) have a nucleus and complex organelles; DNA is linear. 
Organelles: 
- Nucleus: Control center (DNA). 
- Ribosomes: Make proteins. 
- Mitochondria: Power plant (Respiration/ATP). 
- Chloroplasts: Photosynthesis (Plants only). 
- Golgi: Packs/ships proteins. 
- Vacuoles: Storage (Large in plants). 
Plants have cell walls (cellulose) and chloroplasts; Animals have centrioles and lysosomes. Endosymbiotic Theory suggests mitochondria and chloroplasts were once free-living prokaryotes.`
  },
  {
    id: '1D',
    title: 'Cell Transport',
    description: 'Analyze how cells maintain homeostasis by moving materials through the cell membrane.',
    keywords: ['1d', '1.d', 'cell transport', 'diffusion', 'osmosis', 'passive transport', 'active transport', 'homeostasis'],
    content: `Cell Membrane: Selectively permeable phospholipid bilayer (Fluid Mosaic Model). Homeostasis is stable internal balance. 
Passive Transport (No Energy, High->Low): 
- Simple Diffusion: Small/nonpolar molecules. 
- Facilitated Diffusion: Uses proteins. 
- Osmosis: Diffusion of water. 
Solutions: Isotonic (Equal), Hypertonic (Water leaves, cell shrinks), Hypotonic (Water enters, cell swells/bursts). 
Active Transport (Uses ATP, Low->High): 
- Endocytosis: Taking in (Phagocytosis - eating, Pinocytosis - drinking). 
- Exocytosis: Releasing. 
- Protein Pumps: e.g., Sodium-Potassium pump.`
  },
  {
    id: '1E',
    title: 'Cell Reproduction',
    description: 'Understand the cell cycle, mitosis, and asexual reproduction.',
    keywords: ['1e', '1.e', 'cell reproduction', 'mitosis', 'cell cycle', 'cancer', 'asexual reproduction', 'checkpoints'],
    content: `Cell Cycle: Interphase (Longest - G1 growth, S DNA replication, G2 prep) followed by Mitosis. 
Mitosis (PMAT): Prophase (Chromosomes form), Metaphase (Line up in middle), Anaphase (Separate), Telophase (Two nuclei). Cytokinesis splits the cytoplasm (Cleavage furrow in animals, Cell plate in plants). 
Cancer: Uncontrolled cell division. Checkpoints (G1, G2, M) monitor for damage. Mutations in Proto-oncogenes (promote division) or Tumor Suppressor genes (slow division, e.g., p53) lead to tumors. 
Asexual Reproduction: Binary fission (bacteria), Budding (hydra), Vegetative propagation (plants), Regeneration. Offspring are genetically identical.`
  },
  {
    id: '2',
    title: 'Cell Energy',
    description: 'Explore how organisms obtain and use energy through photosynthesis and respiration.',
    keywords: ['2', 'cell energy', 'atp', 'photosynthesis', 'cellular respiration', 'fermentation', 'chloroplast', 'mitochondria'],
    content: `ATP (Adenosine Triphosphate): Energy currency. Energy is stored in the bond between the 2nd and 3rd phosphate. ATP $\rightarrow$ ADP + P releases energy. 
Photosynthesis (Chloroplast): $$6CO_2 + 6H_2O + \text{Light} \rightarrow C_6H_{12}O_6 + 6O_2$$ Stages: Light Dependent (Thylakoid - splits water) and Calvin Cycle (Stroma - builds sugar). 
Cellular Respiration (Mitochondria): $$C_6H_{12}O_6 + 6O_2 \rightarrow 6CO_2 + 6H_2O + \text{ATP}$$ Stages: Glycolysis (Cytoplasm, anaerobic), Krebs Cycle (Matrix), Electron Transport Chain (Inner membrane - most ATP). 
Fermentation (Anaerobic): Lactic Acid (Animal muscles, yogurt) or Alcoholic (Yeast, plants - produces $CO_2$).`
  },
  {
    id: '3A',
    title: 'Meiosis',
    description: 'Investigate how meiosis produces gametes and increases genetic variation.',
    keywords: ['3a', '3.a', 'meiosis', 'gametes', 'crossing over', 'genetic variation', 'mutation', 'karyotype'],
    content: `Meiosis: Produces 4 unique haploid (n) gametes (sex cells) from 1 diploid (2n) cell. Meiosis I separates homologous chromosomes; Meiosis II separates sister chromatids. 
Variation: 1. Crossing Over (Prophase I). 2. Independent Assortment (Metaphase I). 3. Random Fertilization (Sperm + Egg = Zygote). 
Mutations: Nondisjunction (failure to separate) leads to extra/missing chromosomes. Detected via Karyotypes (picture of chromosomes). Examples: Down Syndrome (Trisomy 21), Turner Syndrome (XO), Klinefelter's (XXY).`
  },
  {
    id: '3B',
    title: 'Genetics',
    description: 'Apply Mendelian genetics and analyze inheritance patterns.',
    keywords: ['3b', '3.b', 'genetics', 'punnett square', 'dominant', 'recessive', 'pedigree', 'codominance'],
    content: `Genetics Principles: Law of Dominance, Segregation, and Independent Assortment. 
Terms: Genotype (letters), Phenotype (trait), Homozygous (Pure), Heterozygous (Hybrid). 
Crosses: Monohybrid (1 trait), Dihybrid (2 traits - 9:3:3:1 ratio for heterozygotes). Test Cross: Cross dominant seen trait with recessive to find genotype. 
Complex Inheritance: 
- Incomplete Dominance: Blend (Red+White=Pink). 
- Codominance: Both show (Red+White=Red and White dots). 
- Multiple Alleles: Blood types (A, B, AB, O). 
- X-linked: On X chromosome; affects males more (Colorblindness, Hemophilia). 
Pedigrees: Family trees tracking traits.`
  },
  {
    id: '3C',
    title: 'DNA',
    description: 'Understand DNA structure, protein synthesis, and DNA technology.',
    keywords: ['3c', '3.c', 'dna', 'rna', 'protein synthesis', 'transcription', 'translation', 'mutation', 'dna technology'],
    content: `DNA: Double helix (CHOPN). Bases: A-T, G-C. Stores info for traits. 
Protein Synthesis: DNA -> mRNA (Transcription in nucleus) -> Protein (Translation at Ribosome). mRNA codon is read; tRNA brings amino acids based on anti-codon. 
Mutations: Gene mutations occur during S-phase. Point (Substitution) vs. Frameshift (Insertion/Deletion - changes reading frame, very harmful). Silent, Missense, Nonsense mutations. 
DNA Technology: 
- Gel Electrophoresis: DNA Fingerprint (Forensics/Paternity). 
- Recombinant DNA: Combining DNA from different species (Transgenic organisms, GMOs). 
- Cloning: Reproductive vs. Therapeutic. 
- Human Genome Project: Mapping human genes.`
  },
  {
    id: '4',
    title: 'Evolution',
    description: 'Analyze the mechanisms and evidence for evolution.',
    keywords: ['4', 'evolution', 'natural selection', 'darwin', 'homologous', 'vestigial', 'endosymbiotic', 'fossil record'],
    content: `Origins: Chemical evolution (Inorganic -> Organic) then organic evolution (First cells: Unicellular, Prokaryotic, Anaerobic, Heterotrophic). Endosymbiotic Theory: Mitochondria/Chloroplasts evolved from prokaryotes. 
Evidence: 1. Fossil Record (Relative/Radiometric dating). 2. Homologous Structures (Same structure, different use - Common ancestor). 3. Vestigial Structures (Useless remnants). 4. Sequence Homology (DNA/Protein similarity). 
Natural Selection (Darwin): Overproduction, Variation, Competition -> Survival of the Fittest (best adapted reproduce). 
Speciation: New species form due to isolation (Geographic, Behavioral, Temporal).`
  },
  {
    id: '5',
    title: 'Ecology',
    description: 'Examine interactions between organisms and their environment.',
    keywords: ['5', 'ecology', 'food web', 'ecosystem', 'succeession', 'energy flow', 'biogeochemical cycles', 'greenhouse effect'],
    content: `Organization: Organism -> Population -> Community -> Ecosystem -> Biome -> Biosphere. 
Cycles: 
- Water: Evaporation, Transpiration (from plants), Precipitation. 
- Carbon: Photosynthesis removes CO2; Respiration/Combustion adds CO2. Global warming caused by rising CO2. 
- Nitrogen/Phosphorus: Runoff causes Eutrophication (algae blooms). 
Energy: 10% Rule (90% lost as heat). Pyramid: Producers (most energy) -> Primary -> Secondary -> Top Consumer (least energy). 
Relationships: Mutualism (+/+), Commensalism (+/0), Parasitism (+/-), Mimicry. 
Succession: Primary (bare rock, lichen pioneer) vs. Secondary (soil survives, ends in Climax Community).`
  }
];

