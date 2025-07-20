import React, { FC, ReactNode, useEffect } from 'react';
import { useBaseUpsertComponent, VIEW_MODE } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { FeatureNoteModel } from '../../../Shared';
import { fields } from './Fields';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { useStyles } from './FeatureNoteDialog.styles';
import { inject, observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import { DATE_FORMAT, IClasses, IOptionValue, ISelectOption, UIStore } from '@wings-shared/core';

type Props = {
  viewMode?: VIEW_MODE;
  classes?: IClasses;
  featureNotes?: FeatureNoteModel[];
  addFeatureNote: (featureNote: FeatureNoteModel) => void;
};

const FeatureNoteDialog: FC<Props> = ({ ...props }: Props) => {
  const classes = useStyles();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const navigate = useNavigate();

  useEffect(() => {
    useUpsert.setFormValues(new FeatureNoteModel());
  }, []);

  const loadCategories = (): ISelectOption[] => {
    const featureNotes = props.featureNotes as FeatureNoteModel[];
    return featureNotes
      ?.map(item => item.category?.value as string)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .map(item => ({ label: item, value: item }));
  }

  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'FeatureNote',
      inputControls: [
        {
          fieldKey: 'startDate',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
          allowKeyboardInput: false,
        },
        {
          fieldKey: 'title',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
        {
          fieldKey: 'category',
          type: EDITOR_TYPES.DROPDOWN,
          options: loadCategories(),
          freeSolo: true,
          isExists: Boolean(customErrorMessage()),
          customErrorMessage: customErrorMessage(),
        },
        {
          fieldKey: 'isInternal',
          type: EDITOR_TYPES.CHECKBOX,
        },
      ],
    };
  }

  const customErrorMessage = (): string => {
    if (!useUpsert.getField('category').value?.label?.trim() && useUpsert.getField('category').touched)
      return 'The Category field is required.';
    return useUpsert.getField('category').value?.label?.length > 100
      ? 'The Category field must be between 1 and 100.'
      : '';
  }

  const addFeatureNote = (): void => {
    const { addFeatureNote } = props;
    const featureNote = new FeatureNoteModel({ ...useUpsert.form.values() });
    addFeatureNote(featureNote);
  }

  const hasError = (): boolean => {
    return useUpsert.form.hasError || UIStore.pageLoading || Boolean(customErrorMessage());
  }

  const onValueChange = (value: IOptionValue | IOptionValue[], fieldKey: string): void => {
    useUpsert.getField(fieldKey).set(value);
  };

  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => (
            <ViewInputControl
              {...inputControl}
              key={index}
              classes={{
                flexRow: classes.fullFlex,
              }}
              field={useUpsert.getField(inputControl.fieldKey || '')}
              isEditable={true}
              onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
            />
          ))}
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => addFeatureNote()}
              disabled={hasError()}
            >
              Add
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title="Add Feature Note"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('featureNoteStore')(observer(FeatureNoteDialog));
