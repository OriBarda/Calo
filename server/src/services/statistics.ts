import { prisma } from "../lib/database";

export interface NutritionStatistics {
  averageCaloriesDaily: number;
  calorieGoalAchievementPercent: number;
  averageProteinDaily: number;
  averageCarbsDaily: number;
  averageFatsDaily: number;
  averageFiberDaily: number;
  averageSodiumDaily: number;
  averageSugarDaily: number;
  averageFluidsDaily: number;
  processedFoodPercentage: number;
  alcoholCaffeineIntake: number;
  vegetableFruitIntake: number;
  fullLoggingPercentage: number;
  allergenAlerts: string[];
  healthRiskPercentage: number;
  averageEatingHours: { start: string; end: string };
  intermittentFastingHours: number;
  missedMealsAlert: number;
  nutritionScore: number;
  weeklyTrends: {
    calories: number[];
    protein: number[];
    carbs: number[];
    fats: number[];
  };
  insights: string[];
  recommendations: string[];
}

export interface GlobalStatistics {
  generalStats: {
    averageCaloriesPerMeal: number;
    averageProteinPerMeal: number;
    mostCommonMealTime: string;
    averageMealsPerDay: number;
  };
  healthInsights: {
    proteinAdequacy: string;
    calorieDistribution: string;
    fiberIntake: string;
  };
  recommendations: {
    nutritionalTips: string[];
    mealTimingTips: string[];
    hydrationTips: string[];
  };
}

export class StatisticsService {
  static async getNutritionStatistics(
    userId: string,
    period: "week" | "month" | "custom" = "week"
  ): Promise<GlobalStatistics> {
    try {
      console.log(`📊 Generating statistics for user: ${userId}, period: ${period}`);

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get user's meals for the period
      const meals = await prisma.meal.findMany({
        where: {
          user_id: userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`📋 Found ${meals.length} meals for analysis`);

      // Calculate basic statistics
      const totalMeals = meals.length;
      const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0);

      const averageCaloriesPerMeal = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;
      const averageProteinPerMeal = totalMeals > 0 ? Math.round(totalProtein / totalMeals) : 0;

      // Calculate most common meal time
      const mealTimes = meals.map(meal => {
        const hour = new Date(meal.createdAt).getHours();
        if (hour >= 6 && hour < 11) return "Morning";
        if (hour >= 11 && hour < 15) return "Afternoon";
        if (hour >= 15 && hour < 20) return "Evening";
        return "Night";
      });

      const timeFrequency = mealTimes.reduce((acc, time) => {
        acc[time] = (acc[time] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonMealTime = Object.entries(timeFrequency)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || "Afternoon";

      // Calculate average meals per day
      const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const averageMealsPerDay = Math.round((totalMeals / daysDiff) * 10) / 10;

      // Generate health insights
      const proteinAdequacy = averageProteinPerMeal >= 20 
        ? "Great protein intake! You're meeting recommended levels."
        : averageProteinPerMeal >= 15
        ? "Good protein intake, consider adding more protein-rich foods."
        : "Low protein intake. Try to include more lean meats, legumes, or dairy.";

      const calorieDistribution = averageCaloriesPerMeal >= 400
        ? "Your meals are calorie-dense. Consider portion control if weight management is a goal."
        : averageCaloriesPerMeal >= 250
        ? "Well-balanced meal sizes for most adults."
        : "Your meals might be too small. Consider adding healthy fats and complex carbs.";

      const fiberIntake = "Most people need 25-35g of fiber daily. Include more fruits, vegetables, and whole grains.";

      // Generate recommendations
      const nutritionalTips = [
        "Aim for a colorful plate with vegetables of different colors",
        "Include lean protein in every meal for satiety",
        "Choose whole grains over refined carbohydrates",
        "Stay hydrated with 8-10 glasses of water daily",
        "Limit processed foods and added sugars",
      ];

      const mealTimingTips = [
        "Try to eat at consistent times each day",
        "Don't skip breakfast - it kickstarts your metabolism",
        "Have your largest meal earlier in the day",
        "Stop eating 2-3 hours before bedtime",
      ];

      const hydrationTips = [
        "Start your day with a glass of water",
        "Drink water before, during, and after exercise",
        "Eat water-rich foods like fruits and vegetables",
        "Monitor your urine color - pale yellow is ideal",
      ];

      const statistics: GlobalStatistics = {
        generalStats: {
          averageCaloriesPerMeal,
          averageProteinPerMeal,
          mostCommonMealTime,
          averageMealsPerDay,
        },
        healthInsights: {
          proteinAdequacy,
          calorieDistribution,
          fiberIntake,
        },
        recommendations: {
          nutritionalTips,
          mealTimingTips,
          hydrationTips,
        },
      };

      console.log("✅ Statistics generated successfully");
      return statistics;
    } catch (error) {
      console.error("💥 Error generating statistics:", error);
      throw new Error("Failed to generate nutrition statistics");
    }
  }

  static async generatePDFReport(userId: string): Promise<Buffer> {
    try {
      console.log(`📄 Generating PDF report for user: ${userId}`);
      
      // This is a placeholder implementation
      // In a real app, you'd use a PDF generation library like puppeteer or jsPDF
      const reportContent = `
        Nutrition Report for User ${userId}
        Generated on: ${new Date().toLocaleDateString()}
        
        This is a placeholder PDF report.
        In a production app, this would contain:
        - Detailed nutrition analysis
        - Charts and graphs
        - Recommendations
        - Progress tracking
      `;

      // Convert string to buffer (placeholder)
      const buffer = Buffer.from(reportContent, 'utf-8');
      
      console.log("✅ PDF report generated");
      return buffer;
    } catch (error) {
      console.error("💥 Error generating PDF report:", error);
      throw new Error("Failed to generate PDF report");
    }
  }

  static async generateInsights(userId: string) {
    try {
      console.log(`💡 Generating insights for user: ${userId}`);

      // Get recent meals for analysis
      const recentMeals = await prisma.meal.findMany({
        where: {
          user_id: userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const insights = [];

      if (recentMeals.length === 0) {
        insights.push("Start logging your meals to get personalized insights!");
      } else {
        const avgCalories = recentMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / recentMeals.length;
        const avgProtein = recentMeals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0) / recentMeals.length;

        if (avgCalories > 500) {
          insights.push("Your meals are quite calorie-dense. Consider adding more vegetables to balance them out.");
        }

        if (avgProtein < 15) {
          insights.push("Try to include more protein in your meals for better satiety and muscle health.");
        }

        if (recentMeals.length < 14) { // Less than 2 meals per day on average
          insights.push("Consider logging more meals to get a complete picture of your nutrition.");
        }

        insights.push("Keep up the great work tracking your nutrition!");
      }

      const recommendations = [
        "Aim for 5-7 servings of fruits and vegetables daily",
        "Include a source of healthy fats in each meal",
        "Stay consistent with meal timing",
        "Consider meal prep to maintain healthy eating habits",
      ];

      console.log("✅ Insights generated successfully");
      return {
        insights,
        recommendations,
        totalMealsAnalyzed: recentMeals.length,
        analysisDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("💥 Error generating insights:", error);
      throw new Error("Failed to generate insights");
    }
  }
}