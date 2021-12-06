import React from 'react'
// import Search from './search'
// import L from 'leaflet'
import { Modal, Row, Col, Typography, Button } from 'antd'
// import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import LocationSearchInput from "./autocomplete";
// import { UiMaps } from '../MapsGoogle'
const { Title } = Typography;
// const myIcon = new L.icon({
//     iconUrl: require("../../../../assets/iconfinder_map-marker.png"),
//     iconRetinaUrl: null,
//     shadowUrl: null,
//     shadowSize: null,
//     shadowAnchor: null,
//     iconSize: new L.Point(40, 40),
// })


const Maps = (props) => {

    const getLocation = (event) => {
        props.mapToLocation(event);
    }

    const initCenter = props.currentPosUpdate ?
        props.currentPosUpdate :
        props.data ?
            {
                lat: props.data[0].userLatitude,
                lng: props.data[0].userLongatitude
            } :
            props.currentPos


    return (
        <Modal
            visible={props.visible}
            className="form-modal"
            footer={null}
            closable={false}
            centered
            width={'50rem'}
        >
            <Row gutter={20}>
                <Col span={24}>
                    <Row>
                        <Col span={12}>
                            <Title level={3}>Maps</Title>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Button className="button-create" type="primary" onClick={props.handleClickOk}> Confirm</Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row>
                        <Col span={24}>
                            <LocationSearchInput
                                getLatLng={(event) => getLocation(event)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        {props.google &&
                            <Map
                                google={props.google}
                                zoom={15}
                                initialCenter={initCenter}
                                onClick={(t, map, coord) => props.handleClickMaps(coord)}
                                containerStyle={{
                                    width: '100%',
                                    height: '540px',
                                    borderRadius: '15px',
                                    margin: '0 auto 30px',
                                    position: 'sticky'
                                }}
                                style={{
                                    width: '100%',
                                    height: '540px',
                                    borderRadius: '15px',
                                    margin: '0 auto 30px'
                                }}
                            >
                                <Marker
                                    key={2}
                                    onClick={(marker) => props.handleClickMaps(marker)}
                                    position={initCenter}
                                    draggable={true}
                                    onDragend={(t, map, coord) => props.onMarkerDragEnd(coord)}
                                    icon={{
                                        url: require("../../../../assets/iconfinder_map-marker.png"),
                                        scaledSize: new window.google.maps.Size(64, 64)
                                    }}
                                />

                                <InfoWindow
                                    position={initCenter}
                                    visible={true}
                                    onClose={() => props.windowClosed()}
                                >
                                    Current location: <pre>{JSON.stringify(props.currentPosUpdate ?
                                    props.currentPosUpdate : props.currentPos)}</pre>
                                </InfoWindow>

                            </Map>
                        }
                        {/* <Map center={props.currentPos} zoom={15}
                        onClick={(e) => props.handleClickMaps(e)}
                        style={{
                            width: '100%',
                            height: '540px',
                            borderRadius: '15px',
                            margin: '0 auto 30px'
                        }}>
                        <TileLayer
                            attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                        >
                        </TileLayer>
                        { props.currentPos &&
                        <Marker position={props.currentPos} icon={myIcon} draggable={true}>
                            <Popup position={props.currentPos}>
                                Current location: <pre>{JSON.stringify(props.currentPos, null, 2)}</pre>
                            </Popup>
                        </Marker>}
                        <Search />
                    </Map> */}
                        {/* <UiMaps
                        center={props.currentPos}
                        isFullScreen={props.isFullScreen}
                        isMarkerShow={props.isMarkerShow}
                        markerPosition={props.markerPosition}
                        onMapClicked={e => props.handleClickMaps(e)}
                        onCenterChange={e => props.handleCenterChenge(e)}
                        widthBox="30rem"
                    /> */}
                    </Row>
                </Col>
            </Row>
        </Modal>
    )
}

export default GoogleApiWrapper({
    apiKey: ("AIzaSyBxzN8MGUHoFaqL-ca8XpLBD3jMXmjfqNA&v=3")
})(Maps);