import React from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

class MessageSnackbar extends React.Component<any, {

}>{
    constructor(props: any) {
        super(props)
        this.state = {

        }
    }

    render() {
        return (
            <Stack>
                <Snackbar
                    open={this.props.isOpen}
                    autoHideDuration={this.props.autoHideDuration !== undefined ? this.props.autoHideDuration : 3000}
                    onClose={this.props.closeMessage}
                    anchorOrigin={{vertical:'top', horizontal: 'right'}}
                >
                    <MuiAlert 
                        severity={this.props.messageStatus === 200 ? "success" : "error"}
                        onClose={this.props.closeMessage}
                    >
                        {this.props.message}
                    </MuiAlert>
                </Snackbar>
            </Stack>
        )
    }
}

export default MessageSnackbar;