# GoMeet

Capstone Project for the ANZ 2020/21 Google STEP Internship. 

This repository contains the code for the application prototype at `step271-2020/prototype` and for the application alpha version at `step271-2020/GoMeet`.

GoMeet is a web application that helps **streamline the process of organising group meetings** by providing the functionality for users to propose meeting times and locations for meetings they create or are invited to, and then vote on these times and locations.

Key Features:

1. **Individual user support**: Users login using their Google accounts to create and save meetings, and meeting details will be emailed to them. (by @hvivian)

2. **Meeting time proposal (manual and automatic) and voting**: When creating a meeting, users can choose to manually propose meeting times, or the application can utilise the Google Calendar API to automatically consolidate free and busy times of guests and suggest meeting times. Guests can also vote for their preferred meeting time(s). (by @annagiang)

3. **Meeting location proposal and voting**: Users can propose locations by clicking on a Google Map, and enter a personalised name and note for the location. Guests can also vote for their preferred location(s). (by @tnieva)

**Developers** Anna Giang (annagiang@), Therese Nieva (tneiva@), Vivian Ho (hvivian@)

**Start Development** 14/01/2021

**End Development** 18/02/2021

**Status** Alpha (pre-deployment)

## Application Preview Instructions

**Map Visualisation**

Application requires a `load-map.js` file to be created in the following directory: 

````
step271-2020/GoMeet/src/main/webapp/js
````

Then, copy the following script into the file and replace "YOUR_API_KEY" with your unique API key: 

````
// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMapAPI';
script.defer = true;

// Attach your callback function to the `window` object
window.initMapAPI = function() {
// JS API is loaded and available
};

// Append the 'script' element to 'head'
document.head.appendChild(script);
````

Note: This file was not committed to the remote repository in order to maintain confidentiality of personal API keys. 

In the terminal, navigate to the following directory:

```
step271-2020/GoMeet
```

Run the following Maven command:

```
mvn package appengine:run
```

The application running on the App Engine Development Server may then be previewed on port 8080.

## Test Execution Instructions

In the terminal, navigate to the following directory:

```
step271-2020/GoMeet
```

**Java Tests**

Run the following Maven command:

```
mvn test
```

**JavaScript Tests**

Run the following Maven command: 

```
mvn package appengine:run
```

Then, preview the App Engine Development Server on port 8080 and navigate to: 

````
test/SpecRunner.html?random=false
````
