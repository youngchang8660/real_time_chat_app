import React from 'react';
import 'rsuite/dist/rsuite.min.css';
import { Sidenav, Nav } from 'rsuite';
import WechatOutlineIcon from '@rsuite/icons/WechatOutline';
import PeoplesIcon from '@rsuite/icons/Peoples';
import GearIcon from '@rsuite/icons/Gear';
import { withRouter } from 'react-router-dom';
import ExitIcon from '@rsuite/icons/Exit';
import NoticeIcon from '@rsuite/icons/Notice';
import {connect} from 'react-redux';
import { toggleLogoutDialog } from '../../redux/actions';
import SignOutDialog from './SignOutDialog';

const styles = {
    width: 240,
    display: 'inline-table',
    marginRight: 10,
    background: 'black'
  };

class InnerSideNav extends React.Component<any, {
    toggleExpanded: boolean,
    activeKey: any,
    signOutDialogOpen: boolean,
    isLogoutClicked: boolean,
}>{
    constructor(props: any) {
        super(props);
        this.state = {
            toggleExpanded: false,
            activeKey: '1',
            signOutDialogOpen: false,
            isLogoutClicked: false
        }
    }

    onChangeSelect = (eventKey: any) => {
        switch(eventKey) {
            case "1":
                this.props.history.push('/chatApp/chat');
                break;
            case "2":
                this.props.history.push('/chatApp/friends');
                break;
            case "3":
                this.props.history.push('/chatApp/notifications');
                break;
            case "4":
                this.props.history.push('/chatApp/profile');
                break;
            case "5":
                this.props.toggleLogoutDialog(true)
                break;   
            default:
                break;
        }
        this.setState({
            activeKey: eventKey
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
                                <Nav.Item onClick={() => {this.onChangeSelect('3')}} icon={<NoticeIcon />}>
                                    Notification
                                </Nav.Item>
                                <Nav.Item onClick={() => {this.onChangeSelect('4')}} icon={<GearIcon />}>
                                    Profile
                                </Nav.Item>
                                <Nav.Item onClick={() => {this.onChangeSelect('5')}} icon={<ExitIcon />}>
                                    Log Out
                                </Nav.Item>
                            </Nav>
                        </Sidenav.Body>
                    </Sidenav>
                </div>
                {this.props.logoutDialogOpen === true && <SignOutDialog />}
            </div>
        )
    }
}

function mapStateToProps(state: any) {
    return {
        logoutDialogOpen: state.logoutDialogOpen
    }
}

function matchDispatchToProps(dispatch: any) {
    return {
        toggleLogoutDialog: () => dispatch(toggleLogoutDialog())
    }
}

export default withRouter(connect(mapStateToProps, matchDispatchToProps)(InnerSideNav));