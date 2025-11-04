const fs = require('fs');
const path = require('path');

function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
}

function parseNavPaths(navFilePath) {
  const content = readFile(navFilePath);
  if (!content) return [];

  // crude extraction of path: "..." occurrences inside the nav file
  const regex = /path:\s*"([^"]+)"/g;
  const paths = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    paths.push(m[1]);
  }
  return Array.from(new Set(paths));
}

function checkPageForPath(p) {
  // For nested paths like system/settings, check nested dir
  const parts = p.split('/').filter(Boolean);
  const base = path.join(process.cwd(), 'src', 'app', '[locale]');
  const pageDir = path.join(base, ...parts);
  const pageFile = path.join(pageDir, 'page.tsx');
  return fs.existsSync(pageFile);
}

function extractApiRoutes() {
  // scan for strings like '/api/...' in the src folder
  const srcDir = path.join(process.cwd(), 'src');
  const files = walkDir(srcDir);
  const apiSet = new Set();
  files.forEach((f) => {
    const txt = readFile(f);
    if (!txt) return;
    const regex = /\b\/api\/([a-zA-Z0-9_\/\-]+)\b/g;
    let m;
    while ((m = regex.exec(txt)) !== null) {
      apiSet.add(m[1]);
    }
  });
  return Array.from(apiSet);
}

function checkApiRouteExists(route) {
  // route may be like 'system/settings' or 'upload'
  const parts = route.split('/').filter(Boolean);
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api', ...parts);
  // Accept either route.ts or route.js or folder with route.ts
  const candidates = [path.join(apiDir, 'route.ts'), path.join(apiDir, 'route.js')];
  return candidates.some((c) => fs.existsSync(c));
}

function walkDir(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
      const p = path.join(dir, file);
      const stat = fs.statSync(p);
      if (stat && stat.isDirectory()) {
        results = results.concat(walkDir(p));
      } else {
        results.push(p);
      }
    });
  } catch (e) {
    // ignore
  }
  return results;
}

async function main() {
  const navFile = path.join(process.cwd(), 'src', 'lib', 'navigation.ts');
  const navPaths = parseNavPaths(navFile);

  const pageResults = navPaths.map((p) => ({ path: p, hasPage: checkPageForPath(p) }));

  const apiRoutes = extractApiRoutes();
  const apiResults = apiRoutes.map((r) => ({ route: r, exists: checkApiRouteExists(r) }));

  const report = { timestamp: new Date().toISOString(), pages: pageResults, apis: apiResults };
  const outDir = path.join(process.cwd(), '.cache');
  try { fs.mkdirSync(outDir, { recursive: true }); } catch (e) {}
  const outFile = path.join(outDir, 'route-check-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log('Route check report written to', outFile);
  console.log('Pages checked:');
  pageResults.forEach(r => console.log(`${r.hasPage ? '✓' : '✗'} ${r.path}`));
  console.log('\nAPIs referenced:');
  apiResults.forEach(r => console.log(`${r.exists ? '✓' : '✗'} /api/${r.route}`));

  const missingPages = pageResults.filter(r => !r.hasPage);
  const missingApis = apiResults.filter(r => !r.exists);
  if (missingPages.length === 0 && missingApis.length === 0) {
    console.log('\nAll referenced nav pages and API routes appear present.');
    process.exit(0);
  }
  console.log(`\nMissing pages: ${missingPages.length}, missing APIs: ${missingApis.length}`);
  process.exit(1);
}

if (require.main === module) main();
