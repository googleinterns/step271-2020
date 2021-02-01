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
import com.google.sps.servlets.MeetingEventServlet;
import com.google.sps.data.MeetingEventFields;
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
import org.json.simple.JSONObject;
import org.junit.Before;
import org.junit.After;
import org.junit.Assert;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Test;

/**
 * Tests for doGet and doPost of MeetingEventServlet
 */
@RunWith(JUnit4.class)
public final class MeetingEventServletTest {
  // Hardcoded meetingEvent entity data 
  private final String MEETING_EVENT_ID = "qwerty12345";
  private final String MEETING_NAME = "Christmas Lunch"; 
  private final String DURATION_MINS = "30"; 
  private final String DURATION_HOURS = "1"; 
  private final String TIME_FIND_METHOD = "manual"; 
  private final String GUEST_LIST_STR = "guest1@email.com,guest2@email.com,guest3@email.com";
  private final String MEETING_TIME_IDS_STR = "abc123,def456,ghi789";
  private final String MEETING_LOCATION_IDS_STR = "abc987,def654,ghi321";
  private final List GUEST_LIST = new ArrayList<String>(Arrays.asList("guest1@email.com", 
      "guest2@email.com", "guest3@email.com")); 
  private final List MEETING_TIME_IDS = new ArrayList<String>(Arrays.asList("abc123", 
      "def456", "ghi789")); 
  private final List MEETING_LOCATION_IDS = new ArrayList<String>(Arrays.asList("abc987", 
      "def654", "ghi321")); 
  
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
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_NAME)).thenReturn(MEETING_NAME);
    when(mockedRequest.getParameter(MeetingEventFields.DURATION_MINS)).thenReturn(DURATION_MINS);
    when(mockedRequest.getParameter(MeetingEventFields.DURATION_HOURS)).thenReturn(DURATION_HOURS);
    when(mockedRequest.getParameter(MeetingEventFields.TIME_FIND_METHOD)).thenReturn(TIME_FIND_METHOD);
    when(mockedRequest.getParameter(MeetingEventFields.GUEST_LIST)).thenReturn(GUEST_LIST_STR);
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_TIME_IDS)).thenReturn(MEETING_TIME_IDS_STR);
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_LOCATION_IDS)).thenReturn(MEETING_LOCATION_IDS_STR);
  }
  
  // Tests for doPost
  @Test
  public void testSuccessfulNewDoPost() throws IOException {
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    List<Entity> results = getAllEntities();

    // Assert that exactly one entity was added 
    assertEquals(1, results.size());

    Entity result = results.get(0);

    // Check the entity property values were assigned correctly
    String resultKey = KeyFactory.keyToString(result.getKey());
    assertNotNull(resultKey);
    assertEquals(MEETING_NAME, result.getProperty(MeetingEventFields.MEETING_NAME)); 
    assertEquals(DURATION_MINS, result.getProperty(MeetingEventFields.DURATION_MINS)); 
    assertEquals(DURATION_HOURS, result.getProperty(MeetingEventFields.DURATION_HOURS)); 
    assertEquals(TIME_FIND_METHOD, result.getProperty(MeetingEventFields.TIME_FIND_METHOD)); 
    assertEquals(GUEST_LIST, result.getProperty(MeetingEventFields.GUEST_LIST)); 
    assertEquals(MEETING_TIME_IDS, result.getProperty(MeetingEventFields.MEETING_TIME_IDS)); 
    assertEquals(MEETING_LOCATION_IDS, result.getProperty(MeetingEventFields.MEETING_LOCATION_IDS)); 

    // Assert that key is returned as a JSON string
    HashMap<String, Object> keyObj = new HashMap<String, Object>() {{
      put(MeetingEventFields.MEETING_EVENT_ID, resultKey);
    }};
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(ServletUtil.convertMapToJson(keyObj)));
  }
  
  @Test 
  public void testNullMeetingNameQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_NAME)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  @Test 
  public void testNullDurationMinsQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.DURATION_MINS)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  @Test 
  public void testNullDurationHoursQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.DURATION_HOURS)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  @Test 
  public void testNullTimeFindMethodQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.TIME_FIND_METHOD)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  @Test 
  public void testNullGuestListQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.GUEST_LIST)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  @Test 
  public void testNullMeetingTimeIdsQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_TIME_IDS)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  @Test 
  public void testNullMeetingLocationIdsQuery() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_LOCATION_IDS)).thenReturn(null);
    new MeetingEventServlet().doPost(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_POST_REQUEST_ERROR);
  }

  // Tests for doGet
  @Test 
  public void testSuccessfulDoGet() throws IOException {
    // Hardcod a meetingEvent entity in local datastore
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity fakeMeetingEvent = new Entity("MeetingEvent");
    fakeMeetingEvent.setProperty(MeetingEventFields.MEETING_NAME, MEETING_NAME);
    fakeMeetingEvent.setProperty(MeetingEventFields.DURATION_MINS, DURATION_MINS);
    fakeMeetingEvent.setProperty(MeetingEventFields.DURATION_HOURS, DURATION_HOURS);
    fakeMeetingEvent.setProperty(MeetingEventFields.TIME_FIND_METHOD, TIME_FIND_METHOD);
    fakeMeetingEvent.setProperty(MeetingEventFields.GUEST_LIST, GUEST_LIST);
    fakeMeetingEvent.setProperty(MeetingEventFields.MEETING_TIME_IDS, MEETING_TIME_IDS);
    fakeMeetingEvent.setProperty(MeetingEventFields.MEETING_LOCATION_IDS, MEETING_LOCATION_IDS);
    datastore.put(fakeMeetingEvent); // Stores to local datastore
    String fakeMeetingEventKey = KeyFactory.keyToString(fakeMeetingEvent.getKey());

    // Add all data to hashmap, and convert to JSON
    HashMap<String, Object> fakeMeetingEventMap = new HashMap<String, Object>() {{
      put(MeetingEventFields.MEETING_NAME, MEETING_NAME);
      put(MeetingEventFields.DURATION_MINS, DURATION_MINS);
      put(MeetingEventFields.DURATION_HOURS, DURATION_HOURS);
      put(MeetingEventFields.TIME_FIND_METHOD, TIME_FIND_METHOD);
      put(MeetingEventFields.GUEST_LIST, GUEST_LIST);
      put(MeetingEventFields.MEETING_TIME_IDS, MEETING_TIME_IDS);
      put(MeetingEventFields.MEETING_LOCATION_IDS, MEETING_LOCATION_IDS);
    }};
    String fakeMeetingEventJson = ServletUtil.convertMapToJson(fakeMeetingEventMap); 

    // Fetch the entity
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_EVENT_ID))
        .thenReturn(fakeMeetingEventKey); 
    new MeetingEventServlet().doGet(mockedRequest, mockedResponse);

    // Expect the JSON to be returned
    writer.flush();
    assertTrue(stringWriter.toString().contains(fakeMeetingEventJson)); 
  }

  @Test 
  public void testDoGetNullKey() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_EVENT_ID)).thenReturn(null);
    new MeetingEventServlet().doGet(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_GET_REQUEST_ERROR);
  }

  @Test 
  public void testDoGetInvalidKey() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_EVENT_ID)).thenReturn("non-existent key");
    new MeetingEventServlet().doGet(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.INVALID_KEY_ERROR);
  }

  @Test
  public void testDoGetNoResults() throws IOException {
    // Create a datastore entity, then delete. Trying to retrieve using this entity key would
    // return no results.
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity fakeMeetingEvent = new Entity("MeetingEvent");
    datastore.put(fakeMeetingEvent);
    Key fakeMeetingEventKey = fakeMeetingEvent.getKey();
    String fakeMeetingEventKeyStr = KeyFactory.keyToString(fakeMeetingEventKey);
    datastore.delete(fakeMeetingEventKey);

    when(mockedRequest.getParameter(MeetingEventFields.MEETING_EVENT_ID)).thenReturn(fakeMeetingEventKeyStr);
    new MeetingEventServlet().doGet(mockedRequest, mockedResponse);
    testBadRequest(HttpServletResponse.SC_NOT_FOUND, ErrorMessages.ENTITY_NOT_FOUND_ERROR);
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  private List<Entity> getAllEntities() {
    // Check that everything has been stored as expected
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query("MeetingEvent");
    PreparedQuery preparedQuery = datastore.prepare(query);
    List<Entity> results = preparedQuery.asList(FetchOptions.Builder.withDefaults());
    return results;
  }

  private void testBadRequest(int status, String errorMessage) throws IOException {
    // Check that error response was sent with appropriate details
    HashMap errorResponse = new HashMap<String, Object>() {{
      put("status", status);
      put("message", errorMessage);
    }};

    String errorJson = ServletUtil.convertMapToJson(errorResponse);

    // Verify error status code set
    verify(mockedResponse, times(1)).setStatus(status);

    // Assert that error response is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(errorJson));
  }
}
