import React, { ReactNode, Component } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import TabPanel from '@material-ui/lab/TabPanel';
import { Dialog } from '@uvgo-shared/dialog';
import { ModalStore } from '@uvgo-shared/modal-keeper';
import { observable } from 'mobx';
import { styles } from './EditDialog.styles';
import { GRID_ACTIONS, IClasses } from '@wings-shared/core';
import { EditSaveButtons, TabsLayout } from '@wings-shared/layout';

interface Props {
  tabs: string[];
  title: string | ReactNode;
  hasErrors?: boolean;
  isEditable: boolean;
  isLoading?: boolean;
  classes?: IClasses;
  hasEditPermission: boolean;
  isRowEditing?: boolean;
  tabContent: (tabIndex: number) => ReactNode;
  onAction: (action: GRID_ACTIONS) => void;
  isDisable?: (tabIndex: number) => boolean;
  isSaveVisible?: (activeTab: string) => boolean;
  noTabs?: boolean;
}

@observer
class EditDialog extends Component<Props> {
  @observable private activeTab: string;

  constructor(p) {
    super(p);
    this.activeTab = p.tabs?.length ? p.tabs[0] : '';
  }

  private get isSaveVisible(): boolean {
    const { isSaveVisible } = this.props;
    return typeof isSaveVisible === 'function' ? isSaveVisible(this.activeTab) : false;
  }

  private get dialogContent(): ReactNode {
    const { classes, tabContent, tabs, isDisable } = this.props;

    if (this.props.noTabs) {
      return <div className={classes.noTabs}>{tabContent(0)}</div>;
    }

    return (
      <TabsLayout
        headingTitle=""
        tabs={tabs}
        activeTab={this.activeTab}
        onTabChange={(nextTab: string) => (this.activeTab = nextTab)}
        isDisable={isDisable}
      >
        {tabs.map((tab, index) => (
          <TabPanel key={index} className={classes.tabPanel} value={tabs[index]}>
            {tabContent(index)}
          </TabPanel>
        ))}
      </TabsLayout>
    );
  }

  public render() {
    const { classes, title, isLoading, hasEditPermission, hasErrors, isEditable, isRowEditing } = this.props;
    return (
      <Dialog
        title={title}
        open={true}
        isLoading={() => isLoading}
        classes={{
          paperSize: classes.modalWidth,
          header: classes.headerWrapper,
          content: classes.content,
        }}
        onClose={() => ModalStore.close()}
        dialogContent={() => this.dialogContent}
        dialogActions={() => (
          <EditSaveButtons
            isSaveVisible={this.isSaveVisible}
            hasEditPermission={hasEditPermission}
            onAction={action => this.props.onAction(action)}
            disabled={hasErrors || isLoading || isRowEditing}
            isEditing={isRowEditing}
            isEditMode={isEditable}
          />
        )}
      />
    );
  }
}
export default withStyles(styles)(EditDialog);
export { EditDialog as PureEditDialog };
