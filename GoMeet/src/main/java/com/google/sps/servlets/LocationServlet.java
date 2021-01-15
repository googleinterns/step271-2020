package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.sps.data.Location;
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
@WebServlet("/locations")
public class LocationServlet extends HttpServlet {
  /** Accepts a POST request containing a new location. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) {
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    String note = Jsoup.clean(request.getParameter("note"), Whitelist.none());
    String title = Jsoup.clean(request.getParameter("title"), Whitelist.none());

    Location location = new Location(title, lat, lng, note);
    storeLocation(location);
  }

  /** Stores a location in Datastore. */
  public void storeLocation(Location location) {
    Entity locationEntity = new Entity("Location");
    locationEntity.setProperty("title", location.getTitle());
    locationEntity.setProperty("lat", location.getLat());
    locationEntity.setProperty("lng", location.getLng());
    locationEntity.setProperty("note", location.getNote());

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(locationEntity);
  }
}
