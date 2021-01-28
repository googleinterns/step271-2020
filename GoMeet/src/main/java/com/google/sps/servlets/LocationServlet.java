package main.java.com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import main.java.com.google.sps.data.Location;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

/** Handles fetching and saving location data. */
@WebServlet("/location-data")
public class LocationServlet extends HttpServlet {

  private static final long INITIAL_VOTE_COUNT = 1;

 /** Responds with a JSON array containing location data. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    Collection<Location> locations = getLocations();
    Gson gson = new Gson();
    String json = gson.toJson(locations);

    response.getWriter().println(json);
  }

  /** Accepts a POST request containing a new location. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    String note = Jsoup.clean(request.getParameter("note"), Whitelist.none());
    String title = Jsoup.clean(request.getParameter("title"), Whitelist.none());

    Location location = new Location(title, lat, lng, note, INITIAL_VOTE_COUNT);
    String entityKeyString = storeLocation(location);

    response.setContentType("application/json");
    Gson gson = new Gson();
    response.getWriter().println(gson.toJson(entityKeyString));
  }

  /** Stores a location in Datastore. */
  private String storeLocation(Location location) {
    Entity locationEntity = new Entity("Location");
    locationEntity.setProperty("title", location.getTitle());
    locationEntity.setProperty("lat", location.getLat());
    locationEntity.setProperty("lng", location.getLng());
    locationEntity.setProperty("note", location.getNote());
    locationEntity.setProperty("voteCount", location.getVoteCount());

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(locationEntity);
    String keyString = KeyFactory.keyToString(locationEntity.getKey());
    return keyString;
  }

  /** Gets the locations stored in Datastore. */
  private Collection<Location> getLocations() {
    Collection<Location> locations = new ArrayList<>();
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query("Location");
    PreparedQuery results = datastore.prepare(query);
    for (Entity entity : results.asIterable()) {
      double lat = (double) entity.getProperty("lat");
      double lng = (double) entity.getProperty("lng");
      String title = (String) entity.getProperty("title");
      String note = (String) entity.getProperty("note");
      long voteCount = (long) entity.getProperty("voteCount");

      Location location = new Location(title, lat, lng, note, voteCount);
      locations.add(location);
    }
    return locations;
  }
}
