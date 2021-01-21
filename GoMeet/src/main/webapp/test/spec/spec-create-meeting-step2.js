// Tests for validateDuration
describe('validateDuration', function() {
  var hours;
  var mins;
  var callValidateDuration = function(){validateDuration()};

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

  it('returns true if hours between 0-23 and mins between 0-59', function() {
    hours = 3;
    mins = 30;
    expect(validateDuration()).toBe(true);
  })

  it('throws error if duration-hours is \'\' - not filled in', function() {
    hours = '';
    mins = 30;
    expect(callValidateDuration).toThrow(new Error(BLANK_FIELDS_ALERT));
  });

  it('throws error if duration-mins is \'\' - not filled in', function() {
    hours = '1';
    mins = '';
    expect(callValidateDuration).toThrow(new Error(BLANK_FIELDS_ALERT));
  });

  it('throws error if both duration-hours and duration-mins is 0', function() {
    hours = 0;
    mins = 0;
    expect(callValidateDuration).toThrow(new Error(ZERO_DURATION_ALERT));
  });

  it('throws error if duration-hours less than 0', function() {
    hours = -1;
    mins = 30;
    expect(callValidateDuration).toThrow(new Error(INVALID_DURATION_ALERT));
  });

  it('throws error if duration-mins less than 0', function() {
    hours = 1;
    mins = -1;
    expect(callValidateDuration).toThrow(new Error(INVALID_DURATION_ALERT));
  });

  it('throws error if duration-hours more than 23', function() {
    hours = 24;
    mins = 30;
    expect(callValidateDuration).toThrow(new Error(INVALID_DURATION_ALERT));
  });

  it('throws error if duration-mins more than 59', function() {
    hours = 1;
    mins = 60;
    expect(callValidateDuration).toThrow(new Error(INVALID_DURATION_ALERT));
  });
});
