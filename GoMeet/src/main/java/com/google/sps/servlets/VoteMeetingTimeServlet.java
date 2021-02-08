package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingTimeFields;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.lang.IllegalArgumentException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet to handle the fetching and creating of MeetingTime entities */
@WebServlet("/vote-meeting-time")
public class VoteMeetingTimeServlet extends HttpServlet {

  /** Increments the voteCount of the MeetingTime identified by the provided MeetingTimeId */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Expect the query string to be of the following format: ?meetingTimeId=ID&voters=VOTER
    String keyStr = request.getParameter(MeetingTimeFields.MEETING_TIME_ID);
    String voter = request.getParameter(MeetingTimeFields.VOTERS);

    if (keyStr == null || voter == null) {
      ServletUtil.sendErrorResponse(
        response, 
        HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR
      );
      return;
    }

    Key key;
    try {
      key = KeyFactory.stringToKey(keyStr);
    } catch(IllegalArgumentException e) {
      // The keyStr is an invalid key
      ServletUtil.sendErrorResponse(
        response, 
        HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.INVALID_KEY_ERROR
      );
      return;
    }

    // Filter by Key
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity meetingTime;

    try {
      meetingTime = datastore.get(key);
    } catch (EntityNotFoundException e) {
      // Entity by the given key is not found
      ServletUtil.sendErrorResponse(
        response, 
        HttpServletResponse.SC_NOT_FOUND, 
        ErrorMessages.ENTITY_NOT_FOUND_ERROR
      );
      return;
    }

    HashSet<String> voters;
    if (meetingTime.getProperty(MeetingTimeFields.VOTERS) == null) {
      voters = new HashSet<String>();
    } else {
      voters = 
          new HashSet<String>(
            (ArrayList<String>) meetingTime.getProperty(MeetingTimeFields.VOTERS)
          );
    }

    // If this voter has voted for this time before, they cannot vote again
    if (!voters.add(voter)) {
      ServletUtil.sendErrorResponse(
        response, 
        HttpServletResponse.SC_CONFLICT, 
        ErrorMessages.USER_HAS_VOTED_ERROR
      );
      return;
    }

    int currentVotes = 
        ((Long) meetingTime.getProperty(MeetingTimeFields.VOTE_COUNT)).intValue();
    meetingTime.setProperty(MeetingTimeFields.VOTE_COUNT, currentVotes + 1);
    meetingTime.setProperty(MeetingTimeFields.VOTERS, voters);
    datastore.put(meetingTime);

    // Return the OK status
    HashMap<String, Object> status = new HashMap<String, Object>() {{
      put("status", HttpServletResponse.SC_OK);
    }};

    response.setContentType("application/json");
    response.getWriter().println(ServletUtil.convertMapToJson(status));
  }
}
