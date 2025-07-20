import React, { createRef } from 'react';
import { UnsubscribableComponent } from '@wings-shared/core';
import { SettingsType } from '../SettingsType/SettingsType';

export class SettingTypeBase<P> extends UnsubscribableComponent<P> {
  protected readonly settingsTypesRef: React.RefObject<SettingsType> = createRef<SettingsType>();
  constructor(props) {
    super(props);
  }
}
