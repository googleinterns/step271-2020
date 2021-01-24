describe ('addGuest', function() {

  beforeAll(function() {
    addGuest(document);
  });

  afterAll(function() {
    removeGuest('guest-1', document); 
  });

  it ('Should add one li element with 3 child nodes to the html page', function() {
    let listSize = document.getElementById('guest-list').childNodes.length; 
    expect(listSize).toBe(1); 

    let guestOne = document.getElementById('guest-1');
    let elementType = guestOne.tagName; 
    expect(elementType).toBe("LI"); 

    let guestOneChildren = guestOne.childNodes; 
    let guestOneNumChildren = guestOneChildren.length; 
    expect(guestOneNumChildren).toBe(3);
    
    let childOneType = guestOneChildren[0].tagName; 
    let childTwoType = guestOneChildren[1].tagName; 
    let childThreeType = guestOneChildren[2].tagName; 
    expect(childOneType).toBe("LABEL"); 
    expect(childTwoType).toBe("INPUT"); 
    expect(childThreeType).toBe("BUTTON"); 
  });

  it ('Should add another guest to the list', function() {
    addGuest(document); 
    let listSize = document.getElementById('guest-list').childNodes.length; 
    expect(listSize).toBe(2); 
    removeGuest('guest-2', document); 
  });
});

describe ('removeGuest', function() {

  it ('Should remove one li element from the guest list', function() {
    addGuest(document);
    let guestList = document.getElementById('guest-list').childNodes;
    let firstGuestRemoveButton = guestList[0].childNodes[2]; 
    firstGuestRemoveButton.click();
    let listSize = document.getElementById('guest-list').childNodes.length; 
    expect(listSize).toBe(0); 
  });

  it ('Should remove the specific li element that the remove button is a child node of', function() {
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

describe ('isValidEmail', function() {
  it ('Should check if an email is valid', function() {
    let badEmailOne = "1@2.3"; 
    let badEmailTwo = "!@.com"; 
    let badEmailThree = "name@address-com"; 
    
    expect(isValidEmail(badEmailOne)).toBe(false);
    expect(isValidEmail(badEmailTwo)).toBe(false);
    expect(isValidEmail(badEmailThree)).toBe(false);

    let goodEmailOne = "name@address.com"; 
    let goodEmailTwo = "name1@address.com"; 
    let goodEmailThree = "name-1@address.com";
    expect(isValidEmail(goodEmailOne)).toBe(true);
    expect(isValidEmail(goodEmailTwo)).toBe(true);
    expect(isValidEmail(goodEmailThree)).toBe(true);
  });
});
