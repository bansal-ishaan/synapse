// background.js
import { GEMINI_API_KEY } from './config.js';

async function initModel() {
    if (GEMINI_API_KEY === "PUT_YOUR_API_KEY_HERE") return null;
    if (self.cachedModelName) return self.cachedModelName;
    try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const listData = await listRes.json();
        const validModels = listData.models.filter(m => m.supportedGenerationMethods.includes("generateContent") && m.name.includes("gemini"));
        const bestModel = validModels.find(m => m.name.includes("1.5-flash")) || validModels.find(m => m.name.includes("1.5")) || validModels[0];
        self.cachedModelName = bestModel.name;
        return self.cachedModelName;
    } catch { return "models/gemini-pro"; } // bulletproof fallback
}

async function fetchFromGemini(promptText) {
    const model = await initModel();
    if (!model) return { error: "Please open config.js and paste your Gemini API Key!" };
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.2 }
    };
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.error) return { error: data.error.message };
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (err) { return { error: err.message }; }
}

chrome.action.onClicked.addListener(async (tab) => {
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "extract_dom" });
        if (!response || !response.contentMap) return;
        const allContent = response.contentMap;
        
        // Step 1: Lightning Fast Metadata Call
        const summaryPrompt = "Analyze this article and return ONLY RAW PARSABLE JSON. Format: {\"page_tone\": \"[Tone]\", \"page_summary\": \"3-sentence summary\"}\n\n" + JSON.stringify(allContent.slice(0, 20));
        chrome.tabs.sendMessage(tab.id, { action: "update_status", message: "Analyzing page context..." });
        
        const metaData = await fetchFromGemini(summaryPrompt);
        chrome.tabs.sendMessage(tab.id, { action: "render_ai_metadata", data: metaData });

        // Step 2: Cascading Chunks (5 paragraphs at a time)
        chrome.tabs.sendMessage(tab.id, { action: "update_status", message: "Translating content blocks..." });
        const CHUNK_SIZE = 5;
        for (let i = 0; i < allContent.length; i += CHUNK_SIZE) {
            const chunkBatch = allContent.slice(i, i + CHUNK_SIZE);
            const chunkPrompt = "Simplify this text for neurodivergent accessibility. Literal translations only, no metaphors. Return ONLY RAW PARSABLE JSON. Format: {\"simplified_chunks\": [{\"id\": \"id\", \"text\": \"simplified text\"}]}\n\n" + JSON.stringify(chunkBatch);
            
            const chunkData = await fetchFromGemini(chunkPrompt);
            chrome.tabs.sendMessage(tab.id, { action: "render_ai_chunk", data: chunkData });
        }
        
        chrome.tabs.sendMessage(tab.id, { action: "update_status", message: "Done!" });
    } catch (err) { console.error(err); }
});
