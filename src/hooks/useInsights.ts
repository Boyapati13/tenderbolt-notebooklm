'use client';

import useSWR from 'swr';

// Define the shape of an insight
export type Insight = {
  id: string;
  type: "requirement" | "compliance" | "risk" | "deadline";
  content: string;
  citation?: string;
  createdAt: string;
};

// Define the fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }
  const data = await response.json();
  return data.insights as Insight[];
};

export function useInsights(projectId?: string) {
  const endpoint = projectId ? `/api/insights?projectId=${projectId}` : '/api/insights';
  const { data: insights, error, mutate } = useSWR<Insight[]>(endpoint, fetcher);

  return {
    insights: insights || [],
    isLoading: !error && !insights,
    isError: error,
    mutate, // Expose mutate for manual revalidation
  };
}
