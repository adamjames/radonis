/*
 * @microeinhundert/radonis-hooks
 *
 * (c) Leon Seipp <l.seipp@microeinhundert.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HookException } from "../../exceptions/hook_exception";
import { useHttpContext } from "./use_http_context";

/**
 * Hook for retrieving the AdonisJS `RequestContract`
 * @see https://radonis.vercel.app/docs/hooks/use-request
 */
export function useRequest() {
  try {
    const { request } = useHttpContext();

    return request;
  } catch {
    throw HookException.cannotUseOnClient("useRequest");
  }
}
