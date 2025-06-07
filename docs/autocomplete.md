# Autocomplete Module

The autocomplete module provides search suggestions from various search providers. Each provider returns results in a different format, but this module normalizes them into a consistent structure.

## Usage

```typescript
import { getAutocompleteSuggestions } from "llm-kit";

// use default provider (duckduckgo)
const suggestions = await getAutocompleteSuggestions("hello world");

// specify a provider
const braveSuggestions = await getAutocompleteSuggestions("hello world", {
  provider: "brave",
});

// limit number of results
const topFive = await getAutocompleteSuggestions("hello world", {
  limit: 5,
});
```

## Providers

The module supports several search providers, each with different characteristics:

### DuckDuckGo (default)

- Simple JSON response
- Clean suggestions without extra metadata
- Fast and reliable
- Usually returns 8-10 suggestions

### Google/Yandex

- Array-based response format
- Includes some suggestion metadata
- Usually returns 10 suggestions
- Good international coverage

### Brave

- Rich results with entity information
- Includes images and descriptions for some results
- Usually returns 8-10 suggestions
- Some results have category/type information

### Yahoo

- Most detailed metadata
- Includes descriptions, images, URLs
- Usually returns 10 suggestions
- Slower due to richer response

### Ecosia

- Simple JSON response
- Clean suggestions
- Usually returns 8 suggestions
- Environmentally conscious search engine

### Qwant

- Includes suggestion types/scores
- Privacy-focused
- Usually returns 7-10 suggestions
- European search engine

### Swisscows

- Simple array response
- Clean suggestions
- Usually returns up to 20 suggestions
- Privacy-focused

## Response Format

All providers' responses are normalized to this format:

```typescript
interface AutocompleteSuggestion {
  phrase: string; // the actual suggestion
  score?: number; // relevance score if available
  metadata?: {
    // optional extra data
    type?: string; // entity type/category
    description?: string; // description if available
    imageUrl?: string; // image url if available
    url?: string; // related url if available
  };
}
```

## Options

```typescript
interface AutocompleteOptions {
  provider?:
    | "duckduckgo"
    | "google"
    | "brave"
    | "yahoo"
    | "ecosia"
    | "qwant"
    | "swisscows"
    | "yandex";
  limit?: number; // max number of results to return
}
```

## Error Handling

```typescript
try {
  const suggestions = await getAutocompleteSuggestions("hello world");
} catch (error) {
  if (error.code === "AUTOCOMPLETE_ERROR") {
    console.error("Autocomplete failed:", error.message);
  }
}
```

## Provider Selection

- Use **DuckDuckGo** (default) for simple, reliable suggestions
- Use **Brave** or **Yahoo** when you need rich metadata
- Use **Google/Yandex** for best international coverage
- Use **Qwant/Swisscows** for privacy-focused results
- Use **Ecosia** for environmentally conscious search

## Notes

- All providers return normalized results in the same format
- Rich metadata is only available from providers that support it
- Results are returned in order of relevance as determined by the provider
- Rate limiting may apply depending on the provider
