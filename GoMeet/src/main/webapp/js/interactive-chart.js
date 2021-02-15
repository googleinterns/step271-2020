google.charts.load('current', {'packages':['corechart']});

/** Fetches location data and uses it to create a chart. */
async function drawChart() {
  const dao = MeetingLocationDaoFactory.getLocationDao('permanent');
  let locations = await dao.fetchLocations();
  let data = new google.visualization.DataTable();
  data.addColumn('string', 'Location');
  data.addColumn('number', 'Count')
  locations.forEach((location) => {
    data.addRow([location.title, location.voteCount])
  });
  
  const options = {
    'title': 'Locations',
    'height': 400
  };

  const chart = new google.visualization.BarChart(document.getElementById('map'));
  chart.draw(data, options);
}
