package main.java.com.google.sps.servlets;

import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.gson.Gson;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Comparator;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import main.java.com.google.sps.dao.Dao;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.dao.LocationDao;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;

/** Handles fetching and saving location data. */
@WebServlet("/popular-location-data")
public class PopularLocationServlet extends HttpServlet {
  private Dao<Location> locationDao = new LocationDao();

  /** Responds with a JSON array containing the most popular location data. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    List<Location> popularLocations = getPopularLocation();
    String json = ServletUtil.convertToJson(popularLocations);
    response.getWriter().println(json);
  }

  /** 
   * Returns a list of the locations with the highest vote count.
   * There can be multiple locations in the database with the highest vote count.
   * All of these would be returned in the list.
   */
  private List<Location> getPopularLocation() {
    List<Location> popularLocations = new ArrayList<>();
    List<Location> allLocations = locationDao.getAll();

    int maxVoteCount = 0;
    for (Location location : allLocations) {
      int currVoteCount = location.getVoteCount();
      if (currVoteCount < maxVoteCount) {
        continue;
      }
      if (currVoteCount > maxVoteCount) {
        popularLocations.clear();
        maxVoteCount = currVoteCount;
      }
      popularLocations.add(location);
    }
    return popularLocations;
  }

  public void setDao(LocationDao locationDao) {
    this.locationDao = locationDao;
  }
}
