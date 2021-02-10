package com.google.sps.data;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar.Freebusy.Query;
import com.google.api.services.calendar.Calendar.Freebusy;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarRequest;
import com.google.api.services.calendar.model.FreeBusyCalendar;
import com.google.api.services.calendar.model.FreeBusyRequest;
import com.google.api.services.calendar.model.FreeBusyRequestItem;
import com.google.api.services.calendar.model.FreeBusyResponse;
import com.google.api.services.calendar.model.TimePeriod;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class AutoProposeTimes {
  Calendar service;
  ArrayList<String> calendarId; // The List of Calendar IDs to generate meeting times for
  DateTime startTime; // The start time of the period to look for possible meeting times
  DateTime endTime; // The end time of the period to look for possible meeting times
  int meetingDuration; // The meetingDuration in milliseconds.

   /**
    * Constructor.
    * NOTE: Calendar service is dependency injected to allow for easier testing.
    * @param service The com.google.api.services.calendar.Calendar service to use to 
    * call APIs from.
    * @param calId This list of calendar IDs of calendars to automatically generate
    * meeting times from.
    * @param startTime The start of the period in which to search for meeting times.
    * @param endTime The end of the period in which search for meeting times.
    * @param duration The duration of the meeting, in milliseconds.
    */
  public AutoProposeTimes(Calendar service, ArrayList<String> calId, 
      Date startTime, Date endTime, int duration) {
    this.service = service;
    this.calendarId = calId;
    this.startTime = new DateTime(startTime);
    this.endTime = new DateTime(endTime);
    this.meetingDuration = duration;
  }

  /**
   * Makes a request to the Freebusy library of the Google Calendar API,
   * and returns the List of TimePeriods representing busy times of the
   * user between the startTime and endTime that this instance was 
   * initialised with.
   * @param calId The calendar identifier of the calendar to retireve busy
   * data from.
   * @param apiKey The API key to access the Google Calendar API.
   * @return The List of TimePeriods representing busy times in the calendar
   * identified by the calId.
   * @throws IOException
   * @throws GeneralSecurityException
   */
  public List<TimePeriod> freebusyRequest(String calId, String apiKey) 
      throws IOException, GeneralSecurityException {
    FreeBusyRequestItem currentCalItem = new FreeBusyRequestItem().setId(calId);
    FreeBusyRequest req = new FreeBusyRequest()
        .setTimeMin(this.startTime)
        .setTimeMax(this.endTime)
        .setItems(Arrays.asList(currentCalItem));
    Freebusy freebusy = this.service.freebusy();
    Query query = freebusy.query(req).setKey(apiKey);
    FreeBusyResponse resp = query.execute();
    // Variable 'currentCal' will store the FreeBusy info of the calendar
    // with calId as its identifier.
    FreeBusyCalendar currentCal = resp.getCalendars().get(calId); 
    return currentCal.getBusy();
  }
}
