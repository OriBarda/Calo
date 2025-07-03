import { prisma } from "../lib/database";

export interface MealPlanTemplate {
  template_id: string;
  name: string;
  description?: string;
  meal_timing: string;
  dietary_category: string;
  prep_time_minutes?: number;
  difficulty_level?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  ingredients: any[];
  instructions: any[];
  allergens: string[];
  image_url?: string;
}

export interface UserMealPlanConfig {
  name: string;
  meals_per_day: number;
  snacks_per_day: number;
  rotation_frequency_days: number;
  include_leftovers: boolean;
  fixed_meal_times: boolean;
  dietary_preferences: string[];
  excluded_ingredients: string[];
}

export interface WeeklyMealPlan {
  [day: string]: {
    [mealTiming: string]: MealPlanTemplate[];
  };
}

export class MealPlanService {
  static async createUserMealPlan(user_id: string, config: UserMealPlanConfig) {
    try {
      console.log("🍽️ Creating meal plan for user:", user_id);

      // Get user's questionnaire data for personalization
      const questionnaire = await prisma.userQuestionnaire.findFirst({
        where: { user_id },
        orderBy: { date_completed: "desc" },
      });

      // Get user's nutrition goals
      const nutritionPlan = await prisma.nutritionPlan.findFirst({
        where: { user_id },
        orderBy: { created_at: "desc" },
      });

      // Create the meal plan
      const mealPlan = await prisma.userMealPlan.create({
        data: {
          user_id,
          name: config.name,
          plan_type: "WEEKLY",
          meals_per_day: config.meals_per_day,
          snacks_per_day: config.snacks_per_day,
          rotation_frequency_days: config.rotation_frequency_days,
          include_leftovers: config.include_leftovers,
          fixed_meal_times: config.fixed_meal_times,
          target_calories_daily: nutritionPlan?.goal_calories || 2000,
          target_protein_daily: nutritionPlan?.goal_protein_g || 150,
          target_carbs_daily: nutritionPlan?.goal_carbs_g || 250,
          target_fats_daily: nutritionPlan?.goal_fats_g || 67,
          dietary_preferences: config.dietary_preferences,
          excluded_ingredients: config.excluded_ingredients,
          start_date: new Date(),
        },
      });

      // Generate meal schedule based on preferences
      await this.generateMealSchedule(mealPlan.plan_id, config, questionnaire);

      console.log("✅ Meal plan created successfully");
      return mealPlan;
    } catch (error) {
      console.error("💥 Error creating meal plan:", error);
      throw new Error("Failed to create meal plan");
    }
  }

  static async generateMealSchedule(
    plan_id: string,
    config: UserMealPlanConfig,
    questionnaire: any
  ) {
    try {
      console.log("📅 Generating meal schedule for plan:", plan_id);

      // Get suitable meal templates based on dietary preferences
      const templates = await this.getMealTemplatesForUser(config, questionnaire);

      // Generate schedule for each day of the week
      for (let day = 0; day < 7; day++) {
        // Generate main meals
        const mealTimings = this.getMealTimingsForDay(config.meals_per_day);
        
        for (let i = 0; i < mealTimings.length; i++) {
          const timing = mealTimings[i];
          const suitableTemplates = templates.filter(t => 
            t.meal_timing === timing || 
            (timing === "BREAKFAST" && t.meal_timing === "BREAKFAST") ||
            (timing === "LUNCH" && t.meal_timing === "LUNCH") ||
            (timing === "DINNER" && t.meal_timing === "DINNER")
          );

          if (suitableTemplates.length > 0) {
            // Rotate templates based on rotation frequency
            const templateIndex = Math.floor(day / config.rotation_frequency_days) % suitableTemplates.length;
            const selectedTemplate = suitableTemplates[templateIndex];

            await prisma.mealPlanSchedule.create({
              data: {
                plan_id,
                template_id: selectedTemplate.template_id,
                day_of_week: day,
                meal_timing: timing as any,
                meal_order: i + 1,
                portion_multiplier: 1.0,
              },
            });
          }
        }

        // Generate snacks if requested
        if (config.snacks_per_day > 0) {
          const snackTemplates = templates.filter(t => 
            t.meal_timing === "SNACK" || 
            t.meal_timing === "MORNING_SNACK" || 
            t.meal_timing === "AFTERNOON_SNACK"
          );

          for (let s = 0; s < config.snacks_per_day; s++) {
            if (snackTemplates.length > 0) {
              const snackIndex = (day + s) % snackTemplates.length;
              const selectedSnack = snackTemplates[snackIndex];
              const snackTiming = s === 0 ? "MORNING_SNACK" : "AFTERNOON_SNACK";

              await prisma.mealPlanSchedule.create({
                data: {
                  plan_id,
                  template_id: selectedSnack.template_id,
                  day_of_week: day,
                  meal_timing: snackTiming as any,
                  meal_order: s + 1,
                  portion_multiplier: 0.5, // Smaller portions for snacks
                  is_optional: true,
                },
              });
            }
          }
        }
      }

      console.log("✅ Meal schedule generated successfully");
    } catch (error) {
      console.error("💥 Error generating meal schedule:", error);
      throw error;
    }
  }

