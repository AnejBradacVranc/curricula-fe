import type { ApiResponse } from "@/types";
import type { AxiosResponse } from "axios";

export async function unwrap<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  const { data } = await request;
  return data.data;
}
