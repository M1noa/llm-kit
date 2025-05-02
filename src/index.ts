// index.ts - main entry point for the package

// export all our cool modules
export * from './modules/search';
export * from './modules/wikipedia';
export * from './modules/hackernews';
export * from './modules/webpage';

// export types
export * from './types';

// version info
export const VERSION = '1.0.0';
export const AUTHOR = 'llm-search';

// default config
export const DEFAULT_TIMEOUT = 10000;
export const DEFAULT_LIMIT = 10;

// some helpful messages for debugging
console.debug('llm-search initialized... lets find some stuff!');
console.debug(`version: ${VERSION}`);