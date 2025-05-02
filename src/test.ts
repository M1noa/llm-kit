// test.ts - test all the things cuz we're responsible devs... kinda

import {
  search,
  searchGoogle,
  searchDuckDuckGo,
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
  isUrlAccessible
} from './index';

// get random item from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function runTests() {
  console.log('🔍 starting tests...\n');
  
  try {
    // test search module
    console.log('📖 SEARCH MODULE TEST');
    console.log('--------------------');
    
    console.log('\n1. General Search Results:');
    const searchResults = await search('typescript');
    console.log(JSON.stringify(searchResults, null, 2));
    
    console.log('\n2. Google Search Results:');
    const googleResults = await searchGoogle('typescript');
    console.log(JSON.stringify(googleResults, null, 2));
    
    console.log('\n3. DuckDuckGo Search Results:');
    const ddgResults = await searchDuckDuckGo('typescript');
    console.log(JSON.stringify(ddgResults, null, 2));

    // test wikipedia module
    console.log('\n\n📚 WIKIPEDIA MODULE TEST');
    console.log('----------------------');
    
    console.log('\n1. Wikipedia Search Results:');
    const wikiResults = await wikiSearch('Node.js');
    console.log(JSON.stringify(wikiResults, null, 2));
    
    if (wikiResults.length > 0) {
      console.log('\n2. Wikipedia Article Content:');
      const content = await wikiGetContent(wikiResults[0].title);
      console.log(content.substring(0, 500) + '...');
      
      console.log('\n3. Wikipedia Article Summary:');
      const summary = await wikiGetSummary(wikiResults[0].title);
      console.log(JSON.stringify(summary, null, 2));
    }

    // test hackernews module
    console.log('\n\n💻 HACKER NEWS MODULE TEST');
    console.log('------------------------');
    
    console.log('\n1. Top Stories:');
    const topStories = await getTopStories(5);
    console.log(JSON.stringify(topStories, null, 2));
    
    console.log('\n2. New Stories:');
    const newStories = await getNewStories(5);
    console.log(JSON.stringify(newStories, null, 2));
    
    console.log('\n3. Best Stories:');
    const bestStories = await getBestStories(5);
    console.log(JSON.stringify(bestStories, null, 2));
    
    console.log('\n4. Ask HN Stories:');
    const askStories = await getAskStories(5);
    console.log(JSON.stringify(askStories, null, 2));
    
    console.log('\n5. Show HN Stories:');
    const showStories = await getShowStories(5);
    console.log(JSON.stringify(showStories, null, 2));
    
    console.log('\n6. Job Stories:');
    const jobStories = await getJobStories(5);
    console.log(JSON.stringify(jobStories, null, 2));

    if (topStories.length > 0) {
      console.log('\n7. Single Story Details:');
      const storyId = parseInt(topStories[0].url.split('id=')[1]);
      const story = await getStoryById(storyId);
      console.log(JSON.stringify(story, null, 2));
    }

    // test webpage module with random search result
    console.log('\n\n📄 WEBPAGE MODULE TEST');
    console.log('--------------------');
    
    // get a random result from our earlier search
    const randomResult = getRandomItem(searchResults);
    console.log(`\n1. Testing URL from search results: ${randomResult.url}`);
    
    const isAccessible = await isUrlAccessible(randomResult.url);
    console.log('\nURL Accessibility:', isAccessible);
    
    if (isAccessible) {
      console.log('\n2. Webpage Content:');
      const content = await getWebpageContent(randomResult.url);
      console.log(JSON.stringify(content, null, 2));
      
      console.log('\n3. Webpage Text:');
      const text = await getWebpageText(randomResult.url);
      console.log(text);
    } else {
      // fallback to example.com if random result isn't accessible
      console.log('\nFalling back to example.com...');
      const fallbackUrl = 'https://example.com';
      const content = await getWebpageContent(fallbackUrl);
      console.log(JSON.stringify(content, null, 2));
      
      console.log('\n3. Webpage Text:');
      const text = await getWebpageText(fallbackUrl);
      console.log(text);
    }

    console.log('\n\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

runTests();