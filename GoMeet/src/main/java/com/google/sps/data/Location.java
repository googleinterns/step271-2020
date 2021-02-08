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

  /** 
   * Checks if this location is equal to another location. 
   * Locations are equal if they have the same title, lat, lng, note and the 
   * key strings are not different.
   * Note: Location entities are the same even if one key string is null.
   * That is because locations' MeetingID+Title are unique.
   * @param o the object to compare this location to.
   */
  @Override
  public boolean equals(Object o) {
    if (o == this) {
      return true;
    }
    if (!(o instanceof Location)) {
      return false;
    }
    Location otherLocation = (Location) o;
    
    return this.title.equals(otherLocation.getTitle()) &&
        (Double.compare(this.lat, otherLocation.getLat()) == 0) &&
        (Double.compare(this.lng, otherLocation.getLng()) == 0) &&
        this.note.equals(otherLocation.getNote()) &&
        ((this.keyString == otherLocation.getKeyString()) ||
        this.keyString == null ||
        otherLocation.getKeyString() == null ||
        this.keyString.equals(otherLocation.getKeyString()));
  }
}
