/*
*   Required Props:
*   dbReference: string,
*   labelText: string
*   state: string
*/

import React, {Component} from 'react'
import {base} from '../../config/constants'
import SimpleState from 'react-simple-state'
const simpleState = new SimpleState()


export default class counterlabel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    }
    
  }
  componentWillReceiveProps(props) {
    console.log(props)
    base.bindToState(props.dbReference, {
      context: this,
      state: 'count',
      asArray: true
    });
  }

  render() {
    var counter = this.state.count;
    simpleState.evoke(this.props.state, {
      count: counter
    });
    if (counter !== undefined) {
      counter = counter.length
    }
    
    return (
      <div>
        <h3>
          {this.props.labelText}
          <label>{counter}</label>
        </h3>
      </div>
    )
  }
}

