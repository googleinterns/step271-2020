package test.java.com.google.sps;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import main.java.com.google.sps.servlets.LocationServlet;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.dao.LocationDao;
import main.java.com.google.sps.exceptions.SimilarEntityExistsException;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Tests for LocationDao.java */
@RunWith(JUnit4.class)
public class LocationDaoTest {
  private final long INIT_VOTE_COUNT = 1;
  private final Location LOCATION_A = new Location("Cake Shop", 10.0, 15.0, "I like Cakes!", 1);
  private final Location LOCATION_B = new Location("Fruit Shop", 22.0, 60.0, "", 1);
  private final Location REPEAT_TITLE_LOCATION =
      new Location("Fruit Shop", 25.0, 60.0, "I like oranges.", 1);

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
  private DatastoreService ds;
  private LocationDao locationDao;

  @Before
  public void setUp() {
    helper.setUp();
    ds = DatastoreServiceFactory.getDatastoreService();
    locationDao = new LocationDao();
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

  /** Tests if getAll() returns the location entities on the database. */
  @Test
  public void getAllTestSingle() {
    // Set up database
    String key1 = addLocationToDatabase(LOCATION_A);

    // Expected result
    Location updatedLocationA =
        new Location(LOCATION_A.getTitle(), LOCATION_A.getLat(), LOCATION_A.getLng(),
        LOCATION_A.getNote(), LOCATION_A.getVoteCount(), key1);
    
    List<Location> result = locationDao.getAll(); 

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

    List<Location> result = locationDao.getAll(); 
    
    assertTrue(result.contains(LOCATION_A));
    assertTrue(result.contains(LOCATION_B));
  }

  /** Tests if a location is saved to datastore with the correct properties. */
  @Test
  public void saveTest() {
    String keyString = "";

    try {
      keyString = locationDao.save(LOCATION_A);
    } catch (Exception e) {
      fail();
    }
    
    // Check location entity was added to Datastore
    assertEquals(1, ds.prepare(new Query("Location")).countEntities(withLimit(10)));

    Query query = new Query("Location");
    PreparedQuery preparedQuery = ds.prepare(query);
    Entity result = preparedQuery.asSingleEntity();

    // Check the entity property values were assigned correctly
    assertEquals(LOCATION_A.getTitle(), result.getProperty("title"));
    assertEquals(LOCATION_A.getLat(), result.getProperty("lat"));
    assertEquals(LOCATION_A.getLng(), result.getProperty("lng"));
    assertEquals(LOCATION_A.getNote(), result.getProperty("note"));
    assertEquals(LOCATION_A.getVoteCount(), ((Long) result.getProperty("voteCount")).intValue());
   
    // Check if the key was returned
    assertEquals(KeyFactory.keyToString(result.getKey()), keyString);
  }

  /** Tests if EntityExistException is thrown when an invalid title is given. */
  @Test(expected = SimilarEntityExistsException.class)
  public void saveInvalidTitleTest() throws Exception {
    addLocationToDatabase(LOCATION_B);
    locationDao.save(REPEAT_TITLE_LOCATION);
  }
  
  /** Tests that update() adds one to the entity's voteCount. */
  @Test
  public void updateTest() {
    Entity location = new Entity("Location");
    location.setProperty("title", LOCATION_A.getTitle());
    location.setProperty("lat", LOCATION_A.getLat());
    location.setProperty("lng", LOCATION_A.getLng());
    location.setProperty("note", LOCATION_A.getNote());
    location.setProperty("voteCount", LOCATION_A.getVoteCount());
    ds.put(location);

    String keyString = KeyFactory.keyToString(location.getKey());

    try {
      locationDao.updateVote(keyString);
      Entity retrievedLocation = ds.get(location.getKey());
      assertEquals(2, ((Long) retrievedLocation.getProperty("voteCount")).intValue());
    } catch (EntityNotFoundException e) {
      fail();
    }
  }

  /** Tests if an exception is thrown if the entity does not exist. */
  @Test(expected = EntityNotFoundException.class)
  public void updateTestNoEntity() throws Exception {
    // Create a key that is not on the database
    Key key = KeyFactory.createKey("Tacos", 12345);
    String keyString = KeyFactory.keyToString(key);
    locationDao.updateVote(keyString);
  }
}
