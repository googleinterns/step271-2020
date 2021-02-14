package test.java.com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.*;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.TimePeriod;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import com.google.sps.data.ErrorMessages;
import com.google.sps.servlets.GoogleCalendarTimesServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Tests for doGet of GoogleCalendarTimesServlet
 */
@RunWith(JUnit4.class)
public final class GoogleCalendarTimesServletTest {
  // Hardcoded data
  private final String GUEST_LIST_STR = "guest1@email.com,guest2@email.com";
  private final ArrayList<String> GUEST_LIST = new ArrayList<String>(Arrays.asList("guest1@email.com", 
      "guest2@email.com"));
  private final String DURATION_MINS = "30"; 
  private final String DURATION_HOURS = "0"; 
  private final int DURATION_MS = 30 * 60 * 1000;
  private final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm";
  private final String TIMEZONE = "AET";
  private final String PERIOD_START_STR = "2021-02-11T10:00";
  private final String PERIOD_END_STR = "2021-02-11T18:00";
  private final String TIME_10AM = "2021-02-11T10:00";
  private final String TIME_12PM = "2021-02-11T12:00";
  private final String TIME_2PM = "2021-02-11T14:00";
  private final String TIME_4PM = "2021-02-11T16:00";

  private Date periodStart; 
  private Date periodEnd;
  
  // Mocks
  private HttpServletRequest mockedRequest;       
  private HttpServletResponse mockedResponse;
  private StringWriter stringWriter;
  private PrintWriter writer;

  // Spies
  private GoogleCalendarTimesServlet servletSpy;

  @Before
  public void setUp() throws IOException, ParseException {
    mockedRequest = mock(HttpServletRequest.class);      
    mockedResponse = mock(HttpServletResponse.class);
    stringWriter = new StringWriter();
    writer = new PrintWriter(stringWriter);
    when(mockedResponse.getWriter()).thenReturn(writer);

    // Mock the return values from getting parameters of request query string
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.GUEST_LIST))
        .thenReturn(GUEST_LIST_STR);
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.DURATION_MINS))
        .thenReturn(DURATION_MINS);
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.DURATION_HOURS))
        .thenReturn(DURATION_HOURS);
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.PERIOD_START))
        .thenReturn(PERIOD_START_STR);
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.PERIOD_END))
        .thenReturn(PERIOD_END_STR);
    
    // Initialise the Dates here to recognise the ParseException.
    SimpleDateFormat formatter = new SimpleDateFormat(DATE_FORMAT);
    formatter.setTimeZone(TimeZone.getTimeZone(TIMEZONE));
    periodStart = formatter.parse(PERIOD_START_STR);
    periodEnd = formatter.parse(PERIOD_END_STR);

    // Initialise a new spy every test to ensure atomicity
    GoogleCalendarTimesServlet.setTimezone(TIMEZONE);
    servletSpy = spy(new GoogleCalendarTimesServlet());
  }
  
  // Tests for doGet
  @Test 
  public void testSuccessfulDoGet() throws IOException, ParseException {
    List<TimePeriod> freeTimes = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_12PM),
      timePeriodFromDatestring(TIME_2PM, TIME_4PM)
    );

    doReturn(freeTimes).when(servletSpy)
        .autoProposeTimes(mockedResponse, GUEST_LIST, periodStart, periodEnd, DURATION_MS);

    servletSpy.doGet(mockedRequest, mockedResponse);

    // Check that the autoProposeTimes function was actually called.
    verify(servletSpy)
        .autoProposeTimes(mockedResponse, GUEST_LIST, periodStart, periodEnd, DURATION_MS);

    // Check that the response is the expected.
    List<String> expectedReturn = Arrays.asList(
        // The start times of the free time blocks.
        "2021-02-11T10:00:00.000Z",
        "2021-02-11T14:00:00.000Z"
    );
    Gson gson = new Gson();
    writer.flush();
    String actual = stringWriter.toString();
    String expected = gson.toJson(expectedReturn);
    assertTrue(actual.contains(expected)); 

    // Check that the size of the returned JSON arrays are equal
    // This will prevent the case where actual and expected are both null
    JsonArray resultsJsonObj = new JsonParser().parse(actual).getAsJsonArray();
    JsonArray expectedJsonObj = new JsonParser().parse(expected).getAsJsonArray(); 
    assertEquals(resultsJsonObj.size(), expectedJsonObj.size());
    
    // Check each individual entry in returned list
    for (int i = 0; i < resultsJsonObj.size(); i++) {
      assertEquals(resultsJsonObj.get(i), expectedJsonObj.get(i));
    }
  }
   
  @Test 
  public void testDoGetNullGuestList() throws IOException {
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.GUEST_LIST))
        .thenReturn(null);
    
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, mockedResponse, stringWriter, writer);
  }

  @Test 
  public void testDoGetNullDurationHours() throws IOException {
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.DURATION_HOURS))
        .thenReturn(null);
    
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, mockedResponse, stringWriter, writer);
  }

  @Test 
  public void testDoGetNullDurationMins() throws IOException {
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.DURATION_MINS))
        .thenReturn(null);
    
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, mockedResponse, stringWriter, writer);
  }

  @Test 
  public void testDoGetNullPeriodStart() throws IOException {
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.PERIOD_START))
        .thenReturn(null);
    
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, mockedResponse, stringWriter, writer);
  }

  @Test 
  public void testDoGetNullPeriodEnd() throws IOException {
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.PERIOD_END))
        .thenReturn(null);
    
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_REQUEST_ERROR, mockedResponse, stringWriter, writer);
  }
  
  @Test 
  public void testInvalidDateFormat() throws IOException {
    when(mockedRequest.getParameter(
      GoogleCalendarTimesServlet.QueryStringFieldNames.PERIOD_START))
        .thenReturn("12th Feb 2021 11:00"); // The date is of invalid format.
    
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.INVALID_ARG_FORMAT, mockedResponse, stringWriter, writer);
  }

  @Test
  public void testSecurityErrorFromAPI() throws IOException {
    GoogleCalendarTimesServlet.setApiKey("invalid_key");

    // There will be a security exception, since API key is invalid.
    servletSpy.doGet(mockedRequest, mockedResponse);

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_FORBIDDEN, 
        ErrorMessages.SECURITY_ERROR, mockedResponse, stringWriter, writer);
    
    // Check that autoProposeTimes returned null.
    assertNull(servletSpy.autoProposeTimes(mockedResponse, GUEST_LIST, 
        periodStart, periodEnd, DURATION_MS));
  }

   /**
    * Creates a TimePeriod with a start and end time as given in the 
    * parameters. The start and end times are timezone data independent.
    * @param start The start time in the format "yyyy-MM-dd'T'HH:mm"
    * @param end The end time in the format "yyyy-MM-dd'T'HH:mm"
    * @return The created TimePeriod
    * @throws ParseException
    */
  private TimePeriod timePeriodFromDatestring(String start, String end) 
      throws ParseException {
    SimpleDateFormat formatterNoTimeZone = new SimpleDateFormat(DATE_FORMAT);
    DateTime startDateTime = new DateTime(formatterNoTimeZone.parse(start));
    DateTime endDateTime = new DateTime(formatterNoTimeZone.parse(end));
    TimePeriod time = new TimePeriod()
        .setStart(startDateTime)
        .setEnd(endDateTime);
    return time;
  }
}
