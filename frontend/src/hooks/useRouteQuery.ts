import { useState } from "react";
import { fetchRoutes } from "../api/routingApi";
import type { RouteFormValues, RoutesResponse } from "../types";

interface QueryState {
  data: RoutesResponse | null;
  loading: boolean;
  error: string | null;
}

export function useRouteQuery() {
  const [state, setState] = useState<QueryState>({
    data: null,
    loading: false,
    error: null,
  });

  const submit = async (values: RouteFormValues) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fetchRoutes(values);
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setState({ data: null, loading: false, error: message });
    }
  };

  return { ...state, submit };
}
