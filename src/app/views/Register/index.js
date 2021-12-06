import React, { Component, useState } from "react";
import { withRouter, Link } from 'react-router-dom';
import "../../css/global.css";
import "antd/dist/antd.css";
import {
    Row,
    Input,
    Card,
    Button,
    Select,
    notification,
    Form,
    Col
} from 'antd';
import { FSMServices } from "../../service";

// Leaflet 
// import Maps from '../MasterData/Maps/maps';
// import { Map, TileLayer, Marker, Popup, } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'

// Google Maps
import Maps from '../MasterData/GoogleMaps';
import SetLocation from '../MasterData/GoogleMaps/setLocation';

import logo from '../../../assets/logo1.png';
import userIcon from '../../../assets/user.svg';
import passwordIcon from '../../../assets/password.svg';
import phoneIcon from '../../../assets/phone.svg';
import mobilePhoneIcon from '../../../assets/mobilePhone.svg';
import emailIcon from '../../../assets/mail.svg';
import addressIcon from '../../../assets/address.svg';
import postalIcon from '../../../assets/mail-box.svg';
import genderIcon from '../../../assets/gender.svg';
import identityIcon from '../../../assets/identity.svg';
import cityIcon from '../../../assets/city.svg';

const { Option } = Select;
// const myIcon = new L.icon({
//     iconUrl: require("../../../assets/iconfinder_map-marker.png"),
//     iconRetinaUrl: null,
//     shadowUrl: null,
//     shadowSize: null,
//     shadowAnchor: null,
//     iconSize: new L.Point(40, 40),
// })

