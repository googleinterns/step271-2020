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
