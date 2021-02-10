package main.java.com.google.sps.servlets;

import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import main.java.com.google.sps.dao.Dao;
import main.java.com.google.sps.dao.LocationDao;
import main.java.com.google.sps.data.Location;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

import com.google.sps.data.ServletUtil;

/** Handles fetching and saving location data. */
@WebServlet("/location-data")
public class LocationServlet extends HttpServlet {

  private static final int INITIAL_VOTE_COUNT = 1;
  private Dao<Location> locationDao = new LocationDao();
  
 /** Responds with a JSON array containing location data. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    String[] locationKeys = request.getParameterValues("locationKeys");

    try {
      List<Location> locations = locationDao.getAll(locationKeys);
      String json = ServletUtil.convertToJson(locations);
      response.getWriter().println(json);
    } catch (EntityNotFoundException e ) {
      // TODO: Handle entity not found.
    }
  }

  /** Accepts a POST request containing a new location. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // TODO: Send error response when there is already an entity with the same title in that meeting. 
    // This to keep the Meeting+Title unique for each location entity.
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    String note = Jsoup.clean(request.getParameter("note"), Whitelist.none());
    String title = Jsoup.clean(request.getParameter("title"), Whitelist.none());

    Location location = new Location(title, lat, lng, note, INITIAL_VOTE_COUNT);
    String entityKeyString = locationDao.save(location);

    response.setContentType("application/json");
    String json = ServletUtil.convertToJson(entityKeyString);
    response.getWriter().println(json);
  }

  public void setDao(LocationDao locationDao) {
    this.locationDao = locationDao;
  }
}
