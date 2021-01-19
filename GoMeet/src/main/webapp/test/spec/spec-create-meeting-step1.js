describe ("Add guest function", function() {

  beforeAll(function() {
    addGuest(document);
  });

  afterAll(function() {
    removeGuest('guest-1', document); 
  });

  it ("Should add one li element to the html page", function() {
    let listSize = document.getElementById('guest-list').childNodes.length; 
    let elementType = document.getElementById('guest-1').tagName;
    expect(listSize).toBe(1); 
    expect(elementType).toBe("LI"); 
  });

  it ("Should add a li element with 3 child nodes", function() {
    let listElement = document.getElementById('guest-1'); 
    let numChildren = listElement.childNodes.length; 
    expect(numChildren).toBe(3); 
  });

  it ("The first child node should be a label element", function() {
    let children = document.getElementById('guest-1').childNodes; 
    let elementType = children[0].tagName;
    expect(elementType).toBe("LABEL"); 
  });

  it ("The second child node should be an input element", function() {
    let children = document.getElementById('guest-1').childNodes; 
    let elementType = children[1].tagName; 
    expect(elementType).toBe("INPUT");
  });

  it ("The third child node should be a button element", function() {
    let children = document.getElementById('guest-1').childNodes; 
    let elementType = children[2].tagName; 
    expect(elementType).toBe("BUTTON");
  });
});

describe ("Remove guest function", function() {

  it ("Should remove one li element from the guest list", function() {
    addGuest(document);
    let guestList = document.getElementById('guest-list').childNodes;
    let firstGuestRemoveButton = guestList[0].childNodes[2]; 
    firstGuestRemoveButton.click();
    let listSize = document.getElementById('guest-list').childNodes.length; 
    expect(listSize).toBe(0); 
  });

  it ("Should remove the specific li element that the remove button is a child node of", function() {
    addGuest(document); 
    addGuest(document); 
    let guestOne = document.getElementById('guest-1'); 
    let guestTwo = document.getElementById('guest-2');
    let guestList = document.getElementById('guest-list').childNodes;
    
    // Remove the second guest 
    guestList[1].childNodes[2].click();
    let numGuests = guestList.length; 
    
    expect(guestOne).toBeDefined(); 
    expect(guestTwo).toBeNull;
    expect(numGuests).toBe(1); 

    // Remove the first guest 
    guestList[0].childNodes[2].click();
    numGuests = guestList.length; 
    expect(guestOne).toBeNull; 
    expect(guestTwo).toBeNull; 
    expect(numGuests).toBe(0); 
  });
});