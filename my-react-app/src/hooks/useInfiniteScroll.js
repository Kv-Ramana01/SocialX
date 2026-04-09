// src/hooks/useInfiniteScroll.js
// NEW: Reusable infinite scroll with intersection observer
import { useEffect, useRef, useCallback } from "react";

/**
 * useInfiniteScroll
 * @param {Function} loadMore - async function to load next page
 * @param {boolean} hasMore - whether more data exists
 * @param {boolean} loading - currently loading
 * @returns {Object} ref - attach to sentinel element at bottom of list
 */
export const useInfiniteScroll = (loadMore, hasMore, loading) => {
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [loadMore, hasMore, loading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px", // Start loading 100px before bottom
      threshold: 0.1,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [handleObserver]);

  return { sentinelRef };
};