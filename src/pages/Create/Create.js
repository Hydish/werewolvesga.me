import React, {Component} from 'react'
import Cards from '../../components/Cards/Cards'
import {post} from '../../helpers/dbcalls'
import {base} from '../../config/constants'
import RaisedButton from 'material-ui/RaisedButton'
import Deleteandroutebutton from '../../components/Deleteandroutebutton/Deleteandroutebutton'
import Counterlabel from '../../components/Counterlabel/Counterlabel'

class create extends Component {

  constructor(props) {
    super(props)
    this.state = {
      lobbyId: "",
      lobbyKey: "",
      loading: true
    };
  }
  componentDidMount() {
    var self = this;
    const userId = base
      .app()
      .INTERNAL
      .getUid()
    //functions to call
    let createLobby = () => {
      const inviteCode = Math.floor(Math.random() * 900000) + 100000
      let promise = new Promise((resolve, reject) => {
        let collection = 'activegame'
        let data = {
          code: inviteCode,
          host: userId,
          state: 'draft'
        }
        post(resolve, reject, data, collection);
      })
      promise.then((data) => {
        self.setState({lobbyId: inviteCode, lobbyKey: data.key, loading: false});
      }).catch(function (error) {
          console.log(error);
      });
    }

    //functions to execute at start
    let hostExists = new Promise((resolve, reject) => {
      base
        .fetch('activegame/', {
        context: this,
        asArray: true,
        queries: {
          orderByChild: 'host',
          equalTo: userId
        }
      })
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          //handle error
        })
    })
    hostExists.then((data) => {
      if (data.length > 0) {
        this.setState({lobbyId: data[0].code, lobbyKey: data[0].key, loading: false});
      } else {
        createLobby();
      }
    })
  }

  render() {
    return (
      <div>
        {this.state.loading === true
          ? <h3>
              LOADING...
            </h3>
          : <div>
            <h3>
              Available Cards
            </h3>
            <Cards dbReference={'/cards'}/>
            <h3>Lobby ID: {this.state.lobbyId}</h3>
            <Counterlabel
              labelText={"Joined People: "}
              dbReference={'activegame/' + this.state.lobbyKey + '/memberarray/'}/>
            <RaisedButton label="Start" primary={true}/>
            <Deleteandroutebutton
              route={"/main"}
              labelText={"Cancel"}
              dbReference={'activegame/' + this.state.lobbyKey}/>
          </div>
}
      </div>
    )
  }
}

export default create