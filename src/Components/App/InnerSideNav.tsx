import React from 'react';
import 'rsuite/dist/rsuite.min.css';
import { Sidenav, Nav } from 'rsuite';
import WechatOutlineIcon from '@rsuite/icons/WechatOutline';
import PeoplesIcon from '@rsuite/icons/Peoples';
import GearIcon from '@rsuite/icons/Gear';
import { withRouter } from 'react-router-dom';
import ExitIcon from '@rsuite/icons/Exit';

class InnerSideNav extends React.Component<any, {
    toggleExpanded: boolean,
    activeKey: any,
}>{
    constructor(props: any) {
        super(props);
        this.state = {
            toggleExpanded: false,
            activeKey: '1',
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
                this.props.history.push('/chatApp/setting');
                break;
            case "4":
                this.props.history.push('/signIn');
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
            <div className="sideNavBody">
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
                            <Nav.Item style={{fontSize: '20px'}} onClick={() => {this.onChangeSelect('1')}} eventKey="1" icon={<WechatOutlineIcon />}>
                                Chats
                            </Nav.Item>
                            <Nav.Item  onClick={() => {this.onChangeSelect('2')}} eventKey="2" icon={<PeoplesIcon />}>
                                Friends
                            </Nav.Item>
                            <Nav.Item onClick={() => {this.onChangeSelect('3')}} eventKey="3" icon={<GearIcon />}>
                                Setting
                            </Nav.Item>
                            <Nav.Item onClick={() => {this.onChangeSelect('4')}} eventKey="4" icon={<ExitIcon />}>
                                Log Out
                            </Nav.Item>
                        </Nav>
                    </Sidenav.Body>
                </Sidenav>
            </div>
        )
    }
}

export default withRouter(InnerSideNav);