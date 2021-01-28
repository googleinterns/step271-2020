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

import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import static org.mockito.Mockito.*;

/** Tests for LocationServlet.java */
@RunWith(JUnit4.class)
public class LocationServletTest {
  // Values to use for testing
  private final String TITLE_A = "The Pancake Place";
  private final String NOTE_A = "Good Pancakes!";
  private final String LAT_A = "33.0";
  private final String LNG_A = "150.0";
  private final long INIT_VOTE_COUNT = 1;
  private final double LAT_A_VALUE = Double.parseDouble(LAT_A);
  private final double LNG_A_VALUE = Double.parseDouble(LNG_A);
  private final Location LOCATION_A = new Location("Sushi Train", 15.0, 150.0, "I like sushi!", 1);

  private HttpServletRequest request;
  private HttpServletResponse response;

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

  @Before
  public void setUp() {
    helper.setUp();
    request = mock(HttpServletRequest.class);       
    response = mock(HttpServletResponse.class);  
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  /** 
   * Tests if new location entity is accurately added to the Database.
   * Run this test twice to prove we're not leaking any state across tests.
   */
  private void doPostTest() throws IOException {
    DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
   
    when(request.getParameter("title")).thenReturn(TITLE_A);
    when(request.getParameter("lat")).thenReturn(LAT_A);
    when(request.getParameter("lng")).thenReturn(LNG_A);
    when(request.getParameter("note")).thenReturn(NOTE_A);

    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    new LocationServlet().doPost(request, response);
    
    // Check location entity was added to Datastore
    assertEquals(1, ds.prepare(new Query("Location")).countEntities(withLimit(10)));

    Query query = new Query("Location");
    PreparedQuery preparedQuery = ds.prepare(query);
    Entity result = preparedQuery.asSingleEntity();

    // Check the entity property values were assigned correctly
    assertEquals(TITLE_A, result.getProperty("title"));
    assertEquals(LAT_A_VALUE, result.getProperty("lat"));
    assertEquals(LNG_A_VALUE, result.getProperty("lng"));
    assertEquals(NOTE_A, result.getProperty("note"));
    assertEquals(INIT_VOTE_COUNT, result.getProperty("voteCount"));

    // Check the entity's key was sent in the response.
    Gson gson = new Gson();
    String expectedJson = gson.toJson(KeyFactory.keyToString(result.getKey()));
    assertTrue(stringWriter.toString().contains(expectedJson));
  }

  @Test
  public void doPostTest1() throws IOException {
    doPostTest();
  }

  @Test
  public void doPostTest2() throws IOException {
    doPostTest();
  }

  /** 
   * Tests if stored locations are returned as a JSON string when there is 
   * one location stored.
   */
  @Test
  public void doGetTest() throws IOException {
    // Set up database
    DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
    Entity location = new Entity("Location");
    location.setProperty("title", TITLE_A);
    location.setProperty("lat", LAT_A_VALUE);
    location.setProperty("lng", LNG_A_VALUE);
    location.setProperty("note", NOTE_A);
    location.setProperty("voteCount", INIT_VOTE_COUNT);
    ds.put(location);

    String keyString = KeyFactory.keyToString(location.getKey());

    Location expectedLocation =
        new Location(TITLE_A, LAT_A_VALUE, LNG_A_VALUE, NOTE_A, INIT_VOTE_COUNT, keyString);

    Gson gson = new Gson();
    String expectedJson = gson.toJson(new ArrayList<>(Arrays.asList(expectedLocation)));

    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    new LocationServlet().doGet(request, response);
    assertTrue(stringWriter.toString().contains(expectedJson));
  }
}
