import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { toggleLogoutDialog } from '../../redux/actions';

export interface logOutDialog {
    logoutDialogOpen: boolean
}

class SignOutDialog extends React.Component<any>{

    handleClose = (action: boolean) => {
        if(action) {
            this.props.toggleLogoutDialog(false);
            this.props.history.push('/login');
        } else {
            this.props.toggleLogoutDialog(false)
        }
    }

    render() {
        return(
            <div>
                <Dialog
                    open={this.props.logoutDialogOpen}
                    onClose={() => {this.handleClose(false)}}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                    Would you like to log out?
                    </DialogTitle>
                    <DialogActions>
                    <Button onClick={() => {this.handleClose(false)}}>No</Button>
                    <Button onClick={() => {this.handleClose(true)}} autoFocus>
                        Yes
                    </Button>
                    </DialogActions>
                </Dialog>
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
        toggleLogoutDialog: (signOutDialogOpen: any) => dispatch(toggleLogoutDialog(signOutDialogOpen))
    }
}

export default withRouter(connect(mapStateToProps, matchDispatchToProps)(SignOutDialog));