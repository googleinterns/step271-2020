PROPOSED_TIMES_NO = 3; // Initially we hardcoded 3 different times suggestions

function voteTime() {
  // get the answers from the form and update votes on screen
  // NOTE this data would be sent to a servlet in MVP and the data fetched to update UI
  let inputs = document.getElementById('vote-time').elements;
  for (let i = 0; i < PROPOSED_TIMES_NO; i++) {
    if (inputs[i].checked === true) {
      document.getElementById(inputs[i].id + '-vote').innerText = (
          parseInt(document.getElementById(inputs[i].id + '-vote').innerText) + 1
      ).toString();
      // disable radio button, since user may only vote once for each time
      inputs[i].disabled = true;
    }
  }
}
