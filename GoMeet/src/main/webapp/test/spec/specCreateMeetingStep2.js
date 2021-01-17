// Tests for validateDuration
describe('validateDuration', function() {
  var hours;
  var mins;
  beforeAll(function() {
    spyOn(document, 'getElementById').and.callFake(function(id) {
      if (id === 'duration-hours') {
        return {value: hours};
      }
      else if (id === 'duration-mins') {
        return {value: mins};
      }
    });
  });

  beforeEach(function() {
    spyOn(window, 'alert');
  });

  it('returns true if hours between 0-23 and mins between 0-59', function() {
    hours = 3;
    mins = 30;
    expect(validateDuration()).toBe(true);
    expect(window.alert).not.toHaveBeenCalled();
  })

  it('returns false if duration-hours is \'\' - not filled in', function() {
    hours = '';
    mins = 30;
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(FILL_ALL_FIELDS_ALERT);
  });

  it('returns false if duration-mins is \'\' - not filled in', function() {
    hours = '1';
    mins = '';
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(FILL_ALL_FIELDS_ALERT);
  });

  it('returns false if both duration-hours and duration-mins is 0', function() {
    hours = 0;
    mins = 0;
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(ZERO_DURATION_ALERT);
  });

  it('returns false if duration-hours less than 0', function() {
    hours = -1;
    mins = 30;
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(INVALID_DURATION_ALERT);
  });
  it('returns false if duration-mins less than 0', function() {
    hours = 1;
    mins = -1;
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(INVALID_DURATION_ALERT);
  });

  it('returns false if duration-hours more than 23', function() {
    hours = 24;
    mins = 30;
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(INVALID_DURATION_ALERT);
  });

  it('returns false if duration-mins more than 59', function() {
    hours = 1;
    mins = 60;
    expect(validateDuration()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(INVALID_DURATION_ALERT);
  });
});
