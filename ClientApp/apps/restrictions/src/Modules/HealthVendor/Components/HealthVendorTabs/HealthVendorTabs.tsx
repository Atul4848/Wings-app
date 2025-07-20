import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { HealthVendorContactModel } from '../../../Shared';
import { Field } from 'mobx-react-form';
import { IOptionValue, IClasses } from '@wings-shared/core';
import { Typography } from '@material-ui/core';
import { useStyles } from './HealthVendorTabs.style';
import HealthVendorContact from '../HealthVendorContact/HealthVendorContact';

type Props = {
  isEditable: boolean;
  contacts: HealthVendorContactModel[];
  onUpdate: (contacts: HealthVendorContactModel, removeContact?: boolean) => void;
  onContactEditing: (isEditing: boolean) => void;
  getField: (fieldKey: string) => Field;
  onChange: (value: IOptionValue, fieldKey: string) => void;
};

const HealthVendorTabs: FC<Props> = ({
  contacts,
  onUpdate,
  onContactEditing,
  isEditable,
  getField,
  onChange,
}: Props) => {
  const _classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={_classes.title}>
        Contact Info:
      </Typography>
      <div className={_classes.wrapper}>
        <HealthVendorContact
          isEditable={isEditable}
          contacts={contacts}
          onUpdate={(contact, removeContact) => onUpdate(contact, removeContact)}
          onContactEditing={isEditing => onContactEditing(isEditing)}
          getField={getField}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default observer(HealthVendorTabs);
