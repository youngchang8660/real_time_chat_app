import React from 'react';

class Home extends React.Component<any, {
    userID: any,
    userName: any,
}>{
    constructor(props: any) {
        super(props);
        this.state = {
            userID: localStorage.getItem('user_id'),
            userName: localStorage.getItem('user_name'),

        }
    }

    componentDidMount = () => {
        if(this.state.userID === null || this.state.userID === undefined) {
            this.props.history.push('/signIn')
        }
    }
    
    render() {
        return (
            <div>
                this is home
            </div>
        )
    }
}

export default Home;