import axios from "axios";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import TextsmsIcon from '@mui/icons-material/Textsms';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import qs from 'qs';
import { connect } from 'react-redux';
import { selectChatRoom } from '../../redux/actions';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface StateProps {
    selectedChatRoom: any,
    isMobileAndChatClicked: boolean
}

interface DispatchProps {
    selectChatRoom: (chat: any) => void,
    toggleMobileAndChatSelected: (isToggle: boolean) => void
}

interface FriendsDataInterface {
    first_name: string,
    last_name: string,
    user_id: string,
    user_image: string,
    user_unique_id: string
}

interface PendingRequestDataInterface {
    email: string,
    first_name: string,
    last_name: string,
    request_id: number,
    status: number,
    user_id: string,
    user_image: string,
    user_unique_id: string
}

interface SearchedUserDataInterface {
    first_name: string,
    last_name: string,
    status: any,
    user_id: string,
    user_image: string,
    user_unique_id: string
}

interface FriendsListState {
    currentTab: string,
    friendUserID: string,
    userID: any,
    recipient: string,
    friendsData: Array<FriendsDataInterface>,
    pendingRequestsData: Array<PendingRequestDataInterface>,
    searchedUsersData: Array<SearchedUserDataInterface>,
    isStartConversationModalOpen: boolean,
    messageText: string,
}

type Props = RouteComponentProps & StateProps & DispatchProps

class FriendsList extends React.Component<
    Props,
    FriendsListState
