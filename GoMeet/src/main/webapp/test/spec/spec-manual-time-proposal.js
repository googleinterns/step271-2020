const MEETING_TIME_INPUT_DIV_ID = 'meeting-time-inputs';

// Fake 'now': 2020-12-22 11:12
const YEAR_NOW = 2020;
const MONTH_NOW = 11; // Note: 0-11 is Jan-Dec
const DAY_NOW = 22;
const HOUR_NOW = 11;
const MINS_NOW = 12;
const SEC_NOW = 45;
const MILLISEC_NOW = 112;
const ISO_DATESTRING = `${YEAR_NOW}-${MONTH_NOW+1}-${DAY_NOW}T${HOUR_NOW}:${MINS_NOW}:00.000`;
const FAKE_NOW = new Date(YEAR_NOW, MONTH_NOW, DAY_NOW, HOUR_NOW, MINS_NOW, SEC_NOW, MILLISEC_NOW);

function resetPageState() {
  // reset div to state it was onload (with one child div), so that we get a fresh div to work with next time
  var inputDiv = document.getElementById(MEETING_TIME_INPUT_DIV_ID);
  var defaultInputField = document.createElement('div');
  // re-add the 3 fields that mimic the structure of a div for a time input
  defaultInputField.innerHTML = '<label></label><input><button></button>';
  defaultInputField.id = MEETING_TIME_NAME_PREFIX + '1';
  inputDiv.innerHTML = '';
  inputDiv.appendChild(defaultInputField);

  // reset enteredTimes
  enteredTimes.clear();

  // set the global timeInputs and timeNameSuffix back to their original value of 1
  timeInputs = 1;
  timeNameSuffix = 1;
}

