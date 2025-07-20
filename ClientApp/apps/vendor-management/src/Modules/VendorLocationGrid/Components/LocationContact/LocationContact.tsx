import { IClasses, UIStore } from '@wings-shared/core';
import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import { styles } from './LocationContact.style';
import { VIEW_MODE } from '@wings/shared';
import { VendorLocationModel } from '../../../Shared';
import { ConfirmNavigate, DetailsEditorHeaderSection, DetailsEditorWrapper } from '@wings-shared/layout';
import LocationContactGrid from './LocationContactGrid/LocationContactGrid';
import ServiceCommunicationGrid from './ServiceCommunicationGrid/ServiceCommunicationGrid';
import { VendorLocationStore } from '../../../../Stores/VendorLocation.store';
import { finalize, takeUntil } from 'rxjs/operators';
import { useUnsubscribe } from '@wings-shared/hooks';
import CustomTooltip from '../../../Shared/Components/Tooltip/CustomTooltip';

interface Props {
  classes?: IClasses;
  vendorLocationStore?: VendorLocationStore;
}

const VendorAssociate: FC<Props> = ({ classes, vendorLocationStore }) => {
  const [ isNewLocationContactAdded, setIsNewLocationContactAdded ] = useState(false);
  const [ locationGridDisabled, setLocationGridDisabled ] = useState(false);
  const [ serviceCommGridDisabled, setServiceCommGridDisabled ] = useState(false);
  const params = useParams();
  const unsubscribe = useUnsubscribe();
  const [ selectedVendorLocation, setSelectedVendorLocation ] = useState(new VendorLocationModel());

  useEffect(() => {
    if (params.id) {
      loadInitialData();
    }
  }, []);

  const loadInitialData = () => {
    const id = params.id;
    UIStore.setPageLoader(true);
    vendorLocationStore
      ?.getVendorLocationById(id)
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: VendorLocationModel) => {
        setSelectedVendorLocation(response);
      });
  };
  const headerActions = (): ReactNode => {
    return (
      <DetailsEditorHeaderSection
        title={<CustomTooltip title={selectedVendorLocation.label} />}
        backNavTitle="Vendor Location"
        hideActionButtons={false}
        backNavLink={
          params.operationCode === 'upsert'
            ? '/vendor-management/vendor-location'
            : `/vendor-management/upsert/${params.vendorId}/${params.operationCode}/edit/vendor-location`
        }
        hasEditPermission={false}
        showStatusButton={false}
        isActive={true}
      />
    );
  };

  return (
    <ConfirmNavigate isBlocker={locationGridDisabled || serviceCommGridDisabled}>
      <DetailsEditorWrapper headerActions={headerActions()} classes={{ headerActions: classes.headerActions }}>
        <div className={classes.editorWrapperContainer}>
          <LocationContactGrid
            setIsNewLocationContactAdded={setIsNewLocationContactAdded}
            setLocationGridDisabled={setLocationGridDisabled}
            serviceCommGridDisabled={serviceCommGridDisabled}
          />
          <ServiceCommunicationGrid
            isNewLocationContactAdded={isNewLocationContactAdded}
            setIsNewLocationContactAdded={setIsNewLocationContactAdded}
            setServiceCommGridDisabled={setServiceCommGridDisabled}
            locationGridDisabled={locationGridDisabled}
          />
        </div>
      </DetailsEditorWrapper>
    </ConfirmNavigate>
  );
};

export default inject('vendorLocationStore')(withStyles(styles)(observer(VendorAssociate)));
