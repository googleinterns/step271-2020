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

import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

/** Tests for LocationDao.java */
@RunWith(JUnit4.class)
public class LocationDaoTest {
  private final long INIT_VOTE_COUNT = 1;
  private final Location LOCATION_A = new Location("Cake Shop", 10.0, 15.0, "I like Cakes!", 1);
  private final Location LOCATION_B = new Location("Fruit Shop", 22.0, 60.0, "", 1);

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
  private DatastoreService ds;
  private LocationDao ld;

  @Before
  public void setUp() {
    helper.setUp();
    ds = DatastoreServiceFactory.getDatastoreService();
    ld = new LocationDao();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  /** 
   * Adds a location to the database.
   * Returns the key string of the newly added entity.
   */
  private String addLocationToDatabase(Location location) {
    Entity entity = new Entity("Location");  
    entity.setProperty("title", location.getTitle());
    entity.setProperty("lat", location.getLat());
    entity.setProperty("lng", location.getLng());
    entity.setProperty("note", location.getNote());
    entity.setProperty("voteCount", INIT_VOTE_COUNT);
    ds.put(entity);

    return KeyFactory.keyToString(entity.getKey());
  }

  /** Tests if the returns the location entities on the database. */
  @Test
  public void getAllTestSingle() {
    // Set up database
    String key1 = addLocationToDatabase(LOCATION_A);

    // Expected result
    Location updatedLocationA =
        new Location(LOCATION_A.getTitle(), LOCATION_A.getLat(), LOCATION_A.getLng(),
        LOCATION_A.getNote(), LOCATION_A.getVoteCount(), key1);
    
    List<Location> result = ld.getAll(); 

    assertEquals(updatedLocationA, result.get(0));
  }

  /**
   *  Tests if getAll() returns all the location entities when there are
   *  multiples entities in the database.
   */
  @Test 
  public void getAllTestMultiple() {
    // Set up database
    String key1 = addLocationToDatabase(LOCATION_A);
    String key2 = addLocationToDatabase(LOCATION_B);

    List<Location> result = ld.getAll(); 
    
    assertEquals(2, result.size());
  }
}
