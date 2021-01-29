package main.java.com.google.sps.data;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import main.java.com.google.sps.data.Location;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

/** Provides functionality for fetching, adding, updating and deleting Location entities. */
public class LocationDao implements Dao<Location> {
  private DatastoreService ds;

  public LocationDao() {
    this.ds = DatastoreServiceFactory.getDatastoreService();
  }

  @Override 
  public Optional<Location> get(String keyString) {
    return Optional.empty();
  }

  /** Returns a collection of the location entites on the database. */
  @Override
  public List<Location> getAll() {
    List<Location> locations = new ArrayList<>();
    return locations;
  }

  @Override
  public void save(Location location) {

  }

  @Override 
  public void update(String keyString) {

  }

  @Override
  public void delete(String keyString) {

  }
}
