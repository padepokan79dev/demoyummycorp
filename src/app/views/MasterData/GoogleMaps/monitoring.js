import React from "react";
import { compose, withProps, withState, withHandlers, lifecycle } from "recompose";
import { withGoogleMap, GoogleMap, withScriptjs } from "react-google-maps";
import { StandaloneSearchBox } from "react-google-maps/lib/components/places/StandaloneSearchBox";
import configMaps from "../../../service/Config/configMaps";

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
               width: `100%`,
               height: `40px`,
               padding: `0 12px`,
               borderRadius: `3px`,
               boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
               fontSize: `14px`,
               outline: `none`,
               textOverflow: `ellipses`,
               marginBottom: `10px`
            }}
         />
      </StandaloneSearchBox>
   </div>
);

const MapWithControlledZoom = compose(
   withProps({
      googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${configMaps.key.API_KEY}&v=3&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `500px` }} />,
      mapElement: <div style={{ height: `100%` }} />,
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
      {props.children}
   </GoogleMap>
);

class MapMonitoring extends React.Component {
   constructor(props) {
      super(props);
      this.state = {};
   }

   render() {
      return (
         <>
            <PlacesWithStandaloneSearchBox onPlacesChanged={this.props.onPlacesChanged} />
            <MapWithControlledZoom
               positionMarker={this.props.positionMarker}
               center={this.props.center}
               onClickMap={this.props.onClickMap}
               onDragEnd={this.props.onMarkerDragEnd}
            >
               {this.props.children}
            </MapWithControlledZoom>
         </>
      )
   }
}

export default MapMonitoring;