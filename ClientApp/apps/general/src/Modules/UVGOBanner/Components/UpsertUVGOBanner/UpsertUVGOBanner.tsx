import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { VIEW_MODE, useBaseUpsertComponent } from '@wings/shared';
import { EDITOR_TYPES, ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { UVGOBannerModel } from '../../../Shared/Models/UVGOBanner.model';
import { fields } from './Fields';
import { forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { UVGOBannerStore } from '../../../Shared/Stores/UVGOBanner.store';
import { styles } from './UpsertUVGOBanner.styles';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { IAPIUpsertUVGOBannerRequest, UVGOBannerServicesModel, UVGOBannerTypeModel } from '../../../Shared';
import moment from 'moment';
import { DATE_FORMAT, UIStore, Utilities } from '@wings-shared/core';
import { useUnsubscribe } from '@wings-shared/hooks';
import { useParams } from 'react-router-dom';
import { AuthStore } from '@wings-shared/security';

interface Props {
  viewMode?: VIEW_MODE;
  uvgoBannerStore?: UVGOBannerStore;
  upsertUVGOBanner: (request: IAPIUpsertUVGOBannerRequest) => void;
  uvgoBanner?: UVGOBannerModel
}

const UpsertUVGOBanner: FC<Props> = ({ ...props }: Props) => {
  const unsubscribe = useUnsubscribe();
  const params = useParams();
  const useUpsert = useBaseUpsertComponent(params, fields);
  const classes: Record<string, string> = styles();
  const [ bannerTypeList, setBannerTypeList ] = useState<UVGOBannerTypeModel[]>([]);
  const [ bannerServiceList, setBannerServiceList ] = useState<UVGOBannerServicesModel[]>([]);

  useEffect(() => {
    InitialData();
  }, []);

  const hasAnyPermission = useMemo(() => AuthStore.permissions.hasAnyPermission([ 'write' ]), [
    AuthStore.permissions,
  ]);

  /* istanbul ignore next */
  const InitialData = () => {
    const { uvgoBanner, uvgoBannerStore } = props as Required<Props>;
    UIStore.setPageLoader(true);
    forkJoin([ uvgoBannerStore.uvgoBannerType(), uvgoBannerStore.uvgoBannerServices() ])
      .pipe(
        takeUntil(unsubscribe.destroy$),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe(([ bannerTypes, bannerServices ]) => {
        setBannerTypeList(bannerTypes);
        setBannerServiceList(bannerServices);
        const bannerType = bannerTypes.find(x => x.id === uvgoBanner?.bannerType?.id);
        const bannerService = bannerServices.find(x => x.id === uvgoBanner?.bannerService?.id);
        const model: UVGOBannerModel = new UVGOBannerModel({
          ...uvgoBanner,
          message: UVGOBannerModel.formatMessage(uvgoBanner?.message || ''),
          bannerType: bannerType || null,
          bannerService: bannerService || null,
        });
        useUpsert.setFormValues(model);
      });
  }

  const upsertUVGOBanner = (): void => {
    const { upsertUVGOBanner, uvgoBanner } = props;
    const uvgoBanners = new UVGOBannerModel({ ...uvgoBanner, ...useUpsert.form.values() });
    const {
      id,
      embeddedLink,
      message,
      requestedDate,
      requesterUserName,
      effectiveEndDate,
      bannerType,
      bannerService,
      effectiveStartDate,
    } = uvgoBanners;
    const request: IAPIUpsertUVGOBannerRequest = {
      ApplicationName: 'WingsUI',
      EffectiveEndDate: effectiveEndDate,
      EffectiveStartDate: effectiveStartDate,
      EmbeddedLink: embeddedLink,
      NotificationTypeId: bannerType.id,
      NotificationServiceId: bannerService.id,
      Message: `${message} ${embeddedLink}`,
      RequestedDate: requestedDate,
      RequesterUserName: requesterUserName,
    };
    upsertUVGOBanner(id ? { ...request, Id: id, ApplicationName: 'WingsUI' } : request);
  }

  /* istanbul ignore next */
  const groupInputControls = (): IGroupInputControls => {
    return {
      title: 'UVGOBanner',
      inputControls: [
        {
          fieldKey: 'effectiveStartDate',
          type: EDITOR_TYPES.DATE_TIME,
          dateTimeFormat: DATE_FORMAT.DATE_TIME_FORMAT,
          minDate: moment().format(DATE_FORMAT.GRID_DISPLAY),
          customErrorMessage: startDateCustomErrorMessage(),
          allowKeyboardInput: false,
        },
        {
          fieldKey: 'effectiveEndDate',
          type: EDITOR_TYPES.DATE_TIME,
          allowKeyboardInput: false,
          dateTimeFormat: DATE_FORMAT.DATE_TIME_FORMAT,
          customErrorMessage: endDateCustomErrorMessage(),
          minDate: moment(useUpsert.getField('effectiveStartDate')?.value).format(DATE_FORMAT.GRID_DISPLAY),
        },
        {
          fieldKey: 'bannerType',
          type: EDITOR_TYPES.DROPDOWN,
          options: bannerTypeList,
        },
        {
          fieldKey: 'bannerService',
          type: EDITOR_TYPES.DROPDOWN,
          options: bannerServiceList,
        },
        {
          fieldKey: 'message',
          type: EDITOR_TYPES.TEXT_FIELD,
          rows: 10,
          multiline: true,
        },
        {
          fieldKey: 'embeddedLink',
          type: EDITOR_TYPES.TEXT_FIELD,
        },
      ],
    };
  }

  /* istanbul ignore next */
  const startDateCustomErrorMessage = (): string => {
    const effectiveStartDate = useUpsert.getField('effectiveStartDate')?.value;
    const startDate = Utilities.getformattedDate(effectiveStartDate, DATE_FORMAT.API_DATE_FORMAT);
    const startTime = Utilities.getformattedDate(effectiveStartDate, DATE_FORMAT.API_TIME_FORMAT);
    const currentDate = moment().utc().format(DATE_FORMAT.API_DATE_FORMAT);
    const currentTime = moment().utc().format(DATE_FORMAT.API_TIME_FORMAT);
    if (effectiveStartDate && Utilities.isSameDate(startDate, currentDate)) {
      return Utilities.compareDateTime(currentTime, startTime, DATE_FORMAT.API_TIME_FORMAT)
        ? ''
        : 'Start Time must be greater than utc time';
    }
    return '';
  }

  /* istanbul ignore next */
  const endDateCustomErrorMessage = (): string => {
    const effectiveStartDate = useUpsert.getField('effectiveStartDate')?.value;
    const effectiveEndDate = useUpsert.getField('effectiveEndDate')?.value;
    const startDate = Utilities.getformattedDate(effectiveStartDate, DATE_FORMAT.API_DATE_FORMAT);
    const startTime = Utilities.getformattedDate(effectiveStartDate, DATE_FORMAT.API_TIME_FORMAT);
    const endDate = Utilities.getformattedDate(effectiveEndDate, DATE_FORMAT.API_DATE_FORMAT);
    const endTime = Utilities.getformattedDate(effectiveEndDate, DATE_FORMAT.API_TIME_FORMAT);
    if (moment(endDate, DATE_FORMAT.API_DATE_FORMAT).isBefore(moment(startDate, DATE_FORMAT.API_DATE_FORMAT))) {
      return 'End Date must be greater than start Date';
    }
    if (Utilities.isSameDate(startDate, endDate)) {
      return Utilities.compareDateTime(startTime, endTime, DATE_FORMAT.API_TIME_FORMAT)
        ? ''
        : 'End time must be greater than start time';
    }
    return '';
  }

  const hasError = (): boolean => {
    return (
      useUpsert.form.hasError ||
      UIStore.pageLoading ||
      Boolean(startDateCustomErrorMessage() || endDateCustomErrorMessage())
    );
  }

  /* istanbul ignore next */
  const dialogContent = (): ReactNode => {
    return (
      <>
        <div className={classes.modalDetail}>
          <div className={classes.flexRow}>
            <div className={classes.flexWrap}>
              {groupInputControls().inputControls.map((inputControl: IViewInputControl, index: number) => (
                <ViewInputControl
                  {...inputControl}
                  key={index}
                  classes={{
                    flexRow: classNames({
                      [classes.halfFlex]:
                        inputControl.fieldKey !== 'message' && inputControl.fieldKey !== 'embeddedLink',
                      [classes.fullFlex]:
                        inputControl.fieldKey === 'message' || inputControl.fieldKey === 'embeddedLink',
                    }),
                  }}
                  field={useUpsert.getField(inputControl.fieldKey || '')}
                  isEditable={hasAnyPermission}
                  onValueChange={(option, fieldKey) => useUpsert.onValueChange(option, inputControl.fieldKey || '')}
                />
              ))}
            </div>
          </div>
          <p>
            <b>Note: Date/Time entries must be in UTC.</b>
          </p>
          <div className={classes.btnContainer}>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={() => upsertUVGOBanner()}
              disabled={!hasAnyPermission || hasError()}
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
      title={`${props.viewMode === VIEW_MODE.NEW ? 'Add' : 'Edit'} uvGO Banner`}
      open={true}
      classes={{
        dialogWrapper: classes?.modalRoot,
      }}
      onClose={() => ModalStore.close()}
      dialogContent={() => dialogContent()}
    />
  );
}

export default inject('uvgoBannerStore')(observer(UpsertUVGOBanner));
