import React from 'react';

class Home extends React.Component<any, {
    userID: any,
    firstName: any,
    lastName: any,
    email: any,
}>{
    constructor(props: any) {
        super(props);
        this.state = {
            userID: localStorage.getItem('user_id'),
            firstName: localStorage.getItem('first_name'),
            lastName: localStorage.getItem('last_name'),
            email: localStorage.getItem('email'),
        }
    }

    componentDidMount = () => {
        if(this.state.userID === null || this.state.userID === undefined) {
            this.props.history.push('/login')
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