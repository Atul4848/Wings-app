import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { styles } from './Slide2.styles';
import { withStyles, Grid, Avatar, Box, Typography } from '@material-ui/core';
import { IClasses, UIStore } from '@wings-shared/core';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import { AlertStore } from '@uvgo-shared/alert';
import { useNavigate } from 'react-router';
import { SlidesApprovalStore, VendorLocationStore } from 'apps/vendor-management/src/Stores';
import { useGridState } from '@wings-shared/custom-ag-grid';
import { Slide2Model } from '../../../../Shared/Models/Slide2.model';
import CustomList from '../../../../Shared/Components/CustomList/CustomList';
import { Slide1Model } from 'apps/vendor-management/src/Modules/Shared';
interface Props {
  classes?: IClasses;
  registerSaveData: (saveData: () => void) => void;
  activeStep: number;
  setActiveStep: React.Dispatch<number>;
  vendorLocationStore: VendorLocationStore;
  slidesApprovalStore: SlidesApprovalStore;
}

const Slide2: FC<Props> = ({
  classes,
  registerSaveData,
  activeStep,
  setActiveStep,
  vendorLocationStore,
  slidesApprovalStore,
}) => {
  const unsubscribe = useUnsubscribe();
  const gridState = useGridState();
  const navigate = useNavigate();
  const [ operationTypeName, setOperationTypeName ] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [ activeStep ]);

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
      .subscribe((response: Slide1Model) => {
        if (response[0]) {
          setOperationTypeName(response[0]?.operationType?.name);
        }
        loadUploadedDocumentData();
      });
  };

  const loadUploadedDocumentData = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      UIStore.setPageLoader(true);
      gridState.setIsProcessing(true);

      slidesApprovalStore
        .getUploadedDocuments(slidesApprovalStore.tempLocationId)
        .pipe(
          takeUntil(unsubscribe.destroy$),
          finalize(() => {
            UIStore.setPageLoader(false);
            gridState.setIsProcessing(false);
          })
        )
        .subscribe({
          next: (response: any) => {
            const results = Slide2Model.deserializeList(response.results);
            gridState.setGridData(results);
          },
          error: err => {
            reject(err);
          },
        });
    });
  };

  const downloadFile = (data: Slide2Model) => {
    UIStore.setPageLoader(true);
    slidesApprovalStore
      ?.downloadDocumentFile(slidesApprovalStore.vendorId, data.documentUri)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => {
          UIStore.setPageLoader(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          const link = document.createElement('a');
          link.href = response.documentUri;
          link.target = '_blank';
          link.download = data.operationTypeDocument.documentName.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: error => {
          AlertStore.info(`Error Downloading ${error.message}`);
        },
      });
  };

  const colDefNew = [
    {
      headerName: 'Document Name',
      field: 'operationTypeDocument.documentName.name',
    },
    {
      headerName: 'Other Name',
      field: 'operationTypeDocument.otherName',
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
    },
    {
      headerName: 'Expiration Date',
      field: 'endDate',
    },
    {
      headerName: 'Status',
      field: 'documentStatus.name',
    },
    {
      headerName: 'Last Updated',
      field: 'lastUpdated',
    },
    {
      headerName: 'Document URI',
      field: 'documentUri',
    },
    {
      field: 'actionRenderer',
      headerName: '\u00A0\u00A0\u00A0\u00A0Edit\u00A0\u00A0\u00A0\u00A0\u00A0Delete',
    },
  ];

  return (
    <>
      {operationTypeName !== '' && (
        <Box component="section" className={classes.box}>
          <strong style={{ fontSize: '18px', fontWeight: 'bold' }}>Operation Type:</strong>
          <p style={{ fontSize: '14px', fontWeight: '400', paddingTop: ' 4px' }}>{operationTypeName}</p>
        </Box>
      )}
      {gridState.data.length > 0 && (
        <>
          <Typography className={classes.heading}>Uploaded Documents</Typography>
          <div style={{ paddingLeft: '6px' }}>
            <CustomList
              classes={classes}
              colDef={colDefNew}
              rowData={gridState.data}
              isHeaderVisible={false}
              onDownload={item => downloadFile(item)}
              isVendorLocationDocument={true}
              isLoading={UIStore.pageLoading}
            />
          </div>
        </>
      )}
    </>
  );
};

export default inject('vendorLocationStore', 'slidesApprovalStore')(withStyles(styles)(observer(Slide2)));
