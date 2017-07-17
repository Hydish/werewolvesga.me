import React, {Component} from 'react';
import {fetch, post} from '../../helpers/dbcalls';
import {base} from '../../config/constants';
import Flipcard from '../../components/Flipcard/Flipcard';
import CheckboxList from '../../components/Checkboxlist/Checkboxlist';
import SimpleState from 'react-simple-state';
import RaisedButton from 'material-ui/RaisedButton';
import Warningwindow from '../../components/Warningwindow/Warningwindow';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Gavel from 'material-ui/svg-icons/action/gavel';
import Viewlist from 'material-ui/svg-icons/action/view-list';
import Votelist from '../../components/Votelist/Votelist';
import Styles from './Game.css.js';
const simpleState = new SimpleState();


export default class Gameadmin extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      displayName: null,
      voting: false,
      votes: [],
      voteData: [],
      voted: false
    }
  }

  gameDone = () => {
    this
      .props
      .history
      .push("main")
  }

  sendVote = () => {
    const userId = base
      .app()
      .INTERNAL
      .getUid()
    console.log("send");
    const gameId = sessionStorage.lobbyNumber;
    let postVotingData = new Promise((resolve, reject) => {
      const collection = 'activegame/' + gameId + "/voting/votes/" + userId;
      const splitString = this.checkList.state.votedkey.split("|")
      const votedKey = splitString[0];
      const displayName = splitString[1];
      const votingData = {displayName: this.state.displayName, votedForKey: votedKey, votedForDisplayName: displayName};
      post(resolve, reject, votingData, collection);
    })
    postVotingData.then((data) => {
      this.setState({voted: true})
      base.listenTo('activegame/' + gameId + "/voting/votes", {
        context: this,
        asArray: true,
        then(votesData){
          let getVoteData = new Promise((resolve, reject) => {
            const collection = 'activegame/' + gameId + "/voting/data/";
            fetch(resolve, reject, collection,{}, false);
          })
          getVoteData.then((voteData) =>{
            for(let i = 0; i < votesData.length; i++){
              const key = votesData[i].votedForKey;
              if(voteData[key].votedFor){
                voteData[key].votedFor = voteData[key].votedFor + ", " + votesData[i].displayName;
              }else{
                voteData[key].votedFor = votesData[i].displayName;
              }
              voteData[key].votes = voteData[key].votes + 1;
            }
            const objectArr = Object.values(voteData)
            this.setState({votes: objectArr});
          })
        }
      })
    })
  }

  initVote = () => {
    this.setState({voting: true})
    const gameId = sessionStorage.lobbyNumber;
    const userId = base
      .app()
      .INTERNAL
      .getUid()
    let checkIfVoted = new Promise((resolve, reject) => {
      const collection = 'activegame/' + gameId + "/voting/votes/" + userId
      fetch(resolve, reject, collection);
    })
    checkIfVoted.then((data) => {
      console.log(data)
      if(data.length === 0){
        base.listenTo('activegame/' + sessionStorage.lobbyNumber + "/voting/data", {
          context: this,
          asArray: true,
          then(votesData){
            console.log(votesData)
            this.setState({voteData: votesData})
          }
        })
      }else{
        this.setState({voted: true})
        base.listenTo('activegame/' + gameId + "/voting/votes", {
          context: this,
          asArray: true,
          then(votesData){
            let getVoteData = new Promise((resolve, reject) => {
              const collection = 'activegame/' + gameId + "/voting/data/";
              fetch(resolve, reject, collection,{}, false);
            })
            getVoteData.then((voteData) =>{
              for(let i = 0; i < votesData.length; i++){
                const key = votesData[i].votedForKey;
                if(voteData[key].votedFor){
                  voteData[key].votedFor = voteData[key].votedFor + ", " + votesData[i].displayName;
                }else{
                  voteData[key].votedFor = votesData[i].displayName;
                }
                voteData[key].votes = voteData[key].votes + 1;
              }
              const objectArr = Object.values(voteData)
              this.setState({votes: objectArr});
            })
            
          }
        })
      }
    })
  }
  initList = () => {
    this.setState({voting: false})
  }

  componentDidMount(){
    const userId = base
      .app()
      .INTERNAL
      .getUid()
    simpleState.evoke("loader", true)
    if(simpleState.getState("gameId").id === "" && sessionStorage.lobbyNumber === undefined){
      this.props.history.push("join")
    }else{
      let gameId = "";
      if(simpleState.getState("gameId").id !== ""){
        gameId = simpleState.getState("gameId").id;
      }else if(sessionStorage.lobbyNumber !== undefined){
        gameId = sessionStorage.lobbyNumber
      }
      let getCurrentCard = new Promise((resolve, reject) => {
        const collection = 'activegame/' + gameId + "/memberarray/" + userId
        fetch(resolve, reject, collection);
      })
      getCurrentCard.then((data) => {
        if(data.length > 0){
          this.setState({displayName: data[1]})
          let getCardInfos = new Promise((resolve, reject) => {
            const collection = 'cards/' + data[0]
            fetch(resolve, reject, collection);
          })
          getCardInfos.then((data) => {
            let cardObj = {
              description: data[0],
              name: data[1],
              pictureback: data[2],
              picturefront: data[3]
            }
            this.setState({cards: cardObj})
            simpleState.evoke("loader", false)
            base.listenTo('activegame/' + gameId + "/memberarray/" + userId, {
              context: this,
              asArray: false,
              then(data){
                console.log(data)
                if(data.card === undefined){
                  this
                  .dialog
                  .handleOpen()  
                }
              }
            })
          })
        }else{
          this
          .props
          .history
          .push("join")
        }
      })
    }
  }
  render() {
    return (
      <div className="col-sm-6 col-sm-offset-3">
      {this.state.voting === false ? 
      <div>
        <h2>{this.state.displayName} your card is:</h2>
        <Flipcard data={this.state.cards}/>
        <FloatingActionButton style={Styles.fab}
          onTouchTap={this.initVote}>
          <Gavel />
        </FloatingActionButton>
        </div>
      : 
        <div>
          {this.state.voted === false ? 
          <div>
            <CheckboxList
              votesData={this.state.voteData}
              ref={(checkList) => {
                this.checkList = checkList}}
            />
            <RaisedButton
              primary={true}
              label={"Vote!!"}
              onClick={
              this.sendVote}/>
            </div>
            :
            <Votelist
              disabled={true}
              voteData={this.state.votes}
              />
          }
          <FloatingActionButton 
            style={Styles.fab}
            onTouchTap={this.initList}>
            <Viewlist />
          </FloatingActionButton>
        </div>
        }
      <Warningwindow
        message={"Game finished"}
          secondAction={this.gameDone}
          secondActionShow={true}
          secondActionLabel={"Leave game"}
          ref={(dialog) => {
          this.dialog = dialog
        }}/>
      </div>
    )
  }
}