package test.java.com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.sps.data.ErrorMessages;
import com.google.sps.servlets.VoteMeetingTimeServlet;
import com.google.sps.data.MeetingTimeFields;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.HashMap;

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
 * Tests for doPost of VoteMeetingTimeServlet
 */
@RunWith(JUnit4.class)
public final class VoteMeetingTimeServletTest {
  // Hardcoded data
  private String MEETING_TIME_ID_VAL;
  private final String DATETIME_VAL = "2021-01-20T16:33";
  private final int VOTE_COUNT_VAL = 2;
  // Note that HashSets will be stored as Lists in the Datastore, 
  // but can be re-converted back to a set after fetch
  private final HashSet<String> VOTERS_VAL = 
      new HashSet<String>(Arrays.asList("John Smith", "Bob Citizen"));
  private final String NEW_VOTER = "Mark Person";
  private final String EXISTING_VOTER = "John Smith";

  // Datastore service
  private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  
  // Mocks
  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
  private HttpServletRequest mockedRequest;       
  private HttpServletResponse mockedResponse;
  private StringWriter stringWriter;
  private PrintWriter writer;

  @Before
  public void setUp() throws IOException {
    // Set up mocks
    helper.setUp();
    mockedRequest = mock(HttpServletRequest.class);      
    mockedResponse = mock(HttpServletResponse.class);
    stringWriter = new StringWriter();
    writer = new PrintWriter(stringWriter);
    when(mockedResponse.getWriter()).thenReturn(writer);
    
    // Create an existing MeetingTime entity to be voted on and store in local datastore
    Entity meetingTime = new Entity("MeetingTime");
    meetingTime.setProperty(MeetingTimeFields.DATETIME, DATETIME_VAL);
    meetingTime.setProperty(MeetingTimeFields.VOTE_COUNT, VOTE_COUNT_VAL);
    meetingTime.setProperty(MeetingTimeFields.VOTERS, VOTERS_VAL);
    datastore.put(meetingTime);
    MEETING_TIME_ID_VAL = KeyFactory.keyToString(meetingTime.getKey());
  }
   
  @Test
  public void testSuccessfulVoteTime() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(MEETING_TIME_ID_VAL); 
    when(mockedRequest.getParameter(MeetingTimeFields.VOTERS))
        .thenReturn(NEW_VOTER);
    new VoteMeetingTimeServlet().doPost(mockedRequest, mockedResponse);
    
    // Check that the entity was updated as expected.
    Entity meetingTime = getHardcodedEntity();

    // Voters should now include NEW_VOTER, and the original voters
    HashSet<String> voters = 
        new HashSet<String>((ArrayList<String>) meetingTime.getProperty(MeetingTimeFields.VOTERS));
    assertTrue(voters.contains(NEW_VOTER));
    assertTrue(voters.containsAll(VOTERS_VAL));

    // Vote count should be incremented by 1
    int voteCount = ((Long) meetingTime.getProperty(MeetingTimeFields.VOTE_COUNT)).intValue();
    assertTrue(voteCount == VOTE_COUNT_VAL + 1);

