'use client';

import useSWR from 'swr';

// Define the fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.project;
};

// Define the custom hook
export function useProject(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(`/api/projects/${projectId}`, fetcher, {
    // Optional: configure SWR options here
    revalidateOnFocus: true, // Revalidate when the window gets focus
  });

  return {
    project: data,
    isLoading,
    isError: error,
    mutate, // To manually trigger re-fetches
  };
}
