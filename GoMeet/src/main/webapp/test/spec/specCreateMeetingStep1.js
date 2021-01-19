describe ("Add guest function", function() {

  beforeAll(function() {
    addGuest(document);
  });

  afterAll(function() {
    removeGuest('guest-1', document); 
  });

  it ("Should add one li element to the html page", function() {
    var listSize = document.getElementById('guest-list').childNodes.length; 
    var elementType = document.getElementById('guest-1').tagName;
    expect(listSize).toBe(1); 
    expect(elementType).toBe("LI"); 
  });

  it ("Should add a li element with 3 child nodes", function() {
    var listElement = document.getElementById('guest-1'); 
    var numChildren = listElement.childNodes.length; 
    expect(numChildren).toBe(3); 
  });

  it ("The first child node should be a label element", function() {
    var children = document.getElementById('guest-1').childNodes; 
    var elementType = children[0].tagName;
    expect(elementType).toBe("LABEL"); 
  });

  it ("The second child node should be an input element", function() {
    var children = document.getElementById('guest-1').childNodes; 
    var elementType = children[1].tagName; 
    expect(elementType).toBe("INPUT");
  });

  it ("The third child node should be a button element", function() {
    var children = document.getElementById('guest-1').childNodes; 
    var elementType = children[2].tagName; 
    expect(elementType).toBe("BUTTON");
  });
});

describe ("Remove guest function", function() {

  it ("Should remove one li element from the guest list", function() {
    addGuest(document);
    var guestList = document.getElementById('guest-list').childNodes;
    var firstGuestRemoveButton = guestList[0].childNodes[2]; 
    firstGuestRemoveButton.click();
    var listSize = document.getElementById('guest-list').childNodes.length; 
    expect(listSize).toBe(0); 
  });

  it ("Should remove the specific li element that the remove button is a child node of", function() {
    addGuest(document); 
    addGuest(document); 
    var guestOne = document.getElementById('guest-1'); 
    var guestTwo = document.getElementById('guest-2');
    var guestList = document.getElementById('guest-list').childNodes;
    
    // Remove the second guest 
    guestList[1].childNodes[2].click();
    var numGuests = guestList.length; 
    
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