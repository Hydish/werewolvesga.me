import React, {Component} from 'react'
import {fetch} from '../../helpers/dbcalls'
import {base} from '../../config/constants'
import Cards from '../../components/Cards/Cards'
import SimpleState from 'react-simple-state'
const simpleState = new SimpleState()

export default class Gameadmin extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      cards: []
    }
  }

  componentDidMount(){
    const userId = base
      .app()
      .INTERNAL
      .getUid()
    console.log(simpleState.getState("gameId"))
    if(simpleState.getState("gameId").id === ""){
      this.props.history.push("join")
    }else{

      let getCurrentCard = new Promise((resolve, reject) => {
        console.log(simpleState.getState("gameId").id)
        const collection = 'activegame/' + simpleState.getState("gameId").id + "/memberarray/" + userId
        fetch(resolve, reject, collection);
      })
      getCurrentCard.then((data) => {
        console.log("to route")
        console.log(data)
        let getCardInfos = new Promise((resolve, reject) => {
          console.log(simpleState.getState("gameId").id)
          const collection = 'cards/' + data[0]
          fetch(resolve, reject, collection);
        })
        getCardInfos.then((data) => {
          console.log("got card")
          console.log(data)
          let cardObj = [{
            description: data[0],
            name: data[1],
            picturefront: data[2]
          }]
          this.setState({cards: cardObj})
          simpleState.evoke("loader", false)
        })
      })

    }
    
  }
  render() {
    console.log(this.state.cards)
    return (
      <div className="col-sm-6 col-sm-offset-3">
      Your Card:
        <Cards counter={false} data={this.state.cards}/>
      </div>
    )
  }
}