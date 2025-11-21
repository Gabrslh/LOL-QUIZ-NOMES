import { GoogleGenAI } from "@google/genai";
import { Champion } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getChampionHint = async (champion: Champion): Promise<string> => {
    try {
        const ai = getClient();
        const model = 'gemini-2.5-flash';
        
        const prompt = `
        Você é um especialista em League of Legends. 
        Preciso que você me dê uma dica difícil/enigmática sobre o campeão "${champion.name}" (${champion.title}).
        
        Regras:
        1. Responda EM PORTUGUÊS.
        2. NÃO mencione o nome do campeão na dica.
        3. NÃO mencione o título exato do campeão (ex: não diga "A Raposa de Nove Caudas").
        4. Foque em suas habilidades, história (lore) ou características visuais.
        5. Máximo de 25 palavras.
        6. Seja criativo, mas direto.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error fetching hint:", error);
        return "Os deuses da IA estão silentes agora. Tente novamente mais tarde ou pule este campeão.";
    }
};