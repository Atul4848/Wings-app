import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { Dialog } from '@uvgo-shared/dialog';
import {
  OPTION_FILTER,
  SETTING_TYPE,
  SyncSettingOptionsModel,
  SyncSettingsModel,
  SyncSettingsStore,
} from '../../../Shared';
import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { styles } from './UpsertSetting.styles';
import { Button, Box } from '@material-ui/core';
import { IClasses, IOptionValue, UIStore, regex, Loader } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { isValidCron } from 'cron-validator';
import cronstrue from 'cronstrue';

type Props = {
  syncSettings: SyncSettingsModel;
  classes?: IClasses;
  syncSettingsStore?: SyncSettingsStore;
  settingType: SETTING_TYPE;
  onUpdate: (syncSetting: SyncSettingsModel) => void;
};

const UpsertSetting: FC<Props> = ({ ...props }: Props) => {

  const [ options, setOptions ] = useState<SyncSettingOptionsModel[]>(props.syncSettings.options);
  const [ loader, setLoader ] = useState<Loader>(new Loader());
  const [ hasError, setHasError ] = useState<boolean[]>(new Array<boolean>(options.length));
  const [ errors, setErrors ] = useState<string[]>(new Array<string>(options.length));
  const classes: Record<string, string> = styles();

  /* istanbul ignore next */
  const onChange = (value: string, index: number, type: OPTION_FILTER) => {
    const newOptions = [ ...options ];
    newOptions[index] = { ...newOptions[index], value };

    const newHasError = [ ...hasError ];
    const newErrors = [ ...errors ];

    switch (type) {
      case OPTION_FILTER.INT:
        newHasError[index] = !regex.numberOnly.test(value);
        newErrors[index] = `You can only enter number(s) for ${newOptions[index].key}`;
        if (value.length >= 10) {
          newErrors[index] = `${newOptions[index].key} can be maximum 9 digits long`;
          newHasError[index] = true;
        }
        break;
      case OPTION_FILTER.STRING:
        newHasError[index] = !Boolean(value?.length);
        newErrors[index] = `${newOptions[index].key} is required`;
        break;
      case OPTION_FILTER.CRON:
        newHasError[index] = !isValidCron(value);
        newErrors[index] = 'It should contain a valid CRON expression';
        break;
      default:
        newHasError[index] = false;
        break;
    }

    setOptions(newOptions);
    setHasError(newHasError);
    setErrors(newErrors);
  }

  const dialogContent = (): ReactNode => {
    const renderOptions = options?.map((option, idx) => {
      const type: OPTION_FILTER = OPTION_FILTER[option.type];
      return (
        <div key={idx} className={classes.contentModal}>
          <Box width="50%">
            <ViewInputControl
              type={EDITOR_TYPES.TEXT_FIELD}
              classes={{ textInput: classes.nameInput }}
              field={{ value: option?.displayName, label: '' }}
              isEditable={false}
            />
          </Box>

          <Box width="50%">
            <ViewInputControl
              type={type === OPTION_FILTER.BOOL ? EDITOR_TYPES.CHECKBOX : EDITOR_TYPES.TEXT_FIELD}
              isEditable={true}
              classes={{ textInput: classes.nameInput }}
              field={{ value: option?.value, label: '', showErrors: () => null, bind: () => null }}
              onValueChange={(value: IOptionValue) => onChange(value as string, idx, type)}
              customErrorMessage={hasError[idx] ? errors[idx] : ''} />

            {type === OPTION_FILTER.CRON && !hasError[idx] &&
                <div className={classes.cronDescription}>
                  {cronstrue.toString(option?.value as string, { verbose: true })}
                </div>}
          </Box>
        </div>
      );
    });

    return (
      <>
        {loader.spinner}
        <div className={classes.contentModal}>
          <div className={classes.contentLabel}>Display Name</div>
          <div className={classes.contentLabel}>Value</div>
        </div>
        {renderOptions}
        <div className={classes.btnSection}>
          <Button
            color="primary"
            variant="contained"
            size="small"
            className={classes.btnValue}
            onClick={() => {
              props.syncSettings.options = options;
              props.onUpdate(props.syncSettings);
            }}
            disabled={hasError.some(x => x) || UIStore.pageLoading}
          >
            Update
          </Button>
        </div>
      </>
    );
  }

  return (
    <Dialog
      title={`Edit SyncSettings: ${props.syncSettings?.name}`}
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.userMappedWidth,
        header: classes.headerWrapper,
        content: classes.content,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={dialogContent}
    />
  );
}

export default inject('syncSettingsStore')(observer(UpsertSetting));
