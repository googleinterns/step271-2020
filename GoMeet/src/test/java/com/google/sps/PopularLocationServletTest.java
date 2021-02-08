package test.java.com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import main.java.com.google.sps.servlets.PopularLocationServlet;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.data.LocationDao;
import java.util.ArrayList;
import java.util.Arrays;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Type;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;


/** Tests for PopularLocationServlet.java */
@RunWith(JUnit4.class)
public class PopularLocationServletTest {
  // Values to use for testing
  private final Location LOCATION_A =
      new Location("Burger Bonanza", 15.0, 150.0, "I like burgers!", 1);
  private final Location LOCATION_B =
      new Location("Pastry Patisserie", 20.0, 10.0, "Pastries are yum!", 5);
  private final Location LOCATION_C = new Location("Pizza Place", 20.0, 10.0, "Nice Cheese!", 5);

  private HttpServletRequest request;
  private HttpServletResponse response;
  private LocationDao mockedLocationDao;
  private StringWriter stringWriter = new StringWriter();
  private PrintWriter writer = new PrintWriter(stringWriter);
  private Gson gson = new Gson();

  @Before
  public void setUp() throws IOException {
    request = mock(HttpServletRequest.class);       
    response = mock(HttpServletResponse.class);  
    mockedLocationDao = mock(LocationDao.class);
    when(response.getWriter()).thenReturn(writer);
  }

  @After
  public void tearDown() {
  }

  /** 
   * Tests if the response contains the most popular location when there is
   * only one popular location.
   */
  @Test 
  public void doGetTestSingle() throws IOException {
    // Set up DAO mock
    List<Location> listToReturn = new ArrayList<>(Arrays.asList(LOCATION_A, LOCATION_B));
    when(mockedLocationDao.getAll()).thenReturn(listToReturn);

    PopularLocationServlet servlet = new PopularLocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doGet(request, response);

    // Check if the popular location was sent in the response
    stringWriter.flush();
    Type locationListType = new TypeToken<ArrayList<Location>>(){}.getType();
    ArrayList<Location> locationList = gson.fromJson(stringWriter.toString(), locationListType);

    assertTrue(locationList.contains(LOCATION_B));
    assertFalse(locationList.contains(LOCATION_A));
  }

  /**
   * Tests if the response contains the most popular locations when there are 
   * multiple popular locations.
   */
  @Test
  public void doGetTestMultiple() throws IOException {
    // Set up DAO mock
    List<Location> listToReturn =
        new ArrayList<>(Arrays.asList(LOCATION_A, LOCATION_B, LOCATION_C));
    when(mockedLocationDao.getAll()).thenReturn(listToReturn);

    PopularLocationServlet servlet = new PopularLocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doGet(request, response);

    // Check if the popular locations were sent in the response
    stringWriter.flush();
    Type locationListType = new TypeToken<ArrayList<Location>>(){}.getType();
    ArrayList<Location> locationList = gson.fromJson(stringWriter.toString(), locationListType);

    assertTrue(locationList.contains(LOCATION_B));
    assertTrue(locationList.contains(LOCATION_C));
    assertFalse(locationList.contains(LOCATION_A));   
  }

  /** Tests that an empty array is sent when there are no locations in the database. */
  @Test
  public void doGetEmptyDatabase() throws IOException {
    List<Location> emptyList = new ArrayList<>();
    when(mockedLocationDao.getAll()).thenReturn(emptyList);

    PopularLocationServlet servlet = new PopularLocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doGet(request, response);

    // Check if the no locations were sent in the response
    stringWriter.flush();
    Type locationListType = new TypeToken<ArrayList<Location>>(){}.getType();
    ArrayList<Location> locationList = gson.fromJson(stringWriter.toString(), locationListType);

   assertTrue(locationList.isEmpty());
  }

  /** 
   * Tests that an array with all the locations is sent when the locations'
   * vote counts are the same.
   */
  @Test
  public void doGetSameVoteCount() throws IOException {
    // Set up DAO mock
    List<Location> listToReturn = new ArrayList<>(Arrays.asList(LOCATION_B, LOCATION_C));
    when(mockedLocationDao.getAll()).thenReturn(listToReturn);

    PopularLocationServlet servlet = new PopularLocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doGet(request, response);

    // Check if the popular location was sent in the response
    stringWriter.flush();
    Type locationListType = new TypeToken<ArrayList<Location>>(){}.getType();
    ArrayList<Location> locationList = gson.fromJson(stringWriter.toString(), locationListType);

    assertTrue(locationList.contains(LOCATION_B));
    assertTrue(locationList.contains(LOCATION_C));
  }
}
