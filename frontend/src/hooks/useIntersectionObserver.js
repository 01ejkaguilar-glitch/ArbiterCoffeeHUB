import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for Intersection Observer API
 * Useful for lazy loading components, infinite scroll, and visibility detection
 * @param {Object} options - IntersectionObserver options
 * @param {Function} callback - Callback function when intersection changes
 * @returns {Object} { ref, inView, entry }
 */
const useIntersectionObserver = (options = {}, callback = null) => {
  const [entry, setEntry] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current; // DOM Element

    const handleObserver = (entries) => {
      const target = entries[0];
      setEntry(target);
      if (target.isIntersecting) {
        setInView(true);
        if (callback) callback(target);
      } else {
        setInView(false);
      }
    };

    if (node) {
      const observer = new IntersectionObserver(handleObserver, options);
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [ref, options, callback]);

  return [ref, inView, entry];
};

export default useIntersectionObserver;