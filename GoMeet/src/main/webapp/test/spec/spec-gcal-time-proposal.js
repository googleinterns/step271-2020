// TESTS FOR rectifyTimeBoundaries
describe('rectifyTimeBoundaries', function() {
  const TIME_PAST = '2021-02-11T12:00';
  const FAKE_NOW = new Date(2021, 1, 12, 12, 0, 0, 0); // Time now: 2021-02-12T12:00
  const TIME_START = '2021-02-13T14:00' ; 
  const TIME_END = '2021-02-14T15:00';
  
  beforeEach(function() {
    // mock the Date object
    jasmine.clock().install()
    jasmine.clock().mockDate(FAKE_NOW);
  });

  it('returns true if both start and end are in the future \
      and end is later than start', function() {
    expect(rectifyTimeBoundaries(TIME_START, TIME_END)).toBe(true);
  });

  it('returns false if start is in the past', function() {
    expect(rectifyTimeBoundaries(TIME_PAST, TIME_END)).toBe(false);
  });

  it('returns false if end is earlier than start', function() {
    // This case also covers the case where end time is in the past.
    expect(rectifyTimeBoundaries(TIME_START, TIME_PAST)).toBe(false);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  }); 
});

// TESTS FOR generateTimes
describe('generateTimes', function() {
  let rectifyTimeBoundariesSpy;
  let startInput;
  let endInput;

  beforeEach(function() {
    rectifyTimeBoundariesSpy = spyOn(window, 'rectifyTimeBoundaries');
    spyOn(GoogleCalendarTimesDAO, 'findTimes');
    spyOn(window, 'alert');
    startInput = document.getElementById('period-start');
    endInput = document.getElementById('period-end');
  });

  it('calls GooglerCalendarTimesDAO.findTimes when period-start \
      and period-end are non-empty and valid', function() {
    // Fill the fields up with some values so that they are not empty
    startInput.value = '2021-02-12T14:00';
    endInput.value = '2021-02-12T20:00';
    rectifyTimeBoundariesSpy.and.returnValue(true);

    generateTimes();

    expect(GoogleCalendarTimesDAO.findTimes).toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('resets the period-start and period-end input fields and alerts \
      the user if the input values are invalid', function() {
    // Fill the fields up with some values so that they are not empty.
    startInput.value = '2021-02-12T14:00';
    endInput.value = '2021-02-12T20:00';
    // However, the start and end times are invalid.
    rectifyTimeBoundariesSpy.and.returnValue(false);
    generateTimes();
    checkStartEndReset();
  });

  it('resets the period-start and period-end input fields and alerts \
      the user if the period-start field is empty', function() {
    // The start field is empty.
    endInput.value = '2021-02-12T20:00';
    rectifyTimeBoundariesSpy.and.returnValue(false);
    generateTimes();
    checkStartEndReset();
  });

  it('resets the period-start and period-end input fields and alerts \
      the user if the period-end field is empty', function() {
    startInput.value = '2021-02-12T14:00';
    // The end field is empty.
    rectifyTimeBoundariesSpy.and.returnValue(false);
    generateTimes();
    checkStartEndReset();
  });

  afterEach(function() {
    // Reset the input fields
    startInput.value = '';
    endInput.value = '';
  })
})

/**
 * Checks that period-start and period-end fields were cleared,
 * and that window.alert has been called to alert the user of the
 * error, and that GoogleCalendarTimesDAO.findTimes was not called.
 */
function checkStartEndReset() {
  let startInput = document.getElementById('period-start');
  let endInput = document.getElementById('period-end');
  expect(startInput.value).toEqual('');
  expect(endInput.value).toEqual('');
  expect(GoogleCalendarTimesDAO.findTimes).not.toHaveBeenCalled();
  expect(window.alert).toHaveBeenCalledWith(INVALID_TIME_PERIOD);
}
