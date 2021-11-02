import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import SignUp from './Components/User/SignUp';
import SignIn from './Components/User/SignIn';
import Home from './Components/Home/Home';

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
          <Route exact path="/signUp" component={SignUp} />
          <Route exact path="/signIn" component={SignIn} />
          <Route exact path="/home" component={Home} />
        </Router>
      </div>
    )
  }
}

export default App;