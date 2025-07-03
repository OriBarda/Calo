import { Router } from "express";
import { MealPlanService } from "../services/mealPlans";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Validation schemas
const createMealPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  meals_per_day: z.number().min(2).max(6),
  snacks_per_day: z.number().min(0).max(3),
  rotation_frequency_days: z.number().min(1).max(14),
  include_leftovers: z.boolean(),
  fixed_meal_times: z.boolean(),
  dietary_preferences: z.array(z.string()),
  excluded_ingredients: z.array(z.string()),
});

const replaceMealSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  meal_timing: z.string(),
  meal_order: z.number().min(1),
  new_template_id: z.string(),
});

const mealPreferenceSchema = z.object({
  template_id: z.string(),
  preference_type: z.enum(["favorite", "dislike", "rating"]),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

// Create a new meal plan
router.post("/create", async (req: AuthRequest, res) => {
  try {
    const validatedData = createMealPlanSchema.parse(req.body);
    
    console.log("🍽️ Create meal plan request for user:", req.user.user_id);

    const mealPlan = await MealPlanService.createUserMealPlan(
      req.user.user_id,
      validatedData
    );

    res.json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error("💥 Create meal plan error:", error);
    const message = error instanceof Error ? error.message : "Failed to create meal plan";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Get user's current meal plan
router.get("/current", async (req: AuthRequest, res) => {
  try {
    console.log("📋 Get current meal plan request for user:", req.user.user_id);

    const weeklyPlan = await MealPlanService.getUserMealPlan(req.user.user_id);

    res.json({
      success: true,
      data: weeklyPlan,
    });
  } catch (error) {
    console.error("💥 Get meal plan error:", error);
    const message = error instanceof Error ? error.message : "Failed to get meal plan";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Get specific meal plan
router.get("/:planId", async (req: AuthRequest, res) => {
  try {
    const { planId } = req.params;
    
    console.log("📋 Get meal plan request:", planId, "for user:", req.user.user_id);

    const weeklyPlan = await MealPlanService.getUserMealPlan(req.user.user_id, planId);

    res.json({
      success: true,
      data: weeklyPlan,
    });
  } catch (error) {
    console.error("💥 Get meal plan error:", error);
    const message = error instanceof Error ? error.message : "Failed to get meal plan";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Replace a meal in the plan
router.put("/:planId/replace", async (req: AuthRequest, res) => {
  try {
    const { planId } = req.params;
    const validatedData = replaceMealSchema.parse(req.body);
    
    console.log("🔄 Replace meal request for plan:", planId);

    await MealPlanService.replaceMealInPlan(
      req.user.user_id,
      planId,
      validatedData.day_of_week,
      validatedData.meal_timing,
      validatedData.meal_order,
      validatedData.new_template_id
    );

    res.json({
      success: true,
      message: "Meal replaced successfully",
    });
  } catch (error) {
    console.error("💥 Replace meal error:", error);
    const message = error instanceof Error ? error.message : "Failed to replace meal";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Generate shopping list
router.post("/:planId/shopping-list", async (req: AuthRequest, res) => {
  try {
    const { planId } = req.params;
    const { week_start_date } = req.body;
    
    if (!week_start_date) {
      return res.status(400).json({
        success: false,
        error: "Week start date is required",
      });
    }

    console.log("🛒 Generate shopping list request for plan:", planId);

    const shoppingList = await MealPlanService.generateShoppingList(
      req.user.user_id,
      planId,
      week_start_date
    );

    res.json({
      success: true,
      data: shoppingList,
    });
  } catch (error) {
    console.error("💥 Generate shopping list error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate shopping list";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Save meal preference
router.post("/preferences", async (req: AuthRequest, res) => {
  try {
    const validatedData = mealPreferenceSchema.parse(req.body);
    
    console.log("💝 Save meal preference request for user:", req.user.user_id);

    const preference = await MealPlanService.saveMealPreference(
      req.user.user_id,
      validatedData.template_id,
      validatedData.preference_type,
      validatedData.rating,
      validatedData.notes
    );

    res.json({
      success: true,
      data: preference,
    });
  } catch (error) {
    console.error("💥 Save meal preference error:", error);
    const message = error instanceof Error ? error.message : "Failed to save meal preference";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

export { router as mealPlanRoutes };