import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../src/store";

interface MealTemplate {
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

interface WeeklyMealPlan {
  [day: string]: {
    [mealTiming: string]: MealTemplate[];
  };
}

interface MealPlanConfig {
  name: string;
  meals_per_day: number;
  snacks_per_day: number;
  rotation_frequency_days: number;
  include_leftovers: boolean;
  fixed_meal_times: boolean;
  dietary_preferences: string[];
  excluded_ingredients: string[];
}

export default function RecommendedMenusScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealTemplate | null>(null);
  const [currentDay, setCurrentDay] = useState("Monday");
  const [mealPlanConfig, setMealPlanConfig] = useState<MealPlanConfig>({
    name: "My Weekly Plan",
    meals_per_day: 3,
    snacks_per_day: 0,
    rotation_frequency_days: 7,
    include_leftovers: false,
    fixed_meal_times: false,
    dietary_preferences: [],
    excluded_ingredients: [],
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mealTimings = ["BREAKFAST", "LUNCH", "DINNER", "MORNING_SNACK", "AFTERNOON_SNACK"];

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you'd call your API here
      // For now, we'll create a mock meal plan
      const mockPlan = createMockMealPlan();
      setWeeklyPlan(mockPlan);
    } catch (error) {
      console.error("💥 Error loading meal plan:", error);
      Alert.alert("Error", "Failed to load meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMealPlan();
    setRefreshing(false);
  };

  const createMockMealPlan = (): WeeklyMealPlan => {
    const mockMeals: Record<string, MealTemplate[]> = {
      BREAKFAST: [
        {
          template_id: "1",
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
          ingredients: [
            { name: "Whole grain bread", quantity: 2, unit: "slices" },
            { name: "Avocado", quantity: 1, unit: "medium" },
            { name: "Eggs", quantity: 2, unit: "large" },
            { name: "Lemon juice", quantity: 1, unit: "tsp" },
            { name: "Salt", quantity: 0.5, unit: "tsp" },
            { name: "Black pepper", quantity: 0.25, unit: "tsp" },
          ],
          instructions: [
            { step: 1, text: "Toast the bread slices until golden brown" },
            { step: 2, text: "Mash avocado with lemon juice, salt, and pepper" },
            { step: 3, text: "Poach eggs in simmering water for 3-4 minutes" },
            { step: 4, text: "Spread avocado on toast and top with poached eggs" },
          ],
          allergens: ["gluten", "eggs"],
          image_url: "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg",
        },
        {
          template_id: "2",
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
          ingredients: [
            { name: "Greek yogurt", quantity: 200, unit: "g" },
            { name: "Mixed berries", quantity: 100, unit: "g" },
            { name: "Granola", quantity: 30, unit: "g" },
            { name: "Honey", quantity: 1, unit: "tbsp" },
          ],
          instructions: [
            { step: 1, text: "Layer yogurt, berries, and granola in a glass" },
            { step: 2, text: "Drizzle with honey" },
            { step: 3, text: "Repeat layers and serve immediately" },
          ],
          allergens: ["dairy"],
          image_url: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
        },
      ],
      LUNCH: [
        {
          template_id: "3",
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
          ingredients: [
            { name: "Quinoa", quantity: 80, unit: "g" },
            { name: "Cherry tomatoes", quantity: 150, unit: "g" },
            { name: "Cucumber", quantity: 100, unit: "g" },
            { name: "Red onion", quantity: 50, unit: "g" },
            { name: "Feta cheese", quantity: 50, unit: "g" },
            { name: "Olive oil", quantity: 2, unit: "tbsp" },
            { name: "Lemon juice", quantity: 1, unit: "tbsp" },
          ],
          instructions: [
            { step: 1, text: "Cook quinoa according to package instructions" },
            { step: 2, text: "Chop vegetables and mix with olive oil and lemon" },
            { step: 3, text: "Combine quinoa with vegetables" },
            { step: 4, text: "Top with crumbled feta cheese" },
          ],
          allergens: ["dairy"],
          image_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
        },
      ],
      DINNER: [
        {
          template_id: "4",
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
          ingredients: [
            { name: "Salmon fillet", quantity: 150, unit: "g" },
            { name: "Broccoli", quantity: 200, unit: "g" },
            { name: "Sweet potato", quantity: 150, unit: "g" },
            { name: "Olive oil", quantity: 2, unit: "tbsp" },
            { name: "Herbs (dill, parsley)", quantity: 2, unit: "tbsp" },
            { name: "Lemon", quantity: 0.5, unit: "piece" },
          ],
          instructions: [
            { step: 1, text: "Preheat oven to 200°C" },
            { step: 2, text: "Season salmon with herbs and lemon" },
            { step: 3, text: "Roast vegetables with olive oil for 20 minutes" },
            { step: 4, text: "Grill salmon for 4-5 minutes per side" },
            { step: 5, text: "Serve salmon with roasted vegetables" },
          ],
          allergens: ["fish"],
          image_url: "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg",
        },
      ],
    };

    const plan: WeeklyMealPlan = {};
    dayNames.forEach(day => {
      plan[day] = {
        BREAKFAST: [mockMeals.BREAKFAST[Math.floor(Math.random() * mockMeals.BREAKFAST.length)]],
        LUNCH: [mockMeals.LUNCH[0]],
        DINNER: [mockMeals.DINNER[0]],
      };
    });

    return plan;
  };

  const handleMealPress = (meal: MealTemplate) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  const handleReplaceMeal = () => {
    Alert.alert(
      "Replace Meal",
      "Would you like to replace this meal with a similar alternative?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Replace", onPress: () => {
          // In a real implementation, you'd call the replace meal API
          Alert.alert("Success", "Meal replaced successfully!");
          setShowMealModal(false);
        }},
      ]
    );
  };

