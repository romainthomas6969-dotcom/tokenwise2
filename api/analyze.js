export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage } = req.body;

    const systemPrompt = `Tu es un expert en IA et en optimisation de couts. Analyse la demande utilisateur et reponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou apres.

Les modeles disponibles avec leurs prix par million de tokens:
- Claude Haiku 4.5 (Anthropic, rapide): input $1.00, output $5.00 - Force: taches repetitives, extraction, chatbot
- Claude Sonnet 4.6 (Anthropic, equilibre): input $3.00, output $15.00 - Force: code, redaction, analyse
- Claude Opus 4.6 (Anthropic, puissant): input $5.00, output $25.00 - Force: code complexe, juridique, raisonnement
- GPT-5 nano (OpenAI, rapide): input $0.05, output $0.40 - Force: ultra-economique, classification
- GPT-5 mini (OpenAI, rapide): input $0.25, output $2.00 - Force: economique, polyvalent
- GPT-4o (OpenAI, equilibre): input $1.25, output $5.00 - Force: vision, multimodal
- GPT-5.2 (OpenAI, puissant): input $1.75, output $14.00 - Force: raisonnement, recherche
- Gemini 3 Flash (Google, rapide): input $0.10, output $0.40 - Force: tres rapide, economique
- Gemini 2.5 Flash (Google, rapide): input $0.26, output $1.05 - Force: grand contexte
- Gemini 2.5 Pro (Google, equilibre): input $1.25, output $10.00 - Force: 1M tokens contexte
- Gemini 3.1 Pro (Google, puissant): input $2.00, output $12.00 - Force: recherche Google
- Grok 4.1 (xAI, rapide): input $0.20, output $0.50 - Force: actualite X/Twitter
- Grok 4.1 Heavy (xAI, puissant): input $3.00, output $15.00 - Force: raisonnement
- DeepSeek V3 (DeepSeek, equilibre): input $0.27, output $1.10 - Force: tres economique, traduction
- DeepSeek R1 (DeepSeek, puissant): input $0.55, output $2.19 - Force: code, maths, raisonnement

Retourne ce JSON exact:
{
  "summary": "Ce que j'ai compris en 2 phrases",
  "task_type": "type de tache",
  "input_tokens": nombre entier,
  "output_tokens": nombre entier,
  "volume_monthly": nombre entier,
  "quality_needed": "fast ou balanced ou powerful",
  "reasoning": "Explication courte",
  "specialty_note": "Note sur quelle IA est la plus adaptee",
  "recommendations": [
    {"model": "nom exact", "provider": "fournisseur", "monthly_cost": nombre, "why": "raison courte", "rank": 1},
    {"model": "nom exact", "provider": "fournisseur", "monthly_cost": nombre, "why": "raison courte", "rank": 2},
    {"model": "nom exact", "provider": "fournisseur", "monthly_cost": nombre, "why": "raison courte", "rank": 3}
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }

    const text = data.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    JSON.parse(clean);

    return res.status(200).json({ result: clean });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
