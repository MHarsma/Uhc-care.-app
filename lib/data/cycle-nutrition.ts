export interface MealIdea {
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Restorative Snack";
  title: string;
  prepTimeMinutes: number;
  caloriesApprox: number;
  ingredients: string[];
  instructions: string;
  hormonalBenefit: string;
}

export interface PhaseNutritionDetail {
  phaseKey: "menstrual" | "follicular" | "ovulation" | "luteal";
  phaseName: string;
  icon: string;
  subtitle: string;
  hormoneStatus: string;
  metabolismNote: string;
  seedCycling: {
    seeds: string[];
    benefit: string;
    dosage: string;
  };
  micronutrients: {
    nutrient: string;
    role: string;
    bestSources: string[];
  }[];
  nourishingFoods: {
    category: "Proteins & Iron" | "Healthy Fats & Seeds" | "Complex Carbs & Fiber" | "Healing Teas & Hydration";
    items: string[];
  }[];
  foodsToLimit: {
    food: string;
    reason: string;
  }[];
  meals: MealIdea[];
  partnerGroceryList: string[];
}

export const CYCLE_NUTRITION_DATA: Record<string, PhaseNutritionDetail> = {
  menstrual: {
    phaseKey: "menstrual",
    phaseName: "Menstrual Phase",
    icon: "🩸",
    subtitle: "Replenish Iron, Warmth & Anti-Inflammatory Harmony",
    hormoneStatus: "Estrogen & Progesterone are at their lowest baseline. Uterine lining is actively shedding.",
    metabolismNote: "Resting metabolic rate is slower. Your body craves warm, easily digestible, nutrient-dense warmth rather than cold raw foods.",
    seedCycling: {
      seeds: ["1 tbsp Ground Flaxseeds", "1 tbsp Raw Pumpkin Seeds"],
      dosage: "Add daily to oatmeal, smoothies, or warm soups",
      benefit: "Lignans in flaxseed bind excess estrogen, while pumpkin seeds deliver zinc to support follicle development for the upcoming cycle.",
    },
    micronutrients: [
      {
        nutrient: "Heme & Non-Heme Iron",
        role: "Replenishes blood volume lost during menstruation, preventing fatigue and lightheadedness.",
        bestSources: ["Grass-fed beef", "Lentils", "Black beans", "Spinach with lemon", "Cooked beets"],
      },
      {
        nutrient: "Magnesium & B-Complex",
        role: "Relaxes smooth uterine muscles, directly reducing the severity of uterine contractions and lower-back cramps.",
        bestSources: ["Dark chocolate (>75%)", "Pumpkin seeds", "Almonds", "Avocado", "Warm bone broth"],
      },
      {
        nutrient: "Omega-3 Fatty Acids",
        role: "Competes with inflammatory prostaglandins (PGF2-alpha) to dramatically reduce pain signaling.",
        bestSources: ["Wild Alaskan salmon", "Sardines", "Walnuts", "Chia seeds"],
      },
      {
        nutrient: "Zinc & Vitamin C",
        role: "Aids red blood cell production, cellular repair, and boosts iron absorption up to 3x.",
        bestSources: ["Citrus squeeze over greens", "Bell peppers", "Pumpkin seeds", "Oysters"],
      },
    ],
    nourishingFoods: [
      {
        category: "Proteins & Iron",
        items: ["Slow-simmered bone broth", "Grass-fed lean beef", "Red lentils & dal", "Pasture-raised eggs", "Cooked spinach"],
      },
      {
        category: "Healthy Fats & Seeds",
        items: ["Ground flaxseeds", "Raw pumpkin seeds", "Extra virgin olive oil", "Ghee & clarified butter", "Creamy avocado"],
      },
      {
        category: "Complex Carbs & Fiber",
        items: ["Roasted sweet potatoes", "Warm cinnamon oatmeal", "Steamed beetroot", "Wild black rice", "Stewed apples"],
      },
      {
        category: "Healing Teas & Hydration",
        items: ["Fresh ginger tea with honey", "Red raspberry leaf tea", "Peppermint infusion", "Warm lemon water with pinch of Celtic sea salt"],
      },
    ],
    foodsToLimit: [
      { food: "Excess Caffeine & Cold Drinks", reason: "Constricts uterine blood vessels and amplifies cramping sensations." },
      { food: "Refined White Sugar", reason: "Triggers insulin surges that worsen prostaglandin inflammation and mood dips." },
      { food: "High Sodium Processed Snacks", reason: "Exacerbates menstrual water retention, breast tenderness, and abdominal bloating." },
    ],
    meals: [
      {
        mealType: "Breakfast",
        title: "Warm Cinnamon & Blackberry Protein Oats",
        prepTimeMinutes: 10,
        caloriesApprox: 380,
        ingredients: ["1/2 cup rolled oats", "1 tbsp ground flaxseeds", "1 tbsp pumpkin seeds", "1 cup almond milk", "1/2 cup blackberries", "1 scoop collagen or vanilla protein", "Dash of Ceylon cinnamon"],
        instructions: "Simmer oats in warm almond milk with cinnamon. Stir in collagen, top with fresh blackberries, pumpkin seeds, and freshly ground flaxseeds.",
        hormonalBenefit: "Warming comfort that supplies zinc, lignans, and complex carbs to stabilize morning blood glucose.",
      },
      {
        mealType: "Lunch",
        title: "Iron-Rich Mediterranean Lentil & Spinach Bowl",
        prepTimeMinutes: 15,
        caloriesApprox: 450,
        ingredients: ["1 cup cooked warm brown lentils", "2 cups baby spinach", "1/2 roasted sweet potato", "1/4 avocado", "1 tbsp extra virgin olive oil", "Juice of 1/2 fresh lemon", "Toasted pumpkin seeds"],
        instructions: "Warm the lentils and sweet potatoes together. Fold in fresh baby spinach until lightly wilted. Drizzle with lemon juice and olive oil for peak iron absorption.",
        hormonalBenefit: "Vitamin C from fresh lemon multiplies iron bioavailability from lentils and spinach.",
      },
      {
        mealType: "Dinner",
        title: "Slow-Simmered Ginger Bone Broth & Wild Salmon Bowl",
        prepTimeMinutes: 20,
        caloriesApprox: 520,
        ingredients: ["5 oz wild salmon fillet", "1 cup rich chicken or beef bone broth", "1 cup steamed jasmine rice", "Steamed bok choy or broccoli", "Fresh ginger shavings", "Coconut aminos"],
        instructions: "Pan-sear salmon in ghee for 4 mins each side. Serve over warm jasmine rice and bok choy, drizzling hot ginger bone broth over the bowl.",
        hormonalBenefit: "Potent anti-inflammatory omega-3 EPA/DHA directly relieves uterine muscle tension.",
      },
      {
        mealType: "Restorative Snack",
        title: "Magnesium Dark Chocolate & Raspberry Elixir",
        prepTimeMinutes: 5,
        caloriesApprox: 180,
        ingredients: ["2 squares dark chocolate (85%+)", "Handful of fresh raspberries", "1 cup warm ginger-chamomile tea with raw honey"],
        instructions: "Enjoy the chocolate slowly with warm herbal tea to invite deep evening relaxation.",
        hormonalBenefit: "High magnesium relaxes the vascular nervous system and induces restful sleep.",
      },
    ],
    partnerGroceryList: [
      "Rich Bone Broth (Chicken or Beef)",
      "Dark Chocolate (>75% cocoa)",
      "Fresh Ginger Root & Lemons",
      "Red Raspberry Leaf & Peppermint Tea",
      "Organic Baby Spinach & Sweet Potatoes",
      "Wild Salmon Fillets or Lean Meat",
      "Raw Pumpkin Seeds & Ground Flaxseeds",
      "Fresh Blackberries or Raspberries",
    ],
  },

  follicular: {
    phaseKey: "follicular",
    phaseName: "Follicular Phase",
    icon: "🌱",
    subtitle: "Fuel Rising Estrogen, Gut Microbiome & Creative Fire",
    hormoneStatus: "Pituitary gland releases FSH; ovarian follicles develop and estrogen steadily climbs.",
    metabolismNote: "Insulin sensitivity is at its peak. Your body efficiently converts clean carbohydrates into muscular glycogen and radiant vitality.",
    seedCycling: {
      seeds: ["1 tbsp Ground Flaxseeds", "1 tbsp Raw Pumpkin Seeds"],
      dosage: "Sprinkle over salads, chia puddings, or grain bowls",
      benefit: "Flax lignans ensure healthy estrogen metabolism via the 2-hydroxyestrone protective pathway rather than inflammatory 16-hydroxy.",
    },
    micronutrients: [
      {
        nutrient: "B-Vitamins (B6, B12, Folate)",
        role: "Essential cofactors for healthy follicle maturation and high neurochemical energy.",
        bestSources: ["Pasture-raised eggs", "Nutritional yeast", "Sprouted legumes", "Asparagus"],
      },
      {
        nutrient: "Probiotics & Fermented Fibers",
        role: "Nourishes the 'estrobolome' (gut bacteria responsible for healthy estrogen clearance).",
        bestSources: ["Kimchi", "Sauerkraut", "Kefir", "Kombucha", "Tempeh"],
      },
      {
        nutrient: "Indole-3-Carbinol (I3C) & Sulforaphane",
        role: "Supports Phase 1 and Phase 2 liver detoxification pathways to process climbing estrogen cleanly.",
        bestSources: ["Broccoli sprouts", "Cauliflower", "Kale", "Arugula", "Brussels sprouts"],
      },
      {
        nutrient: "Clean Lean Protein",
        role: "Provides branched-chain amino acids for the body's natural window of strength and muscle tone building.",
        bestSources: ["Organic chicken breast", "Tofu/Tempeh", "Lentils", "White fish"],
      },
    ],
    nourishingFoods: [
      {
        category: "Proteins & Iron",
        items: ["Grilled chicken tenderloins", "Steamed edamame", "Poached pasture eggs", "Wild cod fillets", "Sprouted garbanzo beans"],
      },
      {
        category: "Healthy Fats & Seeds",
        items: ["Fresh pumpkin seeds", "Flaxseed meal", "Extra virgin olive oil", "Almond butter", "Tahini drizzle"],
      },
      {
        category: "Complex Carbs & Fiber",
        items: ["Sprouted sourdough bread", "Quinoa salad", "Crisp green apples", "Steel cut oats", "Sweet green peas"],
      },
      {
        category: "Healing Teas & Hydration",
        items: ["Organic green tea / Matcha", "Lemon & cucumber infused water", "Nettle leaf herbal tea", "Coconut water with electrolytes"],
      },
    ],
    foodsToLimit: [
      { food: "Heavy Greasy Fast Foods", reason: "Burdens liver detoxification pathways, causing sluggish estrogen clearance." },
      { food: "Alcohol", reason: "Competes with estrogen clearance in the liver and dampens rising dopamine." },
      { food: "Stale Refined Flours", reason: "Spikes glucose during a phase when high sustained mental focus is readily available." },
    ],
    meals: [
      {
        mealType: "Breakfast",
        title: "Matcha Glow Green Smoothie & Sprouted Eggs",
        prepTimeMinutes: 10,
        caloriesApprox: 410,
        ingredients: ["2 soft-boiled pasture eggs", "1 slice sprouted sourdough", "1 cup baby spinach", "1/2 frozen green apple", "1 tsp ceremonial matcha", "1 tbsp ground flaxseeds", "Unsweetened almond milk"],
        instructions: "Blend greens, apple, matcha, flaxseeds, and almond milk into a vibrant green smoothie. Enjoy with warm eggs on toasted sourdough.",
        hormonalBenefit: "Matcha EGCG provides clean focused energy without jittery cortisol spikes.",
      },
      {
        mealType: "Lunch",
        title: "Probiotic Rainbow Quinoa & Edamame Bowl",
        prepTimeMinutes: 12,
        caloriesApprox: 480,
        ingredients: ["1 cup cooked fluffy quinoa", "1/2 cup shelled edamame", "2 tbsp artisanal kimchi or sauerkraut", "1 cup shaved red cabbage & carrots", "1 tbsp toasted pumpkin seeds", "Ginger-miso dressing"],
        instructions: "Layer warm quinoa with crisp colorful vegetables and probiotic kimchi. Top with edamame, pumpkin seeds, and a spoonful of ginger miso.",
        hormonalBenefit: "Probiotics in kimchi and sulforaphane in cabbage assist smooth estrogen filtration.",
      },
      {
        mealType: "Dinner",
        title: "Pan-Seared White Fish with Roasted Asparagus & Citrus",
        prepTimeMinutes: 18,
        caloriesApprox: 490,
        ingredients: ["6 oz wild cod or halibut", "1 bundle fresh asparagus spears", "1/2 cup cooked wild rice blend", "1 tbsp cold-pressed olive oil", "Zest and juice of 1 fresh orange", "Fresh dill"],
        instructions: "Roast asparagus with olive oil and sea salt at 400°F for 12 mins. Pan-sear fish in skillet for 3 mins per side, finishing with orange zest and fresh dill.",
        hormonalBenefit: "Asparagus is rich in folate and glutathione, guarding follicular egg quality.",
      },
      {
        mealType: "Restorative Snack",
        title: "Green Apple Slices with Almond Butter & Pumpkin Seeds",
        prepTimeMinutes: 3,
        caloriesApprox: 210,
        ingredients: ["1 crisp Honeycrisp or Granny Smith apple", "1.5 tbsp stone-ground almond butter", "1 tbsp raw pumpkin seeds"],
        instructions: "Slice apple thinly and dip into almond butter topped with crunchy pumpkin seeds.",
        hormonalBenefit: "Pectin in crisp apples sweeps excess hormones through digestive tract.",
      },
    ],
    partnerGroceryList: [
      "Ceremonial Matcha or Organic Green Tea",
      "Kimchi or Raw Sauerkraut (Probiotic)",
      "Organic Asparagus & Broccolini",
      "Crisp Green Apples & Fresh Citrus",
      "Edamame & Sprouted Sourdough Bread",
      "Stone-Ground Almond Butter",
      "Wild Cod or Organic Chicken Breast",
      "Raw Pumpkin Seeds & Flaxseeds",
    ],
  },

  ovulation: {
    phaseKey: "ovulation",
    phaseName: "Ovulation Phase",
    icon: "🌸",
    subtitle: "Peak Radiance, Antioxidant Shield & Energy Surge",
    hormoneStatus: "Luteinizing Hormone (LH) surges; Estrogen reaches its highest monthly crest as the mature egg is released.",
    metabolismNote: "Natural energy, charisma, and libidal warmth peak. Digestion is rapid; emphasize raw colorful antioxidants and light vibrant meals.",
    seedCycling: {
      seeds: ["1 tbsp Raw Sesame Seeds", "1 tbsp Raw Sunflower Seeds"],
      dosage: "Transition today to sesame & sunflower seeds",
      benefit: "Sesame lignans prevent estrogen from lingering excessively, while sunflower seeds supply Vitamin E and selenium to prepare the corpus luteum.",
    },
    micronutrients: [
      {
        nutrient: "Glutathione & Vitamin C",
        role: "Primary ovarian antioxidant protecting follicular cells from oxidative stress during egg release.",
        bestSources: ["Strawberries", "Asparagus", "Papaya", "Avocado", "Spinach"],
      },
      {
        nutrient: "Zinc & Copper Balance",
        role: "Mandatory mineral for ovulation triggering and cell division.",
        bestSources: ["Sesame seeds & tahini", "Pasture eggs", "Grass-fed lamb/beef", "Lentils"],
      },
      {
        nutrient: "Soluble Fiber",
        role: "Ensures the sudden peak in estrogen is cleared from the bloodstream within 24 hours to prevent mid-cycle breakouts.",
        bestSources: ["Chia seeds", "Raspberries", "Artichokes", "Black beans"],
      },
      {
        nutrient: "Hydration & Trace Minerals",
        role: "Supports optimal cervical fluid production and sustained physical stamina.",
        bestSources: ["Coconut water", "Watermelon", "Cucumber", "Celtic sea salt"],
      },
    ],
    nourishingFoods: [
      {
        category: "Proteins & Iron",
        items: ["Grilled salmon or trout", "Pasture chicken breast", "Soft-boiled eggs", "Lentil falafel", "Organic tempeh"],
      },
      {
        category: "Healthy Fats & Seeds",
        items: ["Creamy tahini", "Raw sesame seeds", "Raw sunflower seeds", "Avocado slices", "Cold-pressed olive oil"],
      },
      {
        category: "Complex Carbs & Fiber",
        items: ["Crisp bell peppers", "Artichoke hearts", "Berries & figs", "Quinoa", "Sweet corn & roasted chickpeas"],
      },
      {
        category: "Healing Teas & Hydration",
        items: ["Hibiscus rose iced tea", "Coconut water with mint", "Chilled dandelion root tea", "Pure spring water"],
      },
    ],
    foodsToLimit: [
      { food: "Heavy Dairy & High-Fat Fried Foods", reason: "Can overload liver during peak estrogen clearance, triggering hormonal chin acne." },
      { food: "Excess Sugar & High-Glycemic Drinks", reason: "High insulin spikes LH prematurely and disrupts delicate hormonal rhythm." },
      { food: "Dehydrating Spirits & Excess Salt", reason: "Reduces natural cervical fluid hydration." },
    ],
    meals: [
      {
        mealType: "Breakfast",
        title: "Berry Antioxidant Chia Pudding with Sesame Tahini Swirl",
        prepTimeMinutes: 8,
        caloriesApprox: 390,
        ingredients: ["3 tbsp chia seeds", "1 cup unsweetened almond milk", "1/2 cup fresh raspberries & blueberries", "1 tbsp raw tahini", "1 tbsp sunflower seeds", "Vanilla extract"],
        instructions: "Prep chia pudding overnight. In the morning, swirl in creamy tahini and top with fresh radiant berries and crunchy sunflower seeds.",
        hormonalBenefit: "Dense antioxidants shield cellular integrity while fiber sweeps away spent hormones.",
      },
      {
        mealType: "Lunch",
        title: "Mediterranean Chopped Salad with Creamy Tahini Falafel",
        prepTimeMinutes: 15,
        caloriesApprox: 510,
        ingredients: ["2 cups chopped romaine & arugula", "4 baked lentil falafels or grilled chicken", "1/2 cup diced cucumber & tomatoes", "1/4 cup kalamata olives", "2 tbsp tahini-lemon dressing", "1 tbsp toasted sesame seeds"],
        instructions: "Toss crisp greens with cucumber and tomatoes. Add warm falafels or protein, drizzle generously with lemon tahini and sesame seeds.",
        hormonalBenefit: "Sesame seeds supply zinc and lignans to support the transition to the luteal phase.",
      },
      {
        mealType: "Dinner",
        title: "Wild Salmon with Roasted Asparagus & Garlic Quinoa",
        prepTimeMinutes: 20,
        caloriesApprox: 540,
        ingredients: ["6 oz wild sockeye salmon", "1 bunch crisp asparagus", "3/4 cup cooked fluffy quinoa", "1 clove minced garlic", "1 tbsp avocado oil", "Fresh parsley and lemon wedges"],
        instructions: "Pan-sear salmon in avocado oil. Sauté garlic with asparagus spears for 5 mins until bright green and tender-crisp. Serve over quinoa with lemon.",
        hormonalBenefit: "Asparagus supplies natural glutathione, protecting the ovulated egg.",
      },
      {
        mealType: "Restorative Snack",
        title: "Chilled Watermelon Cubes & Rose Hibiscus Tea",
        prepTimeMinutes: 5,
        caloriesApprox: 130,
        ingredients: ["2 cups cold watermelon cubes", "Fresh mint leaves", "1 tall glass brewed hibiscus tea over ice"],
        instructions: "Sprinkle mint over cold watermelon and sip chilled hibiscus tea.",
        hormonalBenefit: "Ultra-hydrating electrolytes support cellular radiance and temperature regulation.",
      },
    ],
    partnerGroceryList: [
      "Fresh Raspberries, Blueberries & Figs",
      "Creamy Artisanal Tahini",
      "Raw Sunflower Seeds & Sesame Seeds",
      "Fresh Asparagus & Artichoke Hearts",
      "Organic Chia Seeds & Coconut Water",
      "Hibiscus Herbal Tea & Fresh Mint",
      "Wild Sockeye Salmon Fillets",
      "Fresh Lemons & Avocados",
    ],
  },

  luteal: {
    phaseKey: "luteal",
    phaseName: "Luteal Phase",
    icon: "🌙",
    subtitle: "Nourish Progesterone, Calm PMS & Stabilize Blood Sugar",
    hormoneStatus: "Progesterone dominates to sustain the uterine lining. Estrogen drops initially before a small second wave.",
    metabolismNote: "Resting metabolic rate speeds up by ~100–300 kcal/day! Insulin sensitivity drops slightly. Your body naturally requires more complex carbs to produce calming serotonin.",
    seedCycling: {
      seeds: ["1 tbsp Raw Sesame Seeds", "1 tbsp Raw Sunflower Seeds"],
      dosage: "Add daily to roasted vegetables, warm soups, or seed butter",
      benefit: "Sunflower seeds are loaded with Vitamin E and selenium to power progesterone production, while sesame seeds modulate estrogen balance.",
    },
    micronutrients: [
      {
        nutrient: "Vitamin B6 (Pyridoxine)",
        role: "Essential for synthesis of progesterone, dopamine, and GABA to prevent premenstrual mood drops and irritability.",
        bestSources: ["Grass-fed beef", "Pasture poultry", "Bananas", "Sweet potatoes", "Chickpeas"],
      },
      {
        nutrient: "Magnesium Glycinate / Citrate",
        role: "Reduces luteal fluid retention, prevents water bloating, halts sugar cravings, and soothes tension headaches.",
        bestSources: ["Pumpkin & sunflower seeds", "Raw cacao", "Avocado", "Steamed Swiss chard"],
      },
      {
        nutrient: "Complex Slow-Release Starches",
        role: "Boosts central nervous system serotonin production naturally so you don't experience intense sugar binge impulses.",
        bestSources: ["Roasted butternut squash", "Sweet potatoes", "Brown rice", "Quinoa", "Parsnips"],
      },
      {
        nutrient: "Potassium & Vitamin E",
        role: "Balances fluid levels and reduces breast tenderness and bloating.",
        bestSources: ["Sunflower seeds", "Spinach", "Avocado", "Coconut water", "Bananas"],
      },
    ],
    nourishingFoods: [
      {
        category: "Proteins & Iron",
        items: ["Slow-cooked turkey & chicken", "Grass-fed beef chili", "Lentils & chickpeas", "Pasture eggs", "Wild white fish"],
      },
      {
        category: "Healthy Fats & Seeds",
        items: ["Sunflower seed butter", "Raw sesame seeds", "Raw sunflower seeds", "Avocado", "Extra virgin olive oil"],
      },
      {
        category: "Complex Carbs & Fiber",
        items: ["Roasted sweet potatoes", "Butternut squash soup", "Quinoa & brown basmati rice", "Baked apples with cinnamon", "Cooked carrots"],
      },
      {
        category: "Healing Teas & Hydration",
        items: ["Organic chamomile tea", "Dandelion root tea (bloat relief)", "Cinnamon chai with almond milk", "Golden turmeric milk"],
      },
    ],
    foodsToLimit: [
      { food: "Excess Table Salt & Salty Snacks", reason: "Progesterone already increases water retention; high sodium causes heavy bloating and puffiness." },
      { food: "Refined Sugar & Simple Pastries", reason: "Causes severe glucose crashes that trigger emotional rollercoasters and mood swings." },
      { food: "Excessive Afternoon Caffeine", reason: "Depletes magnesium, spikes nighttime cortisol, and triggers luteal insomnia." },
    ],
    meals: [
      {
        mealType: "Breakfast",
        title: "Warm Spiced Sweet Potato & Sunflower Seed Bowl",
        prepTimeMinutes: 12,
        caloriesApprox: 430,
        ingredients: ["1 cup baked sweet potato (mashed)", "1 tbsp sunflower seed butter", "1 tbsp raw sunflower seeds", "1/2 cup warm almond milk", "Dash of cinnamon & nutmeg", "1 scoop collagen or protein", "Handful of blueberries"],
        instructions: "Mash baked sweet potato with warm almond milk, cinnamon, and protein. Top with creamy sunflower seed butter and crunchy sunflower seeds.",
        hormonalBenefit: "Slow-release carbs provide all-day serotonin and vitamin B6 to prevent late-afternoon mood dips.",
      },
      {
        mealType: "Lunch",
        title: "Hearty Quinoa, Roasted Squash & Turkey Nourish Bowl",
        prepTimeMinutes: 15,
        caloriesApprox: 520,
        ingredients: ["1 cup cooked warm quinoa", "1 cup roasted butternut squash cubes", "4 oz roasted sliced turkey breast", "1/4 avocado", "2 cups steamed kale or spinach", "1 tbsp tahini dressing", "1 tbsp toasted sesame seeds"],
        instructions: "Assemble warm roasted squash and turkey over quinoa and greens. Drizzle with lemon tahini and sprinkle with sesame seeds.",
        hormonalBenefit: "Turkey provides tryptophan (serotonin precursor) while squash fuels natural luteal caloric demand.",
      },
      {
        mealType: "Dinner",
        title: "Grass-Fed Beef & Black Bean Chili with Avocado",
        prepTimeMinutes: 25,
        caloriesApprox: 560,
        ingredients: ["5 oz lean grass-fed ground beef or lentils", "1/2 cup black beans", "1 cup crushed tomatoes with cumin & oregano", "1/4 avocado cubed", "Fresh cilantro", "Optional warm brown rice"],
        instructions: "Simmer beef, black beans, tomatoes, and warm spices for 20 mins. Serve topped with fresh diced avocado and cilantro.",
        hormonalBenefit: "Magnesium, iron, and potassium prevent fluid retention and provide deep satiety.",
      },
      {
        mealType: "Restorative Snack",
        title: "Golden Turmeric Milk & Dark Chocolate Square",
        prepTimeMinutes: 5,
        caloriesApprox: 190,
        ingredients: ["1 cup warm almond or oat milk", "1/2 tsp ground turmeric", "1/4 tsp ground ginger", "Pinch of black pepper", "1 tsp raw honey", "1 square 80%+ dark chocolate"],
        instructions: "Froth warm milk with turmeric, ginger, and honey. Enjoy with a square of dark chocolate before bed.",
        hormonalBenefit: "Turmeric lowers luteal prostaglandin inflammation and promotes deep restorative sleep.",
      },
    ],
    partnerGroceryList: [
      "Sweet Potatoes & Butternut Squash",
      "Sunflower Seed Butter & Raw Sunflower Seeds",
      "Raw Sesame Seeds & Artisanal Tahini",
      "Grass-Fed Ground Beef or Turkey",
      "Organic Chamomile & Dandelion Root Tea",
      "Dark Chocolate (>80% cocoa)",
      "Turmeric, Ceylon Cinnamon & Raw Honey",
      "Creamy Avocados & Black Beans",
    ],
  },
};