const FormRegister = props => {
    const [register] = Form.useForm();
    const [regexUserIdentity, setRegexUseridentity] = useState(null)

    const genderList = [
        {
            key: 1,
            value: "Male"
        },
        {
            key: 2,
            value: "Female"
        },
    ];

    const onValuesChange = (changedValues, allValues) => {
        const valuePostalCode = changedValues.postalCode;
        const valuePhone = changedValues.phone;
        const valueMobilePhone = changedValues.mobilePhone;
        const reg = /\D/g;
        if (valuePostalCode) {
            register.setFieldsValue({
                postalCode: changedValues.postalCode.replace(reg, '')
            });
        } else if (valuePhone) {
            register.setFieldsValue({
                phone: changedValues.phone.replace(reg, '')
            });
        } else if (valueMobilePhone) {
            register.setFieldsValue({
                mobilePhone: changedValues.mobilePhone.replace(reg, '')
            });
        }
    }

    const onChangeUserIdentity = (value, e) => {
        register.setFieldsValue({ noIdentity: null })
        if (e.children === "Passpor") {
            setRegexUseridentity(/[A-Z]{1}[0-9]{7}/);
        } else {
            setRegexUseridentity(/^[0-9]*$/)
        }
    }

    return (
        <>
            <SetLocation
                visible={props.mapView}
                center={props.mapCenter}
                positionMarker={props.tempCurrentPos}
                onPlacesChanged={props.onPlacesChanged}
                handleClickOk={props.handleClickOk}
                onClickMap={props.onClickMap}
                onMarkerDragEnd={props.onMarkerDragEnd}
                onCancel={props.onCancelMaps}
            />
            <Form
                form={register}
                onFinish={props.onFinish}
                onValuesChange={onValuesChange}
            >
                <Row gutter={[10]}>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={userIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input username!'
                                },
                                {
                                    min: 3,
                                    message: "Please input username min 3"
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Username" maxLength={50} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={passwordIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input password!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Password" type="password" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <div className="container-icon">
                            <img src={userIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input name!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Name" maxLength={50} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={phoneIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input phone!'
                                },
                                {
                                    pattern: /^[+\d](?:.*\d)?$/g,
                                    message: 'Please input a valid phone number!'
                                },
                                {
                                    min: 10,
                                    max: 15,
                                    message: 'Range phone number 10 ~ 15 digits!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Phone" maxLength={15} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <div className="container-icon">
                            <img src={mobilePhoneIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="mobilePhone"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input mobile phone!'
                                },
                                {
                                    pattern: /^[+\d](?:.*\d)?$/g,
                                    message: 'Please input a valid phone number!'
                                },
                                {
                                    min: 10,
                                    max: 15,
                                    message: 'Range phone number 10 ~ 15 digits!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Mobile Phone" maxLength={15} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={emailIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input email!'
                                },
                                {
                                    type: 'email',
                                    message: 'Please input a valid email!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Email" maxLength={75} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <div className="container-icon">
                            <img src={addressIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input address!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Address" maxLength={255} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={postalIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="postalCode"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input postal code!'
                                },
                                {
                                    min: 5,
                                    message: 'Postal code must be 5 digits!'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="Postal Code" maxLength={5} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <div className="container-icon">
                            <img src={genderIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="gender"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select gender!'
                                }
                            ]}
                        >
                            <Select
                                className="select-login"
                                placeholder="Gender"
                            >
                                {
                                    genderList.map(item => {
                                        return (
                                            <Option key={item.key} value={item.key}>{item.value}</Option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={identityIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="identity"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input identity!'
                                }
                            ]}
                        >
                            <Select
                                className="select-login"
                                placeholder="Identity"
                                loading={props.loadingIdentity}
                                onChange={onChangeUserIdentity}
                            >
                                {
                                    props.userIdentityList ?
                                        props.userIdentityList.map(item => {
                                            return (
                                                <Option key={item.key} value={item.key}>{item.codeName}</Option>
                                            )
                                        }) : (<> </>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <div className="container-icon">
                            <img src={identityIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="noIdentity"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input no identity!'
                                },
                                {
                                    min: 8,
                                    message: 'Range no user identity 8 ~ 16 digits!'
                                },
                                {
                                    pattern: regexUserIdentity,
                                    message: 'Please input valid no user identitas'
                                }
                            ]}
                        >
                            <Input className="input-login" placeholder="No Identity" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div className="container-icon">
                            <img src={cityIcon} alt="icon-user" width="16" />
                        </div>
                        <Form.Item
                            style={{ marginBottom: 25 }}
                            name="city"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input city!'
                                }
                            ]}
                        >
                            <Select
                                className="select-login"
                                placeholder="City"
                                loading={props.loadingCity}
                            >
                                {
                                    props.cityList ?
                                        props.cityList.map(item => {
                                            return (
                                                <Option key={item.key} value={item.key}>{item.cityName}</Option>
                                            )
                                        }) : (<> </>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="branchLocation"
                            style={{ marginBottom: 25 }}
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please input langitude!'
                        //     }
                        // ]}
                        >
                            <div>
                                <span style={{ cursor: 'pointer', color: 'blue' }} onClick={props.mapsVisible}>Set Location</span>
                                {props.currentPos &&
                                    <Maps
                                        center={props.currentPos}
                                        positionMarker={props.currentPos}
                                    />
                                }
                                {/* <Map center={props.currentPos} zoom={15}
                                    dragging={false}
                                    doubleClickZoom={false}
                                    zoomSnap={false}
                                    zoomDelta={false}
                                    trackResize={false}
                                    touchZoom={false}
                                    scrollWheelZoom={false}
                                    zoomControl={false}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        borderRadius: '15px',
                                        margin: '0 auto'
                                    }}>
                                    <TileLayer
                                        attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                                        url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                                    >
                                    </TileLayer>
                                    { props.currentPos &&
                                    <Marker position={props.currentPos} icon={myIcon} draggable={false}>
                                        <Popup position={props.currentPos}>
                                            Current location: <pre>{JSON.stringify(props.currentPos, null, 2)}</pre>
                                        </Popup>
                                    </Marker>}
                                </Map> */}
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    style={{ marginBottom: 0 }}
                >
                    <Button
                        className="btn-register"
                        htmlType="submit"
                    >
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}

class Register extends Component {
    constructor(props) {
        super(props);
        document.title = props.name + " | FSM";
        this.state = {
            loading: false,
            cityList: [],
            userIdentityList: [],
            visibleMaps: false,
            infoWindowVisible: false,
            // currentPos: {lat:-6.9198306, lng:107.6071227}
            mapCenter: null,
            tempCurrentPos: null
        }
    }

    async componentDidMount() {
        this.getCity();
        this.getUserIdentity();
        if (navigator.geolocation) {
            await this.getCurrentPosition();
        }
    }

    async getCurrentPosition() {
        await navigator.geolocation.getCurrentPosition(position => {
            this.setState({
                currentPos: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                mapCenter: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                tempCurrentPos: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
            }, () => console.log(JSON.stringify(this.state.currentPos)))
        });
    }

    getCity = async () => {
        this.setState({ loadingCity: true });
        let tempList = [];
        await FSMServices.getAllCity()
            .then(res => {
                tempList = res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : [];
            });
        this.setState({
            cityList: tempList.map(item => {
                return {
                    key: item.cityId,
                    cityName: item.cityName
                }
            }),
            loadingCity: false
        });
    }

    getUserIdentity = async () => {
        this.setState({ loadingIdentity: true });
        let tempList = [];
        await FSMServices.getUserIdentity()
            .then(res => {
                tempList = res &&
                    res.data &&
                    res.data.Data ?
                    res.data.Data : [];
            });
        this.setState({
            userIdentityList: tempList.map(item => {
                return {
                    key: item.codeId,
                    codeName: item.codeName
                }
            }),
            loadingIdentity: false
        });
    }

    doLogin = () => {
        this.props.history.push('/');
    }

    register = async (data) => {
        FSMServices.register(data).then(res => {
            if (
                res &&
                    res.status &&
                    res.data &&
                    res.data.Status ?
                    res.data.Status === "OK" &&
                    res.status === 200 : false
            ) {
                notification.success({
                    placement: 'bottomRight',
                    message: 'Success',
                    description:
                        res &&
                            res.data &&
                            res.data.Message ?
                            res.data.Message : "Register Success",
                });
                this.props.history.push('/');
                this.getCurrentPosition();
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description:
                        res &&
                            res.data &&
                            res.data.Message ?
                            res.data.Message : "Register Error"
                });
            }
        })
    }

    handleMaps = () => {
        this.setState({
            visibleMaps: true
        })
    }
    handleClickOk = () => {
        this.setState(state => ({
            visibleMaps: false,
            currentPos: state.tempCurrentPos,
            mapCenter: state.tempCurrentPos
        }));
    }

    handleClickMaps = (e) => {
        const { latLng } = e;
        this.setState({
            // currentPos: e.latlng,
            // currentPosUpdate: e.latlng
            currentPos: latLng === undefined ? e.position : latLng,
            currentPosUpdate: latLng === undefined ? e.position : latLng,
            infoWindowVisible: true,
        });
    }

    onPlacesChanged = place => {
        let coords;
        place.map(res => {
            coords = {
                lat: res.geometry.location.lat(),
                lng: res.geometry.location.lng()
            }
            return null;
        })
        this.setState({
            tempCurrentPos: coords,
            mapCenter: coords
        })
    }

    onClickMap = event => {
        const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        }
        this.setState({
            tempCurrentPos: coords
        })
    }

    windowClosed = () => {
        this.setState({ infoWindowVisible: false })
    }

    onMarkerDragEnd = event => {
        const coords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        }
        this.setState({
            tempCurrentPos: coords
        })
    }

    onCancelMaps = event => {
        this.setState( state => ({
            visibleMaps: false,
            tempCurrentPos: state.currentPos,
            mapCenter: {
                lat: state.currentPos.lat + 0.00001,
                lng: state.currentPos.lng + 0.00001
            }
        }))
    }

    onFinish = async values => {
        this.setState({ loading: true });
        const data = {
            primaryAreaId: {
                cityId: values.city
            },
            roleId: {
                roleId: 2
            },
            userName: values.username,
            userPassword: values.password,
            userAddress: values.address,
            userAddressDetail: values.postalCode,
            phone: values.phone,
            mobilePhone: values.mobilePhone,
            userEmail: values.email,
            userIdentity: values.identity,
            userIdentityNo: values.noIdentity,
            userGender: values.gender,
            userImage: null,
            userLatitude: this.state.currentPos.lat,
            userLongatitude: this.state.currentPos.lng,
            userFullName: values.name
        }
        await this.register(data);
        this.setState({ loading: false });
    }

    render() {
        const {
            loadingCity,
            loadingIdentity,
            mapCenter,
            tempCurrentPos
        } = this.state;
        return (
            <>
                <img
                    src={logo}
                    alt="logo-tugasin"
                    className="logo-login"
                />
                <Card
                    className="card-register"
                >
                    <FormRegister
                        cityList={this.state.cityList}
                        userIdentityList={this.state.userIdentityList}
                        onFinish={this.onFinish}
                        loading={this.state.loading}
                        loadingCity={loadingCity}
                        loadingIdentity={loadingIdentity}
                        mapsVisible={() => this.handleMaps()}
                        mapView={this.state.visibleMaps}
                        currentPos={this.state.currentPos}
                        handleClickMaps={(e) => this.handleClickMaps(e)}
                        handleClickOk={this.handleClickOk}
                        google={this.props.google}
                        windowClosed={this.windowClosed}
                        infoWindowVisible={this.state.infoWindowVisible}
                        onMarkerDragEnd={this.onMarkerDragEnd}
                        onPlacesChanged={this.onPlacesChanged}
                        onClickMap={this.onClickMap}
                        mapCenter={mapCenter}
                        onCancelMaps={this.onCancelMaps}
                        tempCurrentPos={tempCurrentPos}
                    />
                    <div className="wrapper-login">
                        <span><Link to="/">Login</Link></span>
                    </div>
                </Card>
            </>
        );
    }
}

export default withRouter(Register);