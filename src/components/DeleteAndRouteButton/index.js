/*
*   Required Props:
*   dbReference: string,
*   labelText: string,
*   route: string
*
*   Optional Props:
*   primary: boolean
*/

import React, { Component, } from 'react';
import { withRouter, } from 'react-router-dom';
import { base, } from '../../config/constants';
import RaisedButton from 'material-ui/RaisedButton';

class DeleteAndRouteButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      primary: this.props.primary || false,
    };
  }

  delete = () => {
    // remove reference from db and route to other page
    base
      .remove(this.props.dbReference)
      .then(() => {
        this.props.history.push(this.props.route);
        sessionStorage.clear();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <RaisedButton
        role="button"
        tabIndex={0}
        onClick={this.delete}
        label={this.props.labelText}
        primary={this.state.primary}
      />
    );
  }
}

export default withRouter(DeleteAndRouteButton);
