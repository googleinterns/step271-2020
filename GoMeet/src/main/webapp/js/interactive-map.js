/** Creates a map that allows users to add markers. */
function createMap() {
  let map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: -33.8688, lng: 151.2093}, zoom: 12}); 

  map.addListener('click', (event) => {
    createLocationForEdit(map, event.latLng.lat(), event.latLng.lng());
  });
  return map; 
}

/** Creates a marker that shows a textbox the user can edit. */
function createLocationForEdit(map, lat, lng) {
  const fetchWrapper = new FetchWrapper();

  editLocation =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow =
      new google.maps.InfoWindow({content: buildInfoWindowInput(lat, lng, editLocation, fetchWrapper)});

  // When the user closes the editable info window, remove the marker.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editLocation.setMap(null);
  });
  infoWindow.open(map, editLocation);
  return editLocation;
}

/**
 * Builds and returns HTML elements that show an editable textbox and a submit
 * button.
 */
function buildInfoWindowInput(lat, lng, editLocation, fetchWrapper) {
  const titleTextbox = document.createElement('textarea');
  const noteTextbox = document.createElement('textarea');

  const button = document.createElement('button');
  button.appendChild(document.createTextNode('CONFIRM'));
  button.onclick = () => {
    const params = new URLSearchParams();
    params.append('title', titleTextbox.value);
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('note', noteTextbox.value);
    fetchWrapper.postLocation('/location-data', params);

    editLocation.setMap(null);
  };

  const containerDiv = document.createElement('div');
  containerDiv.append('Enter location title:', document.createElement('br'), titleTextbox,
      document.createElement('br'), 'Enter note:', document.createElement('br'), noteTextbox,
      document.createElement('br'), button);
  return containerDiv;
}
