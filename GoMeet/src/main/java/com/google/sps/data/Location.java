package main.java.com.google.sps.data;
import java.util.Collection;
import java.util.HashSet;

/** Represents a possible venue for a meeting. */
public class Location {
  private final String title;
  private final double lat;
  private final double lng;
  private final String note;
  private int voteCount;
  private Collection<String> voters;
  private String keyString;

  public Location(String title, double lat, double lng, String note, int voteCount) {
    this.title = title;
    this.lat = lat;
    this.lng = lng;
    this.note = note;
    this.voteCount = voteCount;
    voters = new HashSet<>();
    this.keyString = null;
  }

  public Location(String title, double lat, double lng, String note, int voteCount, String keyString) {
    this.title = title;
    this.lat = lat;
    this.lng = lng;
    this.note = note;
    this.voteCount = voteCount;
    voters = new HashSet<>();
    this.keyString = keyString;
  }

  public void addVoter(String voter) {
    voters.add(voter);
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

  public String getKeyString() {
    return keyString;
  }
}
