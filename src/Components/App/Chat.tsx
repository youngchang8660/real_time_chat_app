import React from 'react';
import axios from 'axios';

class Home extends React.Component<any, {
    windowWidth: any,
    server: any,
    userID: any,
    userInfo: Array<any>,
    myChatsArray: Array<any>,
    clickedChat: any,
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
        let { server, userID, userInfo } = this.state;
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
            clickedChat: data
        }, () => {
            this.props.history.push(`/chatApp/chat/${chatID}`);
        })
    }
    
    render() {
        let { myChatsArray, clickedChat, userInfo, windowWidth, userID } = this.state;
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
                
            </div>
        )
    }
}

export default Home;