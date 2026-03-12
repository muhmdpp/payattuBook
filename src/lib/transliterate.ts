/**
 * Utility function to transliterate English text to Malayalam.
 * Uses the public Google Input Tools API.
 */
export async function transliterateToMalayalam(text: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return '';

    try {
        // We split by space to transliterate word by word, as the API works best that way
        const words = trimmed.split(/\s+/);
        const transliteratedWords = await Promise.all(
            words.map(async (word) => {
                // If it's just numbers or special chars, ignore transliteration
                if (!/^[a-zA-Z]+$/.test(word)) return word;

                const response = await fetch(
                    `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ml-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`
                );

                if (!response.ok) return word;

                const data = await response.json();
                if (data[0] === "SUCCESS" && data[1] && data[1][0] && data[1][0][1]) {
                    return data[1][0][1][0] || word; // Return the first suggestion
                }
                return word;
            })
        );

        return transliteratedWords.join(' ');
    } catch (error) {
        console.error("Transliteration error:", error);
        return ''; // Return empty string on failure so it doesn't overwrite manually typed text with garbage
    }
}
