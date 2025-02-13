/*
 * @microeinhundert/radonis-build
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  AssetsManifest,
  BuildManifest,
  BuildManifestEntry,
  ComponentIdentifier,
  HydrationRequirements,
} from "@microeinhundert/radonis-types";

/**
 * Extract the required assets from an assets manifest
 * @internal
 */
export function extractRequiredAssets(
  assetsManifest: AssetsManifest,
  requiredAssets: { components: Set<ComponentIdentifier> },
  canOmitEntryFile?: boolean
): AssetsManifest {
  const extractedAssets = assetsManifest.reduce<AssetsManifest>((assets, asset) => {
    /**
     * Always include the entry file
     */
    if (asset.type === "entry") {
      return [...assets, asset];
    }

    /**
     * Include the component if it is required
     */
    if (requiredAssets.components.has(asset.identifier)) {
      return [asset, ...assets];
    }

    return assets;
  }, []);

  /**
   * Return no assets if the entry file is the only asset and `canOmitEntryFile` is true
   */
  if (extractedAssets.length === 1 && extractedAssets[0].type === "entry" && canOmitEntryFile) {
    return [];
  }

  return extractedAssets;
}

/**
 * Reduce the hydration requirements for a build manifest entry and its imports
 */
function reduceHydrationRequirements(
  buildManifestEntries: BuildManifestEntry[],
  initialRequirements?: HydrationRequirements
): HydrationRequirements {
  return buildManifestEntries.reduce<HydrationRequirements>(
    (hydrationRequirements, buildManifestEntry) => {
      const childRequirements = reduceHydrationRequirements(buildManifestEntry.imports);

      const mergedFlashMessages = new Set([
        ...childRequirements.flashMessages,
        ...hydrationRequirements.flashMessages,
        ...buildManifestEntry.flashMessages,
      ]);
      const mergedMessages = new Set([
        ...childRequirements.messages,
        ...hydrationRequirements.messages,
        ...buildManifestEntry.messages,
      ]);
      const mergedRoutes = new Set([
        ...childRequirements.routes,
        ...hydrationRequirements.routes,
        ...buildManifestEntry.routes,
      ]);

      return {
        flashMessages: Array.from(mergedFlashMessages),
        messages: Array.from(mergedMessages),
        routes: Array.from(mergedRoutes),
      };
    },
    initialRequirements ?? {
      flashMessages: [],
      messages: [],
      routes: [],
    }
  );
}

/**
 * Generate an assets manifest
 * @internal
 */
export function generateAssetsManifest(buildManifest: BuildManifest): AssetsManifest {
  return Object.entries(buildManifest).reduce<AssetsManifest>((assetsManifest, [identifier, entry]) => {
    if (entry.type === "chunk") {
      /**
       * Should never occur since chunks
       * are not on the topmost level
       */
      return assetsManifest;
    }

    return [
      ...assetsManifest,
      {
        type: entry.type,
        identifier,
        path: entry.path,
        ...reduceHydrationRequirements(entry.imports, {
          flashMessages: entry.flashMessages,
          messages: entry.messages,
          routes: entry.routes,
        }),
      },
    ];
  }, []);
}
