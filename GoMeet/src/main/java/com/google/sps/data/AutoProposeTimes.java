package com.google.sps.data;

import com.google.api.client.util.DateTime;
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
}
