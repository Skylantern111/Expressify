import { emotionDictionary, vibeProfiles } from '../constants/appData';

export const extractKeywords = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    const negators = ['not', 'never', 'dont', "don't", 'cant', "can't", 'hardly', 'barely', 'no', 'isnt', "isn't", 'wasnt', "wasn't", 'arent', "aren't", 'didnt', "didn't"];
    let matched = [];

    tokens.forEach((t, i) => {
        const prev1 = i > 0 ? tokens[i - 1] : '';
        const prev2 = i > 1 ? tokens[i - 2] : '';
        const isNegated = negators.includes(prev1) || negators.includes(prev2);

        let baseLabel = '';
        if (emotionDictionary.lowValence.includes(t)) baseLabel = 'Negative';
        if (emotionDictionary.highValence.includes(t)) baseLabel = 'Positive';
        if (emotionDictionary.lowEnergy.includes(t)) baseLabel = 'Low Energy';
        if (emotionDictionary.highEnergy.includes(t)) baseLabel = 'High Energy';

        if (baseLabel) {
            if (isNegated) {
                if (baseLabel === 'Positive') baseLabel = 'Negative (Negated)';
                else if (baseLabel === 'Negative') baseLabel = 'Positive (Negated)';
                else if (baseLabel === 'High Energy') baseLabel = 'Low Energy (Negated)';
                else if (baseLabel === 'Low Energy') baseLabel = 'High Energy (Negated)';
            }

            const wordToStore = isNegated ? `${prev1 ? prev1 : prev2} ${t}` : t;
            if (!matched.find(m => m.word === wordToStore)) {
                matched.push({ word: wordToStore, label: baseLabel });
            }
        }
    });
    return matched.slice(0, 5);
};

export const analyzeTextEmotion = (text) => {
    const tokens = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
    let isHappy = false, isSad = false, isHighEnergy = false, isLowEnergy = false;
    let isConfident = false, isRomantic = false, isAnxious = false, isNostalgic = false, isTired = false;

    tokens.forEach((t, i) => {
        const prev1 = i > 0 ? tokens[i - 1] : '';
        const prev2 = i > 1 ? tokens[i - 2] : '';
        const negators = ['not', 'never', 'dont', "don't", 'cant', "can't"];
        const isNegated = negators.includes(prev1) || negators.includes(prev2);

        if (emotionDictionary.highValence.includes(t)) { isNegated ? isSad = true : isHappy = true; }
        if (emotionDictionary.lowValence.includes(t)) { isNegated ? isHappy = true : isSad = true; }
        if (emotionDictionary.highEnergy.includes(t)) { isNegated ? isLowEnergy = true : isHighEnergy = true; }
        if (emotionDictionary.lowEnergy.includes(t)) { isNegated ? isHighEnergy = true : isLowEnergy = true; }

        if (emotionDictionary.confident.includes(t)) { isNegated ? isAnxious = true : isConfident = true; }
        if (emotionDictionary.romantic.includes(t)) { isNegated ? isSad = true : isRomantic = true; }
        if (emotionDictionary.anxious.includes(t)) { isNegated ? isHappy = true : isAnxious = true; }
        if (emotionDictionary.nostalgic.includes(t)) { isNostalgic = true; }
        if (emotionDictionary.tired.includes(t)) { isNegated ? isHighEnergy = true : isTired = true; }
    });

    if (isConfident) return { mood: "Confident & Empowered", profile: vibeProfiles["Confident & Empowered"] };
    if (isRomantic) return { mood: "Romantic & Passionate", profile: vibeProfiles["Romantic & Passionate"] };
    if (isAnxious) return { mood: "Anxious & Stressed", profile: vibeProfiles["Anxious & Stressed"] };
    if (isNostalgic) return { mood: "Nostalgic & Reflective", profile: vibeProfiles["Nostalgic & Reflective"] };
    if (isTired) return { mood: "Tired & Burned Out", profile: vibeProfiles["Tired & Burned Out"] };

    if (isHappy && !isLowEnergy) return { mood: "Happy & Energetic", profile: vibeProfiles["Happy & Energetic"] };
    if (isHappy && isLowEnergy) return { mood: "Happy & Calm", profile: vibeProfiles["Happy & Calm"] };
    if (isSad && !isHighEnergy) return { mood: "Sad & Melancholy", profile: vibeProfiles["Sad & Melancholy"] };
    if (isSad && isHighEnergy) return { mood: "Angry & Energetic", profile: vibeProfiles["Angry & Energetic"] };
    return { mood: "Neutral & Focused", profile: vibeProfiles["Neutral & Focused"] };
};