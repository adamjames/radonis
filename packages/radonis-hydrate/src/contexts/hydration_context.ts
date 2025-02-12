/*
 * @microeinhundert/radonis-hydrate
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createContext } from "react";

/**
 * @internal
 */
export const hydrationContext = createContext<{
  hydrated: boolean;
  id: string | null;
}>({
  hydrated: false,
  id: null,
});

/**
 * @internal
 */
export const HydrationContextProvider = hydrationContext.Provider;
