import React, { FC, ReactNode, useEffect } from 'react';
import { BaseUpsertComponent, VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { withStyles } from '@material-ui/core';
import { fields } from './Fields';
import { action } from 'mobx';
import { FederationMappingStore, FederationMappingModel, IAPIFederationMappingRequest } from '../../Shared';
import { styles } from './UpsertFederationMapping.style';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IClasses, Utilities } from '@wings-shared/core';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import classNames from 'classnames';

interface Props {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  federationMappingStore?: FederationMappingStore;
  upsertIdpMapping: (request: IAPIFederationMappingRequest) => void,
  federationMapping?: FederationMappingModel;
}

const UpsertFederationMapping: FC<Props> = ({ ...props }: Props) => {
  const useUpsert = useBaseUpsertComponent(props, fields);
  const classes: Record<string, string> = styles();
  useEffect(() => {
    useUpsert.setViewMode(props?.viewMode || VIEW_MODE.NEW);
    useUpsert.setFormValues(props.federationMapping);
  }, []);

  const upsertIdpMapping = (): void => {
    const { upsertIdpMapping, federationMapping } = props
    const release = new FederationMappingModel({ ...federationMapping, ...useUpsert.form.values() });
    const request: IAPIFederationMappingRequest = {
      CustomerNumber: release.customerNumber,
      IdentityProvider: release.identityProvider,
      ClientId: release.clientId,
    }
    upsertIdpMapping(request);
  }

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls => {
    const { viewMode } = props;
    return {
      title: 'Federation',
      inputControls: [
        {
          fieldKey: 'customerNumber',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'identityProvider',
          type: EDITOR_TYPES.TEXT_FIELD,
          isDisabled: Utilities.isEqual(useUpsert.viewMode as VIEW_MODE, VIEW_MODE.EDIT),
        },
        {
          fieldKey: 'clientId',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  }

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <>
        {useUpsert.loader.spinner}
        <div className={classes.modalDetail}>
          {
            groupInputControls().inputControls
              .map((inputControl: IViewInputControl, index: number) =>
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  classes={{
                    flexRow: classNames({
                      [classes.inputControl]: true,
                    }),
                  }}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={useUpsert.isEditable}
                  onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
                />
              )
          }
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant='contained'
              color='primary'
              onClick={() => upsertIdpMapping()}
              disabled={useUpsert.form.hasError}
            >
              Save
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title={`${useUpsert.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} Federation Mapping`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.dialogWidth,
        header: classes.headerWrapper,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />

  );
};

export default inject('federationMappingStore')(observer(UpsertFederationMapping));