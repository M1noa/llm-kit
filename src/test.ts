// test.ts - test all the things cuz we're responsible devs... kinda

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  search,
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
  SearchError
} from './index';

// get random item from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// test parsing all files in test/files directory
async function testParser() {
  console.log('\n📝 PARSER MODULE TEST');
  console.log('-------------------');

  const testFilesDir = join(process.cwd(), 'test', 'files');
  const files = readdirSync(testFilesDir);

  for (const file of files) {
    const filePath = join(testFilesDir, file);
    console.log(`\nTesting file: ${file}`);

    try {
      const result = await parse(filePath, {
        csv: { columns: true },
        language: 'eng',
        xml: {
          ignoreAttributes: false,
          parseAttributeValue: true
        }
      });

      console.log('File type:', result.type);
      console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
      
      if (result.data) {
        console.log('Data sample:', JSON.stringify(result.data?.slice?.(0, 2) || result.data, null, 2));
      }
      
      // Show preview of text content
      const textPreview = result.text.slice(0, 200) + (result.text.length > 200 ? '...' : '');
      console.log('Text preview:', textPreview);
      console.log('✅ Successfully parsed');
    } catch (err) {
      const error = err as SearchError;
      console.warn(`⚠️ Failed to parse ${file}:`, error.message);
      if (error.code) {
        console.warn('Error code:', error.code);
      }
    }
  }
}

async function runTests() {
  console.log('🔍 starting tests...\n');
  
  try {
    // test search module
    console.log('📖 SEARCH MODULE TEST');
    console.log('--------------------');
    
    console.log('\n1. Search Results:');
    const searchResults = await search('typescript programming');
    console.log(JSON.stringify(searchResults, null, 2));
    
    // Add delay before next module
    await delay(3000);

    // test wikipedia module
    console.log('\n\n📚 WIKIPEDIA MODULE TEST');
    console.log('----------------------');
    
    console.log('\n1. Wikipedia Search Results:');
    const wikiResults = await wikiSearch('Node.js');
    console.log(JSON.stringify(wikiResults, null, 2));
    
    if (wikiResults.length > 0) {
      await delay(1000);
      console.log('\n2. Wikipedia Article Content:');
      const content = await wikiGetContent(wikiResults[0].title);
      console.log(content.substring(0, 500) + '...');
      
      await delay(1000);
      console.log('\n3. Wikipedia Article Summary:');
      const summary = await wikiGetSummary(wikiResults[0].title);
      console.log(JSON.stringify(summary, null, 2));
    }

    // Add delay before next module
    await delay(2000);

    // test hackernews module
    console.log('\n\n💻 HACKER NEWS MODULE TEST');
    console.log('------------------------');
    
    console.log('\n1. Top Stories:');
    const topStories = await getTopStories(5);
    console.log(JSON.stringify(topStories, null, 2));
    
    await delay(500);
    console.log('\n2. New Stories:');
    const newStories = await getNewStories(5);
    console.log(JSON.stringify(newStories, null, 2));
    
    await delay(500);
    console.log('\n3. Best Stories:');
    const bestStories = await getBestStories(5);
    console.log(JSON.stringify(bestStories, null, 2));
    
    await delay(500);
    console.log('\n4. Ask HN Stories:');
    const askStories = await getAskStories(5);
    console.log(JSON.stringify(askStories, null, 2));
    
    await delay(500);
    console.log('\n5. Show HN Stories:');
    const showStories = await getShowStories(5);
    console.log(JSON.stringify(showStories, null, 2));
    
    await delay(500);
    console.log('\n6. Job Stories:');
    const jobStories = await getJobStories(5);
    console.log(JSON.stringify(jobStories, null, 2));

    if (topStories.length > 0) {
      await delay(500);
      console.log('\n7. Single Story Details:');
      const storyId = parseInt(topStories[0].url.split('id=')[1]);
      const story = await getStoryById(storyId);
      console.log(JSON.stringify(story, null, 2));
    }

    // Add delay before next module
    await delay(2000);

    // test webpage module
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
      
      await delay(1000);
      console.log('\n3. Webpage Text:');
      const text = await getWebpageText(randomResult.url);
      console.log(text);
    }

    // Add delay before parser tests
    await delay(2000);

    // test parser module with all test files
    await testParser();

    console.log('\n\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!\n');

  } catch (err) {
    const error = err as SearchError;
    console.error('\n❌ TEST FAILED:', {
      message: error.message,
      code: error.code,
      details: error.originalError
    });
    process.exit(1);
  }
}

runTests();
