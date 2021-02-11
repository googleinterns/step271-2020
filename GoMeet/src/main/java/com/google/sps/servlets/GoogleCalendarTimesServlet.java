package com.google.sps.servlets;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.TimePeriod;
import com.google.gson.Gson;
import com.google.sps.data.AutoProposeTimes;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingEventFields;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/gcal-find-times")
public class GoogleCalendarTimesServlet extends HttpServlet {
  // TODO: Load the API_KEY from a file.
  private static String API_KEY = "";
  
  /** Field names used for accessing pairs in the query string 
    * sent to this servlet */
  public static class QueryStringFieldNames {
    public static final String GUEST_LIST = "guest-list";
    public static final String DURATION_MINS = "duration-mins";
    public static final String DURATION_HOURS = "duration-hours";
    public static final String PERIOD_START = "period-start";
    public static final String PERIOD_END = "period-end";
  }

  /** 
   * GET request for automatically proposed times using Google Calendar.
   * Returns the list of possible meeting times in JSON format.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String guestListUri = request.getParameter(QueryStringFieldNames.GUEST_LIST);
    String durationMinsStr = request.getParameter(QueryStringFieldNames.DURATION_MINS); 
    String durationHoursStr = request.getParameter(QueryStringFieldNames.DURATION_HOURS);
    String periodStartStr = request.getParameter(QueryStringFieldNames.PERIOD_START); 
    String periodEndStr = request.getParameter(QueryStringFieldNames.PERIOD_END);

    if (guestListUri == null || durationHoursStr == null || durationMinsStr == null || 
        periodStartStr == null || periodEndStr == null) {
      ServletUtil.sendErrorResponse(response, 
          HttpServletResponse.SC_BAD_REQUEST, 
          ErrorMessages.BAD_REQUEST_ERROR);
      return;
    }

    // 'guestListStr' are sent by the request as an encoded URI.
    String guestListStr = ServletUtil.decodeUri(guestListUri);
    // Each element in the decoded list is deliminated by a comma.
    ArrayList<String> guestList = new ArrayList<String> (Arrays.asList(guestListStr.split(","))); 

    // Convert hours and minutes duration to milliseconds.
    int totalDurationMs = 
        (Integer.parseInt(durationHoursStr) * 60 + Integer.parseInt(durationMinsStr)) * 60 * 1000;
    
    Date periodStart;
    Date periodEnd;
    
    try {
      SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
      periodStart = formatter.parse(periodStartStr);
      periodEnd = formatter.parse(periodEndStr);
    } catch (ParseException e) {
      ServletUtil.sendErrorResponse(response, 
          HttpServletResponse.SC_BAD_REQUEST, 
          ErrorMessages.INVALID_ARG_FORMAT);
      return;
    }

    List<TimePeriod> times = autoProposeTimes(response, guestList, 
        periodStart, periodEnd, totalDurationMs);
    if (times == null) {
      return; // The error message would have been sent by autoProposeTimes.
    }

    // Build JSON response.
    response.setContentType("application/json");
    response.getWriter().println(timePeriodListToJson(times));
  }

  /**
   * Converts a List<TimePeriod> to a JSON String that represents a List of 
   * Strings. Each String is the datetime string of the START time of each
   * TimePeriod (i.e. the meeting time proposed will be at the beginning of each 
   * free TimePeriod in times)
   * @param times The List of TimePeriods representing the free times proposed
   * by AutoProposeTimes.
   * @return The String in JSON notation of the resultant list of possible
   * meeting times. 
   */
  private String timePeriodListToJson(List<TimePeriod> times) {
    // Return times that are the start times of each TimePeriod in times
    List<String> timesStr = new ArrayList<String>();
    for (int i = 0; i < times.size(); i++) {
      String current = times.get(i).getStart().toString();
      timesStr.add(current);
    }
    Gson gson = new Gson();
    return gson.toJson(timesStr);
  }
  
  /**
   * Instantiates the AutoProposeTimes class and calls the proposeTimes()
   * function, returning the result from the proposeTimes() call.
   * NOTE: This code encapsulated in a function to make it easier to
   * mock out the calls to AutoProposeTimes in the tests for the servlet.
   * @param response The response from the servlet, to send error messages on
   * failures.
   * @param guestList The list of guests' calendar IDs
   * @param periodStart The start of the period to generate times for.
   * @param periodEnd The end of the period
   * @param totalDurationMs Duration of the meeting to be scheduled, in milliseconds.
   * @return The List of TimePeriod as returned by a successful call to proposeTimes, 
   * or null if the call returned errors.
   * @see AutoProposeTimes class
   */
  public List<TimePeriod> autoProposeTimes(HttpServletResponse response, 
      ArrayList<String> guestList, Date periodStart, 
      Date periodEnd, int totalDurationMs) throws IOException {
    
    AutoProposeTimes proposer;
    List<TimePeriod> times;
    
    try {
      Calendar service = new Calendar.Builder(GoogleNetHttpTransport.newTrustedTransport(),
        GsonFactory.getDefaultInstance(), 
        null)
        .setApplicationName("GoMeet")
        .build();
      proposer = new AutoProposeTimes(service, API_KEY, guestList, 
          periodStart, periodEnd, totalDurationMs);
      times = proposer.proposeTimes();
    } catch (GeneralSecurityException | GoogleJsonResponseException e) {
      ServletUtil.sendErrorResponse(response, 
          HttpServletResponse.SC_FORBIDDEN, 
          ErrorMessages.SECURITY_ERROR);
      return null;
    }

    return times;
  }

  /**
   * Sets a new API key for this servlet to access the Google
   * Calendar API.
   * @param newKey The new API key.
   */
  public static void setApiKey(String newKey) {
    API_KEY = newKey;
  }
}