  const handleMarkFavorite = () => {
    Alert.alert("Success", "Meal marked as favorite!");
  };

  const generateShoppingList = () => {
    Alert.alert(
      "Shopping List",
      "Generate shopping list for this week?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Generate", onPress: () => {
          Alert.alert("Success", "Shopping list generated! Check your email for the PDF.");
        }},
      ]
    );
  };

  const renderMealCard = (meal: MealTemplate, day: string, timing: string) => {
    const getDifficultyColor = (level?: number) => {
      switch (level) {
        case 1: return "#4CAF50";
        case 2: return "#FF9800";
        case 3: return "#F44336";
        default: return "#9E9E9E";
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case "VEGETARIAN": return "#8BC34A";
        case "VEGAN": return "#4CAF50";
        case "KETO": return "#9C27B0";
        case "HIGH_PROTEIN": return "#FF5722";
        case "MEDITERRANEAN": return "#2196F3";
        default: return "#607D8B";
      }
    };

    return (
      <TouchableOpacity
        key={`${day}-${timing}-${meal.template_id}`}
        style={[styles.mealCard, { borderLeftColor: getCategoryColor(meal.dietary_category) }]}
        onPress={() => handleMealPress(meal)}
      >
        {meal.image_url && (
          <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
        )}
        
        <View style={styles.mealContent}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <View style={styles.mealBadges}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(meal.difficulty_level) }]}>
                <Text style={styles.badgeText}>
                  {meal.difficulty_level === 1 ? "Easy" : meal.difficulty_level === 2 ? "Medium" : "Hard"}
                </Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(meal.dietary_category) }]}>
                <Text style={styles.badgeText}>{meal.dietary_category.replace("_", " ")}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.mealDescription}>{meal.description}</Text>

          <View style={styles.mealInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{meal.prep_time_minutes} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{Math.round(meal.calories || 0)} cal</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="fitness-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{Math.round(meal.protein_g || 0)}g protein</Text>
            </View>
          </View>

          <View style={styles.mealActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleReplaceMeal}>
              <Ionicons name="refresh-outline" size={18} color="#007AFF" />
              <Text style={styles.actionText}>Replace</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleMarkFavorite}>
              <Ionicons name="heart-outline" size={18} color="#FF6B6B" />
              <Text style={styles.actionText}>Favorite</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="star-outline" size={18} color="#FFD700" />
              <Text style={styles.actionText}>Rate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayPlan = (day: string) => {
    const dayPlan = weeklyPlan[day];
    if (!dayPlan) return null;

    return (
      <View key={day} style={styles.dayContainer}>
        <Text style={styles.dayTitle}>{day}</Text>
        
        {mealTimings.map(timing => {
          const meals = dayPlan[timing];
          if (!meals || meals.length === 0) return null;

          return (
            <View key={timing} style={styles.timingSection}>
              <Text style={styles.timingTitle}>
                {timing.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              {meals.map(meal => renderMealCard(meal, day, timing))}
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your meal plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Recommended Menus</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowConfigModal(true)}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={generateShoppingList}>
            <Ionicons name="list-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {dayNames.map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, currentDay === day && styles.dayButtonActive]}
            onPress={() => setCurrentDay(day)}
          >
            <Text style={[styles.dayButtonText, currentDay === day && styles.dayButtonTextActive]}>
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meal Plan Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {Object.keys(weeklyPlan).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Meal Plan Yet</Text>
            <Text style={styles.emptyText}>
              Create your personalized meal plan to get started with healthy eating!
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowConfigModal(true)}>
              <Text style={styles.createButtonText}>Create Meal Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderDayPlan(currentDay)
        )}
      </ScrollView>

      {/* Meal Detail Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMeal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                  <TouchableOpacity onPress={() => setShowMealModal(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedMeal.image_url && (
                    <Image source={{ uri: selectedMeal.image_url }} style={styles.modalImage} />
                  )}

                  <Text style={styles.modalDescription}>{selectedMeal.description}</Text>

                  {/* Nutrition Info */}
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{Math.round(selectedMeal.calories || 0)}</Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{Math.round(selectedMeal.protein_g || 0)}g</Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{Math.round(selectedMeal.carbs_g || 0)}g</Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{Math.round(selectedMeal.fats_g || 0)}g</Text>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                    </View>
                  </View>

                  {/* Ingredients */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {selectedMeal.ingredients.map((ingredient, index) => (
                      <Text key={index} style={styles.ingredientText}>
                        • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </Text>
                    ))}
                  </View>

                  {/* Instructions */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {selectedMeal.instructions.map((instruction, index) => (
                      <Text key={index} style={styles.instructionText}>
                        {instruction.step}. {instruction.text}
                      </Text>
                    ))}
                  </View>

                  {/* Allergens */}
                  {selectedMeal.allergens.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Allergens</Text>
                      <View style={styles.allergenContainer}>
                        {selectedMeal.allergens.map((allergen, index) => (
                          <View key={index} style={styles.allergenBadge}>
                            <Text style={styles.allergenText}>{allergen}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalActionButton} onPress={handleReplaceMeal}>
                    <Ionicons name="refresh-outline" size={20} color="#007AFF" />
                    <Text style={styles.modalActionText}>Replace</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalActionButton} onPress={handleMarkFavorite}>
                    <Ionicons name="heart-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalActionText}>Favorite</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        visible={showConfigModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meal Plan Settings</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.configSectionTitle}>Meal Structure</Text>
              
              <View style={styles.configOption}>
                <Text style={styles.configLabel}>Meals per day</Text>
                <View style={styles.configButtons}>
                  {[2, 3, 4, 5].map(num => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.configButton,
                        mealPlanConfig.meals_per_day === num && styles.configButtonActive
                      ]}
                      onPress={() => setMealPlanConfig(prev => ({ ...prev, meals_per_day: num }))}
                    >
                      <Text style={[
                        styles.configButtonText,
                        mealPlanConfig.meals_per_day === num && styles.configButtonTextActive
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.configOption}>
                <Text style={styles.configLabel}>Snacks per day</Text>
                <View style={styles.configButtons}>
                  {[0, 1, 2].map(num => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.configButton,
                        mealPlanConfig.snacks_per_day === num && styles.configButtonActive
                      ]}
                      onPress={() => setMealPlanConfig(prev => ({ ...prev, snacks_per_day: num }))}
                    >
                      <Text style={[
                        styles.configButtonText,
                        mealPlanConfig.snacks_per_day === num && styles.configButtonTextActive
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.configOption}>
                <Text style={styles.configLabel}>Change meals every</Text>
                <View style={styles.configButtons}>
                  {[
                    { value: 1, label: "Daily" },
                    { value: 3, label: "3 days" },
                    { value: 7, label: "Weekly" },
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.configButton,
                        mealPlanConfig.rotation_frequency_days === option.value && styles.configButtonActive
                      ]}
                      onPress={() => setMealPlanConfig(prev => ({ ...prev, rotation_frequency_days: option.value }))}
                    >
                      <Text style={[
                        styles.configButtonText,
                        mealPlanConfig.rotation_frequency_days === option.value && styles.configButtonTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => setShowConfigModal(false)}
              >
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalActionButton, styles.primaryButton]}
                onPress={() => {
                  setShowConfigModal(false);
                  Alert.alert("Success", "Meal plan updated successfully!");
                }}
              >
                <Text style={[styles.modalActionText, styles.primaryButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  daySelector: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  dayButtonActive: {
    backgroundColor: "#007AFF",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  dayButtonTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  dayContainer: {
    padding: 15,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  timingSection: {
    marginBottom: 25,
  },
  timingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#007AFF",
  },
  mealCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: 150,
  },
  mealContent: {
    padding: 15,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  mealBadges: {
    flexDirection: "row",
    gap: 5,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  mealDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  mealInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
  mealActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  ingredientText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 22,
  },
  allergenContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergenBadge: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  allergenText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  primaryButtonText: {
    color: "white",
  },
  configSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  configOption: {
    marginBottom: 25,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
  },
  configButtons: {
    flexDirection: "row",
    gap: 10,
  },
  configButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  configButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  configButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  configButtonTextActive: {
    color: "white",
  },
});