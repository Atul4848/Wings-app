import React, { FC, useEffect } from 'react';
import { useUnsubscribe } from '@wings-shared/hooks';
import {
  IClasses,
  UIStore,
} from '@wings-shared/core';
import { Box, Checkbox, FormControlLabel, FormGroup, Radio, Typography, withStyles } from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { styles } from './Slide3.styles';
import { SlidesApprovalStore } from 'apps/vendor-management/src/Stores';
import { Slide3Model } from '../../../../Shared/Models/Slide3.model';
import { useBaseUpsertComponent } from '@wings/shared';
import { finalize, takeUntil } from 'rxjs/operators';

interface Props {
  classes?: IClasses;
  slidesApprovalStore: SlidesApprovalStore;
  activeStep: number;
  setActiveStep: React.Dispatch<number>;
  // onNextButtonDisable: (boolean) => void;
}

const Slide3: FC<Props> = ({
  classes,
  slidesApprovalStore,
  activeStep,
  setActiveStep,
  // onNextButtonDisable,
}) => {
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent<Slide3Model>({}, {});
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    UIStore.setPageLoader(true);
    const params = {
      vendorId: slidesApprovalStore.vendorId,
      locationUniqueCode: slidesApprovalStore.locationUniqueCode,
    };
    slidesApprovalStore
      .getSlide1Approval(params)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: Slide3Model) => {
        if (response[0]) {
          useUpsert.setFormValues(Slide3Model.deserialize(slidesApprovalStore.slide3Data));
        }
      });
  };

  return (
    <>
      <Box>
        <div className={classes.editorWrapperContainer}>
          <ul>
            {
              slidesApprovalStore?.slide3Data?.slide4Answer ? 
                <li>
                  <Typography variant="h6" component="h6">
                  If an employee is dispatched to supervise/handle aircraft operations, do you charge a fee for the
                  employee's travel expenses?
                  </Typography>
                  <FormControlLabel
                    control={
                      <Radio checked={true} disabled />
                    }
                    label={slidesApprovalStore?.slide3Data?.slide4Answer === 'Yes' ? 'Yes' : 
                    slidesApprovalStore?.slide3Data?.slide4Answer === 'Not Applicable' ? 'Not Applicable' : 'No'}
                  />
                </li> : ''
            }
            {
              slidesApprovalStore?.slide3Data?.slide5Answer ? 
                <li>
                  <Typography variant="h6" component="h6">
                  Can your company Provide Permit Services for any of the following?
                  </Typography>
                  <FormGroup>
                    {slidesApprovalStore?.slide3Data?.slide5Answer.includes(',') ? (
                    slidesApprovalStore?.slide3Data?.slide5Answer.split(',').map((item, index) => {
                      return (
                        <FormControlLabel
                          key={index}
                          control={<Checkbox checked={item ? true : false} />}
                          label={item.trim()}
                          className='onboardingCheckbox'
                          disabled
                        />
                      );
                    })
                    ) : (
                      <FormControlLabel
                        control={<Checkbox checked={slidesApprovalStore?.slide3Data?.slide5Answer ? true : false} />}
                        label={slidesApprovalStore?.slide3Data?.slide5Answer.trim()}
                        className='onboardingCheckbox'
                        disabled
                      />
                    )}
                  </FormGroup>
                </li> : ''
            }
            {
              slidesApprovalStore?.slide3Data?.slide6Answer ?
                <li>
                  <Typography variant="h6" component="h6">
                  Can you extend credit (Direct Bill/Invoice) for any of the following services?
                  </Typography>
                  <FormGroup>
                    {slidesApprovalStore?.slide3Data?.slide6Answer.includes(',') ? (
                    slidesApprovalStore?.slide3Data?.slide6Answer.split(',').map((item, index) => {
                      return (
                        <FormControlLabel
                          key={index}
                          control={<Checkbox checked={item ? true : false} />}
                          label={item.trim()}
                          className='onboardingCheckbox'
                          disabled
                        />
                      );
                    })
                    ) : (
                      <FormControlLabel
                        control={<Checkbox checked={slidesApprovalStore?.slide3Data?.slide6Answer ? true : false} />}
                        label={slidesApprovalStore?.slide3Data?.slide6Answer.trim()}
                        className='onboardingCheckbox'
                        disabled
                      />
                    )}
                  </FormGroup>
                </li> : ''
            }
          </ul>
        </div>
      </Box>
    </>
  );
};

export default inject('slidesApprovalStore', 'vendorManagementStore')(withStyles(styles)(observer(Slide3)));
