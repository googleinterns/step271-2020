function voteTime() {
  // get the answers from the form and update votes on screen
  // NOTE this data would be sent to a servlet in MVP and the data fetched to update UI
  let inputs = document.getElementById("vote-time").elements;
  let time1 = inputs["time-1"];
  if (time1.checked === true) {
    document.getElementById("time-1-vote").innerText = (
      parseInt(document.getElementById("time-1-vote").innerText) + 1
    ).toString();
    // disable radio button, since user may only vote once for each time
    time1.disabled = true;
  }
  let time2 = inputs["time-2"];
  if (time2.checked === true) {
    document.getElementById("time-2-vote").innerText = (
      parseInt(document.getElementById("time-2-vote").innerText) + 1
    ).toString();
    time2.disabled = true;
  }
  let time3 = inputs["time-3"];
  if (time3.checked === true) {
    document.getElementById("time-3-vote").innerText = (
      parseInt(document.getElementById("time-3-vote").innerText) + 1
    ).toString();
    time3.disabled = true;
  }
}
