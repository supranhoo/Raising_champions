/**
 * =========================================================================
 * ZOPTRO EDUCATIONAL FOCUS & MISSION CONTROL PLATFORM
 * CANONICAL CBSE / NCERT RATIONALISED (2024-25) CURRICULUM CATALOG
 * =========================================================================
 * Standalone sovereign dataset module covering Classes 1 to 10 across core
 * subjects: Mathematics, Science, Social Science (History, Geography,
 * Civics, Economics), EVS, English, and Hindi.
 *
 * Universal Polyglot Export Support:
 * - CommonJS (Node.js): module.exports
 * - Browser: window.ZOPTRO_CURRICULUM_CATALOG & window.CANONICAL_CURRICULUM_CATALOG
 * - Google Apps Script (V8): Global scope variable CANONICAL_CURRICULUM_CATALOG
 *
 * Adheres strictly to the 7-column Table 16 schema:
 * ["id", "grade", "subject", "chapterNumber", "chapterTitle", "topicsJson", "learningObjectivesJson"]
 * =========================================================================
 */

var CURRICULUM_CATALOG_SCHEMA = [
  "id",
  "grade",
  "subject",
  "chapterNumber",
  "chapterTitle",
  "topicsJson",
  "learningObjectivesJson"
];

var CANONICAL_CURRICULUM_CATALOG = [
  {
    "id": "cat_c1_math_ch1",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Finding the Furry Cat!",
    "topicsJson": "[\"Spatial Relationships\",\"Inside vs Outside\",\"Top vs Bottom\",\"Near vs Far\"]",
    "topics": [
      "Spatial Relationships",
      "Inside vs Outside",
      "Top vs Bottom",
      "Near vs Far"
    ],
    "learningObjectivesJson": "[\"Develop pre-number spatial concepts and directional orientation\"]",
    "learningObjectives": [
      "Develop pre-number spatial concepts and directional orientation"
    ]
  },
  {
    "id": "cat_c1_math_ch2",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "What is Long? What is Round?",
    "topicsJson": "[\"2D and 3D Shapes Identification\",\"Rolling and Sliding Objects\",\"Tracing Shapes\"]",
    "topics": [
      "2D and 3D Shapes Identification",
      "Rolling and Sliding Objects",
      "Tracing Shapes"
    ],
    "learningObjectivesJson": "[\"Distinguish geometric attributes of everyday physical objects\"]",
    "learningObjectives": [
      "Distinguish geometric attributes of everyday physical objects"
    ]
  },
  {
    "id": "cat_c1_math_ch3",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Mango Treat",
    "topicsJson": "[\"Numbers 1 to 9\",\"One-to-One Correspondence\",\"Counting and Cardinality\"]",
    "topics": [
      "Numbers 1 to 9",
      "One-to-One Correspondence",
      "Counting and Cardinality"
    ],
    "learningObjectivesJson": "[\"Master counting and number recognition from 1 to 9\"]",
    "learningObjectives": [
      "Master counting and number recognition from 1 to 9"
    ]
  },
  {
    "id": "cat_c1_math_ch4",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Making 10",
    "topicsJson": "[\"Concept of Zero\",\"Combining Numbers to Make 10\",\"Ten-Frames\"]",
    "topics": [
      "Concept of Zero",
      "Combining Numbers to Make 10",
      "Ten-Frames"
    ],
    "learningObjectivesJson": "[\"Understand 10 as a base unit and decompose pairs that sum to 10\"]",
    "learningObjectives": [
      "Understand 10 as a base unit and decompose pairs that sum to 10"
    ]
  },
  {
    "id": "cat_c1_math_ch5",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "How Many?",
    "topicsJson": "[\"Addition of Single Digits\",\"Subtraction as Taking Away\",\"Picture Story Problems\"]",
    "topics": [
      "Addition of Single Digits",
      "Subtraction as Taking Away",
      "Picture Story Problems"
    ],
    "learningObjectivesJson": "[\"Perform basic single-digit addition and subtraction within 9\"]",
    "learningObjectives": [
      "Perform basic single-digit addition and subtraction within 9"
    ]
  },
  {
    "id": "cat_c1_math_ch6",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Vegetable Farm",
    "topicsJson": "[\"Addition and Subtraction up to 20\",\"Word Stories\",\"Number Line Addition\"]",
    "topics": [
      "Addition and Subtraction up to 20",
      "Word Stories",
      "Number Line Addition"
    ],
    "learningObjectivesJson": "[\"Solve simple two-digit addition and subtraction problems without carry\"]",
    "learningObjectives": [
      "Solve simple two-digit addition and subtraction problems without carry"
    ]
  },
  {
    "id": "cat_c1_math_ch7",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Lina's Family",
    "topicsJson": "[\"Non-Standard Measurement of Length\",\"Handspan and Fingers\",\"Comparing Weights\"]",
    "topics": [
      "Non-Standard Measurement of Length",
      "Handspan and Fingers",
      "Comparing Weights"
    ],
    "learningObjectivesJson": "[\"Compare length and weight using non-standard body units\"]",
    "learningObjectives": [
      "Compare length and weight using non-standard body units"
    ]
  },
  {
    "id": "cat_c1_math_ch8",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Fun with Numbers",
    "topicsJson": "[\"Numbers 21 to 99\",\"Grouping in Tens and Ones\",\"Comparing Two-Digit Numbers\"]",
    "topics": [
      "Numbers 21 to 99",
      "Grouping in Tens and Ones",
      "Comparing Two-Digit Numbers"
    ],
    "learningObjectivesJson": "[\"Understand place value structure of tens and ones up to 99\"]",
    "learningObjectives": [
      "Understand place value structure of tens and ones up to 99"
    ]
  },
  {
    "id": "cat_c1_math_ch9",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Utsav",
    "topicsJson": "[\"Repeating Patterns\",\"Shape and Colour Sequences\",\"Movement Patterns\"]",
    "topics": [
      "Repeating Patterns",
      "Shape and Colour Sequences",
      "Movement Patterns"
    ],
    "learningObjectivesJson": "[\"Identify, continue, and generate visual and numeric patterns\"]",
    "learningObjectives": [
      "Identify, continue, and generate visual and numeric patterns"
    ]
  },
  {
    "id": "cat_c1_math_ch10",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "How do I Spend my Day?",
    "topicsJson": "[\"Sequence of Daily Events\",\"Parts of the Day\",\"Days of the Week\"]",
    "topics": [
      "Sequence of Daily Events",
      "Parts of the Day",
      "Days of the Week"
    ],
    "learningObjectivesJson": "[\"Sequence routine events chronologically and identify calendar days\"]",
    "learningObjectives": [
      "Sequence routine events chronologically and identify calendar days"
    ]
  },
  {
    "id": "cat_c1_math_ch11",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "How Many Times?",
    "topicsJson": "[\"Skip Counting by 2s and 5s\",\"Repeated Addition Readiness\",\"Equal Grouping\"]",
    "topics": [
      "Skip Counting by 2s and 5s",
      "Repeated Addition Readiness",
      "Equal Grouping"
    ],
    "learningObjectivesJson": "[\"Develop intuitive foundation for multiplication through repeated addition\"]",
    "learningObjectives": [
      "Develop intuitive foundation for multiplication through repeated addition"
    ]
  },
  {
    "id": "cat_c1_math_ch12",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "How Much Can We Spend?",
    "topicsJson": "[\"Indian Currency Coins\",\"Rupee Notes ₹10 and ₹20\",\"Simple Purchase Calculations\"]",
    "topics": [
      "Indian Currency Coins",
      "Rupee Notes ₹10 and ₹20",
      "Simple Purchase Calculations"
    ],
    "learningObjectivesJson": "[\"Identify Indian coins and currency notes and calculate simple purchases\"]",
    "learningObjectives": [
      "Identify Indian coins and currency notes and calculate simple purchases"
    ]
  },
  {
    "id": "cat_c1_math_ch13",
    "grade": "Class 1",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "So Many Toys and Puzzles",
    "topicsJson": "[\"Data Collection\",\"Sorting Objects by Attribute\",\"Simple Tallying\"]",
    "topics": [
      "Data Collection",
      "Sorting Objects by Attribute",
      "Simple Tallying"
    ],
    "learningObjectivesJson": "[\"Collect, organize, and interpret simple object counts\"]",
    "learningObjectives": [
      "Collect, organize, and interpret simple object counts"
    ]
  },
  {
    "id": "cat_c1_evs_ch1",
    "grade": "Class 1",
    "subject": "EVS",
    "chapterNumber": 1,
    "chapterTitle": "My Family and Me",
    "topicsJson": "[\"Family Members\",\"Helping at Home\",\"Personal Identity\"]",
    "topics": [
      "Family Members",
      "Helping at Home",
      "Personal Identity"
    ],
    "learningObjectivesJson": "[\"Recognize diverse family roles and appreciate mutual care\"]",
    "learningObjectives": [
      "Recognize diverse family roles and appreciate mutual care"
    ]
  },
  {
    "id": "cat_c1_evs_ch2",
    "grade": "Class 1",
    "subject": "EVS",
    "chapterNumber": 2,
    "chapterTitle": "My Body and Senses",
    "topicsJson": "[\"Five Sense Organs\",\"Functions of Body Parts\",\"Cleanliness and Hygiene\"]",
    "topics": [
      "Five Sense Organs",
      "Functions of Body Parts",
      "Cleanliness and Hygiene"
    ],
    "learningObjectivesJson": "[\"Identify sense organs and practice personal hygiene\"]",
    "learningObjectives": [
      "Identify sense organs and practice personal hygiene"
    ]
  },
  {
    "id": "cat_c1_evs_ch3",
    "grade": "Class 1",
    "subject": "EVS",
    "chapterNumber": 3,
    "chapterTitle": "Plants Around Us",
    "topicsJson": "[\"Common Trees and Flowers\",\"Parts of a Plant\",\"Caring for Plants\"]",
    "topics": [
      "Common Trees and Flowers",
      "Parts of a Plant",
      "Caring for Plants"
    ],
    "learningObjectivesJson": "[\"Observe plant diversity and understand the importance of watering plants\"]",
    "learningObjectives": [
      "Observe plant diversity and understand the importance of watering plants"
    ]
  },
  {
    "id": "cat_c1_evs_ch4",
    "grade": "Class 1",
    "subject": "EVS",
    "chapterNumber": 4,
    "chapterTitle": "Animals Our Friends",
    "topicsJson": "[\"Domestic and Wild Animals\",\"Animal Sounds\",\"Animal Babies and Homes\"]",
    "topics": [
      "Domestic and Wild Animals",
      "Animal Sounds",
      "Animal Babies and Homes"
    ],
    "learningObjectivesJson": "[\"Identify common animals, their sounds, and show compassion to animals\"]",
    "learningObjectives": [
      "Identify common animals, their sounds, and show compassion to animals"
    ]
  },
  {
    "id": "cat_c1_evs_ch5",
    "grade": "Class 1",
    "subject": "EVS",
    "chapterNumber": 5,
    "chapterTitle": "Water and Food in Our Lives",
    "topicsJson": "[\"Sources of Water\",\"Healthy Foods\",\"Clean Drinking Habits\"]",
    "topics": [
      "Sources of Water",
      "Healthy Foods",
      "Clean Drinking Habits"
    ],
    "learningObjectivesJson": "[\"Identify healthy foods and understand safe water usage\"]",
    "learningObjectives": [
      "Identify healthy foods and understand safe water usage"
    ]
  },
  {
    "id": "cat_c1_eng_ch1",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Two Little Hands",
    "topicsJson": "[\"Body Parts Action Rhyme\",\"Phonics /a/ and /b/\",\"Self-Care\"]",
    "topics": [
      "Body Parts Action Rhyme",
      "Phonics /a/ and /b/",
      "Self-Care"
    ],
    "learningObjectivesJson": "[\"Recite action poems with rhythm and identify basic initial phonic sounds\"]",
    "learningObjectives": [
      "Recite action poems with rhythm and identify basic initial phonic sounds"
    ]
  },
  {
    "id": "cat_c1_eng_ch2",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Greetings",
    "topicsJson": "[\"Good Morning / Good Night\",\"Polite Expressions\",\"Introducing Oneself\"]",
    "topics": [
      "Good Morning / Good Night",
      "Polite Expressions",
      "Introducing Oneself"
    ],
    "learningObjectivesJson": "[\"Use appropriate social greetings in English\"]",
    "learningObjectives": [
      "Use appropriate social greetings in English"
    ]
  },
  {
    "id": "cat_c1_eng_ch3",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Picture Time",
    "topicsJson": "[\"Visual Reading\",\"Naming Everyday Objects\",\"Vocabulary Building\"]",
    "topics": [
      "Visual Reading",
      "Naming Everyday Objects",
      "Vocabulary Building"
    ],
    "learningObjectivesJson": "[\"Describe visual scenes and name objects accurately\"]",
    "learningObjectives": [
      "Describe visual scenes and name objects accurately"
    ]
  },
  {
    "id": "cat_c1_eng_ch4",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "The Cap-Seller and the Monkeys",
    "topicsJson": "[\"Fable Comprehension\",\"Animal Mimicry\",\"Moral Reasoning\"]",
    "topics": [
      "Fable Comprehension",
      "Animal Mimicry",
      "Moral Reasoning"
    ],
    "learningObjectivesJson": "[\"Listen to, comprehend, and re-tell classic folk tales\"]",
    "learningObjectives": [
      "Listen to, comprehend, and re-tell classic folk tales"
    ]
  },
  {
    "id": "cat_c1_eng_ch5",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "A Farm",
    "topicsJson": "[\"Farm Animals\",\"Animal Sounds\",\"Sight Words\"]",
    "topics": [
      "Farm Animals",
      "Animal Sounds",
      "Sight Words"
    ],
    "learningObjectivesJson": "[\"Recognize farm animal vocabulary and read simple sight words\"]",
    "learningObjectives": [
      "Recognize farm animal vocabulary and read simple sight words"
    ]
  },
  {
    "id": "cat_c1_eng_ch6",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Fun with Pictures",
    "topicsJson": "[\"Visual Discrimination\",\"Spotting Differences\",\"Describing Colours\"]",
    "topics": [
      "Visual Discrimination",
      "Spotting Differences",
      "Describing Colours"
    ],
    "learningObjectivesJson": "[\"Enhance visual literacy and descriptive vocabulary\"]",
    "learningObjectives": [
      "Enhance visual literacy and descriptive vocabulary"
    ]
  },
  {
    "id": "cat_c1_eng_ch7",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "The Food We Eat",
    "topicsJson": "[\"Meal Names\",\"Healthy Habits\",\"Fruit and Vegetable Names\"]",
    "topics": [
      "Meal Names",
      "Healthy Habits",
      "Fruit and Vegetable Names"
    ],
    "learningObjectivesJson": "[\"Express food preferences and understand balanced meals\"]",
    "learningObjectives": [
      "Express food preferences and understand balanced meals"
    ]
  },
  {
    "id": "cat_c1_eng_ch8",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "The Four Seasons",
    "topicsJson": "[\"Summer, Rainy, Winter, Spring\",\"Weather Rhymes\",\"Clothing Words\"]",
    "topics": [
      "Summer, Rainy, Winter, Spring",
      "Weather Rhymes",
      "Clothing Words"
    ],
    "learningObjectivesJson": "[\"Associate seasons with appropriate clothing and weather changes\"]",
    "learningObjectives": [
      "Associate seasons with appropriate clothing and weather changes"
    ]
  },
  {
    "id": "cat_c1_eng_ch9",
    "grade": "Class 1",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "Anandi's Rainbow",
    "topicsJson": "[\"Seven Colours of Rainbow (VIBGYOR)\",\"Drawing and Colouring\",\"Creative Expression\"]",
    "topics": [
      "Seven Colours of Rainbow (VIBGYOR)",
      "Drawing and Colouring",
      "Creative Expression"
    ],
    "learningObjectivesJson": "[\"Learn rainbow color names in sequence through narrative\"]",
    "learningObjectives": [
      "Learn rainbow color names in sequence through narrative"
    ]
  },
  {
    "id": "cat_c1_hin_ch1",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 1,
    "chapterTitle": "मीना का परिवार",
    "topicsJson": "[\"पारिवारिक रिश्ते\",\"घर के काम\",\"स्वर 'अ' और 'आ'\"]",
    "topics": [
      "पारिवारिक रिश्ते",
      "घर के काम",
      "स्वर 'अ' और 'आ'"
    ],
    "learningObjectivesJson": "[\"परिवार के सदस्यों की पहचान व प्राथमिक मौखिक अभिव्यक्ति\"]",
    "learningObjectives": [
      "परिवार के सदस्यों की पहचान व प्राथमिक मौखिक अभिव्यक्ति"
    ]
  },
  {
    "id": "cat_c1_hin_ch2",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 2,
    "chapterTitle": "दादा-दादी",
    "topicsJson": "[\"बुजुर्गों का आदर\",\"कहानियाँ सुनाना\",\"वर्णमाला अभ्यास\"]",
    "topics": [
      "बुजुर्गों का आदर",
      "कहानियाँ सुनाना",
      "वर्णमाला अभ्यास"
    ],
    "learningObjectivesJson": "[\"बुजुर्गों के प्रति सम्मान व सरल संवाद कौशल\"]",
    "learningObjectives": [
      "बुजुर्गों के प्रति सम्मान व सरल संवाद कौशल"
    ]
  },
  {
    "id": "cat_c1_hin_ch3",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 3,
    "chapterTitle": "रीना का दिन",
    "topicsJson": "[\"दिनचर्या\",\"सुबह से रात के कार्य\",\"समय बोध\"]",
    "topics": [
      "दिनचर्या",
      "सुबह से रात के कार्य",
      "समय बोध"
    ],
    "learningObjectivesJson": "[\"नियमित दिनचर्या का वर्णन करना\"]",
    "learningObjectives": [
      "नियमित दिनचर्या का वर्णन करना"
    ]
  },
  {
    "id": "cat_c1_hin_ch4",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 4,
    "chapterTitle": "रानी भी",
    "topicsJson": "[\"खेल-कूद\",\"बच्चों की टोली\",\"मात्रा 'इ' और 'ई'\"]",
    "topics": [
      "खेल-कूद",
      "बच्चों की टोली",
      "मात्रा 'इ' और 'ई'"
    ],
    "learningObjectivesJson": "[\"सामूहिक खेलों में सहभागिता व मात्रा ज्ञान\"]",
    "learningObjectives": [
      "सामूहिक खेलों में सहभागिता व मात्रा ज्ञान"
    ]
  },
  {
    "id": "cat_c1_hin_ch5",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 5,
    "chapterTitle": "मिठाई",
    "topicsJson": "[\"मिठाइयों के नाम\",\"स्वाद पहचान\",\"संवाद कौशल\"]",
    "topics": [
      "मिठाइयों के नाम",
      "स्वाद पहचान",
      "संवाद कौशल"
    ],
    "learningObjectivesJson": "[\"विविध स्वादों की पहचान व शब्दकोश विकास\"]",
    "learningObjectives": [
      "विविध स्वादों की पहचान व शब्दकोश विकास"
    ]
  },
  {
    "id": "cat_c1_hin_ch6",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 6,
    "chapterTitle": "तीन साथी",
    "topicsJson": "[\"मित्रता\",\"आपसी सहयोग\",\"चित्र पठन\"]",
    "topics": [
      "मित्रता",
      "आपसी सहयोग",
      "चित्र पठन"
    ],
    "learningObjectivesJson": "[\"चित्र देखकर कहानी गढ़ना\"]",
    "learningObjectives": [
      "चित्र देखकर कहानी गढ़ना"
    ]
  },
  {
    "id": "cat_c1_hin_ch7",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 7,
    "chapterTitle": "वाह, मेरे घोड़े!",
    "topicsJson": "[\"पारंपरिक खिलौने\",\"बाल कविता\",\"लयबद्ध वाचन\"]",
    "topics": [
      "पारंपरिक खिलौने",
      "बाल कविता",
      "लयबद्ध वाचन"
    ],
    "learningObjectivesJson": "[\"कविता का सस्वर पाठ\"]",
    "learningObjectives": [
      "कविता का सस्वर पाठ"
    ]
  },
  {
    "id": "cat_c1_hin_ch8",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 8,
    "chapterTitle": "खतरे में साँप",
    "topicsJson": "[\"जीव-जंतु सुरक्षा\",\"पर्यावरण बोध\",\"वर्ण 'उ' और 'ऊ'\"]",
    "topics": [
      "जीव-जंतु सुरक्षा",
      "पर्यावरण बोध",
      "वर्ण 'उ' और 'ऊ'"
    ],
    "learningObjectivesJson": "[\"जीवों के प्रति संवेदनशीलता\"]",
    "learningObjectives": [
      "जीवों के प्रति संवेदनशीलता"
    ]
  },
  {
    "id": "cat_c1_hin_ch9",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 9,
    "chapterTitle": "आलू की सड़क",
    "topicsJson": "[\"हास्य कथा\",\"सब्जियों के नाम\",\"मात्रा 'ए' और 'ऐ'\"]",
    "topics": [
      "हास्य कथा",
      "सब्जियों के नाम",
      "मात्रा 'ए' और 'ऐ'"
    ],
    "learningObjectivesJson": "[\"हास्य-व्यंग्य समझना व नई शब्दावली\"]",
    "learningObjectives": [
      "हास्य-व्यंग्य समझना व नई शब्दावली"
    ]
  },
  {
    "id": "cat_c1_hin_ch10",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 10,
    "chapterTitle": "झूलम-झूली",
    "topicsJson": "[\"मेले के झूले\",\"बाल उमंग\",\"तुकांत शब्द\"]",
    "topics": [
      "मेले के झूले",
      "बाल उमंग",
      "तुकांत शब्द"
    ],
    "learningObjectivesJson": "[\"तुकांत शब्दों की पहचान\"]",
    "learningObjectives": [
      "तुकांत शब्दों की पहचान"
    ]
  },
  {
    "id": "cat_c1_hin_ch11",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 11,
    "chapterTitle": "भुट्टे",
    "topicsJson": "[\"मौसमी खान-पान\",\"ग्रामीण परिवेश\",\"संयुक्ताक्षर\"]",
    "topics": [
      "मौसमी खान-पान",
      "ग्रामीण परिवेश",
      "संयुक्ताक्षर"
    ],
    "learningObjectivesJson": "[\"खान-पान की विविधता समझना\"]",
    "learningObjectives": [
      "खान-पान की विविधता समझना"
    ]
  },
  {
    "id": "cat_c1_hin_ch12",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 12,
    "chapterTitle": "फूली रोटी",
    "topicsJson": "[\"रसोई के काम\",\"रोटी बनने की प्रक्रिया\",\"वर्णमाला ज्ञान\"]",
    "topics": [
      "रसोई के काम",
      "रोटी बनने की प्रक्रिया",
      "वर्णमाला ज्ञान"
    ],
    "learningObjectivesJson": "[\"भोजन निर्माण की प्रक्रिया का मौखिक विवरण\"]",
    "learningObjectives": [
      "भोजन निर्माण की प्रक्रिया का मौखिक विवरण"
    ]
  },
  {
    "id": "cat_c1_hin_ch13",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 13,
    "chapterTitle": "मेला",
    "topicsJson": "[\"भारतीय मेले\",\"दुकानें और खिलौने\",\"संवाद\"]",
    "topics": [
      "भारतीय मेले",
      "दुकानें और खिलौने",
      "संवाद"
    ],
    "learningObjectivesJson": "[\"सांस्कृतिक उत्सवों की समझ\"]",
    "learningObjectives": [
      "सांस्कृतिक उत्सवों की समझ"
    ]
  },
  {
    "id": "cat_c1_hin_ch14",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 14,
    "chapterTitle": "बरखा और मेघा",
    "topicsJson": "[\"वर्षा ऋतु\",\"प्राकृतिक सौंदर्य\",\"जल संरक्षण\"]",
    "topics": [
      "वर्षा ऋतु",
      "प्राकृतिक सौंदर्य",
      "जल संरक्षण"
    ],
    "learningObjectivesJson": "[\"प्रकृति के प्रति लगाव\"]",
    "learningObjectives": [
      "प्रकृति के प्रति लगाव"
    ]
  },
  {
    "id": "cat_c1_hin_ch15",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 15,
    "chapterTitle": "होली",
    "topicsJson": "[\"रंगों का त्योहार\",\"भाईचारा\",\"पारंपरिक गीत\"]",
    "topics": [
      "रंगों का त्योहार",
      "भाईचारा",
      "पारंपरिक गीत"
    ],
    "learningObjectivesJson": "[\"त्योहारों का महत्व व सामाजिक सौहार्द\"]",
    "learningObjectives": [
      "त्योहारों का महत्व व सामाजिक सौहार्द"
    ]
  },
  {
    "id": "cat_c1_hin_ch16",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 16,
    "chapterTitle": "जन्मदिवस पर पेड़ लगाओ",
    "topicsJson": "[\"पर्यावरण संरक्षण\",\"वृक्षारोपण\",\"नैतिक शिक्षा\"]",
    "topics": [
      "पर्यावरण संरक्षण",
      "वृक्षारोपण",
      "नैतिक शिक्षा"
    ],
    "learningObjectivesJson": "[\"पेड़ लगाने का संकल्प\"]",
    "learningObjectives": [
      "पेड़ लगाने का संकल्प"
    ]
  },
  {
    "id": "cat_c1_hin_ch17",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 17,
    "chapterTitle": "हवा",
    "topicsJson": "[\"वायु का महत्व\",\"अनुभव जन्य ज्ञान\",\"सरल विज्ञान बोध\"]",
    "topics": [
      "वायु का महत्व",
      "अनुभव जन्य ज्ञान",
      "सरल विज्ञान बोध"
    ],
    "learningObjectivesJson": "[\"हवा की उपस्थिति महसूस करना व स्वच्छता\"]",
    "learningObjectives": [
      "हवा की उपस्थिति महसूस करना व स्वच्छता"
    ]
  },
  {
    "id": "cat_c1_hin_ch18",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 18,
    "chapterTitle": "कितनी प्यारी है ये दुनिया",
    "topicsJson": "[\"प्रकृति की सुंदरता\",\"पशु-पक्षी\",\"सहानुभूति\"]",
    "topics": [
      "प्रकृति की सुंदरता",
      "पशु-पक्षी",
      "सहानुभूति"
    ],
    "learningObjectivesJson": "[\"सृष्टि की सुंदरता की सराहना\"]",
    "learningObjectives": [
      "सृष्टि की सुंदरता की सराहना"
    ]
  },
  {
    "id": "cat_c1_hin_ch19",
    "grade": "Class 1",
    "subject": "Hindi",
    "chapterNumber": 19,
    "chapterTitle": "चाँद का बच्चा",
    "topicsJson": "[\"कल्पनाशीलता\",\"आकाशीय पिंड\",\"लोरी और कविता\"]",
    "topics": [
      "कल्पनाशीलता",
      "आकाशीय पिंड",
      "लोरी और कविता"
    ],
    "learningObjectivesJson": "[\"रचनात्मक सोच व कल्पना का विकास\"]",
    "learningObjectives": [
      "रचनात्मक सोच व कल्पना का विकास"
    ]
  },
  {
    "id": "cat_c2_math_ch1",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Let us Do",
    "topicsJson": "[\"Counting and Grouping\",\"Number Readiness\",\"Comparing Quantities\"]",
    "topics": [
      "Counting and Grouping",
      "Number Readiness",
      "Comparing Quantities"
    ],
    "learningObjectivesJson": "[\"Review and reinforce 2-digit number sense\"]",
    "learningObjectives": [
      "Review and reinforce 2-digit number sense"
    ]
  },
  {
    "id": "cat_c2_math_ch2",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Shapes Around Us",
    "topicsJson": "[\"2D and 3D Shapes\",\"Edges, Corners, and Faces\",\"Tiling Patterns\"]",
    "topics": [
      "2D and 3D Shapes",
      "Edges, Corners, and Faces",
      "Tiling Patterns"
    ],
    "learningObjectivesJson": "[\"Identify plane and solid figures and explore basic geometric properties\"]",
    "learningObjectives": [
      "Identify plane and solid figures and explore basic geometric properties"
    ]
  },
  {
    "id": "cat_c2_math_ch3",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Look at the Ginladi",
    "topicsJson": "[\"Numbers up to 100\",\"Place Value (Tens and Ones)\",\"Expanded Form\"]",
    "topics": [
      "Numbers up to 100",
      "Place Value (Tens and Ones)",
      "Expanded Form"
    ],
    "learningObjectivesJson": "[\"Master place value representations using beads/ginladi up to 100\"]",
    "learningObjectives": [
      "Master place value representations using beads/ginladi up to 100"
    ]
  },
  {
    "id": "cat_c2_math_ch4",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Shadow Story (Togalu)",
    "topicsJson": "[\"Symmetry in Everyday Objects\",\"Shadow Formation\",\"Mirror Halves\"]",
    "topics": [
      "Symmetry in Everyday Objects",
      "Shadow Formation",
      "Mirror Halves"
    ],
    "learningObjectivesJson": "[\"Explore reflectional symmetry and shadows in nature\"]",
    "learningObjectives": [
      "Explore reflectional symmetry and shadows in nature"
    ]
  },
  {
    "id": "cat_c2_math_ch5",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Playing with Lines",
    "topicsJson": "[\"Standing, Sleeping, and Slanting Lines\",\"Curved Lines\",\"Drawing Figures with Lines\"]",
    "topics": [
      "Standing, Sleeping, and Slanting Lines",
      "Curved Lines",
      "Drawing Figures with Lines"
    ],
    "learningObjectivesJson": "[\"Classify line types and construct shapes using straight and curved lines\"]",
    "learningObjectives": [
      "Classify line types and construct shapes using straight and curved lines"
    ]
  },
  {
    "id": "cat_c2_math_ch6",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Decoration for Festival",
    "topicsJson": "[\"Addition with Regrouping (Carry-over)\",\"Subtraction with Decomposition\",\"Word Problems\"]",
    "topics": [
      "Addition with Regrouping (Carry-over)",
      "Subtraction with Decomposition",
      "Word Problems"
    ],
    "learningObjectivesJson": "[\"Perform 2-digit addition and subtraction with regrouping\"]",
    "learningObjectives": [
      "Perform 2-digit addition and subtraction with regrouping"
    ]
  },
  {
    "id": "cat_c2_math_ch7",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Maheshwar",
    "topicsJson": "[\"Measurement of Length\",\"Paces and Metre Scale Readiness\",\"Comparing Distances\"]",
    "topics": [
      "Measurement of Length",
      "Paces and Metre Scale Readiness",
      "Comparing Distances"
    ],
    "learningObjectivesJson": "[\"Measure lengths using non-standard and informal standard units\"]",
    "learningObjectives": [
      "Measure lengths using non-standard and informal standard units"
    ]
  },
  {
    "id": "cat_c2_math_ch8",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Grouping and Sharing",
    "topicsJson": "[\"Equal Grouping\",\"Equal Distribution / Sharing\",\"Division Readiness\"]",
    "topics": [
      "Equal Grouping",
      "Equal Distribution / Sharing",
      "Division Readiness"
    ],
    "learningObjectivesJson": "[\"Understand multiplication as grouping and division as equal sharing\"]",
    "learningObjectives": [
      "Understand multiplication as grouping and division as equal sharing"
    ]
  },
  {
    "id": "cat_c2_math_ch9",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Seasons",
    "topicsJson": "[\"Reading the Calendar\",\"Months of the Year\",\"Indian Seasons & Festivals\"]",
    "topics": [
      "Reading the Calendar",
      "Months of the Year",
      "Indian Seasons & Festivals"
    ],
    "learningObjectivesJson": "[\"Read calendar grids and associate months with climatic seasons\"]",
    "learningObjectives": [
      "Read calendar grids and associate months with climatic seasons"
    ]
  },
  {
    "id": "cat_c2_math_ch10",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "How Much Rupal Spent?",
    "topicsJson": "[\"Coins and Currency Combinations\",\"Making ₹50 and ₹100\",\"Shopping Calculations\"]",
    "topics": [
      "Coins and Currency Combinations",
      "Making ₹50 and ₹100",
      "Shopping Calculations"
    ],
    "learningObjectivesJson": "[\"Calculate total costs and change in simple money transactions\"]",
    "learningObjectives": [
      "Calculate total costs and change in simple money transactions"
    ]
  },
  {
    "id": "cat_c2_math_ch11",
    "grade": "Class 2",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Data Handling",
    "topicsJson": "[\"Pictographs\",\"Reading Frequency Tables\",\"Organizing Survey Data\"]",
    "topics": [
      "Pictographs",
      "Reading Frequency Tables",
      "Organizing Survey Data"
    ],
    "learningObjectivesJson": "[\"Represent data using pictographs and draw simple conclusions\"]",
    "learningObjectives": [
      "Represent data using pictographs and draw simple conclusions"
    ]
  },
  {
    "id": "cat_c2_evs_ch1",
    "grade": "Class 2",
    "subject": "EVS",
    "chapterNumber": 1,
    "chapterTitle": "Our Neighborhood and Community Helpers",
    "topicsJson": "[\"Community Helpers (Doctor, Postman, Teacher)\",\"Important Places in Neighborhood\",\"Public Courtesy\"]",
    "topics": [
      "Community Helpers (Doctor, Postman, Teacher)",
      "Important Places in Neighborhood",
      "Public Courtesy"
    ],
    "learningObjectivesJson": "[\"Value neighborhood helpers and public amenities\"]",
    "learningObjectives": [
      "Value neighborhood helpers and public amenities"
    ]
  },
  {
    "id": "cat_c2_evs_ch2",
    "grade": "Class 2",
    "subject": "EVS",
    "chapterNumber": 2,
    "chapterTitle": "Living Things: Plants and Trees",
    "topicsJson": "[\"Types of Plants (Herbs, Shrubs, Trees)\",\"Useful Plant Products\",\"Plant Care\"]",
    "topics": [
      "Types of Plants (Herbs, Shrubs, Trees)",
      "Useful Plant Products",
      "Plant Care"
    ],
    "learningObjectivesJson": "[\"Categorize local flora and appreciate benefits of plants\"]",
    "learningObjectives": [
      "Categorize local flora and appreciate benefits of plants"
    ]
  },
  {
    "id": "cat_c2_evs_ch3",
    "grade": "Class 2",
    "subject": "EVS",
    "chapterNumber": 3,
    "chapterTitle": "The World of Animals and Birds",
    "topicsJson": "[\"Animal Habitats\",\"Food Habits (Herbivores, Carnivores)\",\"Bird Feathers and Nests\"]",
    "topics": [
      "Animal Habitats",
      "Food Habits (Herbivores, Carnivores)",
      "Bird Feathers and Nests"
    ],
    "learningObjectivesJson": "[\"Classify common animal behaviors and nesting patterns\"]",
    "learningObjectives": [
      "Classify common animal behaviors and nesting patterns"
    ]
  },
  {
    "id": "cat_c2_evs_ch4",
    "grade": "Class 2",
    "subject": "EVS",
    "chapterNumber": 4,
    "chapterTitle": "Air and Water Around Us",
    "topicsJson": "[\"Properties of Clean Air\",\"Water Cycle in Nature\",\"Preventing Water Wastage\"]",
    "topics": [
      "Properties of Clean Air",
      "Water Cycle in Nature",
      "Preventing Water Wastage"
    ],
    "learningObjectivesJson": "[\"Understand vital roles of clean air and water conservation\"]",
    "learningObjectives": [
      "Understand vital roles of clean air and water conservation"
    ]
  },
  {
    "id": "cat_c2_evs_ch5",
    "grade": "Class 2",
    "subject": "EVS",
    "chapterNumber": 5,
    "chapterTitle": "Travel, Safety and Signals",
    "topicsJson": "[\"Means of Transport (Land, Water, Air)\",\"Traffic Rules and Zebra Crossing\",\"Safety at Home and School\"]",
    "topics": [
      "Means of Transport (Land, Water, Air)",
      "Traffic Rules and Zebra Crossing",
      "Safety at Home and School"
    ],
    "learningObjectivesJson": "[\"Follow pedestrian traffic rules and stay safe on roads\"]",
    "learningObjectives": [
      "Follow pedestrian traffic rules and stay safe on roads"
    ]
  },
  {
    "id": "cat_c2_eng_ch1",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Fun with Friends",
    "topicsJson": "[\"Friendship and Sharing\",\"Common Nouns\",\"Short Vowel Sounds\"]",
    "topics": [
      "Friendship and Sharing",
      "Common Nouns",
      "Short Vowel Sounds"
    ],
    "learningObjectivesJson": "[\"Express social feelings and identify common naming words\"]",
    "learningObjectives": [
      "Express social feelings and identify common naming words"
    ]
  },
  {
    "id": "cat_c2_eng_ch2",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Picture Reading",
    "topicsJson": "[\"Visual Storytelling\",\"Action Verbs\",\"Sentence Construction\"]",
    "topics": [
      "Visual Storytelling",
      "Action Verbs",
      "Sentence Construction"
    ],
    "learningObjectivesJson": "[\"Construct simple English sentences from picture prompts\"]",
    "learningObjectives": [
      "Construct simple English sentences from picture prompts"
    ]
  },
  {
    "id": "cat_c2_eng_ch3",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "It is Fun",
    "topicsJson": "[\"Action Rhymes\",\"Movement Verbs\",\"Rhyming Words\"]",
    "topics": [
      "Action Rhymes",
      "Movement Verbs",
      "Rhyming Words"
    ],
    "learningObjectivesJson": "[\"Recite action poems and identify rhyming pairs\"]",
    "learningObjectives": [
      "Recite action poems and identify rhyming pairs"
    ]
  },
  {
    "id": "cat_c2_eng_ch4",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "Seeing without Seeing",
    "topicsJson": "[\"Empathy for Differently-Abled\",\"Touch and Hearing Senses\",\"Braille Awareness\"]",
    "topics": [
      "Empathy for Differently-Abled",
      "Touch and Hearing Senses",
      "Braille Awareness"
    ],
    "learningObjectivesJson": "[\"Develop empathy for visually impaired individuals\"]",
    "learningObjectives": [
      "Develop empathy for visually impaired individuals"
    ]
  },
  {
    "id": "cat_c2_eng_ch5",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "Going Places",
    "topicsJson": "[\"Means of Travel\",\"Vehicle Names\",\"Prepositions (in, on, under)\"]",
    "topics": [
      "Means of Travel",
      "Vehicle Names",
      "Prepositions (in, on, under)"
    ],
    "learningObjectivesJson": "[\"Use prepositions of place correctly in everyday speech\"]",
    "learningObjectives": [
      "Use prepositions of place correctly in everyday speech"
    ]
  },
  {
    "id": "cat_c2_eng_ch6",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Between Home and School",
    "topicsJson": "[\"Daily Commute Landmarks\",\"Direction Words\",\"Simple Present Tense\"]",
    "topics": [
      "Daily Commute Landmarks",
      "Direction Words",
      "Simple Present Tense"
    ],
    "learningObjectivesJson": "[\"Describe paths, turns, and familiar community landmarks\"]",
    "learningObjectives": [
      "Describe paths, turns, and familiar community landmarks"
    ]
  },
  {
    "id": "cat_c2_eng_ch7",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "This is My Town",
    "topicsJson": "[\"Town Places (Library, Market, Park)\",\"Descriptive Adjectives\",\"Community Pride\"]",
    "topics": [
      "Town Places (Library, Market, Park)",
      "Descriptive Adjectives",
      "Community Pride"
    ],
    "learningObjectivesJson": "[\"Use descriptive adjectives to describe neighborhoods\"]",
    "learningObjectives": [
      "Use descriptive adjectives to describe neighborhoods"
    ]
  },
  {
    "id": "cat_c2_eng_ch8",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "Life Around Us",
    "topicsJson": "[\"Nature Appreciation\",\"Garden Insects and Birds\",\"Singular and Plural (-s, -es)\"]",
    "topics": [
      "Nature Appreciation",
      "Garden Insects and Birds",
      "Singular and Plural (-s, -es)"
    ],
    "learningObjectivesJson": "[\"Form regular plural nouns and appreciate biodiversity\"]",
    "learningObjectives": [
      "Form regular plural nouns and appreciate biodiversity"
    ]
  },
  {
    "id": "cat_c2_eng_ch9",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "My Name",
    "topicsJson": "[\"Personal Identity\",\"Spelling Names\",\"Capital Letters and Full Stops\"]",
    "topics": [
      "Personal Identity",
      "Spelling Names",
      "Capital Letters and Full Stops"
    ],
    "learningObjectivesJson": "[\"Apply basic punctuation rules: capital letters and periods\"]",
    "learningObjectives": [
      "Apply basic punctuation rules: capital letters and periods"
    ]
  },
  {
    "id": "cat_c2_eng_ch10",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 10,
    "chapterTitle": "The Crow",
    "topicsJson": "[\"Bird Habits\",\"Clever Animals Folk Tales\",\"Story Sequencing\"]",
    "topics": [
      "Bird Habits",
      "Clever Animals Folk Tales",
      "Story Sequencing"
    ],
    "learningObjectivesJson": "[\"Sequence narrative events chronologically\"]",
    "learningObjectives": [
      "Sequence narrative events chronologically"
    ]
  },
  {
    "id": "cat_c2_eng_ch11",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 11,
    "chapterTitle": "The Smart Monkey",
    "topicsJson": "[\"Wit and Humor in Stories\",\"Animal Characteristics\",\"Opposite Words (Antonyms)\"]",
    "topics": [
      "Wit and Humor in Stories",
      "Animal Characteristics",
      "Opposite Words (Antonyms)"
    ],
    "learningObjectivesJson": "[\"Identify common antonyms and enjoy humorous stories\"]",
    "learningObjectives": [
      "Identify common antonyms and enjoy humorous stories"
    ]
  },
  {
    "id": "cat_c2_eng_ch12",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 12,
    "chapterTitle": "Little Drops of Water",
    "topicsJson": "[\"Classic Rhyme Recitation\",\"Importance of Small Contributions\",\"Nature Rhythm\"]",
    "topics": [
      "Classic Rhyme Recitation",
      "Importance of Small Contributions",
      "Nature Rhythm"
    ],
    "learningObjectivesJson": "[\"Appreciate poetic rhythm and moral value of small acts\"]",
    "learningObjectives": [
      "Appreciate poetic rhythm and moral value of small acts"
    ]
  },
  {
    "id": "cat_c2_eng_ch13",
    "grade": "Class 2",
    "subject": "English",
    "chapterNumber": 13,
    "chapterTitle": "Let us Read",
    "topicsJson": "[\"Guided Reading Fluency\",\"Sight Words\",\"Reading Comprehension Questions\"]",
    "topics": [
      "Guided Reading Fluency",
      "Sight Words",
      "Reading Comprehension Questions"
    ],
    "learningObjectivesJson": "[\"Demonstrate independent sentence reading fluency\"]",
    "learningObjectives": [
      "Demonstrate independent sentence reading fluency"
    ]
  },
  {
    "id": "cat_c2_hin_ch1",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 1,
    "chapterTitle": "नीमा की दादी",
    "topicsJson": "[\"पारिवारिक स्नेह\",\"दादी का चश्मा\",\"संवाद\"]",
    "topics": [
      "पारिवारिक स्नेह",
      "दादी का चश्मा",
      "संवाद"
    ],
    "learningObjectivesJson": "[\"पारिवारिक रिश्तों का महत्व व आत्मीयता\"]",
    "learningObjectives": [
      "पारिवारिक रिश्तों का महत्व व आत्मीयता"
    ]
  },
  {
    "id": "cat_c2_hin_ch2",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 2,
    "chapterTitle": "घर",
    "topicsJson": "[\"घर के कमरे\",\"घर की सुरक्षा\",\"कविता पाठ\"]",
    "topics": [
      "घर के कमरे",
      "घर की सुरक्षा",
      "कविता पाठ"
    ],
    "learningObjectivesJson": "[\"घर की संकल्पना व स्वच्छता\"]",
    "learningObjectives": [
      "घर की संकल्पना व स्वच्छता"
    ]
  },
  {
    "id": "cat_c2_hin_ch3",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 3,
    "chapterTitle": "माला की चाँदी की पायल",
    "topicsJson": "[\"बाल उत्सुकता\",\"पारंपरिक आभूषण\",\"वर्ण अभ्यास\"]",
    "topics": [
      "बाल उत्सुकता",
      "पारंपरिक आभूषण",
      "वर्ण अभ्यास"
    ],
    "learningObjectivesJson": "[\"ध्वनि व शब्द निर्माण\"]",
    "learningObjectives": [
      "ध्वनि व शब्द निर्माण"
    ]
  },
  {
    "id": "cat_c2_hin_ch4",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 4,
    "chapterTitle": "माँ",
    "topicsJson": "[\"मातृ प्रेम\",\"संवेदना\",\"भावपूर्ण वाचन\"]",
    "topics": [
      "मातृ प्रेम",
      "संवेदना",
      "भावपूर्ण वाचन"
    ],
    "learningObjectivesJson": "[\"माँ के प्रति कृतज्ञता की भावना\"]",
    "learningObjectives": [
      "माँ के प्रति कृतज्ञता की भावना"
    ]
  },
  {
    "id": "cat_c2_hin_ch5",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 5,
    "chapterTitle": "थाथू और मैं",
    "topicsJson": "[\"नाना/दादा का रिश्ता\",\"कहानियाँ\",\"शब्दकोश\"]",
    "topics": [
      "नाना/दादा का रिश्ता",
      "कहानियाँ",
      "शब्दकोश"
    ],
    "learningObjectivesJson": "[\"विभिन्न संबंधों की समझ\"]",
    "learningObjectives": [
      "विभिन्न संबंधों की समझ"
    ]
  },
  {
    "id": "cat_c2_hin_ch6",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 6,
    "chapterTitle": "चींटा",
    "topicsJson": "[\"परिश्रम\",\"जीव-जगत\",\"तुकांत पंक्तियाँ\"]",
    "topics": [
      "परिश्रम",
      "जीव-जगत",
      "तुकांत पंक्तियाँ"
    ],
    "learningObjectivesJson": "[\"चींटी के परिश्रम से प्रेरणा लेना\"]",
    "learningObjectives": [
      "चींटी के परिश्रम से प्रेरणा लेना"
    ]
  },
  {
    "id": "cat_c2_hin_ch7",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 7,
    "chapterTitle": "टिल्लू जी",
    "topicsJson": "[\"हास्य कविता\",\"अभिनय\",\"लयबद्धता\"]",
    "topics": [
      "हास्य कविता",
      "अभिनय",
      "लयबद्धता"
    ],
    "learningObjectivesJson": "[\"हास्य भाव का आनंद व अभिनय\"]",
    "learningObjectives": [
      "हास्य भाव का आनंद व अभिनय"
    ]
  },
  {
    "id": "cat_c2_hin_ch8",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 8,
    "chapterTitle": "तीन दोस्त",
    "topicsJson": "[\"सच्ची मित्रता\",\"आपसी मदद\",\"चित्र कथा\"]",
    "topics": [
      "सच्ची मित्रता",
      "आपसी मदद",
      "चित्र कथा"
    ],
    "learningObjectivesJson": "[\"मित्रता के नैतिक मूल्य\"]",
    "learningObjectives": [
      "मित्रता के नैतिक मूल्य"
    ]
  },
  {
    "id": "cat_c2_hin_ch9",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 9,
    "chapterTitle": "दुनिया रंग-बिरंगी",
    "topicsJson": "[\"रंगों का संसार\",\"प्रकृति सौंदर्य\",\"विशेषण\"]",
    "topics": [
      "रंगों का संसार",
      "प्रकृति सौंदर्य",
      "विशेषण"
    ],
    "learningObjectivesJson": "[\"रंगों व वस्तुओं के गुण पहचानना\"]",
    "learningObjectives": [
      "रंगों व वस्तुओं के गुण पहचानना"
    ]
  },
  {
    "id": "cat_c2_hin_ch10",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 10,
    "chapterTitle": "कौन",
    "topicsJson": "[\"जिज्ञासा\",\"पहेलियाँ\",\"तार्किक सोच\"]",
    "topics": [
      "जिज्ञासा",
      "पहेलियाँ",
      "तार्किक सोच"
    ],
    "learningObjectivesJson": "[\"पहेलियों को हल करना\"]",
    "learningObjectives": [
      "पहेलियों को हल करना"
    ]
  },
  {
    "id": "cat_c2_hin_ch11",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 11,
    "chapterTitle": "बैंगनी जोजो",
    "topicsJson": "[\"काल्पनिक कहानी\",\"रचनात्मकता\",\"वाक्य रचना\"]",
    "topics": [
      "काल्पनिक कहानी",
      "रचनात्मकता",
      "वाक्य रचना"
    ],
    "learningObjectivesJson": "[\"काल्पनिक कथा रचना\"]",
    "learningObjectives": [
      "काल्पनिक कथा रचना"
    ]
  },
  {
    "id": "cat_c2_hin_ch12",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 12,
    "chapterTitle": "तोसिया का सपना",
    "topicsJson": "[\"सपनों का संसार\",\"बाल मनोविज्ञान\",\"अनुस्वार अभ्यास\"]",
    "topics": [
      "सपनों का संसार",
      "बाल मनोविज्ञान",
      "अनुस्वार अभ्यास"
    ],
    "learningObjectivesJson": "[\"सपनों की अभिव्यक्ति व अनुस्वार ज्ञान\"]",
    "learningObjectives": [
      "सपनों की अभिव्यक्ति व अनुस्वार ज्ञान"
    ]
  },
  {
    "id": "cat_c2_hin_ch13",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 13,
    "chapterTitle": "तालाब",
    "topicsJson": "[\"जल स्रोत\",\"जलीय जीव\",\"पर्यावरण\"]",
    "topics": [
      "जल स्रोत",
      "जलीय जीव",
      "पर्यावरण"
    ],
    "learningObjectivesJson": "[\"तालाब के पारिस्थितिकी तंत्र की समझ\"]",
    "learningObjectives": [
      "तालाब के पारिस्थितिकी तंत्र की समझ"
    ]
  },
  {
    "id": "cat_c2_hin_ch14",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 14,
    "chapterTitle": "बीज",
    "topicsJson": "[\"पौधे का विकास\",\"अंकुरण प्रक्रिया\",\"प्रकृति निरीक्षण\"]",
    "topics": [
      "पौधे का विकास",
      "अंकुरण प्रक्रिया",
      "प्रकृति निरीक्षण"
    ],
    "learningObjectivesJson": "[\"बीज से पौधे बनने का क्रम समझना\"]",
    "learningObjectives": [
      "बीज से पौधे बनने का क्रम समझना"
    ]
  },
  {
    "id": "cat_c2_hin_ch15",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 15,
    "chapterTitle": "किसान",
    "topicsJson": "[\"अन्नदाता\",\"कृषि कार्य\",\"श्रम की महत्ता\"]",
    "topics": [
      "अन्नदाता",
      "कृषि कार्य",
      "श्रम की महत्ता"
    ],
    "learningObjectivesJson": "[\"किसान के श्रम के प्रति सम्मान\"]",
    "learningObjectives": [
      "किसान के श्रम के प्रति सम्मान"
    ]
  },
  {
    "id": "cat_c2_hin_ch16",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 16,
    "chapterTitle": "मूली",
    "topicsJson": "[\"सब्जियाँ\",\"जड़ वाली फसलें\",\"कथा वाचन\"]",
    "topics": [
      "सब्जियाँ",
      "जड़ वाली फसलें",
      "कथा वाचन"
    ],
    "learningObjectivesJson": "[\"पौधों के विभिन्न भागों की पहचान\"]",
    "learningObjectives": [
      "पौधों के विभिन्न भागों की पहचान"
    ]
  },
  {
    "id": "cat_c2_hin_ch17",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 17,
    "chapterTitle": "बरसात और मेंढक",
    "topicsJson": "[\"वर्षा काल\",\"मेंढक की टर्र-टर्र\",\"ऋतु परिवर्तन\"]",
    "topics": [
      "वर्षा काल",
      "मेंढक की टर्र-टर्र",
      "ऋतु परिवर्तन"
    ],
    "learningObjectivesJson": "[\"वर्षा ऋतु के जीवों का व्यवहार\"]",
    "learningObjectives": [
      "वर्षा ऋतु के जीवों का व्यवहार"
    ]
  },
  {
    "id": "cat_c2_hin_ch18",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 18,
    "chapterTitle": "शेर और चूहे की दोस्ती",
    "topicsJson": "[\"पंचतंत्र की कहानी\",\"क्षमाशीलता\",\"सच्ची सहायता\"]",
    "topics": [
      "पंचतंत्र की कहानी",
      "क्षमाशीलता",
      "सच्ची सहायता"
    ],
    "learningObjectivesJson": "[\"किसी को छोटा न समझना व परोपकार\"]",
    "learningObjectives": [
      "किसी को छोटा न समझना व परोपकार"
    ]
  },
  {
    "id": "cat_c2_hin_ch19",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 19,
    "chapterTitle": "आउट",
    "topicsJson": "[\"क्रिकेट का खेल\",\"खेल भावना\",\"नियम पालन\"]",
    "topics": [
      "क्रिकेट का खेल",
      "खेल भावना",
      "नियम पालन"
    ],
    "learningObjectivesJson": "[\"खेलों के नियम व टीम भावना\"]",
    "learningObjectives": [
      "खेलों के नियम व टीम भावना"
    ]
  },
  {
    "id": "cat_c2_hin_ch20",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 20,
    "chapterTitle": "छुपन-छुपाई",
    "topicsJson": "[\"पारंपरिक खेल\",\"स्थान बोध (अंदर, बाहर, पीछे)\",\"क्रिया शब्द\"]",
    "topics": [
      "पारंपरिक खेल",
      "स्थान बोध (अंदर, बाहर, पीछे)",
      "क्रिया शब्द"
    ],
    "learningObjectivesJson": "[\"क्रिया शब्दों की पहचान\"]",
    "learningObjectives": [
      "क्रिया शब्दों की पहचान"
    ]
  },
  {
    "id": "cat_c2_hin_ch21",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 21,
    "chapterTitle": "हाथी साइकिल चला रहा था",
    "topicsJson": "[\"कल्पना और हास्य\",\"पशु जगत\",\"रचनात्मक अभिव्यक्ति\"]",
    "topics": [
      "कल्पना और हास्य",
      "पशु जगत",
      "रचनात्मक अभिव्यक्ति"
    ],
    "learningObjectivesJson": "[\"काल्पनिक हास्य का आनंद\"]",
    "learningObjectives": [
      "काल्पनिक हास्य का आनंद"
    ]
  },
  {
    "id": "cat_c2_hin_ch22",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 22,
    "chapterTitle": "चार दिशाएँ",
    "topicsJson": "[\"उत्तर, दक्षिण, पूर्व, पश्चिम\",\"दिशा ज्ञान\",\"सूर्य उदय\"]",
    "topics": [
      "उत्तर, दक्षिण, पूर्व, पश्चिम",
      "दिशा ज्ञान",
      "सूर्य उदय"
    ],
    "learningObjectivesJson": "[\"दिशाओं की पहचान करना\"]",
    "learningObjectives": [
      "दिशाओं की पहचान करना"
    ]
  },
  {
    "id": "cat_c2_hin_ch23",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 23,
    "chapterTitle": "चंदा मामा",
    "topicsJson": "[\"रात का आकाश\",\"चाँद की कलाएँ\",\"लोरी\"]",
    "topics": [
      "रात का आकाश",
      "चाँद की कलाएँ",
      "लोरी"
    ],
    "learningObjectivesJson": "[\"चाँद के विभिन्न रूपों की समझ\"]",
    "learningObjectives": [
      "चाँद के विभिन्न रूपों की समझ"
    ]
  },
  {
    "id": "cat_c2_hin_ch24",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 24,
    "chapterTitle": "गिरे ताल में चंदा मामा",
    "topicsJson": "[\"प्रतिबिंब की समझ\",\"पानी में परछाई\",\"तार्किक सोच\"]",
    "topics": [
      "प्रतिबिंब की समझ",
      "पानी में परछाई",
      "तार्किक सोच"
    ],
    "learningObjectivesJson": "[\"प्रकाश व प्रतिबिंब की बुनियादी समझ\"]",
    "learningObjectives": [
      "प्रकाश व प्रतिबिंब की बुनियादी समझ"
    ]
  },
  {
    "id": "cat_c2_hin_ch25",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 25,
    "chapterTitle": "सबसे बड़ा छाता",
    "topicsJson": "[\"आविष्कार\",\"सहयोग\",\"कहानी रचना\"]",
    "topics": [
      "आविष्कार",
      "सहयोग",
      "कहानी रचना"
    ],
    "learningObjectivesJson": "[\"समस्या समाधान की सोच\"]",
    "learningObjectives": [
      "समस्या समाधान की सोच"
    ]
  },
  {
    "id": "cat_c2_hin_ch26",
    "grade": "Class 2",
    "subject": "Hindi",
    "chapterNumber": 26,
    "chapterTitle": "बादल",
    "topicsJson": "[\"मेघगर्जन\",\"जल चक्र\",\"प्रकृति प्रेम\"]",
    "topics": [
      "मेघगर्जन",
      "जल चक्र",
      "प्रकृति प्रेम"
    ],
    "learningObjectivesJson": "[\"बादल बनने की प्राकृतिक प्रक्रिया\"]",
    "learningObjectives": [
      "बादल बनने की प्राकृतिक प्रक्रिया"
    ]
  },
  {
    "id": "cat_c3_math_ch1",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "What's in a Name?",
    "topicsJson": "[\"3-Digit Numbers (100-999)\",\"Place Value & Face Value\",\"Number Names\"]",
    "topics": [
      "3-Digit Numbers (100-999)",
      "Place Value & Face Value",
      "Number Names"
    ],
    "learningObjectivesJson": "[\"Read, write, and compare 3-digit whole numbers\"]",
    "learningObjectives": [
      "Read, write, and compare 3-digit whole numbers"
    ]
  },
  {
    "id": "cat_c3_math_ch2",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Toy Joy",
    "topicsJson": "[\"3-Digit Addition with Regrouping\",\"Subtraction with Borrowing\",\"Mental Math Strategies\"]",
    "topics": [
      "3-Digit Addition with Regrouping",
      "Subtraction with Borrowing",
      "Mental Math Strategies"
    ],
    "learningObjectivesJson": "[\"Execute 3-digit addition and subtraction algorithms\"]",
    "learningObjectives": [
      "Execute 3-digit addition and subtraction algorithms"
    ]
  },
  {
    "id": "cat_c3_math_ch3",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Double Century",
    "topicsJson": "[\"Estimation of Sums and Differences\",\"Number Line Jumps\",\"Cricket Score Calculations\"]",
    "topics": [
      "Estimation of Sums and Differences",
      "Number Line Jumps",
      "Cricket Score Calculations"
    ],
    "learningObjectivesJson": "[\"Estimate sums and differences quickly in contextual problems\"]",
    "learningObjectives": [
      "Estimate sums and differences quickly in contextual problems"
    ]
  },
  {
    "id": "cat_c3_math_ch4",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Vacation with My Nani Maa",
    "topicsJson": "[\"2D Geometric Figures\",\"Sides and Vertices\",\"Tangram Puzzles\"]",
    "topics": [
      "2D Geometric Figures",
      "Sides and Vertices",
      "Tangram Puzzles"
    ],
    "learningObjectivesJson": "[\"Identify and construct shapes using 7-piece tangrams\"]",
    "learningObjectives": [
      "Identify and construct shapes using 7-piece tangrams"
    ]
  },
  {
    "id": "cat_c3_math_ch5",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Fun with Shapes",
    "topicsJson": "[\"Tessellations & Tiling Patterns\",\"Mirror Symmetry\",\"Straight vs Curved Edges\"]",
    "topics": [
      "Tessellations & Tiling Patterns",
      "Mirror Symmetry",
      "Straight vs Curved Edges"
    ],
    "learningObjectivesJson": "[\"Explore tiling properties and 2D symmetry\"]",
    "learningObjectives": [
      "Explore tiling properties and 2D symmetry"
    ]
  },
  {
    "id": "cat_c3_math_ch6",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "House of Hundreds – I",
    "topicsJson": "[\"Building Hundreds\",\"Decomposing Numbers\",\"Expanded Notation\"]",
    "topics": [
      "Building Hundreds",
      "Decomposing Numbers",
      "Expanded Notation"
    ],
    "learningObjectivesJson": "[\"Decompose numbers into hundreds, tens, and ones\"]",
    "learningObjectives": [
      "Decompose numbers into hundreds, tens, and ones"
    ]
  },
  {
    "id": "cat_c3_math_ch7",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Raksha Bandhan",
    "topicsJson": "[\"Metric Length: cm and m\",\"Measuring Objects with Ruler\",\"Body Unit vs Standard Unit\"]",
    "topics": [
      "Metric Length: cm and m",
      "Measuring Objects with Ruler",
      "Body Unit vs Standard Unit"
    ],
    "learningObjectivesJson": "[\"Measure physical objects using standard metric rulers\"]",
    "learningObjectives": [
      "Measure physical objects using standard metric rulers"
    ]
  },
  {
    "id": "cat_c3_math_ch8",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Fair Share",
    "topicsJson": "[\"Introduction to Fractions\",\"Equal Parts of a Whole\",\"One-Half (1/2) and One-Quarter (1/4)\"]",
    "topics": [
      "Introduction to Fractions",
      "Equal Parts of a Whole",
      "One-Half (1/2) and One-Quarter (1/4)"
    ],
    "learningObjectivesJson": "[\"Represent fractions as equal parts of an area or collection\"]",
    "learningObjectives": [
      "Represent fractions as equal parts of an area or collection"
    ]
  },
  {
    "id": "cat_c3_math_ch9",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "House of Hundreds – II",
    "topicsJson": "[\"Multi-digit Number Patterns\",\"Comparing Numbers with Symbols (<, >, =)\",\"Ascending and Descending\"]",
    "topics": [
      "Multi-digit Number Patterns",
      "Comparing Numbers with Symbols (<, >, =)",
      "Ascending and Descending"
    ],
    "learningObjectivesJson": "[\"Order 3-digit numbers systematically\"]",
    "learningObjectives": [
      "Order 3-digit numbers systematically"
    ]
  },
  {
    "id": "cat_c3_math_ch10",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Fun at Class Party!",
    "topicsJson": "[\"Multiplication as Repeated Addition\",\"Arrays and Grid Models\",\"Multiplication Tables 2 to 10\"]",
    "topics": [
      "Multiplication as Repeated Addition",
      "Arrays and Grid Models",
      "Multiplication Tables 2 to 10"
    ],
    "learningObjectivesJson": "[\"Master multiplication facts up to 10 x 10\"]",
    "learningObjectives": [
      "Master multiplication facts up to 10 x 10"
    ]
  },
  {
    "id": "cat_c3_math_ch11",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Filling and Lifting",
    "topicsJson": "[\"Capacity in Litres and Millilitres\",\"Weight in Grams and Kilograms\",\"Estimating Volumes\"]",
    "topics": [
      "Capacity in Litres and Millilitres",
      "Weight in Grams and Kilograms",
      "Estimating Volumes"
    ],
    "learningObjectivesJson": "[\"Compare and estimate liquid volumes and object weights\"]",
    "learningObjectives": [
      "Compare and estimate liquid volumes and object weights"
    ]
  },
  {
    "id": "cat_c3_math_ch12",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "Give and Take",
    "topicsJson": "[\"Multi-step Word Problems\",\"Commercial Money Transactions\",\"Change Calculation\"]",
    "topics": [
      "Multi-step Word Problems",
      "Commercial Money Transactions",
      "Change Calculation"
    ],
    "learningObjectivesJson": "[\"Solve contextual two-step word problems involving money\"]",
    "learningObjectives": [
      "Solve contextual two-step word problems involving money"
    ]
  },
  {
    "id": "cat_c3_math_ch13",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "Time Goes On",
    "topicsJson": "[\"Telling Time (Hours and Half-Hours)\",\"Calendar Calculations\",\"Elapsed Time\"]",
    "topics": [
      "Telling Time (Hours and Half-Hours)",
      "Calendar Calculations",
      "Elapsed Time"
    ],
    "learningObjectivesJson": "[\"Read analog clocks and calculate elapsed time intervals\"]",
    "learningObjectives": [
      "Read analog clocks and calculate elapsed time intervals"
    ]
  },
  {
    "id": "cat_c3_math_ch14",
    "grade": "Class 3",
    "subject": "Mathematics",
    "chapterNumber": 14,
    "chapterTitle": "The Surajkund Fair",
    "topicsJson": "[\"Data Representation\",\"Tally Charts\",\"Pictographs and Bar Charts\"]",
    "topics": [
      "Data Representation",
      "Tally Charts",
      "Pictographs and Bar Charts"
    ],
    "learningObjectivesJson": "[\"Construct and interpret tally charts and pictographs\"]",
    "learningObjectives": [
      "Construct and interpret tally charts and pictographs"
    ]
  },
  {
    "id": "cat_c3_evs_ch1",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 1,
    "chapterTitle": "Family and Friends",
    "topicsJson": "[\"Family Diversity\",\"Differently-Abled Persons\",\"Empathy and Inclusion\"]",
    "topics": [
      "Family Diversity",
      "Differently-Abled Persons",
      "Empathy and Inclusion"
    ],
    "learningObjectivesJson": "[\"Appreciate family structures and show empathy for special needs\"]",
    "learningObjectives": [
      "Appreciate family structures and show empathy for special needs"
    ]
  },
  {
    "id": "cat_c3_evs_ch2",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 2,
    "chapterTitle": "Going to the Mela",
    "topicsJson": "[\"Traditional Fairs\",\"Community Entertainment\",\"Handmade Crafts\"]",
    "topics": [
      "Traditional Fairs",
      "Community Entertainment",
      "Handmade Crafts"
    ],
    "learningObjectivesJson": "[\"Identify cultural elements in local community fairs\"]",
    "learningObjectives": [
      "Identify cultural elements in local community fairs"
    ]
  },
  {
    "id": "cat_c3_evs_ch3",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 3,
    "chapterTitle": "Celebrating Festivals",
    "topicsJson": "[\"National and Regional Festivals\",\"Festive Foods\",\"Cultural Unity\"]",
    "topics": [
      "National and Regional Festivals",
      "Festive Foods",
      "Cultural Unity"
    ],
    "learningObjectivesJson": "[\"Celebrate Indian cultural diversity and shared values\"]",
    "learningObjectives": [
      "Celebrate Indian cultural diversity and shared values"
    ]
  },
  {
    "id": "cat_c3_evs_ch4",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 4,
    "chapterTitle": "Getting to Know Plants",
    "topicsJson": "[\"Herbs, Shrubs, Trees, Climbers\",\"Leaves and Venation\",\"Plant Uses\"]",
    "topics": [
      "Herbs, Shrubs, Trees, Climbers",
      "Leaves and Venation",
      "Plant Uses"
    ],
    "learningObjectivesJson": "[\"Classify plants by structural type and leaf shape\"]",
    "learningObjectives": [
      "Classify plants by structural type and leaf shape"
    ]
  },
  {
    "id": "cat_c3_evs_ch5",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 5,
    "chapterTitle": "Plants and Animals Live Together",
    "topicsJson": "[\"Interdependence in Nature\",\"Animal Habitats\",\"Food Needs\"]",
    "topics": [
      "Interdependence in Nature",
      "Animal Habitats",
      "Food Needs"
    ],
    "learningObjectivesJson": "[\"Explain how plants and animals support one another\"]",
    "learningObjectives": [
      "Explain how plants and animals support one another"
    ]
  },
  {
    "id": "cat_c3_evs_ch6",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 6,
    "chapterTitle": "Living in Harmony",
    "topicsJson": "[\"Caring for Pets and Stray Animals\",\"Compassion\",\"Clean Surroundings\"]",
    "topics": [
      "Caring for Pets and Stray Animals",
      "Compassion",
      "Clean Surroundings"
    ],
    "learningObjectivesJson": "[\"Demonstrate responsible behavior towards living creatures\"]",
    "learningObjectives": [
      "Demonstrate responsible behavior towards living creatures"
    ]
  },
  {
    "id": "cat_c3_evs_ch7",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 7,
    "chapterTitle": "Water: A Precious Gift",
    "topicsJson": "[\"Natural Water Sources\",\"Potable Water\",\"Rainwater Harvesting Basics\"]",
    "topics": [
      "Natural Water Sources",
      "Potable Water",
      "Rainwater Harvesting Basics"
    ],
    "learningObjectivesJson": "[\"Identify freshwater sources and practice water conservation\"]",
    "learningObjectives": [
      "Identify freshwater sources and practice water conservation"
    ]
  },
  {
    "id": "cat_c3_evs_ch8",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 8,
    "chapterTitle": "Food We Eat",
    "topicsJson": "[\"Food Groups\",\"Regional Cuisines of India\",\"Cooking Methods\"]",
    "topics": [
      "Food Groups",
      "Regional Cuisines of India",
      "Cooking Methods"
    ],
    "learningObjectivesJson": "[\"Categorize balanced food groups and regional Indian dishes\"]",
    "learningObjectives": [
      "Categorize balanced food groups and regional Indian dishes"
    ]
  },
  {
    "id": "cat_c3_evs_ch9",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 9,
    "chapterTitle": "Staying Healthy and Happy",
    "topicsJson": "[\"Physical Exercise\",\"Mental Well-being\",\"Rest and Sleep Routine\"]",
    "topics": [
      "Physical Exercise",
      "Mental Well-being",
      "Rest and Sleep Routine"
    ],
    "learningObjectivesJson": "[\"Practice healthy physical and mental lifestyle habits\"]",
    "learningObjectives": [
      "Practice healthy physical and mental lifestyle habits"
    ]
  },
  {
    "id": "cat_c3_evs_ch10",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 10,
    "chapterTitle": "This World of Things",
    "topicsJson": "[\"Natural vs Man-made Materials\",\"Wood, Metal, Plastic, Clay\",\"Properties of Things\"]",
    "topics": [
      "Natural vs Man-made Materials",
      "Wood, Metal, Plastic, Clay",
      "Properties of Things"
    ],
    "learningObjectivesJson": "[\"Distinguish natural from synthetic raw materials\"]",
    "learningObjectives": [
      "Distinguish natural from synthetic raw materials"
    ]
  },
  {
    "id": "cat_c3_evs_ch11",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 11,
    "chapterTitle": "Making Things",
    "topicsJson": "[\"Traditional Crafts\",\"Pottery and Weaving\",\"Tools and Artisans\"]",
    "topics": [
      "Traditional Crafts",
      "Pottery and Weaving",
      "Tools and Artisans"
    ],
    "learningObjectivesJson": "[\"Appreciate artisanal craftsmanship and simple tools\"]",
    "learningObjectives": [
      "Appreciate artisanal craftsmanship and simple tools"
    ]
  },
  {
    "id": "cat_c3_evs_ch12",
    "grade": "Class 3",
    "subject": "EVS",
    "chapterNumber": 12,
    "chapterTitle": "Taking Charge of Waste",
    "topicsJson": "[\"Wet and Dry Waste Segregation\",\"Reduce, Reuse, Recycle\",\"Composting\"]",
    "topics": [
      "Wet and Dry Waste Segregation",
      "Reduce, Reuse, Recycle",
      "Composting"
    ],
    "learningObjectivesJson": "[\"Implement household waste segregation and recycling\"]",
    "learningObjectives": [
      "Implement household waste segregation and recycling"
    ]
  },
  {
    "id": "cat_c3_eng_ch1",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Colours",
    "topicsJson": "[\"Nature Colours Poem\",\"Visual Rhymes\",\"Colour Adjectives\"]",
    "topics": [
      "Nature Colours Poem",
      "Visual Rhymes",
      "Colour Adjectives"
    ],
    "learningObjectivesJson": "[\"Identify colors and descriptive adjectives in poetic context\"]",
    "learningObjectives": [
      "Identify colors and descriptive adjectives in poetic context"
    ]
  },
  {
    "id": "cat_c3_eng_ch2",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Badal and Moti",
    "topicsJson": "[\"Boy and Dog Friendship\",\"Compassion to Animals\",\"Simple Past Tense\"]",
    "topics": [
      "Boy and Dog Friendship",
      "Compassion to Animals",
      "Simple Past Tense"
    ],
    "learningObjectivesJson": "[\"Understand narrative sequence and read simple past verbs\"]",
    "learningObjectives": [
      "Understand narrative sequence and read simple past verbs"
    ]
  },
  {
    "id": "cat_c3_eng_ch3",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Best Friends",
    "topicsJson": "[\"Peer Relationships\",\"Cooperation\",\"Pronouns (he, she, they)\"]",
    "topics": [
      "Peer Relationships",
      "Cooperation",
      "Pronouns (he, she, they)"
    ],
    "learningObjectivesJson": "[\"Use subject pronouns correctly in sentences\"]",
    "learningObjectives": [
      "Use subject pronouns correctly in sentences"
    ]
  },
  {
    "id": "cat_c3_eng_ch4",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "Out in the Garden",
    "topicsJson": "[\"Outdoor Play Poem\",\"Garden Vocabulary\",\"Action Words\"]",
    "topics": [
      "Outdoor Play Poem",
      "Garden Vocabulary",
      "Action Words"
    ],
    "learningObjectivesJson": "[\"Recite poems rhythmically and expand outdoor play vocabulary\"]",
    "learningObjectives": [
      "Recite poems rhythmically and expand outdoor play vocabulary"
    ]
  },
  {
    "id": "cat_c3_eng_ch5",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "Talking Toys",
    "topicsJson": "[\"Fantasy Story\",\"Dialogue Reading\",\"Punctuation (Quotation Marks)\"]",
    "topics": [
      "Fantasy Story",
      "Dialogue Reading",
      "Punctuation (Quotation Marks)"
    ],
    "learningObjectivesJson": "[\"Read dialogues with appropriate vocal expression\"]",
    "learningObjectives": [
      "Read dialogues with appropriate vocal expression"
    ]
  },
  {
    "id": "cat_c3_eng_ch6",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Paper Boats",
    "topicsJson": "[\"Creative Play\",\"Childhood Imagination\",\"Prepositions\"]",
    "topics": [
      "Creative Play",
      "Childhood Imagination",
      "Prepositions"
    ],
    "learningObjectivesJson": "[\"Express childhood experiences through creative writing\"]",
    "learningObjectives": [
      "Express childhood experiences through creative writing"
    ]
  },
  {
    "id": "cat_c3_eng_ch7",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "The Big Laddoo",
    "topicsJson": "[\"Sharing Food\",\"Indian Sweets\",\"Collective Nouns\"]",
    "topics": [
      "Sharing Food",
      "Indian Sweets",
      "Collective Nouns"
    ],
    "learningObjectivesJson": "[\"Appreciate the joy of sharing and identify collective nouns\"]",
    "learningObjectives": [
      "Appreciate the joy of sharing and identify collective nouns"
    ]
  },
  {
    "id": "cat_c3_eng_ch8",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "Thank God!",
    "topicsJson": "[\"Gratitude for Nature\",\"Moral Awareness\",\"Exclamatory Sentences\"]",
    "topics": [
      "Gratitude for Nature",
      "Moral Awareness",
      "Exclamatory Sentences"
    ],
    "learningObjectivesJson": "[\"Express gratitude and use exclamatory punctuation\"]",
    "learningObjectives": [
      "Express gratitude and use exclamatory punctuation"
    ]
  },
  {
    "id": "cat_c3_eng_ch9",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "Madhu's Wish",
    "topicsJson": "[\"Wishes and Realities\",\"Contentment\",\"Modal Verbs (can, could)\"]",
    "topics": [
      "Wishes and Realities",
      "Contentment",
      "Modal Verbs (can, could)"
    ],
    "learningObjectivesJson": "[\"Understand story themes and apply modal auxiliary verbs\"]",
    "learningObjectives": [
      "Understand story themes and apply modal auxiliary verbs"
    ]
  },
  {
    "id": "cat_c3_eng_ch10",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 10,
    "chapterTitle": "Night",
    "topicsJson": "[\"Nocturnal Sky Poem\",\"Stars and Moon\",\"Compound Words\"]",
    "topics": [
      "Nocturnal Sky Poem",
      "Stars and Moon",
      "Compound Words"
    ],
    "learningObjectivesJson": "[\"Identify nocturnal vocabulary and form compound words\"]",
    "learningObjectives": [
      "Identify nocturnal vocabulary and form compound words"
    ]
  },
  {
    "id": "cat_c3_eng_ch11",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 11,
    "chapterTitle": "Chanda Mama Counts the Stars",
    "topicsJson": "[\"Celestial Folk Tale\",\"Counting Stars\",\"Comparative Adjectives\"]",
    "topics": [
      "Celestial Folk Tale",
      "Counting Stars",
      "Comparative Adjectives"
    ],
    "learningObjectivesJson": "[\"Read folk stories and use comparative adjective degrees\"]",
    "learningObjectives": [
      "Read folk stories and use comparative adjective degrees"
    ]
  },
  {
    "id": "cat_c3_eng_ch12",
    "grade": "Class 3",
    "subject": "English",
    "chapterNumber": 12,
    "chapterTitle": "Chandrayaan",
    "topicsJson": "[\"Indian Space Exploration\",\"Moon Mission Pride\",\"Science Vocabulary\"]",
    "topics": [
      "Indian Space Exploration",
      "Moon Mission Pride",
      "Science Vocabulary"
    ],
    "learningObjectivesJson": "[\"Learn about India's lunar achievements and space vocabulary\"]",
    "learningObjectives": [
      "Learn about India's lunar achievements and space vocabulary"
    ]
  },
  {
    "id": "cat_c3_hin_ch1",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 1,
    "chapterTitle": "सीखो (कविता)",
    "topicsJson": "[\"प्रकृति से सीख\",\"फूलों से हँसना\",\"सदाचार\"]",
    "topics": [
      "प्रकृति से सीख",
      "फूलों से हँसना",
      "सदाचार"
    ],
    "learningObjectivesJson": "[\"प्रकृति के तत्वों से सदगुण सीखना\"]",
    "learningObjectives": [
      "प्रकृति के तत्वों से सदगुण सीखना"
    ]
  },
  {
    "id": "cat_c3_hin_ch2",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 2,
    "chapterTitle": "चींटी",
    "topicsJson": "[\"अनुशासन\",\"परिश्रम\",\"वाक्य विन्यास\"]",
    "topics": [
      "अनुशासन",
      "परिश्रम",
      "वाक्य विन्यास"
    ],
    "learningObjectivesJson": "[\"चींटियों के अनुशासन से प्रेरणा लेना\"]",
    "learningObjectives": [
      "चींटियों के अनुशासन से प्रेरणा लेना"
    ]
  },
  {
    "id": "cat_c3_hin_ch3",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 3,
    "chapterTitle": "कितने पैर?",
    "topicsJson": "[\"जीव-जंतुओं के पैर\",\"गणना कौशल\",\"तार्किक सोच\"]",
    "topics": [
      "जीव-जंतुओं के पैर",
      "गणना कौशल",
      "तार्किक सोच"
    ],
    "learningObjectivesJson": "[\"पशु-पक्षियों के शारीरिक अंगों की पहचान\"]",
    "learningObjectives": [
      "पशु-पक्षियों के शारीरिक अंगों की पहचान"
    ]
  },
  {
    "id": "cat_c3_hin_ch4",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 4,
    "chapterTitle": "बया हमारी चिड़िया रानी!",
    "topicsJson": "[\"पक्षी का घोंसला\",\"प्रकृति प्रेम\",\"सस्वर वाचन\"]",
    "topics": [
      "पक्षी का घोंसला",
      "प्रकृति प्रेम",
      "सस्वर वाचन"
    ],
    "learningObjectivesJson": "[\"बया पक्षी की कलात्मकता की सराहना\"]",
    "learningObjectives": [
      "बया पक्षी की कलात्मकता की सराहना"
    ]
  },
  {
    "id": "cat_c3_hin_ch5",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 5,
    "chapterTitle": "आम का पेड़",
    "topicsJson": "[\"वृक्षों का महत्व\",\"ऋतु अनुसार फल\",\"पर्यावरण\"]",
    "topics": [
      "वृक्षों का महत्व",
      "ऋतु अनुसार फल",
      "पर्यावरण"
    ],
    "learningObjectivesJson": "[\"पेड़ों के संरक्षण का संकल्प\"]",
    "learningObjectives": [
      "पेड़ों के संरक्षण का संकल्प"
    ]
  },
  {
    "id": "cat_c3_hin_ch6",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 6,
    "chapterTitle": "बीरबल की खिचड़ी",
    "topicsJson": "[\"बीरबल की चतुराई\",\"न्याय\",\"अकबर-बीरबल कथा\"]",
    "topics": [
      "बीरबल की चतुराई",
      "न्याय",
      "अकबर-बीरबल कथा"
    ],
    "learningObjectivesJson": "[\"तर्कसंगत सोच व न्याय का महत्व समझना\"]",
    "learningObjectives": [
      "तर्कसंगत सोच व न्याय का महत्व समझना"
    ]
  },
  {
    "id": "cat_c3_hin_ch7",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 7,
    "chapterTitle": "मित्र को पत्र",
    "topicsJson": "[\"पत्र लेखन प्रारूप\",\"संवाद\",\"संबोधन\"]",
    "topics": [
      "पत्र लेखन प्रारूप",
      "संवाद",
      "संबोधन"
    ],
    "learningObjectivesJson": "[\"सरल अनौपचारिक पत्र लिखना\"]",
    "learningObjectives": [
      "सरल अनौपचारिक पत्र लिखना"
    ]
  },
  {
    "id": "cat_c3_hin_ch8",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 8,
    "chapterTitle": "चतुर गीदड़",
    "topicsJson": "[\"चालाकी और सूझबूझ\",\"पंचतंत्र शैली\",\"विलोम शब्द\"]",
    "topics": [
      "चालाकी और सूझबूझ",
      "पंचतंत्र शैली",
      "विलोम शब्द"
    ],
    "learningObjectivesJson": "[\"कठिन परिस्थिति में सूझबूझ का प्रयोग\"]",
    "learningObjectives": [
      "कठिन परिस्थिति में सूझबूझ का प्रयोग"
    ]
  },
  {
    "id": "cat_c3_hin_ch9",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 9,
    "chapterTitle": "प्रकृति पर्व – फूलदेई",
    "topicsJson": "[\"उत्तराखंड का लोकपर्व\",\"पारंपरिक संस्कृति\",\"ऋतु उत्सव\"]",
    "topics": [
      "उत्तराखंड का लोकपर्व",
      "पारंपरिक संस्कृति",
      "ऋतु उत्सव"
    ],
    "learningObjectivesJson": "[\"भारतीय लोक परंपराओं का सम्मान\"]",
    "learningObjectives": [
      "भारतीय लोक परंपराओं का सम्मान"
    ]
  },
  {
    "id": "cat_c3_hin_ch10",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 10,
    "chapterTitle": "रस्साकशी",
    "topicsJson": "[\"सामूहिक खेल\",\"शारीरिक बल और एकता\",\"क्रिया पद\"]",
    "topics": [
      "सामूहिक खेल",
      "शारीरिक बल और एकता",
      "क्रिया पद"
    ],
    "learningObjectivesJson": "[\"एकजुटता व खेल भावना का विकास\"]",
    "learningObjectives": [
      "एकजुटता व खेल भावना का विकास"
    ]
  },
  {
    "id": "cat_c3_hin_ch11",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 11,
    "chapterTitle": "एक जादुई पिटारा",
    "topicsJson": "[\"रचनात्मक कल्पना\",\"रोमांच\",\"विशेषण\"]",
    "topics": [
      "रचनात्मक कल्पना",
      "रोमांच",
      "विशेषण"
    ],
    "learningObjectivesJson": "[\"कल्पनाशीलता व रचनात्मक लेखन\"]",
    "learningObjectives": [
      "कल्पनाशीलता व रचनात्मक लेखन"
    ]
  },
  {
    "id": "cat_c3_hin_ch12",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 12,
    "chapterTitle": "अपना-अपना काम",
    "topicsJson": "[\"श्रम विभाजन\",\"दैनिक दायित्व\",\"स्वावलंबन\"]",
    "topics": [
      "श्रम विभाजन",
      "दैनिक दायित्व",
      "स्वावलंबन"
    ],
    "learningObjectivesJson": "[\"अपने काम स्वयं करने की आदत\"]",
    "learningObjectives": [
      "अपने काम स्वयं करने की आदत"
    ]
  },
  {
    "id": "cat_c3_hin_ch13",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 13,
    "chapterTitle": "पेड़ों की अम्मा 'थिमक्का'",
    "topicsJson": "[\"सालूमारदा थिमक्का जीवनी\",\"पर्यावरण सेवा\",\"प्रेरणादायक प्रसंग\"]",
    "topics": [
      "सालूमारदा थिमक्का जीवनी",
      "पर्यावरण सेवा",
      "प्रेरणादायक प्रसंग"
    ],
    "learningObjectivesJson": "[\"पर्यावरण रक्षकों के जीवन से प्रेरणा\"]",
    "learningObjectives": [
      "पर्यावरण रक्षकों के जीवन से प्रेरणा"
    ]
  },
  {
    "id": "cat_c3_hin_ch14",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 14,
    "chapterTitle": "किसान की होशियारी",
    "topicsJson": "[\"बुद्धि कौशल\",\"कृषि जीवन\",\"कहावतें\"]",
    "topics": [
      "बुद्धि कौशल",
      "कृषि जीवन",
      "कहावतें"
    ],
    "learningObjectivesJson": "[\"उपस्थित बुद्धि का महत्व समझना\"]",
    "learningObjectives": [
      "उपस्थित बुद्धि का महत्व समझना"
    ]
  },
  {
    "id": "cat_c3_hin_ch15",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 15,
    "chapterTitle": "भारत",
    "topicsJson": "[\"देशभक्ति कविता\",\"राष्ट्रीय प्रतीक\",\"विविधता में एकता\"]",
    "topics": [
      "देशभक्ति कविता",
      "राष्ट्रीय प्रतीक",
      "विविधता में एकता"
    ],
    "learningObjectivesJson": "[\"राष्ट्रप्रेम की भावना का विकास\"]",
    "learningObjectives": [
      "राष्ट्रप्रेम की भावना का विकास"
    ]
  },
  {
    "id": "cat_c3_hin_ch16",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 16,
    "chapterTitle": "चंद्रयान (संवाद)",
    "topicsJson": "[\"वैज्ञानिक उपलब्धि\",\"अंतरिक्ष अनुसंधान\",\"संवाद शैली\"]",
    "topics": [
      "वैज्ञानिक उपलब्धि",
      "अंतरिक्ष अनुसंधान",
      "संवाद शैली"
    ],
    "learningObjectivesJson": "[\"वैज्ञानिक दृष्टिकोण व राष्ट्रीय गौरव\"]",
    "learningObjectives": [
      "वैज्ञानिक दृष्टिकोण व राष्ट्रीय गौरव"
    ]
  },
  {
    "id": "cat_c3_hin_ch17",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 17,
    "chapterTitle": "बोलने वाली माँद",
    "topicsJson": "[\"चालाक लोमड़ी कथा\",\"सावधानी\",\"हास्य\"]",
    "topics": [
      "चालाक लोमड़ी कथा",
      "सावधानी",
      "हास्य"
    ],
    "learningObjectivesJson": "[\"सजगता व विवेक का उपयोग\"]",
    "learningObjectives": [
      "सजगता व विवेक का उपयोग"
    ]
  },
  {
    "id": "cat_c3_hin_ch18",
    "grade": "Class 3",
    "subject": "Hindi",
    "chapterNumber": 18,
    "chapterTitle": "हम अनेक किंतु एक",
    "topicsJson": "[\"राष्ट्रीय एकता\",\"विभिन्न भाषाएँ व वेशभूषा\",\"सद्भाव\"]",
    "topics": [
      "राष्ट्रीय एकता",
      "विभिन्न भाषाएँ व वेशभूषा",
      "सद्भाव"
    ],
    "learningObjectivesJson": "[\"अनेकता में एकता का संदेश समझना\"]",
    "learningObjectives": [
      "अनेकता में एकता का संदेश समझना"
    ]
  },
  {
    "id": "cat_c4_math_ch1",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Building with Bricks",
    "topicsJson": "[\"Brick Patterns\",\"Arch and Floor Designs\",\"3D Views of Cuboids\"]",
    "topics": [
      "Brick Patterns",
      "Arch and Floor Designs",
      "3D Views of Cuboids"
    ],
    "learningObjectivesJson": "[\"Visualize 3D cuboid faces and symmetrical brick layouts\"]",
    "learningObjectives": [
      "Visualize 3D cuboid faces and symmetrical brick layouts"
    ]
  },
  {
    "id": "cat_c4_math_ch2",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Long and Short",
    "topicsJson": "[\"Metric Conversions (mm, cm, m, km)\",\"Height Measurements\",\"Sports Distance Calculations\"]",
    "topics": [
      "Metric Conversions (mm, cm, m, km)",
      "Height Measurements",
      "Sports Distance Calculations"
    ],
    "learningObjectivesJson": "[\"Convert metric length units and solve multi-step distance problems\"]",
    "learningObjectives": [
      "Convert metric length units and solve multi-step distance problems"
    ]
  },
  {
    "id": "cat_c4_math_ch3",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "A Trip to Bhopal",
    "topicsJson": "[\"Multi-step Arithmetic Operations\",\"Speed, Distance, and Travel Time\",\"Fuel Cost Estimation\"]",
    "topics": [
      "Multi-step Arithmetic Operations",
      "Speed, Distance, and Travel Time",
      "Fuel Cost Estimation"
    ],
    "learningObjectivesJson": "[\"Apply arithmetic operations to plan journeys and calculate expenses\"]",
    "learningObjectives": [
      "Apply arithmetic operations to plan journeys and calculate expenses"
    ]
  },
  {
    "id": "cat_c4_math_ch4",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Tick-Tick-Tick",
    "topicsJson": "[\"12-Hour vs 24-Hour Clocks\",\"Elapsed Time Calculations\",\"Timelines and Product Expiry Dates\"]",
    "topics": [
      "12-Hour vs 24-Hour Clocks",
      "Elapsed Time Calculations",
      "Timelines and Product Expiry Dates"
    ],
    "learningObjectivesJson": "[\"Read analog/digital clocks and verify shelf life from manufacturing dates\"]",
    "learningObjectives": [
      "Read analog/digital clocks and verify shelf life from manufacturing dates"
    ]
  },
  {
    "id": "cat_c4_math_ch5",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "The Way The World Looks",
    "topicsJson": "[\"Top, Front, and Side Views\",\"Spatial Perspective\",\"Reading Landmark Maps\"]",
    "topics": [
      "Top, Front, and Side Views",
      "Spatial Perspective",
      "Reading Landmark Maps"
    ],
    "learningObjectivesJson": "[\"Map spatial routes and interpret multiple projection perspectives\"]",
    "learningObjectives": [
      "Map spatial routes and interpret multiple projection perspectives"
    ]
  },
  {
    "id": "cat_c4_math_ch6",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "The Junk Seller",
    "topicsJson": "[\"Rate Lists\",\"Multiplication by Distributive Method\",\"Currency Transactions & Profit\"]",
    "topics": [
      "Rate Lists",
      "Multiplication by Distributive Method",
      "Currency Transactions & Profit"
    ],
    "learningObjectivesJson": "[\"Calculate earnings and commercial profits using mental multiplication\"]",
    "learningObjectives": [
      "Calculate earnings and commercial profits using mental multiplication"
    ]
  },
  {
    "id": "cat_c4_math_ch7",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Jugs and Mugs",
    "topicsJson": "[\"Capacity in Litres (L) and Millilitres (mL)\",\"Liquid Conservation\",\"Estimating Volumes\"]",
    "topics": [
      "Capacity in Litres (L) and Millilitres (mL)",
      "Liquid Conservation",
      "Estimating Volumes"
    ],
    "learningObjectivesJson": "[\"Measure and add liquid volumes using metric units\"]",
    "learningObjectives": [
      "Measure and add liquid volumes using metric units"
    ]
  },
  {
    "id": "cat_c4_math_ch8",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Carts and Wheels",
    "topicsJson": "[\"Circle Geometry\",\"Center, Radius, and Diameter\",\"Drawing Circles with Compass\"]",
    "topics": [
      "Circle Geometry",
      "Center, Radius, and Diameter",
      "Drawing Circles with Compass"
    ],
    "learningObjectivesJson": "[\"Identify parts of a circle and draw accurate circles using a compass\"]",
    "learningObjectives": [
      "Identify parts of a circle and draw accurate circles using a compass"
    ]
  },
  {
    "id": "cat_c4_math_ch9",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Halves and Quarters",
    "topicsJson": "[\"Fractional Parts of Collections\",\"Equivalent Fractions (1/2, 2/4, 4/8)\",\"Fractions on Number Line\"]",
    "topics": [
      "Fractional Parts of Collections",
      "Equivalent Fractions (1/2, 2/4, 4/8)",
      "Fractions on Number Line"
    ],
    "learningObjectivesJson": "[\"Compare and generate equivalent fractions visually\"]",
    "learningObjectives": [
      "Compare and generate equivalent fractions visually"
    ]
  },
  {
    "id": "cat_c4_math_ch10",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Play with Patterns",
    "topicsJson": "[\"Number and Letter Patterns\",\"Magic Squares and Triangles\",\"Rotational Symmetry\"]",
    "topics": [
      "Number and Letter Patterns",
      "Magic Squares and Triangles",
      "Rotational Symmetry"
    ],
    "learningObjectivesJson": "[\"Analyze algebraic rules underlying growing and rotating patterns\"]",
    "learningObjectives": [
      "Analyze algebraic rules underlying growing and rotating patterns"
    ]
  },
  {
    "id": "cat_c4_math_ch11",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Tables and Shares",
    "topicsJson": "[\"Division as Equal Sharing\",\"Long Division with Remainders\",\"Multiplication Tables up to 15\"]",
    "topics": [
      "Division as Equal Sharing",
      "Long Division with Remainders",
      "Multiplication Tables up to 15"
    ],
    "learningObjectivesJson": "[\"Perform standard division algorithm with and without remainders\"]",
    "learningObjectives": [
      "Perform standard division algorithm with and without remainders"
    ]
  },
  {
    "id": "cat_c4_math_ch12",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "How Heavy? How Light?",
    "topicsJson": "[\"Weight in Kilograms (kg) and Grams (g)\",\"Balancing Scales\",\"Tare Weight Estimation\"]",
    "topics": [
      "Weight in Kilograms (kg) and Grams (g)",
      "Balancing Scales",
      "Tare Weight Estimation"
    ],
    "learningObjectivesJson": "[\"Weigh objects accurately using standard metric balance units\"]",
    "learningObjectives": [
      "Weigh objects accurately using standard metric balance units"
    ]
  },
  {
    "id": "cat_c4_math_ch13",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "Field and Fences",
    "topicsJson": "[\"Perimeter of Polygons\",\"Perimeter of Rectangles and Squares\",\"Irregular Boundary Measurement\"]",
    "topics": [
      "Perimeter of Polygons",
      "Perimeter of Rectangles and Squares",
      "Irregular Boundary Measurement"
    ],
    "learningObjectivesJson": "[\"Calculate boundary perimeters of regular and irregular shapes\"]",
    "learningObjectives": [
      "Calculate boundary perimeters of regular and irregular shapes"
    ]
  },
  {
    "id": "cat_c4_math_ch14",
    "grade": "Class 4",
    "subject": "Mathematics",
    "chapterNumber": 14,
    "chapterTitle": "Smart Charts",
    "topicsJson": "[\"Chapati Charts (Pie Charts)\",\"Bar Graphs\",\"Frequency Tables\"]",
    "topics": [
      "Chapati Charts (Pie Charts)",
      "Bar Graphs",
      "Frequency Tables"
    ],
    "learningObjectivesJson": "[\"Construct bar charts and extract statistical conclusions\"]",
    "learningObjectives": [
      "Construct bar charts and extract statistical conclusions"
    ]
  },
  {
    "id": "cat_c4_evs_ch1",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 1,
    "chapterTitle": "Going to School",
    "topicsJson": "[\"Bridges, Trolleys, Vallam Boats\",\"Overcoming Geographical Hurdles\",\"Right to Education\"]",
    "topics": [
      "Bridges, Trolleys, Vallam Boats",
      "Overcoming Geographical Hurdles",
      "Right to Education"
    ],
    "learningObjectivesJson": "[\"Appreciate how children travel to school across India's terrains\"]",
    "learningObjectives": [
      "Appreciate how children travel to school across India's terrains"
    ]
  },
  {
    "id": "cat_c4_evs_ch2",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 2,
    "chapterTitle": "Ear to Ear",
    "topicsJson": "[\"External vs Internal Ears\",\"Animal Skin Patterns\",\"Viviparous vs Oviparous Animals\"]",
    "topics": [
      "External vs Internal Ears",
      "Animal Skin Patterns",
      "Viviparous vs Oviparous Animals"
    ],
    "learningObjectivesJson": "[\"Classify animals by ear structure and reproductive modes\"]",
    "learningObjectives": [
      "Classify animals by ear structure and reproductive modes"
    ]
  },
  {
    "id": "cat_c4_evs_ch3",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 3,
    "chapterTitle": "A Day with Nandu",
    "topicsJson": "[\"Elephant Herd Social Structure\",\"Animal Behavior\",\"Wildlife Conservation\"]",
    "topics": [
      "Elephant Herd Social Structure",
      "Animal Behavior",
      "Wildlife Conservation"
    ],
    "learningObjectivesJson": "[\"Understand elephant social hierarchies and anti-poaching measures\"]",
    "learningObjectives": [
      "Understand elephant social hierarchies and anti-poaching measures"
    ]
  },
  {
    "id": "cat_c4_evs_ch4",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 4,
    "chapterTitle": "The Story of Amrita",
    "topicsJson": "[\"Bishnoi Community\",\"Khejadi Trees of Rajasthan\",\"Forest Preservation Sacrifices\"]",
    "topics": [
      "Bishnoi Community",
      "Khejadi Trees of Rajasthan",
      "Forest Preservation Sacrifices"
    ],
    "learningObjectivesJson": "[\"Learn historical environmental protection movements in India\"]",
    "learningObjectives": [
      "Learn historical environmental protection movements in India"
    ]
  },
  {
    "id": "cat_c4_evs_ch5",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 5,
    "chapterTitle": "Anita and the Honeybees",
    "topicsJson": "[\"Apiculture / Beekeeping\",\"Honeybee Social Hierarchy (Queen, Worker, Drone)\",\"Girl Child Empowerment\"]",
    "topics": [
      "Apiculture / Beekeeping",
      "Honeybee Social Hierarchy (Queen, Worker, Drone)",
      "Girl Child Empowerment"
    ],
    "learningObjectivesJson": "[\"Explore beekeeping techniques and girls' right to education\"]",
    "learningObjectives": [
      "Explore beekeeping techniques and girls' right to education"
    ]
  },
  {
    "id": "cat_c4_evs_ch6",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 6,
    "chapterTitle": "Omana's Journey",
    "topicsJson": "[\"Train Travel Experience\",\"Railway Tickets and Timetables\",\"Landscapes of Western Ghats\"]",
    "topics": [
      "Train Travel Experience",
      "Railway Tickets and Timetables",
      "Landscapes of Western Ghats"
    ],
    "learningObjectivesJson": "[\"Read train reservation charts and identify transport systems\"]",
    "learningObjectives": [
      "Read train reservation charts and identify transport systems"
    ]
  },
  {
    "id": "cat_c4_evs_ch7",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 7,
    "chapterTitle": "From the Window",
    "topicsJson": "[\"Tunnels and Bridges\",\"Goan Culture and Konkani Language\",\"Geographical Transitions\"]",
    "topics": [
      "Tunnels and Bridges",
      "Goan Culture and Konkani Language",
      "Geographical Transitions"
    ],
    "learningObjectivesJson": "[\"Observe changes in landforms and languages during interstate travel\"]",
    "learningObjectives": [
      "Observe changes in landforms and languages during interstate travel"
    ]
  },
  {
    "id": "cat_c4_evs_ch8",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 8,
    "chapterTitle": "Reaching Grandmother's House",
    "topicsJson": "[\"Ferries and Waterways in Kerala\",\"Public Transport Tickets\",\"Family Bonds\"]",
    "topics": [
      "Ferries and Waterways in Kerala",
      "Public Transport Tickets",
      "Family Bonds"
    ],
    "learningObjectivesJson": "[\"Understand public transport networks and coastal geography\"]",
    "learningObjectives": [
      "Understand public transport networks and coastal geography"
    ]
  },
  {
    "id": "cat_c4_evs_ch9",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 9,
    "chapterTitle": "Changing Families",
    "topicsJson": "[\"Family Transitions (Birth, Transfer, Marriage)\",\"Joint vs Nuclear Families\",\"Child Marriage Restraint Laws\"]",
    "topics": [
      "Family Transitions (Birth, Transfer, Marriage)",
      "Joint vs Nuclear Families",
      "Child Marriage Restraint Laws"
    ],
    "learningObjectivesJson": "[\"Analyze reasons for family changes and statutory marriage age laws\"]",
    "learningObjectives": [
      "Analyze reasons for family changes and statutory marriage age laws"
    ]
  },
  {
    "id": "cat_c4_evs_ch10",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 10,
    "chapterTitle": "Hu Tu Tu, Hu Tu Tu",
    "topicsJson": "[\"Kabaddi Game Rules\",\"Sports Ethics and Teamwork\",\"Karnam Malleswari Inspiration\"]",
    "topics": [
      "Kabaddi Game Rules",
      "Sports Ethics and Teamwork",
      "Karnam Malleswari Inspiration"
    ],
    "learningObjectivesJson": "[\"Understand game rules and celebrate women sports champions\"]",
    "learningObjectives": [
      "Understand game rules and celebrate women sports champions"
    ]
  },
  {
    "id": "cat_c4_evs_ch11",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 11,
    "chapterTitle": "The Valley of Flowers",
    "topicsJson": "[\"Flora of Uttarakhand\",\"Madhubani Painting Art\",\"Perfumes (Attar) from Kannauj\"]",
    "topics": [
      "Flora of Uttarakhand",
      "Madhubani Painting Art",
      "Perfumes (Attar) from Kannauj"
    ],
    "learningObjectivesJson": "[\"Appreciate mountain ecosystems and traditional floral arts\"]",
    "learningObjectives": [
      "Appreciate mountain ecosystems and traditional floral arts"
    ]
  },
  {
    "id": "cat_c4_evs_ch12",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 12,
    "chapterTitle": "Changing Times",
    "topicsJson": "[\"Post-Independence Housing\",\"Construction Materials (Mud, Bricks, Cement)\",\"Modern Sanitation\"]",
    "topics": [
      "Post-Independence Housing",
      "Construction Materials (Mud, Bricks, Cement)",
      "Modern Sanitation"
    ],
    "learningObjectivesJson": "[\"Trace historical evolution of Indian homes and toilets\"]",
    "learningObjectives": [
      "Trace historical evolution of Indian homes and toilets"
    ]
  },
  {
    "id": "cat_c4_evs_ch13",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 13,
    "chapterTitle": "A River's Tale",
    "topicsJson": "[\"River Journey from Mountain to Sea\",\"Causes of Water Pollution\",\"Water Treatment Basics\"]",
    "topics": [
      "River Journey from Mountain to Sea",
      "Causes of Water Pollution",
      "Water Treatment Basics"
    ],
    "learningObjectivesJson": "[\"Map river pollution causes and assess environmental impacts\"]",
    "learningObjectives": [
      "Map river pollution causes and assess environmental impacts"
    ]
  },
  {
    "id": "cat_c4_evs_ch14",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 14,
    "chapterTitle": "Basva's Farm",
    "topicsJson": "[\"Agricultural Cycle\",\"Farm Implements (Khunti, Kurige, Illige)\",\"Weeding and Harvesting\"]",
    "topics": [
      "Agricultural Cycle",
      "Farm Implements (Khunti, Kurige, Illige)",
      "Weeding and Harvesting"
    ],
    "learningObjectivesJson": "[\"Sequence farming operations from soil preparation to market sale\"]",
    "learningObjectives": [
      "Sequence farming operations from soil preparation to market sale"
    ]
  },
  {
    "id": "cat_c4_evs_ch15",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 15,
    "chapterTitle": "From Market to Home",
    "topicsJson": "[\"Vegetable Vendor Routines\",\"Perishable vs Non-Perishable Foods\",\"Sorting Produce\"]",
    "topics": [
      "Vegetable Vendor Routines",
      "Perishable vs Non-Perishable Foods",
      "Sorting Produce"
    ],
    "learningObjectivesJson": "[\"Recognize the hard work of street vendors and food shelf life\"]",
    "learningObjectives": [
      "Recognize the hard work of street vendors and food shelf life"
    ]
  },
  {
    "id": "cat_c4_evs_ch16",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 16,
    "chapterTitle": "A Busy Month",
    "topicsJson": "[\"Bird Anatomy\",\"Beak Shapes and Feeding Habits\",\"Nest Construction Materials\"]",
    "topics": [
      "Bird Anatomy",
      "Beak Shapes and Feeding Habits",
      "Nest Construction Materials"
    ],
    "learningObjectivesJson": "[\"Relate bird beak and claw morphology to their diets\"]",
    "learningObjectives": [
      "Relate bird beak and claw morphology to their diets"
    ]
  },
  {
    "id": "cat_c4_evs_ch17",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 17,
    "chapterTitle": "Nandita in Mumbai",
    "topicsJson": "[\"Rural-to-Urban Migration\",\"Slum Living Conditions vs High-rises\",\"Public Tap Water Conflicts\"]",
    "topics": [
      "Rural-to-Urban Migration",
      "Slum Living Conditions vs High-rises",
      "Public Tap Water Conflicts"
    ],
    "learningObjectivesJson": "[\"Examine urban inequalities and civic infrastructure challenges\"]",
    "learningObjectives": [
      "Examine urban inequalities and civic infrastructure challenges"
    ]
  },
  {
    "id": "cat_c4_evs_ch18",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 18,
    "chapterTitle": "Too Much Water, Too Little Water",
    "topicsJson": "[\"Water Scarcity and Contamination\",\"Waterborne Diseases (Diarrhea, Cholera)\",\"ORS Preparation\"]",
    "topics": [
      "Water Scarcity and Contamination",
      "Waterborne Diseases (Diarrhea, Cholera)",
      "ORS Preparation"
    ],
    "learningObjectivesJson": "[\"Prepare Oral Rehydration Solution and identify clean water needs\"]",
    "learningObjectives": [
      "Prepare Oral Rehydration Solution and identify clean water needs"
    ]
  },
  {
    "id": "cat_c4_evs_ch19",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 19,
    "chapterTitle": "Abdul in the Garden",
    "topicsJson": "[\"Plant Roots: Taproot vs Fibrous Roots\",\"Living Roots of Banyan Trees\",\"Laws Protecting Trees\"]",
    "topics": [
      "Plant Roots: Taproot vs Fibrous Roots",
      "Living Roots of Banyan Trees",
      "Laws Protecting Trees"
    ],
    "learningObjectivesJson": "[\"Differentiate root types and recognize tree-felling legal protections\"]",
    "learningObjectives": [
      "Differentiate root types and recognize tree-felling legal protections"
    ]
  },
  {
    "id": "cat_c4_evs_ch20",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 20,
    "chapterTitle": "Eating Together",
    "topicsJson": "[\"Mid-Day Meal Scheme\",\"Bihu Festival of Assam (Bhela Ghar)\",\"Classroom Feasts\"]",
    "topics": [
      "Mid-Day Meal Scheme",
      "Bihu Festival of Assam (Bhela Ghar)",
      "Classroom Feasts"
    ],
    "learningObjectivesJson": "[\"Value statutory Mid-Day Meal entitlements and cultural feasts\"]",
    "learningObjectives": [
      "Value statutory Mid-Day Meal entitlements and cultural feasts"
    ]
  },
  {
    "id": "cat_c4_evs_ch21",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 21,
    "chapterTitle": "Food and Fun",
    "topicsJson": "[\"Gurudwara Langar Community Kitchen\",\"Voluntary Service (Seva)\",\"Cooking Large Meals\"]",
    "topics": [
      "Gurudwara Langar Community Kitchen",
      "Voluntary Service (Seva)",
      "Cooking Large Meals"
    ],
    "learningObjectivesJson": "[\"Appreciate selfless community service and cooperative kitchens\"]",
    "learningObjectives": [
      "Appreciate selfless community service and cooperative kitchens"
    ]
  },
  {
    "id": "cat_c4_evs_ch22",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 22,
    "chapterTitle": "The World in My Home",
    "topicsJson": "[\"Gender Discrimination in Families\",\"Television Conflicts\",\"Honesty and Moral Integrity\"]",
    "topics": [
      "Gender Discrimination in Families",
      "Television Conflicts",
      "Honesty and Moral Integrity"
    ],
    "learningObjectivesJson": "[\"Critically evaluate family gender biases and uphold integrity\"]",
    "learningObjectives": [
      "Critically evaluate family gender biases and uphold integrity"
    ]
  },
  {
    "id": "cat_c4_evs_ch23",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 23,
    "chapterTitle": "Pochampalli",
    "topicsJson": "[\"Ikat Handloom Weaving of Telangana\",\"Traditional Silk Dyeing\",\"Preserving Indigenous Crafts\"]",
    "topics": [
      "Ikat Handloom Weaving of Telangana",
      "Traditional Silk Dyeing",
      "Preserving Indigenous Crafts"
    ],
    "learningObjectivesJson": "[\"Understand the meticulous craftsmanship of Indian handloom weavers\"]",
    "learningObjectives": [
      "Understand the meticulous craftsmanship of Indian handloom weavers"
    ]
  },
  {
    "id": "cat_c4_evs_ch24",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 24,
    "chapterTitle": "Home and Abroad",
    "topicsJson": "[\"Abu Dhabi Climate and Currency (Dirham)\",\"Comparison with Kerala\",\"Petroleum Economy vs Agriculture\"]",
    "topics": [
      "Abu Dhabi Climate and Currency (Dirham)",
      "Comparison with Kerala",
      "Petroleum Economy vs Agriculture"
    ],
    "learningObjectivesJson": "[\"Compare lifestyle, climate, and currencies across nations\"]",
    "learningObjectives": [
      "Compare lifestyle, climate, and currencies across nations"
    ]
  },
  {
    "id": "cat_c4_evs_ch25",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 25,
    "chapterTitle": "Spicy Riddles",
    "topicsJson": "[\"Indian Spices (Cardamom, Clove, Black Pepper, Turmeric)\",\"Culinary and Medicinal Uses\",\"Spice Trade\"]",
    "topics": [
      "Indian Spices (Cardamom, Clove, Black Pepper, Turmeric)",
      "Culinary and Medicinal Uses",
      "Spice Trade"
    ],
    "learningObjectivesJson": "[\"Identify therapeutic and flavor qualities of Indian spices\"]",
    "learningObjectives": [
      "Identify therapeutic and flavor qualities of Indian spices"
    ]
  },
  {
    "id": "cat_c4_evs_ch26",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 26,
    "chapterTitle": "Defence Officer: Wahida",
    "topicsJson": "[\"Surgeon Commander Wahida Prism\",\"Armed Forces Naval Service\",\"Overcoming Social Barriers\"]",
    "topics": [
      "Surgeon Commander Wahida Prism",
      "Armed Forces Naval Service",
      "Overcoming Social Barriers"
    ],
    "learningObjectivesJson": "[\"Draw inspiration from India's first female naval parade commander\"]",
    "learningObjectives": [
      "Draw inspiration from India's first female naval parade commander"
    ]
  },
  {
    "id": "cat_c4_evs_ch27",
    "grade": "Class 4",
    "subject": "EVS",
    "chapterNumber": 27,
    "chapterTitle": "Chuskit Goes to School",
    "topicsJson": "[\"Locomotor Disability\",\"Wheelchair Accessibility\",\"Community Ramp Building in Ladakh\"]",
    "topics": [
      "Locomotor Disability",
      "Wheelchair Accessibility",
      "Community Ramp Building in Ladakh"
    ],
    "learningObjectivesJson": "[\"Advocate for barrier-free school infrastructure and inclusion\"]",
    "learningObjectives": [
      "Advocate for barrier-free school infrastructure and inclusion"
    ]
  },
  {
    "id": "cat_c4_eng_ch1",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Wake Up! & Neha's Alarm Clock",
    "topicsJson": "[\"Morning Routine Poem\",\"Natural Alarm Clocks (Birds, Sun)\",\"Past Tense Verbs\"]",
    "topics": [
      "Morning Routine Poem",
      "Natural Alarm Clocks (Birds, Sun)",
      "Past Tense Verbs"
    ],
    "learningObjectivesJson": "[\"Appreciate nature's waking signals and practice past tense narrative\"]",
    "learningObjectives": [
      "Appreciate nature's waking signals and practice past tense narrative"
    ]
  },
  {
    "id": "cat_c4_eng_ch2",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Noses & The Little Fir Tree",
    "topicsJson": "[\"Facial Features Humor\",\"Accepting One's Appearance\",\"Antonyms with prefixes (un-, in-)\"]",
    "topics": [
      "Facial Features Humor",
      "Accepting One's Appearance",
      "Antonyms with prefixes (un-, in-)"
    ],
    "learningObjectivesJson": "[\"Build self-esteem and form antonyms using prefixes\"]",
    "learningObjectives": [
      "Build self-esteem and form antonyms using prefixes"
    ]
  },
  {
    "id": "cat_c4_eng_ch3",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Run! & Nasruddin's Aim",
    "topicsJson": "[\"Outdoor Running Poem\",\"Wit of Mullah Nasruddin\",\"Adverbs of Manner (-ly)\"]",
    "topics": [
      "Outdoor Running Poem",
      "Wit of Mullah Nasruddin",
      "Adverbs of Manner (-ly)"
    ],
    "learningObjectivesJson": "[\"Recite dynamic movement poems and identify adverbs of manner\"]",
    "learningObjectives": [
      "Recite dynamic movement poems and identify adverbs of manner"
    ]
  },
  {
    "id": "cat_c4_eng_ch4",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "Why? & Alice in Wonderland",
    "topicsJson": "[\"Inquisitive Child Rhyme\",\"Fantasy Fiction Classics\",\"Question Words (Why, What, How)\"]",
    "topics": [
      "Inquisitive Child Rhyme",
      "Fantasy Fiction Classics",
      "Question Words (Why, What, How)"
    ],
    "learningObjectivesJson": "[\"Formulate inquiry questions and comprehend classic fantasy texts\"]",
    "learningObjectives": [
      "Formulate inquiry questions and comprehend classic fantasy texts"
    ]
  },
  {
    "id": "cat_c4_eng_ch5",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "Don't be Afraid of the Dark & Helen Keller",
    "topicsJson": "[\"Overcoming Fear of Darkness\",\"Helen Keller Biography\",\"Braille & Overcoming Challenges\"]",
    "topics": [
      "Overcoming Fear of Darkness",
      "Helen Keller Biography",
      "Braille & Overcoming Challenges"
    ],
    "learningObjectivesJson": "[\"Develop courage and learn how Helen Keller conquered disabilities\"]",
    "learningObjectives": [
      "Develop courage and learn how Helen Keller conquered disabilities"
    ]
  },
  {
    "id": "cat_c4_eng_ch6",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Hiawatha & The Scholar's Mother Tongue",
    "topicsJson": "[\"Native American Folk Poem\",\"Birbal Uncovers Real Mother Tongue\",\"Idioms and Phrasal Verbs\"]",
    "topics": [
      "Native American Folk Poem",
      "Birbal Uncovers Real Mother Tongue",
      "Idioms and Phrasal Verbs"
    ],
    "learningObjectivesJson": "[\"Appreciate indigenous lore and analyze human language instincts\"]",
    "learningObjectives": [
      "Appreciate indigenous lore and analyze human language instincts"
    ]
  },
  {
    "id": "cat_c4_eng_ch7",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "A Watering Rhyme & The Giving Tree",
    "topicsJson": "[\"Plant Care Poetry\",\"Selfless Generosity of Trees\",\"Silent Letters in English\"]",
    "topics": [
      "Plant Care Poetry",
      "Selfless Generosity of Trees",
      "Silent Letters in English"
    ],
    "learningObjectivesJson": "[\"Identify silent letters and understand ecological generosity\"]",
    "learningObjectives": [
      "Identify silent letters and understand ecological generosity"
    ]
  },
  {
    "id": "cat_c4_eng_ch8",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "Books & Going to Buy a Book",
    "topicsJson": "[\"Love for Reading Poem\",\"Bookstore Exploration Narrative\",\"Compound Words\"]",
    "topics": [
      "Love for Reading Poem",
      "Bookstore Exploration Narrative",
      "Compound Words"
    ],
    "learningObjectivesJson": "[\"Cultivate reading habits and evaluate literary genres\"]",
    "learningObjectives": [
      "Cultivate reading habits and evaluate literary genres"
    ]
  },
  {
    "id": "cat_c4_eng_ch9",
    "grade": "Class 4",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "The Naughty Boy & Pinocchio",
    "topicsJson": "[\"John Keats Scottish Travel Poem\",\"Puppet Coming to Life Story\",\"Word Endings (-er, -est)\"]",
    "topics": [
      "John Keats Scottish Travel Poem",
      "Puppet Coming to Life Story",
      "Word Endings (-er, -est)"
    ],
    "learningObjectivesJson": "[\"Explore degrees of comparison and dramatic character dialogue\"]",
    "learningObjectives": [
      "Explore degrees of comparison and dramatic character dialogue"
    ]
  },
  {
    "id": "cat_c4_hin_ch1",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 1,
    "chapterTitle": "मन के भोले-भाले बादल",
    "topicsJson": "[\"बादलों के रूप\",\"कविता पाठ\",\"तुकांत शब्द\"]",
    "topics": [
      "बादलों के रूप",
      "कविता पाठ",
      "तुकांत शब्द"
    ],
    "learningObjectivesJson": "[\"प्रकृति की कल्पनाशीलता का आनंद\"]",
    "learningObjectives": [
      "प्रकृति की कल्पनाशीलता का आनंद"
    ]
  },
  {
    "id": "cat_c4_hin_ch2",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 2,
    "chapterTitle": "जैसा सवाल वैसा जवाब",
    "topicsJson": "[\"अकबर-बीरबल संवाद\",\"हाजिरजवाबी\",\"विराम चिह्न\"]",
    "topics": [
      "अकबर-बीरबल संवाद",
      "हाजिरजवाबी",
      "विराम चिह्न"
    ],
    "learningObjectivesJson": "[\"तर्कसंगत उत्तर देने की कला\"]",
    "learningObjectives": [
      "तर्कसंगत उत्तर देने की कला"
    ]
  },
  {
    "id": "cat_c4_hin_ch3",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 3,
    "chapterTitle": "किरमिच की गेंद",
    "topicsJson": "[\"ईमानदारी\",\"खेल का मैदान\",\"संज्ञा भेद\"]",
    "topics": [
      "ईमानदारी",
      "खेल का मैदान",
      "संज्ञा भेद"
    ],
    "learningObjectivesJson": "[\"खोई वस्तु लौटाने का नैतिक मूल्य\"]",
    "learningObjectives": [
      "खोई वस्तु लौटाने का नैतिक मूल्य"
    ]
  },
  {
    "id": "cat_c4_hin_ch4",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 4,
    "chapterTitle": "पापा जब बच्चे थे",
    "topicsJson": "[\"पेशा चयन\",\"बाल सुलभ इच्छाएँ\",\"सर्वनाम\"]",
    "topics": [
      "पेशा चयन",
      "बाल सुलभ इच्छाएँ",
      "सर्वनाम"
    ],
    "learningObjectivesJson": "[\"एक अच्छा इंसान बनने का महत्व\"]",
    "learningObjectives": [
      "एक अच्छा इंसान बनने का महत्व"
    ]
  },
  {
    "id": "cat_c4_hin_ch5",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 5,
    "chapterTitle": "दोस्त की पोशाक",
    "topicsJson": "[\"नसीरुद्दीन की पोशाक\",\"हँसी-मजाक\",\"विशेषण\"]",
    "topics": [
      "नसीरुद्दीन की पोशाक",
      "हँसी-मजाक",
      "विशेषण"
    ],
    "learningObjectivesJson": "[\"सच्ची मित्रता व दिखावे से बचना\"]",
    "learningObjectives": [
      "सच्ची मित्रता व दिखावे से बचना"
    ]
  },
  {
    "id": "cat_c4_hin_ch6",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 6,
    "chapterTitle": "नाव बनाओ नाव बनाओ",
    "topicsJson": "[\"कागज की नाव\",\"वर्षा ऋतु\",\"क्रिया शब्द\"]",
    "topics": [
      "कागज की नाव",
      "वर्षा ऋतु",
      "क्रिया शब्द"
    ],
    "learningObjectivesJson": "[\"हस्तकला व वर्षा का आनंद\"]",
    "learningObjectives": [
      "हस्तकला व वर्षा का आनंद"
    ]
  },
  {
    "id": "cat_c4_hin_ch7",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 7,
    "chapterTitle": "दान का हिसाब",
    "topicsJson": "[\"कंजूस राजा की कथा\",\"गणितीय सूझबूझ\",\"न्याय\"]",
    "topics": [
      "कंजूस राजा की कथा",
      "गणितीय सूझबूझ",
      "न्याय"
    ],
    "learningObjectivesJson": "[\"गरीबों की सहायता व राजा का दायित्व\"]",
    "learningObjectives": [
      "गरीबों की सहायता व राजा का दायित्व"
    ]
  },
  {
    "id": "cat_c4_hin_ch8",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 8,
    "chapterTitle": "कौन?",
    "topicsJson": "[\"चूहे की शरारतें\",\"पहेलीनुमा कविता\",\"पर्यायवाची शब्द\"]",
    "topics": [
      "चूहे की शरारतें",
      "पहेलीनुमा कविता",
      "पर्यायवाची शब्द"
    ],
    "learningObjectivesJson": "[\"जीवों की आदतों की पहचान\"]",
    "learningObjectives": [
      "जीवों की आदतों की पहचान"
    ]
  },
  {
    "id": "cat_c4_hin_ch9",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 9,
    "chapterTitle": "स्वतंत्रता की ओर",
    "topicsJson": "[\"दांडी यात्रा\",\"गांधीजी का आश्रम\",\"देशभक्ति\"]",
    "topics": [
      "दांडी यात्रा",
      "गांधीजी का आश्रम",
      "देशभक्ति"
    ],
    "learningObjectivesJson": "[\"स्वतंत्रता संग्राम व सादगी का महत्व\"]",
    "learningObjectives": [
      "स्वतंत्रता संग्राम व सादगी का महत्व"
    ]
  },
  {
    "id": "cat_c4_hin_ch10",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 10,
    "chapterTitle": "थप्प रोटी थप्प दाल",
    "topicsJson": "[\"बाल नाटक\",\"रसोई खेल\",\"अभिनय कौशल\"]",
    "topics": [
      "बाल नाटक",
      "रसोई खेल",
      "अभिनय कौशल"
    ],
    "learningObjectivesJson": "[\"नाट्य विधा व संवाद वाचन\"]",
    "learningObjectives": [
      "नाट्य विधा व संवाद वाचन"
    ]
  },
  {
    "id": "cat_c4_hin_ch11",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 11,
    "chapterTitle": "पढ़क्कू की सूझ",
    "topicsJson": "[\"तर्कशास्त्र का हास्य\",\"कोल्हू का बैल\",\"लोकोक्तियाँ\"]",
    "topics": [
      "तर्कशास्त्र का हास्य",
      "कोल्हू का बैल",
      "लोकोक्तियाँ"
    ],
    "learningObjectivesJson": "[\"पुस्तकीय ज्ञान बनाम व्यावहारिक बुद्धि\"]",
    "learningObjectives": [
      "पुस्तकीय ज्ञान बनाम व्यावहारिक बुद्धि"
    ]
  },
  {
    "id": "cat_c4_hin_ch12",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 12,
    "chapterTitle": "सुनीता की पहिया कुर्सी",
    "topicsJson": "[\"दिव्यांगता व आत्मनिर्भरता\",\"सहानुभूति नहीं समानता\",\"वचन\"]",
    "topics": [
      "दिव्यांगता व आत्मनिर्भरता",
      "सहानुभूति नहीं समानता",
      "वचन"
    ],
    "learningObjectivesJson": "[\"समान अधिकार व आत्मसम्मान की भावना\"]",
    "learningObjectives": [
      "समान अधिकार व आत्मसम्मान की भावना"
    ]
  },
  {
    "id": "cat_c4_hin_ch13",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 13,
    "chapterTitle": "हुदहुद",
    "topicsJson": "[\"हुदहुद पक्षी की कलगी\",\"पौराणिक कथा\",\"पक्षियों का सौंदर्य\"]",
    "topics": [
      "हुदहुद पक्षी की कलगी",
      "पौराणिक कथा",
      "पक्षियों का सौंदर्य"
    ],
    "learningObjectivesJson": "[\"जीव-जंतुओं के प्रति रोचक जानकारी\"]",
    "learningObjectives": [
      "जीव-जंतुओं के प्रति रोचक जानकारी"
    ]
  },
  {
    "id": "cat_c4_hin_ch14",
    "grade": "Class 4",
    "subject": "Hindi",
    "chapterNumber": 14,
    "chapterTitle": "मुफ़्त ही मुफ़्त",
    "topicsJson": "[\"गुजराती लोककथा\",\"कंजूसी का परिणाम\",\"मुहावरे\"]",
    "topics": [
      "गुजराती लोककथा",
      "कंजूसी का परिणाम",
      "मुहावरे"
    ],
    "learningObjectivesJson": "[\"अति लोभ के दुष्परिणाम समझना\"]",
    "learningObjectives": [
      "अति लोभ के दुष्परिणाम समझना"
    ]
  },
  {
    "id": "cat_c5_math_ch1",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "The Fish Tale",
    "topicsJson": "[\"Large Numbers (Lakhs and Crores)\",\"Speed, Distance, and Time Calculations\",\"Fishermen Cooperatives & Banking\"]",
    "topics": [
      "Large Numbers (Lakhs and Crores)",
      "Speed, Distance, and Time Calculations",
      "Fishermen Cooperatives & Banking"
    ],
    "learningObjectivesJson": "[\"Work with numbers up to 1 crore and solve real-world commercial math problems\"]",
    "learningObjectives": [
      "Work with numbers up to 1 crore and solve real-world commercial math problems"
    ]
  },
  {
    "id": "cat_c5_math_ch2",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Shapes and Angles",
    "topicsJson": "[\"Acute, Right, Obtuse, and Straight Angles\",\"Angles Made by Clock Hands\",\"Protractors & Degree Clocks\"]",
    "topics": [
      "Acute, Right, Obtuse, and Straight Angles",
      "Angles Made by Clock Hands",
      "Protractors & Degree Clocks"
    ],
    "learningObjectivesJson": "[\"Measure and classify angles in degrees using protractors\"]",
    "learningObjectives": [
      "Measure and classify angles in degrees using protractors"
    ]
  },
  {
    "id": "cat_c5_math_ch3",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "How Many Squares?",
    "topicsJson": "[\"Area and Perimeter Using Grid Squares\",\"Area of Right-Angled Triangles\",\"Irregular Shape Area Estimation\"]",
    "topics": [
      "Area and Perimeter Using Grid Squares",
      "Area of Right-Angled Triangles",
      "Irregular Shape Area Estimation"
    ],
    "learningObjectivesJson": "[\"Calculate areas of composite shapes on centimetre grids\"]",
    "learningObjectives": [
      "Calculate areas of composite shapes on centimetre grids"
    ]
  },
  {
    "id": "cat_c5_math_ch4",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Parts and Wholes",
    "topicsJson": "[\"Fractions of Geometric Figures\",\"Mixed Fractions and Improper Fractions\",\"Fraction Strips & Problem Solving\"]",
    "topics": [
      "Fractions of Geometric Figures",
      "Mixed Fractions and Improper Fractions",
      "Fraction Strips & Problem Solving"
    ],
    "learningObjectivesJson": "[\"Master fraction operations and pictorial representation of mixed numbers\"]",
    "learningObjectives": [
      "Master fraction operations and pictorial representation of mixed numbers"
    ]
  },
  {
    "id": "cat_c5_math_ch5",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Does it Look the Same?",
    "topicsJson": "[\"Rotational Symmetry (1/2, 1/3, 1/4, 1/6 turns)\",\"Mirror Lines and Reflection\",\"Symmetric Patterns\"]",
    "topics": [
      "Rotational Symmetry (1/2, 1/3, 1/4, 1/6 turns)",
      "Mirror Lines and Reflection",
      "Symmetric Patterns"
    ],
    "learningObjectivesJson": "[\"Predict and draw shapes after fractional turns\"]",
    "learningObjectives": [
      "Predict and draw shapes after fractional turns"
    ]
  },
  {
    "id": "cat_c5_math_ch6",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Be My Multiple, I'll be Your Factor",
    "topicsJson": "[\"Factors and Multiples\",\"Prime and Composite Numbers\",\"Common Factors, HCF and LCM\"]",
    "topics": [
      "Factors and Multiples",
      "Prime and Composite Numbers",
      "Common Factors, HCF and LCM"
    ],
    "learningObjectivesJson": "[\"Compute HCF and LCM using factor trees and common multiples\"]",
    "learningObjectives": [
      "Compute HCF and LCM using factor trees and common multiples"
    ]
  },
  {
    "id": "cat_c5_math_ch7",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Can You See the Pattern?",
    "topicsJson": "[\"Number and Rotational Patterns\",\"Magic Hexagons and Magic Squares\",\"Palindromic Numbers and Calendar Tricks\"]",
    "topics": [
      "Number and Rotational Patterns",
      "Magic Hexagons and Magic Squares",
      "Palindromic Numbers and Calendar Tricks"
    ],
    "learningObjectivesJson": "[\"Formulate algorithmic rules for complex mathematical sequences\"]",
    "learningObjectives": [
      "Formulate algorithmic rules for complex mathematical sequences"
    ]
  },
  {
    "id": "cat_c5_math_ch8",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Mapping Your Way",
    "topicsJson": "[\"Map Scale Interpretation (e.g. 1 cm = 100 km)\",\"Cardinal Directions on Maps\",\"Route Navigation from Layouts\"]",
    "topics": [
      "Map Scale Interpretation (e.g. 1 cm = 100 km)",
      "Cardinal Directions on Maps",
      "Route Navigation from Layouts"
    ],
    "learningObjectivesJson": "[\"Compute actual ground distances using map scales\"]",
    "learningObjectives": [
      "Compute actual ground distances using map scales"
    ]
  },
  {
    "id": "cat_c5_math_ch9",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Boxes and Sketches",
    "topicsJson": "[\"2D Nets of 3D Solids (Cubes, Cones, Cylinders)\",\"Isometric Drawings\",\"Floor Plans and Deep Drawings\"]",
    "topics": [
      "2D Nets of 3D Solids (Cubes, Cones, Cylinders)",
      "Isometric Drawings",
      "Floor Plans and Deep Drawings"
    ],
    "learningObjectivesJson": "[\"Construct 3D solids from 2D flat folding nets\"]",
    "learningObjectives": [
      "Construct 3D solids from 2D flat folding nets"
    ]
  },
  {
    "id": "cat_c5_math_ch10",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Tenths and Hundredths",
    "topicsJson": "[\"Decimal Place Value (Tenths, Hundredths)\",\"Fractions to Decimals Conversion\",\"Metric Measurement in Decimals\"]",
    "topics": [
      "Decimal Place Value (Tenths, Hundredths)",
      "Fractions to Decimals Conversion",
      "Metric Measurement in Decimals"
    ],
    "learningObjectivesJson": "[\"Read, write, compare, and operate on decimal numbers\"]",
    "learningObjectives": [
      "Read, write, compare, and operate on decimal numbers"
    ]
  },
  {
    "id": "cat_c5_math_ch11",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Area and its Boundary",
    "topicsJson": "[\"Perimeter Formula: 2(l + b)\",\"Area Formula: l x b\",\"Comparing Shapes with Equal Area / Perimeter\"]",
    "topics": [
      "Perimeter Formula: 2(l + b)",
      "Area Formula: l x b",
      "Comparing Shapes with Equal Area / Perimeter"
    ],
    "learningObjectivesJson": "[\"Derive and apply standard formulas for rectangle/square area and perimeter\"]",
    "learningObjectives": [
      "Derive and apply standard formulas for rectangle/square area and perimeter"
    ]
  },
  {
    "id": "cat_c5_math_ch12",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "Smart Charts",
    "topicsJson": "[\"Tally Marks\",\"Bar Graphs and Double Bar Graphs\",\"Family Trees and Growth Charts\"]",
    "topics": [
      "Tally Marks",
      "Bar Graphs and Double Bar Graphs",
      "Family Trees and Growth Charts"
    ],
    "learningObjectivesJson": "[\"Interpret complex bar graphs and track demographic/growth trends\"]",
    "learningObjectives": [
      "Interpret complex bar graphs and track demographic/growth trends"
    ]
  },
  {
    "id": "cat_c5_math_ch13",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "Ways to Multiply and Divide",
    "topicsJson": "[\"Multi-digit Multiplication Algorithms\",\"Long Division and Remainder Interpretation\",\"Farmer Wages Word Problems\"]",
    "topics": [
      "Multi-digit Multiplication Algorithms",
      "Long Division and Remainder Interpretation",
      "Farmer Wages Word Problems"
    ],
    "learningObjectivesJson": "[\"Perform multi-digit multiplication and division with financial applications\"]",
    "learningObjectives": [
      "Perform multi-digit multiplication and division with financial applications"
    ]
  },
  {
    "id": "cat_c5_math_ch14",
    "grade": "Class 5",
    "subject": "Mathematics",
    "chapterNumber": 14,
    "chapterTitle": "How Big? How Heavy?",
    "topicsJson": "[\"Volume of Cubes and Cuboids (V = l x b x h)\",\"Liquid Displacement Method for Irregular Solids\",\"Packing Boxes\"]",
    "topics": [
      "Volume of Cubes and Cuboids (V = l x b x h)",
      "Liquid Displacement Method for Irregular Solids",
      "Packing Boxes"
    ],
    "learningObjectivesJson": "[\"Calculate volume in cubic centimetres and measure displacement volume\"]",
    "learningObjectives": [
      "Calculate volume in cubic centimetres and measure displacement volume"
    ]
  },
  {
    "id": "cat_c5_evs_ch1",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 1,
    "chapterTitle": "Super Senses",
    "topicsJson": "[\"Animal Senses (Sight, Smell, Hearing)\",\"Sleep Cycles of Animals\",\"Poaching and Endangered Species (Tiger)\"]",
    "topics": [
      "Animal Senses (Sight, Smell, Hearing)",
      "Sleep Cycles of Animals",
      "Poaching and Endangered Species (Tiger)"
    ],
    "learningObjectivesJson": "[\"Investigate sensory adaptations and wildlife protection imperatives\"]",
    "learningObjectives": [
      "Investigate sensory adaptations and wildlife protection imperatives"
    ]
  },
  {
    "id": "cat_c5_evs_ch2",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 2,
    "chapterTitle": "A Snake Charmer's Story",
    "topicsJson": "[\"Kalbeliya Community Traditions\",\"Poisonous vs Non-Poisonous Snakes\",\"Anti-Venom Production\"]",
    "topics": [
      "Kalbeliya Community Traditions",
      "Poisonous vs Non-Poisonous Snakes",
      "Anti-Venom Production"
    ],
    "learningObjectivesJson": "[\"Debunk myths about snakes and understand ecological balance\"]",
    "learningObjectives": [
      "Debunk myths about snakes and understand ecological balance"
    ]
  },
  {
    "id": "cat_c5_evs_ch3",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 3,
    "chapterTitle": "From Tasting to Digesting",
    "topicsJson": "[\"Taste Buds on Tongue\",\"Human Digestion (Dr. Beaumont's Experiments)\",\"Glucose Drip and Nutrition\"]",
    "topics": [
      "Taste Buds on Tongue",
      "Human Digestion (Dr. Beaumont's Experiments)",
      "Glucose Drip and Nutrition"
    ],
    "learningObjectivesJson": "[\"Trace food breakdown through the human digestive canal\"]",
    "learningObjectives": [
      "Trace food breakdown through the human digestive canal"
    ]
  },
  {
    "id": "cat_c5_evs_ch4",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 4,
    "chapterTitle": "Mangoes Round the Year",
    "topicsJson": "[\"Food Preservation Techniques (Drying, Pickling, Sugar Syrup)\",\"Making Mamidi Tandra (Aam Papad)\",\"Food Spoilage Causes\"]",
    "topics": [
      "Food Preservation Techniques (Drying, Pickling, Sugar Syrup)",
      "Making Mamidi Tandra (Aam Papad)",
      "Food Spoilage Causes"
    ],
    "learningObjectivesJson": "[\"Explain scientific methods of preserving perishable food\"]",
    "learningObjectives": [
      "Explain scientific methods of preserving perishable food"
    ]
  },
  {
    "id": "cat_c5_evs_ch5",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 5,
    "chapterTitle": "Seeds and Seeds",
    "topicsJson": "[\"Seed Germination Conditions\",\"Seed Dispersal Mechanisms (Wind, Water, Animals, Explosive)\",\"Invasive Plant Species\"]",
    "topics": [
      "Seed Germination Conditions",
      "Seed Dispersal Mechanisms (Wind, Water, Animals, Explosive)",
      "Invasive Plant Species"
    ],
    "learningObjectivesJson": "[\"Observe germination stages and categorize seed dispersal mechanisms\"]",
    "learningObjectives": [
      "Observe germination stages and categorize seed dispersal mechanisms"
    ]
  },
  {
    "id": "cat_c5_evs_ch6",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 6,
    "chapterTitle": "Every Drop Counts",
    "topicsJson": "[\"Traditional Stepwells (Bawris) and Johads\",\"Rainwater Harvesting Systems\",\"Ghadsisar Lake of Jaisalmer\"]",
    "topics": [
      "Traditional Stepwells (Bawris) and Johads",
      "Rainwater Harvesting Systems",
      "Ghadsisar Lake of Jaisalmer"
    ],
    "learningObjectivesJson": "[\"Analyze indigenous water architecture and community conservation\"]",
    "learningObjectives": [
      "Analyze indigenous water architecture and community conservation"
    ]
  },
  {
    "id": "cat_c5_evs_ch7",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 7,
    "chapterTitle": "Experiments with Water",
    "topicsJson": "[\"Flotation and Sinking Principles\",\"Density of Salt Water (Dead Sea)\",\"Dandi March Salt Satyagraha\"]",
    "topics": [
      "Flotation and Sinking Principles",
      "Density of Salt Water (Dead Sea)",
      "Dandi March Salt Satyagraha"
    ],
    "learningObjectivesJson": "[\"Demonstrate density principles and historical salt tax resistance\"]",
    "learningObjectives": [
      "Demonstrate density principles and historical salt tax resistance"
    ]
  },
  {
    "id": "cat_c5_evs_ch8",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 8,
    "chapterTitle": "A Treat for Mosquitoes",
    "topicsJson": "[\"Malaria Transmission (Female Anopheles)\",\"Sir Ronald Ross Discovery\",\"Anemia and Iron-Rich Foods\"]",
    "topics": [
      "Malaria Transmission (Female Anopheles)",
      "Sir Ronald Ross Discovery",
      "Anemia and Iron-Rich Foods"
    ],
    "learningObjectivesJson": "[\"Identify mosquito-borne disease vectors and prevent stagnant water breeding\"]",
    "learningObjectives": [
      "Identify mosquito-borne disease vectors and prevent stagnant water breeding"
    ]
  },
  {
    "id": "cat_c5_evs_ch9",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 9,
    "chapterTitle": "Up You Go!",
    "topicsJson": "[\"Mountaineering Techniques and Equipment\",\"Leadership Qualities of Bachendri Pal\",\"Mount Everest Expedition\"]",
    "topics": [
      "Mountaineering Techniques and Equipment",
      "Leadership Qualities of Bachendri Pal",
      "Mount Everest Expedition"
    ],
    "learningObjectivesJson": "[\"Learn mountaineering safety, map reading, and leadership values\"]",
    "learningObjectives": [
      "Learn mountaineering safety, map reading, and leadership values"
    ]
  },
  {
    "id": "cat_c5_evs_ch10",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 10,
    "chapterTitle": "Walls Tell Stories",
    "topicsJson": "[\"Golconda Fort Architecture\",\"Bastions, Cannons, and Acoustic Engineering\",\"Historical Museum Curation\"]",
    "topics": [
      "Golconda Fort Architecture",
      "Bastions, Cannons, and Acoustic Engineering",
      "Historical Museum Curation"
    ],
    "learningObjectivesJson": "[\"Examine medieval fort engineering and archaeological evidence\"]",
    "learningObjectives": [
      "Examine medieval fort engineering and archaeological evidence"
    ]
  },
  {
    "id": "cat_c5_evs_ch11",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 11,
    "chapterTitle": "Sunita in Space",
    "topicsJson": "[\"Space Shuttle Living\",\"Zero Gravity and Weightlessness\",\"Earth's Gravitational Pull\"]",
    "topics": [
      "Space Shuttle Living",
      "Zero Gravity and Weightlessness",
      "Earth's Gravitational Pull"
    ],
    "learningObjectivesJson": "[\"Understand atmospheric layers, satellite orbits, and weightlessness\"]",
    "learningObjectives": [
      "Understand atmospheric layers, satellite orbits, and weightlessness"
    ]
  },
  {
    "id": "cat_c5_evs_ch12",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 12,
    "chapterTitle": "What if it Finishes...?",
    "topicsJson": "[\"Fossil Fuel Formation (Petroleum, Coal)\",\"Refining Crude Oil\",\"Renewable Solar & Wind Alternatives\"]",
    "topics": [
      "Fossil Fuel Formation (Petroleum, Coal)",
      "Refining Crude Oil",
      "Renewable Solar & Wind Alternatives"
    ],
    "learningObjectivesJson": "[\"Advocate conservation of exhaustible fossil fuels\"]",
    "learningObjectives": [
      "Advocate conservation of exhaustible fossil fuels"
    ]
  },
  {
    "id": "cat_c5_evs_ch13",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 13,
    "chapterTitle": "A Shelter so High!",
    "topicsJson": "[\"Nomadic Changpa Tribe of Ladakh\",\"Pashmina Goat Wool Farming\",\"Rebo Tents and Drokpas\"]",
    "topics": [
      "Nomadic Changpa Tribe of Ladakh",
      "Pashmina Goat Wool Farming",
      "Rebo Tents and Drokpas"
    ],
    "learningObjectivesJson": "[\"Appreciate high-altitude pastoralism and indigenous shelters\"]",
    "learningObjectives": [
      "Appreciate high-altitude pastoralism and indigenous shelters"
    ]
  },
  {
    "id": "cat_c5_evs_ch14",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 14,
    "chapterTitle": "When the Earth Shook!",
    "topicsJson": "[\"Earthquakes (Bhuj 2001 Case Study)\",\"Disaster Preparedness and Evacuation\",\"Earthquake-Resistant Architecture\"]",
    "topics": [
      "Earthquakes (Bhuj 2001 Case Study)",
      "Disaster Preparedness and Evacuation",
      "Earthquake-Resistant Architecture"
    ],
    "learningObjectivesJson": "[\"Execute emergency earthquake drill protocols\"]",
    "learningObjectives": [
      "Execute emergency earthquake drill protocols"
    ]
  },
  {
    "id": "cat_c5_evs_ch15",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 15,
    "chapterTitle": "Blow Hot, Blow Cold",
    "topicsJson": "[\"Temperature of Exhaled Air\",\"Stethoscope Principle\",\"Dr. Zakir Hussain Allegory\"]",
    "topics": [
      "Temperature of Exhaled Air",
      "Stethoscope Principle",
      "Dr. Zakir Hussain Allegory"
    ],
    "learningObjectivesJson": "[\"Explain convective cooling/heating by blowing air\"]",
    "learningObjectives": [
      "Explain convective cooling/heating by blowing air"
    ]
  },
  {
    "id": "cat_c5_evs_ch16",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 16,
    "chapterTitle": "Who will do this Work?",
    "topicsJson": "[\"Dignity of Labour\",\"Abolition of Manual Scavenging\",\"Babasaheb Ambedkar Constitutional Equality\"]",
    "topics": [
      "Dignity of Labour",
      "Abolition of Manual Scavenging",
      "Babasaheb Ambedkar Constitutional Equality"
    ],
    "learningObjectivesJson": "[\"Champion equal dignity of work and eradicate caste prejudice\"]",
    "learningObjectives": [
      "Champion equal dignity of work and eradicate caste prejudice"
    ]
  },
  {
    "id": "cat_c5_evs_ch17",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 17,
    "chapterTitle": "Across the Wall",
    "topicsJson": "[\"Breaking Gender Barriers in Sports\",\"Mumbai Nagpada Basketball Association\",\"Team Spirit\"]",
    "topics": [
      "Breaking Gender Barriers in Sports",
      "Mumbai Nagpada Basketball Association",
      "Team Spirit"
    ],
    "learningObjectivesJson": "[\"Challenge gender stereotyping in athletics\"]",
    "learningObjectives": [
      "Challenge gender stereotyping in athletics"
    ]
  },
  {
    "id": "cat_c5_evs_ch18",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 18,
    "chapterTitle": "No Place for Us?",
    "topicsJson": "[\"Tehri Dam Construction\",\"Tribal Displacement and Rehabilitation\",\"Rural-Urban Resettlement Challenges\"]",
    "topics": [
      "Tehri Dam Construction",
      "Tribal Displacement and Rehabilitation",
      "Rural-Urban Resettlement Challenges"
    ],
    "learningObjectivesJson": "[\"Examine socioeconomic fallout of large infrastructure displacement\"]",
    "learningObjectives": [
      "Examine socioeconomic fallout of large infrastructure displacement"
    ]
  },
  {
    "id": "cat_c5_evs_ch19",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 19,
    "chapterTitle": "A Seed Tells a Farmer's Story",
    "topicsJson": "[\"Traditional Organic vs Chemical Fertilizer Farming\",\"Seed Banks\",\"Irrigation Canals & Debt Cycles\"]",
    "topics": [
      "Traditional Organic vs Chemical Fertilizer Farming",
      "Seed Banks",
      "Irrigation Canals & Debt Cycles"
    ],
    "learningObjectivesJson": "[\"Evaluate sustainable agriculture vs high-input monoculture\"]",
    "learningObjectives": [
      "Evaluate sustainable agriculture vs high-input monoculture"
    ]
  },
  {
    "id": "cat_c5_evs_ch20",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 20,
    "chapterTitle": "Whose Forests?",
    "topicsJson": "[\"Jharkhand Tribal Rights\",\"Suryamani Kuduk 'Torang' Center\",\"Forest Rights Act 2007\"]",
    "topics": [
      "Jharkhand Tribal Rights",
      "Suryamani Kuduk 'Torang' Center",
      "Forest Rights Act 2007"
    ],
    "learningObjectivesJson": "[\"Uphold tribal community rights over customary forest resources\"]",
    "learningObjectives": [
      "Uphold tribal community rights over customary forest resources"
    ]
  },
  {
    "id": "cat_c5_evs_ch21",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 21,
    "chapterTitle": "Like Father, Like Daughter",
    "topicsJson": "[\"Inherited Traits vs Acquired Traits\",\"Gregor Mendel Pea Plant Experiments\",\"Polio Transmission Myths\"]",
    "topics": [
      "Inherited Traits vs Acquired Traits",
      "Gregor Mendel Pea Plant Experiments",
      "Polio Transmission Myths"
    ],
    "learningObjectivesJson": "[\"Distinguish genetic traits from communicable illnesses\"]",
    "learningObjectives": [
      "Distinguish genetic traits from communicable illnesses"
    ]
  },
  {
    "id": "cat_c5_evs_ch22",
    "grade": "Class 5",
    "subject": "EVS",
    "chapterNumber": 22,
    "chapterTitle": "On the Move Again",
    "topicsJson": "[\"Seasonal Sugarcane Migrant Workers\",\"Mukkadam Money Lending\",\"Disrupted Child Schooling\"]",
    "topics": [
      "Seasonal Sugarcane Migrant Workers",
      "Mukkadam Money Lending",
      "Disrupted Child Schooling"
    ],
    "learningObjectivesJson": "[\"Analyze migration cycles and defend children's continuous education\"]",
    "learningObjectives": [
      "Analyze migration cycles and defend children's continuous education"
    ]
  },
  {
    "id": "cat_c5_eng_ch1",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Ice-Cream Man & Wonderful Waste!",
    "topicsJson": "[\"Summer Joy Rhyme\",\"Avial Recipe from Vegetable Scraps\",\"Prefixes (un-, dis-)\"]",
    "topics": [
      "Summer Joy Rhyme",
      "Avial Recipe from Vegetable Scraps",
      "Prefixes (un-, dis-)"
    ],
    "learningObjectivesJson": "[\"Appreciate waste recycling through culinary creativity\"]",
    "learningObjectives": [
      "Appreciate waste recycling through culinary creativity"
    ]
  },
  {
    "id": "cat_c5_eng_ch2",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Teamwork & Flying Together",
    "topicsJson": "[\"Cooperative Effort Poetry\",\"Flock of Geese Panchatantra Tale\",\"Contractions (can't, won't)\"]",
    "topics": [
      "Cooperative Effort Poetry",
      "Flock of Geese Panchatantra Tale",
      "Contractions (can't, won't)"
    ],
    "learningObjectivesJson": "[\"Practice teamwork and use grammatical contractions\"]",
    "learningObjectives": [
      "Practice teamwork and use grammatical contractions"
    ]
  },
  {
    "id": "cat_c5_eng_ch3",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "My Shadow & Robinson Crusoe Discovers a footprint",
    "topicsJson": "[\"Shadow Science Poetry\",\"Island Survival Classic\",\"Possessive Nouns ('s)\"]",
    "topics": [
      "Shadow Science Poetry",
      "Island Survival Classic",
      "Possessive Nouns ('s)"
    ],
    "learningObjectivesJson": "[\"Read mystery narratives and apply possessive apostrophes\"]",
    "learningObjectives": [
      "Read mystery narratives and apply possessive apostrophes"
    ]
  },
  {
    "id": "cat_c5_eng_ch4",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "Crying & My Elder Brother",
    "topicsJson": "[\"Emotional Expression Poem\",\"Munshi Premchand 'Bade Bhai Sahib'\",\"Idiomatic Phrases\"]",
    "topics": [
      "Emotional Expression Poem",
      "Munshi Premchand 'Bade Bhai Sahib'",
      "Idiomatic Phrases"
    ],
    "learningObjectivesJson": "[\"Analyze peer expectations and respect elder guidance\"]",
    "learningObjectives": [
      "Analyze peer expectations and respect elder guidance"
    ]
  },
  {
    "id": "cat_c5_eng_ch5",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "The Lazy Frog & Rip Van Winkle",
    "topicsJson": "[\"Humorous Indolence Verse\",\"Washington Irving Folklore\",\"Descriptive Adjectives\"]",
    "topics": [
      "Humorous Indolence Verse",
      "Washington Irving Folklore",
      "Descriptive Adjectives"
    ],
    "learningObjectivesJson": "[\"Critique chronic procrastination through literature\"]",
    "learningObjectives": [
      "Critique chronic procrastination through literature"
    ]
  },
  {
    "id": "cat_c5_eng_ch6",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Class Discussion & The Talkative Barber",
    "topicsJson": "[\"Classroom Shyness Poem\",\"Arabian Nights Folktale\",\"Direct and Indirect Speech Basics\"]",
    "topics": [
      "Classroom Shyness Poem",
      "Arabian Nights Folktale",
      "Direct and Indirect Speech Basics"
    ],
    "learningObjectivesJson": "[\"Encourage quiet classroom voices and identify direct speech\"]",
    "learningObjectives": [
      "Encourage quiet classroom voices and identify direct speech"
    ]
  },
  {
    "id": "cat_c5_eng_ch7",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "Topsy-Turvy Land & Gulliver's Travels",
    "topicsJson": "[\"Absurd Upside-Down Verse\",\"Jonathan Swift Satire\",\"Degrees of Comparison\"]",
    "topics": [
      "Absurd Upside-Down Verse",
      "Jonathan Swift Satire",
      "Degrees of Comparison"
    ],
    "learningObjectivesJson": "[\"Enjoy literary nonsense and master irregular comparison degrees\"]",
    "learningObjectives": [
      "Enjoy literary nonsense and master irregular comparison degrees"
    ]
  },
  {
    "id": "cat_c5_eng_ch8",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "Nobody's Friend & The Little Bully",
    "topicsJson": "[\"Generosity Verse\",\"Enid Blyton School Bullying Story\",\"Conjunctions (and, but, because)\"]",
    "topics": [
      "Generosity Verse",
      "Enid Blyton School Bullying Story",
      "Conjunctions (and, but, because)"
    ],
    "learningObjectivesJson": "[\"Stand against school bullying and join clauses with conjunctions\"]",
    "learningObjectives": [
      "Stand against school bullying and join clauses with conjunctions"
    ]
  },
  {
    "id": "cat_c5_eng_ch9",
    "grade": "Class 5",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "Sing a Song of People, Around the World, Malu Bhalu, Who is Ningthou?",
    "topicsJson": "[\"Urban Rush Verse\",\"Gender Equality in Manipur\",\"Future Tense Expressions\"]",
    "topics": [
      "Urban Rush Verse",
      "Gender Equality in Manipur",
      "Future Tense Expressions"
    ],
    "learningObjectivesJson": "[\"Celebrate democratic meritocracy and gender equality in governance\"]",
    "learningObjectives": [
      "Celebrate democratic meritocracy and gender equality in governance"
    ]
  },
  {
    "id": "cat_c5_hin_ch1",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 1,
    "chapterTitle": "राख की रस्सी",
    "topicsJson": "[\"तिब्बती लोककथा\",\"मंत्री लोनपो गार\",\"बुद्धि चातुर्य\"]",
    "topics": [
      "तिब्बती लोककथा",
      "मंत्री लोनपो गार",
      "बुद्धि चातुर्य"
    ],
    "learningObjectivesJson": "[\"समस्या समाधान में विवेक का प्रयोग\"]",
    "learningObjectives": [
      "समस्या समाधान में विवेक का प्रयोग"
    ]
  },
  {
    "id": "cat_c5_hin_ch2",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 2,
    "chapterTitle": "फसलों के त्योहार",
    "topicsJson": "[\"मकर संक्रांति, पोंगल, बीहू\",\"कृषि संस्कृति\",\"निबंध विधा\"]",
    "topics": [
      "मकर संक्रांति, पोंगल, बीहू",
      "कृषि संस्कृति",
      "निबंध विधा"
    ],
    "learningObjectivesJson": "[\"भारत के कृषि उत्सवों की विविधता जानना\"]",
    "learningObjectives": [
      "भारत के कृषि उत्सवों की विविधता जानना"
    ]
  },
  {
    "id": "cat_c5_hin_ch3",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 3,
    "chapterTitle": "खिलौनेवाला",
    "topicsJson": "[\"सुभद्रा कुमारी चौहान कविता\",\"रामकथा संदर्भ\",\"संज्ञा और प्रत्यय\"]",
    "topics": [
      "सुभद्रा कुमारी चौहान कविता",
      "रामकथा संदर्भ",
      "संज्ञा और प्रत्यय"
    ],
    "learningObjectivesJson": "[\"काव्य रस व बाल भावनाओं की अभिव्यक्ति\"]",
    "learningObjectives": [
      "काव्य रस व बाल भावनाओं की अभिव्यक्ति"
    ]
  },
  {
    "id": "cat_c5_hin_ch4",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 4,
    "chapterTitle": "नन्हा फनकार",
    "topicsJson": "[\"केशव की नक्काशी\",\"बादशाह अकबर\",\"शिल्पकला शब्दावली\"]",
    "topics": [
      "केशव की नक्काशी",
      "बादशाह अकबर",
      "शिल्पकला शब्दावली"
    ],
    "learningObjectivesJson": "[\"परिश्रम व हस्तकला के प्रति सम्मान\"]",
    "learningObjectives": [
      "परिश्रम व हस्तकला के प्रति सम्मान"
    ]
  },
  {
    "id": "cat_c5_hin_ch5",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 5,
    "chapterTitle": "जहाँ चाह वहाँ राह",
    "topicsJson": "[\"इला सचानी की कशीदाकारी\",\"इच्छाशक्ति\",\"दिव्यांगता पर विजय\"]",
    "topics": [
      "इला सचानी की कशीदाकारी",
      "इच्छाशक्ति",
      "दिव्यांगता पर विजय"
    ],
    "learningObjectivesJson": "[\"दृढ़ संकल्प से बाधाओं को पार करना\"]",
    "learningObjectives": [
      "दृढ़ संकल्प से बाधाओं को पार करना"
    ]
  },
  {
    "id": "cat_c5_hin_ch6",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 6,
    "chapterTitle": "चिट्ठी का सफ़र",
    "topicsJson": "[\"डाक प्रणाली का इतिहास\",\"पिन कोड\",\"संचार माध्यम\"]",
    "topics": [
      "डाक प्रणाली का इतिहास",
      "पिन कोड",
      "संचार माध्यम"
    ],
    "learningObjectivesJson": "[\"पत्र लेखन का इतिहास व पिन कोड का महत्व\"]",
    "learningObjectives": [
      "पत्र लेखन का इतिहास व पिन कोड का महत्व"
    ]
  },
  {
    "id": "cat_c5_hin_ch7",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 7,
    "chapterTitle": "डाकिए की कहानी, कंवर सिंह की ज़ुबानी",
    "topicsJson": "[\"साक्षात्कार विधा\",\"पहाड़ी जीवन की चुनौतियाँ\",\"कर्तव्यनिष्ठा\"]",
    "topics": [
      "साक्षात्कार विधा",
      "पहाड़ी जीवन की चुनौतियाँ",
      "कर्तव्यनिष्ठा"
    ],
    "learningObjectivesJson": "[\"साक्षात्कार लेना व समझना\"]",
    "learningObjectives": [
      "साक्षात्कार लेना व समझना"
    ]
  },
  {
    "id": "cat_c5_hin_ch8",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 8,
    "chapterTitle": "वे दिन भी क्या दिन थे",
    "topicsJson": "[\"आइजक असीमोव विज्ञान कथा\",\"भविष्य के कंप्यूटर स्कूल\",\"तकनीक\"]",
    "topics": [
      "आइजक असीमोव विज्ञान कथा",
      "भविष्य के कंप्यूटर स्कूल",
      "तकनीक"
    ],
    "learningObjectivesJson": "[\"विज्ञान कथा व मानवीय शिक्षक का महत्व\"]",
    "learningObjectives": [
      "विज्ञान कथा व मानवीय शिक्षक का महत्व"
    ]
  },
  {
    "id": "cat_c5_hin_ch9",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 9,
    "chapterTitle": "एक माँ की बेबसी",
    "topicsJson": "[\"मूक बच्चे रतन की व्यथा\",\"संवेदना\",\"सहानुभूति\"]",
    "topics": [
      "मूक बच्चे रतन की व्यथा",
      "संवेदना",
      "सहानुभूति"
    ],
    "learningObjectivesJson": "[\"विशेष आवश्यकता वाले बच्चों के प्रति संवेदनशीलता\"]",
    "learningObjectives": [
      "विशेष आवश्यकता वाले बच्चों के प्रति संवेदनशीलता"
    ]
  },
  {
    "id": "cat_c5_hin_ch10",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 10,
    "chapterTitle": "एक दिन की बादशाहत",
    "topicsJson": "[\"बच्चों के अधिकार\",\"पारिवारिक हास्य\",\"उर्दू शब्दावली\"]",
    "topics": [
      "बच्चों के अधिकार",
      "पारिवारिक हास्य",
      "उर्दू शब्दावली"
    ],
    "learningObjectivesJson": "[\"सहानुभूतिपूर्ण दृष्टिकोण व हास्य भाव\"]",
    "learningObjectives": [
      "सहानुभूतिपूर्ण दृष्टिकोण व हास्य भाव"
    ]
  },
  {
    "id": "cat_c5_hin_ch11",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 11,
    "chapterTitle": "चावल की रोटियाँ",
    "topicsJson": "[\"बर्मी नाटक\",\"झूठ का परिणाम\",\"संवाद अदायगी\"]",
    "topics": [
      "बर्मी नाटक",
      "झूठ का परिणाम",
      "संवाद अदायगी"
    ],
    "learningObjectivesJson": "[\"झूठ बोलने के संकट व नाटक मंचन\"]",
    "learningObjectives": [
      "झूठ बोलने के संकट व नाटक मंचन"
    ]
  },
  {
    "id": "cat_c5_hin_ch12",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 12,
    "chapterTitle": "गुरु और चेला",
    "topicsJson": "[\"अंधेर नगरी चौपट राजा\",\"हास्य कविता\",\"तुकबंदी\"]",
    "topics": [
      "अंधेर नगरी चौपट राजा",
      "हास्य कविता",
      "तुकबंदी"
    ],
    "learningObjectivesJson": "[\"मूर्खता के खतरों को समझना\"]",
    "learningObjectives": [
      "मूर्खता के खतरों को समझना"
    ]
  },
  {
    "id": "cat_c5_hin_ch13",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 13,
    "chapterTitle": "स्वामी की दादी",
    "topicsJson": "[\"आर. के. नारायण की कथा\",\"मालगुडी के पात्र\",\"दादी-पोते का प्यार\"]",
    "topics": [
      "आर. के. नारायण की कथा",
      "मालगुडी के पात्र",
      "दादी-पोते का प्यार"
    ],
    "learningObjectivesJson": "[\"पारिवारिक आत्मीयता व रोचक कथा रस\"]",
    "learningObjectives": [
      "पारिवारिक आत्मीयता व रोचक कथा रस"
    ]
  },
  {
    "id": "cat_c5_hin_ch14",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 14,
    "chapterTitle": "बाघ आया उस रात",
    "topicsJson": "[\"नागार्जुन की कविता\",\"वन्यजीव संरक्षण\",\"पर्यावरण संकट\"]",
    "topics": [
      "नागार्जुन की कविता",
      "वन्यजीव संरक्षण",
      "पर्यावरण संकट"
    ],
    "learningObjectivesJson": "[\"वन्यजीवों के प्राकृतिक आवास का संरक्षण\"]",
    "learningObjectives": [
      "वन्यजीवों के प्राकृतिक आवास का संरक्षण"
    ]
  },
  {
    "id": "cat_c5_hin_ch15",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 15,
    "chapterTitle": "बिशन की दिलेरी",
    "topicsJson": "[\"तीतर पक्षी की रक्षा\",\"शिकार निषेध\",\"साहस\"]",
    "topics": [
      "तीतर पक्षी की रक्षा",
      "शिकार निषेध",
      "साहस"
    ],
    "learningObjectivesJson": "[\"घायल मूक पक्षी की रक्षा का साहस\"]",
    "learningObjectives": [
      "घायल मूक पक्षी की रक्षा का साहस"
    ]
  },
  {
    "id": "cat_c5_hin_ch16",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 16,
    "chapterTitle": "पानी रे पानी",
    "topicsJson": "[\"जल संकट\",\"अनुपम मिश्र का आलेख\",\"भूजल स्तर\"]",
    "topics": [
      "जल संकट",
      "अनुपम मिश्र का आलेख",
      "भूजल स्तर"
    ],
    "learningObjectivesJson": "[\"भूजल संचयन व जल संरक्षण का वैज्ञानिक दृष्टिकोण\"]",
    "learningObjectives": [
      "भूजल संचयन व जल संरक्षण का वैज्ञानिक दृष्टिकोण"
    ]
  },
  {
    "id": "cat_c5_hin_ch17",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 17,
    "chapterTitle": "छोटी-सी हमारी नदी",
    "topicsJson": "[\"रवींद्रनाथ ठाकुर कविता\",\"ग्रामीण नदी का जीवन\",\"प्राकृतिक सौंदर्य\"]",
    "topics": [
      "रवींद्रनाथ ठाकुर कविता",
      "ग्रामीण नदी का जीवन",
      "प्राकृतिक सौंदर्य"
    ],
    "learningObjectivesJson": "[\"नदियों के प्रति सम्मान व प्राकृतिक सौंदर्य बोध\"]",
    "learningObjectives": [
      "नदियों के प्रति सम्मान व प्राकृतिक सौंदर्य बोध"
    ]
  },
  {
    "id": "cat_c5_hin_ch18",
    "grade": "Class 5",
    "subject": "Hindi",
    "chapterNumber": 18,
    "chapterTitle": "चुनौती हिमालय की",
    "topicsJson": "[\"जवाहरलाल नेहरू की अमरनाथ यात्रा\",\"पर्वतारोहण\",\"साहसिक यात्रा वृत्तांत\"]",
    "topics": [
      "जवाहरलाल नेहरू की अमरनाथ यात्रा",
      "पर्वतारोहण",
      "साहसिक यात्रा वृत्तांत"
    ],
    "learningObjectivesJson": "[\"यात्रा वृत्तांत विधा व साहसिक चुनौतियों का सामना\"]",
    "learningObjectives": [
      "यात्रा वृत्तांत विधा व साहसिक चुनौतियों का सामना"
    ]
  },
  {
    "id": "cat_c6_math_ch1",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Patterns in Mathematics",
    "topicsJson": "[\"Number Patterns\",\"Visual Sequences\",\"Inductive Generalization\"]",
    "topics": [
      "Number Patterns",
      "Visual Sequences",
      "Inductive Generalization"
    ],
    "learningObjectivesJson": "[\"Discover numeric and visual patterns and articulate sequence rules\"]",
    "learningObjectives": [
      "Discover numeric and visual patterns and articulate sequence rules"
    ]
  },
  {
    "id": "cat_c6_math_ch2",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Lines and Angles",
    "topicsJson": "[\"Points, Lines, Rays, Segments\",\"Parallel & Intersecting Lines\",\"Acute, Right, Obtuse, Straight, Reflex Angles\"]",
    "topics": [
      "Points, Lines, Rays, Segments",
      "Parallel & Intersecting Lines",
      "Acute, Right, Obtuse, Straight, Reflex Angles"
    ],
    "learningObjectivesJson": "[\"Classify angles by measure and construct geometric relationships\"]",
    "learningObjectives": [
      "Classify angles by measure and construct geometric relationships"
    ]
  },
  {
    "id": "cat_c6_math_ch3",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Number Play",
    "topicsJson": "[\"BODMAS Rule\",\"Divisibility Rules (2, 3, 4, 5, 6, 8, 9, 10, 11)\",\"Prime Factorisation\"]",
    "topics": [
      "BODMAS Rule",
      "Divisibility Rules (2, 3, 4, 5, 6, 8, 9, 10, 11)",
      "Prime Factorisation"
    ],
    "learningObjectivesJson": "[\"Apply divisibility tests and prioritize operations with brackets\"]",
    "learningObjectives": [
      "Apply divisibility tests and prioritize operations with brackets"
    ]
  },
  {
    "id": "cat_c6_math_ch4",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Data Handling and Presentation",
    "topicsJson": "[\"Organizing Raw Data\",\"Tally Charts\",\"Pictographs & Bar Graphs Scale Selection\"]",
    "topics": [
      "Organizing Raw Data",
      "Tally Charts",
      "Pictographs & Bar Graphs Scale Selection"
    ],
    "learningObjectivesJson": "[\"Collect, organize, and visually represent discrete datasets\"]",
    "learningObjectives": [
      "Collect, organize, and visually represent discrete datasets"
    ]
  },
  {
    "id": "cat_c6_math_ch5",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Prime Time",
    "topicsJson": "[\"Prime vs Composite Numbers\",\"Sieve of Eratosthenes\",\"Co-Primes and Twin Primes\",\"HCF and LCM Applications\"]",
    "topics": [
      "Prime vs Composite Numbers",
      "Sieve of Eratosthenes",
      "Co-Primes and Twin Primes",
      "HCF and LCM Applications"
    ],
    "learningObjectivesJson": "[\"Compute HCF and LCM using prime factorisation algorithms\"]",
    "learningObjectives": [
      "Compute HCF and LCM using prime factorisation algorithms"
    ]
  },
  {
    "id": "cat_c6_math_ch6",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Perimeter and Area",
    "topicsJson": "[\"Perimeter of Regular Polygons\",\"Area of Rectangles and Squares\",\"Irregular Grid Enclosures\"]",
    "topics": [
      "Perimeter of Regular Polygons",
      "Area of Rectangles and Squares",
      "Irregular Grid Enclosures"
    ],
    "learningObjectivesJson": "[\"Differentiate linear perimeter from enclosed 2D surface area\"]",
    "learningObjectives": [
      "Differentiate linear perimeter from enclosed 2D surface area"
    ]
  },
  {
    "id": "cat_c6_math_ch7",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Fractions",
    "topicsJson": "[\"Proper, Improper, and Mixed Fractions\",\"Fractions on Number Line\",\"Equivalent Fractions\",\"Addition and Subtraction of Fractions\"]",
    "topics": [
      "Proper, Improper, and Mixed Fractions",
      "Fractions on Number Line",
      "Equivalent Fractions",
      "Addition and Subtraction of Fractions"
    ],
    "learningObjectivesJson": "[\"Operate on like and unlike fractions using common denominators\"]",
    "learningObjectives": [
      "Operate on like and unlike fractions using common denominators"
    ]
  },
  {
    "id": "cat_c6_math_ch8",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Playing with Constructions",
    "topicsJson": "[\"Ruler and Compass Use\",\"Perpendicular Bisector Construction\",\"Angle Bisector\",\"Constructing 60°, 90°, 120° Angles\"]",
    "topics": [
      "Ruler and Compass Use",
      "Perpendicular Bisector Construction",
      "Angle Bisector",
      "Constructing 60°, 90°, 120° Angles"
    ],
    "learningObjectivesJson": "[\"Execute exact geometric constructions using compass and straightedge\"]",
    "learningObjectives": [
      "Execute exact geometric constructions using compass and straightedge"
    ]
  },
  {
    "id": "cat_c6_math_ch9",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Symmetry",
    "topicsJson": "[\"Line Symmetry\",\"Mirror Reflection\",\"Rotational Symmetry Basics\"]",
    "topics": [
      "Line Symmetry",
      "Mirror Reflection",
      "Rotational Symmetry Basics"
    ],
    "learningObjectivesJson": "[\"Identify multiple lines of symmetry in geometric figures\"]",
    "learningObjectives": [
      "Identify multiple lines of symmetry in geometric figures"
    ]
  },
  {
    "id": "cat_c6_math_ch10",
    "grade": "Class 6",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "The Other Side of Zero",
    "topicsJson": "[\"Concept of Negative Numbers\",\"Integers on Number Line\",\"Addition and Subtraction of Integers\",\"Absolute Value\"]",
    "topics": [
      "Concept of Negative Numbers",
      "Integers on Number Line",
      "Addition and Subtraction of Integers",
      "Absolute Value"
    ],
    "learningObjectivesJson": "[\"Understand integer polarity and execute directed number operations\"]",
    "learningObjectives": [
      "Understand integer polarity and execute directed number operations"
    ]
  },
  {
    "id": "cat_c6_sci_ch1",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 1,
    "chapterTitle": "The Wonderful World of Science",
    "topicsJson": "[\"Scientific Method\",\"Observation & Hypothesis Testing\",\"Laboratory Safety and Measurements\"]",
    "topics": [
      "Scientific Method",
      "Observation & Hypothesis Testing",
      "Laboratory Safety and Measurements"
    ],
    "learningObjectivesJson": "[\"Formulate empirical hypotheses and practice systematic observation\"]",
    "learningObjectives": [
      "Formulate empirical hypotheses and practice systematic observation"
    ]
  },
  {
    "id": "cat_c6_sci_ch2",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 2,
    "chapterTitle": "Diversity in the Living World",
    "topicsJson": "[\"Classification of Organisms\",\"Terrestrial and Aquatic Habitats\",\"Morphological Adaptations\"]",
    "topics": [
      "Classification of Organisms",
      "Terrestrial and Aquatic Habitats",
      "Morphological Adaptations"
    ],
    "learningObjectivesJson": "[\"Group living organisms by habitat adaptations and structural traits\"]",
    "learningObjectives": [
      "Group living organisms by habitat adaptations and structural traits"
    ]
  },
  {
    "id": "cat_c6_sci_ch3",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 3,
    "chapterTitle": "Mindful Eating: A Path to a Healthy Body",
    "topicsJson": "[\"Macronutrients & Micronutrients (Carbs, Proteins, Fats, Vitamins, Minerals)\",\"Balanced Diet\",\"Deficiency Diseases (Scurvy, Beriberi, Rickets, Anemia)\"]",
    "topics": [
      "Macronutrients & Micronutrients (Carbs, Proteins, Fats, Vitamins, Minerals)",
      "Balanced Diet",
      "Deficiency Diseases (Scurvy, Beriberi, Rickets, Anemia)"
    ],
    "learningObjectivesJson": "[\"Design balanced diets and diagnose nutrient deficiency symptoms\"]",
    "learningObjectives": [
      "Design balanced diets and diagnose nutrient deficiency symptoms"
    ]
  },
  {
    "id": "cat_c6_sci_ch4",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 4,
    "chapterTitle": "Exploring Magnets",
    "topicsJson": "[\"Magnetic vs Non-Magnetic Materials\",\"Poles of a Magnet\",\"Attraction and Repulsion Laws\",\"Making a Magnetic Compass\"]",
    "topics": [
      "Magnetic vs Non-Magnetic Materials",
      "Poles of a Magnet",
      "Attraction and Repulsion Laws",
      "Making a Magnetic Compass"
    ],
    "learningObjectivesJson": "[\"Test magnetic field interactions and build a simple compass\"]",
    "learningObjectives": [
      "Test magnetic field interactions and build a simple compass"
    ]
  },
  {
    "id": "cat_c6_sci_ch5",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 5,
    "chapterTitle": "Measurement of Length and Motion",
    "topicsJson": "[\"Standard Units of Measurement (SI Units)\",\"Measuring Curved Lines with Thread\",\"Types of Motion (Rectilinear, Circular, Periodic)\"]",
    "topics": [
      "Standard Units of Measurement (SI Units)",
      "Measuring Curved Lines with Thread",
      "Types of Motion (Rectilinear, Circular, Periodic)"
    ],
    "learningObjectivesJson": "[\"Measure physical lengths with precision and classify motion dynamics\"]",
    "learningObjectives": [
      "Measure physical lengths with precision and classify motion dynamics"
    ]
  },
  {
    "id": "cat_c6_sci_ch6",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 6,
    "chapterTitle": "Materials Around Us",
    "topicsJson": "[\"Properties of Materials: Lustre, Hardness, Solubility, Density\",\"Transparency (Transparent, Translucent, Opaque)\"]",
    "topics": [
      "Properties of Materials: Lustre, Hardness, Solubility, Density",
      "Transparency (Transparent, Translucent, Opaque)"
    ],
    "learningObjectivesJson": "[\"Classify everyday materials by light transmission and solubility\"]",
    "learningObjectives": [
      "Classify everyday materials by light transmission and solubility"
    ]
  },
  {
    "id": "cat_c6_sci_ch7",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 7,
    "chapterTitle": "Temperature and its Measurement",
    "topicsJson": "[\"Concept of Heat and Temperature\",\"Clinical vs Laboratory Thermometers\",\"Celsius and Fahrenheit Scales\"]",
    "topics": [
      "Concept of Heat and Temperature",
      "Clinical vs Laboratory Thermometers",
      "Celsius and Fahrenheit Scales"
    ],
    "learningObjectivesJson": "[\"Read clinical and lab thermometers accurately and compare scales\"]",
    "learningObjectives": [
      "Read clinical and lab thermometers accurately and compare scales"
    ]
  },
  {
    "id": "cat_c6_sci_ch8",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 8,
    "chapterTitle": "A Journey through States of Water",
    "topicsJson": "[\"Phase Transitions (Melting, Freezing, Evaporation, Condensation)\",\"Water Cycle\",\"Transpiration and Precipitation\"]",
    "topics": [
      "Phase Transitions (Melting, Freezing, Evaporation, Condensation)",
      "Water Cycle",
      "Transpiration and Precipitation"
    ],
    "learningObjectivesJson": "[\"Trace water cycling through atmospheric states of matter\"]",
    "learningObjectives": [
      "Trace water cycling through atmospheric states of matter"
    ]
  },
  {
    "id": "cat_c6_sci_ch9",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 9,
    "chapterTitle": "Methods of Separation in Everyday Life",
    "topicsJson": "[\"Handpicking, Threshing, Winnowing, Sieving\",\"Sedimentation, Decantation, Filtration\",\"Evaporation and Condensation\"]",
    "topics": [
      "Handpicking, Threshing, Winnowing, Sieving",
      "Sedimentation, Decantation, Filtration",
      "Evaporation and Condensation"
    ],
    "learningObjectivesJson": "[\"Select appropriate separation techniques for heterogeneous mixtures\"]",
    "learningObjectives": [
      "Select appropriate separation techniques for heterogeneous mixtures"
    ]
  },
  {
    "id": "cat_c6_sci_ch10",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 10,
    "chapterTitle": "Living Creatures: Exploring their Characteristics",
    "topicsJson": "[\"Cellular Organization\",\"Respiration and Nutrition\",\"Response to Stimuli (Touch-Me-Not)\",\"Excretion and Reproduction\"]",
    "topics": [
      "Cellular Organization",
      "Respiration and Nutrition",
      "Response to Stimuli (Touch-Me-Not)",
      "Excretion and Reproduction"
    ],
    "learningObjectivesJson": "[\"Differentiate biotic from abiotic entities through vital life functions\"]",
    "learningObjectives": [
      "Differentiate biotic from abiotic entities through vital life functions"
    ]
  },
  {
    "id": "cat_c6_sci_ch11",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 11,
    "chapterTitle": "Nature's Treasures",
    "topicsJson": "[\"Forests, Soil, and Minerals\",\"Renewable vs Non-Renewable Resources\",\"Conservation Practices\"]",
    "topics": [
      "Forests, Soil, and Minerals",
      "Renewable vs Non-Renewable Resources",
      "Conservation Practices"
    ],
    "learningObjectivesJson": "[\"Evaluate the sustainability of natural resource extraction\"]",
    "learningObjectives": [
      "Evaluate the sustainability of natural resource extraction"
    ]
  },
  {
    "id": "cat_c6_sci_ch12",
    "grade": "Class 6",
    "subject": "Science",
    "chapterNumber": 12,
    "chapterTitle": "Beyond Earth",
    "topicsJson": "[\"Solar System\",\"Planets, Asteroids, Comets\",\"Phases of the Moon\",\"Constellations and Pole Star\"]",
    "topics": [
      "Solar System",
      "Planets, Asteroids, Comets",
      "Phases of the Moon",
      "Constellations and Pole Star"
    ],
    "learningObjectivesJson": "[\"Map solar system bodies and explain lunar phase geometry\"]",
    "learningObjectives": [
      "Map solar system bodies and explain lunar phase geometry"
    ]
  },
  {
    "id": "cat_c6_soc_ch1",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Locating Places on the Earth",
    "topicsJson": "[\"Latitudes and Longitudes\",\"Equator, Tropics, and Poles\",\"Time Zones & Prime Meridian\"]",
    "topics": [
      "Latitudes and Longitudes",
      "Equator, Tropics, and Poles",
      "Time Zones & Prime Meridian"
    ],
    "learningObjectivesJson": "[\"Locate coordinates on the globe and compute standard time offsets\"]",
    "learningObjectives": [
      "Locate coordinates on the globe and compute standard time offsets"
    ]
  },
  {
    "id": "cat_c6_soc_ch2",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Oceans and Continents",
    "topicsJson": "[\"Seven Continents and Five Oceans\",\"Plate Tectonics Basics\",\"Major Oceanic Currents\"]",
    "topics": [
      "Seven Continents and Five Oceans",
      "Plate Tectonics Basics",
      "Major Oceanic Currents"
    ],
    "learningObjectivesJson": "[\"Identify global landmasses and oceanic distributions\"]",
    "learningObjectives": [
      "Identify global landmasses and oceanic distributions"
    ]
  },
  {
    "id": "cat_c6_soc_ch3",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Landforms and Life",
    "topicsJson": "[\"Mountains, Plateaus, and Plains\",\"Erosion and Deposition\",\"Human Livelihoods across Landforms\"]",
    "topics": [
      "Mountains, Plateaus, and Plains",
      "Erosion and Deposition",
      "Human Livelihoods across Landforms"
    ],
    "learningObjectivesJson": "[\"Examine how physical relief features influence human settlement\"]",
    "learningObjectives": [
      "Examine how physical relief features influence human settlement"
    ]
  },
  {
    "id": "cat_c6_soc_ch4",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Timeline and Sources of History",
    "topicsJson": "[\"BCE and CE Dating Systems\",\"Archaeological Sources (Inscriptions, Coins, Artifacts)\",\"Literary Manuscripts\"]",
    "topics": [
      "BCE and CE Dating Systems",
      "Archaeological Sources (Inscriptions, Coins, Artifacts)",
      "Literary Manuscripts"
    ],
    "learningObjectivesJson": "[\"Construct historical timelines using multi-source evidence\"]",
    "learningObjectives": [
      "Construct historical timelines using multi-source evidence"
    ]
  },
  {
    "id": "cat_c6_soc_ch5",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "India, That Is Bharat",
    "topicsJson": "[\"Etymology of Bharat and India\",\"Geographical Unity of Indian Subcontinent\",\"Ancient Cultural Continuity\"]",
    "topics": [
      "Etymology of Bharat and India",
      "Geographical Unity of Indian Subcontinent",
      "Ancient Cultural Continuity"
    ],
    "learningObjectivesJson": "[\"Understand historical nomenclature and civilizational identity\"]",
    "learningObjectives": [
      "Understand historical nomenclature and civilizational identity"
    ]
  },
  {
    "id": "cat_c6_soc_ch6",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "The Beginnings of Indian Civilisation",
    "topicsJson": "[\"Harappan / Indus-Saraswati Civilization\",\"Town Planning and Drainage\",\"Great Bath, Granaries, and Seals\"]",
    "topics": [
      "Harappan / Indus-Saraswati Civilization",
      "Town Planning and Drainage",
      "Great Bath, Granaries, and Seals"
    ],
    "learningObjectivesJson": "[\"Analyze urban planning innovations of Harappan society\"]",
    "learningObjectives": [
      "Analyze urban planning innovations of Harappan society"
    ]
  },
  {
    "id": "cat_c6_soc_ch7",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "India's Cultural Roots",
    "topicsJson": "[\"Vedic Literature and Society\",\"Upanishadic Philosophy\",\"Epics: Ramayana and Mahabharata Traditions\"]",
    "topics": [
      "Vedic Literature and Society",
      "Upanishadic Philosophy",
      "Epics: Ramayana and Mahabharata Traditions"
    ],
    "learningObjectivesJson": "[\"Appreciate ancient philosophical systems and epic traditions\"]",
    "learningObjectives": [
      "Appreciate ancient philosophical systems and epic traditions"
    ]
  },
  {
    "id": "cat_c6_soc_ch8",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 8,
    "chapterTitle": "Unity in Diversity, or 'Many in the One'",
    "topicsJson": "[\"Linguistic and Cultural Pluralism\",\"Shared Festivals\",\"Constitutional Harmony\"]",
    "topics": [
      "Linguistic and Cultural Pluralism",
      "Shared Festivals",
      "Constitutional Harmony"
    ],
    "learningObjectivesJson": "[\"Celebrate Indian socio-cultural cohesion amid regional variety\"]",
    "learningObjectives": [
      "Celebrate Indian socio-cultural cohesion amid regional variety"
    ]
  },
  {
    "id": "cat_c6_soc_ch9",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 9,
    "chapterTitle": "Family and Community",
    "topicsJson": "[\"Primary Social Units\",\"Mutual Obligations\",\"Community Support Systems\"]",
    "topics": [
      "Primary Social Units",
      "Mutual Obligations",
      "Community Support Systems"
    ],
    "learningObjectivesJson": "[\"Explain community social bonds and interpersonal civic duties\"]",
    "learningObjectives": [
      "Explain community social bonds and interpersonal civic duties"
    ]
  },
  {
    "id": "cat_c6_soc_ch10",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 10,
    "chapterTitle": "Grassroots Democracy — Part 1: Governance",
    "topicsJson": "[\"Panchayati Raj System\",\"Gram Sabha Functions\",\"Direct Citizen Participation\"]",
    "topics": [
      "Panchayati Raj System",
      "Gram Sabha Functions",
      "Direct Citizen Participation"
    ],
    "learningObjectivesJson": "[\"Analyze the operational mechanics of rural grassroots governance\"]",
    "learningObjectives": [
      "Analyze the operational mechanics of rural grassroots governance"
    ]
  },
  {
    "id": "cat_c6_soc_ch11",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 11,
    "chapterTitle": "Grassroots Democracy — Part 2: Local Government in Rural Areas",
    "topicsJson": "[\"Gram Panchayat, Panchayat Samiti, Zila Parishad\",\"Rural Development Projects\",\"Panchayat Funding Sources\"]",
    "topics": [
      "Gram Panchayat, Panchayat Samiti, Zila Parishad",
      "Rural Development Projects",
      "Panchayat Funding Sources"
    ],
    "learningObjectivesJson": "[\"Trace three-tier rural governance responsibilities and revenue\"]",
    "learningObjectives": [
      "Trace three-tier rural governance responsibilities and revenue"
    ]
  },
  {
    "id": "cat_c6_soc_ch12",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 12,
    "chapterTitle": "Grassroots Democracy — Part 3: Local Government in Urban Areas",
    "topicsJson": "[\"Municipal Corporations and Municipalities\",\"Ward Councillors and Committees\",\"Urban Waste and Public Health\"]",
    "topics": [
      "Municipal Corporations and Municipalities",
      "Ward Councillors and Committees",
      "Urban Waste and Public Health"
    ],
    "learningObjectivesJson": "[\"Examine urban civic administration and municipal service delivery\"]",
    "learningObjectives": [
      "Examine urban civic administration and municipal service delivery"
    ]
  },
  {
    "id": "cat_c6_soc_ch13",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 13,
    "chapterTitle": "The Value of Work",
    "topicsJson": "[\"Dignity of Labour\",\"Domestic Unpaid Labour Recognition\",\"Specialization in Production\"]",
    "topics": [
      "Dignity of Labour",
      "Domestic Unpaid Labour Recognition",
      "Specialization in Production"
    ],
    "learningObjectivesJson": "[\"Value household and informal labour equitably\"]",
    "learningObjectives": [
      "Value household and informal labour equitably"
    ]
  },
  {
    "id": "cat_c6_soc_ch14",
    "grade": "Class 6",
    "subject": "Social Science",
    "chapterNumber": 14,
    "chapterTitle": "Economic Activities Around Us",
    "topicsJson": "[\"Primary, Secondary, and Tertiary Sectors\",\"Livelihood Diversification\",\"Fair Market Exchanges\"]",
    "topics": [
      "Primary, Secondary, and Tertiary Sectors",
      "Livelihood Diversification",
      "Fair Market Exchanges"
    ],
    "learningObjectivesJson": "[\"Categorize local economic occupations across primary/secondary/tertiary sectors\"]",
    "learningObjectives": [
      "Categorize local economic occupations across primary/secondary/tertiary sectors"
    ]
  },
  {
    "id": "cat_c6_eng_ch1",
    "grade": "Class 6",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Fables and Folk Tales (Ch 1: A Bottle of Dew, Ch 2: The Raven and the Fox, Ch 3: Rama to the Rescue)",
    "topicsJson": "[\"Traditional Fables\",\"Poetic Irony\",\"Moral Decisions\",\"Simple Past & Past Continuous\"]",
    "topics": [
      "Traditional Fables",
      "Poetic Irony",
      "Moral Decisions",
      "Simple Past & Past Continuous"
    ],
    "learningObjectivesJson": "[\"Comprehend folk fables and distinguish narrative past tenses\"]",
    "learningObjectives": [
      "Comprehend folk fables and distinguish narrative past tenses"
    ]
  },
  {
    "id": "cat_c6_eng_ch2",
    "grade": "Class 6",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Friendship (Ch 4: The Unlikely Best Friends, Ch 5: A Friend's Prayer, Ch 6: The Chair)",
    "topicsJson": "[\"Empathy across Barriers\",\"Poetic Verses on Loyalty\",\"Reflexive Pronouns\",\"Vocabulary of Companionship\"]",
    "topics": [
      "Empathy across Barriers",
      "Poetic Verses on Loyalty",
      "Reflexive Pronouns",
      "Vocabulary of Companionship"
    ],
    "learningObjectivesJson": "[\"Express values of empathy and apply reflexive pronouns\"]",
    "learningObjectives": [
      "Express values of empathy and apply reflexive pronouns"
    ]
  },
  {
    "id": "cat_c6_eng_ch3",
    "grade": "Class 6",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Nurturing Nature (Ch 7: Neem Baba, Ch 8: What a Bird Thought, Ch 9: Spices that Heal Us)",
    "topicsJson": "[\"Medicinal Trees\",\"Perspective Poetry\",\"Herbal Wellness\",\"Adverbs of Frequency\"]",
    "topics": [
      "Medicinal Trees",
      "Perspective Poetry",
      "Herbal Wellness",
      "Adverbs of Frequency"
    ],
    "learningObjectivesJson": "[\"Analyze environmental literature and use adverbs of frequency\"]",
    "learningObjectives": [
      "Analyze environmental literature and use adverbs of frequency"
    ]
  },
  {
    "id": "cat_c6_eng_ch4",
    "grade": "Class 6",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "Sports and Wellness (Ch 10: Change of Heart, Ch 11: The Winner, Ch 12: Yoga—A Way of Life)",
    "topicsJson": "[\"Sportsmanship\",\"Resilience Narrative\",\"Mind-Body Health\",\"Modal Auxiliaries (must, should)\"]",
    "topics": [
      "Sportsmanship",
      "Resilience Narrative",
      "Mind-Body Health",
      "Modal Auxiliaries (must, should)"
    ],
    "learningObjectivesJson": "[\"Learn ethical sports conduct and apply obligation modals\"]",
    "learningObjectives": [
      "Learn ethical sports conduct and apply obligation modals"
    ]
  },
  {
    "id": "cat_c6_eng_ch5",
    "grade": "Class 6",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "Culture and Tradition (Ch 13: Hamara Bharat—Incredible India!, Ch 14: The Kites, Ch 15: Ila Sachani / National War Memorial)",
    "topicsJson": "[\"Patriotism & Cultural Heritage\",\"Poetry of Flight\",\"Courage and Sacrifice\",\"Compound Sentences\"]",
    "topics": [
      "Patriotism & Cultural Heritage",
      "Poetry of Flight",
      "Courage and Sacrifice",
      "Compound Sentences"
    ],
    "learningObjectivesJson": "[\"Express pride in national heritage and combine clauses with conjunctions\"]",
    "learningObjectives": [
      "Express pride in national heritage and combine clauses with conjunctions"
    ]
  },
  {
    "id": "cat_c7_math_ch1",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Integers",
    "topicsJson": "[\"Properties of Addition & Subtraction (Closure, Commutative, Associative)\",\"Multiplication & Division of Integers\",\"Word Problems\"]",
    "topics": [
      "Properties of Addition & Subtraction (Closure, Commutative, Associative)",
      "Multiplication & Division of Integers",
      "Word Problems"
    ],
    "learningObjectivesJson": "[\"Execute signed arithmetic and apply distributive properties\"]",
    "learningObjectives": [
      "Execute signed arithmetic and apply distributive properties"
    ]
  },
  {
    "id": "cat_c7_math_ch2",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Fractions and Decimals",
    "topicsJson": "[\"Multiplication & Division of Fractions\",\"Multiplication & Division of Decimals\",\"Reciprocals\"]",
    "topics": [
      "Multiplication & Division of Fractions",
      "Multiplication & Division of Decimals",
      "Reciprocals"
    ],
    "learningObjectivesJson": "[\"Solve complex fractional operations and decimal scaling\"]",
    "learningObjectives": [
      "Solve complex fractional operations and decimal scaling"
    ]
  },
  {
    "id": "cat_c7_math_ch3",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Data Handling",
    "topicsJson": "[\"Arithmetic Mean, Median, Mode\",\"Range of Data\",\"Double Bar Graphs\",\"Probability of Simple Events\"]",
    "topics": [
      "Arithmetic Mean, Median, Mode",
      "Range of Data",
      "Double Bar Graphs",
      "Probability of Simple Events"
    ],
    "learningObjectivesJson": "[\"Calculate central tendency statistics and plot double bar graphs\"]",
    "learningObjectives": [
      "Calculate central tendency statistics and plot double bar graphs"
    ]
  },
  {
    "id": "cat_c7_math_ch4",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Simple Equations",
    "topicsJson": "[\"Setting up Algebraic Equations\",\"Solving by Balancing Method\",\"Transposition Method\",\"Word Problems\"]",
    "topics": [
      "Setting up Algebraic Equations",
      "Solving by Balancing Method",
      "Transposition Method",
      "Word Problems"
    ],
    "learningObjectivesJson": "[\"Model contextual problems into linear equations and solve\"]",
    "learningObjectives": [
      "Model contextual problems into linear equations and solve"
    ]
  },
  {
    "id": "cat_c7_math_ch5",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Lines and Angles",
    "topicsJson": "[\"Complementary & Supplementary Angles\",\"Adjacent Angles & Linear Pairs\",\"Vertically Opposite Angles\",\"Transversal on Parallel Lines (Alternate, Corresponding, Interior)\"]",
    "topics": [
      "Complementary & Supplementary Angles",
      "Adjacent Angles & Linear Pairs",
      "Vertically Opposite Angles",
      "Transversal on Parallel Lines (Alternate, Corresponding, Interior)"
    ],
    "learningObjectivesJson": "[\"Calculate missing angle measures using parallel line transversal theorems\"]",
    "learningObjectives": [
      "Calculate missing angle measures using parallel line transversal theorems"
    ]
  },
  {
    "id": "cat_c7_math_ch6",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "The Triangle and its Properties",
    "topicsJson": "[\"Medians & Altitudes\",\"Exterior Angle Property\",\"Angle Sum Property of Triangle (180°)\",\"Triangle Inequality\",\"Pythagoras Theorem\"]",
    "topics": [
      "Medians & Altitudes",
      "Exterior Angle Property",
      "Angle Sum Property of Triangle (180°)",
      "Triangle Inequality",
      "Pythagoras Theorem"
    ],
    "learningObjectivesJson": "[\"Prove triangle properties and calculate right-triangle hypotenuse lengths\"]",
    "learningObjectives": [
      "Prove triangle properties and calculate right-triangle hypotenuse lengths"
    ]
  },
  {
    "id": "cat_c7_math_ch7",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Comparing Quantities",
    "topicsJson": "[\"Ratio to Percentage\",\"Percentage Increase/Decrease\",\"Profit and Loss Percentage\",\"Simple Interest Formula (I = PRT/100)\"]",
    "topics": [
      "Ratio to Percentage",
      "Percentage Increase/Decrease",
      "Profit and Loss Percentage",
      "Simple Interest Formula (I = PRT/100)"
    ],
    "learningObjectivesJson": "[\"Compute commercial percentage gains and simple interest\"]",
    "learningObjectives": [
      "Compute commercial percentage gains and simple interest"
    ]
  },
  {
    "id": "cat_c7_math_ch8",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Rational Numbers",
    "topicsJson": "[\"Definition of Rational Numbers (p/q, q != 0)\",\"Equivalent Rationals\",\"Rationals on Number Line\",\"Arithmetic Operations\"]",
    "topics": [
      "Definition of Rational Numbers (p/q, q != 0)",
      "Equivalent Rationals",
      "Rationals on Number Line",
      "Arithmetic Operations"
    ],
    "learningObjectivesJson": "[\"Operate on positive and negative rational numbers\"]",
    "learningObjectives": [
      "Operate on positive and negative rational numbers"
    ]
  },
  {
    "id": "cat_c7_math_ch9",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Perimeter and Area",
    "topicsJson": "[\"Area of Parallelograms (b x h)\",\"Area of Triangles (1/2 x b x h)\",\"Circumference of Circle (2 x pi x r)\",\"Area of Circle (pi x r^2)\"]",
    "topics": [
      "Area of Parallelograms (b x h)",
      "Area of Triangles (1/2 x b x h)",
      "Circumference of Circle (2 x pi x r)",
      "Area of Circle (pi x r^2)"
    ],
    "learningObjectivesJson": "[\"Calculate circular boundaries and areas of parallelograms\"]",
    "learningObjectives": [
      "Calculate circular boundaries and areas of parallelograms"
    ]
  },
  {
    "id": "cat_c7_math_ch10",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Algebraic Expressions",
    "topicsJson": "[\"Terms, Factors, and Coefficients\",\"Monomials, Binomials, Polynomials\",\"Like and Unlike Terms\",\"Addition and Subtraction of Expressions\",\"Evaluating Expressions\"]",
    "topics": [
      "Terms, Factors, and Coefficients",
      "Monomials, Binomials, Polynomials",
      "Like and Unlike Terms",
      "Addition and Subtraction of Expressions",
      "Evaluating Expressions"
    ],
    "learningObjectivesJson": "[\"Combine like terms and evaluate algebraic expressions at given variable values\"]",
    "learningObjectives": [
      "Combine like terms and evaluate algebraic expressions at given variable values"
    ]
  },
  {
    "id": "cat_c7_math_ch11",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Exponents and Powers",
    "topicsJson": "[\"Laws of Exponents (a^m x a^n, (a^m)^n, a^m / a^n)\",\"Exponents with Negative Base\",\"Decimal System Scientific Notation\"]",
    "topics": [
      "Laws of Exponents (a^m x a^n, (a^m)^n, a^m / a^n)",
      "Exponents with Negative Base",
      "Decimal System Scientific Notation"
    ],
    "learningObjectivesJson": "[\"Simplify large numbers using exponential power laws\"]",
    "learningObjectives": [
      "Simplify large numbers using exponential power laws"
    ]
  },
  {
    "id": "cat_c7_math_ch12",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "Symmetry",
    "topicsJson": "[\"Lines of Symmetry for Regular Polygons\",\"Rotational Symmetry (Angle and Order of Symmetry)\"]",
    "topics": [
      "Lines of Symmetry for Regular Polygons",
      "Rotational Symmetry (Angle and Order of Symmetry)"
    ],
    "learningObjectivesJson": "[\"Determine rotational symmetry order and center for polygons\"]",
    "learningObjectives": [
      "Determine rotational symmetry order and center for polygons"
    ]
  },
  {
    "id": "cat_c7_math_ch13",
    "grade": "Class 7",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "Visualising Solid Shapes",
    "topicsJson": "[\"2D Nets of 3D Objects\",\"Oblique vs Isometric Sketches\",\"Faces, Edges, Vertices\",\"Euler's Formula (F + V - E = 2)\"]",
    "topics": [
      "2D Nets of 3D Objects",
      "Oblique vs Isometric Sketches",
      "Faces, Edges, Vertices",
      "Euler's Formula (F + V - E = 2)"
    ],
    "learningObjectivesJson": "[\"Verify Euler's polyhedron formula on standard 3D polyhedra\"]",
    "learningObjectives": [
      "Verify Euler's polyhedron formula on standard 3D polyhedra"
    ]
  },
  {
    "id": "cat_c7_sci_ch1",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 1,
    "chapterTitle": "Nutrition in Plants",
    "topicsJson": "[\"Autotrophic vs Heterotrophic Nutrition\",\"Photosynthesis Mechanism & Stomata\",\"Parasites (Cuscuta), Insectivorous Plants, Saprotrophs\",\"Nitrogen Replenishment in Soil\"]",
    "topics": [
      "Autotrophic vs Heterotrophic Nutrition",
      "Photosynthesis Mechanism & Stomata",
      "Parasites (Cuscuta), Insectivorous Plants, Saprotrophs",
      "Nitrogen Replenishment in Soil"
    ],
    "learningObjectivesJson": "[\"Explain chemical equations of photosynthesis and parasitic adaptations\"]",
    "learningObjectives": [
      "Explain chemical equations of photosynthesis and parasitic adaptations"
    ]
  },
  {
    "id": "cat_c7_sci_ch2",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 2,
    "chapterTitle": "Nutrition in Animals",
    "topicsJson": "[\"Human Alimentary Canal (Mouth, Stomach, Small & Large Intestine)\",\"Digestion in Ruminants (Cud Chewing)\",\"Feeding and Digestion in Amoeba (Pseudopodia)\"]",
    "topics": [
      "Human Alimentary Canal (Mouth, Stomach, Small & Large Intestine)",
      "Digestion in Ruminants (Cud Chewing)",
      "Feeding and Digestion in Amoeba (Pseudopodia)"
    ],
    "learningObjectivesJson": "[\"Trace enzyme digestion and compare ruminant stomach chambers\"]",
    "learningObjectives": [
      "Trace enzyme digestion and compare ruminant stomach chambers"
    ]
  },
  {
    "id": "cat_c7_sci_ch3",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 3,
    "chapterTitle": "Heat",
    "topicsJson": "[\"Heat vs Temperature\",\"Conduction, Convection, Radiation\",\"Conductors vs Insulators\",\"Land Breeze and Sea Breeze Mechanics\"]",
    "topics": [
      "Heat vs Temperature",
      "Conduction, Convection, Radiation",
      "Conductors vs Insulators",
      "Land Breeze and Sea Breeze Mechanics"
    ],
    "learningObjectivesJson": "[\"Differentiate modes of heat transfer and explain coastal sea breezes\"]",
    "learningObjectives": [
      "Differentiate modes of heat transfer and explain coastal sea breezes"
    ]
  },
  {
    "id": "cat_c7_sci_ch4",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 4,
    "chapterTitle": "Acids, Bases and Salts",
    "topicsJson": "[\"Natural Indicators (Litmus, Turmeric, China Rose)\",\"Properties of Acids and Bases\",\"Neutralisation Reaction\",\"Neutralisation in Daily Life (Indigestion, Ant Sting, Soil Treatment)\"]",
    "topics": [
      "Natural Indicators (Litmus, Turmeric, China Rose)",
      "Properties of Acids and Bases",
      "Neutralisation Reaction",
      "Neutralisation in Daily Life (Indigestion, Ant Sting, Soil Treatment)"
    ],
    "learningObjectivesJson": "[\"Execute acid-base indicator tests and explain soil neutralization\"]",
    "learningObjectives": [
      "Execute acid-base indicator tests and explain soil neutralization"
    ]
  },
  {
    "id": "cat_c7_sci_ch5",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 5,
    "chapterTitle": "Physical and Chemical Changes",
    "topicsJson": "[\"Physical vs Chemical Changes\",\"Rusting of Iron and Galvanisation\",\"Crystallisation of Copper Sulphate\",\"Burning of Magnesium Ribbon\"]",
    "topics": [
      "Physical vs Chemical Changes",
      "Rusting of Iron and Galvanisation",
      "Crystallisation of Copper Sulphate",
      "Burning of Magnesium Ribbon"
    ],
    "learningObjectivesJson": "[\"Distinguish reversible physical changes from irreversible chemical syntheses\"]",
    "learningObjectives": [
      "Distinguish reversible physical changes from irreversible chemical syntheses"
    ]
  },
  {
    "id": "cat_c7_sci_ch6",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 6,
    "chapterTitle": "Respiration in Organisms",
    "topicsJson": "[\"Aerobic vs Anaerobic Respiration\",\"Human Breathing Mechanism (Diaphragm, Ribs)\",\"Breathing in Cockroach (Spiracles), Earthworm (Skin), Fish (Gills)\",\"Plant Respiration\"]",
    "topics": [
      "Aerobic vs Anaerobic Respiration",
      "Human Breathing Mechanism (Diaphragm, Ribs)",
      "Breathing in Cockroach (Spiracles), Earthworm (Skin), Fish (Gills)",
      "Plant Respiration"
    ],
    "learningObjectivesJson": "[\"Compare cellular ATP respiration across organisms\"]",
    "learningObjectives": [
      "Compare cellular ATP respiration across organisms"
    ]
  },
  {
    "id": "cat_c7_sci_ch7",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 7,
    "chapterTitle": "Transportation in Animals and Plants",
    "topicsJson": "[\"Circulatory System (Heart Chambers, Blood Vessels: Arteries, Veins, Capillaries)\",\"Blood Groups and Components (RBC, WBC, Platelets)\",\"Excretory System & Kidneys\",\"Xylem and Phloem in Plants\"]",
    "topics": [
      "Circulatory System (Heart Chambers, Blood Vessels: Arteries, Veins, Capillaries)",
      "Blood Groups and Components (RBC, WBC, Platelets)",
      "Excretory System & Kidneys",
      "Xylem and Phloem in Plants"
    ],
    "learningObjectivesJson": "[\"Explain dual circulation in human hearts and vascular transport in plants\"]",
    "learningObjectives": [
      "Explain dual circulation in human hearts and vascular transport in plants"
    ]
  },
  {
    "id": "cat_c7_sci_ch8",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 8,
    "chapterTitle": "Reproduction in Plants",
    "topicsJson": "[\"Asexual Reproduction (Vegetative Propagation, Budding, Fragmentation, Spores)\",\"Sexual Reproduction (Flower Anatomy: Stamen, Pistil)\",\"Pollination (Self vs Cross)\",\"Seed Dispersal\"]",
    "topics": [
      "Asexual Reproduction (Vegetative Propagation, Budding, Fragmentation, Spores)",
      "Sexual Reproduction (Flower Anatomy: Stamen, Pistil)",
      "Pollination (Self vs Cross)",
      "Seed Dispersal"
    ],
    "learningObjectivesJson": "[\"Distinguish vegetative propagation from floral seed fertilization\"]",
    "learningObjectives": [
      "Distinguish vegetative propagation from floral seed fertilization"
    ]
  },
  {
    "id": "cat_c7_sci_ch9",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 9,
    "chapterTitle": "Motion and Time",
    "topicsJson": "[\"Uniform vs Non-Uniform Motion\",\"Speed Calculation (Speed = Distance / Time)\",\"Simple Pendulum (Time Period & Oscillations)\",\"Distance-Time Graphs Interpretation\"]",
    "topics": [
      "Uniform vs Non-Uniform Motion",
      "Speed Calculation (Speed = Distance / Time)",
      "Simple Pendulum (Time Period & Oscillations)",
      "Distance-Time Graphs Interpretation"
    ],
    "learningObjectivesJson": "[\"Plot and interpret distance-time graphs for uniform velocity\"]",
    "learningObjectives": [
      "Plot and interpret distance-time graphs for uniform velocity"
    ]
  },
  {
    "id": "cat_c7_sci_ch10",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 10,
    "chapterTitle": "Electric Current and its Effects",
    "topicsJson": "[\"Circuit Symbols\",\"Heating Effect of Current (Joule's Heating, Electric Fuse)\",\"Magnetic Effect of Current (Electromagnet, Electric Bell)\"]",
    "topics": [
      "Circuit Symbols",
      "Heating Effect of Current (Joule's Heating, Electric Fuse)",
      "Magnetic Effect of Current (Electromagnet, Electric Bell)"
    ],
    "learningObjectivesJson": "[\"Construct functional electromagnets and explain fuse safety mechanisms\"]",
    "learningObjectives": [
      "Construct functional electromagnets and explain fuse safety mechanisms"
    ]
  },
  {
    "id": "cat_c7_sci_ch11",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 11,
    "chapterTitle": "Light",
    "topicsJson": "[\"Reflection of Light & Plane Mirror Image Properties\",\"Spherical Mirrors (Concave vs Convex)\",\"Lenses (Convex vs Concave)\",\"Dispersion of White Light (Newton's Disc & Prism Rainbow)\"]",
    "topics": [
      "Reflection of Light & Plane Mirror Image Properties",
      "Spherical Mirrors (Concave vs Convex)",
      "Lenses (Convex vs Concave)",
      "Dispersion of White Light (Newton's Disc & Prism Rainbow)"
    ],
    "learningObjectivesJson": "[\"Trace ray reflections from concave/convex mirrors and lenses\"]",
    "learningObjectives": [
      "Trace ray reflections from concave/convex mirrors and lenses"
    ]
  },
  {
    "id": "cat_c7_sci_ch12",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 12,
    "chapterTitle": "Forests: Our Lifeline",
    "topicsJson": "[\"Forest Canopy and Understorey Layers\",\"Food Webs and Decomposers\",\"Humus Formation and Soil Fertility\",\"Forests as Dynamic Living Entities\"]",
    "topics": [
      "Forest Canopy and Understorey Layers",
      "Food Webs and Decomposers",
      "Humus Formation and Soil Fertility",
      "Forests as Dynamic Living Entities"
    ],
    "learningObjectivesJson": "[\"Evaluate ecological stability maintained by forest strata\"]",
    "learningObjectives": [
      "Evaluate ecological stability maintained by forest strata"
    ]
  },
  {
    "id": "cat_c7_sci_ch13",
    "grade": "Class 7",
    "subject": "Science",
    "chapterNumber": 13,
    "chapterTitle": "Wastewater Story",
    "topicsJson": "[\"Sewage Composition\",\"Wastewater Treatment Plant (WWTP) Process Stages\",\"Better Housekeeping Practices\",\"Alternative Sanitation Systems\"]",
    "topics": [
      "Sewage Composition",
      "Wastewater Treatment Plant (WWTP) Process Stages",
      "Better Housekeeping Practices",
      "Alternative Sanitation Systems"
    ],
    "learningObjectivesJson": "[\"Sequence physical, biological, and chemical wastewater treatment steps\"]",
    "learningObjectives": [
      "Sequence physical, biological, and chemical wastewater treatment steps"
    ]
  },
  {
    "id": "cat_c7_soc_hist_ch1",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "History: Tracing Changes Through a Thousand Years",
    "topicsJson": "[\"Cartography Evolution\",\"New and Old Terminologies\",\"Historians and Their Sources\"]",
    "topics": [
      "Cartography Evolution",
      "New and Old Terminologies",
      "Historians and Their Sources"
    ],
    "learningObjectivesJson": "[\"Evaluate medieval historical sources and changing political terms\"]",
    "learningObjectives": [
      "Evaluate medieval historical sources and changing political terms"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch2",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "History: Kings and Kingdoms",
    "topicsJson": "[\"Emergence of New Dynasties (Gurjara-Pratiharas, Rashtrakutas, Palas)\",\"Prashastis & Land Grants\",\"The Cholas (Administration & Bronze Sculptures)\"]",
    "topics": [
      "Emergence of New Dynasties (Gurjara-Pratiharas, Rashtrakutas, Palas)",
      "Prashastis & Land Grants",
      "The Cholas (Administration & Bronze Sculptures)"
    ],
    "learningObjectivesJson": "[\"Analyze tripartite struggle and Chola agrarian administration\"]",
    "learningObjectives": [
      "Analyze tripartite struggle and Chola agrarian administration"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch3",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "History: Delhi: 12th to 15th Century",
    "topicsJson": "[\"Delhi Sultans (Mamluk, Khalji, Tughlaq)\",\"Garrison Towns to Empire Expansion\",\"Iqta System and Administration\"]",
    "topics": [
      "Delhi Sultans (Mamluk, Khalji, Tughlaq)",
      "Garrison Towns to Empire Expansion",
      "Iqta System and Administration"
    ],
    "learningObjectivesJson": "[\"Trace Delhi's evolution as administrative imperial capital\"]",
    "learningObjectives": [
      "Trace Delhi's evolution as administrative imperial capital"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch4",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "History: The Mughals (16th to 17th Century)",
    "topicsJson": "[\"Mughal Military Campaigns (Babur to Aurangzeb)\",\"Mansabdari and Jagirdari Systems\",\"Sulh-i Kul Policy of Akbar\"]",
    "topics": [
      "Mughal Military Campaigns (Babur to Aurangzeb)",
      "Mansabdari and Jagirdari Systems",
      "Sulh-i Kul Policy of Akbar"
    ],
    "learningObjectivesJson": "[\"Examine Mughal administrative mechanisms and religious policies\"]",
    "learningObjectives": [
      "Examine Mughal administrative mechanisms and religious policies"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch5",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "History: Tribes, Nomads and Settled Communities",
    "topicsJson": "[\"Tribal Societies (Gonds, Ahoms)\",\"Nomadic Pastoralists (Banjaras)\",\"State Formation in Tribal Belts\"]",
    "topics": [
      "Tribal Societies (Gonds, Ahoms)",
      "Nomadic Pastoralists (Banjaras)",
      "State Formation in Tribal Belts"
    ],
    "learningObjectivesJson": "[\"Explore social structures of nomadic communities and kingdoms\"]",
    "learningObjectives": [
      "Explore social structures of nomadic communities and kingdoms"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch6",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "History: Devotional Paths to the Divine",
    "topicsJson": "[\"Bhakti Saints (Nayanars, Alvars, Kabir, Mirabai)\",\"Sufi Orders and Khanqahs\",\"Guru Nanak and Sikhism Foundations\"]",
    "topics": [
      "Bhakti Saints (Nayanars, Alvars, Kabir, Mirabai)",
      "Sufi Orders and Khanqahs",
      "Guru Nanak and Sikhism Foundations"
    ],
    "learningObjectivesJson": "[\"Compare egalitarian tenets of Bhakti and Sufi movements\"]",
    "learningObjectives": [
      "Compare egalitarian tenets of Bhakti and Sufi movements"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch7",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "History: The Making of Regional Cultures",
    "topicsJson": "[\"Cheras and Malayalam Language\",\"Jagannatha Cult of Puri\",\"Kathak Dance Tradition\",\"Rajput Traditions of Heroism\"]",
    "topics": [
      "Cheras and Malayalam Language",
      "Jagannatha Cult of Puri",
      "Kathak Dance Tradition",
      "Rajput Traditions of Heroism"
    ],
    "learningObjectivesJson": "[\"Analyze synthesis of regional linguistic and artistic traditions\"]",
    "learningObjectives": [
      "Analyze synthesis of regional linguistic and artistic traditions"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_hist_ch8",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 8,
    "chapterTitle": "History: Eighteenth-Century Political Formations",
    "topicsJson": "[\"Crisis of Mughal Empire\",\"Emergence of Regional States (Awadh, Bengal, Hyderabad)\",\"Maratha Power under Peshwas\",\"Sikh Misls and Jats\"]",
    "topics": [
      "Crisis of Mughal Empire",
      "Emergence of Regional States (Awadh, Bengal, Hyderabad)",
      "Maratha Power under Peshwas",
      "Sikh Misls and Jats"
    ],
    "learningObjectivesJson": "[\"Evaluate political decentralization prior to British colonial hegemony\"]",
    "learningObjectives": [
      "Evaluate political decentralization prior to British colonial hegemony"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c7_soc_geo_ch1",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Geography: Environment",
    "topicsJson": "[\"Components of Environment (Natural, Human-Made, Human)\",\"Biotic vs Abiotic\",\"Ecosystem Dynamics\"]",
    "topics": [
      "Components of Environment (Natural, Human-Made, Human)",
      "Biotic vs Abiotic",
      "Ecosystem Dynamics"
    ],
    "learningObjectivesJson": "[\"Classify environmental spheres (Lithosphere, Hydrosphere, Atmosphere, Biosphere)\"]",
    "learningObjectives": [
      "Classify environmental spheres (Lithosphere, Hydrosphere, Atmosphere, Biosphere)"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_geo_ch2",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Geography: Inside Our Earth",
    "topicsJson": "[\"Earth Layers: Crust, Mantle, Core (Nife/Sial/Sima)\",\"Rocks and Minerals\",\"Rock Cycle (Igneous, Sedimentary, Metamorphic)\"]",
    "topics": [
      "Earth Layers: Crust, Mantle, Core (Nife/Sial/Sima)",
      "Rocks and Minerals",
      "Rock Cycle (Igneous, Sedimentary, Metamorphic)"
    ],
    "learningObjectivesJson": "[\"Trace petrological transformations in the rock cycle\"]",
    "learningObjectives": [
      "Trace petrological transformations in the rock cycle"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_geo_ch3",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Geography: Our Changing Earth",
    "topicsJson": "[\"Lithospheric Plates & Endogenic Forces\",\"Earthquakes & Volcanoes\",\"Exogenic Agents: Rivers (Waterfalls, Meanders, Ox-bow Lakes), Wind, Glaciers, Waves\"]",
    "topics": [
      "Lithospheric Plates & Endogenic Forces",
      "Earthquakes & Volcanoes",
      "Exogenic Agents: Rivers (Waterfalls, Meanders, Ox-bow Lakes), Wind, Glaciers, Waves"
    ],
    "learningObjectivesJson": "[\"Explain tectonic landform creation and fluvial/aeolian erosion\"]",
    "learningObjectives": [
      "Explain tectonic landform creation and fluvial/aeolian erosion"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_geo_ch4",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Geography: Air",
    "topicsJson": "[\"Atmospheric Composition (Nitrogen, Oxygen, CO2)\",\"Atmospheric Layers (Troposphere to Exosphere)\",\"Weather vs Climate\",\"Air Pressure, Wind Types, and Cyclones\"]",
    "topics": [
      "Atmospheric Composition (Nitrogen, Oxygen, CO2)",
      "Atmospheric Layers (Troposphere to Exosphere)",
      "Weather vs Climate",
      "Air Pressure, Wind Types, and Cyclones"
    ],
    "learningObjectivesJson": "[\"Analyze atmospheric temperature lapse rate and planetary winds\"]",
    "learningObjectives": [
      "Analyze atmospheric temperature lapse rate and planetary winds"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_geo_ch5",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Geography: Water",
    "topicsJson": "[\"Distribution of Water Bodies\",\"Ocean Circulation\",\"Waves, Tides (Spring and Neap), Ocean Currents (Warm Gulf Stream vs Cold Labrador)\"]",
    "topics": [
      "Distribution of Water Bodies",
      "Ocean Circulation",
      "Waves, Tides (Spring and Neap), Ocean Currents (Warm Gulf Stream vs Cold Labrador)"
    ],
    "learningObjectivesJson": "[\"Explain tidal gravitational mechanics and ocean current impacts on climate\"]",
    "learningObjectives": [
      "Explain tidal gravitational mechanics and ocean current impacts on climate"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_geo_ch6",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "Geography: Human-Environment Interactions – The Tropical and the Subtropical Region",
    "topicsJson": "[\"Life in Amazon Basin (Rainforests, Fauna)\",\"Life in Ganga-Brahmaputra Basin (Agriculture, Population Density)\"]",
    "topics": [
      "Life in Amazon Basin (Rainforests, Fauna)",
      "Life in Ganga-Brahmaputra Basin (Agriculture, Population Density)"
    ],
    "learningObjectivesJson": "[\"Compare equatorial rainforest habitats with subtropical river basins\"]",
    "learningObjectives": [
      "Compare equatorial rainforest habitats with subtropical river basins"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_geo_ch7",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "Geography: Life in the Deserts",
    "topicsJson": "[\"Hot Desert: Sahara (Climate, Flora, Fauna, Nomadic Life)\",\"Cold Desert: Ladakh (Geography, Glaciers, Monasteries, Pashmina Economy)\"]",
    "topics": [
      "Hot Desert: Sahara (Climate, Flora, Fauna, Nomadic Life)",
      "Cold Desert: Ladakh (Geography, Glaciers, Monasteries, Pashmina Economy)"
    ],
    "learningObjectivesJson": "[\"Contrast human adaptations in hot hyper-arid vs high-altitude cold deserts\"]",
    "learningObjectives": [
      "Contrast human adaptations in hot hyper-arid vs high-altitude cold deserts"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c7_soc_civ_ch1",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Civics: On Equality",
    "topicsJson": "[\"Universal Adult Franchise\",\"Constitutional Equality (Article 15)\",\"Mid-Day Meal Scheme Impacts\",\"Civil Rights Movement in USA (Rosa Parks)\"]",
    "topics": [
      "Universal Adult Franchise",
      "Constitutional Equality (Article 15)",
      "Mid-Day Meal Scheme Impacts",
      "Civil Rights Movement in USA (Rosa Parks)"
    ],
    "learningObjectivesJson": "[\"Evaluate constitutional guarantees of equality against social realities\"]",
    "learningObjectives": [
      "Evaluate constitutional guarantees of equality against social realities"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch2",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Civics: Role of the Government in Health",
    "topicsJson": "[\"Public vs Private Healthcare Services\",\"Costa Rican Healthcare Model\",\"Kerala Health Decentralization\"]",
    "topics": [
      "Public vs Private Healthcare Services",
      "Costa Rican Healthcare Model",
      "Kerala Health Decentralization"
    ],
    "learningObjectivesJson": "[\"Compare public health infrastructure accessibility and equitable funding\"]",
    "learningObjectives": [
      "Compare public health infrastructure accessibility and equitable funding"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch3",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Civics: How the State Government Works",
    "topicsJson": "[\"Legislative Assembly (Vidhan Sabha)\",\"Role of MLAs and Chief Minister\",\"Debates in the Legislative Assembly\",\"Government Press Conferences\"]",
    "topics": [
      "Legislative Assembly (Vidhan Sabha)",
      "Role of MLAs and Chief Minister",
      "Debates in the Legislative Assembly",
      "Government Press Conferences"
    ],
    "learningObjectivesJson": "[\"Trace state legislative policy formulation and executive accountability\"]",
    "learningObjectives": [
      "Trace state legislative policy formulation and executive accountability"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch4",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Civics: Growing up as Boys and Girls",
    "topicsJson": "[\"Gender Socialisation (Samoa 1920s Case Study vs India)\",\"Devaluing Domestic Household Work\",\"Invisible Labour of Women\"]",
    "topics": [
      "Gender Socialisation (Samoa 1920s Case Study vs India)",
      "Devaluing Domestic Household Work",
      "Invisible Labour of Women"
    ],
    "learningObjectivesJson": "[\"Deconstruct gender role stereotypes and unremunerated domestic labour\"]",
    "learningObjectives": [
      "Deconstruct gender role stereotypes and unremunerated domestic labour"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch5",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Civics: Women Change the World",
    "topicsJson": "[\"Women Pioneers (Rashsundari Devi, Rokeya Sakhawat Hossain)\",\"Literacy Struggles\",\"Women's Rights Campaigns\"]",
    "topics": [
      "Women Pioneers (Rashsundari Devi, Rokeya Sakhawat Hossain)",
      "Literacy Struggles",
      "Women's Rights Campaigns"
    ],
    "learningObjectivesJson": "[\"Celebrate female educational pioneers and legal reform struggles\"]",
    "learningObjectives": [
      "Celebrate female educational pioneers and legal reform struggles"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch6",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "Civics: Understanding Media",
    "topicsJson": "[\"Media and Technology\",\"Media and Big Business Monopolies\",\"Independent Media vs Censorship\",\"Setting the Public Agenda\"]",
    "topics": [
      "Media and Technology",
      "Media and Big Business Monopolies",
      "Independent Media vs Censorship",
      "Setting the Public Agenda"
    ],
    "learningObjectivesJson": "[\"Critically evaluate media bias, corporate advertising, and balanced reporting\"]",
    "learningObjectives": [
      "Critically evaluate media bias, corporate advertising, and balanced reporting"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch7",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "Civics: Markets Around Us",
    "topicsJson": "[\"Weekly Markets\",\"Neighborhood Shops\",\"Shopping Malls and E-Commerce\",\"Chain of Markets\"]",
    "topics": [
      "Weekly Markets",
      "Neighborhood Shops",
      "Shopping Malls and E-Commerce",
      "Chain of Markets"
    ],
    "learningObjectivesJson": "[\"Trace market intermediaries from producer wholesale to retail buyers\"]",
    "learningObjectives": [
      "Trace market intermediaries from producer wholesale to retail buyers"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_soc_civ_ch8",
    "grade": "Class 7",
    "subject": "Social Science",
    "chapterNumber": 8,
    "chapterTitle": "Civics: A Shirt in the Market",
    "topicsJson": "[\"Cotton Cultivation (Kurnool Farmer)\",\"Erode Weaver Cloth Market & Putting-Out System\",\"Garment Exporting Factory\",\"Unequal Profit Distribution\"]",
    "topics": [
      "Cotton Cultivation (Kurnool Farmer)",
      "Erode Weaver Cloth Market & Putting-Out System",
      "Garment Exporting Factory",
      "Unequal Profit Distribution"
    ],
    "learningObjectivesJson": "[\"Analyze supply chain exploitation from cotton farmer to global retail brand\"]",
    "learningObjectives": [
      "Analyze supply chain exploitation from cotton farmer to global retail brand"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c7_eng_ch1",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "Three Questions & The Squirrel",
    "topicsJson": "[\"Leo Tolstoy Parable\",\"Living in the Present Moment\",\"Nature Observation Poem\",\"Direct Objects\"]",
    "topics": [
      "Leo Tolstoy Parable",
      "Living in the Present Moment",
      "Nature Observation Poem",
      "Direct Objects"
    ],
    "learningObjectivesJson": "[\"Extract philosophical themes and identify direct objects\"]",
    "learningObjectives": [
      "Extract philosophical themes and identify direct objects"
    ]
  },
  {
    "id": "cat_c7_eng_ch2",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "A Gift of Chappals & The Rebel",
    "topicsJson": "[\"Compassion to Beggars\",\"Individuality in Poetry\",\"Compound Words\",\"Past Participles\"]",
    "topics": [
      "Compassion to Beggars",
      "Individuality in Poetry",
      "Compound Words",
      "Past Participles"
    ],
    "learningObjectivesJson": "[\"Analyze themes of childlike empathy and poetic satire\"]",
    "learningObjectives": [
      "Analyze themes of childlike empathy and poetic satire"
    ]
  },
  {
    "id": "cat_c7_eng_ch3",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Gopal and the Hilsa Fish & The Shed",
    "topicsJson": "[\"Comic Strip Dialogue\",\"Wits Overcoming Challenges\",\"Mystery Poetry\",\"Reported Speech Basics\"]",
    "topics": [
      "Comic Strip Dialogue",
      "Wits Overcoming Challenges",
      "Mystery Poetry",
      "Reported Speech Basics"
    ],
    "learningObjectivesJson": "[\"Convert comic dialogue into indirect reported speech\"]",
    "learningObjectives": [
      "Convert comic dialogue into indirect reported speech"
    ]
  },
  {
    "id": "cat_c7_eng_ch4",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "The Ashes That Made Trees Bloom & Chivvy",
    "topicsJson": "[\"Japanese Folklore\",\"Animal Gratitude & Retribution\",\"Adult Nagging Verse\",\"Prepositional Phrases\"]",
    "topics": [
      "Japanese Folklore",
      "Animal Gratitude & Retribution",
      "Adult Nagging Verse",
      "Prepositional Phrases"
    ],
    "learningObjectivesJson": "[\"Explore world folklore traditions and prepositional syntax\"]",
    "learningObjectives": [
      "Explore world folklore traditions and prepositional syntax"
    ]
  },
  {
    "id": "cat_c7_eng_ch5",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "Quality & Trees",
    "topicsJson": "[\"John Galsworthy Artisan Story\",\"Industrial Mass Production vs Handcrafted Art\",\"Tree Benefits Verse\"]",
    "topics": [
      "John Galsworthy Artisan Story",
      "Industrial Mass Production vs Handcrafted Art",
      "Tree Benefits Verse"
    ],
    "learningObjectivesJson": "[\"Evaluate economic displacement of traditional artisans\"]",
    "learningObjectives": [
      "Evaluate economic displacement of traditional artisans"
    ]
  },
  {
    "id": "cat_c7_eng_ch6",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Expert Detectives & Mystery of the Talking Fan",
    "topicsJson": "[\"Sibling Sleuths\",\"Personification in Poetry\",\"Analytical Reading\",\"Adjective Clauses\"]",
    "topics": [
      "Sibling Sleuths",
      "Personification in Poetry",
      "Analytical Reading",
      "Adjective Clauses"
    ],
    "learningObjectivesJson": "[\"Analyze narrative suspense and literary personification\"]",
    "learningObjectives": [
      "Analyze narrative suspense and literary personification"
    ]
  },
  {
    "id": "cat_c7_eng_ch7",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "The Invention of Vita-Wonk & Dad and the Cat and the Tree & Garden Snake",
    "topicsJson": "[\"Roald Dahl Science Fantasy\",\"Comic Family Poetry\",\"Harmless Reptiles\",\"Prefixes\"]",
    "topics": [
      "Roald Dahl Science Fantasy",
      "Comic Family Poetry",
      "Harmless Reptiles",
      "Prefixes"
    ],
    "learningObjectivesJson": "[\"Appreciate whimsical fantasy literature and biological misconceptions\"]",
    "learningObjectives": [
      "Appreciate whimsical fantasy literature and biological misconceptions"
    ]
  },
  {
    "id": "cat_c7_eng_ch8",
    "grade": "Class 7",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "A Homage to Our Brave Soldiers & Meadow Surprises",
    "topicsJson": "[\"National War Memorial Tribute\",\"Nature's Subtle Wonders\",\"Reflective Writing\"]",
    "topics": [
      "National War Memorial Tribute",
      "Nature's Subtle Wonders",
      "Reflective Writing"
    ],
    "learningObjectivesJson": "[\"Express patriotic respect and observe delicate ecological niches\"]",
    "learningObjectives": [
      "Express patriotic respect and observe delicate ecological niches"
    ]
  },
  {
    "id": "cat_c8_math_ch1",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Rational Numbers",
    "topicsJson": "[\"Closure, Commutativity, Associativity of Rational Numbers\",\"Distributivity of Multiplication over Addition\",\"Additive & Multiplicative Inverses\"]",
    "topics": [
      "Closure, Commutativity, Associativity of Rational Numbers",
      "Distributivity of Multiplication over Addition",
      "Additive & Multiplicative Inverses"
    ],
    "learningObjectivesJson": "[\"Apply structural algebraic field properties to rational numbers\"]",
    "learningObjectives": [
      "Apply structural algebraic field properties to rational numbers"
    ]
  },
  {
    "id": "cat_c8_math_ch2",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Linear Equations in One Variable",
    "topicsJson": "[\"Solving Equations with Variables on Both Sides\",\"Reducing Equations to Simpler Form\",\"Word Problems on Age, Digits, Perimeter\"]",
    "topics": [
      "Solving Equations with Variables on Both Sides",
      "Reducing Equations to Simpler Form",
      "Word Problems on Age, Digits, Perimeter"
    ],
    "learningObjectivesJson": "[\"Formulate and solve multi-step single-variable algebraic equations\"]",
    "learningObjectives": [
      "Formulate and solve multi-step single-variable algebraic equations"
    ]
  },
  {
    "id": "cat_c8_math_ch3",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Understanding Quadrilaterals",
    "topicsJson": "[\"Polygon Classification (Convex, Concave, Regular)\",\"Angle Sum Property of Polygons ((n-2) x 180°)\",\"Exterior Angle Sum (360°)\",\"Properties of Parallelogram, Rhombus, Rectangle, Square, Kite\"]",
    "topics": [
      "Polygon Classification (Convex, Concave, Regular)",
      "Angle Sum Property of Polygons ((n-2) x 180°)",
      "Exterior Angle Sum (360°)",
      "Properties of Parallelogram, Rhombus, Rectangle, Square, Kite"
    ],
    "learningObjectivesJson": "[\"Prove quadrilateral geometric theorems and compute polygon angles\"]",
    "learningObjectives": [
      "Prove quadrilateral geometric theorems and compute polygon angles"
    ]
  },
  {
    "id": "cat_c8_math_ch4",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Data Handling",
    "topicsJson": "[\"Grouped Frequency Distributions\",\"Histograms with Equal Width\",\"Pie Charts (Circle Graphs)\",\"Probability Concepts and Outcomes\"]",
    "topics": [
      "Grouped Frequency Distributions",
      "Histograms with Equal Width",
      "Pie Charts (Circle Graphs)",
      "Probability Concepts and Outcomes"
    ],
    "learningObjectivesJson": "[\"Construct pie charts from percentage data and calculate event probabilities\"]",
    "learningObjectives": [
      "Construct pie charts from percentage data and calculate event probabilities"
    ]
  },
  {
    "id": "cat_c8_math_ch5",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Square and Square Roots",
    "topicsJson": "[\"Properties of Square Numbers\",\"Pythagorean Triplets\",\"Square Root by Prime Factorisation\",\"Square Root by Long Division Method\"]",
    "topics": [
      "Properties of Square Numbers",
      "Pythagorean Triplets",
      "Square Root by Prime Factorisation",
      "Square Root by Long Division Method"
    ],
    "learningObjectivesJson": "[\"Compute square roots of large integers and decimals using long division\"]",
    "learningObjectives": [
      "Compute square roots of large integers and decimals using long division"
    ]
  },
  {
    "id": "cat_c8_math_ch6",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Cube and Cube Roots",
    "topicsJson": "[\"Properties of Cube Numbers\",\"Prime Factorisation Method for Cube Roots\",\"Cube Root of Negative Numbers\"]",
    "topics": [
      "Properties of Cube Numbers",
      "Prime Factorisation Method for Cube Roots",
      "Cube Root of Negative Numbers"
    ],
    "learningObjectivesJson": "[\"Determine cube roots via prime triplet factorization\"]",
    "learningObjectives": [
      "Determine cube roots via prime triplet factorization"
    ]
  },
  {
    "id": "cat_c8_math_ch7",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Comparing Quantities",
    "topicsJson": "[\"Discount and Marked Price\",\"Goods and Services Tax (GST)\",\"Compound Interest Formula: A = P(1 + r/100)^n\",\"Compounded Annually vs Semi-Annually\"]",
    "topics": [
      "Discount and Marked Price",
      "Goods and Services Tax (GST)",
      "Compound Interest Formula: A = P(1 + r/100)^n",
      "Compounded Annually vs Semi-Annually"
    ],
    "learningObjectivesJson": "[\"Calculate compound interest growth and post-tax invoice prices\"]",
    "learningObjectives": [
      "Calculate compound interest growth and post-tax invoice prices"
    ]
  },
  {
    "id": "cat_c8_math_ch8",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Algebraic Expressions and Identities",
    "topicsJson": "[\"Multiplication of Monomial by Polynomial\",\"Standard Identities: (a+b)^2, (a-b)^2, a^2-b^2, (x+a)(x+b)\",\"Applying Identities in Mental Calculations\"]",
    "topics": [
      "Multiplication of Monomial by Polynomial",
      "Standard Identities: (a+b)^2, (a-b)^2, a^2-b^2, (x+a)(x+b)",
      "Applying Identities in Mental Calculations"
    ],
    "learningObjectivesJson": "[\"Expand and evaluate binomial products using algebraic identities\"]",
    "learningObjectives": [
      "Expand and evaluate binomial products using algebraic identities"
    ]
  },
  {
    "id": "cat_c8_math_ch9",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Mensuration",
    "topicsJson": "[\"Area of Trapezium: 1/2(a+b)h\",\"Area of Rhombus: 1/2(d1 x d2)\",\"Area of General Quadrilaterals\",\"Surface Area and Volume of Cubes, Cuboids, Cylinders\"]",
    "topics": [
      "Area of Trapezium: 1/2(a+b)h",
      "Area of Rhombus: 1/2(d1 x d2)",
      "Area of General Quadrilaterals",
      "Surface Area and Volume of Cubes, Cuboids, Cylinders"
    ],
    "learningObjectivesJson": "[\"Calculate lateral surface areas and volume capacities of cylinders and prisms\"]",
    "learningObjectives": [
      "Calculate lateral surface areas and volume capacities of cylinders and prisms"
    ]
  },
  {
    "id": "cat_c8_math_ch10",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Exponents and Powers",
    "topicsJson": "[\"Negative Integral Exponents (a^-m = 1/a^m)\",\"Laws of Exponents with Integral Powers\",\"Expressing Small Numbers in Scientific Standard Form\"]",
    "topics": [
      "Negative Integral Exponents (a^-m = 1/a^m)",
      "Laws of Exponents with Integral Powers",
      "Expressing Small Numbers in Scientific Standard Form"
    ],
    "learningObjectivesJson": "[\"Manipulate microscopic magnitudes in scientific exponential notation\"]",
    "learningObjectives": [
      "Manipulate microscopic magnitudes in scientific exponential notation"
    ]
  },
  {
    "id": "cat_c8_math_ch11",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Direct and Inverse Proportions",
    "topicsJson": "[\"Direct Proportion (x/y = k)\",\"Inverse Proportion (x x y = k)\",\"Work, Time, Speed, and Unit Cost Word Problems\"]",
    "topics": [
      "Direct Proportion (x/y = k)",
      "Inverse Proportion (x x y = k)",
      "Work, Time, Speed, and Unit Cost Word Problems"
    ],
    "learningObjectivesJson": "[\"Distinguish directly and inversely varying quantities in contextual models\"]",
    "learningObjectives": [
      "Distinguish directly and inversely varying quantities in contextual models"
    ]
  },
  {
    "id": "cat_c8_math_ch12",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "Factorisation",
    "topicsJson": "[\"Method of Common Factors\",\"Factorisation by Regrouping Terms\",\"Factorisation Using Identities\",\"Splitting the Middle Term in Quadratics\",\"Division of Polynomial by Polynomial\"]",
    "topics": [
      "Method of Common Factors",
      "Factorisation by Regrouping Terms",
      "Factorisation Using Identities",
      "Splitting the Middle Term in Quadratics",
      "Division of Polynomial by Polynomial"
    ],
    "learningObjectivesJson": "[\"Factorize quadratic trinomials and execute polynomial long division\"]",
    "learningObjectives": [
      "Factorize quadratic trinomials and execute polynomial long division"
    ]
  },
  {
    "id": "cat_c8_math_ch13",
    "grade": "Class 8",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "Introduction to Graphs",
    "topicsJson": "[\"Line Graphs & Linear Graphs\",\"Cartesian Coordinate Plane (x-axis, y-axis, Origin)\",\"Plotting Points (x, y)\",\"Dependent vs Independent Variables in Real-Life Graphs\"]",
    "topics": [
      "Line Graphs & Linear Graphs",
      "Cartesian Coordinate Plane (x-axis, y-axis, Origin)",
      "Plotting Points (x, y)",
      "Dependent vs Independent Variables in Real-Life Graphs"
    ],
    "learningObjectivesJson": "[\"Plot coordinates accurately and interpret real-world linear trends\"]",
    "learningObjectives": [
      "Plot coordinates accurately and interpret real-world linear trends"
    ]
  },
  {
    "id": "cat_c8_sci_ch1",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 1,
    "chapterTitle": "Crop Production and Management",
    "topicsJson": "[\"Agricultural Practices: Soil Preparation, Sowing, Manures vs Fertilizers\",\"Modern Irrigation (Drip and Sprinkler Systems)\",\"Weeding, Harvesting, Storage, Animal Husbandry\"]",
    "topics": [
      "Agricultural Practices: Soil Preparation, Sowing, Manures vs Fertilizers",
      "Modern Irrigation (Drip and Sprinkler Systems)",
      "Weeding, Harvesting, Storage, Animal Husbandry"
    ],
    "learningObjectivesJson": "[\"Sequence agronomic practices and contrast drip irrigation efficiency with surface flooding\"]",
    "learningObjectives": [
      "Sequence agronomic practices and contrast drip irrigation efficiency with surface flooding"
    ]
  },
  {
    "id": "cat_c8_sci_ch2",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 2,
    "chapterTitle": "Microorganisms: Friend and Foe",
    "topicsJson": "[\"Classification: Bacteria, Fungi, Protozoa, Algae, Viruses\",\"Fermentation & Commercial Uses\",\"Vaccines and Antibiotics\",\"Pathogens & Communicable Diseases\",\"Nitrogen Cycle & Fixation (Rhizobium)\"]",
    "topics": [
      "Classification: Bacteria, Fungi, Protozoa, Algae, Viruses",
      "Fermentation & Commercial Uses",
      "Vaccines and Antibiotics",
      "Pathogens & Communicable Diseases",
      "Nitrogen Cycle & Fixation (Rhizobium)"
    ],
    "learningObjectivesJson": "[\"Explain vaccine antibody synthesis and trace biological nitrogen fixation\"]",
    "learningObjectives": [
      "Explain vaccine antibody synthesis and trace biological nitrogen fixation"
    ]
  },
  {
    "id": "cat_c8_sci_ch3",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 3,
    "chapterTitle": "Coal and Petroleum",
    "topicsJson": "[\"Inexhaustible vs Exhaustible Resources\",\"Coal Formation (Carbonisation) & Products (Coke, Coal Tar, Coal Gas)\",\"Petroleum Refining & Fractional Distillation\",\"Natural Gas (CNG) & Conservation\"]",
    "topics": [
      "Inexhaustible vs Exhaustible Resources",
      "Coal Formation (Carbonisation) & Products (Coke, Coal Tar, Coal Gas)",
      "Petroleum Refining & Fractional Distillation",
      "Natural Gas (CNG) & Conservation"
    ],
    "learningObjectivesJson": "[\"Trace fractional distillation outputs of crude petroleum\"]",
    "learningObjectives": [
      "Trace fractional distillation outputs of crude petroleum"
    ]
  },
  {
    "id": "cat_c8_sci_ch4",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 4,
    "chapterTitle": "Combustion and Flame",
    "topicsJson": "[\"Combustion Conditions (Fuel, Air, Ignition Temperature)\",\"Fire Extinguishers (CO2, Foam)\",\"Types of Combustion (Rapid, Spontaneous, Explosion)\",\"Structure of Flame (Zones)\",\"Calorific Value & Acid Rain\"]",
    "topics": [
      "Combustion Conditions (Fuel, Air, Ignition Temperature)",
      "Fire Extinguishers (CO2, Foam)",
      "Types of Combustion (Rapid, Spontaneous, Explosion)",
      "Structure of Flame (Zones)",
      "Calorific Value & Acid Rain"
    ],
    "learningObjectivesJson": "[\"Analyze flame zones by temperature and calculate fuel calorific efficiency\"]",
    "learningObjectives": [
      "Analyze flame zones by temperature and calculate fuel calorific efficiency"
    ]
  },
  {
    "id": "cat_c8_sci_ch5",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 5,
    "chapterTitle": "Conservation of Plants and Animals",
    "topicsJson": "[\"Deforestation Causes and Consequences\",\"Biosphere Reserves, National Parks, Wildlife Sanctuaries\",\"Red Data Book & Endangered Species\",\"Reforestation\"]",
    "topics": [
      "Deforestation Causes and Consequences",
      "Biosphere Reserves, National Parks, Wildlife Sanctuaries",
      "Red Data Book & Endangered Species",
      "Reforestation"
    ],
    "learningObjectivesJson": "[\"Distinguish in-situ protected conservation zones and biodiversity registers\"]",
    "learningObjectives": [
      "Distinguish in-situ protected conservation zones and biodiversity registers"
    ]
  },
  {
    "id": "cat_c8_sci_ch6",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 6,
    "chapterTitle": "Reproduction in Animals",
    "topicsJson": "[\"Sexual Reproduction (Male & Female Systems)\",\"Fertilisation (Internal vs External, In Vitro IVF)\",\"Development of Embryo\",\"Metamorphosis in Frogs\",\"Asexual Reproduction: Binary Fission (Amoeba), Budding (Hydra), Cloning (Dolly)\"]",
    "topics": [
      "Sexual Reproduction (Male & Female Systems)",
      "Fertilisation (Internal vs External, In Vitro IVF)",
      "Development of Embryo",
      "Metamorphosis in Frogs",
      "Asexual Reproduction: Binary Fission (Amoeba), Budding (Hydra), Cloning (Dolly)"
    ],
    "learningObjectivesJson": "[\"Compare viviparous embryo development and asexual binary fission\"]",
    "learningObjectives": [
      "Compare viviparous embryo development and asexual binary fission"
    ]
  },
  {
    "id": "cat_c8_sci_ch7",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 7,
    "chapterTitle": "Reaching the Age of Adolescence",
    "topicsJson": "[\"Puberty Changes\",\"Endocrine Glands & Hormones (Pituitary, Thyroid, Pancreas, Adrenals, Testes, Ovaries)\",\"Secondary Sexual Characteristics\",\"Sex Determination in Humans (XX vs XY)\",\"Nutritional Needs\"]",
    "topics": [
      "Puberty Changes",
      "Endocrine Glands & Hormones (Pituitary, Thyroid, Pancreas, Adrenals, Testes, Ovaries)",
      "Secondary Sexual Characteristics",
      "Sex Determination in Humans (XX vs XY)",
      "Nutritional Needs"
    ],
    "learningObjectivesJson": "[\"Explain genetic sex determination via chromosome pairing and endocrine regulation\"]",
    "learningObjectives": [
      "Explain genetic sex determination via chromosome pairing and endocrine regulation"
    ]
  },
  {
    "id": "cat_c8_sci_ch8",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 8,
    "chapterTitle": "Force and Pressure",
    "topicsJson": "[\"Contact Forces (Muscular, Friction)\",\"Non-Contact Forces (Magnetic, Electrostatic, Gravitational)\",\"Pressure Formula: P = F / A\",\"Liquid Pressure & Manometers\",\"Atmospheric Pressure\"]",
    "topics": [
      "Contact Forces (Muscular, Friction)",
      "Non-Contact Forces (Magnetic, Electrostatic, Gravitational)",
      "Pressure Formula: P = F / A",
      "Liquid Pressure & Manometers",
      "Atmospheric Pressure"
    ],
    "learningObjectivesJson": "[\"Calculate pressure in Pascals and demonstrate atmospheric pressure effects\"]",
    "learningObjectives": [
      "Calculate pressure in Pascals and demonstrate atmospheric pressure effects"
    ]
  },
  {
    "id": "cat_c8_sci_ch9",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 9,
    "chapterTitle": "Friction",
    "topicsJson": "[\"Factors Affecting Friction (Surface Roughness)\",\"Static, Sliding, and Rolling Friction (Order of Magnitude)\",\"Friction as a Necessary Evil\",\"Increasing and Reducing Friction (Ball Bearings, Lubricants)\",\"Fluid Friction & Streamlining\"]",
    "topics": [
      "Factors Affecting Friction (Surface Roughness)",
      "Static, Sliding, and Rolling Friction (Order of Magnitude)",
      "Friction as a Necessary Evil",
      "Increasing and Reducing Friction (Ball Bearings, Lubricants)",
      "Fluid Friction & Streamlining"
    ],
    "learningObjectivesJson": "[\"Rank static, sliding, and rolling friction and explain aerodynamic streamlining\"]",
    "learningObjectives": [
      "Rank static, sliding, and rolling friction and explain aerodynamic streamlining"
    ]
  },
  {
    "id": "cat_c8_sci_ch10",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 10,
    "chapterTitle": "Sound",
    "topicsJson": "[\"Sound Produced by Vibrating Bodies\",\"Propagation Medium (Solid, Liquid, Gas; Vacuum Exclusion)\",\"Human Larynx & Ear Anatomy (Eardrum, Cochlea)\",\"Amplitude, Frequency, Time Period, Pitch, Loudness\",\"Audible Range (20 Hz - 20,000 Hz) & Noise Pollution\"]",
    "topics": [
      "Sound Produced by Vibrating Bodies",
      "Propagation Medium (Solid, Liquid, Gas; Vacuum Exclusion)",
      "Human Larynx & Ear Anatomy (Eardrum, Cochlea)",
      "Amplitude, Frequency, Time Period, Pitch, Loudness",
      "Audible Range (20 Hz - 20,000 Hz) & Noise Pollution"
    ],
    "learningObjectivesJson": "[\"Relate frequency to pitch, amplitude to loudness, and identify hearing limits\"]",
    "learningObjectives": [
      "Relate frequency to pitch, amplitude to loudness, and identify hearing limits"
    ]
  },
  {
    "id": "cat_c8_sci_ch11",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 11,
    "chapterTitle": "Chemical Effects of Electric Current",
    "topicsJson": "[\"Conductivity of Liquids (Electrolytes)\",\"Chemical Dissociation during Electrolysis\",\"Electroplating Principles and Industrial Applications\",\"LEDs in Weak Circuits\"]",
    "topics": [
      "Conductivity of Liquids (Electrolytes)",
      "Chemical Dissociation during Electrolysis",
      "Electroplating Principles and Industrial Applications",
      "LEDs in Weak Circuits"
    ],
    "learningObjectivesJson": "[\"Explain copper sulphate electrolysis and execute electroplating setups\"]",
    "learningObjectives": [
      "Explain copper sulphate electrolysis and execute electroplating setups"
    ]
  },
  {
    "id": "cat_c8_sci_ch12",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 12,
    "chapterTitle": "Some Natural Phenomena",
    "topicsJson": "[\"Electrostatic Charging by Friction\",\"Types of Charges & Interactions\",\"Electroscope Operation\",\"Lightning Safety & Lightning Conductors\",\"Earthquakes (Seismic Faults, Richter Scale, Seismograph, Protection)\"]",
    "topics": [
      "Electrostatic Charging by Friction",
      "Types of Charges & Interactions",
      "Electroscope Operation",
      "Lightning Safety & Lightning Conductors",
      "Earthquakes (Seismic Faults, Richter Scale, Seismograph, Protection)"
    ],
    "learningObjectivesJson": "[\"Demonstrate charge transfer and explain seismic wave recording\"]",
    "learningObjectives": [
      "Demonstrate charge transfer and explain seismic wave recording"
    ]
  },
  {
    "id": "cat_c8_sci_ch13",
    "grade": "Class 8",
    "subject": "Science",
    "chapterNumber": 13,
    "chapterTitle": "Light",
    "topicsJson": "[\"Laws of Reflection (i = r, Normal in same plane)\",\"Regular vs Diffused Reflection\",\"Multiple Images & Kaleidoscope Formula: (360/theta - 1)\",\"Dispersion in Sunlight\",\"Human Eye Anatomy (Cornea, Iris, Pupil, Lens, Retina, Blind Spot, Rods & Cones)\",\"Eye Care & Braille System\"]",
    "topics": [
      "Laws of Reflection (i = r, Normal in same plane)",
      "Regular vs Diffused Reflection",
      "Multiple Images & Kaleidoscope Formula: (360/theta - 1)",
      "Dispersion in Sunlight",
      "Human Eye Anatomy (Cornea, Iris, Pupil, Lens, Retina, Blind Spot, Rods & Cones)",
      "Eye Care & Braille System"
    ],
    "learningObjectivesJson": "[\"Draw ray diagrams for mirror reflections and explain photoreceptor function\"]",
    "learningObjectives": [
      "Draw ray diagrams for mirror reflections and explain photoreceptor function"
    ]
  },
  {
    "id": "cat_c8_soc_hist_ch1",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "History: How, When and Where",
    "topicsJson": "[\"Periodisation in Indian History (James Mill's Bias)\",\"Colonial Records and Archives\",\"Limitations of Official Sources\"]",
    "topics": [
      "Periodisation in Indian History (James Mill's Bias)",
      "Colonial Records and Archives",
      "Limitations of Official Sources"
    ],
    "learningObjectivesJson": "[\"Critically evaluate colonial periodisation and official document bias\"]",
    "learningObjectives": [
      "Critically evaluate colonial periodisation and official document bias"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch2",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "History: From Trade to Territory: The Company Establishes Power",
    "topicsJson": "[\"East India Company Mercantile Trade\",\"Battle of Plassey (1757) and Buxar (1764)\",\"Subsidiary Alliance & Doctrine of Lapse\",\"Setting up New Administration\"]",
    "topics": [
      "East India Company Mercantile Trade",
      "Battle of Plassey (1757) and Buxar (1764)",
      "Subsidiary Alliance & Doctrine of Lapse",
      "Setting up New Administration"
    ],
    "learningObjectivesJson": "[\"Trace British transition from trading firm to territorial sovereign\"]",
    "learningObjectives": [
      "Trace British transition from trading firm to territorial sovereign"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch3",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "History: Ruling the Countryside",
    "topicsJson": "[\"Diwani Rights of Bengal (1765)\",\"Permanent Settlement, Mahalwari, Ryotwari Systems\",\"Indigo Cultivation and the Blue Rebellion (1859)\"]",
    "topics": [
      "Diwani Rights of Bengal (1765)",
      "Permanent Settlement, Mahalwari, Ryotwari Systems",
      "Indigo Cultivation and the Blue Rebellion (1859)"
    ],
    "learningObjectivesJson": "[\"Assess agrarian revenue extraction systems and peasant resistance\"]",
    "learningObjectives": [
      "Assess agrarian revenue extraction systems and peasant resistance"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch4",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "History: Tribals, Dikus and the Vision of a Golden Age",
    "topicsJson": "[\"Tribal Livelihoods (Jhum Cultivators, Hunters, Pastoralists)\",\"Colonial Forest Laws and Impacts\",\"Birsa Munda Ulgulan Movement\"]",
    "topics": [
      "Tribal Livelihoods (Jhum Cultivators, Hunters, Pastoralists)",
      "Colonial Forest Laws and Impacts",
      "Birsa Munda Ulgulan Movement"
    ],
    "learningObjectivesJson": "[\"Analyze colonial forest exploitation and Munda tribal uprisings\"]",
    "learningObjectives": [
      "Analyze colonial forest exploitation and Munda tribal uprisings"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch5",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "History: When People Rebel: 1857 and After",
    "topicsJson": "[\"Causes of 1857 Uprising (Sepoy Grievances, Annexation of Awadh)\",\"Spread of Rebellion (Meerut to Delhi)\",\"Company Counter-Offensive\",\"Aftermath and Government of India Act 1858\"]",
    "topics": [
      "Causes of 1857 Uprising (Sepoy Grievances, Annexation of Awadh)",
      "Spread of Rebellion (Meerut to Delhi)",
      "Company Counter-Offensive",
      "Aftermath and Government of India Act 1858"
    ],
    "learningObjectivesJson": "[\"Evaluate military, religious, and economic catalysts of the 1857 war\"]",
    "learningObjectives": [
      "Evaluate military, religious, and economic catalysts of the 1857 war"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch6",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "History: Civilising the “Native”, Educating the Nation",
    "topicsJson": "[\"Orientalists vs Anglicists (Macaulay's Minute 1835)\",\"Wood's Despatch (1854)\",\"William Adam's Vernacular School Report\",\"Rabindranath Tagore's Shantiniketan and Mahatma Gandhi's Nai Talim\"]",
    "topics": [
      "Orientalists vs Anglicists (Macaulay's Minute 1835)",
      "Wood's Despatch (1854)",
      "William Adam's Vernacular School Report",
      "Rabindranath Tagore's Shantiniketan and Mahatma Gandhi's Nai Talim"
    ],
    "learningObjectivesJson": "[\"Contrast colonial English education with indigenous pedagogy\"]",
    "learningObjectives": [
      "Contrast colonial English education with indigenous pedagogy"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch7",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "History: Women, Caste and Reform",
    "topicsJson": "[\"Abolition of Sati (Raja Rammohan Roy, 1829)\",\"Widow Remarriage Act (Ishwar Chandra Vidyasagar, 1856)\",\"Girl's Education (Jyotirao Phule, Savitribai Phule, Begum Rokeya)\",\"Caste Reform Movements (Ghasidas, Periyar, B.R. Ambedkar Temple Entry)\"]",
    "topics": [
      "Abolition of Sati (Raja Rammohan Roy, 1829)",
      "Widow Remarriage Act (Ishwar Chandra Vidyasagar, 1856)",
      "Girl's Education (Jyotirao Phule, Savitribai Phule, Begum Rokeya)",
      "Caste Reform Movements (Ghasidas, Periyar, B.R. Ambedkar Temple Entry)"
    ],
    "learningObjectivesJson": "[\"Analyze social reform struggles against patriarchy and caste oppression\"]",
    "learningObjectives": [
      "Analyze social reform struggles against patriarchy and caste oppression"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_hist_ch8",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 8,
    "chapterTitle": "History: The Making of the National Movement: 1870s–1947",
    "topicsJson": "[\"Formation of Indian National Congress (1885)\",\"Moderates vs Radicals (Swaraj is my birthright)\",\"Partition of Bengal (1905) & Swadeshi Movement\",\"Advent of Mahatma Gandhi (Champaran, Non-Cooperation, Civil Disobedience)\",\"Quit India Movement (1942) and Independence\"]",
    "topics": [
      "Formation of Indian National Congress (1885)",
      "Moderates vs Radicals (Swaraj is my birthright)",
      "Partition of Bengal (1905) & Swadeshi Movement",
      "Advent of Mahatma Gandhi (Champaran, Non-Cooperation, Civil Disobedience)",
      "Quit India Movement (1942) and Independence"
    ],
    "learningObjectivesJson": "[\"Trace phases of mass mobilization leading to Indian independence\"]",
    "learningObjectives": [
      "Trace phases of mass mobilization leading to Indian independence"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c8_soc_geo_ch1",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Geography: Resources",
    "topicsJson": "[\"Types of Resources: Natural, Human-Made, Human\",\"Renewable vs Non-Renewable\",\"Sustainable Development Principles\",\"Conservation of Resources\"]",
    "topics": [
      "Types of Resources: Natural, Human-Made, Human",
      "Renewable vs Non-Renewable",
      "Sustainable Development Principles",
      "Conservation of Resources"
    ],
    "learningObjectivesJson": "[\"Classify resources by origin, exhaustibility, and practice conservation\"]",
    "learningObjectives": [
      "Classify resources by origin, exhaustibility, and practice conservation"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c8_soc_geo_ch2",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Geography: Land, Soil, Water, Natural Vegetation and Wildlife Resources",
    "topicsJson": "[\"Land Use Patterns & Landslides\",\"Soil Formation Factors, Soil Profile, Soil Erosion & Conservation (Contour Ploughing, Terrace Farming, Shelterbelts)\",\"Water Scarcity & Rainwater Harvesting\",\"CITES and Wildlife Protection\"]",
    "topics": [
      "Land Use Patterns & Landslides",
      "Soil Formation Factors, Soil Profile, Soil Erosion & Conservation (Contour Ploughing, Terrace Farming, Shelterbelts)",
      "Water Scarcity & Rainwater Harvesting",
      "CITES and Wildlife Protection"
    ],
    "learningObjectivesJson": "[\"Design soil conservation plans and explain CITES biodiversity treaty\"]",
    "learningObjectives": [
      "Design soil conservation plans and explain CITES biodiversity treaty"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c8_soc_geo_ch3",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Geography: Agriculture",
    "topicsJson": "[\"Farming Types: Subsistence vs Commercial (Intensive, Plantation)\",\"Major Crops (Rice, Wheat, Millets, Cotton, Jute, Tea, Coffee)\",\"Agricultural Development: India vs USA Comparative Farm Case Study\"]",
    "topics": [
      "Farming Types: Subsistence vs Commercial (Intensive, Plantation)",
      "Major Crops (Rice, Wheat, Millets, Cotton, Jute, Tea, Coffee)",
      "Agricultural Development: India vs USA Comparative Farm Case Study"
    ],
    "learningObjectivesJson": "[\"Compare small-scale intensive farming with mechanized commercial agriculture\"]",
    "learningObjectives": [
      "Compare small-scale intensive farming with mechanized commercial agriculture"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c8_soc_geo_ch4",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Geography: Industries",
    "topicsJson": "[\"Classification of Industries (Raw Material, Size, Ownership)\",\"Factors Influencing Industrial Location\",\"Industrial Systems & Disasters (Bhopal Gas Tragedy)\",\"Major Industrial Clusters: Iron and Steel (Jamshedpur vs Pittsburgh), Information Technology (Bengaluru vs Silicon Valley)\"]",
    "topics": [
      "Classification of Industries (Raw Material, Size, Ownership)",
      "Factors Influencing Industrial Location",
      "Industrial Systems & Disasters (Bhopal Gas Tragedy)",
      "Major Industrial Clusters: Iron and Steel (Jamshedpur vs Pittsburgh), Information Technology (Bengaluru vs Silicon Valley)"
    ],
    "learningObjectivesJson": "[\"Analyze industrial location factors and compare global manufacturing hubs\"]",
    "learningObjectives": [
      "Analyze industrial location factors and compare global manufacturing hubs"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c8_soc_geo_ch5",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Geography: Human Resources",
    "topicsJson": "[\"Population Distribution and Density\",\"Factors Affecting Population Distribution (Geographical, Socioeconomic)\",\"Population Change (Birth Rate, Death Rate, Migration)\",\"Population Composition & Age-Sex Pyramids (Kenya, India, Japan)\"]",
    "topics": [
      "Population Distribution and Density",
      "Factors Affecting Population Distribution (Geographical, Socioeconomic)",
      "Population Change (Birth Rate, Death Rate, Migration)",
      "Population Composition & Age-Sex Pyramids (Kenya, India, Japan)"
    ],
    "learningObjectivesJson": "[\"Interpret demographic age-sex pyramids to forecast labor resources\"]",
    "learningObjectives": [
      "Interpret demographic age-sex pyramids to forecast labor resources"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c8_soc_civ_ch1",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Civics: The Indian Constitution",
    "topicsJson": "[\"Why a Country Needs a Constitution\",\"Key Features: Federalism, Separation of Powers, Parliamentary Governance, Fundamental Rights, Secularism\"]",
    "topics": [
      "Why a Country Needs a Constitution",
      "Key Features: Federalism, Separation of Powers, Parliamentary Governance, Fundamental Rights, Secularism"
    ],
    "learningObjectivesJson": "[\"Explain constitutional core features and protections against executive tyranny\"]",
    "learningObjectives": [
      "Explain constitutional core features and protections against executive tyranny"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch2",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Civics: Understanding Secularism",
    "topicsJson": "[\"Definition of Secularism\",\"Separation of Religion from State\",\"Indian Secularism vs American Secularism (Principled Distance)\"]",
    "topics": [
      "Definition of Secularism",
      "Separation of Religion from State",
      "Indian Secularism vs American Secularism (Principled Distance)"
    ],
    "learningObjectivesJson": "[\"Differentiate Indian secular principled intervention from strict Western separation\"]",
    "learningObjectives": [
      "Differentiate Indian secular principled intervention from strict Western separation"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch3",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Civics: Parliament and the Making of Laws",
    "topicsJson": "[\"Why People Should Decide\",\"Role of Parliament: Selecting National Government, Controlling the Executive, Lawmaking\",\"Who Are the People in Parliament?\"]",
    "topics": [
      "Why People Should Decide",
      "Role of Parliament: Selecting National Government, Controlling the Executive, Lawmaking",
      "Who Are the People in Parliament?"
    ],
    "learningObjectivesJson": "[\"Trace parliamentary legislative enactment from bill introduction to statute\"]",
    "learningObjectives": [
      "Trace parliamentary legislative enactment from bill introduction to statute"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch4",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Civics: Understanding Laws",
    "topicsJson": "[\"Rule of Law (No One Above Law)\",\"How Do New Laws Come About? (Domestic Violence Act 2005 Case Study)\",\"Unpopular and Controversial Laws & Citizen Protests\"]",
    "topics": [
      "Rule of Law (No One Above Law)",
      "How Do New Laws Come About? (Domestic Violence Act 2005 Case Study)",
      "Unpopular and Controversial Laws & Citizen Protests"
    ],
    "learningObjectivesJson": "[\"Analyze citizen-driven legislative drafting using the Domestic Violence Act\"]",
    "learningObjectives": [
      "Analyze citizen-driven legislative drafting using the Domestic Violence Act"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch5",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Civics: Judiciary",
    "topicsJson": "[\"Role of the Judiciary: Dispute Resolution, Judicial Review, Upholding Fundamental Rights\",\"Independent Judiciary Structure\",\"Hierarchy of Courts (Supreme, High, Subordinate)\",\"Appellate System & Public Interest Litigation (PIL)\"]",
    "topics": [
      "Role of the Judiciary: Dispute Resolution, Judicial Review, Upholding Fundamental Rights",
      "Independent Judiciary Structure",
      "Hierarchy of Courts (Supreme, High, Subordinate)",
      "Appellate System & Public Interest Litigation (PIL)"
    ],
    "learningObjectivesJson": "[\"Explain judicial review powers and file PIL procedural requirements\"]",
    "learningObjectives": [
      "Explain judicial review powers and file PIL procedural requirements"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch6",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "Civics: Understanding Marginalisation",
    "topicsJson": "[\"Definition of Marginalisation\",\"Adivasis and Stereotypes\",\"Development, Deforestation, and Displacement of Tribal Communities\",\"Muslims and Marginalisation (Sachar Committee Report)\"]",
    "topics": [
      "Definition of Marginalisation",
      "Adivasis and Stereotypes",
      "Development, Deforestation, and Displacement of Tribal Communities",
      "Muslims and Marginalisation (Sachar Committee Report)"
    ],
    "learningObjectivesJson": "[\"Assess socioeconomic indices of marginalized demographic groups\"]",
    "learningObjectives": [
      "Assess socioeconomic indices of marginalized demographic groups"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch7",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "Civics: Confronting Marginalisation",
    "topicsJson": "[\"Invoking Fundamental Rights (Article 15, Article 17 Abolition of Untouchability)\",\"Laws for the Marginalised (SC/ST Prevention of Atrocities Act 1989)\",\"Reservation Policy Rationale\"]",
    "topics": [
      "Invoking Fundamental Rights (Article 15, Article 17 Abolition of Untouchability)",
      "Laws for the Marginalised (SC/ST Prevention of Atrocities Act 1989)",
      "Reservation Policy Rationale"
    ],
    "learningObjectivesJson": "[\"Evaluate affirmative action policies and anti-discrimination statutes\"]",
    "learningObjectives": [
      "Evaluate affirmative action policies and anti-discrimination statutes"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_soc_civ_ch8",
    "grade": "Class 8",
    "subject": "Social Science",
    "chapterNumber": 8,
    "chapterTitle": "Civics: Public Facilities & Law and Social Justice",
    "topicsJson": "[\"Water as a Fundamental Right (Article 21)\",\"Government Responsibility for Public Utilities (Sanitation, Transport)\",\"Bhopal Gas Tragedy (1984) and Worker Safety\",\"Enforcement of Safety Laws & Environmental Protection as a Public Right\"]",
    "topics": [
      "Water as a Fundamental Right (Article 21)",
      "Government Responsibility for Public Utilities (Sanitation, Transport)",
      "Bhopal Gas Tragedy (1984) and Worker Safety",
      "Enforcement of Safety Laws & Environmental Protection as a Public Right"
    ],
    "learningObjectivesJson": "[\"Connect environmental protection to Article 21 Right to Life\"]",
    "learningObjectives": [
      "Connect environmental protection to Article 21 Right to Life"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c8_eng_ch1",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "The Best Christmas Present in the World & The Ant and the Cricket",
    "topicsJson": "[\"WWI Christmas Truce 1914\",\"Letter Finding Narrative\",\"Aesop's Fable on Industry\",\"Past Perfect Tense\"]",
    "topics": [
      "WWI Christmas Truce 1914",
      "Letter Finding Narrative",
      "Aesop's Fable on Industry",
      "Past Perfect Tense"
    ],
    "learningObjectivesJson": "[\"Comprehend war humanitarianism and apply past perfect tense\"]",
    "learningObjectives": [
      "Comprehend war humanitarianism and apply past perfect tense"
    ]
  },
  {
    "id": "cat_c8_eng_ch2",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "The Tsunami & Geography Lesson",
    "topicsJson": "[\"2004 Indian Ocean Tsunami Survival Stories\",\"Animal Sixth Sense\",\"Earth Geography Aerial Poem\",\"Active and Passive Voice Basics\"]",
    "topics": [
      "2004 Indian Ocean Tsunami Survival Stories",
      "Animal Sixth Sense",
      "Earth Geography Aerial Poem",
      "Active and Passive Voice Basics"
    ],
    "learningObjectivesJson": "[\"Analyze disaster survival strategies and poetic earth perspectives\"]",
    "learningObjectives": [
      "Analyze disaster survival strategies and poetic earth perspectives"
    ]
  },
  {
    "id": "cat_c8_eng_ch3",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Glimpses of the Past",
    "topicsJson": "[\"Pictorial History of India (1757 to 1857)\",\"British Oppression\",\"Raja Rammohan Roy & 1857 Sparks\",\"Direct Speech in Bubbles\"]",
    "topics": [
      "Pictorial History of India (1757 to 1857)",
      "British Oppression",
      "Raja Rammohan Roy & 1857 Sparks",
      "Direct Speech in Bubbles"
    ],
    "learningObjectivesJson": "[\"Synthesize graphic history narratives into descriptive prose\"]",
    "learningObjectives": [
      "Synthesize graphic history narratives into descriptive prose"
    ]
  },
  {
    "id": "cat_c8_eng_ch4",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "Bepin Choudhury's Lapse of Memory & The Last Bargain",
    "topicsJson": "[\"Satyajit Ray Psychological Comedy\",\"Practical Joke Narrative\",\"Rabindranath Tagore Freedom Verse\",\"Modals (had to, ought to)\"]",
    "topics": [
      "Satyajit Ray Psychological Comedy",
      "Practical Joke Narrative",
      "Rabindranath Tagore Freedom Verse",
      "Modals (had to, ought to)"
    ],
    "learningObjectivesJson": "[\"Analyze narrative twists and explore poetic themes of inner liberty\"]",
    "learningObjectives": [
      "Analyze narrative twists and explore poetic themes of inner liberty"
    ]
  },
  {
    "id": "cat_c8_eng_ch5",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "The Summit Within & The School Boy",
    "topicsJson": "[\"Major H.P.S. Ahluwalia Everest Account\",\"Internal Summit of the Mind\",\"William Blake Romantic Verse\",\"Noun Clauses\"]",
    "topics": [
      "Major H.P.S. Ahluwalia Everest Account",
      "Internal Summit of the Mind",
      "William Blake Romantic Verse",
      "Noun Clauses"
    ],
    "learningObjectivesJson": "[\"Relate physical mountaineering endurance to mental fortitude\"]",
    "learningObjectives": [
      "Relate physical mountaineering endurance to mental fortitude"
    ]
  },
  {
    "id": "cat_c8_eng_ch6",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "This is Jody's Fawn",
    "topicsJson": "[\"Moral Responsibility & Compassion\",\"Rescuing an Orphaned Fawn\",\"Emotional Growth\",\"Transitive vs Intransitive Verbs\"]",
    "topics": [
      "Moral Responsibility & Compassion",
      "Rescuing an Orphaned Fawn",
      "Emotional Growth",
      "Transitive vs Intransitive Verbs"
    ],
    "learningObjectivesJson": "[\"Examine ethical dilemmas of ecological restitution\"]",
    "learningObjectives": [
      "Examine ethical dilemmas of ecological restitution"
    ]
  },
  {
    "id": "cat_c8_eng_ch7",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "A Visit to Cambridge",
    "topicsJson": "[\"Firdaus Kanga Meets Stephen Hawking\",\"Living with ALS Disability\",\"Intellectual Triumph\",\"Comparative Adverbs\"]",
    "topics": [
      "Firdaus Kanga Meets Stephen Hawking",
      "Living with ALS Disability",
      "Intellectual Triumph",
      "Comparative Adverbs"
    ],
    "learningObjectivesJson": "[\"Develop nuanced appreciation of disabled intellectual achievements\"]",
    "learningObjectives": [
      "Develop nuanced appreciation of disabled intellectual achievements"
    ]
  },
  {
    "id": "cat_c8_eng_ch8",
    "grade": "Class 8",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "A Short Monsoon Diary & On the Grasshopper and Cricket",
    "topicsJson": "[\"Ruskin Bond Mussoorie Diary\",\"Flora and Fauna of Monsoon\",\"John Keats Sonnet on Earth's Poetry\",\"Diary Entry Writing\"]",
    "topics": [
      "Ruskin Bond Mussoorie Diary",
      "Flora and Fauna of Monsoon",
      "John Keats Sonnet on Earth's Poetry",
      "Diary Entry Writing"
    ],
    "learningObjectivesJson": "[\"Compose descriptive seasonal diary entries and analyze sonnet structures\"]",
    "learningObjectives": [
      "Compose descriptive seasonal diary entries and analyze sonnet structures"
    ]
  },
  {
    "id": "cat_c9_math_ch1",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Number Systems",
    "topicsJson": "[\"Real Numbers Representation\",\"Irrational Numbers (√2, √3 on Number Line)\",\"Real Numbers and Decimal Expansions\",\"Rationalising the Denominator: 1/(√a ± √b)\",\"Laws of Real Exponents\"]",
    "topics": [
      "Real Numbers Representation",
      "Irrational Numbers (√2, √3 on Number Line)",
      "Real Numbers and Decimal Expansions",
      "Rationalising the Denominator: 1/(√a ± √b)",
      "Laws of Real Exponents"
    ],
    "learningObjectivesJson": "[\"Classify real numbers and rationalize irrational surds\"]",
    "learningObjectives": [
      "Classify real numbers and rationalize irrational surds"
    ]
  },
  {
    "id": "cat_c9_math_ch2",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Polynomials",
    "topicsJson": "[\"Polynomials in One Variable & Degree\",\"Zeroes of a Polynomial\",\"Remainder Theorem & Factor Theorem\",\"Factorisation of Quadratics and Cubics\",\"Algebraic Identities: (x+y+z)^2, (x±y)^3, x^3+y^3+z^3-3xyz\"]",
    "topics": [
      "Polynomials in One Variable & Degree",
      "Zeroes of a Polynomial",
      "Remainder Theorem & Factor Theorem",
      "Factorisation of Quadratics and Cubics",
      "Algebraic Identities: (x+y+z)^2, (x±y)^3, x^3+y^3+z^3-3xyz"
    ],
    "learningObjectivesJson": "[\"Factorize cubic polynomials using factor theorem and apply 3-variable identities\"]",
    "learningObjectives": [
      "Factorize cubic polynomials using factor theorem and apply 3-variable identities"
    ]
  },
  {
    "id": "cat_c9_math_ch3",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Coordinate Geometry",
    "topicsJson": "[\"Cartesian Plane\",\"Coordinate Axes (x-axis, y-axis, Origin)\",\"Quadrants and Sign Conventions\",\"Plotting Ordered Pairs (x, y)\"]",
    "topics": [
      "Cartesian Plane",
      "Coordinate Axes (x-axis, y-axis, Origin)",
      "Quadrants and Sign Conventions",
      "Plotting Ordered Pairs (x, y)"
    ],
    "learningObjectivesJson": "[\"Plot coordinates accurately across all four Cartesian quadrants\"]",
    "learningObjectives": [
      "Plot coordinates accurately across all four Cartesian quadrants"
    ]
  },
  {
    "id": "cat_c9_math_ch4",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Linear Equations in Two Variables",
    "topicsJson": "[\"Standard Form: ax + by + c = 0\",\"Solutions of a Linear Equation\",\"Graphing Linear Equations on Coordinate Plane\",\"Equations of Lines Parallel to Axes\"]",
    "topics": [
      "Standard Form: ax + by + c = 0",
      "Solutions of a Linear Equation",
      "Graphing Linear Equations on Coordinate Plane",
      "Equations of Lines Parallel to Axes"
    ],
    "learningObjectivesJson": "[\"Graph linear equations and find multiple coordinate solutions\"]",
    "learningObjectives": [
      "Graph linear equations and find multiple coordinate solutions"
    ]
  },
  {
    "id": "cat_c9_math_ch5",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Introduction to Euclid's Geometry",
    "topicsJson": "[\"Axioms and Postulates\",\"Euclid's 5 Postulates\",\"Equivalent Versions of Euclid's Fifth Postulate\"]",
    "topics": [
      "Axioms and Postulates",
      "Euclid's 5 Postulates",
      "Equivalent Versions of Euclid's Fifth Postulate"
    ],
    "learningObjectivesJson": "[\"Differentiate geometric axioms from postulates and analyze parallel postulate\"]",
    "learningObjectives": [
      "Differentiate geometric axioms from postulates and analyze parallel postulate"
    ]
  },
  {
    "id": "cat_c9_math_ch6",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Lines and Angles",
    "topicsJson": "[\"Basic Terms and Definitions\",\"Intersecting and Non-Intersecting Lines\",\"Pairs of Angles: Linear Pair Axiom, Vertically Opposite Angles\",\"Parallel Lines and Transversal Theorems\",\"Angle Sum Property of a Triangle\"]",
    "topics": [
      "Basic Terms and Definitions",
      "Intersecting and Non-Intersecting Lines",
      "Pairs of Angles: Linear Pair Axiom, Vertically Opposite Angles",
      "Parallel Lines and Transversal Theorems",
      "Angle Sum Property of a Triangle"
    ],
    "learningObjectivesJson": "[\"Construct formal geometric proofs for parallel line transversal theorems\"]",
    "learningObjectives": [
      "Construct formal geometric proofs for parallel line transversal theorems"
    ]
  },
  {
    "id": "cat_c9_math_ch7",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Triangles",
    "topicsJson": "[\"Congruence of Triangles\",\"Criteria for Congruence: SAS, ASA, AAS, SSS, RHS\",\"Properties of Isosceles Triangle (Angles Opposite Equal Sides)\",\"Inequalities in a Triangle\"]",
    "topics": [
      "Congruence of Triangles",
      "Criteria for Congruence: SAS, ASA, AAS, SSS, RHS",
      "Properties of Isosceles Triangle (Angles Opposite Equal Sides)",
      "Inequalities in a Triangle"
    ],
    "learningObjectivesJson": "[\"Apply axiomatic triangle congruence criteria in multi-step geometric proofs\"]",
    "learningObjectives": [
      "Apply axiomatic triangle congruence criteria in multi-step geometric proofs"
    ]
  },
  {
    "id": "cat_c9_math_ch8",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Quadrilaterals",
    "topicsJson": "[\"Properties of Parallelograms (Opposite Sides/Angles Equal, Diagonals Bisect)\",\"Sufficient Conditions for Parallelogram\",\"Mid-Point Theorem and its Converse\"]",
    "topics": [
      "Properties of Parallelograms (Opposite Sides/Angles Equal, Diagonals Bisect)",
      "Sufficient Conditions for Parallelogram",
      "Mid-Point Theorem and its Converse"
    ],
    "learningObjectivesJson": "[\"Prove and apply the Mid-Point Theorem in polygon analysis\"]",
    "learningObjectives": [
      "Prove and apply the Mid-Point Theorem in polygon analysis"
    ]
  },
  {
    "id": "cat_c9_math_ch9",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Circles",
    "topicsJson": "[\"Angle Subtended by a Chord\",\"Perpendicular from Center to Chord Bisects It\",\"Equal Chords and Distances from Center\",\"Angle Subtended by an Arc (Angle at Center = 2 x Angle at Circumference)\",\"Angles in Same Segment Equal\",\"Cyclic Quadrilaterals (Opposite Angles Sum = 180°)\"]",
    "topics": [
      "Angle Subtended by a Chord",
      "Perpendicular from Center to Chord Bisects It",
      "Equal Chords and Distances from Center",
      "Angle Subtended by an Arc (Angle at Center = 2 x Angle at Circumference)",
      "Angles in Same Segment Equal",
      "Cyclic Quadrilaterals (Opposite Angles Sum = 180°)"
    ],
    "learningObjectivesJson": "[\"Prove central and inscribed angle theorems and cyclic quadrilateral properties\"]",
    "learningObjectives": [
      "Prove central and inscribed angle theorems and cyclic quadrilateral properties"
    ]
  },
  {
    "id": "cat_c9_math_ch10",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Heron's Formula",
    "topicsJson": "[\"Semi-perimeter: s = (a+b+c)/2\",\"Area of Triangle Formula: √[s(s-a)(s-b)(s-c)]\",\"Applications to Scalene Triangles & Quadrilateral Fields\"]",
    "topics": [
      "Semi-perimeter: s = (a+b+c)/2",
      "Area of Triangle Formula: √[s(s-a)(s-b)(s-c)]",
      "Applications to Scalene Triangles & Quadrilateral Fields"
    ],
    "learningObjectivesJson": "[\"Calculate scalene triangle areas without perpendicular heights using Heron's formula\"]",
    "learningObjectives": [
      "Calculate scalene triangle areas without perpendicular heights using Heron's formula"
    ]
  },
  {
    "id": "cat_c9_math_ch11",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Surface Areas and Volumes",
    "topicsJson": "[\"Surface Area of Right Circular Cone (pi x r x l, pi x r x (l+r))\",\"Surface Area of Sphere (4 x pi x r^2) & Hemisphere\",\"Volume of Right Circular Cone (1/3 x pi x r^2 x h)\",\"Volume of Sphere (4/3 x pi x r^3) & Hemisphere\"]",
    "topics": [
      "Surface Area of Right Circular Cone (pi x r x l, pi x r x (l+r))",
      "Surface Area of Sphere (4 x pi x r^2) & Hemisphere",
      "Volume of Right Circular Cone (1/3 x pi x r^2 x h)",
      "Volume of Sphere (4/3 x pi x r^3) & Hemisphere"
    ],
    "learningObjectivesJson": "[\"Compute surface areas and capacities for cones, spheres, and hemispheres\"]",
    "learningObjectives": [
      "Compute surface areas and capacities for cones, spheres, and hemispheres"
    ]
  },
  {
    "id": "cat_c9_math_ch12",
    "grade": "Class 9",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "Statistics",
    "topicsJson": "[\"Graphical Representation of Data: Bar Graphs\",\"Histograms with Uniform and Varying Widths\",\"Frequency Polygons\"]",
    "topics": [
      "Graphical Representation of Data: Bar Graphs",
      "Histograms with Uniform and Varying Widths",
      "Frequency Polygons"
    ],
    "learningObjectivesJson": "[\"Construct histograms with varying class intervals and draw frequency polygons\"]",
    "learningObjectives": [
      "Construct histograms with varying class intervals and draw frequency polygons"
    ]
  },
  {
    "id": "cat_c9_sci_ch1",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 1,
    "chapterTitle": "Matter in Our Surroundings",
    "topicsJson": "[\"Physical Nature of Matter\",\"Characteristics of Particles (Motion, Spaces, Attraction)\",\"States of Matter (Solid, Liquid, Gas)\",\"Effect of Temperature (Latent Heat of Fusion, Vaporization)\",\"Effect of Pressure\",\"Evaporation & Factors Affecting Cooling\"]",
    "topics": [
      "Physical Nature of Matter",
      "Characteristics of Particles (Motion, Spaces, Attraction)",
      "States of Matter (Solid, Liquid, Gas)",
      "Effect of Temperature (Latent Heat of Fusion, Vaporization)",
      "Effect of Pressure",
      "Evaporation & Factors Affecting Cooling"
    ],
    "learningObjectivesJson": "[\"Explain kinetic molecular theory and latent heat phase shifts\"]",
    "learningObjectives": [
      "Explain kinetic molecular theory and latent heat phase shifts"
    ]
  },
  {
    "id": "cat_c9_sci_ch2",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 2,
    "chapterTitle": "Is Matter Around Us Pure?",
    "topicsJson": "[\"Mixtures (Homogeneous vs Heterogeneous)\",\"Solutions, Suspensions, and Colloids\",\"Tyndall Effect & Brownian Movement\",\"Concentration of Solutions (Mass %, Volume %)\",\"Physical vs Chemical Changes\",\"Elements and Compounds\"]",
    "topics": [
      "Mixtures (Homogeneous vs Heterogeneous)",
      "Solutions, Suspensions, and Colloids",
      "Tyndall Effect & Brownian Movement",
      "Concentration of Solutions (Mass %, Volume %)",
      "Physical vs Chemical Changes",
      "Elements and Compounds"
    ],
    "learningObjectivesJson": "[\"Distinguish true solutions from colloids and compute percentage concentrations\"]",
    "learningObjectives": [
      "Distinguish true solutions from colloids and compute percentage concentrations"
    ]
  },
  {
    "id": "cat_c9_sci_ch3",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 3,
    "chapterTitle": "Atoms and Molecules",
    "topicsJson": "[\"Laws of Chemical Combination (Mass Conservation, Definite Proportions)\",\"Dalton's Atomic Theory\",\"Atomic Mass and Symbols (IUPAC)\",\"Molecules and Chemical Formulae\",\"Valency & Criss-Cross Method\",\"Molecular Mass & Formula Unit Mass\"]",
    "topics": [
      "Laws of Chemical Combination (Mass Conservation, Definite Proportions)",
      "Dalton's Atomic Theory",
      "Atomic Mass and Symbols (IUPAC)",
      "Molecules and Chemical Formulae",
      "Valency & Criss-Cross Method",
      "Molecular Mass & Formula Unit Mass"
    ],
    "learningObjectivesJson": "[\"Write accurate chemical formulas using polyatomic ionic valencies\"]",
    "learningObjectives": [
      "Write accurate chemical formulas using polyatomic ionic valencies"
    ]
  },
  {
    "id": "cat_c9_sci_ch4",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 4,
    "chapterTitle": "Structure of the Atom",
    "topicsJson": "[\"Charged Particles (Electrons, Protons)\",\"Thomson's Plum Pudding Model\",\"Rutherford's Alpha Particle Scattering Experiment & Nuclear Model\",\"Bohr's Model of Atom\",\"Neutrons\",\"Electronic Configuration (Bohr-Bury Rules)\",\"Valency, Atomic Number (Z), Mass Number (A)\",\"Isotopes & Isobars\"]",
    "topics": [
      "Charged Particles (Electrons, Protons)",
      "Thomson's Plum Pudding Model",
      "Rutherford's Alpha Particle Scattering Experiment & Nuclear Model",
      "Bohr's Model of Atom",
      "Neutrons",
      "Electronic Configuration (Bohr-Bury Rules)",
      "Valency, Atomic Number (Z), Mass Number (A)",
      "Isotopes & Isobars"
    ],
    "learningObjectivesJson": "[\"Distribute electrons into K, L, M, N shells and apply isotope mass formulas\"]",
    "learningObjectives": [
      "Distribute electrons into K, L, M, N shells and apply isotope mass formulas"
    ]
  },
  {
    "id": "cat_c9_sci_ch5",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 5,
    "chapterTitle": "The Fundamental Unit of Life",
    "topicsJson": "[\"Cell as Basic Unit of Life (Hooke, Leeuwenhoek)\",\"Compound Microscope Use\",\"Plasma Membrane, Osmosis (Hypertonic, Hypotonic, Isotonic), Diffusion\",\"Cell Wall & Plasmolysis\",\"Nucleus (Chromosomes, DNA, Genes)\",\"Cytoplasm & Organelles (Endoplasmic Reticulum, Golgi Apparatus, Lysosomes, Mitochondria, Plastids, Vacuoles)\",\"Cell Division: Mitosis vs Meiosis\"]",
    "topics": [
      "Cell as Basic Unit of Life (Hooke, Leeuwenhoek)",
      "Compound Microscope Use",
      "Plasma Membrane, Osmosis (Hypertonic, Hypotonic, Isotonic), Diffusion",
      "Cell Wall & Plasmolysis",
      "Nucleus (Chromosomes, DNA, Genes)",
      "Cytoplasm & Organelles (Endoplasmic Reticulum, Golgi Apparatus, Lysosomes, Mitochondria, Plastids, Vacuoles)",
      "Cell Division: Mitosis vs Meiosis"
    ],
    "learningObjectivesJson": "[\"Compare prokaryotic vs eukaryotic organelles and contrast mitosis with meiosis\"]",
    "learningObjectives": [
      "Compare prokaryotic vs eukaryotic organelles and contrast mitosis with meiosis"
    ]
  },
  {
    "id": "cat_c9_sci_ch6",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 6,
    "chapterTitle": "Tissues",
    "topicsJson": "[\"Plant Tissues: Meristematic (Apical, Lateral, Intercalary), Permanent (Parenchyma, Collenchyma, Sclerenchyma, Xylem, Phloem)\",\"Animal Tissues: Epithelial, Connective (Blood, Bone, Cartilage, Ligament, Tendon, Areolar, Adipose), Muscular (Striated, Smooth, Cardiac), Nervous (Neuron Anatomy)\"]",
    "topics": [
      "Plant Tissues: Meristematic (Apical, Lateral, Intercalary), Permanent (Parenchyma, Collenchyma, Sclerenchyma, Xylem, Phloem)",
      "Animal Tissues: Epithelial, Connective (Blood, Bone, Cartilage, Ligament, Tendon, Areolar, Adipose), Muscular (Striated, Smooth, Cardiac), Nervous (Neuron Anatomy)"
    ],
    "learningObjectivesJson": "[\"Identify specialized tissue microstructures and articulate physiological functions\"]",
    "learningObjectives": [
      "Identify specialized tissue microstructures and articulate physiological functions"
    ]
  },
  {
    "id": "cat_c9_sci_ch7",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 7,
    "chapterTitle": "Motion",
    "topicsJson": "[\"Distance vs Displacement\",\"Uniform vs Non-Uniform Motion\",\"Speed and Velocity\",\"Acceleration (a = (v-u)/t)\",\"Graphical Representation: Distance-Time & Velocity-Time Graphs\",\"Derivation of Three Equations of Motion (v=u+at, s=ut+1/2at^2, v^2-u^2=2as)\",\"Uniform Circular Motion\"]",
    "topics": [
      "Distance vs Displacement",
      "Uniform vs Non-Uniform Motion",
      "Speed and Velocity",
      "Acceleration (a = (v-u)/t)",
      "Graphical Representation: Distance-Time & Velocity-Time Graphs",
      "Derivation of Three Equations of Motion (v=u+at, s=ut+1/2at^2, v^2-u^2=2as)",
      "Uniform Circular Motion"
    ],
    "learningObjectivesJson": "[\"Derive kinematic equations graphically and calculate acceleration from v-t graphs\"]",
    "learningObjectives": [
      "Derive kinematic equations graphically and calculate acceleration from v-t graphs"
    ]
  },
  {
    "id": "cat_c9_sci_ch8",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 8,
    "chapterTitle": "Force and Laws of Motion",
    "topicsJson": "[\"Balanced and Unbalanced Forces\",\"First Law of Motion & Inertia\",\"Momentum (p = mv)\",\"Second Law of Motion (F = ma)\",\"Third Law of Motion (Action-Reaction)\",\"Conservation of Linear Momentum\"]",
    "topics": [
      "Balanced and Unbalanced Forces",
      "First Law of Motion & Inertia",
      "Momentum (p = mv)",
      "Second Law of Motion (F = ma)",
      "Third Law of Motion (Action-Reaction)",
      "Conservation of Linear Momentum"
    ],
    "learningObjectivesJson": "[\"Apply Newton's three laws to calculate force, acceleration, and recoil momentum\"]",
    "learningObjectives": [
      "Apply Newton's three laws to calculate force, acceleration, and recoil momentum"
    ]
  },
  {
    "id": "cat_c9_sci_ch9",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 9,
    "chapterTitle": "Gravitation",
    "topicsJson": "[\"Universal Law of Gravitation: F = G(m1m2)/d^2\",\"Importance of Gravitational Law\",\"Free Fall & Acceleration due to Gravity (g = GM/R^2)\",\"Mass vs Weight\",\"Weight on Moon (1/6th)\",\"Thrust and Pressure\",\"Archimedes' Principle & Buoyancy\",\"Relative Density\"]",
    "topics": [
      "Universal Law of Gravitation: F = G(m1m2)/d^2",
      "Importance of Gravitational Law",
      "Free Fall & Acceleration due to Gravity (g = GM/R^2)",
      "Mass vs Weight",
      "Weight on Moon (1/6th)",
      "Thrust and Pressure",
      "Archimedes' Principle & Buoyancy",
      "Relative Density"
    ],
    "learningObjectivesJson": "[\"Calculate gravitational attraction and apply Archimedes' buoyant force principle\"]",
    "learningObjectives": [
      "Calculate gravitational attraction and apply Archimedes' buoyant force principle"
    ]
  },
  {
    "id": "cat_c9_sci_ch10",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 10,
    "chapterTitle": "Work and Energy",
    "topicsJson": "[\"Scientific Concept of Work: W = F x s x cos(theta)\",\"Work Done: Positive, Negative, Zero\",\"Energy Forms: Kinetic Energy (1/2 x m x v^2), Potential Energy (m x g x h)\",\"Law of Conservation of Energy\",\"Power (P = W/t in Watts)\",\"Commercial Unit of Energy (kWh)\"]",
    "topics": [
      "Scientific Concept of Work: W = F x s x cos(theta)",
      "Work Done: Positive, Negative, Zero",
      "Energy Forms: Kinetic Energy (1/2 x m x v^2), Potential Energy (m x g x h)",
      "Law of Conservation of Energy",
      "Power (P = W/t in Watts)",
      "Commercial Unit of Energy (kWh)"
    ],
    "learningObjectivesJson": "[\"Compute mechanical work, kinetic-potential transformations, and electrical kWh bills\"]",
    "learningObjectives": [
      "Compute mechanical work, kinetic-potential transformations, and electrical kWh bills"
    ]
  },
  {
    "id": "cat_c9_sci_ch11",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 11,
    "chapterTitle": "Sound",
    "topicsJson": "[\"Production & Propagation of Sound Waves\",\"Mechanical Longitudinal Wave Nature (Compressions & Rarefactions)\",\"Wave Characteristics: Wavelength (lambda), Frequency (nu), Time Period (T), Amplitude (A), Speed (v = nu x lambda)\",\"Reflection of Sound: Echo (min distance 17.2m) & Reverberation\",\"Ultrasound Applications (SONAR, Echocardiography)\",\"Structure of Human Ear\"]",
    "topics": [
      "Production & Propagation of Sound Waves",
      "Mechanical Longitudinal Wave Nature (Compressions & Rarefactions)",
      "Wave Characteristics: Wavelength (lambda), Frequency (nu), Time Period (T), Amplitude (A), Speed (v = nu x lambda)",
      "Reflection of Sound: Echo (min distance 17.2m) & Reverberation",
      "Ultrasound Applications (SONAR, Echocardiography)",
      "Structure of Human Ear"
    ],
    "learningObjectivesJson": "[\"Calculate echo reflection distances, ultrasound wave parameters, and ear acoustics\"]",
    "learningObjectives": [
      "Calculate echo reflection distances, ultrasound wave parameters, and ear acoustics"
    ]
  },
  {
    "id": "cat_c9_sci_ch12",
    "grade": "Class 9",
    "subject": "Science",
    "chapterNumber": 12,
    "chapterTitle": "Improvement in Food Resources",
    "topicsJson": "[\"Crop Variety Improvement (Hybridization, Genetic Modification)\",\"Crop Production Management (Nutrient Management: Macro/Micronutrients, Manures, Fertilizers, Irrigation, Cropping Patterns: Mixed, Inter, Rotation)\",\"Crop Protection Management (Weeds, Pests, Storage Fungi)\",\"Animal Husbandry: Cattle, Poultry, Fish (Capture, Culture, Marine, Inland), Beekeeping (Apiculture)\"]",
    "topics": [
      "Crop Variety Improvement (Hybridization, Genetic Modification)",
      "Crop Production Management (Nutrient Management: Macro/Micronutrients, Manures, Fertilizers, Irrigation, Cropping Patterns: Mixed, Inter, Rotation)",
      "Crop Protection Management (Weeds, Pests, Storage Fungi)",
      "Animal Husbandry: Cattle, Poultry, Fish (Capture, Culture, Marine, Inland), Beekeeping (Apiculture)"
    ],
    "learningObjectivesJson": "[\"Design sustainable crop rotation patterns and compare fish farming methods\"]",
    "learningObjectives": [
      "Design sustainable crop rotation patterns and compare fish farming methods"
    ]
  },
  {
    "id": "cat_c9_soc_hist_ch1",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "History: The French Revolution",
    "topicsJson": "[\"French Society Late 18th Century (Three Estates)\",\"Outbreak of Revolution (Bastille)\",\"Constitutional Monarchy & Jacobin Reign of Terror\",\"Abolition of Slavery & Women's Role\",\"Legacy of Liberty and Democratic Rights\"]",
    "topics": [
      "French Society Late 18th Century (Three Estates)",
      "Outbreak of Revolution (Bastille)",
      "Constitutional Monarchy & Jacobin Reign of Terror",
      "Abolition of Slavery & Women's Role",
      "Legacy of Liberty and Democratic Rights"
    ],
    "learningObjectivesJson": "[\"Analyze causes of French absolute monarchy collapse and global democratic impacts\"]",
    "learningObjectives": [
      "Analyze causes of French absolute monarchy collapse and global democratic impacts"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c9_soc_hist_ch2",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "History: Socialism in Europe and the Russian Revolution",
    "topicsJson": "[\"Liberals, Radicals, and Conservatives\",\"Karl Marx & Industrial Socialism\",\"1905 Bloody Sunday\",\"February Revolution (Petrograd) & October Revolution 1917 (Lenin & Bolsheviks)\",\"Civil War & Stalin's Collectivization\"]",
    "topics": [
      "Liberals, Radicals, and Conservatives",
      "Karl Marx & Industrial Socialism",
      "1905 Bloody Sunday",
      "February Revolution (Petrograd) & October Revolution 1917 (Lenin & Bolsheviks)",
      "Civil War & Stalin's Collectivization"
    ],
    "learningObjectivesJson": "[\"Examine Bolshevik rise to power and Stalinist agrarian collectivization\"]",
    "learningObjectives": [
      "Examine Bolshevik rise to power and Stalinist agrarian collectivization"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c9_soc_hist_ch3",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "History: Nazism and the Rise of Hitler",
    "topicsJson": "[\"Weimar Republic Collapse & Great Depression\",\"Hitler's Rise to Chancellor\",\"Nazi Ideology (Racial Hierarchy, Lebensraum)\",\"Propaganda & Holocaust (Genocidal Warfare)\"]",
    "topics": [
      "Weimar Republic Collapse & Great Depression",
      "Hitler's Rise to Chancellor",
      "Nazi Ideology (Racial Hierarchy, Lebensraum)",
      "Propaganda & Holocaust (Genocidal Warfare)"
    ],
    "learningObjectivesJson": "[\"Deconstruct fascist propaganda, totalitarianism, and the Holocaust\"]",
    "learningObjectives": [
      "Deconstruct fascist propaganda, totalitarianism, and the Holocaust"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c9_soc_hist_ch4",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "History: Forest Society and Colonialism",
    "topicsJson": "[\"Why Deforestation? (Railways, Ship Building, Plantations)\",\"Scientific Forestry of Dietrich Brandis\",\"Rebellion in the Forest (Bastar Uprising 1910)\",\"Forest Transformations in Java (Dutch Colonists)\"]",
    "topics": [
      "Why Deforestation? (Railways, Ship Building, Plantations)",
      "Scientific Forestry of Dietrich Brandis",
      "Rebellion in the Forest (Bastar Uprising 1910)",
      "Forest Transformations in Java (Dutch Colonists)"
    ],
    "learningObjectivesJson": "[\"Compare colonial commercial forestry in India and Dutch East Indies\"]",
    "learningObjectives": [
      "Compare colonial commercial forestry in India and Dutch East Indies"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c9_soc_hist_ch5",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "History: Pastoralists in the Modern World",
    "topicsJson": "[\"Nomadic Pastoralists (Gaddis, Gujjar Bakarwals, Dhangars, Raikas)\",\"Colonial Rule and Pastoral Life (Waste Land Rules, Criminal Tribes Act, Grazing Tax)\",\"Pastoralism in Africa (Maasai Dispossession)\"]",
    "topics": [
      "Nomadic Pastoralists (Gaddis, Gujjar Bakarwals, Dhangars, Raikas)",
      "Colonial Rule and Pastoral Life (Waste Land Rules, Criminal Tribes Act, Grazing Tax)",
      "Pastoralism in Africa (Maasai Dispossession)"
    ],
    "learningObjectivesJson": "[\"Assess the survival strategies of mobile pastoralists under colonial borders\"]",
    "learningObjectives": [
      "Assess the survival strategies of mobile pastoralists under colonial borders"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c9_soc_geo_ch1",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Geography: India – Size and Location",
    "topicsJson": "[\"Latitudinal & Longitudinal Extent (8°4'N to 37°6'N, 68°7'E to 97°25'E)\",\"Standard Meridian of India (82°30'E Mirzapur)\",\"India's Strategic Maritime Location & Neighbors\"]",
    "topics": [
      "Latitudinal & Longitudinal Extent (8°4'N to 37°6'N, 68°7'E to 97°25'E)",
      "Standard Meridian of India (82°30'E Mirzapur)",
      "India's Strategic Maritime Location & Neighbors"
    ],
    "learningObjectivesJson": "[\"Locate India's cardinal coordinates and calculate longitudinal time differences\"]",
    "learningObjectives": [
      "Locate India's cardinal coordinates and calculate longitudinal time differences"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c9_soc_geo_ch2",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Geography: Physical Features of India",
    "topicsJson": "[\"Tectonic Plate Movements\",\"The Himalayan Mountains (Himadri, Himachal, Shiwaliks)\",\"Northern Plains (Bhabar, Terai, Bhangar, Khadar)\",\"Peninsular Plateau (Central Highlands, Deccan)\",\"Indian Desert, Coastal Plains, Islands (Lakshadweep, Andaman & Nicobar)\"]",
    "topics": [
      "Tectonic Plate Movements",
      "The Himalayan Mountains (Himadri, Himachal, Shiwaliks)",
      "Northern Plains (Bhabar, Terai, Bhangar, Khadar)",
      "Peninsular Plateau (Central Highlands, Deccan)",
      "Indian Desert, Coastal Plains, Islands (Lakshadweep, Andaman & Nicobar)"
    ],
    "learningObjectivesJson": "[\"Distinguish geological relief formations and morphological soil zones\"]",
    "learningObjectives": [
      "Distinguish geological relief formations and morphological soil zones"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c9_soc_geo_ch3",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Geography: Drainage",
    "topicsJson": "[\"Major Drainage Patterns (Dendritic, Trellis, Rectangular, Radial)\",\"Himalayan Rivers: Indus, Ganga, Brahmaputra Systems\",\"Peninsular Rivers: Narmada, Tapi, Godavari, Krishna, Mahanadi, Kaveri\",\"Lakes, Economic Role of Rivers & National River Conservation Plan\"]",
    "topics": [
      "Major Drainage Patterns (Dendritic, Trellis, Rectangular, Radial)",
      "Himalayan Rivers: Indus, Ganga, Brahmaputra Systems",
      "Peninsular Rivers: Narmada, Tapi, Godavari, Krishna, Mahanadi, Kaveri",
      "Lakes, Economic Role of Rivers & National River Conservation Plan"
    ],
    "learningObjectivesJson": "[\"Contrast perennial Himalayan river systems with seasonal Peninsular rivers\"]",
    "learningObjectives": [
      "Contrast perennial Himalayan river systems with seasonal Peninsular rivers"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c9_soc_geo_ch4",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Geography: Climate",
    "topicsJson": "[\"Factors Affecting India's Climate (Latitude, Altitude, Pressure & Winds, Jet Streams)\",\"Mechanism of Monsoon (ITCZ, Coriolis Force, El Niño)\",\"Seasons: Cold, Hot, Advancing Monsoon (South-West), Retreating Monsoon\",\"Monsoon as a Unifying Bond\"]",
    "topics": [
      "Factors Affecting India's Climate (Latitude, Altitude, Pressure & Winds, Jet Streams)",
      "Mechanism of Monsoon (ITCZ, Coriolis Force, El Niño)",
      "Seasons: Cold, Hot, Advancing Monsoon (South-West), Retreating Monsoon",
      "Monsoon as a Unifying Bond"
    ],
    "learningObjectivesJson": "[\"Explain monsoon synoptic dynamics and rainfall distribution gradients\"]",
    "learningObjectives": [
      "Explain monsoon synoptic dynamics and rainfall distribution gradients"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c9_soc_geo_ch5",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Geography: Natural Vegetation and Wild Life",
    "topicsJson": "[\"Factors Affecting Flora and Fauna\",\"Vegetation Types: Tropical Evergreen, Deciduous, Thorn, Montane, Mangrove Forests\",\"Wildlife Depletion & Biosphere Reserves in India\"]",
    "topics": [
      "Factors Affecting Flora and Fauna",
      "Vegetation Types: Tropical Evergreen, Deciduous, Thorn, Montane, Mangrove Forests",
      "Wildlife Depletion & Biosphere Reserves in India"
    ],
    "learningObjectivesJson": "[\"Relate climatic precipitation thresholds to forest biome classifications\"]",
    "learningObjectives": [
      "Relate climatic precipitation thresholds to forest biome classifications"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c9_soc_geo_ch6",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "Geography: Population",
    "topicsJson": "[\"Population Size and Distribution\",\"Population Growth and Processes of Change (Birth, Death, Migration)\",\"Age Composition, Sex Ratio, Literacy Rates, Occupational Structure\",\"National Population Policy (NPP 2000)\"]",
    "topics": [
      "Population Size and Distribution",
      "Population Growth and Processes of Change (Birth, Death, Migration)",
      "Age Composition, Sex Ratio, Literacy Rates, Occupational Structure",
      "National Population Policy (NPP 2000)"
    ],
    "learningObjectivesJson": "[\"Analyze census demographic metrics and population pyramids\"]",
    "learningObjectives": [
      "Analyze census demographic metrics and population pyramids"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c9_soc_civ_ch1",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Civics: What is Democracy? Why Democracy?",
    "topicsJson": "[\"Definition & Core Features of Democracy (Major Decisions by Elected Leaders, Free & Fair Electoral Choice, One Person One Vote One Value, Rule of Law)\",\"Arguments Against and For Democracy\",\"Broader Meaning of Democracy\"]",
    "topics": [
      "Definition & Core Features of Democracy (Major Decisions by Elected Leaders, Free & Fair Electoral Choice, One Person One Vote One Value, Rule of Law)",
      "Arguments Against and For Democracy",
      "Broader Meaning of Democracy"
    ],
    "learningObjectivesJson": "[\"Evaluate democratic governance benchmarks against authoritarian alternatives\"]",
    "learningObjectives": [
      "Evaluate democratic governance benchmarks against authoritarian alternatives"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c9_soc_civ_ch2",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Civics: Constitutional Design",
    "topicsJson": "[\"Democratic Constitution in South Africa (Apartheid Abolition)\",\"Why Do We Need a Constitution?\",\"Making of Indian Constitution (Constituent Assembly)\",\"Guiding Values of the Indian Constitution (The Preamble)\"]",
    "topics": [
      "Democratic Constitution in South Africa (Apartheid Abolition)",
      "Why Do We Need a Constitution?",
      "Making of Indian Constitution (Constituent Assembly)",
      "Guiding Values of the Indian Constitution (The Preamble)"
    ],
    "learningObjectivesJson": "[\"Analyze the foundational philosophy encoded in the Indian Preamble\"]",
    "learningObjectives": [
      "Analyze the foundational philosophy encoded in the Indian Preamble"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c9_soc_civ_ch3",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Civics: Electoral Politics",
    "topicsJson": "[\"Why Elections? (Voter Choices)\",\"What Makes an Election Democratic?\",\"Electoral System in India: Constituencies, Reserved Constituencies, Voters' List, Nomination, Campaign, Polling\",\"Independent Election Commission & Free/Fair Acceptance\"]",
    "topics": [
      "Why Elections? (Voter Choices)",
      "What Makes an Election Democratic?",
      "Electoral System in India: Constituencies, Reserved Constituencies, Voters' List, Nomination, Campaign, Polling",
      "Independent Election Commission & Free/Fair Acceptance"
    ],
    "learningObjectivesJson": "[\"Map the operational phases of Indian parliamentary general elections\"]",
    "learningObjectives": [
      "Map the operational phases of Indian parliamentary general elections"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c9_soc_civ_ch4",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Civics: Working of Institutions",
    "topicsJson": "[\"How a Major Policy Decision is Taken (Mandal Commission Office Memorandum)\",\"Parliament (Lok Sabha vs Rajya Sabha Powers)\",\"Political Executive: Prime Minister and Council of Ministers, President\",\"The Judiciary: Powers of Judicial Review\"]",
    "topics": [
      "How a Major Policy Decision is Taken (Mandal Commission Office Memorandum)",
      "Parliament (Lok Sabha vs Rajya Sabha Powers)",
      "Political Executive: Prime Minister and Council of Ministers, President",
      "The Judiciary: Powers of Judicial Review"
    ],
    "learningObjectivesJson": "[\"Contrast legislative, executive, and judicial powers in constitutional decision making\"]",
    "learningObjectives": [
      "Contrast legislative, executive, and judicial powers in constitutional decision making"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c9_soc_civ_ch5",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Civics: Democratic Rights",
    "topicsJson": "[\"Life Without Rights (Guantanamo Bay, Saudi Arabia, Kosovo)\",\"Rights in a Democracy\",\"Fundamental Rights in Indian Constitution (Articles 14-32)\",\"Right to Constitutional Remedies (Writs)\",\"Expanding Scope of Rights\"]",
    "topics": [
      "Life Without Rights (Guantanamo Bay, Saudi Arabia, Kosovo)",
      "Rights in a Democracy",
      "Fundamental Rights in Indian Constitution (Articles 14-32)",
      "Right to Constitutional Remedies (Writs)",
      "Expanding Scope of Rights"
    ],
    "learningObjectivesJson": "[\"Defend six fundamental constitutional rights and judicial writ remedies\"]",
    "learningObjectives": [
      "Defend six fundamental constitutional rights and judicial writ remedies"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c9_soc_econ_ch1",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Economics: The Story of Village Palampur",
    "topicsJson": "[\"Organization of Production (Land, Labour, Physical Capital, Human Capital)\",\"Farming in Palampur (Multiple Cropping, Green Revolution Impacts, Chemical Inputs)\",\"Non-Farm Activities (Dairy, Transport, Small Manufacturing)\"]",
    "topics": [
      "Organization of Production (Land, Labour, Physical Capital, Human Capital)",
      "Farming in Palampur (Multiple Cropping, Green Revolution Impacts, Chemical Inputs)",
      "Non-Farm Activities (Dairy, Transport, Small Manufacturing)"
    ],
    "learningObjectivesJson": "[\"Identify four factors of production and evaluate Green Revolution externalities\"]",
    "learningObjectives": [
      "Identify four factors of production and evaluate Green Revolution externalities"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c9_soc_econ_ch2",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Economics: People as Resource",
    "topicsJson": "[\"Human Capital Formation (Education and Healthcare Investments)\",\"Economic Activities: Primary, Secondary, Tertiary; Market vs Non-Market\",\"Quality of Population (Literacy, Health)\",\"Unemployment: Seasonal, Disguised, Educated\"]",
    "topics": [
      "Human Capital Formation (Education and Healthcare Investments)",
      "Economic Activities: Primary, Secondary, Tertiary; Market vs Non-Market",
      "Quality of Population (Literacy, Health)",
      "Unemployment: Seasonal, Disguised, Educated"
    ],
    "learningObjectivesJson": "[\"Differentiate disguised unemployment from educated unemployment\"]",
    "learningObjectives": [
      "Differentiate disguised unemployment from educated unemployment"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c9_soc_econ_ch3",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Economics: Poverty as a Challenge",
    "topicsJson": "[\"Poverty Line Determination (Calorie Norms & Minimum Consumption)\",\"Poverty Estimates in India & Vulnerable Groups\",\"Inter-State Disparities & Global Poverty Scenario\",\"Anti-Poverty Measures (MGNREGA 2005, PMRY, SGSY)\"]",
    "topics": [
      "Poverty Line Determination (Calorie Norms & Minimum Consumption)",
      "Poverty Estimates in India & Vulnerable Groups",
      "Inter-State Disparities & Global Poverty Scenario",
      "Anti-Poverty Measures (MGNREGA 2005, PMRY, SGSY)"
    ],
    "learningObjectivesJson": "[\"Evaluate statutory anti-poverty employment guarantees like MGNREGA\"]",
    "learningObjectives": [
      "Evaluate statutory anti-poverty employment guarantees like MGNREGA"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c9_soc_econ_ch4",
    "grade": "Class 9",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Economics: Food Security in India",
    "topicsJson": "[\"What is Food Security? (Availability, Accessibility, Affordability)\",\"Famine of Bengal 1943\",\"Food Security System: Buffer Stock (FCI) & Public Distribution System (PDS)\",\"Minimum Support Price (MSP) & Role of Cooperatives (Amul)\"]",
    "topics": [
      "What is Food Security? (Availability, Accessibility, Affordability)",
      "Famine of Bengal 1943",
      "Food Security System: Buffer Stock (FCI) & Public Distribution System (PDS)",
      "Minimum Support Price (MSP) & Role of Cooperatives (Amul)"
    ],
    "learningObjectivesJson": "[\"Examine FCI buffer stocking, MSP incentives, and ration shop distribution\"]",
    "learningObjectives": [
      "Examine FCI buffer stocking, MSP incentives, and ration shop distribution"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c9_eng_ch1",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "The Fun They Had & The Road Not Taken",
    "topicsJson": "[\"Isaac Asimov Futuristic School\",\"Robert Frost Decision Making Verse\",\"Conditional Clauses (If Clauses)\"]",
    "topics": [
      "Isaac Asimov Futuristic School",
      "Robert Frost Decision Making Verse",
      "Conditional Clauses (If Clauses)"
    ],
    "learningObjectivesJson": "[\"Contrast mechanized digital schooling with human teachers and analyze poetic metaphor\"]",
    "learningObjectives": [
      "Contrast mechanized digital schooling with human teachers and analyze poetic metaphor"
    ]
  },
  {
    "id": "cat_c9_eng_ch2",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "The Sound of Music & Wind",
    "topicsJson": "[\"Evelyn Glennie Percussionist Triumph\",\"Bismillah Khan Shehnai\",\"Subramania Bharati Wind Poem\",\"Passive Voice\"]",
    "topics": [
      "Evelyn Glennie Percussionist Triumph",
      "Bismillah Khan Shehnai",
      "Subramania Bharati Wind Poem",
      "Passive Voice"
    ],
    "learningObjectivesJson": "[\"Appreciate sensory compensation in disabilities and parse passive grammatical voice\"]",
    "learningObjectives": [
      "Appreciate sensory compensation in disabilities and parse passive grammatical voice"
    ]
  },
  {
    "id": "cat_c9_eng_ch3",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "The Little Girl & Rain on the Roof",
    "topicsJson": "[\"Katherine Mansfield Father-Daughter Story\",\"Coates Kinney Nostalgic Rain Verse\",\"Verbs of Reporting\"]",
    "topics": [
      "Katherine Mansfield Father-Daughter Story",
      "Coates Kinney Nostalgic Rain Verse",
      "Verbs of Reporting"
    ],
    "learningObjectivesJson": "[\"Examine childhood emotional vulnerabilities and identify reporting verbs\"]",
    "learningObjectives": [
      "Examine childhood emotional vulnerabilities and identify reporting verbs"
    ]
  },
  {
    "id": "cat_c9_eng_ch4",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "A Truly Beautiful Mind & The Lake Isle of Innisfree",
    "topicsJson": "[\"Albert Einstein Biography\",\"Pacifism and Special Relativity\",\"W.B. Yeats Peace Verse\",\"Participial Clauses\"]",
    "topics": [
      "Albert Einstein Biography",
      "Pacifism and Special Relativity",
      "W.B. Yeats Peace Verse",
      "Participial Clauses"
    ],
    "learningObjectivesJson": "[\"Connect scientific genius to social pacifism and parse participial clauses\"]",
    "learningObjectives": [
      "Connect scientific genius to social pacifism and parse participial clauses"
    ]
  },
  {
    "id": "cat_c9_eng_ch5",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "The Snake and the Mirror & A Legend of the Northland",
    "topicsJson": "[\"Vaikom Muhammad Basheer Comic Story\",\"Phoebe Cary Ballad on Greed\",\"Adverbial Modifiers\"]",
    "topics": [
      "Vaikom Muhammad Basheer Comic Story",
      "Phoebe Cary Ballad on Greed",
      "Adverbial Modifiers"
    ],
    "learningObjectivesJson": "[\"Read comic irony in regional translation and analyze ballad storytelling\"]",
    "learningObjectives": [
      "Read comic irony in regional translation and analyze ballad storytelling"
    ]
  },
  {
    "id": "cat_c9_eng_ch6",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "My Childhood & No Men Are Foreign",
    "topicsJson": "[\"A.P.J. Abdul Kalam Autobiographical Excerpt\",\"Communal Harmony in Rameswaram\",\"James Kirkup Universal Brotherhood Verse\",\"Relative Pronouns\"]",
    "topics": [
      "A.P.J. Abdul Kalam Autobiographical Excerpt",
      "Communal Harmony in Rameswaram",
      "James Kirkup Universal Brotherhood Verse",
      "Relative Pronouns"
    ],
    "learningObjectivesJson": "[\"Draw inspiration from Dr. Kalam's upbringing and appreciate global peace poetry\"]",
    "learningObjectives": [
      "Draw inspiration from Dr. Kalam's upbringing and appreciate global peace poetry"
    ]
  },
  {
    "id": "cat_c9_eng_ch7",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "Reach for the Top & On Killing a Tree",
    "topicsJson": "[\"Santosh Yadav Mountaineer & Maria Sharapova Tennis\",\"Gieve Patel Environmental Verse\",\"Prefixes & Suffixes\"]",
    "topics": [
      "Santosh Yadav Mountaineer & Maria Sharapova Tennis",
      "Gieve Patel Environmental Verse",
      "Prefixes & Suffixes"
    ],
    "learningObjectivesJson": "[\"Analyze resilience in female athletic icons and understand ecological destruction poetry\"]",
    "learningObjectives": [
      "Analyze resilience in female athletic icons and understand ecological destruction poetry"
    ]
  },
  {
    "id": "cat_c9_eng_ch8",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "Kathmandu & A Slumber Did My Spirit Seal",
    "topicsJson": "[\"Vikram Seth Travelogue (Pashupatinath & Baudhnath)\",\"William Wordsworth Lucy Poem\",\"Prepositional Idioms\"]",
    "topics": [
      "Vikram Seth Travelogue (Pashupatinath & Baudhnath)",
      "William Wordsworth Lucy Poem",
      "Prepositional Idioms"
    ],
    "learningObjectivesJson": "[\"Contrast serene Buddhist shrines with bustling temples and parse romantic elegy\"]",
    "learningObjectives": [
      "Contrast serene Buddhist shrines with bustling temples and parse romantic elegy"
    ]
  },
  {
    "id": "cat_c9_eng_ch9",
    "grade": "Class 9",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "If I Were You",
    "topicsJson": "[\"Douglas James Play\",\"Gerrard Wits Against an Intruder\",\"Dramatic Irony and Stagecraft\",\"Dialogue Delivery\"]",
    "topics": [
      "Douglas James Play",
      "Gerrard Wits Against an Intruder",
      "Dramatic Irony and Stagecraft",
      "Dialogue Delivery"
    ],
    "learningObjectivesJson": "[\"Analyze theatrical stagecraft, comedic dialogue pacing, and dramatic irony\"]",
    "learningObjectives": [
      "Analyze theatrical stagecraft, comedic dialogue pacing, and dramatic irony"
    ]
  },
  {
    "id": "cat_c10_math_ch1",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 1,
    "chapterTitle": "Real Numbers",
    "topicsJson": "[\"Fundamental Theorem of Arithmetic\",\"Prime Factorisation Method for HCF and LCM\",\"Proof of Irrationality: √2, √3, √5\",\"Revisiting Rational Numbers\"]",
    "topics": [
      "Fundamental Theorem of Arithmetic",
      "Prime Factorisation Method for HCF and LCM",
      "Proof of Irrationality: √2, √3, √5",
      "Revisiting Rational Numbers"
    ],
    "learningObjectivesJson": "[\"Prove irrationality of radical surds using contradiction method and apply unique prime factorization\"]",
    "learningObjectives": [
      "Prove irrationality of radical surds using contradiction method and apply unique prime factorization"
    ]
  },
  {
    "id": "cat_c10_math_ch2",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 2,
    "chapterTitle": "Polynomials",
    "topicsJson": "[\"Geometric Meaning of the Zeroes of a Polynomial\",\"Relationship between Zeroes and Coefficients of a Quadratic Polynomial: alpha + beta = -b/a, alpha x beta = c/a\",\"Cubic Polynomial Zero Relationships\"]",
    "topics": [
      "Geometric Meaning of the Zeroes of a Polynomial",
      "Relationship between Zeroes and Coefficients of a Quadratic Polynomial: alpha + beta = -b/a, alpha x beta = c/a",
      "Cubic Polynomial Zero Relationships"
    ],
    "learningObjectivesJson": "[\"Derive quadratic polynomials from zero sum/product and verify algebraic coefficients\"]",
    "learningObjectives": [
      "Derive quadratic polynomials from zero sum/product and verify algebraic coefficients"
    ]
  },
  {
    "id": "cat_c10_math_ch3",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 3,
    "chapterTitle": "Pair of Linear Equations in Two Variables",
    "topicsJson": "[\"Graphical Method of Solution & Consistency Conditions (a1/a2 != b1/b2, a1/a2 = b1/b2 = c1/c2, a1/a2 = b1/b2 != c1/c2)\",\"Algebraic Methods: Substitution Method, Elimination Method\",\"Real-World Contextual Word Problems (Fraction, Age, Speed, Currency)\"]",
    "topics": [
      "Graphical Method of Solution & Consistency Conditions (a1/a2 != b1/b2, a1/a2 = b1/b2 = c1/c2, a1/a2 = b1/b2 != c1/c2)",
      "Algebraic Methods: Substitution Method, Elimination Method",
      "Real-World Contextual Word Problems (Fraction, Age, Speed, Currency)"
    ],
    "learningObjectivesJson": "[\"Solve simultaneous bivariate linear systems algebraically and test graphical consistency\"]",
    "learningObjectives": [
      "Solve simultaneous bivariate linear systems algebraically and test graphical consistency"
    ]
  },
  {
    "id": "cat_c10_math_ch4",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 4,
    "chapterTitle": "Quadratic Equations",
    "topicsJson": "[\"Standard Form: ax^2 + bx + c = 0 (a != 0)\",\"Solution by Factorisation (Splitting the Middle Term)\",\"Solution by Quadratic Formula: x = [-b ± √(b^2-4ac)] / (2a)\",\"Nature of Roots via Discriminant D = b^2 - 4ac (D > 0, D = 0, D < 0)\",\"Contextual Speed-Time and Geometry Word Problems\"]",
    "topics": [
      "Standard Form: ax^2 + bx + c = 0 (a != 0)",
      "Solution by Factorisation (Splitting the Middle Term)",
      "Solution by Quadratic Formula: x = [-b ± √(b^2-4ac)] / (2a)",
      "Nature of Roots via Discriminant D = b^2 - 4ac (D > 0, D = 0, D < 0)",
      "Contextual Speed-Time and Geometry Word Problems"
    ],
    "learningObjectivesJson": "[\"Determine root existence using discriminant analysis and solve applied quadratic problems\"]",
    "learningObjectives": [
      "Determine root existence using discriminant analysis and solve applied quadratic problems"
    ]
  },
  {
    "id": "cat_c10_math_ch5",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 5,
    "chapterTitle": "Arithmetic Progressions",
    "topicsJson": "[\"General Form of AP: a, a+d, a+2d...\",\"n-th Term of an AP: a_n = a + (n-1)d\",\"Sum of First n Terms of an AP: S_n = n/2[2a + (n-1)d] = n/2[a + l]\",\"Real-Life AP Series Applications\"]",
    "topics": [
      "General Form of AP: a, a+d, a+2d...",
      "n-th Term of an AP: a_n = a + (n-1)d",
      "Sum of First n Terms of an AP: S_n = n/2[2a + (n-1)d] = n/2[a + l]",
      "Real-Life AP Series Applications"
    ],
    "learningObjectivesJson": "[\"Model discrete numeric progressions and compute cumulative series sums\"]",
    "learningObjectives": [
      "Model discrete numeric progressions and compute cumulative series sums"
    ]
  },
  {
    "id": "cat_c10_math_ch6",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 6,
    "chapterTitle": "Triangles",
    "topicsJson": "[\"Similar Figures vs Congruent Figures\",\"Basic Proportionality Theorem (Thales' Theorem) and its Converse\",\"Criteria for Similarity of Triangles: AAA (AA), SSS, SAS\",\"Multi-Step Similarity Proofs and Applications\"]",
    "topics": [
      "Similar Figures vs Congruent Figures",
      "Basic Proportionality Theorem (Thales' Theorem) and its Converse",
      "Criteria for Similarity of Triangles: AAA (AA), SSS, SAS",
      "Multi-Step Similarity Proofs and Applications"
    ],
    "learningObjectivesJson": "[\"Execute rigorous deductive proofs using Basic Proportionality and triangle similarity criteria\"]",
    "learningObjectives": [
      "Execute rigorous deductive proofs using Basic Proportionality and triangle similarity criteria"
    ]
  },
  {
    "id": "cat_c10_math_ch7",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 7,
    "chapterTitle": "Coordinate Geometry",
    "topicsJson": "[\"Distance Formula: d = √[(x2-x1)^2 + (y2-y1)^2]\",\"Section Formula (Internal Division): ((m1x2 + m2x1)/(m1+m2), (m1y2 + m2y1)/(m1+m2))\",\"Mid-point Formula: ((x1+x2)/2, (y1+y2)/2)\",\"Collinearity of Points\"]",
    "topics": [
      "Distance Formula: d = √[(x2-x1)^2 + (y2-y1)^2]",
      "Section Formula (Internal Division): ((m1x2 + m2x1)/(m1+m2), (m1y2 + m2y1)/(m1+m2))",
      "Mid-point Formula: ((x1+x2)/2, (y1+y2)/2)",
      "Collinearity of Points"
    ],
    "learningObjectivesJson": "[\"Compute spatial line segment lengths and section coordinate division ratios\"]",
    "learningObjectives": [
      "Compute spatial line segment lengths and section coordinate division ratios"
    ]
  },
  {
    "id": "cat_c10_math_ch8",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 8,
    "chapterTitle": "Introduction to Trigonometry",
    "topicsJson": "[\"Trigonometric Ratios (sin, cos, tan, cot, sec, cosec) of Acute Angles\",\"Trigonometric Ratios of Specific Angles: 0°, 30°, 45°, 60°, 90°\",\"Fundamental Trigonometric Identities: sin^2(theta) + cos^2(theta) = 1, 1 + tan^2(theta) = sec^2(theta), 1 + cot^2(theta) = cosec^2(theta)\",\"Proving Trigonometric Identities\"]",
    "topics": [
      "Trigonometric Ratios (sin, cos, tan, cot, sec, cosec) of Acute Angles",
      "Trigonometric Ratios of Specific Angles: 0°, 30°, 45°, 60°, 90°",
      "Fundamental Trigonometric Identities: sin^2(theta) + cos^2(theta) = 1, 1 + tan^2(theta) = sec^2(theta), 1 + cot^2(theta) = cosec^2(theta)",
      "Proving Trigonometric Identities"
    ],
    "learningObjectivesJson": "[\"Derive exact trigonometric table values and prove complex trigonometric identity proofs\"]",
    "learningObjectives": [
      "Derive exact trigonometric table values and prove complex trigonometric identity proofs"
    ]
  },
  {
    "id": "cat_c10_math_ch9",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 9,
    "chapterTitle": "Some Applications of Trigonometry",
    "topicsJson": "[\"Line of Sight\",\"Angle of Elevation and Angle of Depression\",\"Solving Heights and Distances Problems Using Trigonometric Ratios\",\"Multi-Triangle Word Problems (Single and Double Observation Points)\"]",
    "topics": [
      "Line of Sight",
      "Angle of Elevation and Angle of Depression",
      "Solving Heights and Distances Problems Using Trigonometric Ratios",
      "Multi-Triangle Word Problems (Single and Double Observation Points)"
    ],
    "learningObjectivesJson": "[\"Model structural heights, navigation distances, and line-of-sight elevation angles\"]",
    "learningObjectives": [
      "Model structural heights, navigation distances, and line-of-sight elevation angles"
    ]
  },
  {
    "id": "cat_c10_math_ch10",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 10,
    "chapterTitle": "Circles",
    "topicsJson": "[\"Tangent to a Circle at Point of Contact\",\"Theorem: Tangent is Perpendicular to Radius at Point of Contact\",\"Theorem: Lengths of Tangents Drawn from an External Point to a Circle are Equal\",\"Proofs and Applications to Inscribed Polygons\"]",
    "topics": [
      "Tangent to a Circle at Point of Contact",
      "Theorem: Tangent is Perpendicular to Radius at Point of Contact",
      "Theorem: Lengths of Tangents Drawn from an External Point to a Circle are Equal",
      "Proofs and Applications to Inscribed Polygons"
    ],
    "learningObjectivesJson": "[\"Prove tangent perpendicularity and external tangent equality theorems\"]",
    "learningObjectives": [
      "Prove tangent perpendicularity and external tangent equality theorems"
    ]
  },
  {
    "id": "cat_c10_math_ch11",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 11,
    "chapterTitle": "Areas Related to Circles",
    "topicsJson": "[\"Area of Sector of a Circle: (theta/360) x pi x r^2\",\"Length of an Arc of a Sector: (theta/360) x 2 x pi x r\",\"Area of Segment of a Circle (Major and Minor)\",\"Areas of Combinations of Plane Figures (Circles, Triangles, Rectangles)\"]",
    "topics": [
      "Area of Sector of a Circle: (theta/360) x pi x r^2",
      "Length of an Arc of a Sector: (theta/360) x 2 x pi x r",
      "Area of Segment of a Circle (Major and Minor)",
      "Areas of Combinations of Plane Figures (Circles, Triangles, Rectangles)"
    ],
    "learningObjectivesJson": "[\"Calculate sector and segment areas in complex composite geometric designs\"]",
    "learningObjectives": [
      "Calculate sector and segment areas in complex composite geometric designs"
    ]
  },
  {
    "id": "cat_c10_math_ch12",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 12,
    "chapterTitle": "Surface Areas and Volumes",
    "topicsJson": "[\"Surface Area of Combinations of Solids (Cubes, Cuboids, Spheres, Hemispheres, Right Circular Cylinders, Cones)\",\"Volume of Combinations of Solids\",\"Internal and External Capacity Calculations\"]",
    "topics": [
      "Surface Area of Combinations of Solids (Cubes, Cuboids, Spheres, Hemispheres, Right Circular Cylinders, Cones)",
      "Volume of Combinations of Solids",
      "Internal and External Capacity Calculations"
    ],
    "learningObjectivesJson": "[\"Compute total surface area and capacity of composite engineering solids\"]",
    "learningObjectives": [
      "Compute total surface area and capacity of composite engineering solids"
    ]
  },
  {
    "id": "cat_c10_math_ch13",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 13,
    "chapterTitle": "Statistics",
    "topicsJson": "[\"Mean of Grouped Data (Direct Method, Assumed Mean Method, Step-Deviation Method)\",\"Mode of Grouped Data: l + [(f1-f0)/(2f1-f0-f2)] x h\",\"Median of Grouped Data: l + [(n/2 - cf)/f] x h\",\"Empirical Relationship: 3 Median = Mode + 2 Mean\"]",
    "topics": [
      "Mean of Grouped Data (Direct Method, Assumed Mean Method, Step-Deviation Method)",
      "Mode of Grouped Data: l + [(f1-f0)/(2f1-f0-f2)] x h",
      "Median of Grouped Data: l + [(n/2 - cf)/f] x h",
      "Empirical Relationship: 3 Median = Mode + 2 Mean"
    ],
    "learningObjectivesJson": "[\"Calculate mean, mode, and median from grouped continuous frequency distributions\"]",
    "learningObjectives": [
      "Calculate mean, mode, and median from grouped continuous frequency distributions"
    ]
  },
  {
    "id": "cat_c10_math_ch14",
    "grade": "Class 10",
    "subject": "Mathematics",
    "chapterNumber": 14,
    "chapterTitle": "Probability",
    "topicsJson": "[\"Classical Definition of Probability: P(E) = n(E) / n(S)\",\"Elementary Events & Sure / Impossible Events\",\"Complementary Events: P(E) + P(not E) = 1\",\"Probability Experiments: Tossing Coins, Rolling Dice, Drawing from Deck of 52 Cards\"]",
    "topics": [
      "Classical Definition of Probability: P(E) = n(E) / n(S)",
      "Elementary Events & Sure / Impossible Events",
      "Complementary Events: P(E) + P(not E) = 1",
      "Probability Experiments: Tossing Coins, Rolling Dice, Drawing from Deck of 52 Cards"
    ],
    "learningObjectivesJson": "[\"Compute theoretical probabilities for card draws, dice rolls, and composite sample spaces\"]",
    "learningObjectives": [
      "Compute theoretical probabilities for card draws, dice rolls, and composite sample spaces"
    ]
  },
  {
    "id": "cat_c10_sci_ch1",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 1,
    "chapterTitle": "Chemical Reactions and Equations",
    "topicsJson": "[\"Chemical Equations & Law of Conservation of Mass\",\"Balancing Chemical Equations by Hit-and-Trial\",\"Types of Chemical Reactions: Combination, Decomposition (Thermal, Electrolytic, Photolytic), Displacement, Double Displacement (Precipitation)\",\"Oxidation and Reduction (Redox Reactions)\",\"Corrosion of Metals and Rancidity of Oils\"]",
    "topics": [
      "Chemical Equations & Law of Conservation of Mass",
      "Balancing Chemical Equations by Hit-and-Trial",
      "Types of Chemical Reactions: Combination, Decomposition (Thermal, Electrolytic, Photolytic), Displacement, Double Displacement (Precipitation)",
      "Oxidation and Reduction (Redox Reactions)",
      "Corrosion of Metals and Rancidity of Oils"
    ],
    "learningObjectivesJson": "[\"Balance stoichiometric equations and identify oxidizing/reducing agents in redox reactions\"]",
    "learningObjectives": [
      "Balance stoichiometric equations and identify oxidizing/reducing agents in redox reactions"
    ]
  },
  {
    "id": "cat_c10_sci_ch2",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 2,
    "chapterTitle": "Acids, Bases and Salts",
    "topicsJson": "[\"Chemical Properties of Acids and Bases (Reaction with Metals, Carbonates, Bases)\",\"Neutralisation Reaction\",\"pH Scale (0 to 14) and Hydrogen Ion Concentration\",\"Importance of pH in Daily Life (Soil, Digestion, Tooth Decay, Self-Defense)\",\"Common Salts: Sodium Hydroxide (Chlor-Alkali Process), Bleaching Powder (CaOCl2), Baking Soda (NaHCO3), Washing Soda (Na2CO3.10H2O), Plaster of Paris (CaSO4.1/2H2O)\",\"Water of Crystallisation\"]",
    "topics": [
      "Chemical Properties of Acids and Bases (Reaction with Metals, Carbonates, Bases)",
      "Neutralisation Reaction",
      "pH Scale (0 to 14) and Hydrogen Ion Concentration",
      "Importance of pH in Daily Life (Soil, Digestion, Tooth Decay, Self-Defense)",
      "Common Salts: Sodium Hydroxide (Chlor-Alkali Process), Bleaching Powder (CaOCl2), Baking Soda (NaHCO3), Washing Soda (Na2CO3.10H2O), Plaster of Paris (CaSO4.1/2H2O)",
      "Water of Crystallisation"
    ],
    "learningObjectivesJson": "[\"Explain industrial Chlor-Alkali synthesis and calculate pH-dependent reactions\"]",
    "learningObjectives": [
      "Explain industrial Chlor-Alkali synthesis and calculate pH-dependent reactions"
    ]
  },
  {
    "id": "cat_c10_sci_ch3",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 3,
    "chapterTitle": "Metals and Non-metals",
    "topicsJson": "[\"Physical Properties of Metals vs Non-metals\",\"Chemical Properties of Metals (Reaction with Oxygen, Water, Acids)\",\"Reactivity Series of Metals\",\"Formation and Properties of Ionic Compounds (Electron Transfer, Lattice Structure, High Melting Point, Conductivity)\",\"Occurrence of Metals & Metallurgy (Concentration, Roasting, Calcination, Reduction by Carbon/Aluminum, Electrolytic Refining)\",\"Corrosion Prevention & Alloys (Steel, Brass, Bronze, Solder, Amalgam)\"]",
    "topics": [
      "Physical Properties of Metals vs Non-metals",
      "Chemical Properties of Metals (Reaction with Oxygen, Water, Acids)",
      "Reactivity Series of Metals",
      "Formation and Properties of Ionic Compounds (Electron Transfer, Lattice Structure, High Melting Point, Conductivity)",
      "Occurrence of Metals & Metallurgy (Concentration, Roasting, Calcination, Reduction by Carbon/Aluminum, Electrolytic Refining)",
      "Corrosion Prevention & Alloys (Steel, Brass, Bronze, Solder, Amalgam)"
    ],
    "learningObjectivesJson": "[\"Draw Lewis electron-dot ionic structures and describe metallurgical extraction stages\"]",
    "learningObjectives": [
      "Draw Lewis electron-dot ionic structures and describe metallurgical extraction stages"
    ]
  },
  {
    "id": "cat_c10_sci_ch4",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 4,
    "chapterTitle": "Carbon and its Compounds",
    "topicsJson": "[\"Covalent Bonding in Carbon (Tetravalency, Catenation)\",\"Allotropes of Carbon (Diamond, Graphite, Fullerenes)\",\"Versatile Nature of Carbon\",\"Saturated vs Unsaturated Hydrocarbons (Alkanes, Alkenes, Alkynes)\",\"Homologous Series & Nomenclature of Functional Groups (Halo-, Alcohol, Aldehyde, Ketone, Carboxylic Acid)\",\"Chemical Properties: Combustion, Oxidation, Addition, Substitution\",\"Ethanol and Ethanoic Acid Properties (Esterification, Saponification)\",\"Soaps and Detergents (Micelle Formation, Cleansing Action in Hard Water)\"]",
    "topics": [
      "Covalent Bonding in Carbon (Tetravalency, Catenation)",
      "Allotropes of Carbon (Diamond, Graphite, Fullerenes)",
      "Versatile Nature of Carbon",
      "Saturated vs Unsaturated Hydrocarbons (Alkanes, Alkenes, Alkynes)",
      "Homologous Series & Nomenclature of Functional Groups (Halo-, Alcohol, Aldehyde, Ketone, Carboxylic Acid)",
      "Chemical Properties: Combustion, Oxidation, Addition, Substitution",
      "Ethanol and Ethanoic Acid Properties (Esterification, Saponification)",
      "Soaps and Detergents (Micelle Formation, Cleansing Action in Hard Water)"
    ],
    "learningObjectivesJson": "[\"Name IUPAC organic structures and explain micellar cleansing mechanics\"]",
    "learningObjectives": [
      "Name IUPAC organic structures and explain micellar cleansing mechanics"
    ]
  },
  {
    "id": "cat_c10_sci_ch5",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 5,
    "chapterTitle": "Life Processes",
    "topicsJson": "[\"Autotrophic Nutrition: Photosynthesis Biochemistry, Chloroplasts, Stomatal Opening\",\"Heterotrophic Nutrition: Human Alimentary Canal Anatomy & Digestive Enzymes\",\"Respiration: Aerobic vs Anaerobic Breakdown of Glucose (Glycolysis, Krebs Cycle), Human Respiratory System (Alveoli Exchange)\",\"Transportation in Humans: Heart Structure, Double Circulation, Blood Pressure, Lymph\",\"Transportation in Plants: Xylem (Transpiration Pull), Phloem (Translocation)\",\"Excretion: Structure of Nephron, Urine Formation (Filtration, Reabsorption, Secretion), Dialysis (Artificial Kidney)\"]",
    "topics": [
      "Autotrophic Nutrition: Photosynthesis Biochemistry, Chloroplasts, Stomatal Opening",
      "Heterotrophic Nutrition: Human Alimentary Canal Anatomy & Digestive Enzymes",
      "Respiration: Aerobic vs Anaerobic Breakdown of Glucose (Glycolysis, Krebs Cycle), Human Respiratory System (Alveoli Exchange)",
      "Transportation in Humans: Heart Structure, Double Circulation, Blood Pressure, Lymph",
      "Transportation in Plants: Xylem (Transpiration Pull), Phloem (Translocation)",
      "Excretion: Structure of Nephron, Urine Formation (Filtration, Reabsorption, Secretion), Dialysis (Artificial Kidney)"
    ],
    "learningObjectivesJson": "[\"Diagram double circulatory blood flow and trace nephron filtration stages\"]",
    "learningObjectives": [
      "Diagram double circulatory blood flow and trace nephron filtration stages"
    ]
  },
  {
    "id": "cat_c10_sci_ch6",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 6,
    "chapterTitle": "Control and Coordination",
    "topicsJson": "[\"Human Nervous System: Neuron Anatomy, Synaptic Transmission, Reflex Arc\",\"Human Brain Anatomy: Forebrain, Midbrain, Hindbrain (Cerebrum, Cerebellum, Medulla, Pons)\",\"Coordination in Plants: Nastic Movements vs Tropic Movements (Phototropism, Geotropism, Hydrotropism, Thigmotropism)\",\"Plant Hormones (Auxin, Gibberellin, Cytokinin, Abscisic Acid)\",\"Hormones in Animals: Endocrine Glands (Pituitary, Thyroid, Pancreas, Adrenal, Testis, Ovary), Feedback Mechanism of Insulin\"]",
    "topics": [
      "Human Nervous System: Neuron Anatomy, Synaptic Transmission, Reflex Arc",
      "Human Brain Anatomy: Forebrain, Midbrain, Hindbrain (Cerebrum, Cerebellum, Medulla, Pons)",
      "Coordination in Plants: Nastic Movements vs Tropic Movements (Phototropism, Geotropism, Hydrotropism, Thigmotropism)",
      "Plant Hormones (Auxin, Gibberellin, Cytokinin, Abscisic Acid)",
      "Hormones in Animals: Endocrine Glands (Pituitary, Thyroid, Pancreas, Adrenal, Testis, Ovary), Feedback Mechanism of Insulin"
    ],
    "learningObjectivesJson": "[\"Differentiate reflex arcs from voluntary actions and analyze hormonal feedback loops\"]",
    "learningObjectives": [
      "Differentiate reflex arcs from voluntary actions and analyze hormonal feedback loops"
    ]
  },
  {
    "id": "cat_c10_sci_ch7",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 7,
    "chapterTitle": "How do Organisms Reproduce?",
    "topicsJson": "[\"Asexual Reproduction Modes: Binary/Multiple Fission, Budding, Spore Formation, Fragmentation, Regeneration, Vegetative Propagation, Tissue Culture\",\"Sexual Reproduction in Flowering Plants: Flower Anatomy, Pollination, Fertilisation, Seed Formation\",\"Reproduction in Human Beings: Male Reproductive System (Testes, Vas Deferens), Female Reproductive System (Ovaries, Fallopian Tube, Uterus)\",\"Menstrual Cycle & Fertilisation\",\"Reproductive Health: Contraceptive Methods (Barrier, Chemical, Surgical), Sexually Transmitted Infections (STIs: HIV/AIDS, Gonorrhea)\"]",
    "topics": [
      "Asexual Reproduction Modes: Binary/Multiple Fission, Budding, Spore Formation, Fragmentation, Regeneration, Vegetative Propagation, Tissue Culture",
      "Sexual Reproduction in Flowering Plants: Flower Anatomy, Pollination, Fertilisation, Seed Formation",
      "Reproduction in Human Beings: Male Reproductive System (Testes, Vas Deferens), Female Reproductive System (Ovaries, Fallopian Tube, Uterus)",
      "Menstrual Cycle & Fertilisation",
      "Reproductive Health: Contraceptive Methods (Barrier, Chemical, Surgical), Sexually Transmitted Infections (STIs: HIV/AIDS, Gonorrhea)"
    ],
    "learningObjectivesJson": "[\"Trace double fertilisation in angiosperms and compare human contraception mechanisms\"]",
    "learningObjectives": [
      "Trace double fertilisation in angiosperms and compare human contraception mechanisms"
    ]
  },
  {
    "id": "cat_c10_sci_ch8",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 8,
    "chapterTitle": "Heredity",
    "topicsJson": "[\"Accumulation of Variation during Reproduction\",\"Mendel's Laws of Inheritance: Law of Dominance, Law of Segregation, Law of Independent Assortment\",\"Monohybrid Cross (3:1 Phenotypic, 1:2:1 Genotypic Ratio)\",\"Dihybrid Cross (9:3:3:1 Phenotypic Ratio)\",\"Sex Determination in Human Beings (XX Female, XY Male)\"]",
    "topics": [
      "Accumulation of Variation during Reproduction",
      "Mendel's Laws of Inheritance: Law of Dominance, Law of Segregation, Law of Independent Assortment",
      "Monohybrid Cross (3:1 Phenotypic, 1:2:1 Genotypic Ratio)",
      "Dihybrid Cross (9:3:3:1 Phenotypic Ratio)",
      "Sex Determination in Human Beings (XX Female, XY Male)"
    ],
    "learningObjectivesJson": "[\"Construct Punnett squares for monohybrid/dihybrid crosses and prove 50:50 sex probability\"]",
    "learningObjectives": [
      "Construct Punnett squares for monohybrid/dihybrid crosses and prove 50:50 sex probability"
    ]
  },
  {
    "id": "cat_c10_sci_ch9",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 9,
    "chapterTitle": "Light – Reflection and Refraction",
    "topicsJson": "[\"Spherical Mirrors: Concave and Convex Mirrors, Focus, Center of Curvature\",\"Ray Diagrams for Concave and Convex Mirrors\",\"Mirror Formula: 1/v + 1/u = 1/f & Magnification: m = -v/u\",\"Refraction of Light: Laws of Refraction, Snell's Law (sin i / sin r = constant)\",\"Refractive Index (Absolute and Relative)\",\"Spherical Lenses: Convex and Concave Lenses, Ray Diagrams\",\"Lens Formula: 1/v - 1/u = 1/f & Magnification: m = v/u\",\"Power of a Lens: P = 1/f (in Dioptres)\"]",
    "topics": [
      "Spherical Mirrors: Concave and Convex Mirrors, Focus, Center of Curvature",
      "Ray Diagrams for Concave and Convex Mirrors",
      "Mirror Formula: 1/v + 1/u = 1/f & Magnification: m = -v/u",
      "Refraction of Light: Laws of Refraction, Snell's Law (sin i / sin r = constant)",
      "Refractive Index (Absolute and Relative)",
      "Spherical Lenses: Convex and Concave Lenses, Ray Diagrams",
      "Lens Formula: 1/v - 1/u = 1/f & Magnification: m = v/u",
      "Power of a Lens: P = 1/f (in Dioptres)"
    ],
    "learningObjectivesJson": "[\"Calculate image positions, sizes, and lens dioptric power using sign conventions\"]",
    "learningObjectives": [
      "Calculate image positions, sizes, and lens dioptric power using sign conventions"
    ]
  },
  {
    "id": "cat_c10_sci_ch10",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 10,
    "chapterTitle": "The Human Eye and the Colourful World",
    "topicsJson": "[\"Anatomy of Human Eye: Cornea, Iris, Pupil, Crystalline Lens, Ciliary Muscles, Retina\",\"Power of Accommodation\",\"Defects of Vision and Corrections: Myopia (Concave Lens), Hypermetropia (Convex Lens), Presbyopia (Bifocal Lens)\",\"Refraction through a Glass Prism: Angle of Deviation\",\"Dispersion of White Light: VIBGYOR Spectrum & Natural Rainbow Formation\",\"Atmospheric Refraction: Twinkling of Stars, Advanced Sunrise & Delayed Sunset\",\"Scattering of Light: Tyndall Effect, Blue Sky Color, Reddish Sun at Sunrise/Sunset\"]",
    "topics": [
      "Anatomy of Human Eye: Cornea, Iris, Pupil, Crystalline Lens, Ciliary Muscles, Retina",
      "Power of Accommodation",
      "Defects of Vision and Corrections: Myopia (Concave Lens), Hypermetropia (Convex Lens), Presbyopia (Bifocal Lens)",
      "Refraction through a Glass Prism: Angle of Deviation",
      "Dispersion of White Light: VIBGYOR Spectrum & Natural Rainbow Formation",
      "Atmospheric Refraction: Twinkling of Stars, Advanced Sunrise & Delayed Sunset",
      "Scattering of Light: Tyndall Effect, Blue Sky Color, Reddish Sun at Sunrise/Sunset"
    ],
    "learningObjectivesJson": "[\"Prescribe corrective focal lengths for vision defects and explain optical atmospheric phenomena\"]",
    "learningObjectives": [
      "Prescribe corrective focal lengths for vision defects and explain optical atmospheric phenomena"
    ]
  },
  {
    "id": "cat_c10_sci_ch11",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 11,
    "chapterTitle": "Electricity",
    "topicsJson": "[\"Electric Current: I = Q / t (Amperes) & Electric Potential Difference: V = W / Q (Volts)\",\"Circuit Diagrams and Component Symbols\",\"Ohm's Law: V = IR & Verification\",\"Resistance, Factors Affecting Resistance: R = rho x (l / A)\",\"Resistivity (rho)\",\"Resistors in Series: R_eq = R1 + R2 + R3\",\"Resistors in Parallel: 1/R_eq = 1/R1 + 1/R2 + 1/R3\",\"Heating Effect of Electric Current: Joule's Law H = I^2 x R x t\",\"Electric Power: P = VI = I^2R = V^2/R (Watts) & Commercial Billing (1 kWh = 3.6 x 10^6 J)\"]",
    "topics": [
      "Electric Current: I = Q / t (Amperes) & Electric Potential Difference: V = W / Q (Volts)",
      "Circuit Diagrams and Component Symbols",
      "Ohm's Law: V = IR & Verification",
      "Resistance, Factors Affecting Resistance: R = rho x (l / A)",
      "Resistivity (rho)",
      "Resistors in Series: R_eq = R1 + R2 + R3",
      "Resistors in Parallel: 1/R_eq = 1/R1 + 1/R2 + 1/R3",
      "Heating Effect of Electric Current: Joule's Law H = I^2 x R x t",
      "Electric Power: P = VI = I^2R = V^2/R (Watts) & Commercial Billing (1 kWh = 3.6 x 10^6 J)"
    ],
    "learningObjectivesJson": "[\"Solve complex series-parallel equivalent resistance networks and compute commercial kilowatt-hour bills\"]",
    "learningObjectives": [
      "Solve complex series-parallel equivalent resistance networks and compute commercial kilowatt-hour bills"
    ]
  },
  {
    "id": "cat_c10_sci_ch12",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 12,
    "chapterTitle": "Magnetic Effects of Electric Current",
    "topicsJson": "[\"Magnetic Field and Field Lines Properties\",\"Magnetic Field due to Current-Carrying Straight Conductor (Right-Hand Thumb Rule)\",\"Magnetic Field due to Circular Loop and Solenoid\",\"Force on Current-Carrying Conductor in Magnetic Field & Fleming's Left-Hand Rule\",\"Electric Motor Working Principle\",\"Electromagnetic Induction: Faraday's Experiment & Fleming's Right-Hand Rule\",\"Domestic Electric Circuits: Live, Neutral, Earth Wires, Overloading, Short-Circuiting, Electric Fuse\"]",
    "topics": [
      "Magnetic Field and Field Lines Properties",
      "Magnetic Field due to Current-Carrying Straight Conductor (Right-Hand Thumb Rule)",
      "Magnetic Field due to Circular Loop and Solenoid",
      "Force on Current-Carrying Conductor in Magnetic Field & Fleming's Left-Hand Rule",
      "Electric Motor Working Principle",
      "Electromagnetic Induction: Faraday's Experiment & Fleming's Right-Hand Rule",
      "Domestic Electric Circuits: Live, Neutral, Earth Wires, Overloading, Short-Circuiting, Electric Fuse"
    ],
    "learningObjectivesJson": "[\"Apply Fleming's Left-Hand Rule to determine magnetic force vectors and safety grounding\"]",
    "learningObjectives": [
      "Apply Fleming's Left-Hand Rule to determine magnetic force vectors and safety grounding"
    ]
  },
  {
    "id": "cat_c10_sci_ch13",
    "grade": "Class 10",
    "subject": "Science",
    "chapterNumber": 13,
    "chapterTitle": "Our Environment",
    "topicsJson": "[\"Ecosystem Components: Biotic (Producers, Consumers, Decomposers) and Abiotic\",\"Food Chains and Food Webs\",\"Trophic Levels & Lindeman's 10% Energy Transfer Law\",\"Biological Magnification of Non-Biodegradable Pesticides (DDT)\",\"Environmental Problems: Ozone Layer Depletion (CFCs, Montreal Protocol) & Managing Municipal Garbage (Biodegradable vs Non-Biodegradable Waste)\"]",
    "topics": [
      "Ecosystem Components: Biotic (Producers, Consumers, Decomposers) and Abiotic",
      "Food Chains and Food Webs",
      "Trophic Levels & Lindeman's 10% Energy Transfer Law",
      "Biological Magnification of Non-Biodegradable Pesticides (DDT)",
      "Environmental Problems: Ozone Layer Depletion (CFCs, Montreal Protocol) & Managing Municipal Garbage (Biodegradable vs Non-Biodegradable Waste)"
    ],
    "learningObjectivesJson": "[\"Calculate trophic energy transfers using the 10% law and model biomagnification\"]",
    "learningObjectives": [
      "Calculate trophic energy transfers using the 10% law and model biomagnification"
    ]
  },
  {
    "id": "cat_c10_soc_hist_ch1",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "History: The Rise of Nationalism in Europe",
    "topicsJson": "[\"Frédéric Sorrieu's Utopian Vision\",\"The French Revolution & Idea of the Nation\",\"Napoleonic Code (Civil Code 1804)\",\"The Making of Nationalism in Europe (Liberal Nationalism, Zollverein)\",\"The Age of Revolutions: 1830-1848\",\"Unification of Germany (Otto von Bismarck) & Italy (Cavour, Garibaldi, Mazzini)\",\"Visualising the Nation (Marianne and Germania)\",\"Nationalism and Imperialism (Balkan Powder Keg)\"]",
    "topics": [
      "Frédéric Sorrieu's Utopian Vision",
      "The French Revolution & Idea of the Nation",
      "Napoleonic Code (Civil Code 1804)",
      "The Making of Nationalism in Europe (Liberal Nationalism, Zollverein)",
      "The Age of Revolutions: 1830-1848",
      "Unification of Germany (Otto von Bismarck) & Italy (Cavour, Garibaldi, Mazzini)",
      "Visualising the Nation (Marianne and Germania)",
      "Nationalism and Imperialism (Balkan Powder Keg)"
    ],
    "learningObjectivesJson": "[\"Trace European nation-state unification campaigns and imperialist rivalries\"]",
    "learningObjectives": [
      "Trace European nation-state unification campaigns and imperialist rivalries"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c10_soc_hist_ch2",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "History: Nationalism in India",
    "topicsJson": "[\"First World War, Khilafat and Non-Cooperation Movements\",\"Differing Strands within the Movement (Cities, Countryside: Awadh Peasants, Tribals: Alluri Sitaram Raju, Plantations)\",\"Towards Civil Disobedience: Simon Commission, Purna Swaraj (1929)\",\"The Salt March and Civil Disobedience Movement\",\"How Participants Saw the Movement (Rich Peasants, Poor Peasants, Business Class, Workers, Women)\",\"The Sense of Collective Belonging (Bharat Mata, Folklore, Reinterpretation of History)\"]",
    "topics": [
      "First World War, Khilafat and Non-Cooperation Movements",
      "Differing Strands within the Movement (Cities, Countryside: Awadh Peasants, Tribals: Alluri Sitaram Raju, Plantations)",
      "Towards Civil Disobedience: Simon Commission, Purna Swaraj (1929)",
      "The Salt March and Civil Disobedience Movement",
      "How Participants Saw the Movement (Rich Peasants, Poor Peasants, Business Class, Workers, Women)",
      "The Sense of Collective Belonging (Bharat Mata, Folklore, Reinterpretation of History)"
    ],
    "learningObjectivesJson": "[\"Analyze phases of non-violent civil disobedience and collective national consciousness\"]",
    "learningObjectives": [
      "Analyze phases of non-violent civil disobedience and collective national consciousness"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c10_soc_hist_ch3",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "History: The Making of a Global World",
    "topicsJson": "[\"The Pre-modern World (Silk Routes, Food Travels: Potato/Spaghetti, Conquest, Disease and Trade: Smallpox)\",\"The Nineteenth Century (1815-1914): Global Agricultural Economy, Indentured Labour Migration\",\"The Inter-war Economy: Wartime Transformations, Mass Production (Henry Ford), The Great Depression (1929)\",\"Rebuilding a World Economy: Post-war Settlement, Bretton Woods Institutions (IMF and World Bank)\"]",
    "topics": [
      "The Pre-modern World (Silk Routes, Food Travels: Potato/Spaghetti, Conquest, Disease and Trade: Smallpox)",
      "The Nineteenth Century (1815-1914): Global Agricultural Economy, Indentured Labour Migration",
      "The Inter-war Economy: Wartime Transformations, Mass Production (Henry Ford), The Great Depression (1929)",
      "Rebuilding a World Economy: Post-war Settlement, Bretton Woods Institutions (IMF and World Bank)"
    ],
    "learningObjectivesJson": "[\"Examine pre-modern global exchange routes and post-war Bretton Woods institutions\"]",
    "learningObjectives": [
      "Examine pre-modern global exchange routes and post-war Bretton Woods institutions"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c10_soc_hist_ch4",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "History: The Age of Industrialisation",
    "topicsJson": "[\"Before the Industrial Revolution (Proto-industrialisation)\",\"Hand Labour and Steam Power (Why Hand Labour Persisted)\",\"Industrialisation in the Colonies (An Age of Indian Textiles, East India Company Gomasthas, Weavers' Plight)\",\"Factories Come Up (Pioneering Indian Entrepreneurs)\",\"Market for Goods (Advertisements, Calendars, Gripping Imagery)\"]",
    "topics": [
      "Before the Industrial Revolution (Proto-industrialisation)",
      "Hand Labour and Steam Power (Why Hand Labour Persisted)",
      "Industrialisation in the Colonies (An Age of Indian Textiles, East India Company Gomasthas, Weavers' Plight)",
      "Factories Come Up (Pioneering Indian Entrepreneurs)",
      "Market for Goods (Advertisements, Calendars, Gripping Imagery)"
    ],
    "learningObjectivesJson": "[\"Evaluate proto-industrial dynamics and colonial displacement of Indian handloom weavers\"]",
    "learningObjectives": [
      "Evaluate proto-industrial dynamics and colonial displacement of Indian handloom weavers"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c10_soc_hist_ch5",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "History: Print Culture and the Modern World",
    "topicsJson": "[\"The First Printed Books (China, Japan, Korea: Woodblock Printing)\",\"Print Comes to Europe (Gutenberg's Movable Type Printing Press)\",\"The Print Revolution and Its Impact (Reading Mania, Religious Reformers: Martin Luther 95 Theses)\",\"The French Revolution and Print Culture\",\"The Nineteenth Century: Children, Women, Workers Reading\",\"India and the World of Print: Manuscripts, Print in Vernaculars, Religious Reform and Public Debates, Women and Print, Print and Censorship (Vernacular Press Act 1878)\"]",
    "topics": [
      "The First Printed Books (China, Japan, Korea: Woodblock Printing)",
      "Print Comes to Europe (Gutenberg's Movable Type Printing Press)",
      "The Print Revolution and Its Impact (Reading Mania, Religious Reformers: Martin Luther 95 Theses)",
      "The French Revolution and Print Culture",
      "The Nineteenth Century: Children, Women, Workers Reading",
      "India and the World of Print: Manuscripts, Print in Vernaculars, Religious Reform and Public Debates, Women and Print, Print and Censorship (Vernacular Press Act 1878)"
    ],
    "learningObjectivesJson": "[\"Trace how print democratized religious debate, stimulated revolutions, and energized anti-colonial nationalism\"]",
    "learningObjectives": [
      "Trace how print democratized religious debate, stimulated revolutions, and energized anti-colonial nationalism"
    ],
    "subSubject": "History"
  },
  {
    "id": "cat_c10_soc_geo_ch1",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Geography: Resources and Development",
    "topicsJson": "[\"Classification of Resources (Origin, Exhaustibility, Ownership, Status of Development)\",\"Development of Resources & Rio de Janeiro Earth Summit 1992 (Agenda 21)\",\"Resource Planning in India\",\"Land Resources & Land Use Patterns in India\",\"Land Degradation & Conservation Measures\",\"Soil as a Resource: Classification of Soils (Alluvial, Black, Red and Yellow, Laterite, Arid, Forest Soils)\",\"Soil Erosion and Soil Conservation\"]",
    "topics": [
      "Classification of Resources (Origin, Exhaustibility, Ownership, Status of Development)",
      "Development of Resources & Rio de Janeiro Earth Summit 1992 (Agenda 21)",
      "Resource Planning in India",
      "Land Resources & Land Use Patterns in India",
      "Land Degradation & Conservation Measures",
      "Soil as a Resource: Classification of Soils (Alluvial, Black, Red and Yellow, Laterite, Arid, Forest Soils)",
      "Soil Erosion and Soil Conservation"
    ],
    "learningObjectivesJson": "[\"Map spatial distribution of Indian soil orders and design erosion control strategies\"]",
    "learningObjectives": [
      "Map spatial distribution of Indian soil orders and design erosion control strategies"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_geo_ch2",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Geography: Forest and Wildlife Resources",
    "topicsJson": "[\"Biodiversity / Biological Diversity\",\"Flora and Fauna in India\",\"IUCN Species Categories (Normal, Endangered, Vulnerable, Rare, Endemic, Extinct)\",\"Causes of Depletion of Flora and Fauna\",\"Conservation of Forest and Wildlife in India (Wildlife Protection Act 1972, Project Tiger)\",\"Types and Distribution of Forests (Reserved, Protected, Unclassed Forests)\",\"Community and Conservation (Bhairodev Dakav 'Sonchuri', Chipko Movement, Beej Bachao Andolan, Joint Forest Management JFM)\"]",
    "topics": [
      "Biodiversity / Biological Diversity",
      "Flora and Fauna in India",
      "IUCN Species Categories (Normal, Endangered, Vulnerable, Rare, Endemic, Extinct)",
      "Causes of Depletion of Flora and Fauna",
      "Conservation of Forest and Wildlife in India (Wildlife Protection Act 1972, Project Tiger)",
      "Types and Distribution of Forests (Reserved, Protected, Unclassed Forests)",
      "Community and Conservation (Bhairodev Dakav 'Sonchuri', Chipko Movement, Beej Bachao Andolan, Joint Forest Management JFM)"
    ],
    "learningObjectivesJson": "[\"Categorize statutory forest legal classifications and evaluate community conservation movements\"]",
    "learningObjectives": [
      "Categorize statutory forest legal classifications and evaluate community conservation movements"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_geo_ch3",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Geography: Water Resources",
    "topicsJson": "[\"Water Scarcity and the Need for Water Conservation and Management\",\"Multi-purpose River Valley Projects and Integrated Water Resources Management (Dams: Benefits vs Social and Ecological Displacements)\",\"Rainwater Harvesting: Roof Top Rainwater Harvesting (Tamil Nadu Mandatory Rule), Traditional Systems ('Kuls', 'Guls', 'Khadins', 'Johads', 'Bamboos Drip Irrigation in Meghalaya)\"]",
    "topics": [
      "Water Scarcity and the Need for Water Conservation and Management",
      "Multi-purpose River Valley Projects and Integrated Water Resources Management (Dams: Benefits vs Social and Ecological Displacements)",
      "Rainwater Harvesting: Roof Top Rainwater Harvesting (Tamil Nadu Mandatory Rule), Traditional Systems ('Kuls', 'Guls', 'Khadins', 'Johads', 'Bamboos Drip Irrigation in Meghalaya)"
    ],
    "learningObjectivesJson": "[\"Critique multi-purpose dam environmental footprints and promote indigenous rainwater harvesting\"]",
    "learningObjectives": [
      "Critique multi-purpose dam environmental footprints and promote indigenous rainwater harvesting"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_geo_ch4",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Geography: Agriculture",
    "topicsJson": "[\"Types of Farming: Primitive Subsistence, Intensive Subsistence, Commercial Farming (Plantation)\",\"Cropping Pattern: Rabi, Kharif, Zaid\",\"Major Crops: Food Crops (Rice, Wheat, Millets, Maize, Pulses), Food Crops other than Grains (Sugarcane, Oilseeds, Tea, Coffee), Non-Food Crops (Rubber, Cotton, Jute)\",\"Technological and Institutional Reforms: Green Revolution, White Revolution, Land Ceiling, Kisan Credit Card (KCC), Personal Accident Insurance Scheme (PAIS)\",\"Contribution of Agriculture to the National Economy, Employment and Output\",\"Food Security Initiatives\"]",
    "topics": [
      "Types of Farming: Primitive Subsistence, Intensive Subsistence, Commercial Farming (Plantation)",
      "Cropping Pattern: Rabi, Kharif, Zaid",
      "Major Crops: Food Crops (Rice, Wheat, Millets, Maize, Pulses), Food Crops other than Grains (Sugarcane, Oilseeds, Tea, Coffee), Non-Food Crops (Rubber, Cotton, Jute)",
      "Technological and Institutional Reforms: Green Revolution, White Revolution, Land Ceiling, Kisan Credit Card (KCC), Personal Accident Insurance Scheme (PAIS)",
      "Contribution of Agriculture to the National Economy, Employment and Output",
      "Food Security Initiatives"
    ],
    "learningObjectivesJson": "[\"Analyze agronomic climatic requirements for major crops and assess institutional farm reforms\"]",
    "learningObjectives": [
      "Analyze agronomic climatic requirements for major crops and assess institutional farm reforms"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_geo_ch5",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Geography: Minerals and Energy Resources",
    "topicsJson": "[\"What is a Mineral? Mode of Occurrence of Minerals (Veins, Lodes, Beds, Layers, Placer Deposits)\",\"Classification of Minerals: Ferrous (Iron Ore, Manganese), Non-Ferrous (Copper, Bauxite), Non-Metallic (Mica, Limestone)\",\"Conservation of Minerals\",\"Energy Resources: Conventional Sources (Coal, Petroleum, Natural Gas, Electricity: Thermal & Hydel), Non-Conventional Sources (Nuclear / Atomic Energy, Solar Energy, Wind Power, Biogas, Tidal Energy, Geo-thermal Energy)\",\"Conservation of Energy Resources\"]",
    "topics": [
      "What is a Mineral? Mode of Occurrence of Minerals (Veins, Lodes, Beds, Layers, Placer Deposits)",
      "Classification of Minerals: Ferrous (Iron Ore, Manganese), Non-Ferrous (Copper, Bauxite), Non-Metallic (Mica, Limestone)",
      "Conservation of Minerals",
      "Energy Resources: Conventional Sources (Coal, Petroleum, Natural Gas, Electricity: Thermal & Hydel), Non-Conventional Sources (Nuclear / Atomic Energy, Solar Energy, Wind Power, Biogas, Tidal Energy, Geo-thermal Energy)",
      "Conservation of Energy Resources"
    ],
    "learningObjectivesJson": "[\"Map geographic distribution of mineral reserves and advocate non-conventional renewables\"]",
    "learningObjectives": [
      "Map geographic distribution of mineral reserves and advocate non-conventional renewables"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_geo_ch6",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 6,
    "chapterTitle": "Geography: Manufacturing Industries",
    "topicsJson": "[\"Importance of Manufacturing\",\"Contribution of Industry to National Economy\",\"Industrial Location Factors\",\"Classification of Industries\",\"Agro-based Industries: Textile Industry (Cotton, Jute), Sugar Industry\",\"Mineral-based Industries: Iron and Steel Industry, Aluminium Smelting, Chemical Industries, Fertilizer Industry, Cement Industry, Automobile Industry, Information Technology and Electronics Industry\",\"Industrial Pollution and Environmental Degradation (Air, Water, Thermal, Noise)\",\"Control of Environmental Degradation & NTPC Sustainable Proactive Approach\"]",
    "topics": [
      "Importance of Manufacturing",
      "Contribution of Industry to National Economy",
      "Industrial Location Factors",
      "Classification of Industries",
      "Agro-based Industries: Textile Industry (Cotton, Jute), Sugar Industry",
      "Mineral-based Industries: Iron and Steel Industry, Aluminium Smelting, Chemical Industries, Fertilizer Industry, Cement Industry, Automobile Industry, Information Technology and Electronics Industry",
      "Industrial Pollution and Environmental Degradation (Air, Water, Thermal, Noise)",
      "Control of Environmental Degradation & NTPC Sustainable Proactive Approach"
    ],
    "learningObjectivesJson": "[\"Analyze heavy industrial clustering factors and evaluate industrial pollution treatment effluent systems\"]",
    "learningObjectives": [
      "Analyze heavy industrial clustering factors and evaluate industrial pollution treatment effluent systems"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_geo_ch7",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 7,
    "chapterTitle": "Geography: Lifelines of National Economy",
    "topicsJson": "[\"Transport Systems: Roadways (Golden Quadrilateral, National Highways, State Highways, District Roads, Border Roads), Railways, Pipelines, Waterways (National Waterways NW-1, NW-2), Major Sea Ports (Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia), Airways\",\"Communication Systems: Personal vs Mass Communication (Television, Radio, Press, Internet)\",\"International Trade: Balance of Trade (Favourable vs Unfavourable)\",\"Tourism as a Trade\"]",
    "topics": [
      "Transport Systems: Roadways (Golden Quadrilateral, National Highways, State Highways, District Roads, Border Roads), Railways, Pipelines, Waterways (National Waterways NW-1, NW-2), Major Sea Ports (Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Visakhapatnam, Paradip, Haldia), Airways",
      "Communication Systems: Personal vs Mass Communication (Television, Radio, Press, Internet)",
      "International Trade: Balance of Trade (Favourable vs Unfavourable)",
      "Tourism as a Trade"
    ],
    "learningObjectivesJson": "[\"Evaluate multimodal transport arteries, seaport logistic nodes, and tourism trade receipts\"]",
    "learningObjectives": [
      "Evaluate multimodal transport arteries, seaport logistic nodes, and tourism trade receipts"
    ],
    "subSubject": "Geography"
  },
  {
    "id": "cat_c10_soc_civ_ch1",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Civics: Power-sharing",
    "topicsJson": "[\"Case Studies of Belgium and Sri Lanka\",\"Majoritarianism in Sri Lanka (1956 Sinhala Only Act, Civil War)\",\"Accommodation in Belgium (Equal Dutch and French Ministers, Brussels Capital, Community Government)\",\"Why Power Sharing is Desirable: Prudential Reasons vs Moral Reasons\",\"Forms of Power Sharing: Horizontal (Legislature, Executive, Judiciary), Vertical (Federalism), Among Social Groups, Among Political Parties & Pressure Groups\"]",
    "topics": [
      "Case Studies of Belgium and Sri Lanka",
      "Majoritarianism in Sri Lanka (1956 Sinhala Only Act, Civil War)",
      "Accommodation in Belgium (Equal Dutch and French Ministers, Brussels Capital, Community Government)",
      "Why Power Sharing is Desirable: Prudential Reasons vs Moral Reasons",
      "Forms of Power Sharing: Horizontal (Legislature, Executive, Judiciary), Vertical (Federalism), Among Social Groups, Among Political Parties & Pressure Groups"
    ],
    "learningObjectivesJson": "[\"Contrast Sri Lankan majoritarian conflict with Belgian constitutional accommodation\"]",
    "learningObjectives": [
      "Contrast Sri Lankan majoritarian conflict with Belgian constitutional accommodation"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c10_soc_civ_ch2",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Civics: Federalism",
    "topicsJson": "[\"What is Federalism? Key Features of Federalism\",\"Coming Together Federations (USA, Switzerland, Australia) vs Holding Together Federations (India, Spain, Belgium)\",\"What Makes India a Federal Country? (Three-Fold Distribution of Legislative Powers: Union List, State List, Concurrent List, Residuary Powers)\",\"How is Federalism Practised? (Linguistic States, Language Policy, Center-State Relations, Coalition Era)\",\"Decentralisation in India: 73rd and 74th Constitutional Amendments (1992), Rural Local Governments (Panchayats) and Urban Local Governments (Municipalities)\"]",
    "topics": [
      "What is Federalism? Key Features of Federalism",
      "Coming Together Federations (USA, Switzerland, Australia) vs Holding Together Federations (India, Spain, Belgium)",
      "What Makes India a Federal Country? (Three-Fold Distribution of Legislative Powers: Union List, State List, Concurrent List, Residuary Powers)",
      "How is Federalism Practised? (Linguistic States, Language Policy, Center-State Relations, Coalition Era)",
      "Decentralisation in India: 73rd and 74th Constitutional Amendments (1992), Rural Local Governments (Panchayats) and Urban Local Governments (Municipalities)"
    ],
    "learningObjectivesJson": "[\"Categorize Union/State/Concurrent legislative jurisdictions and evaluate 1992 decentralization reforms\"]",
    "learningObjectives": [
      "Categorize Union/State/Concurrent legislative jurisdictions and evaluate 1992 decentralization reforms"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c10_soc_civ_ch3",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Civics: Gender, Religion and Caste",
    "topicsJson": "[\"Gender and Politics: Public/Private Division, Sexual Division of Labour, Feminist Movements, Women's Political Representation (Women's Reservation Act)\",\"Religion, Communalism and Politics: Communalism as a Problem, Forms of Communalism, Secular State Constitutional Provisions\",\"Caste and Politics: Caste Inequalities, Caste in Politics (Vote Bank Dynamics), Politics in Caste (Inclusive vs Exclusive Mobilisation)\"]",
    "topics": [
      "Gender and Politics: Public/Private Division, Sexual Division of Labour, Feminist Movements, Women's Political Representation (Women's Reservation Act)",
      "Religion, Communalism and Politics: Communalism as a Problem, Forms of Communalism, Secular State Constitutional Provisions",
      "Caste and Politics: Caste Inequalities, Caste in Politics (Vote Bank Dynamics), Politics in Caste (Inclusive vs Exclusive Mobilisation)"
    ],
    "learningObjectivesJson": "[\"Deconstruct patriarchal, communal, and caste-based political mobilizations\"]",
    "learningObjectives": [
      "Deconstruct patriarchal, communal, and caste-based political mobilizations"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c10_soc_civ_ch4",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Civics: Political Parties",
    "topicsJson": "[\"Why Do We Need Political Parties? (Meaning, Functions, Necessity)\",\"How Many Parties Should We Have? (One-Party, Two-Party, Multi-Party Systems)\",\"National Political Parties in India (Criteria for Recognition: BJP, INC, AAP, BSP, CPI(M))\",\"State Parties / Regional Parties\",\"Challenges to Political Parties (Lack of Internal Democracy, Dynastic Succession, Money and Muscle Power, Lack of Meaningful Choice)\",\"How Can Parties be Reformed? (Anti-Defection Law, Affidavit of Assets/Criminal Cases, Organizational Elections)\"]",
    "topics": [
      "Why Do We Need Political Parties? (Meaning, Functions, Necessity)",
      "How Many Parties Should We Have? (One-Party, Two-Party, Multi-Party Systems)",
      "National Political Parties in India (Criteria for Recognition: BJP, INC, AAP, BSP, CPI(M))",
      "State Parties / Regional Parties",
      "Challenges to Political Parties (Lack of Internal Democracy, Dynastic Succession, Money and Muscle Power, Lack of Meaningful Choice)",
      "How Can Parties be Reformed? (Anti-Defection Law, Affidavit of Assets/Criminal Cases, Organizational Elections)"
    ],
    "learningObjectivesJson": "[\"Evaluate Election Commission recognition criteria and institutional anti-corruption reforms for parties\"]",
    "learningObjectives": [
      "Evaluate Election Commission recognition criteria and institutional anti-corruption reforms for parties"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c10_soc_civ_ch5",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Civics: Outcomes of Democracy",
    "topicsJson": "[\"How Do We Assess Democracy's Outcomes?\",\"Accountable, Responsive and Legitimate Government (Transparency and RTI)\",\"Economic Growth and Development vs Dictatorships\",\"Reduction of Inequality and Poverty\",\"Accommodation of Social Diversity\",\"Dignity and Freedom of the Citizens\"]",
    "topics": [
      "How Do We Assess Democracy's Outcomes?",
      "Accountable, Responsive and Legitimate Government (Transparency and RTI)",
      "Economic Growth and Development vs Dictatorships",
      "Reduction of Inequality and Poverty",
      "Accommodation of Social Diversity",
      "Dignity and Freedom of the Citizens"
    ],
    "learningObjectivesJson": "[\"Assess democratic legitimacy, citizen transparency, and social dignity outcomes\"]",
    "learningObjectives": [
      "Assess democratic legitimacy, citizen transparency, and social dignity outcomes"
    ],
    "subSubject": "Civics"
  },
  {
    "id": "cat_c10_soc_econ_ch1",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 1,
    "chapterTitle": "Economics: Development",
    "topicsJson": "[\"What Development Promises: Different People, Different Goals\",\"Income and Other Goals (Freedom, Security, Respect)\",\"National Development Indicators: Average Income / Per Capita Income (World Bank World Development Report)\",\"Income and Other Criteria (Infant Mortality Rate, Literacy Rate, Net Attendance Ratio)\",\"Public Facilities & Human Development Index (HDI published by UNDP)\",\"Sustainability of Development (Groundwater Depletion, Exhaustion of Natural Resources)\"]",
    "topics": [
      "What Development Promises: Different People, Different Goals",
      "Income and Other Goals (Freedom, Security, Respect)",
      "National Development Indicators: Average Income / Per Capita Income (World Bank World Development Report)",
      "Income and Other Criteria (Infant Mortality Rate, Literacy Rate, Net Attendance Ratio)",
      "Public Facilities & Human Development Index (HDI published by UNDP)",
      "Sustainability of Development (Groundwater Depletion, Exhaustion of Natural Resources)"
    ],
    "learningObjectivesJson": "[\"Contrast World Bank per capita income tiers with UNDP multidimensional Human Development Index\"]",
    "learningObjectives": [
      "Contrast World Bank per capita income tiers with UNDP multidimensional Human Development Index"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c10_soc_econ_ch2",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 2,
    "chapterTitle": "Economics: Sectors of the Indian Economy",
    "topicsJson": "[\"Sectors of Economic Activities: Primary, Secondary, Tertiary\",\"Historical Change in Sectors\",\"Rising Importance of the Tertiary Sector in Production\",\"Where are Most of the People Employed? (Disguised Unemployment in Agriculture)\",\"How to Create More Employment? (Agricultural Credit, Rural Infrastructure, MGNREGA 2005 100-Day Guarantee)\",\"Division of Sectors as Organised and Unorganised\",\"Sectors in Terms of Ownership: Public and Private Sectors\"]",
    "topics": [
      "Sectors of Economic Activities: Primary, Secondary, Tertiary",
      "Historical Change in Sectors",
      "Rising Importance of the Tertiary Sector in Production",
      "Where are Most of the People Employed? (Disguised Unemployment in Agriculture)",
      "How to Create More Employment? (Agricultural Credit, Rural Infrastructure, MGNREGA 2005 100-Day Guarantee)",
      "Division of Sectors as Organised and Unorganised",
      "Sectors in Terms of Ownership: Public and Private Sectors"
    ],
    "learningObjectivesJson": "[\"Analyze structural GDP vs employment composition shifts and unorganized labour protections\"]",
    "learningObjectives": [
      "Analyze structural GDP vs employment composition shifts and unorganized labour protections"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c10_soc_econ_ch3",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 3,
    "chapterTitle": "Economics: Money and Credit",
    "topicsJson": "[\"Money as a Medium of Exchange (Eliminating Double Coincidence of Wants)\",\"Modern Forms of Money: Currency (Paper Notes & Coins), Demand Deposits with Banks, Cheques\",\"Loan Activities of Banks (Spread as Bank Income)\",\"Two Different Credit Situations (Productive Investment vs Debt Trap)\",\"Terms of Credit (Collateral, Documentation, Interest Rate, Mode of Repayment)\",\"Formal Sector Credit in India (Commercial Banks, Cooperatives, Supervised by RBI) vs Informal Sector Credit (Moneylenders, High Interest Rates)\",\"Self-Help Groups (SHGs) for the Poor (Gramin Bank of Bangladesh Model)\"]",
    "topics": [
      "Money as a Medium of Exchange (Eliminating Double Coincidence of Wants)",
      "Modern Forms of Money: Currency (Paper Notes & Coins), Demand Deposits with Banks, Cheques",
      "Loan Activities of Banks (Spread as Bank Income)",
      "Two Different Credit Situations (Productive Investment vs Debt Trap)",
      "Terms of Credit (Collateral, Documentation, Interest Rate, Mode of Repayment)",
      "Formal Sector Credit in India (Commercial Banks, Cooperatives, Supervised by RBI) vs Informal Sector Credit (Moneylenders, High Interest Rates)",
      "Self-Help Groups (SHGs) for the Poor (Gramin Bank of Bangladesh Model)"
    ],
    "learningObjectivesJson": "[\"Evaluate RBI supervisory oversight of formal lending and micro-credit empowerment via SHGs\"]",
    "learningObjectives": [
      "Evaluate RBI supervisory oversight of formal lending and micro-credit empowerment via SHGs"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c10_soc_econ_ch4",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 4,
    "chapterTitle": "Economics: Globalisation and the Indian Economy",
    "topicsJson": "[\"Production Across Countries: Multinational Corporations (MNCs)\",\"Interlinking Production Across Countries (Foreign Direct Investment FDI, Joint Ventures, Local Partnerships)\",\"Foreign Trade and Integration of Markets\",\"What is Globalisation? Factors Enabling Globalisation: Technology (Containerisation, Telecommunications, Internet), Liberalisation of Foreign Trade and Foreign Investment Policy (1991 New Economic Policy)\",\"World Trade Organisation (WTO) and Trade Barriers\",\"Impact of Globalisation in India: Benefits to Consumers and Top Companies vs Challenges to Small Producers and Casual Workers\",\"The Struggle for a Fair Globalisation\"]",
    "topics": [
      "Production Across Countries: Multinational Corporations (MNCs)",
      "Interlinking Production Across Countries (Foreign Direct Investment FDI, Joint Ventures, Local Partnerships)",
      "Foreign Trade and Integration of Markets",
      "What is Globalisation? Factors Enabling Globalisation: Technology (Containerisation, Telecommunications, Internet), Liberalisation of Foreign Trade and Foreign Investment Policy (1991 New Economic Policy)",
      "World Trade Organisation (WTO) and Trade Barriers",
      "Impact of Globalisation in India: Benefits to Consumers and Top Companies vs Challenges to Small Producers and Casual Workers",
      "The Struggle for a Fair Globalisation"
    ],
    "learningObjectivesJson": "[\"Critically evaluate 1991 trade liberalization, MNC supply chains, and fair globalization safeguards\"]",
    "learningObjectives": [
      "Critically evaluate 1991 trade liberalization, MNC supply chains, and fair globalization safeguards"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c10_soc_econ_ch5",
    "grade": "Class 10",
    "subject": "Social Science",
    "chapterNumber": 5,
    "chapterTitle": "Economics: Consumer Rights",
    "topicsJson": "[\"The Consumer in the Marketplace\",\"Consumer Exploitation & Consumer Movement History\",\"Consumer Protection Act (COPRA 1986 / Consumer Protection Act 2019)\",\"Consumer Rights: Right to Safety, Right to be Informed, Right to Choose, Right to be Heard, Right to Seek Redressal, Right to Consumer Education\",\"Three-Tier Consumer Courts (District Commission, State Commission, National Commission)\",\"Standardization Marks: ISI, Agmark, Hallmark, ISO\"]",
    "topics": [
      "The Consumer in the Marketplace",
      "Consumer Exploitation & Consumer Movement History",
      "Consumer Protection Act (COPRA 1986 / Consumer Protection Act 2019)",
      "Consumer Rights: Right to Safety, Right to be Informed, Right to Choose, Right to be Heard, Right to Seek Redressal, Right to Consumer Education",
      "Three-Tier Consumer Courts (District Commission, State Commission, National Commission)",
      "Standardization Marks: ISI, Agmark, Hallmark, ISO"
    ],
    "learningObjectivesJson": "[\"Navigate consumer court dispute redressal procedures and identify statutory quality marks\"]",
    "learningObjectives": [
      "Navigate consumer court dispute redressal procedures and identify statutory quality marks"
    ],
    "subSubject": "Economics"
  },
  {
    "id": "cat_c10_eng_ch1",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 1,
    "chapterTitle": "A Letter to God & Dust of Snow & Fire and Ice",
    "topicsJson": "[\"Lencho's Faith in Divine\",\"Post Office Employees Generosity\",\"Robert Frost Nature Symbolism\",\"Metaphors and Irony\"]",
    "topics": [
      "Lencho's Faith in Divine",
      "Post Office Employees Generosity",
      "Robert Frost Nature Symbolism",
      "Metaphors and Irony"
    ],
    "learningObjectivesJson": "[\"Analyze deep irony in human institutions and interpret Frostian apocalyptic symbolism\"]",
    "learningObjectives": [
      "Analyze deep irony in human institutions and interpret Frostian apocalyptic symbolism"
    ]
  },
  {
    "id": "cat_c10_eng_ch2",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 2,
    "chapterTitle": "Nelson Mandela: Long Walk to Freedom & A Tiger in the Zoo",
    "topicsJson": "[\"Inauguration of Democratic South Africa\",\"Overcoming Apartheid & Twin Obligations\",\"Leslie Norris Captivity vs Freedom Verse\",\"Relative Clauses\"]",
    "topics": [
      "Inauguration of Democratic South Africa",
      "Overcoming Apartheid & Twin Obligations",
      "Leslie Norris Captivity vs Freedom Verse",
      "Relative Clauses"
    ],
    "learningObjectivesJson": "[\"Comprehend Mandela's definition of true courage and contrast wild vs caged animal dignity\"]",
    "learningObjectives": [
      "Comprehend Mandela's definition of true courage and contrast wild vs caged animal dignity"
    ]
  },
  {
    "id": "cat_c10_eng_ch3",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 3,
    "chapterTitle": "Two Stories about Flying (Part 1: His First Flight, Part 2: Black Aeroplane) & How to Tell Wild Animals & The Ball Poem",
    "topicsJson": "[\"Young Seagull Overcoming Fear\",\"Mysterious Pilot in Storm\",\"Carolyn Wells Humorous Beasts Verse\",\"John Berryman Loss of Childhood Poem\",\"Past Perfect and Modals\"]",
    "topics": [
      "Young Seagull Overcoming Fear",
      "Mysterious Pilot in Storm",
      "Carolyn Wells Humorous Beasts Verse",
      "John Berryman Loss of Childhood Poem",
      "Past Perfect and Modals"
    ],
    "learningObjectivesJson": "[\"Explore psychological courage, aviation mystery, and poetic coping with grief/loss\"]",
    "learningObjectives": [
      "Explore psychological courage, aviation mystery, and poetic coping with grief/loss"
    ]
  },
  {
    "id": "cat_c10_eng_ch4",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 4,
    "chapterTitle": "From the Diary of Anne Frank & Amanda!",
    "topicsJson": "[\"Anne Frank Secret Annex Diary\",\"Adolescent Solitude and Kitty\",\"Robin Klein Nagging Parents Verse\",\"Subjunctive and Idiomatic Verbs\"]",
    "topics": [
      "Anne Frank Secret Annex Diary",
      "Adolescent Solitude and Kitty",
      "Robin Klein Nagging Parents Verse",
      "Subjunctive and Idiomatic Verbs"
    ],
    "learningObjectivesJson": "[\"Appreciate introspective wartime journaling and analyze teenage yearning for autonomy\"]",
    "learningObjectives": [
      "Appreciate introspective wartime journaling and analyze teenage yearning for autonomy"
    ]
  },
  {
    "id": "cat_c10_eng_ch5",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 5,
    "chapterTitle": "Glimpses of India (Part 1: A Baker from Goa, Part 2: Coorg, Part 3: Tea from Assam) & The Trees",
    "topicsJson": "[\"Portuguese Pader Bread Traditions\",\"Kodavus Martial Bravery & Coffee Plantations\",\"Assam Tea Lore & History\",\"Adrienne Rich Feminist Ecology Verse\",\"Prepositional Collocations\"]",
    "topics": [
      "Portuguese Pader Bread Traditions",
      "Kodavus Martial Bravery & Coffee Plantations",
      "Assam Tea Lore & History",
      "Adrienne Rich Feminist Ecology Verse",
      "Prepositional Collocations"
    ],
    "learningObjectivesJson": "[\"Synthesize regional Indian cultural essays and interpret feminist environmental allegory\"]",
    "learningObjectives": [
      "Synthesize regional Indian cultural essays and interpret feminist environmental allegory"
    ]
  },
  {
    "id": "cat_c10_eng_ch6",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 6,
    "chapterTitle": "Mijbil the Otter & Fog",
    "topicsJson": "[\"Gavin Maxwell Pet Otter in Iraq & London\",\"Animal Behavior in Travel\",\"Carl Sandburg Metaphorical Cat Fog Verse\",\"Adverbial Clauses of Time\"]",
    "topics": [
      "Gavin Maxwell Pet Otter in Iraq & London",
      "Animal Behavior in Travel",
      "Carl Sandburg Metaphorical Cat Fog Verse",
      "Adverbial Clauses of Time"
    ],
    "learningObjectivesJson": "[\"Appreciate human-animal companionship across borders and parse poetic haiku-like metaphors\"]",
    "learningObjectives": [
      "Appreciate human-animal companionship across borders and parse poetic haiku-like metaphors"
    ]
  },
  {
    "id": "cat_c10_eng_ch7",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 7,
    "chapterTitle": "Madam Rides the Bus & The Tale of Custard the Dragon",
    "topicsJson": "[\"Valli's Meticulous Bus Journey Planning\",\"Confronting Mortality (Dead Cow)\",\"Ogden Nash Comic Ballad of the Cowardly Dragon\",\"Dialogue and Indirect Narration\"]",
    "topics": [
      "Valli's Meticulous Bus Journey Planning",
      "Confronting Mortality (Dead Cow)",
      "Ogden Nash Comic Ballad of the Cowardly Dragon",
      "Dialogue and Indirect Narration"
    ],
    "learningObjectivesJson": "[\"Trace eight-year-old Valli's awakening to life and death, and analyze satirical mock-heroic ballads\"]",
    "learningObjectives": [
      "Trace eight-year-old Valli's awakening to life and death, and analyze satirical mock-heroic ballads"
    ]
  },
  {
    "id": "cat_c10_eng_ch8",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 8,
    "chapterTitle": "The Sermon at Benares & For Anne Gregory",
    "topicsJson": "[\"Gautama Buddha First Sermon\",\"Kisa Gotami Mustard Seed Parable on Inevitable Grief\",\"W.B. Yeats Physical vs Spiritual Beauty Verse\",\"Reported Speech\"]",
    "topics": [
      "Gautama Buddha First Sermon",
      "Kisa Gotami Mustard Seed Parable on Inevitable Grief",
      "W.B. Yeats Physical vs Spiritual Beauty Verse",
      "Reported Speech"
    ],
    "learningObjectivesJson": "[\"Analyze Buddhist philosophical parables on mortal transience and explore spiritual beauty\"]",
    "learningObjectives": [
      "Analyze Buddhist philosophical parables on mortal transience and explore spiritual beauty"
    ]
  },
  {
    "id": "cat_c10_eng_ch9",
    "grade": "Class 10",
    "subject": "English",
    "chapterNumber": 9,
    "chapterTitle": "The Proposal (Play)",
    "topicsJson": "[\"Anton Chekhov One-Act Russian Farce\",\"Lomov, Chubukov, and Natalya Arguments (Oxen Meadows, Guess vs Squeezer)\",\"Satire on Landed Aristocratic Marriage Contracts\",\"Dramatic Staging and Farce Timing\"]",
    "topics": [
      "Anton Chekhov One-Act Russian Farce",
      "Lomov, Chubukov, and Natalya Arguments (Oxen Meadows, Guess vs Squeezer)",
      "Satire on Landed Aristocratic Marriage Contracts",
      "Dramatic Staging and Farce Timing"
    ],
    "learningObjectivesJson": "[\"Perform comedic dramatic dialogue and critique mercenary marriage arrangements\"]",
    "learningObjectives": [
      "Perform comedic dramatic dialogue and critique mercenary marriage arrangements"
    ]
  }
];

/**
 * Normalizes input grade string to canonical "Class N" format.
 *
 * @param {string|number} grade
 * @return {string|null}
 */
function normalizeGrade(grade) {
  if (grade === undefined || grade === null) return null;
  var str = String(grade).trim();
  if (!str || str.toLowerCase() === "all") return null;
  var numMatch = str.match(/^([1-9]|10)$/);
  if (numMatch) return "Class " + numMatch[1];
  var classMatch = str.match(/^(?:class|grade)?\s*([1-9]|10)$/i);
  return classMatch ? ("Class " + classMatch[1]) : null;
}

/**
 * Normalizes input subject string to canonical subject name.
 *
 * @param {string} subject
 * @return {string|null}
 */
function normalizeSubject(subject) {
  if (subject === undefined || subject === null) return null;
  var s = String(subject).trim().toLowerCase();
  if (!s || s === "all") return null;

  if (s === "math" || s === "maths" || s === "mathematics" || s === "joyful mathematics" || s === "maths mela" || s === "math-magic" || s === "ganita prakash") {
    return "Mathematics";
  }
  if (s === "evs" || s === "environmental studies" || s === "our wondrous world" || s === "looking around") {
    return "EVS";
  }
  if (s === "science" || s === "sci" || s === "general science" || s === "curiosity") {
    return "Science";
  }
  if (s === "social science" || s === "social studies" || s === "sst" || s === "social" || s === "exploring society" || s === "history" || s === "geography" || s === "civics" || s === "political science" || s === "economics") {
    return "Social Science";
  }
  if (s === "english" || s === "eng" || s === "mridang" || s === "santoor" || s === "marigold" || s === "poorvi" || s === "honeycomb" || s === "honeydew" || s === "beehive" || s === "first flight") {
    return "English";
  }
  if (s === "hindi" || s === "hin" || s === "sarangi" || s === "veena" || s === "rimjhim") {
    return "Hindi";
  }
  return String(subject).trim();
}

/**
 * Retrieves catalog items filtered by grade and optional subject.
 *
 * @param {string} grade
 * @param {string} [subject]
 * @return {Array<Object>}
 */
function getCanonicalCatalog(grade, subject) {
  var normGrade = normalizeGrade(grade);
  var normSubject = normalizeSubject(subject);

  return CANONICAL_CURRICULUM_CATALOG.filter(function(item) {
    if (normGrade && item.grade !== normGrade) return false;
    if (normSubject) {
      if (item.subject === normSubject) return true;
      if (item.subSubject === normSubject) return true;
      if (normSubject === "Social Science" && (item.subject === "Social Science" || item.subSubject)) return true;
      return false;
    }
    return true;
  });
}

/**
 * Converts catalog items into 2D matrix matching Table 16 columns for atomic setValues().
 *
 * @param {Array<Object>} [items]
 * @return {Array<Array<any>>}
 */
function toTable16Matrix(items) {
  var list = Array.isArray(items) ? items : CANONICAL_CURRICULUM_CATALOG;
  return list.map(function(item) {
    return [
      item.id,
      item.grade,
      item.subject,
      item.chapterNumber,
      item.chapterTitle,
      typeof item.topicsJson === "string" ? item.topicsJson : JSON.stringify(item.topics || []),
      typeof item.learningObjectivesJson === "string" ? item.learningObjectivesJson : JSON.stringify(item.learningObjectives || [])
    ];
  });
}

// -------------------------------------------------------------------------
// Universal Polyglot Export Header
// -------------------------------------------------------------------------
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CANONICAL_CURRICULUM_CATALOG: CANONICAL_CURRICULUM_CATALOG,
    CURRICULUM_CATALOG_SCHEMA: CURRICULUM_CATALOG_SCHEMA,
    normalizeGrade: normalizeGrade,
    normalizeSubject: normalizeSubject,
    getCanonicalCatalog: getCanonicalCatalog,
    toTable16Matrix: toTable16Matrix
  };
}

if (typeof window !== "undefined") {
  window.ZOPTRO_CURRICULUM_CATALOG = CANONICAL_CURRICULUM_CATALOG;
  window.CANONICAL_CURRICULUM_CATALOG = CANONICAL_CURRICULUM_CATALOG;
  window.CURRICULUM_CATALOG_SCHEMA = CURRICULUM_CATALOG_SCHEMA;
  window.normalizeGrade = normalizeGrade;
  window.normalizeSubject = normalizeSubject;
  window.getCanonicalCatalog = getCanonicalCatalog;
  window.toTable16Matrix = toTable16Matrix;
}

if (typeof globalThis !== "undefined") {
  globalThis.CANONICAL_CURRICULUM_CATALOG = CANONICAL_CURRICULUM_CATALOG;
  globalThis.ZOPTRO_CURRICULUM_CATALOG = CANONICAL_CURRICULUM_CATALOG;
  globalThis.CURRICULUM_CATALOG_SCHEMA = CURRICULUM_CATALOG_SCHEMA;
  globalThis.normalizeGrade = normalizeGrade;
  globalThis.normalizeSubject = normalizeSubject;
  globalThis.getCanonicalCatalog = getCanonicalCatalog;
  globalThis.toTable16Matrix = toTable16Matrix;
}
