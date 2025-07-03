import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MealAnalysisResult {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: number;
  ingredients?: string[];
  servingSize?: string;
  cookingMethod?: string;
  healthNotes?: string;
}

export class OpenAIService {
  static async analyzeMealImage(
    imageBase64: string,
    language: string = "english",
    updateText?: string
  ): Promise<MealAnalysisResult> {
    try {
      console.log("🤖 Starting OpenAI meal analysis...");
      console.log("📊 Image data length:", imageBase64.length);
      console.log("🌍 Language:", language);
      console.log("📝 Update text:", updateText ? "Provided" : "None");

      const systemPrompt = `You are a professional nutritionist and food analyst. Analyze the food image and provide detailed nutritional information.

IMPORTANT INSTRUCTIONS:
1. Analyze the food items visible in the image
2. Estimate portion sizes based on visual cues
3. Provide accurate nutritional values per serving shown
4. If multiple items, sum up the total nutrition
5. Be conservative with estimates - better to underestimate than overestimate
6. Consider cooking methods that affect nutrition
7. Account for added oils, sauces, and seasonings visible

${updateText ? `ADDITIONAL CONTEXT: The user provided this additional information: "${updateText}". Please incorporate this into your analysis and adjust nutritional values accordingly.` : ""}

Respond with a JSON object containing:
{
  "name": "Brief descriptive name of the meal/food",
  "description": "Detailed description of what you see",
  "calories": number (total calories for the portion shown),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams, optional),
  "sugar": number (grams, optional),
  "sodium": number (milligrams, optional),
  "confidence": number (0-100, how confident you are in the analysis),
  "ingredients": ["list", "of", "main", "ingredients"],
  "servingSize": "description of portion size",
  "cookingMethod": "how the food appears to be prepared",
  "healthNotes": "brief health assessment or notes"
}

Language for response: ${language}`;

      const userPrompt = updateText 
        ? `Please analyze this food image. Additional context: ${updateText}`
        : "Please analyze this food image and provide detailed nutritional information.";

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for consistent results
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      console.log("🤖 OpenAI raw response:", content);

      // Parse JSON response
      let analysisResult: MealAnalysisResult;
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        
        const parsed = JSON.parse(jsonString);
        
        // Validate and sanitize the response
        analysisResult = {
          name: parsed.name || "Unknown Food",
          description: parsed.description || "",
          calories: Math.max(0, Number(parsed.calories) || 0),
          protein: Math.max(0, Number(parsed.protein) || 0),
          carbs: Math.max(0, Number(parsed.carbs) || 0),
          fat: Math.max(0, Number(parsed.fat) || 0),
          fiber: parsed.fiber ? Math.max(0, Number(parsed.fiber)) : undefined,
          sugar: parsed.sugar ? Math.max(0, Number(parsed.sugar)) : undefined,
          sodium: parsed.sodium ? Math.max(0, Number(parsed.sodium)) : undefined,
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
          ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
          servingSize: parsed.servingSize || "1 serving",
          cookingMethod: parsed.cookingMethod || "Unknown",
          healthNotes: parsed.healthNotes || "",
        };
      } catch (parseError) {
        console.error("💥 Failed to parse OpenAI response:", parseError);
        console.error("📄 Raw content:", content);
        
        // Fallback analysis
        analysisResult = {
          name: "Food Item",
          description: "Unable to fully analyze the image",
          calories: 300,
          protein: 15,
          carbs: 30,
          fat: 10,
          confidence: 50,
          ingredients: ["Unknown"],
          servingSize: "1 serving",
          cookingMethod: "Unknown",
          healthNotes: "Analysis incomplete - please try again",
        };
      }

      console.log("✅ Analysis completed:", analysisResult);
      return analysisResult;
    } catch (error) {
      console.error("💥 OpenAI analysis error:", error);
      
      // Return fallback result instead of throwing
      return {
        name: "Food Item",
        description: "Unable to analyze the image",
        calories: 250,
        protein: 12,
        carbs: 25,
        fat: 8,
        confidence: 30,
        ingredients: ["Unknown"],
        servingSize: "1 serving",
        cookingMethod: "Unknown",
        healthNotes: "Analysis failed - please try again",
      };
    }
  }

  static async updateMealAnalysis(
    originalAnalysis: MealAnalysisResult,
    updateText: string,
    language: string = "english"
  ): Promise<MealAnalysisResult> {
    try {
      console.log("🔄 Updating meal analysis with additional info...");
      console.log("📝 Update text:", updateText);

      const systemPrompt = `You are a professional nutritionist. The user has provided additional information about their meal. Update the nutritional analysis accordingly.

ORIGINAL ANALYSIS:
${JSON.stringify(originalAnalysis, null, 2)}

ADDITIONAL INFORMATION FROM USER:
"${updateText}"

Please provide an updated nutritional analysis that incorporates this new information. Adjust calories, macronutrients, and other values as needed.

Respond with a JSON object in the same format as the original analysis.

Language for response: ${language}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Please update the nutritional analysis based on this additional information: "${updateText}"`,
          },
        ],
        max_tokens: 800,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      console.log("🤖 OpenAI update response:", content);

      // Parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(jsonString);
        
        const updatedResult: MealAnalysisResult = {
          name: parsed.name || originalAnalysis.name,
          description: parsed.description || originalAnalysis.description,
          calories: Math.max(0, Number(parsed.calories) || originalAnalysis.calories),
          protein: Math.max(0, Number(parsed.protein) || originalAnalysis.protein),
          carbs: Math.max(0, Number(parsed.carbs) || originalAnalysis.carbs),
          fat: Math.max(0, Number(parsed.fat) || originalAnalysis.fat),
          fiber: parsed.fiber ? Math.max(0, Number(parsed.fiber)) : originalAnalysis.fiber,
          sugar: parsed.sugar ? Math.max(0, Number(parsed.sugar)) : originalAnalysis.sugar,
          sodium: parsed.sodium ? Math.max(0, Number(parsed.sodium)) : originalAnalysis.sodium,
          confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || originalAnalysis.confidence)),
          ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : originalAnalysis.ingredients,
          servingSize: parsed.servingSize || originalAnalysis.servingSize,
          cookingMethod: parsed.cookingMethod || originalAnalysis.cookingMethod,
          healthNotes: parsed.healthNotes || originalAnalysis.healthNotes,
        };

        console.log("✅ Update completed:", updatedResult);
        return updatedResult;
      } catch (parseError) {
        console.error("💥 Failed to parse update response:", parseError);
        // Return original analysis if update fails
        return originalAnalysis;
      }
    } catch (error) {
      console.error("💥 OpenAI update error:", error);
      // Return original analysis if update fails
      return originalAnalysis;
    }
  }
}