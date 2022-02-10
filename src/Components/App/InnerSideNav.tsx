import React from 'react';
import { RouteComponentProps } from "react-router-dom";
import 'rsuite/dist/rsuite.min.css';
import { Sidenav, Nav } from 'rsuite';
import WechatOutlineIcon from '@rsuite/icons/WechatOutline';
import PeoplesIcon from '@rsuite/icons/Peoples';
import GearIcon from '@rsuite/icons/Gear';
import { withRouter } from 'react-router-dom';
import ExitIcon from '@rsuite/icons/Exit';
import {connect} from 'react-redux';
import { selectChatRoom, toggleMobileAndChatSelected } from '../../redux/actions';
import SignOutDialog from './SignOutDialog';

const endPoint = window.location.href.indexOf('localhost') > 0 ? 'http://localhost:5032' : 'https://165.227.31.155:5032';

interface AppProps {
    disconnectSocket: () => void,
}

interface StateProps {
    selectedChatRoom: any,
    isMobileAndChatClicked: boolean
}

interface DispatchProps {
    selectChatRoom: (chat: any) => void,
    toggleMobileAndChatSelected: (action: boolean) => void
}

interface InnerSideNavState {
    toggleExpanded: boolean,
    activeKey: string,
    signOutDialogOpen: boolean,
    isLogoutClicked: boolean,
    userID: any
}

type Props = AppProps & StateProps & DispatchProps & RouteComponentProps;

class InnerSideNav extends React.Component<
    Props,
    InnerSideNavState
>{
    constructor(props: Props) {
        super(props);
        this.state = {
            toggleExpanded: false,
            activeKey: '1',
            signOutDialogOpen: false,
            isLogoutClicked: false,
            userID: ''
        }
    }

    onChangeSelect = (eventKey: any) => {
        switch(eventKey) {
            case "1":
                if(this.props.isMobileAndChatClicked) {
                    this.props.selectChatRoom({});
                    this.props.history.push('/chatApp/chat');
                    this.props.toggleMobileAndChatSelected(true);
                } else {
                    this.props.history.push(`/chatApp/chat/${this.props.selectedChatRoom.chat_id}`);
                }
                break;
            case "2":
                this.props.disconnectSocket();
                this.props.history.push('/chatApp/friends');
                break;
            case "3":
                this.props.disconnectSocket();
                this.props.history.push('/chatApp/profile');
                break;
            case "4":
                this.props.disconnectSocket();
                this.props.selectChatRoom({});
                this.closeLogOutDialog(true);
                break;   
            default:
                break;
        }
        this.setState({
            activeKey: eventKey
        })
    }

    closeLogOutDialog = (action: boolean) => {
        this.setState({
            signOutDialogOpen: action
        })
    }

    render() {
        let { toggleExpanded } = this.state;
        return (
            <div>
                <div className="sideNavBody" style={this.props.location.pathname === '/login' || this.props.location.pathname === '/signUp' ? {display: 'none'} : {}}>
                    <Sidenav
                        className="sideNav"
                        expanded={toggleExpanded}
                        defaultOpenKeys={['1']}
                    >
                        <Sidenav.Body>
                            <Nav
                                activeKey={this.state.activeKey}
                                onSelect={this.onChangeSelect}
                            >
                                <Nav.Item onClick={() => {this.onChangeSelect('1')}} icon={<WechatOutlineIcon />}>
                                    Chats
                                </Nav.Item>
                                <Nav.Item  onClick={() => {this.onChangeSelect('2')}} icon={<PeoplesIcon />}>
                                    Friends
                                </Nav.Item>
                                <Nav.Item onClick={() => {this.onChangeSelect('3')}} icon={<GearIcon />}>
                                    Profile
                                </Nav.Item>
                                <Nav.Item onClick={() => {this.onChangeSelect('4')}} icon={<ExitIcon />}>
                                    Log Out
                                </Nav.Item>
                            </Nav>
                        </Sidenav.Body>
                    </Sidenav>
                </div>
                <SignOutDialog
                    logoutDialogOpen={this.state.signOutDialogOpen}
                    onRequestCloseModal={this.closeLogOutDialog}
                    props={this.props}
                />
            </div>
        )
    }
}

const mapStateToProps = (state: StateProps) => ({
    selectedChatRoom: state.selectedChatRoom,
    isMobileAndChatClicked: state.isMobileAndChatClicked,
})

const matchDispatchToProps = (dispatch: any) => ({
    selectChatRoom: (chat: any) => dispatch(selectChatRoom(chat)),
    toggleMobileAndChatSelected: (action: boolean) => dispatch(toggleMobileAndChatSelected(action))
})

export default withRouter(connect(mapStateToProps, matchDispatchToProps)(InnerSideNav));