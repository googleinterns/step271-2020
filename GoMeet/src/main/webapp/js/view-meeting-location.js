let map;

/* Editable marker that displays when a user clicks in the map. */
let editLocation;

/** Creates a map that allows users to add markers. */
function createMap() {
  map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: -33.8688, lng: 151.2093}, zoom: 12}); 
}
