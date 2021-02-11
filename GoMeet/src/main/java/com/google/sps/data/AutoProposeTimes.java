package com.google.sps.data;

import com.google.api.client.util.DateTime;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
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
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class AutoProposeTimes {
  private final String RFC3339_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";

  Calendar service;
  String apiKey; 
  ArrayList<String> calendarId; // The List of Calendar IDs to generate meeting times for
  DateTime startTime; // The start time of the period to look for possible meeting times
  DateTime endTime; // The end time of the period to look for possible meeting times
  int meetingDuration; // The meetingDuration in milliseconds.

   /**
    * Constructor.
    * NOTE: Calendar service is dependency injected to allow for easier testing.
    * @param service The com.google.api.services.calendar.Calendar service to use to 
    * call APIs from.
    * @param apiKey The API Key to use the Google Calendar API.
    * @param calId This list of calendar IDs of calendars to automatically generate
    * meeting times from.
    * @param startTime The start of the period in which to search for meeting times.
    * @param endTime The end of the period in which search for meeting times.
    * @param duration The duration of the meeting, in milliseconds.
    */
  public AutoProposeTimes(Calendar service, String apiKey, ArrayList<String> calId, 
      Date startTime, Date endTime, int duration) {
    this.service = service;
    this.apiKey = apiKey;
    this.calendarId = calId;
    this.startTime = new DateTime(startTime);
    this.endTime = new DateTime(endTime);
    this.meetingDuration = duration;
  }

  /**
   * Used for sorting TimePeriods from earliest start time
   * to latest start time.
   */
  static class TimePeriodComparator implements Comparator<TimePeriod> {
    public int compare(TimePeriod a, TimePeriod b) { 
      // Compare the number of milliseconds since the Unix epoch of 
      // the TimePeriod starts.
      return (int) (a.getStart().getValue() - b.getStart().getValue()); 
    } 
  }

  /**
   * Generates a List of TimePeriod representing free times with a duration of 
   * at least the value of 'meetingDuration'.
   * @return A List of TimePeriod that are free periods where a
   * meeting may be scheduled.
   */
  public List<TimePeriod> proposeTimes() 
      throws IOException, GoogleJsonResponseException, GeneralSecurityException {
    // Gather freebusy information for each of the calendars.
    List<TimePeriod> busyPeriods = new ArrayList<TimePeriod>();
    List<TimePeriod> freePeriods = new ArrayList<TimePeriod>();
    for (int i = 0; i < calendarId.size(); i++) {
      busyPeriods.addAll(freebusyRequest(calendarId.get(i)));
    }

    // If there are no busyPeriods, add a free time that is the whole period, and return
    if (busyPeriods.size() == 0) {
      freePeriods.add(newTimePeriod(this.startTime, this.endTime));
      return freePeriods;
    }

    // Sort all the busy periods by start time: O(Nlog(N))
    Collections.sort(busyPeriods, new TimePeriodComparator());

    long durationStartOfDay;
    // Add the free time block from startTime to first busy period, if any.
    DateTime firstBusyPeriod = busyPeriods.get(0).getStart();
    durationStartOfDay = firstBusyPeriod.getValue() - this.startTime.getValue();
    if (durationStartOfDay >= this.meetingDuration) {
      freePeriods.add(newTimePeriod(this.startTime, firstBusyPeriod));
    }

    // Generate the free periods: O(N)
    int i = 0;
    TimePeriod current = busyPeriods.get(i);
    DateTime lastBusyPeriodEnd = current.getEnd();

    while (i < busyPeriods.size()) {
      int j = i + 1;
      while (j < busyPeriods.size() 
          && current.getEnd().getValue() > 
              busyPeriods.get(j).getStart().getValue()) {
        // While the end of the current event overlaps over the start of the next event
        j++;
      }
      if (j == busyPeriods.size()) {
        break;
      }
      // Check that the duration of the free period is at least
      // of 'meetingDuration' length.
      DateTime periodStart = current.getEnd(); 
      DateTime periodEnd = busyPeriods.get(j).getStart();
      long duration = periodEnd.getValue() - periodStart.getValue();
      if (duration >= this.meetingDuration) {
        freePeriods.add(newTimePeriod(periodStart, periodEnd));
      }
      // Start from the last TimePeriod we passed in inner loop.
      i = j;
      current = busyPeriods.get(i);
      lastBusyPeriodEnd = current.getEnd();
    }

    // Add the free time block from end of lastest busy period to endTime, if any.
    long durationEndOfDay;
    durationEndOfDay = this.endTime.getValue() - lastBusyPeriodEnd.getValue();
    if (durationEndOfDay >= this.meetingDuration) {
      freePeriods.add(newTimePeriod(lastBusyPeriodEnd, this.endTime));
    }

    return freePeriods;
  }

  /**
   * Makes a request to the Freebusy library of the Google Calendar API,
   * and returns the List of TimePeriods representing busy times of the
   * user between the startTime and endTime that this instance was 
   * initialised with.
   * @param calId The calendar identifier of the calendar to retireve busy
   * data from.
   * @return The List of TimePeriods representing busy times in the calendar
   * identified by the calId.
   * @throws IOException
   * @throws GeneralSecurityException
   */
  public List<TimePeriod> freebusyRequest(String calId) 
      throws IOException, GeneralSecurityException {
    FreeBusyRequestItem currentCalItem = new FreeBusyRequestItem().setId(calId);
    FreeBusyRequest req = new FreeBusyRequest()
        .setTimeMin(this.startTime)
        .setTimeMax(this.endTime)
        .setItems(Arrays.asList(currentCalItem));
    Freebusy freebusy = this.service.freebusy();
    Query query = freebusy.query(req).setKey(this.apiKey);
    FreeBusyResponse resp = query.execute();
    // Variable 'currentCal' will store the FreeBusy info of the calendar
    // with calId as its identifier.
    FreeBusyCalendar currentCal = resp.getCalendars().get(calId); 
    return currentCal.getBusy();
  }

  /**
   * Creates a new TimePeriod given the start and end DateTimes.
   * @param start The DateTime with the start date and time details.
   * @param end The DateTime with the end date and time details.
   * @return The new TimePeriod created.
   */
  private TimePeriod newTimePeriod(DateTime start, DateTime end) {
    TimePeriod time = new TimePeriod()
        .setStart(start)
        .setEnd(end);
    return time;
  }
}
