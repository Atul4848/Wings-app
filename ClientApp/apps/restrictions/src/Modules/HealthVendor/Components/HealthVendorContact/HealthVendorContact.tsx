import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { IOptionValue } from '@wings-shared/core';
import { Collapsable } from '@wings-shared/layout';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { CONTACT_TYPE, HealthVendorContactModel } from '../../../Shared';
import { Field } from 'mobx-react-form';
import { observable } from 'mobx';
import HealthVendorContactGrid from './HealthVendorContactGrid';

interface Props {
  isEditable: boolean;
  contacts: HealthVendorContactModel[];
  onUpdate: (contacts: HealthVendorContactModel, removeContact?: boolean) => void;
  onContactEditing: (isEditing: boolean) => void;
  getField: (fieldKey: string) => Field;
  onChange: (value: IOptionValue, fieldKey: string) => void;
}

const HealthVendorContact: FC<Props> = ({ ...props }: Props) => {
  const _observable = observable({ isEmailEditing: false, isPhoneEditing: false });

  const onContactEditing = (isPhone: boolean, isEmail: boolean): void => {
    _observable.isPhoneEditing = isPhone;
    _observable.isEmailEditing = isEmail;
    props.onContactEditing(isPhone || isEmail);
  };

  return (
    <>
      <Collapsable title="Survey Link">
        <ViewInputControl
          field={props.getField('surveyLink')}
          isEditable={props.isEditable}
          onValueChange={(option, _) => props.onChange(option, 'surveyLink')}
          type={EDITOR_TYPES.LINK}
        />
      </Collapsable>
      <HealthVendorContactGrid
        isEditable={props.isEditable}
        type={CONTACT_TYPE.PHONE}
        contacts={props.contacts.filter(x => x.isPhoneContact)}
        onUpdate={(data, removeModal) => props.onUpdate(data, removeModal)}
        onContactEditing={isEditing => onContactEditing(isEditing, _observable.isEmailEditing)}
      />
      <HealthVendorContactGrid
        isEditable={props.isEditable}
        type={CONTACT_TYPE.EMAIL}
        contacts={props.contacts.filter(x => x.isEmailContact)}
        onUpdate={(data, removeModal) => props.onUpdate(data, removeModal)}
        onContactEditing={isEditing => onContactEditing(_observable.isPhoneEditing, isEditing)}
      />
    </>
  );
};

export default observer(HealthVendorContact);
