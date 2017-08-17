/*
*   Required Props:
*   message: string
*
*   Optional Props:
*   secondActionShow: boolean 
*   secondAction: function 
*   secondActionLabel: String 
*
*/

import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class WarningWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleOpen = () => {
    this.setState({ open: true, });
  };

  handleClose = () => {
    this.setState({ open: false, });
  };

  render() {
  // show a second action button when prop enabled
    const showActions = this.props.secondActionShow || false;
    const actions = [
      showActions === true
        ? <div>
          <FlatButton
            role="button"
            tabIndex={0}
            onClick={this.props.secondAction}
            label={this.props.secondActionLabel || 'placeholder'}
          />
          <FlatButton
            label="Discard"
            primary
            onTouchTap={this.handleClose}
          />
        </div>
        : <FlatButton
          label="Discard"
          primary
          onTouchTap={this.handleClose}
        />,
    ];

    return (
      <div>
        <Dialog
          actions={actions}
          modal
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          {this.props.message}
        </Dialog>
      </div>
    );
  }
}
