import { useMemo } from 'react';
import { useLocation } from 'react-router';
export const useBasePath = (locationPath: string) => {
  const location = useLocation();
  const basePath = useMemo(() => {
    const pathList = location.pathname.split('/');
    const indexOfOR = pathList.indexOf(locationPath);
    return pathList.slice(0, indexOfOR + 1).join('/');
  }, [location.pathname, locationPath]);

  return basePath;
};

export default useBasePath;
