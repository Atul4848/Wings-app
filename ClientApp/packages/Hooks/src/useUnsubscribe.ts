import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { IPagination } from '@wings-shared/form-controls';

// Hook
export const useUnsubscribe = () => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const debounceTime: number = 300;
  const destroy$: Subject<boolean> = new Subject<boolean>();
  const debounce$: Subject<string> = new Subject<string>();
  const gridAdvancedSearchFilterDebounce$: Subject<string> = new Subject<string>();
  const [ pagination, setPagination ] = useState(new Map<string, IPagination>());

  useEffect(() => {
    return () => {
      destroy$.next(true);
      destroy$.unsubscribe();
    };
  }, []);
  return {
    destroy$,
    debounce$,
    hasLoaded,
    debounceTime,
    gridAdvancedSearchFilterDebounce$,
    pagination,
    setHasLoaded,
    setPagination: (key: string, value: IPagination) => {
      pagination.set(key, value);
      setPagination(new Map(pagination));
    }
  };
};
