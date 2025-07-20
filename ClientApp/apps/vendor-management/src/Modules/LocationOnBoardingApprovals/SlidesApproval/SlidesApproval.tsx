import { IAPIGridRequest, IClasses, UIStore } from '@wings-shared/core';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Box, Typography, withStyles, IconButton, Step, Button, StepIconProps, Stepper } from '@material-ui/core';
import { Dialog } from '@uvgo-shared/dialog';
import { useUnsubscribe } from '@wings-shared/hooks';

import { styles } from './SlidesApproval.styles';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { ChevronRightIcon } from '@uvgo-shared/icons';
import { DetailsEditorWrapper } from '@wings-shared/layout';
import CustomTooltip from '../../Shared/Components/Tooltip/CustomTooltip';
import { SlidesApprovalStore, BaseStore } from '../../../Stores';
import { CancelRounded, Check, PriorityHigh } from '@material-ui/icons';
import Slide1 from './Components/Slide1/Slide1';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { Slide1Model } from '../../Shared';
import Slide3 from './Components/Slide3/Slide3';
import Slide2 from './Components/Slide2/Slide2';
import Slide4 from './Components/Slide4/Slide4';
import { Slide5Model } from '../../Shared/Models/Slide5.model';
import Slide5 from './Components/Slide5/Slide5';
import Slide6 from './Components/Slide6/Slide6';

interface Props {
  loadApprovalData: (pageRequest?: IAPIGridRequest) => void;
  classes?: IClasses;
  loadPPRNotesData: (pageRequest?: IAPIGridRequest) => void;
  setOpen: React.Dispatch<boolean>;
  slidesApprovalStore: SlidesApprovalStore;
}

