import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample meal templates
  const mealTemplates = [
    {
      name: "Avocado Toast with Eggs",
      description: "Whole grain toast topped with mashed avocado and poached eggs",
      meal_timing: "BREAKFAST",
      dietary_category: "BALANCED",
      prep_time_minutes: 15,
      difficulty_level: 2,
      calories: 420,
      protein_g: 18,
      carbs_g: 32,
      fats_g: 24,
      fiber_g: 12,
      sugar_g: 3,
      sodium_mg: 380,
      ingredients_json: [
        { name: "Whole grain bread", quantity: 2, unit: "slices", category: "Grains" },
        { name: "Avocado", quantity: 1, unit: "medium", category: "Produce" },
        { name: "Eggs", quantity: 2, unit: "large", category: "Dairy" },
        { name: "Lemon juice", quantity: 1, unit: "tsp", category: "Condiments" },
        { name: "Salt", quantity: 0.5, unit: "tsp", category: "Spices" },
        { name: "Black pepper", quantity: 0.25, unit: "tsp", category: "Spices" },
      ],
      instructions_json: [
        { step: 1, text: "Toast the bread slices until golden brown" },
        { step: 2, text: "Mash avocado with lemon juice, salt, and pepper" },
        { step: 3, text: "Poach eggs in simmering water for 3-4 minutes" },
        { step: 4, text: "Spread avocado on toast and top with poached eggs" },
      ],
      allergens_json: ["gluten", "eggs"],
      image_url: "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg",
    },
    {
      name: "Greek Yogurt Parfait",
      description: "Layered Greek yogurt with berries and granola",
      meal_timing: "BREAKFAST",
      dietary_category: "HIGH_PROTEIN",
      prep_time_minutes: 5,
      difficulty_level: 1,
      calories: 320,
      protein_g: 20,
      carbs_g: 35,
      fats_g: 8,
      fiber_g: 6,
      sugar_g: 18,
      sodium_mg: 120,
      ingredients_json: [
        { name: "Greek yogurt", quantity: 200, unit: "g", category: "Dairy" },
        { name: "Mixed berries", quantity: 100, unit: "g", category: "Produce" },
        { name: "Granola", quantity: 30, unit: "g", category: "Grains" },
        { name: "Honey", quantity: 1, unit: "tbsp", category: "Condiments" },
      ],
      instructions_json: [
        { step: 1, text: "Layer yogurt, berries, and granola in a glass" },
        { step: 2, text: "Drizzle with honey" },
        { step: 3, text: "Repeat layers and serve immediately" },
      ],
      allergens_json: ["dairy"],
      image_url: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
    },
    {
      name: "Mediterranean Quinoa Bowl",
      description: "Quinoa bowl with vegetables, feta, and tahini dressing",
      meal_timing: "LUNCH",
      dietary_category: "MEDITERRANEAN",
      prep_time_minutes: 25,
      difficulty_level: 2,
      calories: 480,
      protein_g: 16,
      carbs_g: 58,
      fats_g: 18,
      fiber_g: 8,
      sugar_g: 12,
      sodium_mg: 420,
      ingredients_json: [
        { name: "Quinoa", quantity: 80, unit: "g", category: "Grains" },
        { name: "Cherry tomatoes", quantity: 150, unit: "g", category: "Produce" },
        { name: "Cucumber", quantity: 100, unit: "g", category: "Produce" },
        { name: "Red onion", quantity: 50, unit: "g", category: "Produce" },
        { name: "Feta cheese", quantity: 50, unit: "g", category: "Dairy" },
        { name: "Olive oil", quantity: 2, unit: "tbsp", category: "Oils" },
        { name: "Lemon juice", quantity: 1, unit: "tbsp", category: "Condiments" },
      ],
      instructions_json: [
        { step: 1, text: "Cook quinoa according to package instructions" },
        { step: 2, text: "Chop vegetables and mix with olive oil and lemon" },
        { step: 3, text: "Combine quinoa with vegetables" },
        { step: 4, text: "Top with crumbled feta cheese" },
      ],
      allergens_json: ["dairy"],
      image_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    },
    {
      name: "Grilled Salmon with Vegetables",
      description: "Herb-crusted salmon with roasted seasonal vegetables",
      meal_timing: "DINNER",
      dietary_category: "HIGH_PROTEIN",
      prep_time_minutes: 30,
      difficulty_level: 3,
      calories: 520,
      protein_g: 35,
      carbs_g: 25,
      fats_g: 28,
      fiber_g: 8,
      sugar_g: 12,
      sodium_mg: 380,
      ingredients_json: [
        { name: "Salmon fillet", quantity: 150, unit: "g", category: "Protein" },
        { name: "Broccoli", quantity: 200, unit: "g", category: "Produce" },
        { name: "Sweet potato", quantity: 150, unit: "g", category: "Produce" },
        { name: "Olive oil", quantity: 2, unit: "tbsp", category: "Oils" },
        { name: "Herbs (dill, parsley)", quantity: 2, unit: "tbsp", category: "Spices" },
        { name: "Lemon", quantity: 0.5, unit: "piece", category: "Produce" },
      ],
      instructions_json: [
        { step: 1, text: "Preheat oven to 200°C" },
        { step: 2, text: "Season salmon with herbs and lemon" },
        { step: 3, text: "Roast vegetables with olive oil for 20 minutes" },
        { step: 4, text: "Grill salmon for 4-5 minutes per side" },
        { step: 5, text: "Serve salmon with roasted vegetables" },
      ],
      allergens_json: ["fish"],
      image_url: "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg",
    },
    {
      name: "Vegetarian Buddha Bowl",
      description: "Colorful bowl with quinoa, roasted vegetables, and tahini dressing",
      meal_timing: "LUNCH",
      dietary_category: "VEGETARIAN",
      prep_time_minutes: 35,
      difficulty_level: 2,
      calories: 450,
      protein_g: 14,
      carbs_g: 62,
      fats_g: 16,
      fiber_g: 12,
      sugar_g: 15,
      sodium_mg: 320,
      ingredients_json: [
        { name: "Quinoa", quantity: 80, unit: "g", category: "Grains" },
        { name: "Sweet potato", quantity: 150, unit: "g", category: "Produce" },
        { name: "Chickpeas", quantity: 100, unit: "g", category: "Protein" },
        { name: "Kale", quantity: 100, unit: "g", category: "Produce" },
        { name: "Avocado", quantity: 0.5, unit: "medium", category: "Produce" },
        { name: "Tahini", quantity: 2, unit: "tbsp", category: "Condiments" },
        { name: "Lemon juice", quantity: 1, unit: "tbsp", category: "Condiments" },
      ],
      instructions_json: [
        { step: 1, text: "Cook quinoa and roast sweet potato cubes" },
        { step: 2, text: "Massage kale with lemon juice" },
        { step: 3, text: "Arrange all ingredients in a bowl" },
        { step: 4, text: "Drizzle with tahini dressing" },
      ],
      allergens_json: ["sesame"],
      image_url: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg",
    },
    {
      name: "Protein Smoothie Bowl",
      description: "Thick smoothie bowl topped with fruits and nuts",
      meal_timing: "BREAKFAST",
      dietary_category: "HIGH_PROTEIN",
      prep_time_minutes: 10,
      difficulty_level: 1,
      calories: 380,
      protein_g: 25,
      carbs_g: 42,
      fats_g: 12,
      fiber_g: 8,
      sugar_g: 28,
      sodium_mg: 150,
      ingredients_json: [
        { name: "Protein powder", quantity: 30, unit: "g", category: "Supplements" },
        { name: "Frozen berries", quantity: 150, unit: "g", category: "Produce" },
        { name: "Banana", quantity: 1, unit: "medium", category: "Produce" },
        { name: "Almond milk", quantity: 200, unit: "ml", category: "Dairy" },
        { name: "Almonds", quantity: 20, unit: "g", category: "Nuts" },
        { name: "Chia seeds", quantity: 1, unit: "tbsp", category: "Seeds" },
      ],
      instructions_json: [
        { step: 1, text: "Blend protein powder, berries, banana, and almond milk" },
        { step: 2, text: "Pour into a bowl" },
        { step: 3, text: "Top with almonds and chia seeds" },
      ],
      allergens_json: ["nuts", "dairy"],
      image_url: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
    },
    {
      name: "Mixed Nuts and Fruit",
      description: "Healthy snack with mixed nuts and dried fruit",
      meal_timing: "SNACK",
      dietary_category: "BALANCED",
      prep_time_minutes: 2,
      difficulty_level: 1,
      calories: 180,
      protein_g: 6,
      carbs_g: 12,
      fats_g: 14,
      fiber_g: 3,
      sugar_g: 8,
      sodium_mg: 5,
      ingredients_json: [
        { name: "Mixed nuts", quantity: 30, unit: "g", category: "Nuts" },
        { name: "Dried fruit", quantity: 20, unit: "g", category: "Produce" },
      ],
      instructions_json: [
        { step: 1, text: "Mix nuts and dried fruit in a small bowl" },
        { step: 2, text: "Serve immediately" },
      ],
      allergens_json: ["nuts"],
      image_url: "https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg",
    },
    {
      name: "Hummus with Vegetables",
      description: "Fresh vegetables with homemade or store-bought hummus",
      meal_timing: "SNACK",
      dietary_category: "VEGETARIAN",
      prep_time_minutes: 5,
      difficulty_level: 1,
      calories: 150,
      protein_g: 6,
      carbs_g: 18,
      fats_g: 6,
      fiber_g: 6,
      sugar_g: 8,
      sodium_mg: 240,
      ingredients_json: [
        { name: "Hummus", quantity: 60, unit: "g", category: "Condiments" },
        { name: "Carrot sticks", quantity: 100, unit: "g", category: "Produce" },
        { name: "Cucumber slices", quantity: 100, unit: "g", category: "Produce" },
        { name: "Bell pepper strips", quantity: 80, unit: "g", category: "Produce" },
      ],
      instructions_json: [
        { step: 1, text: "Cut vegetables into sticks and slices" },
        { step: 2, text: "Serve with hummus for dipping" },
      ],
      allergens_json: ["sesame"],
      image_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    },
  ];

  console.log('📝 Creating meal templates...');
  
  for (const template of mealTemplates) {
    await prisma.mealTemplate.create({
      data: {
        ...template,
        meal_timing: template.meal_timing as any,
        dietary_category: template.dietary_category as any,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${mealTemplates.length} meal templates`);
}

main()
  .catch((e) => {
    console.error('💥 Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });