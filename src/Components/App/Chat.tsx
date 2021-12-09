import React from 'react';
import axios from 'axios';
import moment from 'moment';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dropdown from 'react-bootstrap/Dropdown';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

class Chat extends React.Component<any, {
    windowWidth: any,
    server: any,
    userID: any,
    userInfo: Array<any>,
    myChatsArray: Array<any>,
    clickedChat: any,
    allMessages: Array<any>,
    receivedMessages: Array<any>,
    sentMessages: Array<any>,
    hoveredSentMessage: any,
    editMessageInfo: any,
    isEditMessageOpen: boolean,
}>{
    constructor(props: any) {
        super(props);
        let windowWidth = document.body.clientWidth;
        this.state = {
            windowWidth: windowWidth,
            server: 'http://localhost:5032',
            userID: localStorage.getItem('user_id'),
            userInfo: [],
            myChatsArray: [],
            clickedChat: {},
            allMessages: [],
            receivedMessages: [],
            sentMessages: [],
            hoveredSentMessage: {},
            editMessageInfo: {},
            isEditMessageOpen: false,
        }
    }

    componentDidMount = () => {
        if(this.state.userID === null || this.state.userID === undefined) {
            return this.props.history.push('/login')
        }
        this.getMyInfo();
        this.getAllChats();
        window.addEventListener("resize", this.detectWindowSizeChange);
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
        let path = this.props.location.pathname;
        const lastItem = path.substring(path.lastIndexOf('/') + 1)
        let clickedChat = {};
        axios.get(`${server}/api/getAllChats/${userID}`)
            .then((res: any) => {
                myChatsArray = res.data;
                for(let i = 0; i < myChatsArray.length; i++) {
                    if(myChatsArray[i].user_image !== null) {
                        myChatsArray[i].user_image = this.convertBufferArrayToDataURL(myChatsArray[i].user_image.data);
                    } else {
                        myChatsArray[i].user_image = "";
                    }
                    if(myChatsArray[i].chat_id === lastItem) {
                        clickedChat = myChatsArray[i];
                    }
                }
                this.setState({
                    myChatsArray,
                    clickedChat
                }, () => {
                    this.fetchChatMessages();
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

    onClickChatHandle = (data: any) => {
        let chatID = data.chat_id;
        this.setState({
            clickedChat: data,
            allMessages: [],
            receivedMessages: [],
            sentMessages: []
        }, () => {
            this.props.history.push(`/chatApp/chat/${chatID}`);
            this.fetchChatMessages();
        })
    }

    fetchChatMessages = () => {
        let { userID, clickedChat } = this.state;
        let chatID = clickedChat['chat_id'];
        let allMessages: any = [];
        let sentMessages: any = [];
        let receivedMessages: any = [];
        axios.get(`${this.state.server}/api/getMessages/${chatID}`)
        .then((res: any) => {
            allMessages = res.data;
            console.log(allMessages)
            res.data.map((message: any) => {
                if(message['Sender'] === userID) {
                    return sentMessages.push(message);
                } else {
                    return receivedMessages.push(message);
                }
            })
            this.setState({
                allMessages,
                sentMessages,
                receivedMessages
            })
        })
    }

    mouseOverSentMessage = (message: any) => {
        if(message !== this.state.hoveredSentMessage) {
            this.setState({
                hoveredSentMessage: message
            })
        }
    }

    mouseOutSentMessage = () => {
        this.setState({ hoveredSentMessage: {} })
    }

    openEditMessageTextarea = (message: any) => {
        this.setState({
            editMessageInfo: message,
            isEditMessageOpen: true,
        })
    }

    editMessage = (message: any) => {
        let { server } = this.state;
        // console.log(clickedChat)
        let data = {
            chatID: message['Chat_id'],
            messageID: message['Message_id'],
            sender: message['Sender'],
            messageText: message['Message_text']
        }
        let url = `${server}/api/editMessage`;
        axios.put(url, {
            data
        }).then(() => {
            this.setState({
                isEditMessageOpen: false,
                editMessageInfo: {}
            }, () => {
                this.fetchChatMessages();
            })
        }).catch(err => {
            console.log('failed to update message')
        })
    }

    cancelEditMode = () => {
        this.setState({
            isEditMessageOpen: false,
            editMessageInfo: {}
        })
    }

    deleteMessage = (message: any) => {
        let { server } = this.state;
        let url = `${server}/api/deleteMessage`;
        axios.delete(url, {
            data: {
                chatID: message['Chat_id'],
                messageID: message['Message_id'],
                sender: message['Sender']
            }
        })
        .then(() => {
            this.fetchChatMessages();
        }).catch(err => {
            console.log('failed to delete the message');
        })
    }

    textAreaAutoGrow = () => {
        let textarea = document.getElementsByClassName('chat-message-input') as HTMLCollectionOf<HTMLElement>;
        let heightLimit = 200;
        textarea[0].style.height = "";
        textarea[0].style.height = Math.min(textarea[0].scrollHeight, heightLimit) + "px";
    }
    
    render() {
        let { myChatsArray, clickedChat, userInfo, windowWidth, userID, allMessages, hoveredSentMessage } = this.state;
        return (
            <div className="chat-page-container">
                <div className={windowWidth > 414 ? "chat-list-container" : "chat-list-container-mobile"}>
                    <div className="chat-list-container-top">
                        <div className="chat-list-container-top-text">
                            Chats
                        </div>
                    </div>
                    <div className="chat-list-container-middle">
                        {myChatsArray.map(chat => {
                            return (
                                <div 
                                    key={Math.random()} 
                                    className={clickedChat === chat ? "clicked-chat-list-row" : "chat-list-row"}
                                    onClick={() => {this.onClickChatHandle(chat)}}
                                >
                                    {chat.user_image !== "" ? (
                                        <img 
                                            alt="userProfileImage"
                                            className="chat-profile-image"
                                            src={chat.user_image} 
                                            style={{backgroundColor: 'white'}}
                                        />
                                    ):(
                                        <img
                                            alt="userProfileImage" 
                                            className="chat-profile-image" 
                                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                            style={{backgroundColor: 'white'}}
                                        />
                                    )}
                                    <h3 className="chat-profile-name">{chat.first_name.charAt(0).toUpperCase() + chat.first_name.slice(1)}</h3>
                                </div>
                            )
                        })}
                    </div>
                    <div className="chat-list-container-bottom">
                        {userInfo.length > 0 ? (
                            <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                <div>
                                    {userInfo[0].user_image !== "" ? (
                                        <img 
                                            alt="myProfileImage"
                                            className="chat-my-profile-image"
                                            src={userInfo[0].user_image}
                                        />
                                    ):(
                                        <img
                                            alt="myProfileImage" 
                                            className="chat-profile-image" 
                                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                            style={{backgroundColor: 'white'}}
                                        />
                                    )}
                                </div>
                                <div className="chat-my-profile-id">
                                    {userID[0].toUpperCase() + userID.slice(1)}
                                </div>
                            </div>
                        ):(
                            <div></div>
                        )}
                    </div>
                </div>
                {Object.keys(clickedChat).length !== 0 ?
                (
                    <ThemeProvider theme={darkTheme}>
                        <Box 
                            className={windowWidth > 414 ? "chat-message-container" : ""}
                            sx={{ boxShadow: 3 }}
                        >
                            <div className="chat-message-container-header">
                                <div className="message-container-header-title">
                                    {clickedChat['user_id']}
                                </div>
                            </div>
                            <div className="chat-message-text-container">
                                {allMessages.map((message: any, index: number) => {
                                    let messageDateTime = moment(new Date(message.Message_Date_Time)).format('hh:mm a');
                                    if(message.Sender === userID) {
                                        return (
                                            <div 
                                                className="sent-message-row" 
                                                key={Math.random()} 
                                                onMouseOver={() => {this.mouseOverSentMessage(message)}}
                                                onMouseLeave={this.mouseOutSentMessage}
                                            >
                                                {message['Message_id'] === hoveredSentMessage['Message_id'] 
                                                    && Object.keys(hoveredSentMessage).length !== 0 ?
                                                (
                                                    <div className="message-more-container">
                                                        <Dropdown>
                                                            <Dropdown.Toggle
                                                                bsPrefix="p-0"
                                                                style={{backgroundColor: '#36393e', border: 'none'}}
                                                            >
                                                                <MoreHorizIcon
                                                                    fontSize="large"
                                                                    style={{cursor: 'pointer'}}
                                                                />
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu style={{backgroundColor: '#18191c'}}>
                                                                <Dropdown.Item
                                                                    className="message-edit"
                                                                    style={{color: '#b4b6b9', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', width: '200px', display: 'flex', justifyContent: 'space-between'}}
                                                                    onClick={() => {this.openEditMessageTextarea(message)}}
                                                                >
                                                                    <span>Edit Message</span>
                                                                    <EditIcon />
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    className="message-delete"
                                                                    style={{color: '#ed4245', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', width: '200px', display: 'flex', justifyContent: 'space-between'}}
                                                                    onClick={() => this.deleteMessage(message)}
                                                                >
                                                                    <span>Delete Message</span>
                                                                    <DeleteIcon />
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                ):(
                                                    <div className="message-more-container"></div>
                                                )}
                                                <div className="messageTime">
                                                    {messageDateTime}
                                                </div>
                                                {this.state.isEditMessageOpen && this.state.editMessageInfo['Message_id'] === message['Message_id'] ?
                                                (
                                                    <div className="editSentMessage">
                                                        <textarea 
                                                            maxLength={2000}
                                                            className="edit-chat-message-input" 
                                                            onInput={this.textAreaAutoGrow}
                                                            defaultValue={this.state.editMessageInfo['Message_text']}
                                                            // onChange={(e) => {this.onChangeEditMessageText(e)}}
                                                            onChange={(e) => {this.state.editMessageInfo['Message_text'] = e.currentTarget.value}}
                                                        />
                                                        <div>
                                                            <Button 
                                                                variant="text"
                                                                size="small"
                                                                style={{marginRight: '1em', backgroundColor: '#1785f2', fontWeight: 'bold', color: 'white'}}
                                                                onClick={() => this.editMessage(message)}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button 
                                                                variant="text" 
                                                                size="small"
                                                                style={{backgroundColor: '#e60b2f', fontWeight: 'bold', color: 'white'}}
                                                                onClick={this.cancelEditMode}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ):(
                                                    <div className="sentMessage">
                                                        {message.Message_text}
                                                    </div>
                                                )}
                                                {index === 0 ?
                                                    (
                                                        <img className="message-profile-image" src={userInfo[0].user_image} alt="message profile" />
                                                    ):
                                                    allMessages[index - 1]['Sender'] !== allMessages[index]['Sender'] ?
                                                    (
                                                        <img className="message-profile-image" src={userInfo[0].user_image} alt="message profile" />
                                                    ):(
                                                        <div className="empty-message-profile-image"></div>
                                                    )
                                                }
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div className="received-message-row" key={Math.random()}>
                                                {index === 0 ?
                                                    (
                                                        <img className="message-profile-image" src={clickedChat['user_image']} alt="message profile" />
                                                    ):
                                                    allMessages[index - 1]['Sender'] !== allMessages[index]['Sender'] ?
                                                    (
                                                        <img className="message-profile-image" src={clickedChat['user_image']} alt="message profile" />
                                                    ):(
                                                        <div className="empty-message-profile-image"></div>
                                                    )
                                                }
                                                <div className="receivedMessage">
                                                    {message.Message_text}
                                                </div>
                                                <div className="messageTime">
                                                    {messageDateTime}
                                                </div>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                            <div className="chat-message-input-container">
                                <textarea
                                    placeholder={`Message @${clickedChat['user_id']}`} 
                                    className="chat-message-input" 
                                    onInput={this.textAreaAutoGrow}
                                />
                            </div>
                        </Box>
                    </ThemeProvider>
                ):(
                    <div></div>
                )}
            </div>
        )
    }
}

export default Chat;