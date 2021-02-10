package test.java.com.google.sps;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.mockito.Mockito.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import main.java.com.google.sps.servlets.LocationServlet;
import main.java.com.google.sps.dao.LocationDao;
import main.java.com.google.sps.data.Location;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Type;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

/** Tests for LocationServlet.java */
@RunWith(JUnit4.class)
public class LocationServletTest {
  // Values to use for testing
  private final Location LOCATION_A =
      new Location("Sushi Train", 15.0, 150.0, "I like sushi!", 1, "key");

  // Acceptable difference from original location's lat/lng.
  // A difference of 0.00001 is roughly equivalent to one meter.
  private final static double DELTA = 0.00001;

  private HttpServletRequest request;
  private HttpServletResponse response;
  private LocationDao mockedLocationDao;
  private StringWriter stringWriter = new StringWriter();
  private PrintWriter writer = new PrintWriter(stringWriter);

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

  private Gson gson = new Gson();

  @Before
  public void setUp() throws IOException {
    helper.setUp();
    request = mock(HttpServletRequest.class);       
    response = mock(HttpServletResponse.class);  
    mockedLocationDao = mock(LocationDao.class);
    when(response.getWriter()).thenReturn(writer);
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  /** 
   * Tests if the recieved requests are correctly sent to the LocationDAO
   * and the key is sent in the response.
   */
  @Test
  public void doPostTest() throws IOException {
    // Set up request mock
    when(request.getParameter("title")).thenReturn(LOCATION_A.getTitle());
    when(request.getParameter("lat")).thenReturn(Double.toString(LOCATION_A.getLat()));
    when(request.getParameter("lng")).thenReturn(Double.toString(LOCATION_A.getLng()));
    when(request.getParameter("note")).thenReturn(LOCATION_A.getNote());
   
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
    stringWriter.flush();
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

    try {
      // Note: When mocking a function that throws an exception, the exception
      // must be caught or throw to compile.
      when(mockedLocationDao.getAll(any(String[].class))).thenReturn(listToReturn);
    } catch (Exception e) {
      fail();
    }

    // Set up reqest mock.
    String[] keyStrings = new String[] {LOCATION_A.getKeyString()};
    when(request.getParameterValues("locationKeys")).thenReturn(keyStrings);
    
    LocationServlet servlet = new LocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doGet(request, response);

    try {
      // Check that the key strings in the request were sent to the dao.
      verify(mockedLocationDao).getAll(keyStrings);
    } catch (Exception e) {
      fail();
    }
  
    // Check that the corresponding locations were sent in the key string.
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
    assertEquals(LOCATION_A.getKeyString(), printedLocation.getKeyString());
  }
}
