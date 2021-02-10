package test.java.com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.*;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.FreeBusyRequest;
import com.google.api.services.calendar.model.FreeBusyRequestItem;
import com.google.api.services.calendar.model.TimePeriod;
import com.google.gson.Gson;
import com.google.sps.data.AutoProposeTimes;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/** Tests for AutoProposeTimes class */
@RunWith(JUnit4.class)
public class AutoProposeTimesTest {
  // Real objects.
  private Calendar service;
  private AutoProposeTimes proposer;

  // Spies of the real objects.
  private Calendar serviceSpy;
  private AutoProposeTimes proposerSpy;

  // Hardcoded data.
  private final int DURATION_MS = 30 * 60 * 1000; // 30 mins duration in milliseconds.
  private final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
  private final SimpleDateFormat FORMATTER = new SimpleDateFormat(DATE_FORMAT);
  private final ArrayList<String> CAL_ID = 
      new ArrayList<String> (Arrays.asList("person1@test.com", "person2@test.com"));
  private final String START_TIME_STR = "2021-02-10 10:00:00";
  private final String END_TIME_STR = "2021-02-11 10:00:00";
  private final String TIME_10AM = "2021-02-10 10:00:00";
  private final String TIME_12PM = "2021-02-10 12:00:00";
  private final String TIME_1230PM = "2021-02-10 12:30:00";
  private final String TIME_1PM = "2021-02-10 13:00:00";
  private final String TIME_2PM = "2021-02-10 14:00:00";
  private final String TIME_4PM = "2021-02-10 16:00:00";
  private final String TIME_6PM = "2021-02-10 18:00:00"; 
  private final String TIME_8PM = "2021-02-10 20:00:00"; 
  private final String TIME_10PM = "2021-02-10 22:00:00"; 
  private final String TIME_8AM_NEXTDAY = "2021-02-11 08:00:00";
  private final String TIME_10AM_NEXTDAY = "2021-02-11 10:00:00";

  private Date startTime;
  private Date endTime;

  @Before
  public void setup() throws GeneralSecurityException, IOException, ParseException {
    service = new Calendar.Builder(GoogleNetHttpTransport.newTrustedTransport(),
        GsonFactory.getDefaultInstance(),
        null)
        .setApplicationName("GoMeet")
        .build();
    serviceSpy = spy(service);
    // Initialise the Dates here to recognise the ParseException.
    startTime = FORMATTER.parse(START_TIME_STR);
    endTime = FORMATTER.parse(END_TIME_STR);
    proposer = new AutoProposeTimes(serviceSpy, CAL_ID, startTime, endTime, DURATION_MS);
    proposerSpy = spy(proposer);
  }

  /** Tests for proposeTimes */

