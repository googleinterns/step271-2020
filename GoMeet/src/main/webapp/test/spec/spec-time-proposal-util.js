// Tests for getDatetimeNow
describe('getDatetimeNow', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(FAKE_NOW);
  });

  it('returns the ISO datestring of the local date and time, \
      with seconds and milliseconds set to 0', function() {
    let now = TimeProposalUtil.getDatetimeNow();
    expect(now).toEqual(ISO_DATESTRING);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  })
});

// Tests for verifyUniqueFutureTime
describe('verifyUniqueFutureTime', function() {
  let enteredTimes = new Set();
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(FAKE_NOW);
    spyOn(window, 'alert');
  });

  it('returns false, and does not add the input to the enteredTimes set \
      if the time entered is earlier than now', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) earlier than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() - 24*60*60*1000).toISOString();
    inputtedTime = inputtedTime.substring(0, inputtedTime.length - 1); // trim the time zone data
    expect(TimeProposalUtil.verifyUniqueFutureTime(inputtedTime, enteredTimes)).toBe(false);
    expect(enteredTimes.has(inputtedTime)).toBe(false);
  });

  it('returns false and does not add the input to the enteredTimes set, \
      if the time entered is equal to now', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) earlier than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() - 24*60*60*1000).toISOString();
    inputtedTime = inputtedTime.substring(0, inputtedTime.length - 1);
    expect(TimeProposalUtil.verifyUniqueFutureTime(inputtedTime, enteredTimes)).toBe(false);
    expect(enteredTimes.has(inputtedTime)).toBe(false);
  });

  it('returns true if the time entered is later than now, \
      and adds the time to the enteredTimes set', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) later than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() + 24*60*60*1000).toISOString();
    inputtedTime = inputtedTime.substring(0, inputtedTime.length - 1);
    expect(TimeProposalUtil.verifyUniqueFutureTime(inputtedTime, enteredTimes)).toBe(true);
    expect(enteredTimes.has(inputtedTime)).toBe(true);
  });

  it('returns false if the time entered is later than now, \
      but already in the enteredTimes set passed to the function', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) later than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() + 24*60*60*1000).toISOString();
    inputtedTime = inputtedTime.substring(0, inputtedTime.length - 1);
    enteredTimes.add(inputtedTime);
    expect(TimeProposalUtil.verifyUniqueFutureTime(inputtedTime, enteredTimes)).toBe(false);
    expect(enteredTimes.has(inputtedTime)).toBe(true);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    enteredTimes.clear();
  })
});

// Tests for rectifyInputtedTime
describe('rectifyInputtedTime', function() {
  var inputElem = document.createElement('input');
  inputElem.type = 'datetime-local';
  beforeEach(function() {
    spyOn(window, 'alert');
  });

  it('clears the input field and alerts the user if verifyUniqueFutureTime is false', function() {
    spyOn(TimeProposalUtil, 'verifyUniqueFutureTime').and.returnValue(false);
    // set the value of the inputElem to a date so it's not empty
    let value = new Date().toISOString();
    value = value.substring(0, value.length - 1);
    inputElem.value = value;
    // hardcode empty set of input times, which would make 'value' non-unique
    var enteredTimes = new Set([value]);
    TimeProposalUtil.rectifyInputtedTime(inputElem, enteredTimes);
    // the inputElem value should have been reset
    expect(inputElem.value).toEqual('');
    expect(window.alert).toHaveBeenCalledWith(INVALID_TIME_ERROR);
  });

  it('does not clear the input field if verifyUniqueFutureTime is true', function() {
    spyOn(TimeProposalUtil, 'verifyUniqueFutureTime').and.returnValue(true);
    // set the value of the inputElem to a date so it's not empty
    let value = new Date().toISOString();
    value = value.substring(0, value.length - 1);
    inputElem.value = value;
    // hardcode empty set of input times, which would make 'value' unique
    TimeProposalUtil.rectifyInputtedTime(inputElem, new Set());
    expect(inputElem.value).toEqual(value); // value should have stayed the same
    expect(window.alert).not.toHaveBeenCalled();
  });
});
