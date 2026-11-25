import axios from "axios";
import type { RouteFormValues, RoutesResponse } from "../types";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export async function fetchRoutes(payload: RouteFormValues): Promise<RoutesResponse> {
  const { data } = await client.post<RoutesResponse>("/api/routes/", payload);
  return data;
}
