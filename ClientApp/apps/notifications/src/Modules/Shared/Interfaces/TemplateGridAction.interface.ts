import { GRID_ACTIONS } from '@wings-shared/core';

export interface ITemplateGridAction{
    tooltip?: string;
    getDisabledState?: () => void;
    onAction?: (action: GRID_ACTIONS, rowIndex: number) => void;
}