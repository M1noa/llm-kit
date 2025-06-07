// test-ddg.ts - separate test file for DuckDuckGo search with proper rate limiting

import { search } from "./index";
import { SearchProvider } from "./types";

async function testDuckDuckGo() {
  console.log("🔍 testing DuckDuckGo search...\n");

  try {
    const testQuery = "typescript programming";
    console.log(`Searching for: "${testQuery}"`);
    
    const results = await search(testQuery, {
      provider: SearchProvider.DuckDuckGo,
      limit: 5
    });

    console.log("\nResults found:", results.length);
    console.log(JSON.stringify(results, null, 2));

    // Test SafeSearch feature
    console.log("\nTesting SafeSearch...");
    const safeResults = await search("adult content", {
      provider: SearchProvider.DuckDuckGo,
      limit: 1,
      safeSearch: true
    });

    console.log("SafeSearch result:", safeResults.length ? safeResults[0].title : "No results");
    
    console.log("\n✅ DuckDuckGo tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ DuckDuckGo test failed:", error);
    process.exit(1);
  }
}

testDuckDuckGo();