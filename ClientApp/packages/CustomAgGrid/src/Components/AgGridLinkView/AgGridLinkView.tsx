import React, { Component, RefObject } from 'react';
import { withStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { ICellRendererParams, ICellRendererComp } from 'ag-grid-community';
import { styles } from './AgGridLinkView.styles';
import { observable } from 'mobx';
import { IClasses } from '@wings-shared/core';
interface Props extends Partial<ICellRendererParams> {
  classes: IClasses;
}

@observer
class AgGridLinkView extends Component<Props> implements ICellRendererComp {
  private viewRendererRef: RefObject<HTMLInputElement> = React.createRef();
  @observable link: string;

  constructor(props) {
    super(props);
    this.link = typeof props.formatValue === 'function' ? props.formatValue(props.value) : props.value;
  }

  public refresh(): boolean {
    return true;
  }

  public getGui(): HTMLElement {
    return this.viewRendererRef.current;
  }

  render() {
    const { classes } = this.props;
    return (
      <a className={classes.link} href={this.link} target="_blank">
        {this.link}
      </a>
    );
  }
}

export default withStyles(styles)(AgGridLinkView);
