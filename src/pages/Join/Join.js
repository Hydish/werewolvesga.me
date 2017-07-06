import React, {Component} from 'react'
import {Card, CardActions, CardTitle} from 'material-ui/Card'
import {update} from '../../helpers/dbcalls'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import {base} from '../../config/constants'
import Warningwindow from '../../components/Warningwindow/Warningwindow'
import Styles from './Join.css.js'
import SimpleState from 'react-simple-state'
import Cookies from 'universal-cookie';
import {Container, Row, Col} from 'react-grid-system';

const simpleState = new SimpleState()
const cookies = new Cookies();

export default class join extends Component {
  constructor(props) {
    super(props)
    this.state = {
      alertMsg: ""
    };
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const userId = base
      .app()
      .INTERNAL
      .getUid()

    let getUUID = new Promise((resolve, reject) => {

      const number = this.number.input.value
      if (isNaN(number) !== true) {
        base
          .fetch('activegame/', {
          context: this,
          asArray: true,
          queries: {
            orderByChild: 'code',
            equalTo: Number(number)
          }
        })
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        this.setState({alertMsg: "Please insert a number!"})
        this
          .dialog
          .handleOpen()
      }
    })

    let addUser = (key) => {
      let promise = new Promise((resolve, reject) => {
        const collection = "activegame/" + key + "/memberarray/" + userId
        let object = {
          card: "null"
        }
        update(resolve, reject, object, collection);
      })
      promise.then((data) => {
        console.log("addUser done")
        cookies.set('lobbyNumber', key, { path: '/' });
        simpleState.evoke("gameId", {id: key})
        simpleState.evoke("loader", true)
        this.setState({alertMsg: "Game found! Now waiting until creator starts game"})
        this
          .dialog
          .handleOpen()
        console.log(simpleState.getState("loader"))
        const collection = "activegame/" + key;
        base.listenTo(collection, {
          context: this,
          asArray: true,
          then(data) {
            console.log(data)
            if (data[3] === "ready") {
              console.log("game starts")
              simpleState.evoke("loader", true)
              this
                .props
                .history
                .push("game")
            }
          }
        })

      })
        .catch(function (error) {
          console.log(error)
        });
    }

    getUUID.then((data) => {
      console.log(data)
      if (data.length > 0) {
        console.log(data[0].memberarray)
        if (data[0].memberarray === undefined) {
          addUser(data[0].key)
        } else {
          const userIdArr = Object.keys(data[0].memberarray);
          if (userIdArr.indexOf(userId) > -1 && data[0].state === "ready") {
            cookies.set('lobbyNumber', data[0].key, { path: '/' });
            simpleState.evoke("gameId", {id: data[0].key})
            simpleState.evoke("loader", true)
            this
              .props
              .history
              .push("game")
          } else {
            if (data[0].state === "draft") {
              addUser(data[0].key)
            } else {
              this.setState({alertMsg: "The game already started, sorry"})
              this
                .dialog
                .handleOpen()
            }
          }
        }
      } else {
        console.log("not found")
        this.setState({alertMsg: "There is no game with this ID"})
        this
          .dialog
          .handleOpen()
      }
    })
  }
  componentDidMount() {
    simpleState.evoke("loader", false)
  }
  render() {
    return (
      <Card>
        <CardTitle title="Join Game"/>
        <CardActions>
          <form onSubmit={this.handleSubmit}>
            <Container style={{
              marginLeft: "8px"
            }}>
              <Row>
                <Col xs={8}>
                  <TextField
                    ref={(number) => this.number = number}
                    maxLength="6"
                    type="tel"
                    hintText="123456"
                    floatingLabelText="Lobby Id"
                    fullWidth={true}/>
                </Col>
                <Col xs={4}>
                  <FlatButton type="submit" label="Join" style={Styles.buttonHeight}/>
                </Col>
              </Row>
            </Container>
          </form>
        </CardActions>
        <Warningwindow
          message={this.state.alertMsg}
          ref={(dialog) => {
          this.dialog = dialog
        }}/>
      </Card>
    )
  }
}