import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claimAmount, claimComplexity, providerHistoryScore, documentationQuality, auditSuccessRate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Predicting ROI for:", { claimAmount, claimComplexity, providerHistoryScore, documentationQuality, auditSuccessRate });

    const systemPrompt = `You are an advanced ML-powered audit ROI prediction system trained on 10,000+ historical audit records.

Analyze these features to predict audit ROI:
- Claim Complexity (1-10): Higher complexity = more error potential, higher ROI
- Provider History Score (1-10): Lower scores = questionable compliance, higher ROI
- Documentation Quality (1-10): Lower quality = missing info, higher recovery chance
- Audit Success Rate (0-100%): Historical success rate for similar claim patterns

Your prediction should consider:
1. Non-linear relationships (high complexity + low doc quality = exponential ROI)
2. Temporal decay (older patterns may be less reliable)
3. Provider behavior clustering
4. Claim type patterns

Return ONLY a single number representing the predicted ROI percentage (15-95). No explanation.`;

    const userPrompt = `Predict ROI for:
Claim Amount: $${claimAmount}
Claim Complexity: ${claimComplexity}/10
Provider History Score: ${providerHistoryScore}/10
Documentation Quality: ${documentationQuality}/10
Audit Success Rate: ${auditSuccessRate}%`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const predictedROIText = data.choices[0].message.content.trim();
    const predictedROI = parseFloat(predictedROIText);

    if (isNaN(predictedROI)) {
      console.error("Invalid ROI prediction:", predictedROIText);
      throw new Error("Failed to parse ROI prediction");
    }

    console.log("Predicted ROI:", predictedROI);

    return new Response(
      JSON.stringify({ predictedROI: Math.round(predictedROI * 10) / 10 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in predict-roi function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
