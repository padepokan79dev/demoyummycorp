import React, { useState } from "react";
import { Form, Button, Input, Space, Select, Row, Col, Typography, Tag } from "antd";
import '../../../css/global.css';
// import Maps from '../Maps/maps'
// import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'
import Maps from "../GoogleMaps";
import SetLocation from "../GoogleMaps/setLocation";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// const myIcon = new L.icon({
//     iconUrl: require("../../../../assets/iconfinder_map-marker.png"),
//     iconRetinaUrl: null,
//     shadowUrl: null,
//     shadowSize: null,
//     shadowAnchor: null,
//     iconSize: new L.Point(40, 40),
// })

const FormUser = props => {
    const [form] = Form.useForm();
    const [regexUserIdentity, setRegexUserIdentity] = useState(null);
    const [editTenant, setEditTenant] = useState((!props.data || (props.data && props.data.roleId == 1 )) ? true : false);

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    }

    if (props.visible === false) {
        form.resetFields();
    }

    // const children = [];
    // for (let i = 10; i < 36; i++) {
    //    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    // }

    const onValuesChange = (changedValues, allValues) => {
        const valuePostalCode = changedValues.userAddressDetail;
        const reg = /\D/g;
        if (valuePostalCode) {
            form.setFieldsValue({
                userAddressDetail: changedValues.userAddressDetail.replace(reg, '')
            });
        }
    }

    const onChangeUserIdentity = (value, e) => {
        form.setFieldsValue({ userIdentityNo: null })
        if (e.children === "Passpor") {
            setRegexUserIdentity(/[A-Z]{1}[0-9]{7}/);
        } else {
            setRegexUserIdentity(/^[0-9]*$/)
        }
    }

    const onChangeRole = (value, e) => {
      if (value == 1){
        setEditTenant(true)
        var tenant = props.tenantList.map(item => {
          return item.tenantId
        })

        form.setFieldsValue({ tenant })
      } else {
        setEditTenant(false)
        form.setFieldsValue({ tenant: [] })
      }
    }

    function tagRender(val) {
        const { label, closable, onClose } = val
        return (
            <Tag
                color="#14616B"
                closable={(props.readOnly || editTenant) ? false : closable}
                onClose={onClose}
                style={{ marginRight: 3, marginTop: 1, borderRadius: 20 }}
            >
                {label}
            </Tag>
        )
    }

    return (
        <Form
            form={form}
            onFinish={values => props.onFinish(values)}
            onFinishFailed={onFinishFailed}
            onValuesChange={onValuesChange}
            initialValues={
                props.data ?
                    {
                        userFullName: props.data.userFullName,
                        userName: props.data.userName,
                        userPassword: props.data.userPassword,
                        userEmail: props.data.userEmail,
                        userIdentity: props.data.userIdentity,
                        userIdentityNo: props.data.userIdentityNo,
                        phone: props.data.phone,
                        mobilePhone: props.data.getMobilePhone,
                        userGender: props.data.getUserGender,
                        userAddress: props.data.userAddress,
                        primaryAreaId: props.data.primaryAreaId,
                        userAddressDetail: props.data.userAddressDetail,
                        roleId: props.data.roleId,
                        tenant: props.data.tenant.map(item => item.tenantId)
                        // userLatitude: props.data.userLatitude,
                        // userLongatitude: props.data.userLongatitude
                    } : {}
            }
        >
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
            <Row gutter={20}>
                <Col span={12}>
                    <Text>User Full Name</Text>
                    <Form.Item
                        name="userFullName"
                        rules={[{ required: true, message: 'Please input user full name!' }]}
                    >
                        <Input
                            className="input-modal"
                            placeholder={"Input User Full name"}
                            maxLength={50}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Username</Text>
                    <Form.Item
                        name="userName"
                        rules={[
                            {
                                required: true,
                                message: 'Please input username!'
                            },
                            {
                                min: 3,
                                message: 'Please input username min 3'
                            }
                        ]}
                    >
                        <Input
                            className="input-modal"
                            placeholder="Input Username"
                            maxLength={50}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Password</Text>
                    <Form.Item
                        className="formItem-custom"
                        name="userPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please input Password!'
                            }
                        ]}
                    >
                        <Input.Password
                            className="input-modal"
                            placeholder="Input Password"
                            maxLength={50}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Email</Text>
                    <Form.Item
                        name="userEmail"
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
                        <Input
                            className="input-modal"
                            placeholder="Input Email"
                            maxLength={75}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>User Identity</Text>
                    <Form.Item
                        className="formItem-custom"
                        name="userIdentity"
                        rules={[
                            {
                                required: true,
                                message: 'Please select user identity!'
                            }
                        ]}
                    >
                        <Select
                            placeholder="Select Identity"
                            onChange={onChangeUserIdentity}
                            className="select"
                        >
                            {
                                props.listIdentity ?
                                    props.listIdentity.map(item => {
                                        return (
                                            <Option key={item.codeId} value={item.codeId}>{item.codeName}</Option>
                                        )
                                    }) :
                                    (<></>)
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>No User Identity</Text>
                    <Form.Item
                        name="userIdentityNo"
                        rules={[
                            {
                                required: true,
                                message: 'Please input no user identity!'
                            },
                            {
                                min: 8,
                                message: 'Range no user identity 8 ~ 16 digits!'
                            },
                            {
                                pattern: regexUserIdentity,
                                message: 'Please input valid no user identity'
                            }
                        ]}
                    >
                        <Input
                            className="input-modal"
                            placeholder="Input No Identity"
                            maxLength={16}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Phone</Text>
                    <Form.Item
                        name="phone"
                        rules={[
                            {
                                required: true,
                                message: 'Please input phone number!'
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
                        <Input
                            className="input-modal"
                            placeholder="Input Phone"
                            maxLength={15}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Mobile Phone</Text>
                    <Form.Item
                        name="mobilePhone"
                        rules={[
                            {
                                required: true,
                                message: 'Please input mobile phone number!'
                            },
                            {
                                pattern: /^[+\d](?:.*\d)?$/g,
                                message: 'Please input a valid mobile phone number!'
                            },
                            {
                                min: 10,
                                max: 15,
                                message: 'Range phone number 10 ~ 15 digits!'
                            }
                        ]}
                    >
                        <Input
                            className="input-modal"
                            placeholder="Input Mobile Phone"
                            maxLength={15}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Gender</Text>
                    <Form.Item
                        className="formItem-custom"
                        name="userGender"
                        rules={[
                            {
                                required: true,
                                message: 'Please select gender!'
                            }
                        ]}
                    >
                        <Select
                            placeholder="Select Gender"
                            className="select"
                        >
                            <Option key={1} value={1}>Male</Option>
                            <Option key={2} value={2}>Female</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Role</Text>
                    <Form.Item
                        name="roleId"
                        rules={[{ required: true, message: 'Please input role!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select Role"
                            onChange={onChangeRole}
                        >
                            {
                                props.userRole ?
                                    props.userRole.map(item => {
                                        return (
                                            <Option key={item.roleId} value={item.roleId}>{item.roleName}</Option>
                                        )
                                    }) :
                                    (
                                        <React.Fragment></React.Fragment>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={20}>
                <Col span={24}>
                    <Text>Address</Text>
                    <Form.Item
                        name="userAddress"
                        rules={[{ required: true, message: 'Please input address!' }]}
                    >
                        <TextArea
                            className="input-modal"
                            placeholder="Input Address"
                            maxLength={255}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>City</Text>
                    <Form.Item
                        name="primaryAreaId"
                        rules={[{ required: true, message: 'Please input city!' }]}
                    >
                        <Select
                            className="select"
                            placeholder="Select City"
                            showSearch
                            onSearch={props.searchCity}
                            onSelect={() => props.searchCity("")}
                            optionFilterProp="children"
                            filterOption={false}
                        >
                            {
                                props.city ?
                                    props.city.map(item => {
                                        return (
                                            <Option key={item.cityId} value={item.cityId}>{item.cityName}</Option>
                                        )
                                    }) :
                                    (
                                        <React.Fragment></React.Fragment>
                                    )
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Postal Code</Text>
                    <Form.Item
                        name="userAddressDetail"
                        rules={[
                            {
                                required: true,
                                message: 'Please input postal code!'
                            },
                            {
                                min: 5,
                                message: 'Please input postal code min 5!'
                            }

                        ]}
                    >
                        <Input
                            className="input-modal"
                            placeholder="Input Postcal Code"
                            maxLength={5}
                        />
                    </Form.Item>
                </Col>
                {/* <Col span={12}>
                    <Text>Latitude</Text>
                    <Form.Item
                        className="formItem-custom"
                        name="userLatitude"
                        rules={[
                            {
                                required: true,
                                message: 'Please input latitude!'
                            },
                            {
                                pattern: /^([-+]?)([\d]{1,2})(((\.)(\d+)))(\s*)$/g,
                                message: 'Incorrect pattern latitude!'
                            }
                        ]}
                    >
                        <Input
                            className="input-modal" style={{ width: '100%' }}
                            maxLength={20}
                            placeholder={"Input Latitude"}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Text>Longtitude</Text>
                    <Form.Item
                        className="formItem-custom"
                        name="userLongatitude"
                        rules={[
                            {
                                required: true,
                                message: 'Please input longtitude!'
                            },
                            {
                                pattern: /^(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g,
                                message: 'Incorrect pattern longitude!'
                            }
                        ]}
                    >
                        <Input
                            className="input-modal" style={{ width: '100%' }}
                            maxLength={20}
                            placeholder={"Input Longtitude"}
                        />
                    </Form.Item>
                </Col> */}
                <Col span={24}>
                    <Text>Geo Location User</Text>
                    <div>
                        <span style={{ cursor: 'pointer', color: 'lightblue' }} onClick={props.mapsVisible}>Set Location</span>
                        <Maps
                            center={props.currentPos}
                            positionMarker={props.currentPos}
                        />

                        {/* <Map
                            center={
                                props.currentPosUpdate ?
                                    props.currentPosUpdate :
                                    props.data ?
                                        {
                                            lat: props.data.latitude,
                                            lng: props.data.longitude
                                        } :
                                        props.currentPos
                            }
                            zoom={15}
                            doubleClickZoom={false}
                            zoomSnap={false}
                            zoomDelta={false}
                            trackResize={false}
                            touchZoom={false}
                            scrollWheelZoom={false}
                            zoomControl={false}
                            dragging={false}
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
                            {props.currentPos &&
                                <Marker
                                    position={
                                        props.currentPosUpdate ?
                                            props.currentPosUpdate :
                                            props.data ?
                                                {
                                                    lat: props.data.latitude,
                                                    lng: props.data.longitude
                                                } :
                                                props.currentPos
                                    }
                                    icon={myIcon}
                                    draggable={false}
                                >
                                    <Popup
                                        position={
                                            props.currentPosUpdate ?
                                                props.currentPosUpdate :
                                                props.data ?
                                                    {
                                                        lat: props.data.latitude,
                                                        lng: props.data.longitude
                                                    } :
                                                    props.currentPos
                                        }
                                    >
                                        Current location: <pre>{JSON.stringify(props.currentPosUpdate ?
                                        props.currentPosUpdate :
                                        props.data ?
                                            {
                                                lat: props.data.latitude,
                                                lng: props.data.longitude
                                            } :
                                            props.currentPos, null, 2)}</pre>
                                    </Popup>
                                </Marker>}
                        </Map> */}
                    </div>
                </Col>
                <Col span={24} style={{ marginTop: 15 }}>
                    <Text>Tenant</Text>
                    <Form.Item
                        name="tenant"
                        rules={[{ required: true, message: 'Please input Tenant!' }]}

                    >
                        <Select
                            className="select"
                            mode="multiple"
                            tagRender={tagRender}
                            placeholder="Input Tenant"
                            onSearch={props.searchTenant}
                            onSelect={() => props.searchTenant("")}
                            onDeselect={() => props.searchTenant("")}
                            onBlur={() => props.searchTenant("")}
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            disabled={editTenant}
                        >
                            {
                                props.tenantList && props.tenantList.map(item => {
                                    return (
                                        <Option key={item.tenantId} value={item.tenantId}>{item.tenantCode} - {item.tenantName}</Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        style={{
                            textAlign: 'right',
                            marginTop: '50px'
                        }}
                    >
                        <Space size={'small'}>
                            <Button
                                type="danger"
                                size={'small'}
                                style={{
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    borderRadius: '5px'
                                }}
                                onClick={props.buttonCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size={'small'}
                                loading={props.loading}
                                style={{
                                    paddingLeft: '25px',
                                    paddingRight: '25px',
                                    borderRadius: '5px'
                                }}
                            >
                                Save
                            </Button>
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Form>

    )
}

export default FormUser;
