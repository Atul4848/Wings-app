import { Button } from '@material-ui/core';
import React, { FC, ReactNode, useEffect } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { useStyles } from './RoleField.styles';
import { observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ServicesStore, RolesModel } from '../../../Shared';
import { fields } from './Fields';
import classNames from 'classnames';
import { FieldTypeModel } from '@wings/notifications/src/Modules';
import { IClasses, Utilities, baseEntitySearchFilters } from '@wings-shared/core';
import {
  EDITOR_TYPES,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl,
  SelectOption,
} from '@wings-shared/form-controls';
import { useParams } from 'react-router-dom';
import { Notification } from '@uvgo-shared/notifications';

type Props = {
  classes?: IClasses;
  title: string;
  roleField?: RolesModel;
  viewMode?: VIEW_MODE;
  rolesField?: RolesModel[];
  upsertRoleField: (roleField: RolesModel) => void;
  serviceStore?: ServicesStore;
};

const RoleField: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent<RolesModel>(params, fields, baseEntitySearchFilters);

  useEffect(() => {
    useUpsert.setFormValues(props.roleField);
  }, []);

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'RoleField',
      inputControls: [
        {
          fieldKey: 'enabled',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
        {
          fieldKey: 'type',
          type: EDITOR_TYPES.RADIO,
          selectControlOptions: [
            new SelectOption({ id: 1, name: 'Internal', value: 'internal' }),
            new SelectOption({ id: 2, name: 'External', value: 'external' }),
          ],
          containerClass: classes.typeContainer,
          isFullFlex: true,
        },
        {
          fieldKey: 'name',
          type: EDITOR_TYPES.TEXT_FIELD,
          isExists: isExists(),
        },
        {
          fieldKey: 'displayName',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'description',
          type: EDITOR_TYPES.TEXT_FIELD,
          isFullFlex: true,
        },
        {
          fieldKey: 'permissions',
          type: EDITOR_TYPES.FREE_SOLO_CHIP_INPUT,
          isFullFlex: true,
        }
      ],
    };
  }

  const isExists = (): boolean => {
    const name = useUpsert.getField('name').value;
    return props.rolesField?.some(
      t => Utilities.isEqual(t.name, name) && !Utilities.isEqual(t.name, props.roleField?.name)
    );
  };

  const dialogContent = (): ReactNode => {
    return (
      <div>
        <div className={classes.formatContainer}>
          {groupInputControls()
            .inputControls.filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => {
              return (
                <>
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    isExists={inputControl.isExists}
                    classes={{
                      flexRow: classNames({
                        [classes.inputControl]: true,
                        [classes.fullFlex]: inputControl.isFullFlex,
                        [classes.enabledContainer]: inputControl.fieldKey === 'enabled',
                      }),
                    }}
                    field={useUpsert.getField(inputControl.fieldKey || '')}
                    isEditable={true}
                    onValueChange={option => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
                  />
                </>
              );
            })}
          {props.viewMode === VIEW_MODE.EDIT && (
            <Notification
              type="warning"
              message="Note: Editing a role will update this role for all users who currently have it assigned."
            />
          )}
          <div className={classes.btnContainer}>
            <div className={classes.btnContainerCancel}>
              <Button color="primary" variant="contained" size="small" onClick={() => ModalStore.close()}>
                Cancel
              </Button>
            </div>
            <div className={classes.btnContainerSave}>
              <Button
                color="primary"
                variant="contained"
                size="small"
                disabled={useUpsert.form.hasError || isExists()}
                onClick={() => {
                  const { fieldType } = useUpsert.form.values();
                  const model = new RolesModel({
                    ...props.roleField,
                    ...useUpsert.form.values(),
                    fieldType: new FieldTypeModel(fieldType),
                  });
                  props.upsertRoleField(model);
                }}
              >
                {props.viewMode === VIEW_MODE.NEW ? 'Save' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      title={props.title}
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
}
export default (observer(RoleField));
