package com.google.sps;

import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.sps.servlets.LocationServlet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import static org.mockito.Mockito.*;

@RunWith(JUnit4.class)
public class LocationServletTest {

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

  /** Test if new location entity is accurately added to the Database.
   * Run this test twice to prove we're not leaking any state across tests.
   */
  private void doPostTest() {
    DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
   
    when(request.getParameter("title")).thenReturn("Location Title");
    when(request.getParameter("lat")).thenReturn("33.0");
    when(request.getParameter("lng")).thenReturn("150.0");
    when(request.getParameter("note")).thenReturn("My Note");

    new LocationServlet().doPost(request, response);
    
    // Check location entity was added to Datastore
    assertEquals(1, ds.prepare(new Query("Location")).countEntities(withLimit(10)));

    Query query = new Query("Location");
    PreparedQuery preparedQuery = ds.prepare(query);
    Entity result = preparedQuery.asSingleEntity();

    // Check the entity property values were assigned correctly
    assertEquals("Location Title", result.getProperty("title"));
    assertEquals(33.0, result.getProperty("lat"));
    assertEquals(150.0, result.getProperty("lng"));
    assertEquals("My Note", result.getProperty("note"));
  }

  @Test
  public void doPostTest1() {
    doPostTest();
  }

  @Test
  public void doPostTest2() {
    doPostTest();
  }
}
