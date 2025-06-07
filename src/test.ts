// test.ts - test all the things cuz we're responsible devs... kinda

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  search,
  searchNews,
  wikiSearch,
  wikiGetContent,
  wikiGetSummary,
  getTopStories,
  getNewStories,
  getBestStories,
  getAskStories,
  getShowStories,
  getJobStories,
  getStoryById,
  getWebpageContent,
  getWebpageText,
  isUrlAccessible,
  parse,
  SearchError,
  searchUrbanDictionary,
  getAutocompleteSuggestions,
  // Add Finance imports
  getStockQuote,
  getStockHistory,
  getCompanyProfile,
  searchStocks,
  // Add Reddit imports
  getSubredditHot,
  searchReddit,
  getPostFromUrl,
} from "./index";
import { SearchProvider } from "./types";

// get random item from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// test parsing all files in test/files directory
async function testParser() {
  console.log("\n📝 PARSER MODULE TEST");
  console.log("-------------------");

  const testFilesDir = join(process.cwd(), "test", "files");
  const files = readdirSync(testFilesDir);

  for (const file of files) {
    const filePath = join(testFilesDir, file);
    console.log(`\nTesting file: ${file}`);

    try {
      const result = await parse(filePath, {
        csv: { columns: true },
        language: "eng",
        xml: {
          ignoreAttributes: false,
          parseAttributeValue: true,
        },
      });

      console.log("File type:", result.type);
      console.log("Metadata:", JSON.stringify(result.metadata, null, 2));

      if (result.data) {
        console.log(
          "Data sample:",
          JSON.stringify(result.data?.slice?.(0, 2) || result.data, null, 2)
        );
      }

      // Show preview of text content
      const textPreview =
        result.text.slice(0, 200) + (result.text.length > 200 ? "..." : "");
      console.log("Text preview:", textPreview);
      console.log("✅ Successfully parsed");
    } catch (err) {
      const error = err as SearchError;
      console.warn(`⚠️ Failed to parse ${file}:`, error.message);
      if (error.code) {
        console.warn("Error code:", error.code);
      }
    }
  }
}