const SlidesApproval: FC<Props> = ({ classes, setOpen, slidesApprovalStore, loadApprovalData }) => {
  const [ activeStep, setActiveStep ] = React.useState(slidesApprovalStore.activeStep);
  const [ onBoardingSlides, setOnBoardingSlides ] = React.useState([]);
  const [ approvedSlides, setApprovedSlides ] = React.useState([]);
  const [ rejectedSlides, setRejectedSlides ] = React.useState([]);
  const [ tobeRejectedSlides, setTobeRejectedSlides ] = React.useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ visible, setVisible ] = useState(true);
  const unsubscribe = useUnsubscribe();

  const CustomStepIcon = (props: StepIconProps & { slide: number; onBoardingSlides: number[] }) => {
    const { active, slide, onBoardingSlides } = props;

    const isSlideCompleted = approvedSlides.includes(slide);

    const isSlideRejected = rejectedSlides.includes(slide);

    const getBackgroundColor = () => {
      if (isSlideCompleted) {
        return 'rgba(101, 166, 27, 1)';
      } else if (isSlideRejected) {
        return '#D81B60';
      } else if (active) {
        return '#1976D2';
      } else {
        return 'rgba(95, 95, 95, 0.15)';
      }
    };

    const getColor = () => {
      if (isSlideCompleted || active) {
        return 'white';
      } else {
        return 'rgba(95, 95, 95, 0.15)';
      }
    };

    return (
      <div
        style={{
          backgroundColor: getBackgroundColor(),
          color: getColor(),
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
        }}
      >
        {isSlideCompleted ? (
          <Check style={{ color: 'white' }} />
        ) : isSlideRejected ? (
          <PriorityHigh style={{ color: 'white', width: '24px', height: '24px' }} />
        ) : (
          slide
        )}
      </div>
    );
  };

  const steps = [
    {
      slide: 1,
      component: <Slide1 activeStep={slidesApprovalStore.activeStep} setActiveStep={setActiveStep} />,
    },
    {
      slide: 2,
      component: <Slide2 activeStep={slidesApprovalStore.activeStep} setActiveStep={setActiveStep} />,
    },
    {
      slide: 3,
      component: <Slide3 activeStep={slidesApprovalStore.activeStep} setActiveStep={setActiveStep} />,
    },
    {
      slide: 4,
      component: <Slide4 activeStep={slidesApprovalStore.activeStep} setActiveStep={setActiveStep} />,
    },
    {
      slide: 5,
      component: <Slide5 activeStep={slidesApprovalStore.activeStep} setActiveStep={setActiveStep} />,
    },
    {
      slide: 6,
      component: <Slide6 activeStep={slidesApprovalStore.activeStep} setActiveStep={setActiveStep} />,
    },
  ];

  const handleCommentTextbox = event => {
    const newText = event.target.value;
    slidesApprovalStore.rejectionComment = newText;
    const textLength = newText.length;
    slidesApprovalStore.userCommentTextField = textLength >= 6 ? false : true;
  };

  const rejectionContent = () => {
    return (
      <>
        <Typography style={{ fontSize: '12px', fontWeight: '600' }}>
          Comment to vendor regarding why this data was rejected
        </Typography>
        <textarea
          id="rejectionComment"
          name="rejectionComment"
          maxRows={2}
          aria-label="maximum height"
          placeholder="Enter here"
          className="userCommentArea"
          onChange={handleCommentTextbox}
          style={{
            width: '100%',
            minHeight: '40px',
            borderRadius: '5px',
            padding: '5px',
            resize: 'none',
            marginTop: '4px',
          }}
        ></textarea>
      </>
    );
  };

  const ConfirmationModel = (): void => {
    ModalStore.open(
      <>
        {(slidesApprovalStore.userCommentTextField = true)}
        <Dialog
          title={'Reason for rejection'}
          open={true}
          onClose={() => {
            ModalStore.close();
          }}
          classes={{ title: classes.dialogTitle }}
          dialogContent={() => rejectionContent()}
          closeBtn={false}
          dialogActions={() => dialogAction()}
          disableBackdropClick={true}
        />
      </>
    );
  };

  const dialogAction = () => {
    return (
      <>
        <div style={{ gap: '10px', display: 'flex', textTransform: 'none' }}>
          <div className={`${classes.button}`}>
            <PrimaryButton color="primary" variant="text" onClick={() => ModalStore.close()} size="large">
              Cancel
            </PrimaryButton>
          </div>
          <PrimaryButton
            variant="contained"
            color="primary"
            style={{ width: '100px', height: '40px' }}
            disabled={slidesApprovalStore.userCommentTextField}
            onClick={() => {
              if (slidesApprovalStore.activeStep === 0) {
                rejectionSLidesData(1);
              } else if (slidesApprovalStore.activeStep === 1) {
                tobeRejectedSlides.includes(2) ? rejectionSLidesData(2) : <></>;
                tobeRejectedSlides.includes(3) ? rejectionSLidesData(3) : <></>;
              } else if (slidesApprovalStore.activeStep === 2) {
                tobeRejectedSlides.includes(4) ? rejectionSLidesData(4) : <></>;
                tobeRejectedSlides.includes(5) ? rejectionSLidesData(5) : <></>;
                tobeRejectedSlides.includes(6) ? rejectionSLidesData(6) : <></>;
              } else if (slidesApprovalStore.activeStep === 3) {
                tobeRejectedSlides.includes(7) ? rejectionSLidesData(7) : <></>;
              } else if (slidesApprovalStore.activeStep === 4) {
                tobeRejectedSlides.includes(8) ? rejectionSLidesData(8) : <></>;
              } else if (slidesApprovalStore.activeStep === 5) {
                tobeRejectedSlides.includes(9) ? rejectionSLidesData(9) : <></>;
              }
              ModalStore.close();
            }}
          >
            Confirm
          </PrimaryButton>
        </div>
      </>
    );
  };

  useEffect(() => {
    if (slidesApprovalStore.tempLocationId) {
      vendorOnBoardingTracking();
      setVisible(true);
    }
  }, [ slidesApprovalStore.tempLocationId ]);

  const headerActions = (): ReactNode => {
    return (
      <Box className={classes.subHeader}>
        <IconButton
          aria-label="Close"
          style={{ width: '30px', padding: '0px', justifyContent: 'start' }}
          onClick={() => setOpen(false)}
        >
          <ChevronRightIcon size="large" />
        </IconButton>
        <div className={classes.header}>
          <Typography className={classes.headerTitle}>
            <CustomTooltip title="New Location Onboarding Answers" />
          </Typography>
          <Typography className={classes.headerNumbers}>
            {slidesApprovalStore.activeStep + 1}/{steps.length}
          </Typography>
        </div>
      </Box>
    );
  };

  const vendorOnBoardingTracking = () => {
    UIStore.setPageLoader(true);
    slidesApprovalStore
      .getByVendorOnboardTracking(slidesApprovalStore.tempLocationId)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe(response => {
        const approvedList = [];
        const rejectedList = [];
        const pendingList = [];
        const tobeRej = [];
        response?.forEach(element => {
          const match = element.slideNo.match(/\d+/);
          const slideNumber = match ? parseInt(match[0], 10) : null;
          if (slideNumber === 1) {
            element.status === 'Approved'
              ? approvedList.push(1)
              : element.status === 'Rejected'
                ? rejectedList.push(1)
                : (tobeRej.push(slideNumber), pendingList.push(1));
          } else if (slideNumber === 2 || slideNumber === 3) {
            element.status === 'Approved'
              ? approvedList.push(2)
              : element.status === 'Rejected'
                ? rejectedList.push(2)
                : (tobeRej.push(slideNumber), pendingList.push(2));
          } else if (slideNumber === 4 || slideNumber === 5 || slideNumber === 6) {
            element.status === 'Approved'
              ? approvedList.push(3)
              : element.status === 'Rejected'
                ? rejectedList.push(3)
                : (tobeRej.push(slideNumber), pendingList.push(3));
          } else if (slideNumber === 7 || slideNumber === 8 || slideNumber === 9) {
            element.status === 'Approved'
              ? approvedList.push(slideNumber - 3)
              : element.status === 'Rejected'
                ? rejectedList.push(slideNumber - 3)
                : (tobeRej.push(slideNumber), pendingList.push(slideNumber - 3));
          }
        });
        setApprovedSlides(approvedList);
        setRejectedSlides(rejectedList);
        pendingList.sort((a, b) => a - b);
        setOnBoardingSlides(pendingList);
        setTobeRejectedSlides(tobeRej);
        let firstIndex = pendingList.length > 0 ? pendingList[0] : 0;
        if (firstIndex === 0 && (approvedList.includes(5) || rejectedList.includes(5))) {
          firstIndex = 6;
        }
        slidesApprovalStore.activeStep = firstIndex - 1;
        setActiveStep(firstIndex - 1);
      });
  };

  const approvalSlideData = (slideNumber: number) => {
    UIStore.setPageLoader(true);
    const params = {
      userId: '',
      vendorId: slidesApprovalStore.vendorId,
      tempLocationId: slidesApprovalStore.tempLocationId,
    };
    slidesApprovalStore
      .approveSlide(params, slideNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: (response: Slide1Model) => {
          if (slideNumber === 2) {
            tobeRejectedSlides.includes(3) ? approvalSlide2Data() : <></>;
          } else if (slideNumber === 4) {
            tobeRejectedSlides.includes(5) ? (
              approvalSlideData(5)
            ) : tobeRejectedSlides.includes(6) ? (
              approvalSlideData(6)
            ) : (
              <></>
            );
          } else if (slideNumber === 5) {
            tobeRejectedSlides.includes(6) ? approvalSlideData(6) : <></>;
          }
          vendorOnBoardingTracking();
          loadApprovalData();
        },
        error: error => {
          BaseStore.showAlert(error.message, 0);
        },
      });
  };

  const approvalSlide2Data = () => {
    UIStore.setPageLoader(true);
    const params = {
      userId: '',
      vendorId: slidesApprovalStore.vendorId,
      tempLocationId: slidesApprovalStore.tempLocationId,
    };
    slidesApprovalStore
      .approveSlide2(params)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: Slide1Model) => {
        vendorOnBoardingTracking();
        loadApprovalData();
      });
  };

  const approvalSlide9Data = () => {
    UIStore.setPageLoader(true);
    const params = {
      userId: '',
      vendorId: slidesApprovalStore.vendorId,
      tempLocationId: slidesApprovalStore.tempLocationId,
    };
    slidesApprovalStore
      .slideNineApproval(params)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: any) => {
        setOpen(false);
        vendorOnBoardingTracking();
        loadApprovalData();
      });
  };

  const rejectionSLidesData = (slideNumber: number) => {
    UIStore.setPageLoader(true);
    const params = {
      userId: '',
      vendorId: slidesApprovalStore.vendorId,
      tempLocationId: slidesApprovalStore.tempLocationId,
      remark: slidesApprovalStore.rejectionComment,
    };
    slidesApprovalStore
      .rejectSlides(params, slideNumber)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe((response: Slide1Model) => {
        slidesApprovalStore.rejectionComment = '';
        loadApprovalData();
        vendorOnBoardingTracking();
      });
  };

  return (
    <div className={classes.box}>
      <DetailsEditorWrapper
        headerActions={headerActions()}
        isEditMode={true}
        classes={{ headerActions: classes.headerActions, container: classes.container }}
      >
        <Box className={classes.innerBox1}></Box>
        <Box>
          {rejectedSlides.includes(steps[slidesApprovalStore.activeStep]?.slide) && visible && (
            <Box className={classes.rejectionBox}>
              <Box className={classes.rejectionMessage}>
                <CancelRounded style={{ fill: '#DB063B' }} />
                <Typography className={classes.rejectionText}>
                  Onboarding Slide {steps[slidesApprovalStore.activeStep]?.slide} Rejected
                </Typography>
              </Box>
              <Box className={`${classes.dismissButton}`}>
                <PrimaryButton variant="text" onClick={() => setVisible(false)}>
                  Dismiss
                </PrimaryButton>
              </Box>
            </Box>
          )}
        </Box>
        <Box className={classes.innerBox2}>{steps[slidesApprovalStore.activeStep]?.component}</Box>
        <div className={classes.buttonBox}>
          {activeStep === 5 && (approvedSlides.includes(6) || rejectedSlides.includes(6)) ? (
            <Box className={classes.innerBox3}>
              <Box className={`${classes.defaultButton}`}>
                <PrimaryButton variant="outlined" disabled={true}>
                  Reject
                </PrimaryButton>
              </Box>
            </Box>
          ) : (
            <Box className={classes.innerBox3}>
              <Box className={`${classes.rejectButton}`}>
                <PrimaryButton
                  variant="outlined"
                  onClick={() => {
                    return ConfirmationModel();
                  }}
                >
                  Reject
                </PrimaryButton>
              </Box>
            </Box>
          )}
          <Box className={classes.innerBox3}>
            <Box className={`${classes.defaultButton}`}>
              <PrimaryButton
                variant="contained"
                onClick={() => {
                  if (isLoading) return;
                  setIsLoading(true);

                  if (activeStep === 0) {
                    return tobeRejectedSlides.includes(1) ? approvalSlideData(1) : null;
                  } else if (activeStep === 1) {
                    if (tobeRejectedSlides.includes(2)) {
                      return approvalSlideData(2);
                    }
                    if (tobeRejectedSlides.includes(3)) {
                      return approvalSlide2Data();
                    }
                  } else if (activeStep === 2) {
                    if (tobeRejectedSlides.includes(4)) {
                      return approvalSlideData(4);
                    } else if (tobeRejectedSlides.includes(5) && !tobeRejectedSlides.includes(4)) {
                      return approvalSlideData(5);
                    } else if (
                      tobeRejectedSlides.includes(6) &&
                      !tobeRejectedSlides.includes(5) &&
                      !tobeRejectedSlides.includes(4)
                    ) {
                      return approvalSlideData(6);
                    }
                  } else if (activeStep === 3) {
                    return tobeRejectedSlides.includes(7) ? approvalSlideData(7) : null;
                  } else if (activeStep === 4) {
                    return tobeRejectedSlides.includes(8) ? approvalSlideData(8) : null;
                  } else if (activeStep === 5) {
                    return tobeRejectedSlides.includes(9) ? approvalSlide9Data() : null;
                  }
                  setIsLoading(false);
                }}
                disabled={activeStep === 5 && (approvedSlides.includes(6) || rejectedSlides.includes(6))}
              >
                Approve
              </PrimaryButton>
            </Box>
          </Box>
        </div>
      </DetailsEditorWrapper>
    </div>
  );
};

export default inject('slidesApprovalStore', 'settingsStore')(withStyles(styles)(observer(SlidesApproval)));