>{
    constructor(props: Props) {
        super(props);
        this.state = {
            currentTab: 'All',
            friendUserID: '',
            userID: localStorage.getItem('user_id'),
            recipient: "",
            friendsData: [],
            pendingRequestsData: [],
            searchedUsersData: [],
            isStartConversationModalOpen: false,
            messageText: ""
        }
    }

    componentDidMount = () => {
        this.getAllMyFriends();
    }

    convertBufferArrayToDataURL = (arrayData: any, type = "image/png") => {
        const arrayBuffer = new Uint8Array(arrayData);
        const blob = new Blob([arrayBuffer], { type: type });
        const urlCreator = window.URL || (window as any).webkitURL;
        const fileUrl = urlCreator.createObjectURL(blob);
        return fileUrl;
    };

    onClickCurrentTab = (action: any) => {
        let currentTab = "";
        switch(action) {
            case 'All':
                currentTab = 'All';
                this.setState({
                    searchedUsersData: []
                }, () => {
                    this.getAllMyFriends();
                })
                break;
            case 'Pending':
                currentTab = 'Pending';
                this.setState({
                    searchedUsersData: []
                }, () => {
                    this.getAllPendingRequests()
                })
                break;
            case 'New':
                currentTab = 'New';
                break;
            default:
                break;
        }
        this.setState({
            currentTab
        })
    }

    /*********************** All Friends Tab *******************/

    getAllMyFriends = () => {
        let { userID } = this.state;
        let friendsData: any = [];
        axios.get(`/api/getMyFriends/${userID}`)
            .then(res => {
                friendsData = res.data;
                for(let i = 0; i < friendsData.length; i++) {
                    if(friendsData[i].user_image !== null) {
                        friendsData[i].user_image = this.convertBufferArrayToDataURL(friendsData[i].user_image.data);
                    } else {
                        friendsData[i].user_image = "";
                    }
                }
                this.setState({
                    friendsData
                })
            }).catch(err => {
                console.log(err.message)
            })
    }

    onClickChatIcon = (data: any) => {
        let { userID } = this.state;
        let userOne = userID;
        let userTwo = data.user_id;
        axios.get(`/api/checkChatExistence/${userOne}/${userTwo}`)
            .then((res: any) => {
                if(res.data.length > 0) {
                    this.props.selectChatRoom(res.data[0]);
                    this.props.history.push('/chatApp/chat');
                } else {
                    this.setState({
                        isStartConversationModalOpen: true,
                        recipient: data.user_id
                    })
                }
            }).catch(err => {
                console.log(err.message)
            })
    }

    /*********************** Pending Tab ***********************/

    getAllPendingRequests = () => {
        let { userID } = this.state;
        let pendingRequestsData: any = [];
        axios.get(`/api/getPendingRequests/${userID}`)
            .then((res: any) => {
                pendingRequestsData = res.data.filter((d: any) => d.status === 0)
                for(let i = 0; i < pendingRequestsData.length; i++) {
                    if(pendingRequestsData[i].user_image !== null) {
                        pendingRequestsData[i].user_image = this.convertBufferArrayToDataURL(pendingRequestsData[i].user_image.data);
                    } else {
                        pendingRequestsData[i].user_image = "";
                    }
                }
                this.setState({
                    pendingRequestsData
                })
            }).catch(err => {
                console.log(err.message)
            })
    }

    onClickAcceptOrReject = (data:any, action:any) => {
        let requestID = data.request_id;
        let status = action === 'Accept' ? 1 : 2;
        let insertData = {
            requestID,
            status
        };
        axios.put(`/api/acceptOrRejectRequest`, insertData)
            .then(() => {
                this.getAllPendingRequests();
            })
    }

    /*********************** New Tab ***************************/

    onChangeFriendSearch = (e: any) => {
        this.setState({ friendUserID: e.currentTarget.value })
    }

    onClickFriendSearchByID = () => {
        let { userID, friendUserID } = this.state;
        let searchedUsersData: any = [];
        if(friendUserID.length > 0) {
            axios.get(`/api/getUserByID/${userID}/${friendUserID}`)
            .then(res => {
                searchedUsersData = res.data;
                for(let i = 0; i < searchedUsersData.length; i++) {
                    if(searchedUsersData[i].user_image !== null) {
                        searchedUsersData[i].user_image = this.convertBufferArrayToDataURL(searchedUsersData[i].user_image.data)
                    } else {
                        searchedUsersData[i].user_image = ""
                    }
                }
                this.setState({
                    searchedUsersData
                })
            }).catch(err => {
                console.log(err.message)
            })
        } else {
            this.setState({
                searchedUsersData: []
            })
        }
    }

    onClickSendRequest = (data: any) => {
        let { userID } = this.state;
        let insertData = {
            sender: userID,
            receiver: data.user_id,
            status: 0
        }
        axios.post(`/api/sendFriendRequest`, insertData)
            .then(() => {
                this.onClickFriendSearchByID();
            }).catch(err => {
                if(err.response.status === 500) {
                    console.log(err.response.data)
                }
            })
    }

    onClickCancelRequest = (data: any) => {
        let userID = this.state.userID;
        let friendID = data.user_id;
        axios.delete(`/api/cancelFriendRequest/${userID}/${friendID}`)
            .then(res => {
                this.onClickFriendSearchByID();
            }).catch(err => {
                if(err.response.status === 500) {
                    console.log(err.response.data)
                }
            })
    }

    closeStartConversationModal = () => {
        this.setState({
            isStartConversationModalOpen: false
        })
    }

    onChangeMessageText = (e: any) => {
        this.setState({
            messageText: e.currentTarget.value
        })
    }

    createNewChatRoom = () => {
        let { userID, recipient, messageText } = this.state;
        let url = '/api/createNewChat';
        let data = {
            'userOne': userID,
            'userTwo': recipient,
            'messageText': messageText
        };
        const options: any = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data),
            url,
        }
        axios(options)
            .then((res: any) => {
                this.saveUnreadMessage(res.data[0]);
            }).catch(err => {
                console.log(err.message)
            })
    }

    saveUnreadMessage = (chatData: any) => {
        let requestUrl = '/api/saveUnreadMessage';
        let requestData = {
            recipient: this.state.recipient,
            chatID: chatData.chat_id,
            sender: this.state.userID,
            messageText: this.state.messageText
        };
        axios.post(requestUrl, requestData)
            .then(() => {
                this.props.history.push('/chatApp/chat');
                this.props.selectChatRoom(chatData);
            }).catch(err => {
                console.log(err.message)
            })
    }

    render() {
        let { currentTab, friendsData, pendingRequestsData, searchedUsersData, isStartConversationModalOpen } = this.state;
        return (
            <div className="container" style={{overflow: 'hidden', height: 'auto'}}>
                <div className="friendsTopNav">
                    <div className="friendsTopNavButtonContainer">
                        <button className="friendsTopNavButton" onClick={() => this.onClickCurrentTab('All')}>All</button>
                    </div> 
                    <div className="friendsTopNavButtonContainer">
                        <button className="friendsTopNavButton" onClick={() => this.onClickCurrentTab('Pending')}>Pending</button>
                    </div>
                    <div className="friendsTopNavButtonContainer">
                        <button className="friendsTopNavButton" onClick={() => this.onClickCurrentTab('New')}>New</button>
                    </div>
                </div>
                {currentTab === 'New' ? (
                    <div id='add'>
                        <input 
                            id="friend-search-bar"
                            placeholder="Search for friends"
                            onChange={(e) => {this.onChangeFriendSearch(e)}}
                            style={{width: '90%'}}
                        />
                        <button className="friend-search-button" type="submit">
                            <SearchIcon onClick={this.onClickFriendSearchByID} />
                        </button>
                    </div>
                ): currentTab === 'All' ?(
                    <div id="allHeader">
                        All Friends - {friendsData.length}
                    </div>
                ):(
                    <></>
                )}
                {currentTab === 'All' ? (
                    <div className="friendsBody">
                        {friendsData.map(user => {
                            return (
                                <div className="friendRow" key={Math.random()}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        {user.user_image !== "" ? (
                                            <img
                                                alt="userProfileImage" 
                                                className="friend-profile-image" 
                                                src={user.user_image}
                                            />
                                        ):(
                                            <img
                                                alt="userProfileImage" 
                                                className="friend-profile-image" 
                                                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                            />
                                        )}
                                        <h1 className="friend-user-id">{user.user_id.charAt(0).toUpperCase() + user.user_id.slice(1)}</h1>
                                    </div>
                                    <div style={{display: 'flex'}}>
                                        <div 
                                            className="friend-chat-icon-container"
                                            onClick={() => this.onClickChatIcon(user)}
                                        >
                                            <TextsmsIcon />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : currentTab === 'Pending' ? (
                    <div className="friendsBody">
                        {pendingRequestsData.map(user => {
                            return (
                                <div className="friendRow" key={Math.random()}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        {user.user_image !== "" ? (
                                            <img
                                                alt="userProfileImage" 
                                                className="friend-profile-image" 
                                                src={user.user_image}
                                            />
                                        ):(
                                            <img
                                                alt="userProfileImage" 
                                                className="friend-profile-image" 
                                                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                            />
                                        )}
                                        <h1 className="friend-user-id">{user.user_id}</h1>
                                    </div>
                                    <div style={{display: 'flex'}}>
                                        <div className="friend-accept-button-container">
                                            <button 
                                                className="friend-accept-button"
                                                onClick={() => this.onClickAcceptOrReject(user, 'Accept')}
                                            >
                                                Accept
                                            </button>
                                        </div>
                                        <div className="friend-reject-button-container">
                                            <button 
                                                className="friend-reject-button"
                                                onClick={() => this.onClickAcceptOrReject(user, 'Reject')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : currentTab === 'New' ? (
                    <div className="friendsBody">
                        {searchedUsersData.map(user => {
                            return (
                                <div className="friendRow" key={Math.random()}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        {user.user_image !== "" ? (
                                            <img
                                                alt="userProfileImage" 
                                                className="friend-profile-image" 
                                                src={user.user_image}
                                            />
                                        ):(
                                            <img
                                                alt="userProfileImage" 
                                                className="friend-profile-image" 
                                                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                            />
                                        )}
                                        <h1 className="friend-user-id">{user.user_id}</h1>
                                    </div>
                                    <div style={{display: 'flex'}}>
                                        <div className="friend-add-button-container">
                                            {user.status !== 0 ? (
                                                <button className="friend-add-button" onClick={() => {this.onClickSendRequest(user)}}>Add</button>
                                            ):(
                                                <button className="friend-request-sent" onClick={() => {this.onClickCancelRequest(user)}}>Sent</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ):(
                    <div></div>
                )}
                <Modal
                    open={isStartConversationModalOpen}
                    onClose={this.closeStartConversationModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2" style={{color: 'black'}}>
                            Start your new conservation
                        </Typography>
                        <input 
                            style={{width: '100%', color: 'black', border: '1px solid gray'}} 
                            onChange={(e) => {this.onChangeMessageText(e)}} 
                        />
                        <Button
                            onClick={this.createNewChatRoom}
                        >
                            Send
                        </Button>
                    </Box>                                                      
                </Modal>
            </div>
        )
    }
}

function mapStateToProps(state: any) {
    return {
        selectedChatRoom: state.selectedChatRoom,
    }
}

function matchDispatchToProps(dispatch: any) {
    return {
        selectChatRoom: (chat: any) => dispatch(selectChatRoom(chat)),
    }
}

export default connect(mapStateToProps, matchDispatchToProps)(FriendsList);