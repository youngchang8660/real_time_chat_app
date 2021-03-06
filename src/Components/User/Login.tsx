import React from 'react';
import { RouteComponentProps } from "react-router-dom";
import { TextField, Button } from '@material-ui/core';
import axios from 'axios';
import MessageSnackbar from '../Reusable/MessageSnackbar';

const endPoint = window.location.href.indexOf('localhost') > 0 ? 'http://localhost:5032' : 'https://165.227.31.155:5032';

interface PropsInterface {
    connectToSocket: (endPoint: string) => void,
    disconnectSocket: () => void,
    socket: any
}

interface LoginState {
    userID: string,
    password: string,
    snackbarMessage: string,
    isSnackbarOpen: boolean,
    status: number,
}

type Props = PropsInterface & RouteComponentProps;

class Login extends React.Component<
    Props,
    LoginState
>{
    constructor(props: Props) {
        super(props);
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
        this.disconnectSocket();
    }

    disconnectSocket = () => {
        if(this.props.socket !== undefined) {
            this.props.disconnectSocket();
        }
    }

    onKeyDownEnter = (e: any) => {
        if(e.keyCode === 13) {
            if(this.state.password.length > 0 && this.state.userID.length > 0) {
                this.onClickEventLogin();
            } else {
                this.setState({
                    snackbarMessage: "Enter all fields",
                    isSnackbarOpen: true,
                    status: 500,
                })
            }
        }
    }

    onClickEventLogin = () => {
        let { userID, password } = this.state;
        let url = `/api/login`;
        let data = {
            'user_id': userID,
            'password': password
        };
        axios.post(url, data)
            .then(res => {
                if(res.status === 200) {
                    let data: any = res.data;
                    localStorage.setItem('user_id', data.user_id)
                    localStorage.setItem('first_name', data.first_name)
                    localStorage.setItem('last_name', data.last_name)
                    localStorage.setItem('email', data.email)
                    this.props.connectToSocket(endPoint);
                    this.props.history.push('/chatApp/chat')
                }
            }).catch(err => {
                if(err.response.status === 500) {
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
                    <div className="mb-3">
                        <label className="mb-2 signInLabel">ID</label>
                        <TextField 
                            variant="standard"
                            onChange={(e) => {this.setState({ userID: e.currentTarget.value })}}
                            className="col-12"
                            required
                            inputProps={{ 
                                style: { 
                                    fontFamily: 'Arial', 
                                    color: 'white', 
                                    border: 'none',
                                    height: '50px',
                                    margin: 'none',
                                    backgroundColor: '#202225',
                                    paddingLeft: '5px'
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="mb-2 signInLabel">Password</label>
                        <TextField 
                            variant="standard"
                            onChange={(e) => {this.setState({ password: e.currentTarget.value })}}
                            className="col-12"
                            required
                            inputProps={{ 
                                style: { 
                                    fontFamily: 'Arial', 
                                    color: 'white', 
                                    border: 'none',
                                    height: '50px',
                                    margin: 'none',
                                    backgroundColor: '#202225',
                                    paddingLeft: '5px'
                                }
                            }}
                            onKeyDown={(e: any) => {this.onKeyDownEnter(e)}}
                        />
                    </div>
                    <div className="mt-5">
                        <Button 
                            className="signInButton" 
                            variant="outlined" 
                            style={{fontSize: '16px', fontWeight: 'bold', color: 'white', backgroundColor: '#202225', border: 'none' }} 
                            onClick={this.onClickEventLogin}
                            type="submit"
                        >
                            Log In
                        </Button>
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