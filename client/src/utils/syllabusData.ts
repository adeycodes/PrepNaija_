import {
  Calculator,
  FlaskConical,
  Atom,
  BookText,
  Dna
} from "lucide-react";

// Type Definitions
export type Topic = {
  id: string;
  title: string;
  subtopics: string[];
  objectives: string[];
};

export type Section = {
  id: string;
  title: string;
  topics: Topic[];
};

export type SubjectData = {
  icon: any;
  color: string;
  sections: Section[];
};

export type SubjectName = "Biology" | "Chemistry" | "Mathematics" | "Physics" | "Use of English";

// COMPLETE JAMB SYLLABUS - ALL CONTENT FROM YOUR ORIGINAL FILE
export const JAMB_SYLLABUS: Record<SubjectName, SubjectData> = {
  Biology: {
    icon: Dna,
    color: "from-emerald-500 to-teal-600",
    sections: [
      {
        id: "variety-organisms",
        title: "A: Variety of Organisms",
        topics: [
          {
            id: "living-organisms",
            title: "Living Organisms",
            subtopics: [
              "Characteristics of living and non-living things",
              "Cell structure and functions of cell components",
              "Levels of organization: Cell (e.g., Euglena and Paramecium)",
              "Tissue (e.g., epithelial tissues and Hydra)",
              "Organ (e.g., onion bulb)",
              "Systems (e.g., reproductive, digestive and excretory)",
              "Organisms (e.g., Chlamydomonas)"
            ],
            objectives: [
              "Differentiate between characteristics of living and non-living things",
              "Identify structures of plant and animal cells",
              "Analyze functions of components of plant and animal cells",
              "Compare and contrast structure of plant and animal cells",
              "Trace the levels of organization among organisms in logical sequence"
            ]
          },
          {
            id: "evolution-organisms",
            title: "Evolution Among Organisms",
            subtopics: [
              "Monera (prokaryotes): Bacteria and blue-green algae",
              "Protista: Amoeba, Euglena and Paramecium",
              "Fungi: Mushroom and Rhizopus",
              "Plantae: Thallophyta (Spirogyra), Bryophyta (mosses and liverworts)",
              "Plantae: Pteridophyta (ferns), Spermatophyta (Gymnosperms and Angiosperms)",
              "Animalia (Invertebrates): Coelenterates, Platyhelminthes, Nematoda, Annelida, Arthropoda, Mollusca",
              "Animalia (Vertebrates): Pisces, Amphibia, Reptilia, Aves, Mammalia"
            ],
            objectives: [
              "Analyze external features and characteristics of listed organisms",
              "Demonstrate increase in structural complexity",
              "Trace stages in life histories of listed organisms",
              "Demonstrate gradual transition from water to land life",
              "Trace evolution of listed plants",
              "Trace advancement of invertebrate and vertebrate animals",
              "Determine economic importance of insects studied",
              "Assess their values to the environment"
            ]
          },
          {
            id: "adaptations",
            title: "Structural/Functional and Behavioural Adaptations",
            subtopics: [
              "Adaptive colouration and its functions",
              "Behavioural adaptations in social animals",
              "Structural adaptations for:",
              "- Obtaining food (beaks and legs of birds, mouthparts of insects)",
              "- Protection and defence (stick insects, praying mantis, toad)",
              "- Securing mates (Agama lizards, display of feathers by birds)",
              "- Regulating body temperature (skin, feathers, hairs)",
              "- Conserving water (spines in plants, scales in mammals)"
            ],
            objectives: [
              "Describe how structures, functions and behaviour adapt organisms to environment",
              "Categorize countershading in fish, toads, snakes and warning colouration in mushrooms",
              "Differentiate castes in social insects like termites and their functions",
              "Account for basking in lizards, hibernation and aestivation"
            ]
          }
        ]
      },
      {
        id: "form-functions",
        title: "B: Form and Functions",
        topics: [
          {
            id: "internal-structure",
            title: "Internal Structure of Plants and Animals",
            subtopics: [
              "Internal structure of flowering plant: Root, Stem, Leaf",
              "Internal structure of a mammal",
              "Supporting tissues in plants: collenchyma, sclerenchyma, xylem and phloem fibres"
            ],
            objectives: [
              "Identify transverse sections of plant organs",
              "Relate structure of organs to their functions",
              "Identify supporting tissues in plants",
              "Describe distribution of supporting tissues in roots, stem and leaf",
              "Examine arrangement of mammalian internal organs",
              "Describe appearance and position of digestive, reproductive and excretory organs"
            ]
          },
          {
            id: "nutrition",
            title: "Nutrition",
            subtopics: [
              "Modes of nutrition: Autotrophic and Heterotrophic",
              "Types of Nutrition",
              "Plant nutrition: Photosynthesis, Chemosynthesis, Mineral requirements",
              "Animal nutrition:",
              "- Classes of food substances: carbohydrates, proteins, fats and oils, vitamins, mineral salts, water",
              "- Food tests: starch, reducing sugar, protein, oil, fat",
              "- Mammalian tooth: structures, types and functions",
              "- Mammalian alimentary canal",
              "- Nutrition process: ingestion, digestion, absorption, assimilation"
            ],
            objectives: [
              "Compare autotrophic and heterotrophic modes of nutrition",
              "Provide examples from flowering and non-flowering plants",
              "Compare photosynthetic and chemosynthetic modes of nutrition",
              "Differentiate heterotrophic feeding: holozoic, parasitic, saprophytic, carnivorous plants",
              "Differentiate light and dark reactions of photosynthesis",
              "Determine necessity of light, carbon dioxide and chlorophyll in photosynthesis",
              "Detect presence of starch in leaf as evidence of photosynthesis",
              "Identify macro-and micro-elements required by plants",
              "Recognize deficiency symptoms of nitrogen, phosphorus and potassium",
              "Indicate sources of various classes of food",
              "Determine nutritional value of food",
              "Relate importance and deficiency of each class of food",
              "Determine importance of balanced diet",
              "Detect presence of food type from experiment results",
              "Describe structure of typical mammalian tooth",
              "Differentiate types of mammalian tooth and relate structures to functions",
              "Compare dental formulae of man, sheep and dog",
              "Relate structure of alimentary canal and accessory organs to functions",
              "Identify general characteristics of digestive enzymes",
              "Associate enzymes with digestion of carbohydrates, proteins and fats",
              "Determine end products of these classes of food"
            ]
          },
          {
            id: "transport",
            title: "Transport",
            subtopics: [
              "Need for transportation",
              "Materials for transportation: Excretory products, gases, manufactured food, digested food, nutrients, water, hormones",
              "Channels for transportation: Mammalian circulatory system, Plant vascular system",
              "Media and processes of mechanism for transportation"
            ],
            objectives: [
              "Determine relationship between size/complexity and need for transport system",
              "Determine sources of materials and forms in which they are transported",
              "Describe general circulatory system",
              "Compare specific functions of hepatic portal vein, pulmonary vein and artery, aorta, renal artery and vein",
              "Identify organs of plant vascular system",
              "Understand specific functions of phloem and xylem",
              "Identify media of transportation: cytoplasm, cell sap, body fluid, blood, lymph",
              "State composition and functions of blood and lymph",
              "Describe diffusion, osmosis, plasmolysis and turgidity as transportation mechanisms",
              "Compare open circulatory systems, transpiration pull, root pressure and active transport"
            ]
          },
          {
            id: "respiration",
            title: "Respiration",
            subtopics: [
              "Respiratory organs and surfaces",
              "Mechanism of gaseous exchange in plants and animals",
              "Aerobic respiration",
              "Anaerobic respiration"
            ],
            objectives: [
              "Explain significance of respiration",
              "Describe simplified outline of glycolysis and Krebs cycle with ATP production",
              "Deduce gaseous exchange and heat energy production from experimental setup",
              "Describe respiratory organs: body surface, gill, trachea, lungs, stomata, lenticel",
              "Describe mechanism for opening and closing of stomata",
              "Determine respiratory mechanisms in plants and animals",
              "Examine role of oxygen in energy liberation",
              "Explain effect of insufficient oxygen supply to muscles",
              "Use yeast cells and sugar solution to demonstrate fermentation",
              "State economic importance of yeasts"
            ]
          },
          {
            id: "excretion",
            title: "Excretion",
            subtopics: [
              "Types of excretory structures: contractile vacuole, flame cell, nephridium, Malpighian tubule, kidney, stoma, lenticel",
              "Excretory mechanisms: Kidneys, lungs, skin",
              "Excretory products of plants"
            ],
            objectives: [
              "Define meaning and state significance of excretion",
              "Relate characteristics of each structure with functions",
              "Relate structure of kidneys to excretory and osmo-regulatory functions",
              "Identify functions and excretory products of lungs and skin",
              "Deduce economic importance of plant excretory products"
            ]
          },
          {
            id: "support-movement",
            title: "Support and Movement",
            subtopics: [
              "Tropic, tactic, nastic and sleep movements in plants",
              "Supporting tissues in animals",
              "Types and functions of skeleton: Exoskeleton, Endoskeleton"
            ],
            objectives: [
              "Determine need for support and movement in organisms",
              "Identify supporting tissues in plants",
              "Describe distribution of supporting tissues in root, stem and leaf",
              "Relate plant responses to stimuli of light, water, gravity and touch",
              "Identify regions of growth in roots and shoots and roles of auxins in tropism",
              "Relate location of chitin, cartilage and bone to supporting function",
              "Relate structure of mammalian skeleton to supportive, locomotive and respiratory functions",
              "Differentiate types of joints using appropriate examples",
              "Apply protective, supportive, locomotive and respiratory functions of skeleton"
            ]
          },
          {
            id: "reproduction",
            title: "Reproduction",
            subtopics: [
              "Asexual reproduction: Fission (Paramecium), Budding (yeast), Natural vegetative propagation, Artificial vegetative propagation",
              "Sexual reproduction in flowering plants: Floral parts and functions, Pollination and fertilization, Products",
              "Reproduction in mammals: Structures and functions of reproductive organs, Fertilization and development"
            ],
            objectives: [
              "Differentiate between asexual and sexual reproduction",
              "Apply natural vegetative propagation in crop production",
              "Apply grafting, budding and layering in agriculture",
              "Relate parts of flower to functions and reproductive process",
              "State advantages of cross pollination",
              "Deduce types of placentation developing into fruits",
              "Differentiate male and female reproductive organs",
              "Relate structure and function to production of offspring",
              "Describe fusion of gametes as fertilization process",
              "Relate effects of mother's health, nutrition and drug use on embryo development",
              "Explain modern methods of regulating reproduction (in-vitro fertilization, birth control)"
            ]
          },
          {
            id: "growth",
            title: "Growth",
            subtopics: [
              "Meaning of growth",
              "Germination of seeds and conditions necessary for germination"
            ],
            objectives: [
              "Apply knowledge of conditions necessary for germination on plant growth",
              "Differentiate between epigeal and hypogeal germination"
            ]
          },
          {
            id: "coordination-control",
            title: "Co-ordination and Control",
            subtopics: [
              "Nervous coordination: CNS, PNS, impulse transmission, reflex action",
              "Sense organs: Skin, Nose, Tongue, Eye, Ear",
              "Hormonal control: Animal hormonal system, Plant hormones",
              "Homeostasis: Body temperature regulation, Salt and water regulation"
            ],
            objectives: [
              "Apply knowledge of CNS structure and function in coordination",
              "Illustrate reflex actions like blinking, knee jerk",
              "Differentiate between reflex, voluntary actions and conditioned reflexes",
              "Relate sense organs to their functions",
              "Apply knowledge of sense organ structure to detect and correct defects",
              "State location of endocrine glands in animals",
              "Relate hormones to their functions",
              "Examine effects of phytohormones on growth, tropism, flowering, fruit ripening",
              "Relate function of hormones in homeostasis"
            ]
          }
        ]
      },
      {
        id: "ecology",
        title: "C: Ecology",
        topics: [
          {
            id: "factors-distribution",
            title: "Factors Affecting Distribution of Organisms",
            subtopics: [
              "Abiotic factors: temperature, rainfall, humidity, wind, altitude, salinity, turbidity, pH, soil conditions",
              "Biotic factors: activities of plants/animals (particularly human)"
            ],
            objectives: [
              "Relate effects of abiotic factors on distribution of organisms",
              "Use equipment to measure abiotic factors",
              "Describe how activities affect distribution of organisms"
            ]
          },
          {
            id: "symbiotic-interactions",
            title: "Symbiotic Interactions and Energy Flow",
            subtopics: [
              "Energy flow in ecosystem: food chains, food webs, trophic levels",
              "Nutrient cycling: carbon cycle, water cycle, nitrogen cycle"
            ],
            objectives: [
              "Determine appropriate examples of symbiosis, parasitism, saprophytism, commensalism, mutualism, amensalism, competition, predation, cooperation",
              "Explain distribution of organisms with food chains and webs",
              "Define chains and webs",
              "Describe carbon cycle and its significance including atmospheric balance and global warming",
              "Assess effects of water cycle on other nutrient cycles",
              "Relate roles of bacteria and leguminous plants in nitrogen cycling"
            ]
          },
          {
            id: "natural-habitats",
            title: "Natural Habitats",
            subtopics: [
              "Aquatic: ponds, streams, lakes, seashores, mangrove swamps",
              "Terrestrial/arboreal: tree-tops, abandoned farmland, savanna fields, burrows"
            ],
            objectives: [
              "Associate plants and animals with each habitat",
              "Relate adaptive features to habitats"
            ]
          },
          {
            id: "local-biomes",
            title: "Local (Nigerian) Biomes",
            subtopics: [
              "Tropical rainforest",
              "Guinea savanna (southern and northern)",
              "Sudan Savanna",
              "Desert",
              "Highlands of montane forests and grasslands"
            ],
            objectives: [
              "Locate biomes in regions",
              "Apply knowledge of biome features to determine characteristics of Nigerian regions"
            ]
          },
          {
            id: "population-ecology",
            title: "Ecology of Populations",
            subtopics: [
              "Population density and overcrowding",
              "Adaptation for survival: competition factors, intra- and inter-specific competition",
              "Factors affecting population sizes: biotic and abiotic",
              "Ecological succession: primary and secondary"
            ],
            objectives: [
              "Determine reasons for rapid human population changes and consequences of overcrowding",
              "Compute/calculate density as number of organisms per unit area",
              "Relate population increase, diseases, food/space shortage with competition",
              "Determine niche differentiation to reduce intra-specific competition",
              "Relate competition to succession",
              "Deduce effect of factors on population size",
              "Determine interactions between biotic and abiotic factors",
              "Trace sequence in succession to climax stage"
            ]
          },
          {
            id: "soil",
            title: "Soil",
            subtopics: [
              "Characteristics of soil types: sandy, loamy, clayey",
              "Components of soil: inorganic, organic, organisms, air, water",
              "Soil fertility: loss, renewal and maintenance"
            ],
            objectives: [
              "Identify physical properties of different soil types",
              "Determine amounts of air, water, humus and capillarity experimentally",
              "Relate soil characteristics to healthy plant growth",
              "Relate factors affecting soil fertility",
              "Apply soil conservation practices"
            ]
          },
          {
            id: "humans-environment",
            title: "Humans and Environment",
            subtopics: [
              "Diseases: common, endemic, transmissible diseases",
              "Pollution and its control: sources, types, effects, methods",
              "Sanitation and sewage",
              "Conservation of Natural Resources",
              "Game reserves and National parks"
            ],
            objectives: [
              "Identify ecological conditions favouring disease spread",
              "Relate biology of disease vectors to spread and control",
              "Use knowledge of causative organisms, transmission, symptoms for prevention/treatment",
              "Apply principles of inoculation and vaccination",
              "Categorize pollution into air, water and soil",
              "Relate effects of pollutants to health and environment",
              "Determine control methods for pollutants",
              "Explain importance of sanitation and hygiene",
              "Assess roles of health agencies",
              "Apply conservation methods for renewable and non-renewable resources",
              "Outline benefits of conservation and desertification prevention",
              "Identify conservation bodies at national and international levels",
              "Identify location and importance of game reserves and national parks in Nigeria"
            ]
          }
        ]
      },
      {
        id: "heredity-variations",
        title: "D: Heredity and Variations",
        topics: [
          {
            id: "variation-population",
            title: "Variation In Population",
            subtopics: [
              "Morphological variations: size, colour, fingerprints",
              "Physiological variation: tongue rolling, PTC tasting, blood groups",
              "Application in crime detection, blood transfusion, paternity determination"
            ],
            objectives: [
              "Differentiate between continuous and discontinuous variations",
              "Relate role of environment, habitat and genetics to variation",
              "Measure heights and weights of same age group",
              "Plot graphs of frequency distribution",
              "Observe and record colour patterns in plants and animals",
              "Apply fingerprint classification in identity detection",
              "Identify physiological variation examples",
              "Categorize people according to physiological variation",
              "Apply knowledge of blood groups in transfusion and paternity",
              "Use discontinuous variation in crime detection"
            ]
          },
          {
            id: "heredity",
            title: "Heredity",
            subtopics: [
              "Inheritance of characters: heritable and non-heritable",
              "Chromosomes - basis of heredity: structure, transmission",
              "Probability in genetics and sex determination",
              "Application of heredity principles in agriculture and medicine",
              "Sex-linked characters"
            ],
            objectives: [
              "Determine heritable and non-heritable characters",
              "Illustrate simple structure of DNA",
              "Illustrate segregation and recombination of genes",
              "Deduce segregation during gamete formation and random recombination",
              "Analyze cross-breeding experiment data",
              "Apply heredity principles in crop and livestock breeding",
              "Deduce advantages and disadvantages of out-breeding and in-breeding",
              "Analyze issues of GMO, gene therapy and biosafety",
              "Apply heredity knowledge in marriage counselling",
              "Describe significance of recombinant DNA in medical products",
              "Identify sex-linked characters"
            ]
          }
        ]
      },
      {
        id: "evolution",
        title: "E: Evolution",
        topics: [
          {
            id: "theories-evolution",
            title: "Theories of Evolution",
            subtopics: [
              "Lamarck's theory",
              "Darwin's theory",
              "Organic theory"
            ],
            objectives: [
              "Relate organic evolution as sum of adaptive changes",
              "Explain contributions of Lamarck and Darwin",
              "State evidences in support of organic evolution"
            ]
          },
          {
            id: "evidence-evolution",
            title: "Evidence of Evolution",
            subtopics: [
              "Fossil records",
              "Comparative anatomy, physiology and embryology",
              "Genetic studies and mutation"
            ],
            objectives: [
              "Mention evidences for evolution",
              "Trace evolutionary trends in plants and animals",
              "State evidence from modern evolutionary theories"
            ]
          }
        ]
      }
    ]
  },

  Chemistry: {
    icon: FlaskConical,
    color: "from-orange-500 to-red-600",
    sections: [
      {
        id: "separation-mixtures",
        title: "1. Separation of Mixtures and Purification",
        topics: [
          {
            id: "pure-impure",
            title: "Pure and Impure Substances",
            subtopics: [
              "Pure and impure substances",
              "Boiling and melting points",
              "Elements, compounds and mixtures",
              "Chemical and physical changes",
              "Separation processes: Evaporation, distillation, sublimation, filtration",
              "Crystallization, paper and column chromatography",
              "Simple and fractional crystallization, magnetization, decantation"
            ],
            objectives: [
              "Distinguish between pure and impure substances",
              "Use boiling and melting points as criteria for purity",
              "Distinguish between elements, compounds and mixture",
              "Differentiate between chemical and physical changes",
              "Identify properties of components of mixtures",
              "Specify principles involved in separation methods",
              "Apply basic principles of separation processes in everyday life"
            ]
          }
        ]
      },
      {
        id: "chemical-combination",
        title: "2. Chemical Combination",
        topics: [
          {
            id: "laws-chemical",
            title: "Laws of Chemical Combination",
            subtopics: [
              "Laws of definite, multiple and reciprocal proportions",
              "Law of conservation of matter",
              "Gay Lussac's law of combining volumes",
              "Avogadro's law",
              "Chemical symbols, formulae, equations and their uses",
              "Relative atomic mass based on 12C=12",
              "Mole concept and Avogadro's number",
              "Stoichiometry of reactions"
            ],
            objectives: [
              "Perform simple calculations involving formulae, equations and chemical composition",
              "Apply mole concept in calculations",
              "Deduce chemical laws from given expressions/statements/data",
              "Interpret graphical representations related to these laws",
              "Deduce stoichiometry of chemical reactions"
            ]
          }
        ]
      },
      {
        id: "kinetic-theory",
        title: "3. Kinetic Theory of Matter and Gas Laws",
        topics: [
          {
            id: "gas-laws",
            title: "Kinetic Theory and Gas Laws",
            subtopics: [
              "Phenomena supporting kinetic theory: melting, vaporization, boiling, freezing, condensation",
              "Brownian movement and molecular motion",
              "Laws of Boyle, Charles, Graham and Dalton (partial pressure)",
              "Combined gas law, molar volume and atomicity of gases",
              "Ideal gas equation (PV = nRT)",
              "Relationship between vapour density and relative molecular mass"
            ],
            objectives: [
              "Apply kinetic theory to distinguish between solids, liquids and gases",
              "Deduce reasons for change of state",
              "Draw inferences based on molecular motion",
              "Deduce gas laws from given expressions/statements",
              "Interpret graphical representations related to gas laws",
              "Perform calculations based on gas laws, equations and relationships"
            ]
          }
        ]
      },
      {
        id: "atomic-structure",
        title: "4. Atomic Structure and Bonding",
        topics: [
          {
            id: "atoms-structure",
            title: "Atomic Structure",
            subtopics: [
              "Concept of atoms, molecules and ions",
              "Works of Dalton, Millikan, Rutherford, Moseley, Thompson and Bohr",
              "Atomic structure, electron configuration, atomic number, mass number and isotopes",
              "Shapes of s and p orbitals",
              "Periodic table and periodicity of elements",
              "Ionization energy, ionic radii, electron affinity and electronegativity",
              "Chemical bonding: electrovalency, covalency, hydrogen bonding, metallic bonding",
              "Coordinate bonds and complex ions",
              "Van der Waals' forces",
              "Shapes of simple molecules: linear, non-linear, tetrahedral, pyramidal",
              "Nuclear chemistry: radioactivity, nuclear reactions, uses of radioactivity"
            ],
            objectives: [
              "Distinguish between atoms, molecules and ions",
              "Identify contributions of scientists to atomic structure development",
              "Deduce number of protons, neutrons and electrons from atomic/mass numbers",
              "Apply rules for electron arrangement in atoms",
              "Identify common elements exhibiting isotopy",
              "Relate isotopy to mass number",
              "Perform calculations relating to isotopy",
              "Differentiate between shapes of orbitals",
              "Determine number of electrons in s and p atomic orbitals",
              "Relate atomic number to position on periodic table",
              "Identify reasons for variation in properties across periods and down groups",
              "Differentiate between types of bonding",
              "Deduce bond types based on electron configurations",
              "Relate nature of bonding to properties of compounds",
              "Differentiate between various shapes of molecules",
              "Distinguish between ordinary chemical reactions and nuclear reactions",
              "Differentiate between natural and artificial radioactivity",
              "Compare properties of different types of nuclear radiations",
              "Compute calculations on half-life of radioactive materials",
              "Balance simple nuclear equations",
              "Identify applications of radioactivity"
            ]
          }
        ]
      },
      {
        id: "acids-bases",
        title: "7. Acids, Bases and Salts",
        topics: [
          {
            id: "acids-properties",
            title: "Acids, Bases and Salts",
            subtopics: [
              "General characteristics, properties and uses of acids, bases and salts",
              "Acids/base indicators, basicity of acids",
              "Normal, acidic, basic and double salts",
              "Acid definition: substance furnishing H3O+ ions or proton donor",
              "Naturally occurring organic acids: ethanoic, citric, tartaric acids",
              "Preparation of salts: neutralization, precipitation, action of acids on metals",
              "Oxides and trioxocarbonate(IV) salts",
              "Qualitative comparison of conductance of strong and weak acids/bases",
              "pH and pOH scale",
              "Acid/base titrations",
              "Hydrolysis of salts: NH4Cl, AlCl3, Na2CO3, CH3COONa"
            ],
            objectives: [
              "Distinguish between properties of acids and bases",
              "Identify different types of acids and bases",
              "Determine basicity of acids",
              "Differentiate between acidity and alkalinity using indicators",
              "Identify various methods of preparation of salts",
              "Classify different types of salts",
              "Relate degree of dissociation to strength of acids and bases",
              "Relate degree of dissociation to conductance",
              "Perform calculations on pH and pOH",
              "Identify appropriate acid-base indicators",
              "Interpret graphical representation of titration curves",
              "Perform calculations based on mole concept",
              "Balance equations for hydrolysis of salts",
              "Deduce properties (acidic, basic, neutral) of resultant solutions"
            ]
          }
        ]
      },
      {
        id: "organic-compounds",
        title: "14. Organic Compounds",
        topics: [
          {
            id: "organic-intro",
            title: "Introduction to Organic Compounds",
            subtopics: [
              "Tetravalency of carbon",
              "General formula, IUPAC nomenclature",
              "Determination of empirical formula",
              "Aliphatic hydrocarbons: alkanes, alkenes, alkynes",
              "Homologous series and physical properties",
              "Substitution reactions, halogenated products",
              "Isomerism: structural only (up to 6 carbon atoms)",
              "Petroleum: composition, fractional distillation, major products",
              "Cracking and reforming, petrochemicals",
              "Octane number and petrol quality",
              "Alkenes: structural and geometric isomerism",
              "Addition and polymerization reactions",
              "Polythene, synthetic rubber, vulcanization",
              "Alkynes: ethyne production from carbides",
              "Properties and reactions of ethyne",
              "Aromatic hydrocarbons: benzene structure, properties, uses",
              "Alkanols: primary, secondary, tertiary",
              "Ethanol production by fermentation and from petroleum",
              "Local fermentation examples: gin from palm wine",
              "Glycerol as polyhydric alkanol",
              "Reactions of OH group, oxidation tests (Lucas test)",
              "Alkanals and alkanones: chemical tests for distinction",
              "Alkanoic acids: neutralization, esterification",
              "Ethanedioic (oxalic) acid as dicarboxylic acid",
              "Benzene carboxylic acid as aromatic acid",
              "Alkanoates: formation from alkanoic acids and alkanols",
              "Fats and oils as alkanoates",
              "Saponification: soap and margarine production",
              "Distinction between detergents and soaps",
              "Amines (alkanamines): primary, secondary, tertiary",
              "Carbohydrates: mono-, di-, polysaccharides",
              "Chemical tests for simple sugars",
              "Reaction with concentrated H2SO4",
              "Hydrolysis of complex sugars: cellulose, starch",
              "Uses in alcoholic beverages, pharmaceuticals, textiles",
              "Proteins: primary structures, hydrolysis",
              "Tests: Ninhydrin, Biuret, Millon's, xanthoproteic",
              "Enzymes and their functions",
              "Polymers: natural and synthetic rubber",
              "Addition and condensation polymerization",
              "Methods of preparation, examples and uses",
              "Thermoplastic and thermosetting plastics"
            ],
            objectives: [
              "Derive names of organic compounds from general formulae",
              "Relate name of compound to its structure",
              "Relate tetravalency to catenation",
              "Classify compounds according to functional groups",
              "Derive empirical and molecular formula from given data",
              "Relate structure/functional groups to specific properties",
              "Derive various isomeric forms from given formula",
              "Distinguish between types of isomerism",
              "Classify various types of hydrocarbons",
              "Distinguish each class by their properties",
              "Specify uses of various hydrocarbons",
              "Identify crude oil as complex hydrocarbon mixture",
              "Relate fractions to properties and uses",
              "Relate transformation processes to quality improvement",
              "Distinguish between polymerization processes",
              "Specify processes in vulcanization",
              "Specify chemical tests for terminal alkynes",
              "Distinguish between aliphatic and aromatic hydrocarbons",
              "Relate benzene properties to structure",
              "Compare various classes of alkanols",
              "Determine processes in ethanol production",
              "Examine ethanol as alternative energy source",
              "Distinguish various classes of alkanols",
              "Differentiate between alkanals and alkanones",
              "Compare types of alkanoic acids",
              "Identify natural sources of alkanoates",
              "Specify methods for soap, detergent, margarine production",
              "Distinguish between detergent and soap",
              "Compare classes of alkanamines",
              "Identify natural sources of carbohydrates",
              "Compare classes of carbohydrates",
              "Infer products of hydrolysis and dehydration",
              "Determine uses of carbohydrates",
              "Specify tests for simple sugars",
              "Identify basic structure of proteins",
              "Specify methods and products of hydrolysis",
              "Specify various tests for proteins",
              "Distinguish between natural and synthetic polymers",
              "Differentiate addition and condensation polymerization",
              "Classify natural/commercial polymers and uses",
              "Distinguish thermoplastics and thermosetting plastics"
            ]
          }
        ]
      }
    ]
  },

  Mathematics: {
    icon: Calculator,
    color: "from-blue-500 to-indigo-600",
    sections: [
      {
        id: "number-numeration",
        title: "I. Number and Numeration",
        topics: [
          {
            id: "number-bases",
            title: "Number Bases",
            subtopics: [
              "Operations in different number bases from 2 to 10",
              "Conversion from one base to another including fractional parts",
              "Modulo arithmetic"
            ],
            objectives: [
              "Perform four basic operations (+, -, ×, ÷) in different bases",
              "Convert one base to another",
              "Perform operations in modulo arithmetic"
            ]
          },
          {
            id: "fractions-decimals",
            title: "Fractions, Decimals, Approximations and Percentages",
            subtopics: [
              "Fractions and decimals",
              "Significant figures and decimal places",
              "Percentage errors",
              "Simple interest, profit and loss percent",
              "Ratio, proportion and rate",
              "Shares and valued added tax (VAT)"
            ],
            objectives: [
              "Perform basic operations on fractions and decimals",
              "Express to specified number of significant figures and decimal places",
              "Calculate simple interest, profit and loss percent",
              "Solve problems involving ratio, proportion, rate and percentage error",
              "Solve problems involving share and VAT"
            ]
          },
          {
            id: "indices-logs",
            title: "Indices, Logarithms and Surds",
            subtopics: [
              "Laws of indices",
              "Equations involving indices",
              "Standard form",
              "Laws of logarithm",
              "Logarithm of any positive number to a given base",
              "Change of bases in logarithm and application",
              "Relationship between indices and logarithm",
              "Surds: simplification and rationalization"
            ],
            objectives: [
              "Apply laws of indices in calculation",
              "Establish relationship between indices and logarithms",
              "Solve equations involving indices",
              "Solve problems in different bases in logarithms",
              "Simplify and rationalize surds",
              "Perform basic operations on surds"
            ]
          },
          {
            id: "sets",
            title: "Sets",
            subtopics: [
              "Types of sets: empty, universal, complements, subsets, finite, infinite, disjoint",
              "Algebra of sets",
              "Venn diagrams and applications",
              "Cardinality of sets"
            ],
            objectives: [
              "Identify types of sets",
              "Solve problems involving cardinality of sets",
              "Solve set problems using symbols",
              "Use Venn diagrams to solve problems involving not more than 3 sets"
            ]
          }
        ]
      },
      {
        id: "algebra",
        title: "II. Algebra",
        topics: [
          {
            id: "polynomials",
            title: "Polynomials",
            subtopics: [
              "Change of subject of formula",
              "Multiplication and division of polynomials",
              "Factorization of polynomials of degree not exceeding 3",
              "Roots of polynomials not exceeding degree 3",
              "Factor and remainder theorems",
              "Simultaneous equations: one linear, one quadratic",
              "Graphs of polynomials of degree not greater than 3"
            ],
            objectives: [
              "Find subject of formula of given equation",
              "Apply factor and remainder theorem to factorize expressions",
              "Multiply, divide polynomials of degree not more than 3",
              "Factorize by regrouping difference of two squares, perfect squares, cubic expressions",
              "Solve simultaneous equations: one linear, one quadratic",
              "Interpret graphs of polynomials including maximum/minimum values"
            ]
          },
          {
            id: "variation",
            title: "Variation",
            subtopics: [
              "Direct variation",
              "Inverse variation",
              "Joint variation",
              "Partial variation",
              "Percentage increase and decrease"
            ],
            objectives: [
              "Solve problems involving direct, inverse, joint and partial variations",
              "Solve problems on percentage increase and decrease in variation"
            ]
          },
          {
            id: "inequalities",
            title: "Inequalities",
            subtopics: [
              "Analytical and graphical solutions of linear inequalities",
              "Quadratic inequalities with integral roots only"
            ],
            objectives: [
              "Solve problems on linear and quadratic inequalities",
              "Interpret graphs of inequalities"
            ]
          },
          {
            id: "progression",
            title: "Progression",
            subtopics: [
              "nth term of a progression",
              "Sum of Arithmetic Progression (A.P.)",
              "Sum of Geometric Progression (G.P.)",
              "Sum to infinity of G.P."
            ],
            objectives: [
              "Determine nth term of a progression",
              "Compute sum of A.P. and G.P.",
              "Compute sum to infinity of given G.P."
            ]
          },
          {
            id: "binary-operations",
            title: "Binary Operations",
            subtopics: [
              "Properties: closure, commutativity, associativity, distributivity",
              "Identity and inverse elements (simple cases)"
            ],
            objectives: [
              "Solve problems involving closure, commutativity, associativity, distributivity",
              "Solve problems involving identity and inverse elements"
            ]
          },
          {
            id: "matrices",
            title: "Matrices and Determinants",
            subtopics: [
              "Algebra of matrices not exceeding 3×3",
              "Determinants of matrices not exceeding 3×3",
              "Inverses of 2×2 matrices"
            ],
            objectives: [
              "Perform basic operations (+, -, ×, ÷) on matrices",
              "Calculate determinants",
              "Compute inverses of 2×2 matrices"
            ]
          }
        ]
      },
      {
        id: "geometry-trig",
        title: "III. Geometry and Trigonometry",
        topics: [
          {
            id: "euclidean-geometry",
            title: "Euclidean Geometry",
            subtopics: [
              "Properties of angles and lines",
              "Polygons: triangles, quadrilaterals, general polygons",
              "Circles: angle properties, cyclic quadrilaterals, intersecting chords",
              "Geometric construction"
            ],
            objectives: [
              "Identify various types of lines and angles",
              "Solve problems involving polygons",
              "Calculate angles using circle theorems",
              "Identify construction procedures of special angles (30°, 45°, 60°, 75°, 90° etc.)"
            ]
          },
          {
            id: "mensuration",
            title: "Mensuration",
            subtopics: [
              "Lengths and areas of plane geometrical figures",
              "Lengths of arcs and chords of a circle",
              "Perimeters and areas of sectors and segments of circles",
              "Surface areas and volumes of simple solids and composite figures",
              "The earth as a sphere: longitudes and latitudes"
            ],
            objectives: [
              "Calculate perimeters and areas of triangles, quadrilaterals, circles, composite figures",
              "Find length of arc, chord, perimeters and areas of sectors and segments",
              "Calculate total surface areas and volumes of cuboids, cylinders, cones, pyramids, prisms, spheres",
              "Determine distance between two points on earth's surface"
            ]
          },
          {
            id: "loci",
            title: "Loci",
            subtopics: [
              "Locus in 2 dimensions based on geometric principles",
              "Loci relating to parallel lines, perpendicular bisectors, angle bisectors, circles"
            ],
            objectives: [
              "Identify and interpret loci relating to parallel lines",
              "Interpret loci of perpendicular bisectors, angle bisectors and circles"
            ]
          },
          {
            id: "coordinate-geometry",
            title: "Coordinate Geometry",
            subtopics: [
              "Midpoint and gradient of a line segment",
              "Distance between two points",
              "Parallel and perpendicular lines",
              "Equations of straight lines in various forms"
            ],
            objectives: [
              "Determine midpoint and gradient of line segment",
              "Find distance between two points",
              "Identify conditions for parallelism and perpendicularity",
              "Find equation of line in two-point form, point-slope form, slope-intercept form, general form"
            ]
          },
          {
            id: "trigonometry",
            title: "Trigonometry",
            subtopics: [
              "Trigonometrical ratios of angles",
              "Angles of elevation and depression",
              "Bearings",
              "Areas and solutions of triangles",
              "Graphs of sine and cosine functions",
              "Sine and cosine formulae"
            ],
            objectives: [
              "Calculate sine, cosine and tangent of angles between -360° ≤ θ ≤ 360°",
              "Apply special angles (30°, 45°, 60°, 75°, 90°, 105°, 135°) to solve problems",
              "Solve problems involving angles of elevation and depression",
              "Solve problems involving bearings",
              "Apply trigonometric formulae to find areas of triangles",
              "Solve problems involving sine and cosine graphs"
            ]
          }
        ]
      },
      {
        id: "calculus",
        title: "IV. Calculus",
        topics: [
          {
            id: "differentiation",
            title: "Differentiation",
            subtopics: [
              "Limit of a function",
              "Differentiation of explicit algebraic functions",
              "Differentiation of simple trigonometrical functions: sine, cosine, tangent"
            ],
            objectives: [
              "Find limit of a function",
              "Differentiate explicit algebraic functions",
              "Differentiate simple trigonometric functions"
            ]
          },
          {
            id: "application-differentiation",
            title: "Application of Differentiation",
            subtopics: [
              "Rate of change",
              "Maxima and minima problems"
            ],
            objectives: [
              "Solve problems involving applications of rate of change",
              "Solve maxima and minima problems"
            ]
          },
          {
            id: "integration",
            title: "Integration",
            subtopics: [
              "Integration of explicit algebraic functions",
              "Integration of simple trigonometrical functions",
              "Area under the curve (simple cases only)"
            ],
            objectives: [
              "Solve problems of integration involving algebraic functions",
              "Integrate simple trigonometric functions",
              "Calculate area under the curve (simple cases only)"
            ]
          }
        ]
      },
      {
        id: "statistics",
        title: "V. Statistics",
        topics: [
          {
            id: "data-representation",
            title: "Representation of Data",
            subtopics: [
              "Frequency distribution",
              "Histogram, bar chart and pie chart"
            ],
            objectives: [
              "Identify and interpret frequency distribution tables",
              "Interpret information on histogram, bar chart and pie chart"
            ]
          },
          {
            id: "measures-location",
            title: "Measures of Location",
            subtopics: [
              "Mean, mode and median of ungrouped and grouped data",
              "Cumulative frequency",
              "Use of ogive to find median, quartiles and percentiles"
            ],
            objectives: [
              "Calculate mean, mode and median of ungrouped and grouped data",
              "Use ogive to find median, quartiles and percentiles"
            ]
          },
          {
            id: "measures-dispersion",
            title: "Measures of Dispersion",
            subtopics: [
              "Range, mean deviation, variance and standard deviation",
              "Calculation for ungrouped and grouped data"
            ],
            objectives: [
              "Calculate range, mean deviation, variance and standard deviation",
              "Compute measures for ungrouped and grouped data"
            ]
          },
          {
            id: "permutation-combination",
            title: "Permutation and Combination",
            subtopics: [
              "Linear and circular arrangements",
              "Arrangements involving repeated objects"
            ],
            objectives: [
              "Solve simple problems involving permutation",
              "Solve simple problems involving combination"
            ]
          },
          {
            id: "probability",
            title: "Probability",
            subtopics: [
              "Experimental probability: tossing coins, throwing dice",
              "Addition and multiplication of probabilities",
              "Mutual and independent cases"
            ],
            objectives: [
              "Solve simple problems in probability",
              "Apply addition and multiplication rules for probabilities"
            ]
          }
        ]
      }
    ]
  },

  Physics: {
    icon: Atom,
    color: "from-purple-500 to-pink-600",
    sections: [
      {
        id: "measurements-units",
        title: "1. Measurements and Units",
        topics: [
          {
            id: "length-mass-time",
            title: "Length, Mass and Time",
            subtopics: [
              "Length, area and volume: Metre rule, Vernier calipers, Micrometer Screw-gauge, measuring cylinder",
              "Mass: units, use of beam balance",
              "Time: units, time-measuring devices",
              "Fundamental physical quantities",
              "Derived physical quantities and their units",
              "Dimensions: definition and applications",
              "Limitations of experimental measurements: accuracy, errors, significant figures, standard form",
              "Measurement, position, distance and displacement"
            ],
            objectives: [
              "Identify units of length, area and volume",
              "Use different measuring instruments",
              "Determine lengths, surface areas and volume of bodies",
              "Identify unit of mass, use beam balance",
              "Identify unit of time, use time-measuring devices",
              "Relate fundamental quantities to their units",
              "Deduce units of derived physical quantities",
              "Determine dimensions of physical quantities",
              "Test homogeneity of equations",
              "Determine accuracy of measuring instruments",
              "Estimate simple errors",
              "Express measurements in standard form",
              "Identify distance traveled in specified direction",
              "Use compass and protractor to locate points/directions",
              "Use Cartesian systems to locate positions",
              "Plot graphs and draw inferences"
            ]
          }
        ]
      },
      {
        id: "scalars-vectors",
        title: "2. Scalars and Vectors",
        topics: [
          {
            id: "vectors-basics",
            title: "Scalars and Vectors",
            subtopics: [
              "Definition of scalar and vector quantities",
              "Examples of scalars and vectors",
              "Relative velocity",
              "Resolution of vectors into perpendicular directions",
              "Graphical methods of solution"
            ],
            objectives: [
              "Distinguish between scalar and vector quantities",
              "Give examples of scalar and vector quantities",
              "Determine resultant of two or more vectors",
              "Determine relative velocity",
              "Resolve vectors into perpendicular components",
              "Use graphical methods to solve vector problems"
            ]
          }
        ]
      },
      {
        id: "motion",
        title: "3. Motion",
        topics: [
          {
            id: "motion-types",
            title: "Types and Causes of Motion",
            subtopics: [
              "Types of motion: translational, oscillatory, rotational, spin, random",
              "Relative motion",
              "Causes of motion",
              "Types of force: contact, force field"
            ],
            objectives: [
              "Identify different types of motion",
              "Solve problems on collinear motion",
              "Identify force as cause of motion",
              "Identify push and pull as forms of force",
              "Identify electric, magnetic, gravitational as field forces"
            ]
          },
          {
            id: "linear-motion",
            title: "Linear Motion",
            subtopics: [
              "Speed, velocity and acceleration",
              "Equations of uniformly accelerated motion",
              "Motion under gravity",
              "Distance-time and velocity-time graphs",
              "Instantaneous velocity and acceleration"
            ],
            objectives: [
              "Differentiate between speed, velocity and acceleration",
              "Deduce equations of uniformly accelerated motion",
              "Solve problems of motion under gravity",
              "Interpret distance-time and velocity-time graphs",
              "Compute instantaneous velocity and acceleration"
            ]
          },
          {
            id: "projectiles",
            title: "Projectiles",
            subtopics: [
              "Calculation of range, maximum height and time of flight",
              "Projectiles from ground and from height",
              "Applications of projectile motion"
            ],
            objectives: [
              "Establish expressions for range, maximum height and time of flight",
              "Solve problems involving projectile motion"
            ]
          },
          {
            id: "newtons-laws",
            title: "Newton's Laws of Motion",
            subtopics: [
              "Inertia, mass and force",
              "Relationship between mass and acceleration",
              "Impulse and momentum",
              "Force-time graph",
              "Conservation of linear momentum"
            ],
            objectives: [
              "Interpret Newton's laws of motion",
              "Compare inertia, mass and force",
              "Deduce relationship between mass and acceleration",
              "Solve numerical problems involving impulse and momentum",
              "Interpret area under force-time graph",
              "Interpret law of conservation of linear momentum"
            ]
          },
          {
            id: "circular-motion",
            title: "Motion in a Circle",
            subtopics: [
              "Angular velocity and angular acceleration",
              "Centripetal and centrifugal forces",
              "Applications of circular motion"
            ],
            objectives: [
              "Establish expressions for angular velocity, angular acceleration and centripetal force",
              "Solve numerical problems involving motion in a circle"
            ]
          },
          {
            id: "shm",
            title: "Simple Harmonic Motion (S.H.M)",
            subtopics: [
              "Definition and explanation of S.H.M",
              "Examples of systems executing S.H.M",
              "Period, frequency and amplitude of S.H.M",
              "Velocity and acceleration of S.H.M",
              "Energy change in S.H.M",
              "Forced vibration and resonance"
            ],
            objectives: [
              "Establish relationship between period and frequency",
              "Analyze energy changes during S.H.M",
              "Identify different types of forced vibration",
              "Enumerate applications of resonance"
            ]
          }
        ]
      },
      {
        id: "electricity",
        title: "31. Current Electricity",
        topics: [
          {
            id: "current-basics",
            title: "Current Electricity",
            subtopics: [
              "EMF, potential difference, current, internal resistance",
              "Ohm's law, resistivity and conductivity",
              "Measurement of resistance",
              "Meter bridge",
              "Resistance in series and parallel",
              "Potentiometer method for measuring EMF, current, internal resistance",
              "Electrical networks"
            ],
            objectives: [
              "Differentiate between EMF, P.D., current and internal resistance",
              "Apply Ohm's law to solve problems",
              "Use meter bridge to calculate resistance",
              "Compute effective total resistance of parallel/series arrangements",
              "Determine resistivity and conductivity",
              "Measure EMF, current, internal resistance using potentiometer",
              "Identify advantages of potentiometer",
              "Apply Kirchoff's law in electrical networks"
            ]
          }
        ]
      },
      {
        id: "waves",
        title: "20. Waves",
        topics: [
          {
            id: "wave-production",
            title: "Production and Propagation of Waves",
            subtopics: [
              "Wave motion",
              "Vibrating systems as source of waves",
              "Waves as mode of energy transfer",
              "Distinction between particle motion and wave motion",
              "Relationship: V = fλ",
              "Phase difference, wave number, wave vector",
              "Progressive wave equation"
            ],
            objectives: [
              "Interpret wave motion",
              "Identify vibrating systems as sources of waves",
              "Use waves as mode of energy transfer",
              "Distinguish between particle motion and wave motion",
              "Relate frequency and wavelength to wave velocity",
              "Determine phase difference, wave number and wave vector",
              "Use progressive wave equation to compute wave parameters"
            ]
          },
          {
            id: "wave-classification",
            title: "Classification of Waves",
            subtopics: [
              "Types: mechanical and electromagnetic waves",
              "Longitudinal and transverse waves",
              "Stationary and progressive waves",
              "Examples from springs, ropes, strings, ripple tank"
            ],
            objectives: [
              "Differentiate between mechanical and electromagnetic waves",
              "Differentiate between longitudinal and transverse waves",
              "Distinguish between stationary and progressive waves",
              "Identify examples from springs, ropes, strings, ripple tank"
            ]
          },
          {
            id: "wave-properties",
            title: "Characteristics/Properties of Waves",
            subtopics: [
              "Reflection, refraction, diffraction, plane polarization",
              "Superposition of waves: interference",
              "Beats",
              "Doppler effects (qualitative treatment)"
            ],
            objectives: [
              "Differentiate between reflection, refraction, diffraction, polarization",
              "Analyze principle of superposition of waves",
              "Solve numerical problems on waves",
              "Explain phenomenon of beat, beat frequency and uses",
              "Explain Doppler effect of sound and applications"
            ]
          }
        ]
      }
    ]
  },

  "Use of English": {
    icon: BookText,
    color: "from-green-500 to-emerald-600",
    sections: [
      {
        id: "comprehension-summary",
        title: "A. Comprehension and Summary",
        topics: [
          {
            id: "reading-skills",
            title: "Reading and Comprehension Skills",
            subtopics: [
              "Description and narration in passages",
              "Exposition and argumentation/persuasion",
              "Identifying main points/topic sentences",
              "Determining implied meanings",
              "Identifying grammatical functions of words, phrases, clauses",
              "Figures of speech and idioms",
              "Coherence and logical reasoning: deductions, inferences",
              "Approved Reading Text: The Life Changer by Khadija Abubakar Jalli",
              "Synthesis of ideas from passages"
            ],
            objectives: [
              "Identify main points/topic sentences in passages",
              "Determine implied meanings",
              "Identify grammatical functions of words, phrases, clauses, figurative/idiomatic expressions",
              "Deduce writer's intentions: mood, attitude to subject, opinion",
              "Synthesize information from multiple sources",
              "Write concise summaries",
              "Maintain coherence in summary"
            ]
          }
        ]
      },
      {
        id: "lexis-structure",
        title: "B. Lexis and Structure",
        topics: [
          {
            id: "vocabulary",
            title: "Vocabulary Development",
            subtopics: [
              "Synonyms and antonyms",
              "Ordinary, figurative and idiomatic usage",
              "Word classes and their functions",
              "Spelling and mechanics",
              "Clause and sentence patterns",
              "Mood, tense, aspect, number, agreement/concord",
              "Degree: positive, comparative, superlative",
              "Question tags",
              "Standard British English idioms"
            ],
            objectives: [
              "Identify words in ordinary, figurative and idiomatic contexts",
              "Determine similar and opposite meanings of words",
              "Differentiate between correct and incorrect spellings",
              "Identify various grammatical patterns in use",
              "Interpret information conveyed in sentences",
              "Apply rules of concord",
              "Use appropriate tenses and moods"
            ]
          }
        ]
      },
      {
        id: "oral-forms",
        title: "C. Oral Forms",
        topics: [
          {
            id: "pronunciation",
            title: "Pronunciation Skills",
            subtopics: [
              "Vowels: monothongs, diphthongs, triphthongs",
              "Consonants and clusters",
              "Rhymes including homophones",
              "Word stress: monosyllabic and polysyllabic",
              "Emphatic stress in connected speech"
            ],
            objectives: [
              "Make distinctions among vowel types",
              "Differentiate among consonant types",
              "Identify correct pronunciation of individual words",
              "Articulate connected speech correctly",
              "Apply stress correctly in words and sentences"
            ]
          }
        ]
      }
    ]
  }
};

// Helper Functions
export const getAllSubjects = (): SubjectName[] => {
  return Object.keys(JAMB_SYLLABUS) as SubjectName[];
};

export const getSubjectData = (subject: SubjectName): SubjectData | null => {
  return JAMB_SYLLABUS[subject] || null;
};

export const getTotalTopicsCount = (subject: SubjectName): number => {
  const subjectData = JAMB_SYLLABUS[subject];
  if (!subjectData) return 0;
  
  return subjectData.sections.reduce((sum, section) => 
    sum + section.topics.length, 0
  );
};

export const findTopicById = (topicId: string): { 
  topic: Topic | null; 
  subject: SubjectName | null;
  section: Section | null;
} => {
  for (const [subjectName, subjectData] of Object.entries(JAMB_SYLLABUS)) {
    for (const section of subjectData.sections) {
      const topic = section.topics.find(t => t.id === topicId);
      if (topic) {
        return {
          topic,
          subject: subjectName as SubjectName,
          section
        };
      }
    }
  }
  return { topic: null, subject: null, section: null };
};