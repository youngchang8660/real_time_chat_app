import React from 'react';
import { RouteComponentProps } from "react-router-dom";
import axios from 'axios';
import ChatRoomList from './ChatRoomList';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import { selectChatRoom, toggleMobileAndChatSelected } from '../../redux/actions';

interface StateProps {
    selectedChatRoom: any,
    isMobileAndChatClicked: boolean
}

interface DispatchProps {
    selectChatRoom: (chat: any) => void,
    toggleMobileAndChatSelected: (action: boolean) => void
}

interface ChatStateInterface {
    windowWidth: number,
    server: string,
    userID: any,
    userInfo: Array<any>,
    myChatsArray: Array<any>,
    textareaHeight: number,
    isLoading: boolean,
}

type Props = RouteComponentProps & StateProps & DispatchProps

class Chat extends React.Component<
    Props,
    ChatStateInterface
>{
    constructor(props: Props) {
        super(props);
        let windowWidth = document.body.clientWidth;
        this.state = {
            windowWidth: windowWidth,
            server: 'http://localhost:5032',
            userID: localStorage.getItem('user_id'),
            userInfo: [],
            myChatsArray: [],
            textareaHeight: 0,
            isLoading: false,
        }
    }

    componentDidMount = () => {
        if(this.state.userID === null || this.state.userID === undefined) {
            return this.props.history.push('/login')
        }
        this.getMyInfo();
        this.getAllChats();
        window.addEventListener("resize", this.detectWindowSizeChange);
        this.setState({
            isLoading: true
        })
    }
    
    componentDidUpdate = (prevProps: any) => {
        if(prevProps.selectedChatRoom.chat_id !== this.props.selectedChatRoom.chat_id) {
            if(Object.keys(this.props.selectedChatRoom).length !== 0 && this.state.windowWidth <= 414) {
                this.props.toggleMobileAndChatSelected(true)
            }
            if(Object.keys(this.props.selectedChatRoom).length === 0 && this.state.windowWidth <= 414) {
                this.props.toggleMobileAndChatSelected(false)
            }
            this.setState({
                isLoading: false,
            })
        }
    }

    detectWindowSizeChange = () => {
        this.setState({
            windowWidth: document.body.clientWidth
        })
    }

    componentWillUnmount = () => {
        window.removeEventListener("resize", this.detectWindowSizeChange);
    }

    getMyInfo = () => {
        let userInfo: any = [];
        axios.get(`${this.state.server}/api/getUserInfo/${this.state.userID}`)
            .then((res: any) => {
                userInfo = res.data;
                for(let i = 0; i < userInfo.length; i++) {
                    if(userInfo[0].user_image !== null) {
                        userInfo[0].user_image = this.convertBufferArrayToDataURL(userInfo[0].user_image.data);
                    } else {
                        userInfo[0].user_image = "";
                    }
                }
                this.setState({
                    userInfo: res.data
                })
            }).catch(err => {
                console.log(err.message)
            })
    }

    getAllChats = () => {
        let { server, userID } = this.state;
        let myChatsArray:any = [];
        axios.get(`${server}/api/getAllChats/${userID}`)
            .then((res: any) => {
                myChatsArray = res.data;
                for(let i = 0; i < myChatsArray.length; i++) {
                    if(myChatsArray[i].user_image !== null) {
                        myChatsArray[i].user_image = this.convertBufferArrayToDataURL(myChatsArray[i].user_image.data);
                    } else {
                        myChatsArray[i].user_image = "";
                    }
                }
                this.setState({
                    myChatsArray,
                })
            })
    }
    
    convertBufferArrayToDataURL = (arrayData: any, type = "image/png") => {
        const arrayBuffer = new Uint8Array(arrayData);
        const blob = new Blob([arrayBuffer], { type: type });
        const urlCreator = window.URL || (window as any).webkitURL;
        const fileUrl = urlCreator.createObjectURL(blob);
        return fileUrl;
    };
    
    render() {
        let { windowWidth, userInfo, myChatsArray, userID, isLoading } = this.state;
        let { selectedChatRoom, isMobileAndChatClicked } = this.props;
        return (
            <div className={windowWidth > 414 ? "chat-page-container" : "mobile-chat-page-container"}>
                {!isMobileAndChatClicked ?
                (
                    <ChatRoomList 
                        userInfo={userInfo} 
                        windowWidth={windowWidth} 
                        chatsData={myChatsArray} 
                        userID={userID}
                        history={this.props.history}
                    />
                ):(
                    <div></div>
                )}
                {Object.keys(selectedChatRoom).length > 0 && !isLoading ?
                (
                    <ChatRoom 
                        windowWidth={windowWidth}
                        userInfo={userInfo}
                        userID={userID}
                        props={this.props}
                    />
                ):(
                    <div></div>
                )}
                
            </div>
        )
    }
}

function mapStateToProps(state: any) {
    return {
        selectedChatRoom: state.selectedChatRoom,
        isMobileAndChatClicked: state.isMobileAndChatClicked,
    }
}

function matchDispatchToProps(dispatch: any) {
    return {
        selectChatRoom: (chat: any) => dispatch(selectChatRoom(chat)),
        toggleMobileAndChatSelected: () => dispatch(toggleMobileAndChatSelected())
    }
}

export default connect(mapStateToProps, matchDispatchToProps)(Chat);