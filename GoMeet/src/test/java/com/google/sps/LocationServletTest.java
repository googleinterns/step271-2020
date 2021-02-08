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
import com.google.sps.data.ErrorMessages;
import main.java.com.google.sps.servlets.LocationServlet;
import main.java.com.google.sps.dao.LocationDao;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.exceptions.SimilarEntityExistsException;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
  private final Location LOCATION_A = new Location("Sushi Train", 15.0, 150.0, "I like sushi!", 1);

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

    try {
      when(mockedLocationDao.save((Location)notNull())).thenReturn(keyString);
    } catch (Exception e) {
      fail();
    }
     
    LocationServlet servlet = new LocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doPost(request, response);
    
    // Check the mockedDao was called with the correct parameters
    ArgumentCaptor<Location> captor = ArgumentCaptor.forClass(Location.class);

    try {
       verify(mockedLocationDao, times(1)).save(captor.capture());
       Location actual = captor.getValue();
      assertEquals(LOCATION_A, actual);
    } catch (Exception e) {
      fail();
    }

    // Check the entity's key was sent in the response.
    stringWriter.flush();
    String sentString = gson.fromJson(stringWriter.toString(), String.class);
    assertEquals(keyString, sentString);
  }

  /**
   * Tests if an error message is sent if LocationDao throws a SimilarEntityExistsException.
   */
  @Test
  public void doPostRepeatedTitleTest() throws IOException {
    // Set up request mock
    when(request.getParameter("title")).thenReturn(LOCATION_A.getTitle());
    when(request.getParameter("lat")).thenReturn(Double.toString(LOCATION_A.getLat()));
    when(request.getParameter("lng")).thenReturn(Double.toString(LOCATION_A.getLng()));
    when(request.getParameter("note")).thenReturn(LOCATION_A.getNote());

    // Set up mock Dao
    try {
      doThrow(new SimilarEntityExistsException()).when(mockedLocationDao).save((Location)notNull());
    } catch (Exception e) {
      fail();
    }

    LocationServlet servlet = new LocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doPost(request, response);

    // Check if error response is sent.
    // TODO: Update to use testUtil.
    stringWriter.flush();
    String responseString = stringWriter.toString();

    Type responseMap = new TypeToken<HashMap<String, Object>>() {}.getType();
    Map<String, Object> map = gson.fromJson(responseString, responseMap);

    // Check hashmap with the correct values was sent.
    assertEquals((Double) map.get("status"), Double.valueOf(HttpServletResponse.SC_BAD_REQUEST));
    assertEquals((String) map.get("message"), ErrorMessages.BAD_REQUEST_ERROR_LOCATION);
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
