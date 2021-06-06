import useSWR from "swr";
import { ListItem } from "../types";

async function fetcher(url: string) {
  return await fetch(url).then((res) => res.json());
}

// Reusable SWR hooks
// https://swr.vercel.app/
export function useProductList() {
  const { data, error, mutate: mutateList } = useSWR(
    "/api/products/list",
    fetcher
  );

  return {
    list: data,
    isLoading: !data && !error,
    isError: error,
    mutateList,
  };
}

export function useProductInfo(pid: number) {
  const { data, error } = useSWR(`/api/products/${pid}`, fetcher)

  return {
    product: data,
    isLoading: !data && !error,
    isError: error,
  };
}
