import React from 'react';
import { RouteComponentProps } from "react-router-dom";
import axios from 'axios';
import ChatRoomList from './ChatRoomList';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import { selectChatRoom, toggleMobileAndChatSelected } from '../../redux/actions';

let myInterval: any;
const endPoint = window.location.href.indexOf('localhost') > 0 ? 'http://localhost:5032' : 'https://165.227.31.155:5032';

interface AppProps {
    socket: any,
    connectToSocket: (endPoint: string) => void,
}

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
    userID: any,
    userInfo: Array<any>,
    myChatsArray: Array<any>,
    textareaHeight: number,
    joinedChatRooms: Array<any>,
    selectedRoomMessages: Array<any>,
    textMessage: string,
    unReadMessageArray: Array<any>,
}

type Props = RouteComponentProps & AppProps & StateProps & DispatchProps

class Chat extends React.Component<
    Props,
    ChatStateInterface
>{
    constructor(props: Props) {
        super(props);
        let windowWidth = document.body.clientWidth;
        this.state = {
            windowWidth: windowWidth,
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

        if(localStorage.getItem('user_id') !== null && (this.props.socket === undefined || !this.props.socket.connected)) {
            this.props.connectToSocket(endPoint);
        }
        this.checkIfSocketConnected();
    }

    checkIfSocketConnected = () => {
        setTimeout(() => {
            if(this.props.socket !== undefined) {
                this.getMyInfo();
                this.getAllChats();
                this.saveUnreadMessage();
                this.getMessages();
                myInterval = setInterval(() => {
                    this.getAllChats();
                }, 3000)
                this.detectWindowSizeChange();
                window.addEventListener("resize", this.detectWindowSizeChange);
            }
        }, 1000)
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
        clearInterval(myInterval);
        this.props.selectChatRoom({});
    }

    getMyInfo = () => {
        let userInfo: any = [];
        axios.get(`/api/getUserInfo/${this.state.userID}`)
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
        let { userID } = this.state;
        let myChatsArray:any = [];
        let joinedChatRooms: any = [];
        axios.get(`/api/getAllChats/${userID}`)
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
                        if(!this.props.isMobileAndChatClicked) {
                            if(Object.keys(this.props.selectedChatRoom).length > 0) {
                                this.state.myChatsArray.forEach((chat: any) => {
                                    if(chat.chat_id === this.props.selectedChatRoom.chat_id) {
                                        this.props.selectChatRoom(chat);
                                        return this.props.history.push(`/chatApp/chat/${chat.chat_id}`);
                                    }
                                })
                            } else {
                                this.props.selectChatRoom(this.state.myChatsArray[0]);
                                this.props.history.push(`/chatApp/chat/${this.state.myChatsArray[0].chat_id}`);
                            }
                        } else {
                            if(Object.keys(this.props.selectedChatRoom).length > 0) {
                                this.state.myChatsArray.forEach((chat: any) => {
                                    if(chat.chat_id === this.props.selectedChatRoom.chat_id) {
                                        this.props.selectChatRoom(chat);
                                        return this.props.history.push(`/chatApp/chat/${chat.chat_id}`);
                                    }
                                })
                            }
                        }
                        // console.log(this.props.socket)
                        for(let i = 0; i < this.state.joinedChatRooms.length; i++) {
                            this.props.socket.emit("join", this.state.joinedChatRooms[i]);
                        }
                    })
                }
            })
    }

    fetchChatMessages = (chatRoomID: string) => {
        axios.get(`/api/getMessages/${chatRoomID}`)
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
        this.props.socket.on("get message", (data: any) => {
            if(data.messageText !== undefined) {
                if(this.state.selectedRoomMessages.length > 0) {
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
                        let requestUrl = `/api/saveUnreadMessage`;
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
            } else {
                this.fetchChatMessages(data.chatID);
            }
        })
    }

    getUnreadMessage = () => {
        let { userID } = this.state;
        axios.get(`/api/getUnreadMessage/${userID}`)
            .then((res: any) => {
                this.setState({
                    unReadMessageArray: res.data
                })
            }).catch(err => {
                console.log(err.message)
            })
    }

    onChangeTextMessage = (e: any) => {
        if(Object.keys(e).length > 0) {
            this.setState({
                textMessage: e.currentTarget.value
            })
        } else {
            this.setState({
                textMessage: ""
            })
        }
    }

    sendMessage = (selectedChatRoomID: string, messageText: string) => {
        let { userID } = this.state;
        let data = {
            chatID: selectedChatRoomID,
            sender: userID,
            messageText: messageText
        };
        this.props.socket.emit('send message', data);
        let url = '/api/sendMessage';
        axios.post(url, {
            data
        }).then(() => {
            this.setState({
                textMessage: ""
            }, () => {
                this.props.socket.emit("getOnlineUsers", this.props.selectedChatRoom.chat_id);
            })
        }).catch(err => {
            console.log(err.message)
        })
    }

    // insert into unRead Message table if recipient is offline
    saveUnreadMessage = () => {
        this.props.socket.on("roomSize", (size: any) => {
            if(size === 1) {
                let requestUrl = '/api/saveUnreadMessage';
                let requestData = {
                    recipient: this.props.selectedChatRoom.user_id,
                    chatID: this.props.selectedChatRoom.chat_id,
                    sender: this.state.userID,
                    messageText: ""
                };
                axios.post(requestUrl, requestData)
                    .then(() => {
                        return
                    }).catch(err => {
                        console.log(err.message)
                    })
            }
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
                        onChangeTextMessage={this.onChangeTextMessage}
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
                        sendMessage={this.sendMessage}
                        selectedRoomMessages={this.state.selectedRoomMessages}
                        onChangeTextMessage={this.onChangeTextMessage}
                        textMessage={this.state.textMessage}
                        scrollToBottom={this.scrollToBottom}
                        socket={this.props.socket}
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