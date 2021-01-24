package test.java.com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.PreparedQuery.TooManyResultsException;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.sps.data.ErrorMessages;
import com.google.sps.servlets.MeetingTimeServlet;
import com.google.sps.data.MeetingTimeFields;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.TooManyListenersException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Before;
import org.junit.After;
import org.junit.Assert;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Test;

/**
 * Tests for doGet and doPost of MeetingTimeServlet
 */
@RunWith(JUnit4.class)
public final class MeetingTimeServletTest {
  // Hardcoded data
  private final String MEETING_TIME_ID_VAL = "abc123def456";
  private final int VOTE_COUNT_VAL = 2;
  private final String DATETIME_VAL = "2021-01-20T16:33:00";
  private final List VOTERS_VAL = new ArrayList<String>(Arrays.asList("John Smith", "Bob Citizen"));

  // Mocks
  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
  private HttpServletRequest mockedRequest;       
  private HttpServletResponse mockedResponse;
  private StringWriter stringWriter;
  private PrintWriter writer;

  @Before
  public void setUp() throws IOException {
    helper.setUp();
    mockedRequest = mock(HttpServletRequest.class);      
    mockedResponse = mock(HttpServletResponse.class);
    stringWriter = new StringWriter();
    writer = new PrintWriter(stringWriter);
    when(mockedResponse.getWriter()).thenReturn(writer);
  }

  // Tests for doPost
  @Test
  public void testSuccessfulNewDoPost() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.DATETIME)).thenReturn(DATETIME_VAL); 
    new MeetingTimeServlet().doPost(mockedRequest, mockedResponse);
    List<Entity> results = getAllEntities();

    // Assert that exactly one entity was added 
    assertEquals(1, results.size());
    Entity result = results.get(0);
    Key resultKey = result.getKey();

    // Check the entity property values were assigned correctly
    // Note that Key is not assigned yet in the testing environment of Local Datastore
    assertNotNull(result.getProperty(MeetingTimeFields.MEETING_TIME_ID));
    assertEquals(DATETIME_VAL, result.getProperty(MeetingTimeFields.DATETIME));
    assertEquals((long) 0, result.getProperty(MeetingTimeFields.VOTE_COUNT));

    // Assert that key is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(resultKey.toString()));
  }
  
  @Test 
  public void testNullDatetimeQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.DATETIME)).thenReturn(null); // null datetime
    new MeetingTimeServlet().doPost(mockedRequest, mockedResponse);
    // check that error response was sent with appropriate details
    verify(mockedResponse, times(1)).sendError(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_REQUEST_ERROR);

    List<Entity> results = getAllEntities();
    assertEquals(0, results.size());

    // Assert that nothing is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(""));
  }

  // Tests for doGet
  @Test 
  public void testSuccessfulDoGet() throws IOException {
    // hardcode an entity in local datastore
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity fakeMeetingTime = new Entity("MeetingTime");
    String fakeMeetingTimeKey = fakeMeetingTime.getKey().toString();
    fakeMeetingTime.setProperty(MeetingTimeFields.MEETING_TIME_ID, fakeMeetingTimeKey);
    fakeMeetingTime.setProperty(MeetingTimeFields.DATETIME, DATETIME_VAL);
    fakeMeetingTime.setProperty(MeetingTimeFields.VOTE_COUNT, VOTE_COUNT_VAL);
    fakeMeetingTime.setProperty(MeetingTimeFields.VOTERS, VOTERS_VAL);
    datastore.put(fakeMeetingTime); // stores to local datastore

    // add all data to hashmap, and convert to JSON
    HashMap<String, Object> fakeMeetingTimeMap = new HashMap<String, Object>() {{
      put(MeetingTimeFields.DATETIME, DATETIME_VAL);
      put(MeetingTimeFields.VOTE_COUNT, VOTE_COUNT_VAL);
      put(MeetingTimeFields.VOTERS, VOTERS_VAL);
    }};
    String fakeMeetingTimeJson = ServletUtil.convertToJson(fakeMeetingTimeMap);

    // fetch the entity
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(fakeMeetingTimeKey); 
    new MeetingTimeServlet().doGet(mockedRequest, mockedResponse);

    // expect the JSON to be returned & no calls to response.sendError
    writer.flush();
    assertTrue(stringWriter.toString().contains(fakeMeetingTimeJson));
    verify(mockedResponse, never()).sendError(anyInt(), anyString());
  }
   
  @Test 
  public void testDoGetNullKey() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(null); // null key
    new MeetingTimeServlet().doGet(mockedRequest, mockedResponse);
    
    // check that error response was sent with appropriate details
    verify(mockedResponse, times(1))
        .sendError(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_REQUEST_ERROR);

    // Assert that nothing is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(""));
  }
  
  @Test 
  public void testDoGetMultipleEntitiesReturned() throws IOException {
    // hardcode two entities with identical MEETING_TIME_ID in local datastore
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity fakeMeetingTime1 = new Entity("MeetingTime");
    fakeMeetingTime1.setProperty(MeetingTimeFields.MEETING_TIME_ID, MEETING_TIME_ID_VAL);
    datastore.put(fakeMeetingTime1); // stores to local datastore
    Entity fakeMeetingTime2 = new Entity("MeetingTime");
    fakeMeetingTime2.setProperty(MeetingTimeFields.MEETING_TIME_ID, MEETING_TIME_ID_VAL);
    datastore.put(fakeMeetingTime2);

    // fetch the entity
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID)).thenReturn(MEETING_TIME_ID_VAL); 
    new MeetingTimeServlet().doGet(mockedRequest, mockedResponse);
<<<<<<< HEAD
    TooManyResultsException exception = new TooManyResultsException();
=======
    
>>>>>>> 198a789 (remove instantiation of unused exception)
    // check that error response was sent with appropriate details
    verify(mockedResponse, times(1))
        .sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, ErrorMessages.TOO_MANY_RESULTS_ERROR);

    // Assert that nothing is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(""));
  }
  
  @Test 
  public void testDoGetNoResults() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID)).thenReturn("non-existent key");
    new MeetingTimeServlet().doGet(mockedRequest, mockedResponse);
    
    // check that error response was sent with appropriate details
    verify(mockedResponse, times(1))
        .sendError(HttpServletResponse.SC_NOT_FOUND, ErrorMessages.ENTITY_NOT_FOUND_ERROR);

    // Assert that nothing is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(""));
  }
  @After
  public void tearDown() {
    helper.tearDown();
  }

  private List<Entity> getAllEntities() {
    // Check that everything has been stored as expected
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query("MeetingTime");
    PreparedQuery preparedQuery = datastore.prepare(query);
    List<Entity> results = preparedQuery.asList(FetchOptions.Builder.withDefaults());
    return results;
  }
}
