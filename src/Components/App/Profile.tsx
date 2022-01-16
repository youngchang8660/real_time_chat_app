import React from "react";
import { RouteComponentProps } from "react-router-dom";
import Button from '@mui/material/Button';
import axios from "axios";
import qs from 'qs';
import Avatar from 'react-avatar';
import MessageSnackbar from '../Reusable/MessageSnackbar';

interface ProfileState {
    server: any,
    userID: any,
    firstName: any,
    lastName: any,
    email: any,
    imgContent: any,
    imgDisplay: any,
    snackbarMessage: any,
    isSnackbarOpen: boolean,
    status: number,
}

class Profile extends React.Component<
    RouteComponentProps,
    ProfileState
>{
    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            server: 'http://localhost:5032',
            userID: localStorage.getItem('user_id'),
            firstName: '',
            lastName: '',
            email: '',
            imgContent: '',
            imgDisplay: '',
            snackbarMessage: "",
            isSnackbarOpen: false,
            status: 0,
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
        let converted:any = [];
        reader.readAsArrayBuffer(target);
        reader.onloadend = function (evt: any) {
            if (evt.target.readyState === FileReader.DONE) {
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
                    this.setState({
                        snackbarMessage: 'Successfully updated new profile',
                        isSnackbarOpen: true,
                        status: 200,
                    }, () => {
                        this.fetchUserInfo();
                    })
                }
            }).catch(err => {
                if(err.response.status === 500) {
                    console.log(err.response.data)
                    this.setState({
                        snackbarMessage: err.response.data,
                        isSnackbarOpen: true,
                        status: err.response.status,
                    }, () => {
                        this.fetchUserInfo();
                    })
                }
            })
    }

    closeMessage = () => {
        this.setState({
            isSnackbarOpen: false
        })
    }

    render() {
        let { firstName, lastName, userID, email, imgDisplay } = this.state;
        return (
            <div className="container" style={{color: 'black'}}>
                <form className="mt-3">
                    <div 
                        style={{fontSize: '26px', marginBottom: '30px', display: 'flex', justifyContent: 'center', color: 'white', fontWeight: 700}}
                    >
                        Edit Profile
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        {imgDisplay !== "" ? (
                            <div onClick={this.onClickSelectImage} style={{width: '150px', height: '150px', cursor: 'pointer'}}>
                                <img 
                                    alt="userProfileImage" 
                                    className="profile-image" 
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
                                <Avatar name={`${firstName} ${lastName}`} size="130" className="profile-image"/>
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
                    </div>
                    <div className="row d-flex flex-wrap justify-content-center mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2" style={{color: 'white', fontWeight: 700}}>First Name</label>
                            <input 
                                defaultValue={firstName.charAt(0).toUpperCase() + firstName.slice(1)} 
                                required id="firstName" 
                                style={{height: '40px'}}
                                onChange={(e) => {this.onChangeHandler(e, 'FirstName')}}
                            />
                        </div>
                        <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 d-flex flex-column">
                            <label className="mb-2" style={{color: 'white', fontWeight: 700}}>Last Name</label>
                            <input 
                                defaultValue={lastName.charAt(0).toUpperCase() + lastName.slice(1)} 
                                required id="lastName" 
                                style={{height: '40px'}}
                                onChange={(e) => {this.onChangeHandler(e, 'LastName')}}
                            />
                        </div>
                    </div>
                    <div className="row d-flex flex-wrap justify-content-center mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-6 d-flex flex-column">
                            <label className="mb-2" style={{color: 'white', fontWeight: 700}}>Email</label>
                            <input defaultValue={email} disabled required id="email" style={{height: '40px'}}/>
                        </div>
                    </div>
                    <div className="row d-flex flex-wrap justify-content-center mt-3" style={{fontSize: '16px'}}>
                        <div className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-6 d-flex flex-column">
                            <label className="mb-2" style={{color: 'white', fontWeight: 700}}>User ID</label>
                            <input defaultValue={userID} disabled id="userID" style={{height: '40px'}}/>
                        </div>
                    </div>
                    <div className="row d-flex justify-content-center mt-3">
                        <div className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-6">
                            <Button onClick={this.onSubmit} variant="contained">SAVE</Button>
                        </div>
                    </div>
                </form>
                <MessageSnackbar 
                    autoHideDuration={6000}
                    message={this.state.snackbarMessage}
                    isOpen={this.state.isSnackbarOpen}
                    messageStatus={this.state.status}
                    closeMessage={this.closeMessage}
                />
            </div>
        )
    }
}

export default Profile;