async function runTests() {
  console.log("🔍 starting tests...\n");

  try {
    // test search module
    console.log("📖 SEARCH MODULE TEST");
    console.log("--------------------");

    // Test all search providers
    const testQuery = "typescript programming";
    const testLimit = 3;

    console.log("\n1. Google Search Results:");
    const googleResults = await search(testQuery, {
      provider: SearchProvider.Google,
      limit: testLimit,
    });
    console.log("Found", googleResults.length, "Google results");
    console.log(JSON.stringify(googleResults, null, 2));

    // Add longer delay before Brave search
    await delay(3000);
    console.log("\nWaiting before Brave search...");
    console.log("\n2. Brave Search Results:");
    const braveResults = await search(testQuery, {
      provider: SearchProvider.Brave,
      limit: testLimit,
    });
    console.log("Found", braveResults.length, "Brave results");
    console.log(JSON.stringify(braveResults, null, 2));

    // Add longer delay before DuckDuckGo search
    await delay(8000); // Increased delay for DuckDuckGo's strict rate limiting
    console.log("\nWaiting before DuckDuckGo search...");
    console.log("\n3. DuckDuckGo Search Results:");
    try {
      const ddgResults = await search(testQuery, {
        provider: SearchProvider.DuckDuckGo,
        limit: testLimit,
      });
      console.log("Found", ddgResults.length, "DuckDuckGo results");
      console.log(JSON.stringify(ddgResults, null, 2));

      // Only test SafeSearch if first DDG query succeeded
      await delay(8000); // Increased delay for second DuckDuckGo query
      console.log("\n4. Safe Search Test (DuckDuckGo):");
      const safeResults = await search("adult content", {
        provider: SearchProvider.DuckDuckGo,
        limit: 1,
        safeSearch: true,
      });
      console.log(
        "SafeSearch enabled result:",
        safeResults.length ? safeResults[0].title : "No results"
      );
    } catch (err) {
      const error = err as SearchError;
      console.log("DuckDuckGo search failed (rate limiting):", error.message);
      console.log(
        "Try running DuckDuckGo tests separately with: npm run test-ddg"
      );
      console.log(
        "Note: DuckDuckGo has strict rate limits, wait a few minutes between tests."
      );
    }

    // Add longer delay before Ecosia search
    await delay(5000);
    console.log("\nWaiting 5s before Ecosia search...");
    console.log("\n5. Ecosia Search Results:");
    try {
      const simpleQuery = "hello world"; // Simpler query for testing
      console.log("Testing Ecosia search with query:", simpleQuery);
      console.log("------------------------");
      const ecosiaResults = await search(simpleQuery, {
        provider: SearchProvider.Ecosia,
        limit: testLimit,
      });
      console.log("------------------------");
      if (ecosiaResults.length === 0) {
        console.log("⚠️ No Ecosia results found");
        console.log(
          "This might indicate an issue with HTML parsing or selectors"
        );
        // Print details that might help debug the issue
        console.log("Provider:", "ecosia");
        console.log("Query:", simpleQuery);
        console.log("Limit:", testLimit);
      } else {
        console.log("✅ Found", ecosiaResults.length, "Ecosia results");
        console.log("Results:");
        console.log(JSON.stringify(ecosiaResults, null, 2));
      }
    } catch (err) {
      const error = err as SearchError;
      console.log("❌ Ecosia search failed");
      console.log("Error details:", {
        message: error.message,
        code: error.code,
        originalError: error.originalError
      });
    }

    // Add delay before next module
    await delay(1000);

    // test news module
    console.log("\n\n� NEWS MODULE TEST");
    console.log("------------------");

    console.log("\n1. RSS Feed Results:");
    console.log("Fetching news from multiple sources...");
    const rssNews = await searchNews("artificial intelligence", {
      timeout: 15000,
      limit: 8,
    });
    console.log(JSON.stringify(rssNews, null, 2));

    await delay(2000);
    console.log("\n2. Google News RSS Results:");
    const googleRssNews = await searchNews("artificial intelligence", {
      provider: "google-rss",
      limit: 5,
    });
    console.log(JSON.stringify(googleRssNews, null, 2));

    await delay(2000);
    console.log("\n3. Google News Scraping Results:");
    const googleScrapedNews = await searchNews("artificial intelligence", {
      provider: "google",
      timeframe: "1d",
      limit: 5,
    });
    console.log(JSON.stringify(googleScrapedNews, null, 2));

    await delay(2000);
    console.log("\n4. Search Across RSS Feeds:");
    const newsSearchResults = await searchNews("climate change", {
      timeout: 5000,
      limit: 3,
    });
    console.log(JSON.stringify(newsSearchResults, null, 2));

    // Add delay before next module
    await delay(3000);

    // test wikipedia module
    console.log("\n\n📚 WIKIPEDIA MODULE TEST");
    console.log("----------------------");

    console.log("\n1. Wikipedia Search Results:");
    const wikiResults = await wikiSearch("Node.js");
    console.log(JSON.stringify(wikiResults, null, 2));

    if (wikiResults.length > 0) {
      await delay(1000);
      console.log("\n2. Wikipedia Article Content:");
      const content = await wikiGetContent(wikiResults[0].title);
      console.log(content.substring(0, 500) + "...");

      await delay(1000);
      console.log("\n3. Wikipedia Article Summary:");
      const summary = await wikiGetSummary(wikiResults[0].title);
      console.log(JSON.stringify(summary, null, 2));
    }

    // Add delay before next module
    await delay(2000);

    // test hackernews module
    console.log("\n\n💻 HACKER NEWS MODULE TEST");
    console.log("------------------------");

    console.log("\n1. Top Stories:");
    const topStories = await getTopStories(5);
    console.log(JSON.stringify(topStories, null, 2));

    await delay(500);
    console.log("\n2. New Stories:");
    const newStories = await getNewStories(5);
    console.log(JSON.stringify(newStories, null, 2));

    await delay(500);
    console.log("\n3. Best Stories:");
    const bestStories = await getBestStories(5);
    console.log(JSON.stringify(bestStories, null, 2));

    await delay(500);
    console.log("\n4. Ask HN Stories:");
    const askStories = await getAskStories(5);
    console.log(JSON.stringify(askStories, null, 2));

    await delay(500);
    console.log("\n5. Show HN Stories:");
    const showStories = await getShowStories(5);
    console.log(JSON.stringify(showStories, null, 2));

    await delay(500);
    console.log("\n6. Job Stories:");
    const jobStories = await getJobStories(5);
    console.log(JSON.stringify(jobStories, null, 2));

    if (topStories.length > 0) {
      await delay(500);
      console.log("\n7. Single Story Details:");
      const storyId = parseInt(topStories[0].url.split("id=")[1]);
      const story = await getStoryById(storyId);
      console.log(JSON.stringify(story, null, 2));
    }

    // Add delay before Reddit module tests
    await delay(2000);

    // test reddit module
    console.log("\n\n📱 REDDIT MODULE TEST");
    console.log("-------------------");

    console.log("\n1. Hot Posts from r/news:");
    const hotPosts = await getSubredditHot("news", 5);
    console.log("Found", hotPosts.length, "hot posts");
    console.log(JSON.stringify(hotPosts, null, 2));

    await delay(2000);
    console.log("\n2. Reddit Search Results:");
    const redditSearchResults = await searchReddit("programming tips", {
      sort: "hot",
      limit: 5,
    });
    console.log("Found", redditSearchResults.length, "search results");
    console.log(JSON.stringify(redditSearchResults, null, 2));

    if (hotPosts.length > 0) {
      await delay(2000);
      console.log("\n3. Single Post Details:");
      const post = await getPostFromUrl(hotPosts[0].permalink);
      console.log("Post details:");
      console.log(JSON.stringify(post, null, 2));

      // Test webpage integration with Reddit
      await delay(2000);
      console.log("\n4. Webpage Content from Reddit Post:");
      const webContent = await getWebpageContent(hotPosts[0].permalink);
      console.log("Title:", webContent.title);
      console.log("Site Name:", webContent.siteName);
      console.log("Metadata:", JSON.stringify(webContent.metadata, null, 2));
      console.log(
        "Content Preview:",
        webContent.textContent.slice(0, 200) + "..."
      );
    }

    // Add delay before webpage module
    await delay(2000);

    // test webpage module
    console.log("\n\n📄 WEBPAGE MODULE TEST");
    console.log("--------------------");

    // use a specific url for testing
    const testUrl =
      "https://www.ecosia.org/search?q=hello+world&safesearch=off";
    console.log(`\n1. Testing URL: ${testUrl}`);

    const isAccessible = await isUrlAccessible(testUrl);
    console.log("\nURL Accessibility:", isAccessible);

    if (isAccessible) {
      console.log("\n2. Webpage Content Test:");
      try {
        const content = await getWebpageContent(testUrl);
        console.log("Title:", content.title);
        console.log("Favicon:", content.faviconUrl);
        console.log("Content Preview:", content.content.slice(0, 200) + "...");
        console.log("Text Preview:", content.textContent.slice(0, 200) + "...");
        console.log(
          "Markdown Preview:",
          content.markdown?.slice(0, 200) + "..."
        );
        console.log("\nAssets Found:");
        console.log(
          content.assets?.map((asset) => `${asset.type}: ${asset.url}`)
        );

        await delay(1000);
        console.log("\n3. Clean Text Content:");
        const text = await getWebpageText(testUrl);
        console.log(text.slice(0, 500) + "...");
      } catch (err) {
        console.log("Failed to get webpage content:", err);
      }
    }

    // test autocomplete module
    console.log("\n\n🔍 AUTOCOMPLETE MODULE TEST");
    console.log("-------------------------");

    console.log("\n1. Default Provider (DuckDuckGo):");
    const ddgSuggestions = await getAutocompleteSuggestions("javascript");
    console.log(JSON.stringify(ddgSuggestions, null, 2));

    await delay(500);
    console.log("\n2. Brave Provider (with rich results):");
    const braveSuggestions = await getAutocompleteSuggestions("javascript", {
      provider: "brave",
      limit: 5,
    });
    console.log(JSON.stringify(braveSuggestions, null, 2));

    await delay(500);
    console.log("\n3. Google Provider:");
    const googleSuggestions = await getAutocompleteSuggestions("javascript", {
      provider: "google",
      limit: 5,
    });
    console.log(JSON.stringify(googleSuggestions, null, 2));

    await delay(500);
    console.log("\n4. Error Handling (empty query):");
    try {
      await getAutocompleteSuggestions("");
    } catch (error) {
      const searchError = error as SearchError;
      console.log("Error caught successfully:", searchError.message);
    }

    // Add delay before urban dictionary tests
    await delay(2000);

    // test urban dictionary module
    console.log("\n\n📚 URBAN DICTIONARY MODULE TEST");
    console.log("-----------------------------");

    console.log("\n1. Basic Search:");
    const urbanResults = await searchUrbanDictionary("yeet");
    console.log(JSON.stringify(urbanResults.slice(0, 2), null, 2));

    await delay(500);
    console.log("\n2. Error Handling Test (empty query):");
    const emptyResults = await searchUrbanDictionary("");
    console.log("Empty query results:", emptyResults);

    // Add delay before parser tests
    await delay(2000);

    // test parser module with all test files
    await testParser();

    console.log("\n\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!\n");
    process.exit(0);
  } catch (err) {
    const error = err as SearchError;
    console.error("\n❌ TEST FAILED:", {
      message: error.message,
      code: error.code,
      details: error.originalError,
    });
    process.exit(1);
  }
}

runTests();
