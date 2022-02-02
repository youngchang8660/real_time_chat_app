import React from 'react';
import axios from 'axios';
import moment from 'moment';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dropdown from 'react-bootstrap/Dropdown';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import io from "socket.io-client";

const darkTheme = createTheme({ palette: { mode: 'dark' } });
const socket = io('http://localhost:5032');

interface StateProps {
    selectedChatRoom: any
}

interface PropsInterface {
    windowWidth: number
    userInfo: Array<any>,
    userID: string,
    props: any,
    fetchChatMessages: (chatRoomID: string) => void,
    sendMessage: (selectedChatRoomID: string, messageText: string) => void,
    selectedRoomMessages: Array<any>,
    onChangeTextMessage: (textMessage: string) => void,
    textMessage: string,
    scrollToBottom: () => void,

}

interface ChatRoomStateInterface {
    server: string,
    hoveredSentMessage: any,
    isEditMessageOpen: boolean,
    editMessageInfo: any,
}

type Props = StateProps & PropsInterface;

class ChatRoom extends React.Component<
    Props,
    ChatRoomStateInterface
>{
    constructor(props: Props) {
        super(props);
        this.state = {
            server: 'http://localhost:5032',
            hoveredSentMessage: {},
            isEditMessageOpen: false,
            editMessageInfo: {},
        }
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
        }, () => {
            this.props.scrollToBottom();
        })
    }

    editMessage = (message: any) => {
        let { server } = this.state;
        let data = {
            chatID: message['Chat_id'],
            messageID: message['Message_id'],
            sender: message['Sender'],
            messageText: message['Message_text']
        }
        socket.emit('send message', data);
        let url = `${server}/api/editMessage`;
        axios.put(url, {
            data
        }).then(() => {
            this.setState({
                isEditMessageOpen: false,
                editMessageInfo: {}
            })
        }).catch(err => {
            console.log(err.message)
        })
    }

    deleteMessage = (message: any) => {
        let { server } = this.state;
        let data = {
            chatID: message['Chat_id'],
            messageID: message['Message_id'],
            sender: message['Sender']
        }
        socket.emit('send message', data);
        let url = `${server}/api/deleteMessage`;
        axios.delete(url, {
            data
        }).then(() => {
            this.props.fetchChatMessages(this.props.selectedChatRoom.chat_id);
        }).catch(err => {
            console.log(err.message);
        })
    }

    onClickHandleSubmitMessage = (e: any, action: any, message: any) => {
        let regExp = /[a-zA-Z]/g;
        if(e.keyCode === 13 && regExp.test(e.currentTarget.value)) {
            if(action === 'new') {
                this.props.sendMessage(this.props.selectedChatRoom.chat_id, message);
            } else {
                this.editMessage(message);
            }
        }
    }

    cancelEditMode = () => {
        this.setState({
            isEditMessageOpen: false,
            editMessageInfo: {}
        })
    }

    render() {
        let { windowWidth, userInfo, userID, selectedRoomMessages, selectedChatRoom } = this.props;
        let { hoveredSentMessage } = this.state;
        return(
            <div className={windowWidth > 414 ? "" : "mobile-chat-room-container"}>
                <ThemeProvider theme={darkTheme}>
                        <Box 
                            className={windowWidth > 414 ? "chat-message-container" : ""}
                            sx={{ boxShadow: 3 }}
                        >
                            <div className={windowWidth > 414 ? "chat-message-container-header" : "mobile-chat-message-container-header"}>
                                {windowWidth <= 414 ?
                                (
                                    <div 
                                        className="arrowBackIcon"
                                        onClick={() => {
                                            this.props.props.selectChatRoom({})
                                            this.props.props.history.push('/chatApp/chat')
                                        }}
                                    >
                                        <ArrowBackIosIcon />
                                    </div>
                                ):(
                                    <div></div>
                                )}
                                {windowWidth <= 414 ?
                                (
                                    <img 
                                        className="message-profile-image" 
                                        src={selectedChatRoom['user_image'] !== "" ? selectedChatRoom['user_image'] : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} 
                                        alt="friend-img" />
                                ):(
                                    <div></div>
                                )}
                                <div className={windowWidth > 414 ? "message-container-header-title" : "mobile-message-container-header-title"}>
                                    {selectedChatRoom['user_id']}
                                </div>
                            </div>
                            <div className="chat-message-text-container">
                                {selectedRoomMessages.map((message: any, index: number) => {
                                    let prevDate: any;
                                    let prevDateTime: any;
                                    if(index > 0) {
                                        prevDate = moment(new Date(selectedRoomMessages[index - 1]['Message_Date_Time'])).format('YYYY-MM-DD');
                                        prevDateTime = moment(new Date(selectedRoomMessages[index - 1]['Message_Date_Time'])).format('YYYY-MM-DD hh:mm a');
                                    }
                                    let messageDate = moment(new Date(message.Message_Date_Time)).format('YYYY-MM-DD');
                                    let messageDateTime = moment(new Date(message.Message_Date_Time)).format('YYYY-MM-DD hh:mm a');
                                    let messageTime = moment(new Date(message.Message_Date_Time)).format('hh:mm a');
                                    if(message.Sender === userID && userInfo.length > 0) {
                                        let userImage = userInfo[0]['user_image'] !== "" ? userInfo[0]['user_image'] : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                                        return (
                                            <div key={Math.random()}>
                                                {messageDate !== prevDate ?
                                                (
                                                    <div className="dateRow" key={Math.random()}>
                                                        {moment(new Date(message.Message_Date_Time)).format('dddd MMMM D YYYY')}
                                                    </div>
                                                ):(
                                                    <div key={Math.random()}></div>
                                                )}
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
                                                        {prevDateTime === undefined ?
                                                        (
                                                            <div>{messageTime}</div>
                                                        ): prevDateTime !== messageDateTime ? (
                                                            <div>{messageTime}</div>
                                                        ):(
                                                            <div></div>
                                                        )}
                                                    </div>
                                                    {this.state.isEditMessageOpen && this.state.editMessageInfo['Message_id'] === message['Message_id'] ?
                                                    (
                                                        <div className="editSentMessage">
                                                            <textarea 
                                                                maxLength={2000}
                                                                className="edit-chat-message-input" 
                                                                defaultValue={this.state.editMessageInfo['Message_text']}
                                                                onKeyDown={(e) => {this.onClickHandleSubmitMessage(e, 'edit', message)}}
                                                                onChange={(e) => {message['Message_text'] = e.currentTarget.value}}
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
                                                            <img
                                                                className={windowWidth > 414 ? "message-profile-image" : "mobile-message-profile-image"}
                                                                src={userImage} 
                                                                alt="message profile" 
                                                            />
                                                        ):
                                                        selectedRoomMessages[index - 1]['Sender'] !== selectedRoomMessages[index]['Sender'] ?
                                                        (
                                                            <img 
                                                                className={windowWidth > 414 ? "message-profile-image" : "mobile-message-profile-image"} 
                                                                src={userImage} 
                                                                alt="message profile" 
                                                            />
                                                        ):(
                                                            <div 
                                                                className={windowWidth > 414 ? "empty-message-profile-image" : "mobile-message-profile-image"}>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )
                                    } else {
                                        let friendsImg = selectedChatRoom['user_image'] !== "" ? selectedChatRoom['user_image'] : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                                        return (
                                            <div key={Math.random()}>
                                                {messageDate !== prevDate ?
                                                (
                                                    <div className="dateRow" key={Math.random()}>
                                                        {moment(new Date(message.Message_Date_Time)).format('dddd MMMM D YYYY')}
                                                    </div>
                                                ):(
                                                    <div key={Math.random()}></div>
                                                )}
                                                <div className="received-message-row" key={Math.random()}>
                                                    {index === 0 ?
                                                        (
                                                            <img 
                                                                className={windowWidth > 414 ? "message-profile-image" : "mobile-message-profile-image"}
                                                                src={friendsImg} 
                                                                alt="message profile" 
                                                            />
                                                        ):
                                                            selectedRoomMessages[index - 1]['Sender'] !== selectedRoomMessages[index]['Sender'] ?
                                                        (
                                                            <img 
                                                                className={windowWidth > 414 ? "message-profile-image" : "mobile-message-profile-image"} 
                                                                src={friendsImg} 
                                                                alt="message profile" 
                                                            />
                                                        ):(
                                                            <div 
                                                                className={windowWidth > 414 ? "empty-message-profile-image" : "mobile-message-profile-image"}>
                                                            </div>
                                                        )
                                                    }
                                                    <div className="receivedMessage">
                                                        {message.Message_text}
                                                    </div>
                                                    <div className="messageTime">
                                                        {prevDateTime === undefined ?
                                                        (
                                                            <div>{messageTime}</div>
                                                        ): prevDateTime !== messageDateTime ? (
                                                            <div>{messageTime}</div>
                                                        ):(
                                                            <div></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                            <div className={windowWidth > 414 ? "chat-message-input-container" : "mobile-chat-message-input-container"}>
                                <textarea
                                    rows={2}
                                    placeholder={`Message @${selectedChatRoom['user_id']}`} 
                                    value={this.props.textMessage}
                                    className="chat-message-input"
                                    onKeyDown={(e) => {this.onClickHandleSubmitMessage(e, 'new', this.props.textMessage)}}
                                    onChange={(e: any) => {this.props.onChangeTextMessage(e)}}
                                />
                            </div>
                        </Box>
                    </ThemeProvider>
            </div>
        )
    }
}

const mapStateToProps = (state: StateProps) => ({
    selectedChatRoom: state.selectedChatRoom 
})

export default connect(mapStateToProps)(ChatRoom);