import { useEffect, useState } from 'react';
import { EVENT, EventEmitter } from '@wings-shared/core';
import ModeStore from './ModeStore';
import { MODE_TYPES } from './ModeTypes.enum';

export const useModeStore = () => {
  const [isDevModeEnabled, updateDevMode] = useState(
    ModeStore.isModeEnabled(MODE_TYPES.DEV)
  );

  const updateUserMode = (event: Event) => {
    const isEnabled = (event as CustomEvent<boolean>).detail;
    updateDevMode(isEnabled);
  };

  useEffect(() => {
    EventEmitter.on(EVENT.DEV_MODE_CHANGE, updateUserMode);
    return () => {
      EventEmitter.off(EVENT.DEV_MODE_CHANGE, updateUserMode);
    };
  }, []);

  return { isDevModeEnabled };
};
