#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.error('[SchemaValidator] Error: dist/ directory does not exist. Run build first.');
  process.exit(1);
}

function getAllHtmlFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(full, fileList);
    } else if (entry.name.endsWith('.html')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(distDir);
console.log(`[SchemaValidator] Validating Schema.org JSON-LD across ${htmlFiles.length} built HTML files...`);

let totalValidated = 0;
let errors = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');

  // Skip redirect shims
  if (/<meta\s+http-equiv=["']refresh["']/i.test(content)) continue;

  const scriptMatches = content.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  for (const match of scriptMatches) {
    totalValidated++;
    const rawJson = match[1].trim();

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      errors.push({
        file,
        error: `Invalid JSON syntax in application/ld+json: ${err.message}`,
        snippet: rawJson.slice(0, 100)
      });
      continue;
    }

    if (!parsed || typeof parsed !== 'object') {
      errors.push({ file, error: 'JSON-LD root must be an object' });
      continue;
    }

    if (parsed['@context'] !== 'https://schema.org' && parsed['@context'] !== 'http://schema.org') {
      errors.push({ file, error: `Invalid @context: expected "https://schema.org", got "${parsed['@context']}"` });
    }

    const nodes = parsed['@graph'] ? parsed['@graph'] : [parsed];

    if (!Array.isArray(nodes)) {
      errors.push({ file, error: '@graph must be an array of Schema.org entities' });
      continue;
    }

    for (const node of nodes) {
      if (!node['@type'] || typeof node['@type'] !== 'string') {
        errors.push({ file, error: `Node missing valid @type string: ${JSON.stringify(node).slice(0, 80)}` });
        continue;
      }

      // STRICT QUALITY GATE: No unverified ratings/reviews
      if (node['@type'] === 'AggregateRating' || node.aggregateRating || node.review) {
        errors.push({
          file,
          error: `VIOLATION: Unverified AggregateRating/Review schema detected on node type ${node['@type']}. This violates Google quality guidelines.`
        });
      }

      // Check Article requirements
      if (node['@type'] === 'Article') {
        if (!node.headline) errors.push({ file, error: 'Article missing headline' });
        if (!node.author) errors.push({ file, error: 'Article missing author' });
        if (!node.datePublished) errors.push({ file, error: 'Article missing datePublished' });
      }

      // Check WebApplication requirements
      if (node['@type'] === 'WebApplication') {
        if (!node.name) errors.push({ file, error: 'WebApplication missing name' });
        if (!node.applicationCategory) errors.push({ file, error: 'WebApplication missing applicationCategory' });
        if (!node.offers) errors.push({ file, error: 'WebApplication missing offers' });
      }

      // Check BreadcrumbList requirements
      if (node['@type'] === 'BreadcrumbList') {
        if (!Array.isArray(node.itemListElement) || node.itemListElement.length === 0) {
          errors.push({ file, error: 'BreadcrumbList missing or empty itemListElement' });
        }
      }

      // Check FAQPage requirements
      if (node['@type'] === 'FAQPage') {
        if (!Array.isArray(node.mainEntity) || node.mainEntity.length === 0) {
          errors.push({ file, error: 'FAQPage missing mainEntity array' });
        }
      }

      // Check HowTo requirements
      if (node['@type'] === 'HowTo') {
        if (!node.name || !Array.isArray(node.step) || node.step.length === 0) {
          errors.push({ file, error: 'HowTo missing name or valid step array' });
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`\n❌ [SchemaValidator] Failed! Found ${errors.length} Schema.org validation error(s):`);
  for (const err of errors.slice(0, 20)) {
    const relFile = path.relative(distDir, err.file);
    console.error(`  - [${relFile}] ${err.error}`);
  }
  process.exit(1);
}

console.log(`✓ [SchemaValidator] All ${totalValidated} JSON-LD schemas verified successfully with 0 errors!`);
