import React from "react";
import { compose, withProps, withState, withHandlers, lifecycle } from "recompose";
import { withGoogleMap, GoogleMap, withScriptjs, Marker } from "react-google-maps";
import { Modal, Row, Col, Typography, Button } from 'antd';
import { StandaloneSearchBox } from "react-google-maps/lib/components/places/StandaloneSearchBox";
import configMaps from "../../../service/Config/configMaps";

const { Title } = Typography;

const PlacesWithStandaloneSearchBox = compose(
   withProps({
      googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${configMaps.key.API_KEY}&v=3&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `400px` }} />,
   }),
   lifecycle({
      componentWillMount() {
         const refs = {}

         this.setState({
            places: [],
            onSearchBoxMounted: ref => {
               refs.searchBox = ref;
            },
            onPlacesChanged: () => {
               const places = refs.searchBox.getPlaces();

               this.setState({
                  places,
               });

               this.props.onPlacesChanged(places);
            },
         })
      },
   }),
   withScriptjs
)(props =>
   <div data-standalone-searchbox="">
      <StandaloneSearchBox
         ref={props.onSearchBoxMounted}
         bounds={props.bounds}
         onPlacesChanged={props.onPlacesChanged}
      >
         <input
            type="text"
            placeholder="Search..."
            style={{
               boxSizing: `border-box`,
               border: `1px solid transparent`,
               width: `240px`,
               height: `32px`,
               padding: `0 12px`,
               borderRadius: `3px`,
               boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
               fontSize: `14px`,
               outline: `none`,
               textOverflow: `ellipses`,
               marginBottom: `20px`
            }}
         />
      </StandaloneSearchBox>
   </div>
);

const MapWithControlledZoom = compose(
   withProps({
      googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${configMaps.key.API_KEY}&v=3&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: `90%` }} />,
      containerElement: <div style={{ height: `400px` }} />,
      mapElement: <div style={{ height: `90%` }} />,
   }),
   withState('zoom', 'onZoomChange', 8),
   withHandlers(() => {
      const refs = {
         map: undefined,
      }

      return {
         onMapMounted: () => ref => {
            refs.map = ref
         },
         onZoomChanged: ({ onZoomChange }) => () => {
            onZoomChange(refs.map.getZoom())
         }
      }
   }),
   withScriptjs,
   withGoogleMap
)(props =>
   <GoogleMap
      defaultCenter={props.center}
      center={props.center}
      zoom={15}
      ref={props.onMapMounted}
      onZoomChanged={props.onZoomChanged}
      onClick={props.onClickMap}
   >
      <Marker
         position={props.positionMarker}
         draggable={true}
         onDragEnd={props.onDragEnd}
      >
      </Marker>
   </GoogleMap>
);

class SetLocation extends React.Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   render() {
      return (
         <Modal
            visible={this.props.visible}
            className="form-modal"
            footer={null}
            centered
            width={'50rem'}
            onCancel={this.props.onCancel}
         >
            <Row gutter={20}>
               <Col span={24}>
                  <Row>
                     <Col span={24}>
                        <Title level={3}>Maps</Title>
                     </Col>
                  </Row>
               </Col>
               <Col span={24}>
                  <Row>
                     <Col span={12} style={{ textAlign: 'left' }}>
                        <PlacesWithStandaloneSearchBox onPlacesChanged={this.props.onPlacesChanged} />
                     </Col>
                     <Col span={12} style={{ textAlign: 'right' }}>
                        <Button className="button-create" type="primary" onClick={this.props.handleClickOk}> Confirm</Button>
                     </Col>
                  </Row>
                  <MapWithControlledZoom 
                     positionMarker={this.props.positionMarker}
                     center={this.props.center}
                     onClickMap={this.props.onClickMap}
                     onDragEnd={this.props.onMarkerDragEnd}
                  />
               </Col>
            </Row>
         </Modal>
      )
   }
}

export default SetLocation;