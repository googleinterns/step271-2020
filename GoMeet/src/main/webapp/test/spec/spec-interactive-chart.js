/** Tests for interactive-chart.js. */
describe('Draw Chart', function() {
  const LOCATION_A = {title : 'Liyue', voteCount : 10};
  const LOCATIONS = [LOCATION_A];

  it ('Should fetch locations and add data to chart', async function() {
    // Spy on Dao.
    const mockedDao = new PermMeetingLocationDao();
    spyOn(mockedDao, 'fetchLocations').and.returnValue(LOCATIONS);
    spyOn(MeetingLocationDaoFactory, 'getLocationDao').and.returnValue(
        mockedDao);

    // Spy on Charts API.
    const dataTableSpy = spyOn(google.visualization, 'DataTable');
    const mockedDataTable =
        jasmine.createSpyObj('DataTable', ['addColumn', 'addRow']);
    dataTableSpy.and.returnValue(mockedDataTable);
    const barChartSpy = spyOn(google.visualization, 'BarChart');
    const mockedBarChart = jasmine.createSpyObj('BarChart', ['draw']);
    barChartSpy.and.returnValue(mockedBarChart);
    spyOn(google.charts, 'load');

    await drawChart();

    expect(mockedDataTable.addRow).toHaveBeenCalledWith(
        [LOCATION_A.title, LOCATION_A.voteCount]);
  });
});
