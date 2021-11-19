import React from 'react';
import { TextField, Button } from '@material-ui/core';
import axios from 'axios';
import qs from 'qs';
import MessageSnackbar from '../Reusable/MessageSnackbar';

class Login extends React.Component<any, {
    userID: any,
    password: any,
    snackbarMessage: any,
    isSnackbarOpen: boolean,
    status: number,
}>{
    constructor(props: any) {
        super(props)
        this.state = {
            userID: "",
            password: "",
            snackbarMessage: "",
            isSnackbarOpen: false,
            status: 0,
        }
    }

    componentDidMount = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('email');
        localStorage.removeItem('first_name')
        localStorage.removeItem('last_name');
    }

    clickLogin = () => {
        let { userID, password } = this.state;
        let url = ('http://localhost:5032/api/login');
        let data = {
            'user_id': userID,
            'password': password
        };
        const options: any = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data),
            url,
        };
        axios(options)
            .then(res => {
                if(res.status === 200) {
                    let data: any = res.data;
                    localStorage.setItem('user_id', data.user_id)
                    localStorage.setItem('first_name', data.first_name)
                    localStorage.setItem('last_name', data.last_name)
                    localStorage.setItem('email', data.email)
                    this.props.history.push('/chatApp/chat')
                }
            }).catch(err => {
                if(err.response.status === 500) {
                    console.log(err.response.status)
                    console.log(err.response.data)
                    this.setState({
                        snackbarMessage: err.response.data,
                        isSnackbarOpen: true,
                        status: err.response.status,
                    })
                } 
            })
    }

    closeMessage = () => {
        this.setState({
            isSnackbarOpen: false
        })
    }

    render() {
        return (
            <div className="signInBody">
                <div className="signInContainer">
                    <div className="containerTitle">
                        <h2>Login</h2>
                    </div>
                    <div>
                        <label className="mb-2 signInLabel">ID</label>
                        <TextField 
                            variant="outlined"
                            onChange={(e) => {this.setState({ userID: e.currentTarget.value })}}
                            className="col-12"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 signInLabel">Password</label>
                        <TextField 
                            variant="outlined"
                            onChange={(e) => {this.setState({ password: e.currentTarget.value })}}
                            className="col-12"
                            required
                        />
                    </div>
                    <div className="mt-3">
                        <Button className="signInButton" variant="outlined" style={{fontSize: '16px', fontWeight: 'bold' }} onClick={this.clickLogin}>Log In</Button>
                    </div>
                    <h5 className="signInHorizontalLine"><span>Or</span></h5>
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                        <h5 onClick={() => {this.props.history.push('/signUp')}} style={{cursor: 'pointer', marginTop: '10px'}}>Sign Up</h5>
                    </div>
                </div>
                <MessageSnackbar 
                    message={this.state.snackbarMessage}
                    isOpen={this.state.isSnackbarOpen}
                    messageStatus={this.state.status}
                    closeMessage={this.closeMessage}
                />
            </div>
        )
    }
}

export default Login;