// Tests for addTimeInput
describe('addTimeInput', function () {
  beforeAll(function() {
    spyOn(window, 'alert');
  });

  beforeEach(function() {
    // mock the Date object
    jasmine.clock().install()
    jasmine.clock().mockDate(FAKE_NOW);
  })

  it('adds one time input to the page with a label and a delete button', function() {
    addTimeInput(document);
    var inputName = MEETING_TIME_NAME_PREFIX + timeNameSuffix;
    var addedInputDiv = document.getElementById(inputName);

    // check that all nodes with appropriate settings have been added
    expect(addedInputDiv.id).toEqual(inputName);
    expect(addedInputDiv.children.length).toEqual(3); // three children - <label>, <input> and <button>
    
    // The child nodes were appended in the order of <label>, <input>, <button>
    var label = addedInputDiv.children.item(0);
    expect(label.tagName).toEqual('LABEL'); // Note: docs say that returned tagname is always upper case
    expect(label.htmlFor).toEqual(inputName);

    var inputField = addedInputDiv.children.item(1);
    expect(inputField.tagName).toEqual('INPUT');
    expect(inputField.type).toEqual('datetime-local');
    expect(inputField.name).toEqual(inputName);
    expect(inputField.min).toEqual(ISO_DATESTRING);
    expect(inputField.onchange.toString()).toBe('function() {rectifyInputtedTime(this);}');

    var deleteButton = addedInputDiv.children.item(2);
    expect(deleteButton.tagName).toEqual('BUTTON');
    expect(deleteButton.className).toEqual('delete-time-button');
    expect(deleteButton.onclick.toString()).toBe('function() {deleteTimeInput(document, inputField.name);}');
  });

  it('alerts the user when the maximum number of inputs have been \
      added and does not add any more input fields after that', function() {
    // add 4 input fields on top of the input fields currently on the page
    var initialInputs = timeInputs;
    for (let i = 0; i < MAX_TIME_INPUTS - initialInputs; i++) {
      addTimeInput(document);
    }

    var inputsOnPage = document.getElementById(MEETING_TIME_INPUT_DIV_ID).childElementCount;
    expect(inputsOnPage).toEqual(MAX_TIME_INPUTS);

    // user should be alerted on the next call
    addTimeInput(document);
    expect(window.alert).toHaveBeenCalledWith(MAX_TIME_INPUT_REACHED_ALERT);
    // no additional input field was added to the page
    expect(inputsOnPage).toEqual(MAX_TIME_INPUTS);

  });

  it('calls toggleDeleteButtons when there are more than 1 input fields on the page', function() {
    spyOn(window, 'toggleDeleteButtons'); // toggleDeleteButtons tested below
    addTimeInput(document); // There should be 2 input fields on the page now
    expect(window.toggleDeleteButtons).toHaveBeenCalled();
  });

  
  afterEach(function() {
    resetPageState();
    jasmine.clock().uninstall();
  }); 
});

 
// Tests for deleteTimeInput
describe('deleteTimeInput', function () {
  var inputDiv, meetingTime1, meetingTime2, meetingTime3;
  const MEETING_TIME_2 = MEETING_TIME_NAME_PREFIX + '2';
  const MEETING_TIME_3 = MEETING_TIME_NAME_PREFIX + '3';
  beforeEach(function() { 
    // Note that 'meeting time 1' is the default input that is there on page load
    meetingTime1 = document.getElementById(MEETING_TIME_NAME_PREFIX + '1');
    // hardcode mock divs that can be deleted
    inputDiv = document.getElementById(MEETING_TIME_INPUT_DIV_ID);

    meetingTime2 = document.createElement('div');
    meetingTime2.id = MEETING_TIME_2;
    meetingTime2.innerHTML = '<label></label><input><button></button>';

    meetingTime3 = document.createElement('div');
    meetingTime3.id = MEETING_TIME_3;
    meetingTime3.innerHTML = '<label></label><input><button></button>';

    inputDiv.appendChild(meetingTime2);
    inputDiv.appendChild(meetingTime3);

    timeInputs = 3; // There are now three inputs including the 2 just hardcoded
  });

  it('deletes the <div> with the ID as given in the parameter', function() {
    var timeInputsBefore = timeInputs;
    deleteTimeInput(document, MEETING_TIME_2);
    expect(timeInputs).toEqual(timeInputsBefore - 1);
    expect(inputDiv.childElementCount).toEqual(timeInputs);
    // First node left after deletion is meetingTime1
    expect(inputDiv.children.item(0).isEqualNode(meetingTime1)).toBe(true);
    // Second node is meetingTime3
    expect(inputDiv.children.item(1).isEqualNode(meetingTime3)).toBe(true);
  });

  it('does nothing if the provided ID is of invalid type', function() {
    var integerId = 123;
    deleteAndVerfiyUnchanged(integerId);
  });

  it('does nothing if the provided ID does not exist in the DOM', function() {
    var nonExistentId = 'meeting-time-4';
    deleteAndVerfiyUnchanged(nonExistentId)
  });

  it('does nothing if the no ID is provided', function() {
    deleteAndVerfiyUnchanged();
  });

  it('calls toggleDeleteButtons when there is only 1 input field left on the page', function() {
    spyOn(window, 'toggleDeleteButtons'); // toggleDeleteButtons tested below
    var timeInputsBefore = timeInputs;
    deleteTimeInput(document, MEETING_TIME_2);
    deleteTimeInput(document, MEETING_TIME_3);
    expect(timeInputs).toEqual(timeInputsBefore - 2);
    expect(inputDiv.childElementCount).toEqual(timeInputs);
    // Only node left after deletion is meetingTime1
    expect(inputDiv.children.item(0).isEqualNode(meetingTime1)).toBe(true);
    expect(window.toggleDeleteButtons).toHaveBeenCalledTimes(1);
  });

  it('removes the deleted input\'s datetime string from enteredTimes', function() {
    // hardcode a datetime string as the value of the MEETING_TIME_2 input
    meetingTime2.children.item(TIME_INPUT_FIELD_INDEX).value = ISO_DATESTRING; 
    enteredTimes.add(ISO_DATESTRING);
    // deleting the input field should remove the corresponding datetime string from the set
    deleteTimeInput(document, MEETING_TIME_2);
    expect(enteredTimes.has(ISO_DATESTRING)).toBe(false);
  });

  afterEach(function() {
    resetPageState();
  }); 

  /**
   * Calls deleteTimeInput with 'nodeToDelete as the parameter', and verfies
   * that the DOM was NOT modified.
   */
  function deleteAndVerfiyUnchanged(nodeToDelete) {
    var timeInputsBefore = timeInputs;
    deleteTimeInput(document, nodeToDelete); 
    expect(timeInputs).toEqual(timeInputsBefore);
    expect(inputDiv.childElementCount).toEqual(timeInputs);
    // Nodes the same as before deletion
    expect(inputDiv.children.item(0).isEqualNode(meetingTime1)).toBe(true);
    expect(inputDiv.children.item(1).isEqualNode(meetingTime2)).toBe(true);
    expect(inputDiv.children.item(2).isEqualNode(meetingTime3)).toBe(true);
  }
});

