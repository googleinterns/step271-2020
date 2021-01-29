package test.java.com.google.sps;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
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
import com.google.appengine.api.datastore.EntityNotFoundException;
import main.java.com.google.sps.servlets.UpdateLocationServlet;
import main.java.com.google.sps.data.Location;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import main.java.com.google.sps.servlets.LocationServlet;
import main.java.com.google.sps.data.Location;
import main.java.com.google.sps.data.LocationDao;

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

/** Tests for UpdateLocationServlet.java */
@RunWith(JUnit4.class)
public class UpdateLocationServletTest {
  // Values to use for testing
  private final Location LOCATION_A = new Location("Sushi Train", 15.0, 150.0, "I like sushi!", 1);

  private HttpServletRequest request;
  private HttpServletResponse response;
  private LocationDao mockedLocationDao;
  
  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

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

  /** Tests if the keystring from the request is sent to the LocationDAO. */
  @Test
  public void doPostTest() {
    // Set up request mock
    String keyString =
        KeyFactory.keyToString(KeyFactory.createKey("Location", LOCATION_A.getTitle()));
    when(request.getParameter("key")).thenReturn(keyString);

    UpdateLocationServlet servlet = new UpdateLocationServlet();
    servlet.setDao(mockedLocationDao);
    servlet.doPost(request, response);
    
    try {
      verify(mockedLocationDao, times(1)).update(keyString);
    } catch (EntityNotFoundException e) {
      fail();
    }
  }
}
