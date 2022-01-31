import React from 'react';
import {connect} from 'react-redux';
import { selectChatRoom } from '../../redux/actions';
import axios from 'axios';

interface StateProps {
    selectedChatRoom: any,
    isMobileAndChatClicked: boolean
}

interface DispatchProps {
    selectChatRoom: (chat: any) => void
}

interface ChatProps {
    userInfo: any,
    windowWidth: number,
    chatsData: any,
    userID: string,
    history: any,
    getUnreadMessage: () => void,
    unReadMessageArray: Array<any>,
}

interface ChatRoomListStateInterface {
    unReadMessageArray: Array<any>,
    unReadMessageByUsers: Array<any>,
    server: string,
    userID: any,
}

type Props = StateProps & DispatchProps & ChatProps;

class ChatRoomList extends React.Component<
    Props,
    ChatRoomListStateInterface
> {
    constructor(props: Props) {
        super(props);
        this.state = {
            unReadMessageArray: [],
            unReadMessageByUsers: [],
            server: 'http://localhost:5032',
            userID: localStorage.getItem('user_id'),
        }
    }

    componentDidMount = () => {
        setTimeout(() => {
            this.loadDefaultSelectedChatRoom()
        }, 100)
    }

    loadDefaultSelectedChatRoom = () => {
        if(Object.keys(this.props.selectedChatRoom).length !== 0) {
            this.props.history.push(`/chatApp/chat/${this.props.selectedChatRoom.chat_id}`)
        }
    }
    
    componentDidUpdate() {
        if(this.props.chatsData.length > 0 && this.props.unReadMessageArray.length !== this.state.unReadMessageArray.length) {
            let unReadMessageByUsers = new Array();
            this.props.chatsData.map((chat: any) => {
                let obj = { userId: chat.user_id, num: 0 };
                unReadMessageByUsers.push(obj);
            })
            for(let i = 0; i < this.props.unReadMessageArray.length; i++) {
                for(let y = 0; y < unReadMessageByUsers.length; y++) {
                    if(this.props.unReadMessageArray[i].Sender === unReadMessageByUsers[y].userId) {
                        unReadMessageByUsers[y].num += 1;
                        break;
                    }
                }
            }
            this.setState({
                unReadMessageArray: this.props.unReadMessageArray,
                unReadMessageByUsers
            })
        }
    }

    onClickHandleChatRoom = (chat: any) => {
        let chatID = chat.chat_id;
        for(let i = 0; i < this.state.unReadMessageArray.length; i++) {
            if(this.state.unReadMessageArray[i].Chat_id === chatID) {
                let messageId = this.state.unReadMessageArray[i].Unread_Message_id;
                axios.delete(`${this.state.server}/api/removeUnreadMessage/${messageId}`)
                    .then(() => {
                        
                    }).catch(err => {
                        console.log(err.message)
                    })
            }
        }
        this.props.selectChatRoom(chat);
        this.props.history.push(`/chatApp/chat/${chatID}`);
        this.props.getUnreadMessage();
    }

    render() {
        let { windowWidth } = this.props
        return (
            <div>
                <div className={windowWidth > 414 ? "chat-list-container" : "chat-list-container-mobile"}>
                    <div className={windowWidth > 414 ? "chat-list-container-top" : "mobile-chat-list-container-top"}>
                        <div className={windowWidth > 414 ? "chat-list-container-top-text" : "mobile-chat-list-container-top-text"}>
                            Chats
                        </div>
                    </div>
                    <div className={windowWidth > 414 ? "chat-list-container-middle" : "mobile-chat-list-container-middle"}>
                        {this.props.chatsData.map((chat: any) => {
                            let userId = chat.user_id;
                            let numberOfUnreadMessage: number = 0;
                            this.state.unReadMessageByUsers.map((data: any) => {
                                if(data.userId === userId) {
                                    numberOfUnreadMessage = data.num;
                                }
                            })
                            return (
                                <div 
                                    key={Math.random()} 
                                    className={this.props.selectedChatRoom === chat ? "clicked-chat-list-row" : "chat-list-row"}
                                    onClick={() => {this.onClickHandleChatRoom(chat)}}
                                >
                                    <div className="chat-list-picture-name">
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
                                        <h3 className="chat-profile-name">{chat.user_id.charAt(0).toUpperCase() + chat.user_id.slice(1)}</h3>
                                    </div>
                                    <div className="chat-list-unread-message">
                                        {numberOfUnreadMessage > 0 ? (
                                            <div className="chat-unread-message">
                                                {numberOfUnreadMessage}
                                            </div>
                                        ):(
                                            <div></div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={windowWidth > 414 ? "chat-list-container-bottom" : "mobile-chat-list-container-bottom"}>
                        {this.props.userInfo.length > 0 ? (
                            <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                <div>
                                    {this.props.userInfo[0].user_image !== "" ? (
                                        <img 
                                            alt="myProfileImage"
                                            className="chat-my-profile-image"
                                            src={this.props.userInfo[0].user_image}
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
                                    {this.props.userID[0].toUpperCase() + this.props.userID.slice(1)}
                                </div>
                            </div>
                        ):(
                            <div></div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: StateProps) => ({
    selectedChatRoom: state.selectedChatRoom,
    isMobileAndChatClicked: state.isMobileAndChatClicked,
})

const matchDispatchToProps = (dispatch: any) => ({
    selectChatRoom: (chat: any) => dispatch(selectChatRoom(chat))
})

export default connect(mapStateToProps, matchDispatchToProps)(ChatRoomList);