  static async getMealTemplatesForUser(config: UserMealPlanConfig, questionnaire: any) {
    try {
      // Determine dietary categories based on preferences
      const dietaryCategories = this.getDietaryCategoriesFromPreferences(
        config.dietary_preferences,
        questionnaire
      );

      // Get templates that match user preferences
      const templates = await prisma.mealTemplate.findMany({
        where: {
          is_active: true,
          dietary_category: {
            in: dietaryCategories,
          },
          // Exclude templates with excluded ingredients
          NOT: config.excluded_ingredients.length > 0 ? {
            ingredients_json: {
              path: [],
              array_contains: config.excluded_ingredients,
            },
          } : undefined,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return templates.map(template => ({
        template_id: template.template_id,
        name: template.name,
        description: template.description,
        meal_timing: template.meal_timing,
        dietary_category: template.dietary_category,
        prep_time_minutes: template.prep_time_minutes,
        difficulty_level: template.difficulty_level,
        calories: template.calories,
        protein_g: template.protein_g,
        carbs_g: template.carbs_g,
        fats_g: template.fats_g,
        fiber_g: template.fiber_g,
        sugar_g: template.sugar_g,
        sodium_mg: template.sodium_mg,
        ingredients: template.ingredients_json as any[] || [],
        instructions: template.instructions_json as any[] || [],
        allergens: template.allergens_json as string[] || [],
        image_url: template.image_url,
      }));
    } catch (error) {
      console.error("💥 Error getting meal templates:", error);
      throw error;
    }
  }

  static async getUserMealPlan(user_id: string, plan_id?: string): Promise<WeeklyMealPlan> {
    try {
      console.log("📋 Getting meal plan for user:", user_id);

      // Get the active meal plan or specific plan
      const mealPlan = await prisma.userMealPlan.findFirst({
        where: {
          user_id,
          ...(plan_id ? { plan_id } : { is_active: true }),
        },
        include: {
          schedules: {
            include: {
              template: true,
            },
            orderBy: [
              { day_of_week: "asc" },
              { meal_timing: "asc" },
              { meal_order: "asc" },
            ],
          },
        },
      });

      if (!mealPlan) {
        throw new Error("No active meal plan found");
      }

      // Organize by day and meal timing
      const weeklyPlan: WeeklyMealPlan = {};
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      for (let day = 0; day < 7; day++) {
        const dayName = dayNames[day];
        weeklyPlan[dayName] = {};

        const daySchedules = mealPlan.schedules.filter(s => s.day_of_week === day);

        // Group by meal timing
        const timingGroups = daySchedules.reduce((acc, schedule) => {
          const timing = schedule.meal_timing;
          if (!acc[timing]) acc[timing] = [];
          acc[timing].push({
            template_id: schedule.template.template_id,
            name: schedule.template.name,
            description: schedule.template.description,
            meal_timing: schedule.template.meal_timing,
            dietary_category: schedule.template.dietary_category,
            prep_time_minutes: schedule.template.prep_time_minutes,
            difficulty_level: schedule.template.difficulty_level,
            calories: (schedule.template.calories || 0) * schedule.portion_multiplier,
            protein_g: (schedule.template.protein_g || 0) * schedule.portion_multiplier,
            carbs_g: (schedule.template.carbs_g || 0) * schedule.portion_multiplier,
            fats_g: (schedule.template.fats_g || 0) * schedule.portion_multiplier,
            fiber_g: (schedule.template.fiber_g || 0) * schedule.portion_multiplier,
            sugar_g: (schedule.template.sugar_g || 0) * schedule.portion_multiplier,
            sodium_mg: (schedule.template.sodium_mg || 0) * schedule.portion_multiplier,
            ingredients: schedule.template.ingredients_json as any[] || [],
            instructions: schedule.template.instructions_json as any[] || [],
            allergens: schedule.template.allergens_json as string[] || [],
            image_url: schedule.template.image_url,
          });
          return acc;
        }, {} as Record<string, MealPlanTemplate[]>);

        weeklyPlan[dayName] = timingGroups;
      }

      console.log("✅ Meal plan retrieved successfully");
      return weeklyPlan;
    } catch (error) {
      console.error("💥 Error getting meal plan:", error);
      throw error;
    }
  }

  static async replaceMealInPlan(
    user_id: string,
    plan_id: string,
    day_of_week: number,
    meal_timing: string,
    meal_order: number,
    new_template_id: string
  ) {
    try {
      console.log("🔄 Replacing meal in plan:", { plan_id, day_of_week, meal_timing, meal_order });

      // Verify the plan belongs to the user
      const mealPlan = await prisma.userMealPlan.findFirst({
        where: { plan_id, user_id },
      });

      if (!mealPlan) {
        throw new Error("Meal plan not found");
      }

      // Update the schedule
      await prisma.mealPlanSchedule.updateMany({
        where: {
          plan_id,
          day_of_week,
          meal_timing: meal_timing as any,
          meal_order,
        },
        data: {
          template_id: new_template_id,
        },
      });

      console.log("✅ Meal replaced successfully");
      return { success: true };
    } catch (error) {
      console.error("💥 Error replacing meal:", error);
      throw error;
    }
  }

  static async generateShoppingList(user_id: string, plan_id: string, week_start_date: string) {
    try {
      console.log("🛒 Generating shopping list for plan:", plan_id);

      const mealPlan = await prisma.userMealPlan.findFirst({
        where: { plan_id, user_id },
        include: {
          schedules: {
            include: {
              template: true,
            },
          },
        },
      });

      if (!mealPlan) {
        throw new Error("Meal plan not found");
      }

      // Aggregate ingredients from all meals
      const ingredientMap = new Map<string, { quantity: number; unit: string; category: string }>();

      mealPlan.schedules.forEach(schedule => {
        const ingredients = schedule.template.ingredients_json as any[] || [];
        ingredients.forEach(ingredient => {
          const key = ingredient.name.toLowerCase();
          const existing = ingredientMap.get(key);
          
          if (existing) {
            existing.quantity += (ingredient.quantity || 1) * schedule.portion_multiplier;
          } else {
            ingredientMap.set(key, {
              quantity: (ingredient.quantity || 1) * schedule.portion_multiplier,
              unit: ingredient.unit || "piece",
              category: ingredient.category || "Other",
            });
          }
        });
      });

      // Convert to shopping list format
      const shoppingItems = Array.from(ingredientMap.entries()).map(([name, details]) => ({
        name,
        quantity: Math.ceil(details.quantity),
        unit: details.unit,
        category: details.category,
        estimated_cost: this.estimateIngredientCost(name, details.quantity, details.unit),
        is_purchased: false,
      }));

      // Group by category
      const groupedItems = shoppingItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate total estimated cost
      const totalCost = shoppingItems.reduce((sum, item) => sum + item.estimated_cost, 0);

      // Create shopping list
      const shoppingList = await prisma.shoppingList.create({
        data: {
          user_id,
          plan_id,
          name: `Shopping List - Week of ${week_start_date}`,
          week_start_date: new Date(week_start_date),
          items_json: groupedItems,
          total_estimated_cost: totalCost,
        },
      });

      console.log("✅ Shopping list generated successfully");
      return shoppingList;
    } catch (error) {
      console.error("💥 Error generating shopping list:", error);
      throw error;
    }
  }

  static async saveMealPreference(
    user_id: string,
    template_id: string,
    preference_type: string,
    rating?: number,
    notes?: string
  ) {
    try {
      console.log("💝 Saving meal preference:", { template_id, preference_type, rating });

      const preference = await prisma.userMealPreference.upsert({
        where: {
          user_id_template_id_preference_type: {
            user_id,
            template_id,
            preference_type,
          },
        },
        update: {
          rating,
          notes,
          updated_at: new Date(),
        },
        create: {
          user_id,
          template_id,
          preference_type,
          rating,
          notes,
        },
      });

      console.log("✅ Meal preference saved successfully");
      return preference;
    } catch (error) {
      console.error("💥 Error saving meal preference:", error);
      throw error;
    }
  }

  // Helper methods

  private static getMealTimingsForDay(meals_per_day: number): string[] {
    switch (meals_per_day) {
      case 2:
        return ["BREAKFAST", "DINNER"];
      case 3:
        return ["BREAKFAST", "LUNCH", "DINNER"];
      case 4:
        return ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
      case 5:
        return ["BREAKFAST", "MORNING_SNACK", "LUNCH", "AFTERNOON_SNACK", "DINNER"];
      default:
        return ["BREAKFAST", "LUNCH", "DINNER"];
    }
  }

  private static getDietaryCategoriesFromPreferences(
    preferences: string[],
    questionnaire: any
  ): string[] {
    const categories = ["BALANCED"]; // Default category

    if (preferences.includes("vegetarian") || questionnaire?.dietary_preferences?.includes("vegetarian")) {
      categories.push("VEGETARIAN");
    }
    if (preferences.includes("vegan") || questionnaire?.dietary_preferences?.includes("vegan")) {
      categories.push("VEGAN");
    }
    if (preferences.includes("keto") || questionnaire?.dietary_preferences?.includes("keto")) {
      categories.push("KETO");
    }
    if (preferences.includes("paleo") || questionnaire?.dietary_preferences?.includes("paleo")) {
      categories.push("PALEO");
    }
    if (preferences.includes("mediterranean")) {
      categories.push("MEDITERRANEAN");
    }
    if (preferences.includes("low_carb")) {
      categories.push("LOW_CARB");
    }
    if (preferences.includes("high_protein")) {
      categories.push("HIGH_PROTEIN");
    }
    if (preferences.includes("gluten_free") || questionnaire?.allergies?.includes("gluten")) {
      categories.push("GLUTEN_FREE");
    }
    if (preferences.includes("dairy_free") || questionnaire?.allergies?.includes("dairy")) {
      categories.push("DAIRY_FREE");
    }

    return categories;
  }

  private static estimateIngredientCost(name: string, quantity: number, unit: string): number {
    // Simple cost estimation - in a real app, you'd use actual pricing data
    const baseCosts: Record<string, number> = {
      // Proteins (per 100g)
      "chicken": 3.0,
      "beef": 5.0,
      "fish": 4.0,
      "eggs": 0.5,
      "tofu": 2.0,
      
      // Vegetables (per 100g)
      "tomato": 0.8,
      "onion": 0.5,
      "carrot": 0.6,
      "broccoli": 1.2,
      "spinach": 1.5,
      
      // Grains (per 100g)
      "rice": 0.3,
      "pasta": 0.4,
      "bread": 0.8,
      "oats": 0.5,
      
      // Default
      "default": 1.0,
    };

    const baseCost = baseCosts[name.toLowerCase()] || baseCosts.default;
    const quantityMultiplier = unit === "kg" ? quantity * 10 : quantity;
    
    return Math.round(baseCost * quantityMultiplier * 100) / 100;
  }
}