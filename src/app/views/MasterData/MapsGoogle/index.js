/* global google */

import _ from 'lodash';
import React from 'react';
import { compose, withProps, lifecycle } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from 'react-google-maps';
import { SearchBox } from 'react-google-maps/lib/components/places/SearchBox';
import config from '../../../service/Config/configMaps';


const { key: { API_KEY } } = config || null
const Map = compose(
  withProps({
    googleMapURL: API_KEY,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};
      let lat = null
      let lng = null
      navigator.geolocation.getCurrentPosition(position => {
        lat = parseFloat(position.coords.latitude)
        lng = parseFloat(position.coords.longitude)
      });
      this.setState({
        bounds: null,
        center: { lat: lat, lng: lng },
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter()
          });
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();

          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location
          }));
          this.props.onCenterChange(nextMarkers[0].position);
          const nextCenter = _.get(
            nextMarkers,
            '0.position',
            this.state.center
          );

          this.setState({
            center: nextCenter,
            markerPosition: nextMarkers[0].position
          });
        }
      });
    }
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <div>
    {console.log('center:', props)}
    {props.isFullScreen === true ? (
      <GoogleMap
        onClick={props.onMapClicked}
        ref={props.onMapMounted}
        defaultZoom={15}
        center={props.centerMark}
        defaultOptions={{ mapTypeControl: false }}
      >
        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={props.onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Select location"
            style={{
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              width: `${props.widthBox}`,
              height: `3rem`,
              marginTop: `.7rem`,
              marginLeft: '1rem',
              padding: `0 10px`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`
            }}
          />
        </SearchBox>
        {props.isMarkerShow && (
          <Marker
            ref={props.onMarkerMounted}
            position={props.markerPosition}
            onPositionChanged={props.onMarkerClick}
          />
        )}
      </GoogleMap>
    ) : (
      <GoogleMap
        defaultZoom={15}
        defaultCenter={props.coords}
        center={props.coords}
        defaultOptions={{
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
          fullscreenControl: false
        }}
      >
        {props.isMarkerShow && <Marker position={props.coords} />}
      </GoogleMap>
    )}
  </div>
));

export const UiMaps = Map;