  // The events of the two guests are separate in the day
  @Test
  public void separateBusyPeriods() throws Exception {
    List<TimePeriod> busyTimesPerson1 = Arrays.asList(
      timePeriodFromDatestring(TIME_4PM, TIME_6PM),
      timePeriodFromDatestring(TIME_8AM_NEXTDAY, TIME_10AM_NEXTDAY)
    );
    List<TimePeriod> busyTimesPerson2 = Arrays.asList(
      timePeriodFromDatestring(TIME_12PM, TIME_2PM),
      timePeriodFromDatestring(TIME_8PM, TIME_10PM)
    );

    doReturn(busyTimesPerson1).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(0)), anyString());
    doReturn(busyTimesPerson2).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(1)), anyString());

    List<TimePeriod> expectedReturn = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_12PM),
      timePeriodFromDatestring(TIME_2PM, TIME_4PM),
      timePeriodFromDatestring(TIME_6PM, TIME_8PM),
      timePeriodFromDatestring(TIME_10PM, TIME_8AM_NEXTDAY)
    );

    List<TimePeriod> result = proposerSpy.proposeTimes();

    // Assert list sizes are the same
    assertEquals(expectedReturn.size(), result.size());
    // Assert that both expected return and actual result are the same
    assertTrue(result.equals(expectedReturn));
  }

  // The busy periods of the guests overlap
  @Test
  public void overlappingBusyPeriods() throws Exception {
    List<TimePeriod> busyTimesPerson1 = Arrays.asList(
      timePeriodFromDatestring(TIME_1PM, TIME_2PM)
    );
    List<TimePeriod> busyTimesPerson2 = Arrays.asList(
      timePeriodFromDatestring(TIME_12PM, TIME_2PM)
    );

    doReturn(busyTimesPerson1).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(0)), anyString());
    doReturn(busyTimesPerson2).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(1)), anyString());

    List<TimePeriod> expectedReturn = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_12PM),
      timePeriodFromDatestring(TIME_2PM, TIME_10AM_NEXTDAY)
    );

    List<TimePeriod> result = proposerSpy.proposeTimes();

    // Assert list sizes are the same
    assertEquals(expectedReturn.size(), result.size());
    // Assert that both expected return and actual result are the same
    assertTrue(result.equals(expectedReturn));
  }

  @Test
  public void nestedEvents() throws Exception {
    List<TimePeriod> busyTimesPerson1 = Arrays.asList(
      // This event is nested in the 12PM-4PM event of person2.
      timePeriodFromDatestring(TIME_1PM, TIME_2PM),
      timePeriodFromDatestring(TIME_6PM, TIME_8PM)
    );
    List<TimePeriod> busyTimesPerson2 = Arrays.asList(
      timePeriodFromDatestring(TIME_12PM, TIME_4PM)
    );

    doReturn(busyTimesPerson1).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(0)), anyString());
    doReturn(busyTimesPerson2).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(1)), anyString());

    List<TimePeriod> expectedReturn = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_12PM),
      timePeriodFromDatestring(TIME_4PM, TIME_6PM),
      timePeriodFromDatestring(TIME_8PM, TIME_10AM_NEXTDAY)
    );

    List<TimePeriod> result = proposerSpy.proposeTimes();

    // Assert list sizes are the same
    assertEquals(expectedReturn.size(), result.size());
    // Assert that both expected return and actual result are the same
    assertTrue(result.equals(expectedReturn));
  }

  // Only one time slot possible considering all the busy periods
  @Test
  public void justEnoughRoom() throws Exception {
    List<TimePeriod> busyTimesPerson1 = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_12PM),
      timePeriodFromDatestring(TIME_2PM, TIME_8PM),
      timePeriodFromDatestring(TIME_10PM, TIME_10AM_NEXTDAY)
    );
    List<TimePeriod> busyTimesPerson2 = Arrays.asList(
      timePeriodFromDatestring(TIME_1230PM, TIME_2PM),
      timePeriodFromDatestring(TIME_1230PM, TIME_2PM),
      timePeriodFromDatestring(TIME_8PM, TIME_10PM)
    );

    doReturn(busyTimesPerson1).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(0)), anyString());
    doReturn(busyTimesPerson2).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(1)), anyString());

    List<TimePeriod> expectedReturn = Arrays.asList(
      timePeriodFromDatestring(TIME_12PM, TIME_1230PM)
    );

    List<TimePeriod> result = proposerSpy.proposeTimes();

    // Assert list sizes are the same
    assertEquals(expectedReturn.size(), result.size());
    // Assert that both expected return and actual result are the same
    assertTrue(result.equals(expectedReturn));
  }

  // No busy periods detected for all guests across the time period
  @Test
  public void noBusyPeriods() throws Exception {
    List<TimePeriod> busyTimes = Arrays.asList();

    doReturn(busyTimes).when(proposerSpy)
        .freebusyRequest(anyString(), anyString());

    List<TimePeriod> expectedReturn = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_10AM_NEXTDAY)
    );

    List<TimePeriod> result = proposerSpy.proposeTimes();

    // Assert list sizes are the same
    assertEquals(expectedReturn.size(), result.size());
    // Assert that both expected return and actual result are the same
    assertTrue(result.equals(expectedReturn));
  }

  // No timeslots long enough for the meeting to occur
  @Test
  public void notEnoughRoom() throws Exception {
    List<TimePeriod> busyTimesPerson1 = Arrays.asList(
      timePeriodFromDatestring(TIME_10AM, TIME_12PM),
      timePeriodFromDatestring(TIME_2PM, TIME_8PM),
      timePeriodFromDatestring(TIME_10PM, TIME_10AM_NEXTDAY)
    );
    List<TimePeriod> busyTimesPerson2 = Arrays.asList(
      timePeriodFromDatestring(TIME_12PM, TIME_2PM),
      timePeriodFromDatestring(TIME_1230PM, TIME_2PM),
      timePeriodFromDatestring(TIME_8PM, TIME_10PM)
    );

    doReturn(busyTimesPerson1).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(0)), anyString());
    doReturn(busyTimesPerson2).when(proposerSpy)
        .freebusyRequest(eq(CAL_ID.get(1)), anyString());

    List<TimePeriod> expectedReturn = Arrays.asList();
    List<TimePeriod> result = proposerSpy.proposeTimes();

    // Assert list sizes are the same
    assertEquals(expectedReturn.size(), result.size());
    // Assert that both expected return and actual result are the same
    assertTrue(result.equals(expectedReturn));
  }

  // Throws GoogleJsonResponseException on API errors (e.g. invalid key).
  @Test(expected = GoogleJsonResponseException.class)
  public void throwsErrorOnAPIFailure() throws Exception {
    // Do NOT stub the freebusyRequest function - call through the 
    // proposeTimes() function on the real 'proposer'. 
    // There is no API key provided in these tests, so API calls 
    // should return an error.
    List<TimePeriod> result = proposer.proposeTimes();
  }

  // Tests for freebusyRequest()
  @Test(expected = GoogleJsonResponseException.class)
  public void verifyCorrectAPICalls() throws Exception {
    // This will throw an exception, since empty-string API key provided
    proposer.freebusyRequest("test@example.com", "");

    // Verify that the correct API call was made
    FreeBusyRequestItem currentCalItem = 
        new FreeBusyRequestItem().setId("test@example.com");
    FreeBusyRequest req = new FreeBusyRequest()
        .setTimeMin(new DateTime(startTime))
        .setTimeMax(new DateTime(endTime))
        .setItems(Arrays.asList(currentCalItem));
    
    verify(serviceSpy).freebusy().query(req).setKey("").execute();
  }
  
  private TimePeriod timePeriodFromDatestring(String start, String end) 
      throws ParseException {
    DateTime startDateTime = new DateTime(FORMATTER.parse(start));
    DateTime endDateTime = new DateTime(FORMATTER.parse(end));
    TimePeriod time = new TimePeriod()
        .setStart(startDateTime)
        .setEnd(endDateTime);
    return time;
  }
}
