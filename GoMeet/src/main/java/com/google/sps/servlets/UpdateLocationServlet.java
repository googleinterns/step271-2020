package main.java.com.google.sps.servlets;

import com.google.appengine.api.datastore.EntityNotFoundException;

import main.java.com.google.sps.data.Dao;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.data.LocationDao;
import com.google.sps.data.ServletUtil;
import com.google.sps.data.ErrorMessages;

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
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyString = request.getParameter("key");
    try {
      locationDao.update(keyString);
      response.setStatus(HttpServletResponse.SC_OK);
    } catch (EntityNotFoundException e) {
      ServletUtil.sendErrorResponse(
          response, HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.ENTITY_NOT_FOUND_ERROR);
    }
  }

  public void setDao(LocationDao locationDao) {
    this.locationDao = locationDao;
  }
};
