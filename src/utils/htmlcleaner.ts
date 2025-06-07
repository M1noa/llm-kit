// utils/htmlcleaner.ts - utilities for processing and cleaning html

import * as cheerio from "cheerio";

/**
 * Process HTML to convert relative URLs to absolute ones
 * @param html The HTML string
 * @param baseUrl The base URL for resolving relative URLs
 * @returns HTML with absolute URLs
 */
export function makeUrlsAbsolute(html: string, baseUrl: string): string {
  const $ = cheerio.load(html);
  
  // convert relative urls to absolute
  ["href", "src"].forEach((attr) => {
    $(`[${attr}]`).each((_, element) => {
      const el = $(element);
      const value = $(el).attr(attr);
      if (value && !value.startsWith("data:") && !value.startsWith("http")) {
        try {
          const absoluteUrl = new URL(value, baseUrl).toString();
          $(el).attr(attr, absoluteUrl);
        } catch {
          // keep original if URL parsing fails
        }
      }
    });
  });

  return $.html();
}

/**
 * Cleans HTML by removing invisible elements and minifies it while preserving visible content
 * @param html The HTML string to clean
 * @returns Cleaned and minified HTML with visible content preserved
 */
export function cleanAndMinifyHtml(html: string): string {
  // Load HTML into Cheerio
  const $ = cheerio.load(html);

  // Remove invisible and non-content elements
  const elementsToRemove = [
    "script",
    "style",
    "meta",
    'link[rel="stylesheet"]',
    'link[rel="preload"]',
    'link[rel="prefetch"]',
    "iframe",
    "noscript",
    "svg",
    "video",
    "object",
    "embed",
    "canvas",
    "template",
    '[style*="display:none"]',
    '[style*="display: none"]',
    '[style*="visibility:hidden"]',
    '[style*="visibility: hidden"]',
    "[hidden]",
    '[aria-hidden="true"]',
  ];

  // Remove all specified elements
  elementsToRemove.forEach((selector) => {
    $(selector).remove();
  });

  // Remove JavaScript event handlers
  $("*").each((_, element) => {
    const el = $(element);
    const tagName = el.prop('tagName')?.toLowerCase();
    
    // Get all attributes
    const attributes: string[] = [];
    (el[0] as any).attribs && Object.keys((el[0] as any).attribs).forEach(attr => {
      attributes.push(attr);
    });
    
    // Process each attribute
    attributes.forEach(attr => {
      // Remove JavaScript event handlers
      if (attr.startsWith("on")) {
        el.removeAttr(attr);
        return;
      }
      
      // Keep essential attributes but remove others
      const keepAttribute =
        // Keep structural attributes
        attr === "href" ||
        attr === "src" ||
        attr === "alt" ||
        attr === "title" ||
        // Keep basic formatting
        attr === "colspan" ||
        attr === "rowspan" ||
        // Keep semantic attributes
        attr === "role" ||
        attr === "aria-label" ||
        // Keep header identification
        (attr === "id" &&
          (tagName === "h1" ||
           tagName === "h2" ||
           tagName === "h3" ||
           tagName === "h4" ||
           tagName === "h5" ||
           tagName === "h6" ||
           tagName === "header"));

      if (!keepAttribute) {
        el.removeAttr(attr);
      }
    });
  });

  // Basic HTML minification
  let result = $.html();

  // Minify the HTML
  result = result
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove extra whitespace
    .replace(/\s{2,}/g, " ")
    // Remove whitespace between tags
    .replace(/>\s+</g, "><")
    // Remove whitespace at start/end of each line
    .replace(/^\s+|\s+$/gm, "")
    // Remove unnecessary line breaks while keeping some structure
    .replace(/\n+/g, "\n");

  return result;
}

/**
 * Process HTML by cleaning it and converting all URLs to absolute
 * @param html The HTML string to process
 * @param baseUrl The base URL for resolving relative URLs
 * @returns Processed HTML
 */
export function processHtml(html: string, baseUrl: string): string {
  // first clean and minify
  const cleaned = cleanAndMinifyHtml(html);
  // then convert urls to absolute
  return makeUrlsAbsolute(cleaned, baseUrl);
}