// Tests for toggleDeleteButtons
describe('toggleDeleteButtons', function () {
  var inputDiv, meetingTime1, meetingTime1Button, meetingTime2, meetingTime2Button;
  const MEETING_TIME_2 = MEETING_TIME_NAME_PREFIX + '2';
  const DELETE_BUTTON_CLASSNAME = 'delete-time-button';
  beforeEach(function() { 
    // Note that 'meeting time 1' is the default input that is there on page load
    meetingTime1 = document.getElementById(MEETING_TIME_NAME_PREFIX + '1');
    meetingTime1Button = document.createElement('button');
    meetingTime1Button.className = DELETE_BUTTON_CLASSNAME;
    meetingTime1.appendChild(meetingTime1Button);
    
    // hardcode mock divs with 'delete-time-button's
    inputDiv = document.getElementById(MEETING_TIME_INPUT_DIV_ID);

    meetingTime2 = document.createElement('div');
    meetingTime2.id = MEETING_TIME_2;

    meetingTime2Button = document.createElement('button');
    meetingTime2Button.className = DELETE_BUTTON_CLASSNAME;

    meetingTime2.appendChild(meetingTime2Button);
    inputDiv.appendChild(meetingTime2);

    timeInputs = 2; // There are now two inputs including the 1 just hardcoded
  });

  it('changes the style.display property of all elements with the class \
      name \'delete-time-button\' to \'inline\' if they are \'none\'', function() {
    meetingTime1Button.style.display = 'none';
    meetingTime2Button.style.display = 'none';
    toggleDeleteButtons(document);
    expect(meetingTime1Button.style.display).toEqual('inline');
    expect(meetingTime2Button.style.display).toEqual('inline');
  });

  it('changes the style.display property of all elements with the class \
      name \'delete-time-button\' to \'none\' if they are not currently \'none\'', function() {
    meetingTime1Button.style.display = 'inline';
    meetingTime2Button.style.display = 'inline';
    toggleDeleteButtons(document);
    expect(meetingTime1Button.style.display).toEqual('none');
    expect(meetingTime2Button.style.display).toEqual('none');
  });

  it('does nothing if no elements were found with the \'delete-time-button\' \
      class name was found', function() {
    meetingTime1Button.style.display = 'none';
    meetingTime2Button.style.display = 'none';
    meetingTime1Button.className = 'another-class';
    meetingTime2Button.className = 'another-class';
    toggleDeleteButtons(document);
    // The display style should not have changed
    expect(meetingTime1Button.style.display).toEqual('none');
    expect(meetingTime2Button.style.display).toEqual('none');
  });

  afterEach(function() {
    resetPageState();
  }); 
});

// Tests for getDatetimeNow
describe('getDatetimeNow', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(FAKE_NOW);
  });

  it('returns the ISO datestring of the local date and time, \
      with seconds and milliseconds set to 0', function() {
    let now = getDatetimeNow();
    expect(now).toEqual(ISO_DATESTRING);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  })
});

// Tests for rectifyInputtedTime
describe('rectifyInputtedTime', function() {
  var inputElem = document.createElement('input');
  inputElem.type = 'datetime-local';

  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(FAKE_NOW);
    spyOn(window, 'alert');
  });

  it('clears the input field, does not add the input to the enteredTimes set, \
      and alerts the user if the time entered is earlier than now', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) earlier than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() - 24*60*60*1000).toISOString();
    inputElem.value = inputtedTime.substring(0, inputtedTime.length - 1); // trim the time zone data
    rectifyInputtedTime(inputElem);
    expect(inputElem.value).toEqual('');
    expect(window.alert).toHaveBeenCalledWith(INVALID_TIME_ERROR);
    expect(enteredTimes.has(inputElem.value)).toBe(false);
  });

  it('clears the input field, does not add the input to the enteredTimes set, \
      and alerts the user if the time entered is equal to now', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) earlier than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() - 24*60*60*1000).toISOString();
    inputElem.value = inputtedTime.substring(0, inputtedTime.length - 1);
    rectifyInputtedTime(inputElem);
    expect(inputElem.value).toEqual('');
    expect(window.alert).toHaveBeenCalledWith(INVALID_TIME_ERROR);
    expect(enteredTimes.has(inputElem.value)).toBe(false);
  });

  it('does not clear the input field if the time entered is later than now, \
      and adds the time to the enteredTimes set', function() {
    // create a date that is 24 hours (24*60*60*1000 milliseconds) later than FAKE_NOW
    let inputtedTime = new Date(FAKE_NOW.getTime() + 24*60*60*1000).toISOString();
    inputElem.value = inputtedTime.substring(0, inputtedTime.length - 1);
    rectifyInputtedTime(inputElem);
    expect(inputElem.value).toEqual(inputtedTime.substring(0, inputtedTime.length - 1));
    expect(window.alert).not.toHaveBeenCalled();
    expect(enteredTimes.has(inputElem.value)).toBe(true);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    enteredTimes.clear();
  })
});
