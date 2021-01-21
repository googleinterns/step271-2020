const MEETING_TIME_INPUT_DIV_ID = 'meeting-time-inputs';

function resetPageState() {
  // reset div to state it was onload (with one child div), so that we get a fresh div to work with next time
  var inputDiv = document.getElementById(MEETING_TIME_INPUT_DIV_ID);
  var defaultInputField = document.createElement('div');
  defaultInputField.id = MEETING_TIME_NAME_PREFIX + '1';
  inputDiv.innerHTML = '';
  inputDiv.appendChild(defaultInputField);

  // set the global timeInputs and timeNameSuffix back to their original value of 1
  timeInputs = 1;
  timeNameSuffix = 1;
}

// Tests for addTimeInput
describe('addTimeInput', function () {
  beforeAll(function() {
    spyOn(window, 'alert');
  });

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
    expect(label.innerText).toEqual('New Time');

    var inputField = addedInputDiv.children.item(1);
    expect(inputField.tagName).toEqual('INPUT');
    expect(inputField.type).toEqual('datetime-local');
    expect(inputField.name).toEqual(inputName);

    var deleteButton = addedInputDiv.children.item(2);
    expect(deleteButton.tagName).toEqual('BUTTON');
    expect(deleteButton.innerText).toEqual('-');
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
    inputDiv.appendChild(meetingTime2);

    meetingTime3 = document.createElement('div');
    meetingTime3.id = MEETING_TIME_3;
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
