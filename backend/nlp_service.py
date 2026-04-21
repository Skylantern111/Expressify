from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# VADER is a lightweight, rule-based lexicon ideal for social/casual text.
# It initializes instantly and uses minimal RAM (no heavy ML models).
analyzer = SentimentIntensityAnalyzer()

def analyze_emotion(text: str) -> dict:
    """
    Analyzes text sentiment and maps it to Spotify audio features.
    Includes fallback logic for low-confidence/neutral inputs.
    """
    scores = analyzer.polarity_scores(text)
    compound = scores['compound']
    
    # FALLBACK LOGIC: Low-confidence / Neutral sentiment
    # If the text lacks strong emotional markers, default to a balanced center.
    if abs(compound) < 0.15:
        return {
            "valence": 0.5,
            "energy": 0.5,
            "compound": compound,
            "genres": ["chill", "pop"]
        }
    
    # 1. Valence Mapping: (compound + 1) / 2 perfectly scales -1.0 -> 1.0 to 0.0 -> 1.0
    valence = round((compound + 1) / 2, 2)
    
    # 2. Energy Mapping: Derived from sentiment intensity (pos + neg markers)
    # Intense emotions (both extreme anger and extreme joy) yield higher energy.
    intensity = scores['pos'] + scores['neg']
    energy = round(min(1.0, max(0.1, intensity + 0.3)), 2)
    
    # Map genres based on general polarity
    genres = ["pop", "dance"] if compound > 0 else ["acoustic", "sad"]
    
    return {
        "valence": valence,
        "energy": energy,
        "compound": compound,
        "genres": genres
    }