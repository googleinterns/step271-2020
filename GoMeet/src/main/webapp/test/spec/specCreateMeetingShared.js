class MockHTMLCollection {
  /**
   * Construct a MockHTMLCollection object, a fake that mocks
   * the HTMLCollection object.
   * @param {Array} arr Array of <input> objects
   */
  constructor(arr) {
    this.items = arr;
    // length is readonly
    Object.defineProperty(this, 'length', {
      get: function () {
        return arr.length;
      },
    });
  }

  /**
   * Return the item at the ith index.
   * @param {int} i the index of the item to return
   */
  item(i) {
    return this.items[i];
  }
}

/**
 * Creates <input> elements with the names and values as given in arr.
 * @param {Array} arr Array of objects each in the format {name: value},
 * representing the name and value of the <input> elements to create.
 * @returns {Array} Array of <input> elements created
 */
function createInputElems(arr) {
  var inputElements = [];
  for (let i = 0; i < arr.length; i++) {
    var elem = document.createElement('input');
    var name = Object.keys(arr[i])[0];
    var value = arr[i][name];
    elem.name = name;
    elem.value = value;
    inputElements.push(elem);
  }
  return inputElements;
}

// Tests for saveMeeting
describe('saveMeeting', function () {
  // Set up
  var documentSpy;
  var fakeSessionStorage = {};

  beforeAll(function () {
    // mocks for external functions
    documentSpy = spyOn(document, 'getElementsByTagName');
    spyOn(sessionStorage, 'setItem').and.callFake(function(key,value) {
      fakeSessionStorage[key] = value;
    });
    spyOn(sessionStorage, 'getItem').and.callFake(function(key) {
      return fakeSessionStorage[key];
    });
  });

  it('stores all input element in (name,value) key-value pairs to \
      session storage and returns true', function () {
    // create some hardcoded input elements
    var inputElemData = [
      { 'meeting-name': 'My Meeting' },
      { 'meeting-guest-1': 'Anna' },
    ];
    var inputElements = createInputElems(inputElemData);
    inputElements = new MockHTMLCollection(inputElements);

    // set the behaviour of the document.getElementsByTagName mock
    documentSpy.and.returnValue(inputElements);

    expect(saveMeeting()).toBe(true);
    expect(sessionStorage.getItem('meeting-name')).toBe('My Meeting');
    expect(sessionStorage.getItem('meeting-guest-1')).toBe('Anna');
  });

  it('alerts user when there are empty inputs on the page and returns false', function () {
    var emptyInputElem = createInputElems([{ 'empty-input': '' }]);
    emptyInputElem = new MockHTMLCollection(emptyInputElem);

    documentSpy.and.returnValue(emptyInputElem);
    
    spyOn(window, 'alert');
    expect(saveMeeting()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(FILL_ALL_FIELDS_ALERT);
    expect(sessionStorage.getItem('empty-input')).toBe(undefined); // empty input value should not have stored
  });

  it('overwrites non-unique session storage keys with the new values', function () {
    // create some hardcoded input elements - two same names
    var inputElemData = [
      { 'meeting-name': 'First' },
      { 'meeting-name': 'Second' },
    ];
    var inputElements = createInputElems(inputElemData);
    inputElements = new MockHTMLCollection(inputElements);

    documentSpy.and.returnValue(inputElements);

    expect(saveMeeting()).toBe(true);
    expect(sessionStorage.getItem('meeting-name')).toBe('Second');
  });

  it('alerts user when there are unselected radio buttons and returns false', function () {
    // Note that radio buttons have a hardcoded 'value' field, so will need separate logic
    // to verify that the 'value' of radio buttons are stored to sessionStorage ONLY when
    // their 'checked' property is 'true'
    // var fakeSessionStorage = {};
    var inputElemData = [{ 'time-find-method': 'manual' }];
    var inputElements = createInputElems(inputElemData);
    inputElements[0].type = 'radio'; // Make the <input> element created a radio button
    inputElements[0].checked = false; // Do NOT check the button
    inputElements = new MockHTMLCollection(inputElements);

    documentSpy.and.returnValue(inputElements);

    spyOn(window, 'alert');
    expect(saveMeeting()).toBe(false);
    expect(window.alert).toHaveBeenCalledOnceWith(FILL_ALL_FIELDS_ALERT);
    expect(sessionStorage.getItem('time-find-method')).toBe(undefined); // the value of the button was not stored
  });

  it('stores nothing to sessionStorage and returns true if no <input>s found on HTML page', function () {
    documentSpy.and.returnValue(new MockHTMLCollection([]));
    expect(saveMeeting()).toBe(true);
    expect(Object.keys(fakeSessionStorage).length).toEqual(0);
  });

  it('stores values of inputs without specified names under the key \'\'', function () {
    // empty <input> name fields will be read as ''
    var inputElements = createInputElems([{ '': 'value' }]);
    documentSpy.and.returnValue(new MockHTMLCollection(inputElements));
    expect(saveMeeting()).toBe(true);
    expect(sessionStorage.getItem('')).toBe('value');
  });

  it('handles all different types of inputs', function () {
    // Ignore the following types, because their values are not
    // data that need to be carried over: button, hidden, image, reset, submit
    //var fakeSessionStorage = {};
    const ALL_INPUT_TYPES_VALUES = new Set([
      {'checkbox': 'value'},
      {'color': '#00ff4c'},
      {'datetime-local': '2021-01-06T17:32'},
      {'email': 'test@email.com'},
      {'month': '2021-06'},
      {'number': '1'},
      {'password': 'mypassword123'},
      {'radio': 'value'},
      {'range': '30'},
      {'search': 'querystring'},
      {'tel': '0412345678'},
      {'text': 'some text'},
      {'time': '19:35'},
      {'url': 'https://www.website.com'},
      {'week': '2021-W04'},
    ]);

    var inputData = [];
    for (let item of ALL_INPUT_TYPES_VALUES) {
      inputData.push(item);
    }
    var inputElements = createInputElems(inputData);
    let i = 0;
    // create one item of each type
    for (let item of ALL_INPUT_TYPES_VALUES) {
      var type = Object.keys(item)[0];
      inputElements[i].type = type;
      // check the radio button
      if (type === 'radio') {
        inputElements[i].checked = true;
      }
      i++;
    }

    documentSpy.and.returnValue(new MockHTMLCollection(inputElements));
    expect(saveMeeting()).toBe(true);
    for (let item of ALL_INPUT_TYPES_VALUES) {
      var key = Object.keys(item)[0];
      var value = item[key];
      expect(sessionStorage.getItem(key)).toBe(value);
    }
  });
  afterEach(function() {
    fakeSessionStorage = {}; // empty session storage after each test
  })
});
