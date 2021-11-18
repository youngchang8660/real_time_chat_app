import React from "react";
import Button from '@mui/material/Button';
import axios from "axios";
import qs from 'qs';
import Avatar from 'react-avatar';

class Profile extends React.Component<any, {
    server: any,
    userID: any,
    firstName: any,
    lastName: any,
    email: any,
    imgContent: any,
    imgDisplay: any,
}>{
    constructor(props: any) {
        super(props);
        this.state = {
            server: 'http://localhost:5032',
            userID: localStorage.getItem('user_id'),
            firstName: '',
            lastName: '',
            email: '',
            imgContent: '',
            imgDisplay: ''
        }
    }

    componentDidMount = () => {
        this.fetchUserInfo();
    }

    fetchUserInfo = () => {
        let { server, userID } = this.state;
        axios.get(`${server}/api/getUserInfo/${userID}`)
            .then((res: any) => {
                this.setState({
                    firstName: res.data[0].first_name,
                    lastName: res.data[0].last_name,
                    email: res.data[0].email,
                    imgContent: res.data[0].user_image === null ? "" : Buffer.from(res.data[0].user_image).toString('hex').toUpperCase(),
                    imgDisplay: res.data[0].user_image === null ? "" : this.convertBufferArrayToDataURL(res.data[0].user_image.data),
                })
            })
    }

    convertBufferArrayToDataURL = (arrayData: any, type = "image/png") => {
        const arrayBuffer = new Uint8Array(arrayData);
        const blob = new Blob([arrayBuffer], { type: type });
        const urlCreator = window.URL || (window as any).webkitURL;
        const fileUrl = urlCreator.createObjectURL(blob);
        return fileUrl;
    };

    onChangeHandler = (e: any, action: any) => {
        switch(action) {
            case 'FirstName':
                this.setState({ firstName: e.currentTarget.value })
                break;
            case 'LastName':
                this.setState({ lastName: e.currentTarget.value })
                break;
            default:
                break;
        }
    }

    onClickSelectImage = () => {
        document.getElementById('upload-button')?.click();
    }

    handleChange = (event: any) => {
        let selfThis = this;
        let target = event.target.files[0];
        let picture = target.name.toLowerCase();
        if (!picture.includes(".jpg") && !picture.includes(".jpeg")  && !picture.includes(".png") && !picture.includes(".gif") && !picture.includes(".jfif") && 
            !picture.includes(".svg") && !picture.includes(".tiff") && !picture.includes(".bmp")) {
                return window.alert("Must upload an image with a JPEG, PNG, GIF, SVG, TIFF or BMP format");
        }
        
        var reader = new FileReader();
        let converted = new Array();
        reader.readAsArrayBuffer(target);
        reader.onloadend = function (evt: any) {
            if (evt.target.readyState == FileReader.DONE) {
                var arrayBuffer = evt.target.result,
                array = new Uint8Array(arrayBuffer);
                for (var i = 0; i < array.length; i++) {
                    converted.push(array[i]);
                }
            }
        selfThis.imgHandle(converted);
        }
    }

    imgHandle = (data: any) => {
        let img: any = Buffer.from(data).toString('hex').toUpperCase()
        this.setState({
            imgContent: img,
            imgDisplay: this.convertBufferArrayToDataURL(data)
        })
    }

    onSubmit = () => {
        let { userID, firstName, lastName, imgContent, server } = this.state;
        let insertUserData = {
            userID,
            firstName,
            lastName,
            imgContent
        }
        let url = `${server}/api/updateUser`;
        let options: any = {
            method: 'PUT',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(insertUserData),
            url,
        };

        axios(options)
            .then(res => {
                if(res.status === 200) {
                    this.fetchUserInfo();
                }
            }) .catch(err => {
                console.log(err.message)
            })
    }

    render() {
        let { firstName, lastName, userID, email, imgDisplay } = this.state;
        return (
            <div className="container">
                <form className="mt-5">
                    <div style={{fontSize: '24px', marginBottom: '30px'}}>Edit Profile</div>
                    {imgDisplay !== "" ? (
                        <div onClick={this.onClickSelectImage} style={{width: '150px', height: '150px', cursor: 'pointer'}}>
                            <img 
                                alt="userProfileImage" 
                                className="profile-image" 
                                style={{width: '150px', height: '150px'}}
                                src={this.state.imgDisplay}
                            />
                            <input 
                                type="file"
                                name="imgContent"
                                id="upload-button"
                                accept="image/*"
                                key={Math.random()}
                                onChange={this.handleChange}
                                hidden
                            /> 
                        </div>
                    ):(
                        <div onClick={this.onClickSelectImage} style={{width: '150px', height: '130px', cursor: 'pointer'}}>
                            <Avatar name={`${firstName} ${lastName}`} size="130" />
                            <input 
                                type="file"
                                name="imgContent"
                                id="upload-button"
                                accept="image/*"
                                key={Math.random()}
                                onChange={this.handleChange}
                                hidden
                            /> 
                        </div>
                    )}
                    <div className="row d-flex flex-wrap mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2">First Name</label>
                            <input 
                                defaultValue={firstName.charAt(0).toUpperCase() + firstName.slice(1)} 
                                required id="firstName" 
                                style={{height: '40px'}}
                                onChange={(e) => {this.onChangeHandler(e, 'FirstName')}}
                            />
                        </div>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2">Last Name</label>
                            <input 
                                defaultValue={lastName.charAt(0).toUpperCase() + lastName.slice(1)} 
                                required id="lastName" 
                                style={{height: '40px'}}
                                onChange={(e) => {this.onChangeHandler(e, 'LastName')}}
                            />
                        </div>
                    </div>
                    <div className="row d-flex flex-wrap mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-6 d-flex flex-column">
                            <label className="mb-2">Email</label>
                            <input defaultValue={email} disabled required id="email" style={{height: '40px'}}/>
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
                            <Button onClick={this.onSubmit} variant="contained">SAVE</Button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default Profile;