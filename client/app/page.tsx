"use client";

import { useEffect, useState } from "react";

interface Item {
  id: number;
  name: string;
  description: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json() as Promise<Item[]>;
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Items from API
        </h1>

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        )}

        {error && (
          <p className="text-red-500">Error: {error}</p>
        )}

        {!loading && !error && (
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
              >
                <p className="font-medium text-black dark:text-zinc-50">
                  {item.name}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
