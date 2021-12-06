import React from "react";
import { Modal, Typography, Form, Button, Input, Space, Row, Col, Select } from "antd";
// import Maps from '../Maps/maps'
// import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'
import Maps from "../GoogleMaps";
import SetLocation from "../GoogleMaps/setLocation";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// const myIcon = new L.icon({
//     iconUrl: require("../../../../assets/iconfinder_map-marker.png"),
//     iconRetinaUrl: null,
//     shadowUrl: null,
//     shadowSize: null,
//     shadowAnchor: null,
//     iconSize: new L.Point(40, 40),
// })

const ModalCreateEdit = (props) => {

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    }

    return (
        <div>
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
            <Modal
                destroyOnClose={true}
                visible={props.visible}
                className="form-modal"
                footer={null}
                closable={false}
                centered
            >
                <Title level={3}>
                    {props.title}
                </Title>
                <Form
                    initialValues={props.dataRow ? {
                        branchId: props.dataRow.branch_id,
                        companyId: props.isCustomer ? props.companyId : props.dataRow.company_id,
                        branchName: props.dataRow.branch_name,
                        branchDesc: props.dataRow.branchDesc,
                        branchLatitude: props.dataRow.branchLatitude,
                        branchLongitude: props.dataRow.branchLongitude,
                        branchAddress: props.dataRow.branchAddress,
                        cityId: props.dataRow.cityId,
                        picName: props.dataRow.pic_name,
                        picPhone: props.dataRow.picPhone,
                        picEmail: props.dataRow.picEmail,
                        picDesc: props.dataRow.picDesc
                    } : (
                            props.isCustomer ? {
                                companyId: props.companyId
                            } : {}
                        )}
                    onFinish={props.onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Row gutter={20}>
                        <Col span={24} className="input-hidden">
                            <Form.Item name="branchId">
                                <Input type="hidden" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Customer</Text>
                            <Form.Item
                                name="companyId"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select customer name!'
                                    }
                                ]}
                            >
                                <Select
                                    className="select"
                                    placeholder="Select Customer"
                                    disabled={props.isCustomer ? true : false}
                                >
                                    {
                                        props.optionListCustomer ? (
                                            props.optionListCustomer.map(data => {
                                                return (
                                                    <Option key={data.companyId} value={data.companyId}>{data.companyName}</Option>
                                                )
                                            })
                                        ) : (
                                                <>
                                                </>
                                            )
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Branch Name</Text>
                            <Form.Item
                                name="branchName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input Branch Name!'
                                    }
                                ]}
                            >
                                <Input
                                    maxLength={50}
                                    className="input-modal"
                                    placeholder="Input Branch Name"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Text>Branch Description</Text>
                            <Form.Item
                                name="branchDesc"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input description!'
                                    }
                                ]}
                            >
                                <TextArea
                                    maxLength={255}
                                    className="input-modal"
                                    placeholder="Input Branch Description"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>PIC Name</Text>
                            <Form.Item
                                name="picName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input PIC Name!'
                                    }
                                ]}
                            >
                                <Input
                                    maxLength={50}
                                    className="input-modal"
                                    placeholder="Input PIC Name"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Phone Number</Text>
                            <Form.Item
                                name="picPhone"
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
                                        message: "Minimal Phone Number 10 digits!"
                                    }
                                ]}
                            >
                                <Input
                                    maxLength={15}
                                    className="input-modal"
                                    placeholder="Input Branch Phone"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>Email</Text>
                            <Form.Item
                                name="picEmail"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input email!'
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please input a valid email'
                                    }
                                ]}
                            >
                                <Input
                                    maxLength={75}
                                    className="input-modal"
                                    placeholder="Input Branch Email"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Text>City</Text>
                            <Form.Item
                                name="cityId"
                                rules={[{
                                    required: true,
                                    message: 'Please input city!'
                                }]}
                            >
                                <Select
                                    className="select"
                                    placeholder="Select City"
                                    showSearch
                                    onSearch={props.searchCity}
                                    onSelect={()=>props.searchCity("")}
                                    optionFilterProp="children"
                                    filterOption={false}
                                >
                                    {
                                        props.optionListCity ? (
                                            props.optionListCity.map(data => {
                                                return (
                                                    <Option key={data.cityId} value={data.cityId}>{data.cityName}</Option>
                                                )
                                            })
                                        ) : (
                                                <>
                                                </>
                                            )}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Text>Geo Location Branch</Text>
                            <Form.Item
                                name="branchLocation"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Please input langitude!'
                            //     }
                            // ]}
                            >
                                <div>
                                    <span style={{ cursor: 'pointer', color: 'blue' }} onClick={props.mapsVisible}>Set Location</span>

                                    <Maps
                                        center={ props.currentPos }
                                        positionMarker={ props.currentPos }
                                    />

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
                        {/* <Col span={12}>
                                <Text>Latitude</Text>
                                <Form.Item
                                    name="branchLatitude"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input langitude!'
                                        },
                                        {
                                            pattern: /^([-+]?)([\d]{1,2})(((\.)(\d+)))(\s*)$/g,
                                            message: 'Incorrect pattern langitude!'
                                        }
                                    ]}
                                    >
                                    <Input
                                        maxLength={20}
                                        className="input-modal"
                                        style={{width: '100%'}}
                                        placeholder="Input Branch Latitude"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                            <Text>Longitude</Text>
                            <Form.Item
                                name="branchLongitude"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select longitude!'
                                    },
                                    {
                                        pattern: /^(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g,
                                        message: 'Incorrect pattern longitude!'
                                    }
                                    ]}
                                >
                                <Input
                                    maxLength={20}
                                    className="input-modal"
                                    style={{width: '100%'}}
                                    placeholder="Input Branch Longitude"
                                />
                            </Form.Item>
                            </Col> */}
                    </Row>
                    <Row gutter={20}>
                        <Col span={24}>
                            <Text>Address</Text>
                            <Form.Item
                                name="branchAddress"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input address!'
                                    }
                                ]}
                            >
                                <TextArea
                                    maxLength={255}
                                    className="input-modal"
                                    placeholder="Input Branch Address"
                                />
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
                                        onClick={props.buttonSave}
                                    >
                                        Save
                                        </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}

export default ModalCreateEdit;
