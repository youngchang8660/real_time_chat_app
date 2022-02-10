import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import SignUp from './Components/User/SignUp';
import Login from './Components/User/Login';
import InnerSideNav from './Components/App/InnerSideNav';
import Chat from './Components/App/Chat';
import Profile from './Components/App/Profile';
import FriendsList from './Components/App/FriendsList';
import { Redirect } from 'react-router-dom';
import { CustomProvider } from 'rsuite';
import io from "socket.io-client";

const endPoint = window.location.href.indexOf('localhost') > 0 ? 'http://localhost:5032' : 'https://165.227.31.155:5032';
let socket: any;

interface AppStateInterface {

}

class App extends React.Component<
  any,
  AppStateInterface
>{
  constructor(props: any) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    if(localStorage.getItem("user_id") !== null && socket === undefined) {
      this.connectToSocket(endPoint)
    }
  }

  connectToSocket = (endPoint: string) => {
    socket = io(endPoint);
  }

  disconnectSocket = () => {
    socket.disconnect();
  }

  componentWillUnmount() {
    this.disconnectSocket();
  }

  render() {
    return (
      <div style={{backgroundColor: '#36393e'}}>
        <Router>
          <Switch>
            <React.Fragment>
              <Route exact path="/signUp" component={SignUp} />
              <Route exact path="/" render={() => <Redirect to="/login" />} />
              <Route
                exact path="/login"
                render={(props) => (
                  <Login 
                    {...props} 
                    connectToSocket={this.connectToSocket}
                    disconnectSocket={this.disconnectSocket}
                    socket={socket}
                  />
                )}
              />  
              <div style={{display: 'flex'}}>
                <CustomProvider theme="dark">
                  <InnerSideNav
                    disconnectSocket={this.disconnectSocket}
                  />
                </CustomProvider>
                <Route
                  exact path="/chatApp/chat/:chat_id?"
                  render={(props) => (
                    <Chat
                      {...props}
                      connectToSocket={this.connectToSocket}
                      socket={socket}
                    />
                  )}
                />
                <Route exact path="/chatApp/profile" component={Profile} />
                <Route exact path="/chatApp/friends" component={FriendsList} />      
              </div>
            </React.Fragment>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;