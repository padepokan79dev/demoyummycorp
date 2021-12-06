import React from "react"; 
import { withGoogleMap, GoogleMap, withScriptjs, Marker } from "react-google-maps";
import configMaps from "../../../service/Config/configMaps";

const GMaps = withScriptjs(withGoogleMap(props => (
   <GoogleMap
      defaultZoom={15}
      defaultCenter={props.center}
      center={props.center}
      defaultOptions={{
         disableDoubleClickZoom: true,
         zoomControl: false,
         zoomControlOptions: false,
         draggable: false,
         keyboardShortcuts: false
      }}
   >
      <Marker
         position={props.positionMarker}
      />
      <Marker />
   </GoogleMap>
)));

class Maps extends React.Component {
   constructor(props) {
      super(props);
      this.state = {};
   }
   
   render() {
      return (
         <GMaps 
            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${configMaps.key.API_KEY}&v=3&libraries=geometry,drawing,places`}
            loadingElement={<div style={{ height: `100%` }}>Loading</div>}
            containerElement={<div style={{ height: `200px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            center={this.props.center}
            positionMarker={this.props.positionMarker}
         />
      )
   }
}

export default Maps;