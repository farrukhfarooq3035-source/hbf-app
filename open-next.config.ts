// default open-next.config.ts file created by @opennextjs/cloudflare
// Using static-assets cache so deploy works without R2 (no "Enable R2" required)
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
});
