import { search } from "./modules/search";
import { SearchProvider } from "./types";

async function testEcosiaSearch() {
  console.log("🔍 Testing Ecosia Search");
  console.log("----------------------");

  try {
    const simpleQuery = "hello world";
    console.log("\nTesting with query:", simpleQuery);
    console.log("----------------------");

    const results = await search(simpleQuery, {
      provider: SearchProvider.Ecosia,
      limit: 3,
    });

    console.log("----------------------");
    if (results.length === 0) {
      console.log("⚠️ No results found");
      console.log(
        "This might indicate an issue with HTML parsing or selectors"
      );
      console.log("\nRequest details:");
      console.log("Provider: ecosia");
      console.log("Query:", simpleQuery);
      console.log("Limit:", 3);
    } else {
      console.log("✅ Found", results.length, "results");
      console.log("\nResults:");
      console.log(JSON.stringify(results, null, 2));
    }
  } catch (err: any) {
    console.log("❌ Search failed");
    console.log("Error message:", err.message);
    console.log(
      "Error details:",
      JSON.stringify(
        {
          code: err.code,
          message: err.message,
          originalError: err.originalError,
        },
        null,
        2
      )
    );
  }
}

testEcosiaSearch().catch(console.error);
