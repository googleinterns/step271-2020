package test.java.com.google.sps;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;

import main.java.com.google.sps.servlets.LocationServlet;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.data.LocationDao;

import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.beans.Transient;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;

/** Tests for LocationServlet.java */
@RunWith(JUnit4.class)
public class LocationServletTest {
  // Values to use for testing
  private final Location LOCATION_A = new Location("Sushi Train", 15.0, 150.0, "I like sushi!", 1);

  // Acceptable difference from original location's lat/lng.
  // A difference of 0.00001 is roughly equivalent to one meter.
  private final static double DELTA = 0.00001;

  private HttpServletRequest request;
  private HttpServletResponse response;
  private LocationDao mockedLocationDao;

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

  private Gson gson = new Gson();

  @Before
  public void setUp() {
    helper.setUp();
    request = mock(HttpServletRequest.class);       
    response = mock(HttpServletResponse.class);  
    mockedLocationDao = mock(LocationDao.class);
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  /** 
   * Tests if the recieved requests is correctly sent to the LocationDAO
   * and the key is sent in the response.
   */
  @Test
  public void doPostTest() throws IOException {
    // Set up request mock
    when(request.getParameter("title")).thenReturn(LOCATION_A.getTitle());
    when(request.getParameter("lat")).thenReturn(Double.toString(LOCATION_A.getLat()));
    when(request.getParameter("lng")).thenReturn(Double.toString(LOCATION_A.getLng()));
    when(request.getParameter("note")).thenReturn(LOCATION_A.getNote());

    // Set up response mock writer
    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    // Set up DAO mock
    String keyString = KeyFactory.keyToString(KeyFactory.createKey("Location", 123));
    when(mockedLocationDao.save((Location)notNull())).thenReturn(keyString);

    LocationServlet servlet = new LocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doPost(request, response);
    
    // Check the mockedDao was called with the correct parameters
    ArgumentCaptor<Location> captor = ArgumentCaptor.forClass(Location.class);
    verify(mockedLocationDao, times(1)).save(captor.capture());
    Location actual = captor.getValue();
    assertEquals(LOCATION_A, actual);

    // Check the entity's key was sent in the response.
    String sentString = gson.fromJson(stringWriter.toString(), String.class);
    assertEquals(keyString, sentString);
  }

  /** 
   * Tests if stored locations are returned as a JSON string when there is 
   * one location stored.
   */
  @Test
  public void doGetTest() throws IOException {
    // Set up DAO mock
    List<Location> listToReturn = new ArrayList<>(Arrays.asList(LOCATION_A));
    when(mockedLocationDao.getAll()).thenReturn(listToReturn);

    // Set up response mock
    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    LocationServlet servlet = new LocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doGet(request, response);

    stringWriter.flush();
    String responseString = stringWriter.toString();

    Type locationListType = new TypeToken<ArrayList<Location>>(){}.getType();
    ArrayList<Location> locationList = gson.fromJson(responseString, locationListType); 

    assertEquals(1, locationList.size());

    Location printedLocation = locationList.get(0);
    
    assertEquals(LOCATION_A.getTitle(), printedLocation.getTitle());
    assertEquals(LOCATION_A.getLat(), (double) printedLocation.getLat(), DELTA);
    assertEquals(LOCATION_A.getLng(), (double) printedLocation.getLng(), DELTA);
    assertEquals(LOCATION_A.getNote(), printedLocation.getNote());
  }
}