    // HttpServletResponse.SC_OK status code should be returned
    HashMap<String, Object> status = new HashMap<String, Object>() {{
      put("status", HttpServletResponse.SC_OK);
    }};
    writer.flush(); // Writer may not have been flushed yet
    assertNotNull(stringWriter.toString()); 
    assertTrue(stringWriter.toString().contains(ServletUtil.convertMapToJson(status)));
  }
  
  @Test 
  public void testNullMeetingTimeId() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(null); // No ID provided
    when(mockedRequest.getParameter(MeetingTimeFields.VOTERS))
        .thenReturn(NEW_VOTER);
    new VoteMeetingTimeServlet().doPost(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, 
        mockedResponse, stringWriter, writer);
  }

  @Test
  public void testNullVoter() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(MEETING_TIME_ID_VAL); 
    when(mockedRequest.getParameter(MeetingTimeFields.VOTERS))
        .thenReturn(null); // Null voter
    new VoteMeetingTimeServlet().doPost(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, 
        mockedResponse, stringWriter, writer);
  }

  @Test
  public void testNoEntitiesFound() throws IOException {
    // Create a datastore entity, then delete. Trying to retrieve using this entity key 
    // would return no results.
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity fakeMeetingTime = new Entity("MeetingTime");
    datastore.put(fakeMeetingTime);
    Key fakeMeetingTimeKey = fakeMeetingTime.getKey();
    String fakeMeetingTimeKeyStr = KeyFactory.keyToString(fakeMeetingTimeKey);
    datastore.delete(fakeMeetingTimeKey);

    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(fakeMeetingTimeKeyStr);
    when(mockedRequest.getParameter(MeetingTimeFields.VOTERS))
        .thenReturn(NEW_VOTER);
    new VoteMeetingTimeServlet().doPost(mockedRequest, mockedResponse);

    // Check that error response was sent with appropriate details
    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_NOT_FOUND, 
        ErrorMessages.ENTITY_NOT_FOUND_ERROR, 
        mockedResponse, stringWriter, writer);
  }

  @Test
  public void testUserHasVoted() throws IOException {
    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(MEETING_TIME_ID_VAL); 
    when(mockedRequest.getParameter(MeetingTimeFields.VOTERS))
        .thenReturn(EXISTING_VOTER);
    new VoteMeetingTimeServlet().doPost(mockedRequest, mockedResponse);
    
    // Check that error response was sent with appropriate details
    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_CONFLICT, 
        ErrorMessages.USER_HAS_VOTED_ERROR, 
        mockedResponse, stringWriter, writer);
  }

  // Voter is the first voter - there were no past voters for the meeting time 
  @Test
  public void testFirstVoter() throws IOException {
    // Set the voters list in the hardcoded entity to be an empty list
    Entity meetingTime = getHardcodedEntity();
    meetingTime.setProperty(MeetingTimeFields.VOTERS, new ArrayList<String>());
    // Set the vote count to be 0
    meetingTime.setProperty(MeetingTimeFields.VOTE_COUNT, 0);
    datastore.put(meetingTime);

    when(mockedRequest.getParameter(MeetingTimeFields.MEETING_TIME_ID))
        .thenReturn(MEETING_TIME_ID_VAL); 
    when(mockedRequest.getParameter(MeetingTimeFields.VOTERS))
        .thenReturn(NEW_VOTER);
    new VoteMeetingTimeServlet().doPost(mockedRequest, mockedResponse);

    // Check that the entity was updated as expected.
    Entity updatedTime = getHardcodedEntity();

    // Voters should now JUST include NEW_VOTER, and NOT the original voters
    HashSet<String> voters = 
        new HashSet<String>((ArrayList<String>) updatedTime.getProperty(MeetingTimeFields.VOTERS));
    assertTrue(voters.contains(NEW_VOTER));
    assertFalse(voters.containsAll(VOTERS_VAL));

    // Vote count should be 1
    int voteCount = ((Long) updatedTime.getProperty(MeetingTimeFields.VOTE_COUNT)).intValue();
    assertTrue(voteCount == 1);

    // HttpServletResponse.SC_OK status code should be returned
    HashMap<String, Object> status = new HashMap<String, Object>() {{
      put("status", HttpServletResponse.SC_OK);
    }};
    writer.flush(); // Writer may not have been flushed yet
    assertNotNull(stringWriter.toString());
    assertTrue(stringWriter.toString().contains(ServletUtil.convertMapToJson(status)));
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  /**
   * Retrieved the one hardcoded entity from Local Datastore
   * @return the hardcoded MeetingTime Entity 
   */
  private Entity getHardcodedEntity() {
    Query query = new Query("MeetingTime");
    PreparedQuery preparedQuery = datastore.prepare(query);
    Entity result = preparedQuery.asSingleEntity();
    return result;
  }

  /**
   * Check that the hardcoded MeetingTime Entity in Local Datastore
   * has the same values as what it was originally hardcoded with.
   * @return true if the hardcoded entity was not modified, otherwise false
   */
  private boolean checkNothingModified() {
    Entity meetingTime = getHardcodedEntity();
    // Voters should just include the original voters
    HashSet<String> voters = 
        new HashSet<String>((ArrayList<String>) meetingTime.getProperty(MeetingTimeFields.VOTERS));
    if (voters.contains(NEW_VOTER) || !voters.containsAll(VOTERS_VAL)) {
      return false;
    }
    // Vote count should be same as original value
    int voteCount = ((Long) meetingTime.getProperty(MeetingTimeFields.VOTE_COUNT)).intValue();
    if (voteCount != VOTE_COUNT_VAL) {
      return false;
    }
    return true;
  }
}
