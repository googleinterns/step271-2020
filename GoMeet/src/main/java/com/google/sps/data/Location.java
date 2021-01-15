package com.google.sps.data;
import java.util.Collection;

/** Represents a possible venue for a meeting. */
public class Location {

  private final String title;
  private final double lat;
  private final double lng;
  private final String note;
  private int voteCount;
  private Collection<String> voters;

  public Location(String title, double lat, double lng, String note) {
    this.title = title;
    this.lat = lat;
	this.lng = lng;
    this.note = note;
    this.voteCount = 1;
  }

  public String getTitle() {
    return title;
  }

  public double getLat() {
    return lat;
  }

  public double getLng() {
    return lng;
  }

  public String getNote() {
    return note;
  }

  public int getVoteCount() {
    return voteCount;
  }

  public Collection<String> getVoters() {
    return voters;
  }
}
