import React from "react";
import Button from '@mui/material/Button';

class Profile extends React.Component<any, {
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

    render() {
        let { firstName, lastName, userID, email } = this.state;
        return (
            <div className="container">
                <form className="mt-5">
                    <div style={{fontSize: '24px', marginBottom: '30px'}}>Edit Profile</div>
                    <div className="row d-flex flex-wrap" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2">First Name</label>
                            <input defaultValue={firstName.charAt(0).toUpperCase() + firstName.slice(1)} required id="firstName" style={{height: '40px'}}/>
                        </div>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2">Last Name</label>
                            <input defaultValue={lastName.charAt(0).toUpperCase() + lastName.slice(1)} required id="lastName" style={{height: '40px'}}/>
                        </div>
                    </div>
                    <div className="row d-flex flex-wrap mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-6 d-flex flex-column">
                            <label className="mb-2">Email</label>
                            <input defaultValue={email.charAt(0).toUpperCase() + email.slice(1)} disabled required id="email" style={{height: '40px'}}/>
                        </div>
                    </div>
                    <div className="row d-flex flex-wrap mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2">User ID</label>
                            <input defaultValue={userID} disabled id="userID" style={{height: '40px'}}/>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-6">
                            <Button variant="contained">SAVE</Button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default Profile;