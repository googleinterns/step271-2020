package main.java.com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.EntityNotFoundException;

import main.java.com.google.sps.data.Dao;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.data.LocationDao;

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
@WebServlet("/update-location-data")
public class UpdateLocationServlet extends HttpServlet {

  private Dao<Location> locationDao = new LocationDao();

  /** Accepts a POST request with information about the location entity to add a vote to. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) {
    String keyString = request.getParameter("key");
    try {
      locationDao.update(keyString);
    } catch (EntityNotFoundException e) {
      // TODO: Send error for invalid input in the response.
      System.err.println("Entity not found"); 
    }
  }

  public void setDao(LocationDao locationDao) {
    this.locationDao = locationDao;
  }
};
