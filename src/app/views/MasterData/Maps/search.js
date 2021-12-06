import { Component } from "react";
import L from "leaflet";
import * as ELG from "esri-leaflet-geocoder";
import { withLeaflet } from "react-leaflet";

class Search extends Component {
  componentDidMount() {
    const map = this.props.leaflet.map;
    const searchControl = new ELG.Geosearch().addTo(map);
    const results = new L.LayerGroup().addTo(map);

    searchControl.on("results", function(data) {
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        // results.addLayer(L.marker(data.results[i].latlng, {icon: myIcon}));
      }
    });
  }

  render() {
    return null;
  }
}

//export default Search;
export default withLeaflet(Search);