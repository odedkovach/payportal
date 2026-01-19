
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
    const model = 'gemini-2.5-flash'; // Original model

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

      CONTENT:
      Determine if the user wants to FILTER, Generate a standard DASHBOARD, Generate a RECONCILIATION_DASHBOARD (specific financial deep dive), or View DETAILS.

      INTENT DETECTION RULES:
      1. DETAILS INTENT: Specific invoice or transaction lookup.
      2. RECONCILIATION_DASHBOARD INTENT: If the user asks for "reconciliation", "reconcile", "payment tracking", "debt collection", "chasing payments", "December 2025 reconciliation".
         -> ACTION: Return type="RECONCILIATION_DASHBOARD".
         -> GENERATE: "reconciliationData" with realistic, coherent financial data (Total Expected ~£150k, Received ~£120k).
            - Aging: <30 days, 30-60 days, 60-90 days, >90 days.
            - Discrepancies: 5-10 items with 'Overdue', 'Partial', 'Unmatched' status.
      3. DASHBOARD INTENT: General overview, "dashboard", "summary".
      4. FILTER INTENT: Criteria-based search.

      OUTPUT SCHEMA RULES:
      - If RECONCILIATION_DASHBOARD: Populate "reconciliationData".
      - "reconciliationData" MUST have: title, period, summary (totalExpected, totalReceived, outstanding, reconciliationRate), aging (buckets), discrepancies (list), methodBreakdown.
      
      GENERATE JSON RESPONSE ONLY.
    `;

    const responsePromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["FILTER", "DASHBOARD", "DETAILS", "RECONCILIATION_DASHBOARD"] },
            filteredIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailsId: { type: Type.STRING },
            dashboardData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                metrics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING }, change: { type: Type.STRING }, trend: { type: Type.STRING } } } },
                paymentMethodDistribution: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER }, color: { type: Type.STRING } } } },
                topCustomers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } } } }
              }
            },
            reconciliationData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                period: { type: Type.STRING },
                summary: {
                  type: Type.OBJECT,
                  properties: {
                    totalExpected: { type: Type.NUMBER },
                    totalReceived: { type: Type.NUMBER },
                    outstanding: { type: Type.NUMBER },
                    reconciliationRate: { type: Type.NUMBER }
                  }
                },
                aging: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER }, count: { type: Type.NUMBER } }
                  }
                },
                discrepancies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING }, reference: { type: Type.STRING }, expectedAmount: { type: Type.NUMBER }, receivedAmount: { type: Type.NUMBER },
                      customer: { type: Type.STRING }, date: { type: Type.STRING }, status: { type: Type.STRING, enum: ['Matched', 'Partial', 'Unmatched', 'Overdue'] }, method: { type: Type.STRING }
                    }
                  }
                },
                methodBreakdown: {
                  type: Type.ARRAY,
                  items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER }, color: { type: Type.STRING } } }
                }
              }
            }
          },
          required: ["type"]
        }
      }
    });

    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Gemini Request Timeout")), 15000);
    });

    let response: any;
    try {
      response = await Promise.race([responsePromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(resultText) as AIResponse;

    if (result.type === 'RECONCILIATION_DASHBOARD' && result.reconciliationData) {
      // Ensure data exists if AI hallucinated empty
      if (!result.reconciliationData.aging) result.reconciliationData.aging = [];
      if (!result.reconciliationData.methodBreakdown) {
        result.reconciliationData.methodBreakdown = [
          { label: 'Direct Debit', value: 85000, color: '#b91c1c' },
          { label: 'Bank Transfer', value: 15000, color: '#6b7280' },
          { label: 'ParentPay', value: 5000, color: '#9ca3af' }
        ];
      }
    }

    // --- Post-Processing for Standard Dashboard Data ---
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

    // Check if this was a reconciliation request - provide mock data as fallback
    const isReconciliationRequest = /reconcil|payment track|debt|chasing/i.test(query);
    if (isReconciliationRequest) {
      console.log("Falling back to mock reconciliation data");
      return {
        type: 'RECONCILIATION_DASHBOARD',
        reconciliationData: {
          title: 'Wetherby School Fee Reconciliation',
          period: 'December 2025',
          summary: {
            totalExpected: 152400,
            totalReceived: 124800,
            outstanding: 27600,
            reconciliationRate: 81.9
          },
          aging: [
            { label: '< 30 Days', value: 8500, count: 12 },
            { label: '30-60 Days', value: 11200, count: 8 },
            { label: '60-90 Days', value: 5400, count: 4 },
            { label: '> 90 Days', value: 2500, count: 2 }
          ],
          discrepancies: [
            { id: 'D001', reference: 'INV-2025-1201', expectedAmount: 4200, receivedAmount: 2100, customer: 'Thompson Family', date: '2025-12-01', status: 'Partial' as const, method: 'Direct Debit' },
            { id: 'D002', reference: 'INV-2025-1202', expectedAmount: 3800, receivedAmount: 0, customer: 'Harrison Parents', date: '2025-12-02', status: 'Overdue' as const, method: 'Bank Transfer' },
            { id: 'D003', reference: 'INV-2025-1205', expectedAmount: 4500, receivedAmount: 4500, customer: 'Chen Family', date: '2025-12-05', status: 'Unmatched' as const, method: 'ParentPay' },
            { id: 'D004', reference: 'INV-2025-1208', expectedAmount: 3200, receivedAmount: 0, customer: 'Williams Estate', date: '2025-12-08', status: 'Overdue' as const, method: 'Direct Debit' },
            { id: 'D005', reference: 'INV-2025-1210', expectedAmount: 5100, receivedAmount: 2550, customer: 'Patel Family', date: '2025-12-10', status: 'Partial' as const, method: 'Bank Transfer' },
            { id: 'D006', reference: 'INV-2025-1215', expectedAmount: 4800, receivedAmount: 0, customer: 'O\'Brien Parents', date: '2025-12-15', status: 'Overdue' as const, method: 'Direct Debit' }
          ],
          methodBreakdown: [
            { label: 'Direct Debit', value: 89500, color: '#b91c1c' },
            { label: 'Bank Transfer', value: 24300, color: '#6b7280' },
            { label: 'ParentPay', value: 11000, color: '#9ca3af' }
          ]
        }
      };
    }

    // Fallback for other queries
    const isDashboardRequest = /dashboard|summary|report|chart/i.test(query);
    if (isDashboardRequest) {
      return { type: 'FILTER', filteredIds: allTransactions.map(t => t.id) };
    }
    return { type: 'FILTER', filteredIds: allTransactions.map(t => t.id) };
  }
};
