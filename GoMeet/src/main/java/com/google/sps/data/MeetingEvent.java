package com.google.sps.data;
import java.util.HashSet;
import java.util.List;

/** Represents a meeting event */
public class MeetingEvent {
  private final String meetingName;
  private final int durationMins; 
  private final int durationHours; 
  private final String timeFindMethod; 
  private final List<String> guestList; 
  private final List<String> meetingTimeIds; 
  private final List<String> meetingLocationIds;

  public MeetingEvent(String meetingName, int durationMins, int durationHours, 
      String timeFindMethod, List<String> guestList, List<String> meetingTimeIds, 
      List<String> meetingLocationIds) {
    this.meetingName = meetingName; 
    this.durationMins = durationMins; 
    this.durationHours = durationHours; 
    this.timeFindMethod = timeFindMethod; 
    this.guestList = guestList; 
    this.meetingTimeIds = meetingTimeIds; 
    this.meetingLocationIds = meetingLocationIds; 
  }

  public void addGuest(String guest) {
    guestList.add(guest); 
  }

  public void addTime(String meetingTimeId) {
    meetingTimeIds.add(meetingTimeId);
  }

  public void addLocation(String meetingLocationId) {
    meetingLocationIds.add(meetingLocationId); 
  }
  
  public String getMeetingName() {
    return meetingName;
  }

  public int getDurationMins() {
    return durationMins;
  }

  public int getDurationHours() {
    return durationHours;
  }

  public String getTimeFindMethod() {
    return timeFindMethod;
  }

  public List<String> getGuestList() {
    return guestList;
  }

  public List<String> getMeetingTimeIds() {
    return meetingTimeIds;
  }

  public List<String> getMeetingLocationIds() {
    return meetingLocationIds; 
  }
}
