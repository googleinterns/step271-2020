package main.java.com.google.sps.data;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import main.java.com.google.sps.data.Location;

/** Provides functionality for fetching, adding, updating and deleting Location entities. */
public class LocationDao implements Dao<Location> {
  private DatastoreService ds;

  public LocationDao() {
    this.ds = DatastoreServiceFactory.getDatastoreService();
  }

  @Override 
  public Optional<Location> get(String keyString) {
    // TODO:
    return Optional.empty();
  }

  /** Returns a list of the location entites on the database. */
  @Override
  public List<Location> getAll() {

    List<Location> locations = new ArrayList<>();
    
    Query query = new Query("Location");
    PreparedQuery results = ds.prepare(query);

    for (Entity entity : results.asIterable()) {
      double lat = (double) entity.getProperty("lat");
      double lng = (double) entity.getProperty("lng");
      String title = (String) entity.getProperty("title");
      String note = (String) entity.getProperty("note");
      int voteCount = ((Long) entity.getProperty("voteCount")).intValue();
      String keyString = KeyFactory.keyToString(entity.getKey()); 
      // TODO: Handle situation when one of these properties is missing

      Location location = new Location(title, lat, lng, note, voteCount, keyString);
      locations.add(location);
    }
    return locations;
  }

  /** 
   * Stores a new location on datastore.
   * Returns the key string of the new entity.
   */
  @Override
  public String save(Location location) {
    Entity entity = new Entity("Location");
    entity.setProperty("title", location.getTitle());
    entity.setProperty("lat", location.getLat());
    entity.setProperty("lng", location.getLng());
    entity.setProperty("note", location.getNote());
    entity.setProperty("voteCount", location.getVoteCount());
    ds.put(entity);

    return KeyFactory.keyToString(entity.getKey());
  }

  /** Increments the vote count of the location entity with the give keyString. */
  @Override 
  public void updateVote(String keyString) throws EntityNotFoundException {
    Key entityKey = KeyFactory.stringToKey(keyString);
    Entity entity = ds.get(entityKey);
    int currentCount = ((Long) entity.getProperty("voteCount")).intValue();
    entity.setProperty("voteCount", currentCount + 1);
    ds.put(entity);
  }

  @Override
  public void delete(String keyString) {
    //TODO:
  }
}
