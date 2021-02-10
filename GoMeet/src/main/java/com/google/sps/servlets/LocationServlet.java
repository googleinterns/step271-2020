package main.java.com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import main.java.com.google.sps.dao.Dao;
import main.java.com.google.sps.dao.LocationDao;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.exceptions.MaxEntitiesReachedException;
import main.java.com.google.sps.exceptions.SimilarEntityExistsException;

import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

import com.google.sps.data.ErrorMessages;
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

    List<Location> locations = locationDao.getAll();
    String json = ServletUtil.convertToJson(locations);

    response.getWriter().println(json);
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
    response.setContentType("application/json");

    try {
      String entityKeyString = locationDao.save(location);
      String json = ServletUtil.convertToJson(entityKeyString);
      response.getWriter().println(json);
    } catch (SimilarEntityExistsException e) {
      ServletUtil.sendErrorResponse(
          response, HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_REQUEST_ERROR_LOCATION);
    } catch (MaxEntitiesReachedException e) {
      ServletUtil.sendErrorResponse(
          response, HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.MAX_ENTITIES);
    }
  }

  public void setDao(LocationDao locationDao) {
    this.locationDao = locationDao;
  }
}
