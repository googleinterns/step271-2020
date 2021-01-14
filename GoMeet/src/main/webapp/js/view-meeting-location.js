let map;

/* Editable marker that displays when a user clicks in the map. */
let editLocation;

/** Creates a map that allows users to add markers. */
function createMap() {
  map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: -33.8688, lng: 151.2093}, zoom: 12}); 

  map.addListener('click', (event) => {
    createLocationForEdit(event.latLng.lat(), event.latLng.lng());
  }); 
}

/** Sends a marker to the backend for saving. */
function postLocation(title, lat, lng, note) {
  const params = new URLSearchParams();
  params.append('title', title);
  params.append('lat', lat);
  params.append('lng', lng);
  params.append('note', note);

  fetch('/locations', {method: 'POST', body: params});
}

/** Creates a marker that shows a textbox the user can edit. */
function createLocationForEdit(lat, lng) {
  // If we're already showing an editable marker, then remove it.
  if (editLocation) {
    editLocation.setMap(null);
  }

  editLocation =
      new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

  const infoWindow =
      new google.maps.InfoWindow({content: buildInfoWindowInput(lat, lng)});

  // When the user closes the editable info window, remove the marker.
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editLocation.setMap(null);
  });

  infoWindow.open(map, editLocation);
}

/**
 * Builds and returns HTML elements that show an editable textbox and a submit
 * button.
 */
function buildInfoWindowInput(lat, lng) {
  const titlePrompt = document.createElement('span');
  titlePrompt.innerText = "Enter location title:"
  const titleTextbox = document.createElement('textarea');

  const notePrompt = document.createElement('span');
  notePrompt.innerText = "Enter note:"
  const noteTextbox = document.createElement('textarea');

  const button = document.createElement('button');
  button.appendChild(document.createTextNode('CONFIRM'));

  button.onclick = () => {
    postLocation(titleTextbox.value, lat, lng, noteTextbox.value);
    editLocation.setMap(null);
  };

  const containerDiv = document.createElement('div');
  containerDiv.appendChild(titlePrompt);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(titleTextbox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(notePrompt);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(noteTextbox);
  containerDiv.appendChild(document.createElement('br'));
  containerDiv.appendChild(button);

  return containerDiv;
}
