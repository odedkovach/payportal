
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction, AIResponse } from "../types";

// Initialize Gemini
const apiKey = import.meta.env.VITE_API_KEY || '';
console.log('API Key being used:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
const ai = new GoogleGenAI({ apiKey });

export const processUserPrompt = async (
  query: string,
  allTransactions: Transaction[]
): Promise<AIResponse> => {
  // If the query explicitly mentions "dashboard", "summary", or "report", 
  // we can hint the model to prioritize that intent, but we rely on the model 
  // to make the final structured decision.

  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return { type: 'FILTER', filteredIds: allTransactions.map(t => t.id) };
  }

  try {
    const model = 'gemini-2.5-flash';

    // We send a simplified version of the data to save tokens
    const simplifiedData = allTransactions.map(t => ({
      id: t.id,
      status: t.status,
      amount: t.amount,
      customer: t.customer,
      date: t.chargedOn,
      reference: t.reference
    }));

    const prompt = `
      You are an intelligent assistant for a financial dashboard application.
      
      USER QUERY: "${query}"
      
      CURRENT DATASET (Sample):
      ${JSON.stringify(simplifiedData.slice(0, 5))}...

      YOUR TASK:
      Determine if the user wants to FILTER the list, Generate a DASHBOARD, or View DETAILS of a specific invoice.

      INTENT DETECTION RULES:
      1. DETAILS INTENT: If the query asks to "find invoice X", "search invoice Y", "show transaction Z", or provides a specific Invoice ID (e.g. INV-...).
         -> ACTION: Return type="DETAILS" and extract the ID string into "detailsId".
         
      2. DASHBOARD INTENT: If the query contains words like "dashboard", "summarize", "overview", "chart", "graph", "report", "analyze", "October" (referring to a time period summary), or asks for aggregate stats.
         -> ACTION: Return type="DASHBOARD" and generate synthetic "dashboardData" that matches the query context.
         -> NOTE: "topCustomers" will be calculated by the system, but please provide a structure for it.
      
      3. FILTER INTENT: If the query asks to find specific items based on criteria (status, amount, date) but NOT a single specific invoice ID display.
         -> ACTION: Return type="FILTER" and provide "filteredIds".

      OUTPUT SCHEMA RULES:
      - If DETAILS: Set "detailsId" to the invoice ID extracted from the prompt (e.g., "INV-123456789").
      - If DASHBOARD: You must generate "dashboardData" with fully populated arrays for charts.
      - If FILTER: You must generate "filteredIds".

      GENERATE JSON RESPONSE ONLY.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["FILTER", "DASHBOARD", "DETAILS"] },
            filteredIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            detailsId: { type: Type.STRING },
            dashboardData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                metrics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      change: { type: Type.STRING },
                      trend: { type: Type.STRING, enum: ["up", "down", "neutral"] }
                    }
                  }
                },
                paymentMethodDistribution: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                      color: { type: Type.STRING }
                    }
                  }
                },
                topCustomers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          },
          required: ["type"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(resultText) as AIResponse;

    // --- Post-Processing for Dashboard Data ---
    // The AI might not know the full dataset (since we only sent a slice).
    // We calculate the actual Top 5 Customers from the provided `allTransactions`
    // to ensure the chart is accurate and populated.
    if (result.type === 'DASHBOARD' && result.dashboardData) {
      const customerSales: Record<string, number> = {};

      allTransactions.forEach(t => {
        // Aggregate sales for valid transactions
        if (t.status === 'Charged' || t.status === 'Paid into bank') {
          const current = customerSales[t.customer] || 0;
          customerSales[t.customer] = current + t.amount;
        }
      });

      const sortedCustomers = Object.entries(customerSales)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Take top 5

      // Override or fallback the AI's topCustomers
      if (sortedCustomers.length > 0) {
        result.dashboardData.topCustomers = sortedCustomers;
      }

      // --- Add 4th KPI: Avg. Transaction Value ---
      // Calculate average from valid transactions
      let totalAmount = 0;
      let count = 0;
      allTransactions.forEach(t => {
        if (t.status === 'Charged' || t.status === 'Paid into bank') {
          totalAmount += t.amount;
          count++;
        }
      });

      const avgValue = count > 0 ? totalAmount / count : 0;

      // Ensure we have at least 4 metrics
      if (result.dashboardData.metrics.length < 4) {
        result.dashboardData.metrics.push({
          label: 'Avg. Transaction Value',
          value: `£${avgValue.toFixed(2)}`,
          change: '+2.5%', // Mock trend for now
          trend: 'up'
        });
      }
    }

    return result;

  } catch (error) {
    console.error("Error processing with Gemini:", error);
    // Fallback logic
    const isDashboardRequest = /dashboard|summary|report|chart/i.test(query);
    if (isDashboardRequest) {
      return { type: 'FILTER', filteredIds: allTransactions.map(t => t.id) };
    }
    return { type: 'FILTER', filteredIds: allTransactions.map(t => t.id) };
  }
};
