import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { useStyles } from './VariationSearchDialog.styles';
import { AircraftVariationModel } from '../../../Shared';
import VariationSearch from '../VariationSearch/VariationSearch';

interface Props {
  onSelect: (selectedVariation: AircraftVariationModel) => void;
}

const VariationSearchDialog: FC<Props> = ({ onSelect }) => {
  const classes = useStyles();

  return (
    <Dialog
      title={'Select Aircraft Type'}
      open={true}
      classes={{
        paperSize: classes.paperSize,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => <VariationSearch onSelect={onSelect} />}
    />
  );
};
export default observer(VariationSearchDialog);
