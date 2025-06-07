# Urban Dictionary Module

This module provides a simple interface to search Urban Dictionary definitions.

## Usage

```typescript
import { searchUrbanDictionary } from "llm-kit";

// search for a term
const definitions = await searchUrbanDictionary("wuhluhwuh");

// definitions is an array of results that look like:
interface UrbanDictionaryDefinition {
  definition: string; // the actual definition
  permalink: string; // link to the definition page
  thumbs_up: number; // number of upvotes
  author: string; // who wrote it
  word: string; // the word that was defined
  written_on: string; // when it was written
  example: string; // example usage
  thumbs_down: number; // number of downvotes
}
```

## API Reference

### searchUrbanDictionary(query: string): Promise<UrbanDictionaryDefinition[]>

Searches Urban Dictionary for definitions of the given query term.

#### Parameters

- `query` (string): The term to search for

#### Returns

Promise that resolves to an array of definition objects. Returns empty array if no results or if an error occurs.

#### Example

```typescript
const definitions = await searchUrbanDictionary("poggers");
if (definitions.length > 0) {
  console.log(definitions[0].definition);
  console.log(definitions[0].example);
}
```

## Notes

- Uses the official Urban Dictionary API
- Returns all definitions found for a term, ordered by relevance
- Handles URL encoding of search terms automatically
