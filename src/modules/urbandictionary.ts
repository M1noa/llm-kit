// ughh another api to deal with... at least this one is simple
import fetch from 'node-fetch';

interface UrbanDictionaryDefinition {
    definition: string;
    permalink: string;
    thumbs_up: number;
    author: string;
    word: string;
    written_on: string;
    example: string;
    thumbs_down: number;
}

interface UrbanDictionaryResponse {
    list: UrbanDictionaryDefinition[];
}

// look i just want this to work ok
export const searchUrbanDictionary = async (query: string): Promise<UrbanDictionaryDefinition[]> => {
    try {
        // welp here goes nothing
        const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('urban dictionary api is being weird again');
        }
        
        const data = await response.json() as UrbanDictionaryResponse;
        return data.list;
    } catch (error) {
        // oof something broke
        console.error('urban dictionary search failed:', error);
        return [];
    }
};