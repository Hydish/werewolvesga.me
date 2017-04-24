import React, { Component } from 'react'
//import 'bootstrap/dist/css/bootstrap.css'
import { Route, BrowserRouter, Link, Redirect, Switch } from 'react-router-dom'
import Login from './Login'
import Register from './Register'
import Home from './Home'
import game from './protected/Game'
import { logout } from '../helpers/auth'
import { firebaseAuth } from '../config/constants'
import Appbar from 'muicss/lib/react/appbar';

function PrivateRoute ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
    />
  )
}

function PublicRoute ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === false
        ? <Component {...props} />
        : <Redirect to='/game' />}
    />
  )
}

export default class App extends Component {
  state = {
    authed: false,
    loading: true,
  }
  componentDidMount () {
    this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: true,
          loading: false,
        })
      } else {
        this.setState({
          authed: false,
          loading: false
        })
      }
    })
  }
  componentWillUnmount () {
    this.removeListener()
  }
  render() {
    return this.state.loading === true ? <h1>Loading</h1> : (
      <BrowserRouter>
        <div>

      
          <Appbar>
            <table width="100%">
              <tbody>
                <tr style={{verticalAlign: 'middle'}}>
                  <td className="mui--appbar-height">Werwolf</td>
                  <td className="mui--appbar-height" style={{textAlign: "right"}}>
                    {this.state.authed
                    ? <a
                        style={{color: "white"}}
                        onClick={() => {
                          logout()
                        }}
                        className="navbar-brand">Logout</a>
                    : <span>
                        <Link style={{color: "white"}} to="/login">Login</Link>
                        <Link style={{color: "white"}} to="/register">Register</Link>
                      </span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </Appbar>

          <div className="container">
            <div className="row">
              <Switch>
                <Route path='/' exact component={Home} />
                <PublicRoute authed={this.state.authed} path='/login' component={Login} />
                <PublicRoute authed={this.state.authed} path='/register' component={Register} />
                <PrivateRoute authed={this.state.authed} path='/game' component={game} />
                <Route render={() => <h3>No Match</h3>} />
              </Switch>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
