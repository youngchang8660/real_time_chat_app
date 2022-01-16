import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

interface logOutDialogProps {
    logoutDialogOpen: boolean,
    onRequestCloseModal: (action: boolean) => void,
    props: any
}

class SignOutDialog extends React.Component<
    logOutDialogProps
>{
    handleClose = (action: boolean) => {
        if(action) {
            this.props.props.history.push('/login');
        }
        this.props.onRequestCloseModal(false);
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

export default SignOutDialog;