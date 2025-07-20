import { useRef, useEffect } from 'react';

// Help in Prevent first render useEffect
export const useEffectAfterMount = (cb: Function, dependencies: any[]) => {
  const mounted = useRef(true);
  useEffect(() => {
    if (!mounted.current) {
      return cb();
    }
    mounted.current = false;
  }, dependencies);
};
