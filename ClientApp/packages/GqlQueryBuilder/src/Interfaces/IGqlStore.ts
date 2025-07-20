export interface IGqlStore {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  projections: object;
  fields: object;
  hasChanges: boolean;
  setHasChanges: (hasChange) => void;
}
