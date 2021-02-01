package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingEventFields;
import com.google.sps.data.ServletUtil;
import org.json.simple.JSONObject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet to handle the fetching and creating of meetingEvent entities */
@WebServlet("/meeting-event")
public class MeetingEventServlet extends HttpServlet {

  /** Creates a new meetingEvent entity and stores it to Datastore */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService(); 
    String meetingName = request.getParameter(MeetingEventFields.MEETING_NAME);
    String durationMins = request.getParameter(MeetingEventFields.DURATION_MINS); 
    String durationHours = request.getParameter(MeetingEventFields.DURATION_HOURS); 
    String timeFindMethod = request.getParameter(MeetingEventFields.TIME_FIND_METHOD);
    String guestListUri = request.getParameter(MeetingEventFields.GUEST_LIST); 
    String meetingTimeIdsUri = request.getParameter(MeetingEventFields.MEETING_TIME_IDS); 
    String meetingLocationIdsUri = request.getParameter(MeetingEventFields.MEETING_LOCATION_IDS); 

    // Check all properties are not null 
    if (meetingName == null || durationMins == null || durationHours == null || 
        timeFindMethod == null || guestListUri == null || meetingTimeIdsUri == null || 
        meetingLocationIdsUri == null) {
      ServletUtil.sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
          ErrorMessages.BAD_POST_REQUEST_ERROR);
      return;
    }

    // guestListStr, meetingTimeIdsStr and meetingLocationIdsStr are sent by the request 
    // as a single string with each element deliminated by a comma 
    String guestListStr = ServletUtil.decodeUri(guestListUri);
    String meetingTimeIdsStr = ServletUtil.decodeUri(meetingTimeIdsUri);
    String meetingLocationIdsStr = ServletUtil.decodeUri(meetingLocationIdsUri);
    List<String> guestList = Arrays.asList(guestListStr.split(",")); 
    List<String> meetingTimeIds = Arrays.asList(meetingTimeIdsStr.split(",")); 
    List<String> meetingLocationIds = Arrays.asList(meetingLocationIdsStr.split(","));

    // Create entity and store in Datastore 
    Entity meetingEvent = new Entity("MeetingEvent"); 
    meetingEvent.setProperty(MeetingEventFields.MEETING_NAME, meetingName); 
    meetingEvent.setProperty(MeetingEventFields.DURATION_MINS, durationMins);
    meetingEvent.setProperty(MeetingEventFields.DURATION_HOURS, durationHours);
    meetingEvent.setProperty(MeetingEventFields.TIME_FIND_METHOD, timeFindMethod);
    meetingEvent.setProperty(MeetingEventFields.GUEST_LIST, guestList);
    meetingEvent.setProperty(MeetingEventFields.MEETING_TIME_IDS, meetingTimeIds);
    meetingEvent.setProperty(MeetingEventFields.MEETING_LOCATION_IDS, meetingLocationIds); 
    datastore.put(meetingEvent);

    // Return a JSON string with the key of the created entity under the field 'meetingEventId'
    String meetingEventKey = KeyFactory.keyToString(meetingEvent.getKey());
    HashMap<String, Object> keyObj = new HashMap<String, Object>() {{
      put(MeetingEventFields.MEETING_EVENT_ID, meetingEventKey); 
    }};
    response.setContentType("application/json");
    response.getWriter().println(ServletUtil.convertMapToJson(keyObj));
  }

  /** Fetches a MeetingEvent entity from Datastore according to the entity ID in the query string */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    
    response.setContentType("application/json");
    String meetingEventKey = request.getParameter(MeetingEventFields.MEETING_EVENT_ID);

    if (meetingEventKey == null) {
      ServletUtil.sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
          ErrorMessages.BAD_GET_REQUEST_ERROR);
      return;
    }

    Key key;
    try {
      key = KeyFactory.stringToKey(meetingEventKey);
    } catch(IllegalArgumentException e) {
      // The meetingEventKey is an invalid key
      ServletUtil.sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.INVALID_KEY_ERROR);
      return;
    }

    // Filter by Key
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity result;

    try {
      result = datastore.get(key);
    } catch (EntityNotFoundException e) {
      // Entity by the given key is not found
      ServletUtil.sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, ErrorMessages.ENTITY_NOT_FOUND_ERROR);
      return;
    }

    String meetingName = (String) result.getProperty(MeetingEventFields.MEETING_NAME); 
    String durationMins = (String) result.getProperty(MeetingEventFields.DURATION_MINS); 
    String durationHours = (String) result.getProperty(MeetingEventFields.DURATION_HOURS); 
    String timeFindMethod = (String) result.getProperty(MeetingEventFields.TIME_FIND_METHOD); 
    List guestList = (ArrayList) result.getProperty(MeetingEventFields.GUEST_LIST); 
    List meetingTimeIds = (ArrayList) result.getProperty(MeetingEventFields.MEETING_TIME_IDS); 
    List meetingLocationIds = (ArrayList) result.getProperty(MeetingEventFields.MEETING_LOCATION_IDS); 

    HashMap<String, Object> meetingEvent = new HashMap<String, Object>();
    meetingEvent.put(MeetingEventFields.MEETING_NAME, meetingName); 
    meetingEvent.put(MeetingEventFields.DURATION_MINS, durationMins); 
    meetingEvent.put(MeetingEventFields.DURATION_HOURS, durationHours); 
    meetingEvent.put(MeetingEventFields.TIME_FIND_METHOD, timeFindMethod); 
    meetingEvent.put(MeetingEventFields.GUEST_LIST, guestList); 
    meetingEvent.put(MeetingEventFields.MEETING_TIME_IDS, meetingTimeIds);
    meetingEvent.put(MeetingEventFields.MEETING_LOCATION_IDS, meetingLocationIds);

    String meetingEventJson = ServletUtil.convertMapToJson(meetingEvent);
    response.getWriter().println(meetingEventJson);
  }
}
