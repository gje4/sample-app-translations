import { useState } from "react";
import useSWR from "swr";
import { ListItem } from "../types";

async function fetcher(url: string) {
  return await fetch(url).then((res) => res.json());
}

// Reusable SWR hooks
// https://swr.vercel.app/
export function useProductList() {
  const [ page, setPage ] = useState(1);
  const [ limit, setLimit ] = useState(10);
  const [ keyword, setKeyword ] = useState('');

  const { data, error, mutate: mutateList } = useSWR(
    `/api/products/list?page=${page}&limit=${limit}&keyword=${keyword}`,
    fetcher
  );

  return {
    list: data,
    isLoading: !data && !error,
    isError: error,
    mutateList,
    page,
    limit,
    keyword,
    setPage,
    setLimit,
    setKeyword,
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
