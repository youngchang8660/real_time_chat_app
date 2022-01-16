import React from 'react';
import {connect} from 'react-redux';
import { selectChatRoom } from '../../redux/actions';

interface StateProps {
    selectedChatRoom: any
}

interface DispatchProps {
    selectChatRoom: (chat: any) => void
}

interface ChatProps {
    userInfo: any,
    windowWidth: number,
    chatsData: any,
    userID: string,
    history: any
}

type Props = StateProps & DispatchProps & ChatProps;

class ChatRoomList extends React.Component<
    Props
> {
    componentDidMount = () => {
        setTimeout(() => {
            this.loadDefaultSelectedChatRoom()
        }, 1000)
    }

    loadDefaultSelectedChatRoom = () => {
        let urlLastFragment = window.location.pathname.split("/").pop();
        if(urlLastFragment !== undefined) {
            if(urlLastFragment.length === 36) {
                for(let i = 0; i < this.props.chatsData.length; i++) {
                    if(this.props.chatsData[i].chat_id === urlLastFragment) {
                        this.props.selectChatRoom(this.props.chatsData[i]);
                    }
                }
            } else {
                this.props.selectChatRoom({});
            }
        }
    }

    componentWillUnmount = () => {
        this.loadDefaultSelectedChatRoom()
    }

    onClickHandleChatRoom = (chat: any) => {
        let chatID = chat.chat_id;
        this.props.selectChatRoom(chat)
        this.props.history.push(`/chatApp/chat/${chatID}`);
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
                            return (
                                <div 
                                    key={Math.random()} 
                                    className={this.props.selectedChatRoom === chat ? "clicked-chat-list-row" : "chat-list-row"}
                                    onClick={() => {this.onClickHandleChatRoom(chat)}}
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
    selectedChatRoom: state.selectedChatRoom
})

const matchDispatchToProps = (dispatch: any) => ({
    selectChatRoom: (chat: any) => dispatch(selectChatRoom(chat))
})

export default connect(mapStateToProps, matchDispatchToProps)(ChatRoomList);