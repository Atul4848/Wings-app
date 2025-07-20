import { Tooltip } from '@material-ui/core';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { PrimaryButton } from '@uvgo-shared/buttons';
import React, { FC } from 'react';
import {
  FAAImportComparisonModel,
  FAA_COMPARISON_TYPE,
  FAA_MERGE_STATUS,
  useAirportModuleSecurity,
} from '../../../Shared';
import { Utilities, ViewPermission } from '@wings-shared/core';

interface Props {
  data: FAAImportComparisonModel;
  hasSelectedRows: boolean;
  onMergeRecords: () => void;
  onViewDetails: () => void;
  isFrequency: boolean;
}

const FAAActionButtons: FC<Props> = ({ data, hasSelectedRows, isFrequency, ...props }) => {
  const airportModuleSecurity = useAirportModuleSecurity();
  const disableViewButton = Utilities.isEqual(data.faaComparisonType, FAA_COMPARISON_TYPE.DELETED) && !isFrequency;
  return (
    <div>
      <ViewPermission hasPermission={airportModuleSecurity.isEditable}>
        <PrimaryButton
          variant="outlined"
          color="primary"
          onClick={props.onMergeRecords}
          disabled={Utilities.isEqual(data.faaMergeStatus, FAA_MERGE_STATUS.MERGED) || hasSelectedRows}
        >
          <Tooltip title="Merge">
            <CheckOutlinedIcon />
          </Tooltip>
        </PrimaryButton>
      </ViewPermission>
      <PrimaryButton
        variant="outlined"
        color="primary"
        onClick={props.onViewDetails}
        disabled={disableViewButton || hasSelectedRows}
      >
        <Tooltip title="View Details">
          <VisibilityIcon />
        </Tooltip>
      </PrimaryButton>
    </div>
  );
};
export default FAAActionButtons;
