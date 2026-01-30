/**
 * Patch .open-next/worker.js to remove the image handler import and _next/image branch.
 * This avoids bundling cloudflare/images.js which pulls in resvg.wasm and causes
 * "Missing file ... resvg.wasm?module" on Windows deploy.
 * Safe when next.config.js has images.unoptimized: true (no _next/image requests).
 */
const fs = require('fs');
const path = require('path');

const workerPath = path.join(__dirname, '..', '.open-next', 'worker.js');
if (!fs.existsSync(workerPath)) {
  console.warn('scripts/patch-worker-no-images.js: .open-next/worker.js not found, skip patch');
  process.exit(0);
}

let code = fs.readFileSync(workerPath, 'utf8');

// 1. Remove import of handleImageRequest from images.js (exact two lines)
code = code.replace(
  '//@ts-expect-error: Will be resolved by wrangler build\nimport { handleImageRequest } from "./cloudflare/images.js";\n',
  ''
);

// 2. Remove _next/image branch so request falls through to middlewareHandler
const imageBlock = '            // Fallback for the Next default image loader.\n            if (url.pathname ===\n                `${globalThis.__NEXT_BASE_PATH__}/_next/image${globalThis.__TRAILING_SLASH__ ? "/" : ""}`) {\n                return await handleImageRequest(url, request.headers, env);\n            }\n            ';
code = code.replace(imageBlock, '            // _next/image skipped (no Images/resvg)\n            ');

if (code.includes('handleImageRequest')) {
  console.error('patch-worker-no-images.js: patch failed, handleImageRequest still present');
  process.exit(1);
}

fs.writeFileSync(workerPath, code);
console.log('patch-worker-no-images.js: patched .open-next/worker.js (no image handler)');

// 3. Remove images.js so bundler cannot pull in resvg.wasm (Windows deploy fix)
const imagesPath = path.join(__dirname, '..', '.open-next', 'cloudflare', 'images.js');
if (fs.existsSync(imagesPath)) {
  fs.unlinkSync(imagesPath);
  console.log('patch-worker-no-images.js: removed .open-next/cloudflare/images.js');
}
