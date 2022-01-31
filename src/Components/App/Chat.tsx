import React from 'react';
import { RouteComponentProps } from "react-router-dom";
import axios from 'axios';
import ChatRoomList from './ChatRoomList';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import { selectChatRoom, toggleMobileAndChatSelected } from '../../redux/actions';
import io from "socket.io-client";

const socket = io('http://localhost:5032');

interface StateProps {
    selectedChatRoom: any,
    isMobileAndChatClicked: boolean
}

interface DispatchProps {
    selectChatRoom: (chat: any) => void,
    toggleMobileAndChatSelected: (isToggle: boolean) => void
}

interface ChatStateInterface {
    windowWidth: number,
    server: string,
    userID: any,
    userInfo: Array<any>,
    myChatsArray: Array<any>,
    textareaHeight: number,
    joinedChatRooms: Array<any>,
    selectedRoomMessages: Array<any>,
    textMessage: string,
    unReadMessageArray: Array<any>,
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
            joinedChatRooms: [],
            selectedRoomMessages: [],
            textMessage: "",
            unReadMessageArray: [],
        }
    }

    componentDidMount = () => {
        if(this.state.userID === null || this.state.userID === undefined) {
            return this.props.history.push('/')
        }
        if(!this.props.isMobileAndChatClicked && Object.keys(this.props.selectedChatRoom).length === 0) {
            this.props.history.push("/chatApp/chat")
        }
        this.getMyInfo();
        this.getAllChats();
        this.getUnreadMessage();
        this.detectWindowSizeChange();
        window.addEventListener("resize", this.detectWindowSizeChange);
    }

    componentDidUpdate(prevProps: any) {
        if(prevProps.selectedChatRoom.chat_id !== this.props.selectedChatRoom.chat_id) {
            this.fetchChatMessages(this.props.selectedChatRoom.chat_id);
        }
    }

    detectWindowSizeChange = () => {
        this.setState({
            windowWidth: document.body.clientWidth
        }, () => {
            if(this.state.windowWidth <= 414) {
                this.props.toggleMobileAndChatSelected(true)
            } else {
                this.props.toggleMobileAndChatSelected(false)
            }
        })
    }

    componentWillUnmount = () => {
        window.removeEventListener("resize", this.detectWindowSizeChange);
        socket.disconnect();
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
        let joinedChatRooms: any = [];
        axios.get(`${server}/api/getAllChats/${userID}`)
            .then((res: any) => {
                if(res.data.length !== this.state.joinedChatRooms.length) {
                    myChatsArray = res.data;
                    for(let i = 0; i < myChatsArray.length; i++) {
                        if(myChatsArray[i].user_image !== null) {
                            myChatsArray[i].user_image = this.convertBufferArrayToDataURL(myChatsArray[i].user_image.data);
                        } else {
                            myChatsArray[i].user_image = "";
                        }
                        joinedChatRooms.push(myChatsArray[i].chat_id)
                    }
                    this.setState({
                        myChatsArray,
                        joinedChatRooms
                    }, () => {
                        for(let i = 0; i < this.state.joinedChatRooms.length; i++) {
                            socket.emit("join", this.state.joinedChatRooms[i])
                            this.fetchChatMessages(this.state.joinedChatRooms[i]);
                        }
                        if(!this.props.isMobileAndChatClicked) {
                            this.props.selectChatRoom(this.state.myChatsArray[0]);
                        }
                        this.getMessages();
                    })
                }
            })
    }

    fetchChatMessages = (chatRoomID: string) => {
        axios.get(`${this.state.server}/api/getMessages/${chatRoomID}`)
            .then((res: any) => {
                if(chatRoomID === this.props.selectedChatRoom.chat_id) {
                    this.setState({
                        selectedRoomMessages: res.data.map((a: any) => Object.assign({}, a))
                    }, () => {
                        if(Object.keys(this.props.selectedChatRoom).length > 0) {
                            this.scrollToBottom();   
                        }
                    })
                }
            }).catch(err => {
                console.log(err.message)
            })
    }

    getMessages = () => {
        socket.on("get message", data => {
            if(data.sender !== this.state.userID) {
                if(this.state.selectedRoomMessages[0].Chat_id === data.chatID) {
                    this.setState({
                        selectedRoomMessages: [...this.state.selectedRoomMessages, {
                            Chat_id: data.chatID,
                            Message_Date_Time: new Date(),
                            Message_text: data.messageText, 
                            Sender: data.sender 
                        }]
                    }, () => {
                        this.scrollToBottom();
                    })
                } else {
                    let requestUrl = `${this.state.server}/api/saveUnreadMessage`;
                    let requestData = {
                        recipient: this.state.userID,
                        chatID: data.chatID,
                        sender: data.sender,
                        messageText: data.messageText
                    };
                    axios.post(requestUrl, requestData)
                        .then(() => {
                            this.getUnreadMessage();
                        }).catch(err => {
                            console.log(err.message)
                        })
                }
            }
        })
    }

    getUnreadMessage = () => {
        let { server, userID } = this.state;
        axios.get(`${server}/api/getUnreadMessage/${userID}`)
            .then((res: any) => {
                this.setState({
                    unReadMessageArray: res.data
                })
            }).catch(err => {
                console.log(err.message)
            })
    }

    onChangeTextMessage = (e: any) => {
        this.setState({
            textMessage: e.currentTarget.value
        })
    }

    sendMessage = (selectedChatRoomID: string, messageText: string) => {
        let { server } = this.state;
        let { userID } = this.state;
        let data = {
            chatID: selectedChatRoomID,
            sender: userID,
            messageText: messageText
        };
        socket.emit('send message', data);
        let url = `${server}/api/sendMessage`;
        axios.post(url, {
            data
        }).then(() => {
            this.fetchChatMessages(selectedChatRoomID)
            this.setState({
                textMessage: ""
            })
        }).catch(err => {
            console.log(err.message)
        })
    }

    scrollToBottom = () => {
        let chatContainer = document.getElementsByClassName('chat-message-text-container');
        chatContainer[0].scrollTop = chatContainer[0].scrollHeight;
    }
    
    convertBufferArrayToDataURL = (arrayData: any, type = "image/png") => {
        const arrayBuffer = new Uint8Array(arrayData);
        const blob = new Blob([arrayBuffer], { type: type });
        const urlCreator = window.URL || (window as any).webkitURL;
        const fileUrl = urlCreator.createObjectURL(blob);
        return fileUrl;
    };
    
    render() {
        let { windowWidth, userInfo, myChatsArray, userID } = this.state;
        let { selectedChatRoom, isMobileAndChatClicked } = this.props;
        return (
            <div className={windowWidth > 414 ? "chat-page-container" : "mobile-chat-page-container"}>
                {!isMobileAndChatClicked || (isMobileAndChatClicked && Object.keys(this.props.selectedChatRoom).length === 0) ?
                (
                    <ChatRoomList 
                        userInfo={userInfo} 
                        windowWidth={windowWidth} 
                        chatsData={myChatsArray} 
                        userID={userID}
                        history={this.props.history}
                        getUnreadMessage={this.getUnreadMessage}
                        unReadMessageArray={this.state.unReadMessageArray}
                    />
                ):(
                    <div></div>
                )}
                {Object.keys(selectedChatRoom).length > 0 ?
                (
                    <ChatRoom 
                        windowWidth={windowWidth}
                        userInfo={userInfo}
                        userID={userID}
                        props={this.props}
                        fetchChatMessages={this.fetchChatMessages}
                        sendMessage={this.sendMessage}
                        selectedRoomMessages={this.state.selectedRoomMessages}
                        onChangeTextMessage={this.onChangeTextMessage}
                        textMessage={this.state.textMessage}
                        scrollToBottom={this.scrollToBottom}
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
        toggleMobileAndChatSelected: (isToggle: boolean) => dispatch(toggleMobileAndChatSelected(isToggle))
    }
}

export default connect(mapStateToProps, matchDispatchToProps)(Chat);