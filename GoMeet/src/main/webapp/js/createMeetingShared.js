/**
 * Takes all values from <input> tags on the page, and saves data to sessionStorage
 * with 'name' of the <input> tag as key, and 'value' of the input tag as the value.
 * Note:
 *  - All <input> 'name's must be unique, otherwise the value will be overwritten.
 *  - All <input> on the page are expected to be compulsory fields. Empty <input> will 
 *  raise an alert requiring user to fill in every field.
 * @returns true if data successfully stored, false otherwise
 */
function saveMeeting() {
  let allInputs = document.getElementsByTagName('input');
  let radioGroups = new Set();
  let radioChecked = new Set(); 
  for (let i = 0; i < allInputs.length; i++) {
    let input = allInputs.item(i);
    let key = input.name;
    let value = input.value;
    // If this is a radio button, add to the set of radio 
    // groups if not there already.
    if (input.type === 'radio') {
      if (!radioGroups.has(input.name)) {
        radioGroups.add(input.name);
      }
      // If the radio button is checked, add to checked set
      if (input.checked) {
        radioChecked.add(input.name);
        sessionStorage.setItem(key, value);
      }
    }
    else { // all other types of inputs
      if (value !== '') {
        sessionStorage.setItem(key, value);
      }
      else {
        throw(new Error(BLANK_FIELDS_ALERT));
      }
    }
  }
  // Check if all groups of radio buttons have been filled out
  let difference = new Set([...radioGroups].filter(x => !radioChecked.has(x)));
  if (difference.size > 0) {
    throw(new Error(BLANK_FIELDS_ALERT));
  }
  return true;
}
