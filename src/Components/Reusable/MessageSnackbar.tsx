import React from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

interface Props {
    message: string,
    isOpen: boolean,
    messageStatus: number,
    closeMessage: () => void,
    autoHideDuration?: number
}

interface ErrorMessageState {
    errorMessage: string,
    isModalOpen: boolean,
    autoHideModalDuration: number,
    errorMessageStatus: number
}

class MessageSnackbar extends React.Component<
    Props,
    ErrorMessageState
>{
    constructor(props: Props) {
        super(props)
        this.state = {
            errorMessage: "",
            isModalOpen: false,
            autoHideModalDuration: -1,
            errorMessageStatus: -1
        }
    }

    componentDidUpdate(prevProps: any) {
        let errorMessage: string;
        let isModalOpen: boolean;
        let autoHideModalDuration: number;
        let errorMessageStatus: number;

        if(JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            let { message, isOpen, messageStatus } = this.props;
            errorMessage = message;
            isModalOpen = isOpen;
            errorMessageStatus = messageStatus;
            autoHideModalDuration = this.props.autoHideDuration !== undefined ? this.props.autoHideDuration : 3000;

            this.setState({
                errorMessage,
                isModalOpen,
                autoHideModalDuration,
                errorMessageStatus
            })
        }
    }

    render() {
        let { errorMessage, isModalOpen, autoHideModalDuration, errorMessageStatus } = this.state;
        return (
            <Stack>
                <Snackbar
                    open={isModalOpen}
                    autoHideDuration={autoHideModalDuration}
                    onClose={this.props.closeMessage}
                    anchorOrigin={{vertical:'top', horizontal: 'right'}}
                >
                    <MuiAlert 
                        severity={errorMessageStatus === 200 ? "success" : "error"}
                        onClose={this.props.closeMessage}
                    >
                        {errorMessage}
                    </MuiAlert>
                </Snackbar>
            </Stack>
        )
    }
}

export default MessageSnackbar;