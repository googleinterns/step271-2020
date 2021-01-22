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
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingTimeFields;
import java.io.IOException;
import java.util.ArrayList;
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
