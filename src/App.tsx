import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import SignUp from './Components/User/SignUp';
import SignIn from './Components/User/SignIn';
import InnerSideNav from './Components/App/InnerSideNav';
import Chat from './Components/App/Chat';
import Setting from './Components/App/Setting';
import FriendsList from './Components/App/FriendsList';

class App extends React.Component<any, {

}>{
  constructor(props: any) {
    super(props)
    this.state = {
      
    }
  }

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <React.Fragment>
              <Route exact path="/signUp" component={SignUp} />
              <Route exact path="/signIn" component={SignIn} />
              <div style={{display: 'flex'}}>
                <InnerSideNav />
                <Route exact path="/chatApp/chat" component={Chat} />
                <Route exact path="/chatApp/setting" component={Setting} />
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