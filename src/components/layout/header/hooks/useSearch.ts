import { useEffect, useState } from "react";

type SearchSuggestions = {
  products: { slug: string; name: string; brand: string | null }[];
  categories: { slug: string; name: string }[];
};

export function useSearch() {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    products: [],
    categories: [],
  });
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          "/api/search/suggest?q=" + encodeURIComponent(q.trim())
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions({
            products: data.products || [],
            categories: data.categories || [],
          });
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [q]);

  return {
    q,
    setQ,
    suggestions,
    searchFocused,
    setSearchFocused,
  };
}
