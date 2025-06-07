import { search } from "./index";
import { SearchProvider } from "./types";

async function testGoogleSearch() {
  console.log("🔍 Testing Google Search...\n");

  try {
    console.log('Searching for: "typescript programming"');
    const results = await search("typescript programming", {
      provider: SearchProvider.Google,
      limit: 5
    });

    console.log("\nResults found:", results.length);
    console.log(JSON.stringify(results, null, 2));
    console.log("\n✅ Google search test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Google search test failed:", error);
    process.exit(1);
  }
}

testGoogleSearch();