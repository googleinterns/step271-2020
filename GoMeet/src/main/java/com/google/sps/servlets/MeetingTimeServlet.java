// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.PreparedQuery.TooManyResultsException;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingTimeFields;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.lang.IllegalArgumentException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.HashMap;
import java.util.HashSet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet to handle the fetching and creating of MeetingTime entities */
@WebServlet("/meeting-time")
public class MeetingTimeServlet extends HttpServlet {
  /** Fetches a MeetingTime entity from Datastore according to the entity ID in the query string */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyStr = request.getParameter(MeetingTimeFields.MEETING_TIME_ID);
    if (keyStr == null) {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_REQUEST_ERROR);
      return;
    }

    // filter by Key
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    FilterPredicate filter 
        = new FilterPredicate(MeetingTimeFields.MEETING_TIME_ID, FilterOperator.EQUAL, keyStr);
    Query query = new Query("MeetingTime").setFilter(filter);
    PreparedQuery preparedQuery = datastore.prepare(query);

    Entity result;
    // Expecting only one entity to be returned, since keys should be unique
    try {
      result = preparedQuery.asSingleEntity();
    } catch (PreparedQuery.TooManyResultsException e) {
      // there is more than the expected number of entities returned - non-unique key
      response.sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, ErrorMessages.TOO_MANY_RESULTS_ERROR);
      return;
    }

    if (result == null) {
      // entity by the given key is not found
      response.sendError(HttpServletResponse.SC_NOT_FOUND, ErrorMessages.ENTITY_NOT_FOUND_ERROR);
      return;
    }
    
    // Each of the fields will be set to null if not found in returned entity
    String datetime = (String) result.getProperty(MeetingTimeFields.DATETIME);
    Long voteCount = 
        result.getProperty(MeetingTimeFields.VOTE_COUNT) == null ? 
        null : (long) result.getProperty(MeetingTimeFields.VOTE_COUNT);
    List voters = (ArrayList) result.getProperty(MeetingTimeFields.VOTERS);
    // add all to hashmap,
    HashMap<String, Object> meetingTime = new HashMap<String, Object>() {{
      put(MeetingTimeFields.DATETIME, datetime);
      put(MeetingTimeFields.VOTE_COUNT, voteCount);
      put(MeetingTimeFields.VOTERS, voters);
    }};

    // return as JSON
    String meetingTimeJson = ServletUtil.convertToJson(meetingTime);
    response.setContentType("application/json");
    response.getWriter().println(meetingTimeJson);
  }
  
  /** Creates a new MeetingTime entity and stores it to Datastore */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // expect the query string to be of the following format: ?datetime=DATETIME
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    String datetime = request.getParameter(MeetingTimeFields.DATETIME);

    if (datetime == null) {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_REQUEST_ERROR);
      return;
    }

    Entity meetingTime = new Entity("MeetingTime");
    Key meetingTimeKey = meetingTime.getKey();
    meetingTime.setProperty(MeetingTimeFields.MEETING_TIME_ID, meetingTimeKey.toString());
    meetingTime.setProperty(MeetingTimeFields.DATETIME, datetime);
    meetingTime.setProperty(MeetingTimeFields.VOTE_COUNT, 0); // initially votes are 0
    datastore.put(meetingTime);

    // return the key of the created entity
    response.setContentType("application/text");
    response.getWriter().println(meetingTimeKey.toString());
  }
}
