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

class App extends React.Component<any, {

}>{
  constructor(props: any) {
    super(props)
    this.state = {
      
    }
  }

  componentDidUpdate = () => {
    console.log(localStorage.getItem('user_id'))
  }

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <React.Fragment>
              <Route exact path="/signUp" component={SignUp} />
              <Route exact path="/" render={() => <Redirect to="/login" />} />
              <Route exact path="/login" component={Login} />
              <div style={{display: 'flex'}}>
                <InnerSideNav />
                <Route exact path="/chatApp/chat" component={Chat} />
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