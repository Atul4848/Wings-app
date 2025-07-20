import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import TabPanel from '@material-ui/lab/TabPanel';
import { Field } from 'mobx-react-form';
import VaccineExemption from '../VaccineExemption/VaccineExemption';
import { observer } from 'mobx-react';
import { IOptionValue, Utilities } from '@wings-shared/core';
import {
  ChipViewInputControl,
  EDITOR_TYPES,
  ViewInputControl,
  IGroupInputControls,
  IViewInputControl,
} from '@wings-shared/form-controls';
import { TabsLayout } from '@wings-shared/layout';
import { useStyles } from './HealthAuthorizationViewInputControls.style';

type Props = {
  isEditable: boolean;
  getField: (fieldKey: string) => Field;
  onFocus?: (fieldKey: string) => void;
  onSearch?: (value: string, fieldKey: string) => void;
  groupInputControls: IGroupInputControls[];
  onValueChange: (option: IOptionValue, fieldKey: string) => void;
  tabs: string[];
  setActiveTab: (activeTab: string) => void;
  activeTab: string;
  customComponent?: (ViewInputControl?: IViewInputControl) => ReactNode;
  isTabDisable?: boolean;
};

const HealthAuthorizationViewInputControls: FC<Props> = ({
  isEditable,
  groupInputControls,
  tabs,
  activeTab,
  getField,
  onValueChange,
  setActiveTab,
  onFocus = (fieldKey: string) => null,
  onSearch = (value: string, fieldKey: string) => null,
  customComponent = () => null,
  ...props
}) => {
  const classes = useStyles();

  const getVaccineExemptionEntity = (fieldKey: string): string => {
    const [ prefix ] = fieldKey.split('.');
    if (Utilities.isEqual(fieldKey, 'domesticMeasure.isPassengerVaccineExemption') || prefix.includes('passenger')) {
      return 'Pax';
    }
    return 'Crew';
  };

  return (
    <div className={classes.flexRow}>
      <TabsLayout
        headingTitle=""
        tabs={tabs}
        activeTab={activeTab}
        isDisable={() => props.isTabDisable as Required<boolean>}
        onTabChange={(activeTab: string) => setActiveTab(activeTab)}
        classes={{ tabRoot: classes.tabRoot }}
      >
        {groupInputControls.map((groupInputControl, index) => (
          <TabPanel className={classes.tabPanel} key={index} value={tabs[index]}>
            <div className={classes.flexWrap}>
              {groupInputControl.inputControls
                .filter((inputControl: IViewInputControl) => !inputControl.isHidden)
                .map((inputControl: IViewInputControl, index: number) => {
                  if (Utilities.isEqual(inputControl.type || '', EDITOR_TYPES.CUSTOM_COMPONENT)) {
                    return <div className={classes.customComponentContainer}>{customComponent(inputControl)}</div>;
                  }
                  if (Utilities.isEqual(inputControl.type || '', EDITOR_TYPES.CHIP_INPUT)) {
                    return (
                      <ChipViewInputControl
                        key={index}
                        field={getField(inputControl.fieldKey || '')}
                        onChipAddOrRemove={option => getField(inputControl.fieldKey || '')?.set(option)}
                        isEditable={isEditable}
                        isLeftIndent={inputControl.isIndent}
                        isNumber={true}
                        customErrorMessage={inputControl.customErrorMessage}
                        isDisabled={inputControl.isDisabled}
                        classes={inputControl.classes}
                      />
                    );
                  }
                  if (Utilities.isEqual(inputControl.type || '', EDITOR_TYPES.LABEL)) {
                    return (
                      <VaccineExemption
                        key={inputControl.fieldKey}
                        entity={getVaccineExemptionEntity(inputControl.fieldKey || '')}
                        value={getField(inputControl.fieldKey as string)?.value}
                      />
                    );
                  }
                  return (
                    <ViewInputControl
                      {...inputControl}
                      key={index}
                      isEditable={isEditable}
                      classes={{
                        flexRow: classNames({
                          [classes.halfFlex]: inputControl.isHalfFlex,
                          [classes.fullFlex]: inputControl.isFullFlex,
                          [classes.leftIndent]: inputControl.isIndent,
                        }),
                      }}
                      onSearch={(value: string, fieldKey: string) => onSearch(value, fieldKey)}
                      field={getField(inputControl.fieldKey || '')}
                      onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                      onFocus={fieldKey => onFocus(fieldKey)}
                    />
                  );
                })}
            </div>
          </TabPanel>
        ))}
      </TabsLayout>
    </div>
  );
};

export default observer(HealthAuthorizationViewInputControls);
