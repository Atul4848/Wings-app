import React, { useEffect } from 'react';
import { finalize, takeUntil } from 'rxjs/operators';

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { CloseIcon, EditIcon } from '@uvgo-shared/icons';

import { useUnsubscribe } from '@wings-shared/hooks';
import { IAPIGridRequest, IOptionValue, UIStore, Utilities } from '@wings-shared/core';

import { inject, observer } from 'mobx-react';

import { useStyles } from './ChangeLocationDialog.styles';
import { RankAtAirportModel } from '../../../Shared/Models/RankAtAirport.model';
import { BaseStore, SettingsStore, VendorLocationStore } from '../../../../Stores';
import { EDITOR_TYPES, IGroupInputControls } from '@wings-shared/form-controls';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { fields } from './Fields';
import ViewInputControls from '../../../Shared/Components/ViewInputControls/ViewInputControls';

interface IProps {
  onClose: () => void;
  settingsStore?: SettingsStore;
  vendorLocationStore?: VendorLocationStore;
}

const ChangeLocationDialog: React.FC<IProps> = ({ onClose, vendorLocationStore }) => {
  const classes = useStyles();
  const unsubscribe = useUnsubscribe();
  const useUpsert = useBaseUpsertComponent({ viewMode: VIEW_MODE.NEW }, fields, null);

  const searchCollection = (propertyValue: string | number) => {
    const filters = [ 'ICAOCode', 'UWACode', 'FAACode', 'IATACode' ].map((x, idx) =>
      Utilities.getFilter(`AirportReference.${x}`, propertyValue, idx > 0 ? 'or' : null)
    );
    return {
      searchCollection: JSON.stringify(filters),
    };
  };

  const handleEdit = () => {
    vendorLocationStore?.setIsEditRank(!vendorLocationStore?.isEditRank);
  };

  const loadInitialData = (request?: IAPIGridRequest) => {
    UIStore.setPageLoader(true);

    vendorLocationStore
      .getVMSRankingComparison(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe();
  };

  useEffect(() => {
    if (vendorLocationStore?.vendorLocationRankingList?.length > 0) {
      const locationRank = vendorLocationStore.vendorLocationRankingList
        .map(location => ({
          vendorLocationId: location.id,
          rankAtAirport: location.rankAtAirport,
        }))
        .sort((a, b) => a.rankAtAirport - b.rankAtAirport);

      vendorLocationStore?.setInitialListData(locationRank);
      const locationAirport = vendorLocationStore.vendorLocationRankingList[0];
      useUpsert.getField('isAirportDataManager').set(locationAirport.airportDataManagement);
      useUpsert.getField('isCountryDataManager').set(locationAirport.countryDataManagement);
      useUpsert.getField('isPermitDataManager').set(locationAirport.permitDataManagement);
    }
  }, [ vendorLocationStore?.vendorLocationRankingList, vendorLocationStore?.isEditRank ]);

  const handleEditRank = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const airportList = [ ...(vendorLocationStore?.initialListData || []) ];
    const value = event.target.value ? Number(event.target.value) : '';
    if (value !== '' && value < 0) {
      return;
    }
    airportList[index] = {
      ...airportList[index],
      rankAtAirport: value,
    };
    vendorLocationStore?.setInitialListData(airportList);
  };

  const validateRank = () => {
    const uniqueRanks = vendorLocationStore?.initialListData.filter(
      (item, index, arr) =>
        index === arr.findIndex(other => other.rankAtAirport === item.rankAtAirport && item.rankAtAirport)
    );
    return uniqueRanks?.length !== vendorLocationStore?.initialListData?.length;
  };

  const handleUpdate = () => {
    if (validateRank()) {
      BaseStore.showAlert('Please enter valid rank data', 0);
      return;
    }

    const request: RankAtAirportModel = {
      userId: 'string',
      airportId: vendorLocationStore?.airportId || 0,
      isAirportDataManager: useUpsert.getField('isAirportDataManager').value,
      isCountryDataManager: useUpsert.getField('isCountryDataManager').value,
      isPermitDataManager: useUpsert.getField('isPermitDataManager').value,
      vendorLocationAndRankAtAirportMappings: vendorLocationStore?.initialListData,
    };
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.upsertRankAtAirport(request)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe({
        next: () => {
          onClose && onClose();
        },
        error: error => {
          BaseStore.showAlert(error.message, request.id);
        },
      });
  };

  const groupInputControls = (): IGroupInputControls[] => [
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'isCountryDataManager',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
        {
          fieldKey: 'isPermitDataManager',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
        {
          fieldKey: 'isAirportDataManager',
          type: EDITOR_TYPES.CHECKBOX,
          isFullFlex: true,
        },
      ],
    },
    {
      title: '',
      inputControls: [
        {
          fieldKey: 'airport',
          type: EDITOR_TYPES.DROPDOWN,
          isFullFlex: true,
          options: vendorLocationStore?.airportList,
        },
      ],
    },
  ];

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = debounce((searchValue: string, fieldKey: string) => {
    if (fieldKey === 'airport') {
      vendorLocationStore.searchAirport(searchValue);
    }
  }, 300);

  const onSearch = (searchValue: string, fieldKey: string): void => {
    if (!searchValue) {
      vendorLocationStore.getVmsIcaoCode().subscribe();
    } else {
      debouncedSearch(searchValue, fieldKey);
    }
  };

  const onValueChange = (value: IOptionValue, fieldKey: string): void => {
    if (fieldKey === 'airport') {
      const request: IAPIGridRequest = {
        pageNumber: 1,
        pageSize: 500,
        ...searchCollection(value?.displayCode || ''),
      };
      if (value?.displayCode) {
        loadInitialData(request);
        vendorLocationStore?.setAirportId(value.airportId);
      } else {
        vendorLocationStore?.setAirportId(null);
        vendorLocationStore.vendorLocationRankingList = [];
        vendorLocationStore.setIsEditRank(false);
        vendorLocationStore.getVmsIcaoCode().subscribe();
      }
    }
    useUpsert.getField(fieldKey).set(value);
    // gridState.hasError = Utilities.hasInvalidRowData(gridState.gridApi);
  };

  const sortedListWithLocationData = vendorLocationStore?.vendorLocationRankingList
    ?.slice()
    ?.sort((a, b) => a.rankAtAirport - b.rankAtAirport);

  return (
    <Dialog fullWidth={true} maxWidth="md" open={true} onClose={onClose}>
      <DialogTitle>
        <Box className={classes.dialogTitle}>
          <Typography variant="h6">Adjust Ranking</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">What is your designation for this Airport?</Typography>
        <Box className={classes.formWrapper}>
          <ViewInputControls
            isEditable={true}
            groupInputControls={groupInputControls()}
            onGetField={(fieldKey: string) => useUpsert.getField(fieldKey)}
            onValueChange={(option, fieldKey) => onValueChange(option, fieldKey)}
            field={fieldKey => useUpsert.getField(fieldKey)}
            onSearch={(searchValue: string, fieldKey: string) => onSearch(searchValue, fieldKey)}
          />
        </Box>
        {vendorLocationStore?.airportId ? (
          <Box className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableCell>Rank</TableCell>
                <TableCell>Location Name</TableCell>
                <TableCell>Location Code</TableCell>
                <TableCell>Airport</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Vendor Level</TableCell>
                <TableCell>Modified By</TableCell>
              </TableHead>
              <TableBody>
                {sortedListWithLocationData.map((row, i) => (
                  <TableRow>
                    <TableCell style={{ width: '100px' }}>
                      {!vendorLocationStore?.isEditRank ? (
                        row?.rankAtAirport
                      ) : (
                        <TextField
                          inputProps={{ min: 0 }}
                          type="number"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEditRank(e, i)}
                          value={vendorLocationStore?.initialListData?.[i]?.rankAtAirport}
                          style={{ minWidth: '70px', maxWidth: '100px' }}
                        />
                      )}
                    </TableCell>
                    <TableCell style={{ width: '200px' }}>{row?.name}</TableCell>
                    <TableCell style={{ width: '130px' }}>{row?.code}</TableCell>
                    <TableCell>{row?.airportReference?.airportName}</TableCell>
                    <TableCell>{row?.vendorLocationStatus?.value}</TableCell>
                    <TableCell style={{ width: '200px' }}>{row?.operationalEssential?.vendorLevel?.name}</TableCell>
                    <TableCell>{row?.modifiedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        {vendorLocationStore?.isEditRank ? (
          <PrimaryButton onClick={handleEdit} variant="outlined" color="primary">
            Cancel
          </PrimaryButton>
        ) : null}
        <PrimaryButton
          onClick={!vendorLocationStore?.isEditRank ? handleEdit : handleUpdate}
          variant="contained"
          color="primary"
          disabled={
            !vendorLocationStore?.isEditRank ? !vendorLocationStore?.vendorLocationRankingList?.length : validateRank()
          }
          startIcon={!vendorLocationStore?.isEditRank ? <EditIcon /> : null}
        >
          {!vendorLocationStore?.isEditRank ? 'Edit Rank' : 'Save'}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default inject('vendorLocationStore')(observer(ChangeLocationDialog));
