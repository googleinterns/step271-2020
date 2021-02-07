package com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.*;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.ServletUtil;
import com.google.sps.servlets.EmailServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Assert;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

/** Tests for EmailServlet.java */
@RunWith(JUnit4.class)
public class EmailServletTest {
  // Hardcoded data 
  private final String MEETING_EVENT_ID = "qwerty12345";
  private final String GUEST_1 = "guest1@gmail.com";
  private final String GUEST_2 = "guest2@gmail.com";
  private final String GUEST_3 = "guest3@gmail.com";
  private final String GUEST_LIST_URI = "guest1%40gmail.com%2Cguest2%40gmail.com%2Cguest3%40gmail.com"; 

  // Mocks
  private HttpServletRequest mockedRequest;
  private HttpServletResponse mockedResponse;
  private EmailServlet mockedServlet;
  private StringWriter stringWriter;
  private PrintWriter writer;

  @Before
  public void setUp() throws IOException {
    mockedRequest = mock(HttpServletRequest.class);      
    mockedResponse = mock(HttpServletResponse.class);
    stringWriter = new StringWriter();
    writer = new PrintWriter(stringWriter);
    when(mockedResponse.getWriter()).thenReturn(writer);
    when(mockedRequest.getParameter("meetingEventId")).thenReturn(MEETING_EVENT_ID);
    when(mockedRequest.getParameter("guestList")).thenReturn(GUEST_LIST_URI);  
  }

  @Test
  public void testSuccessfulDoPost() throws IOException {
    try (MockedStatic<EmailServlet> mockedServlet = Mockito.mockStatic(EmailServlet.class)) {
      mockedServlet.when(() -> EmailServlet.sendEmail(GUEST_1, MEETING_EVENT_ID)).thenReturn(true);
      mockedServlet.when(() -> EmailServlet.sendEmail(GUEST_2, MEETING_EVENT_ID)).thenReturn(true);
      mockedServlet.when(() -> EmailServlet.sendEmail(GUEST_3, MEETING_EVENT_ID)).thenReturn(true);
      new EmailServlet().doPost(mockedRequest, mockedResponse);

      // Check the sendEmail function was called exactly once for each guest in the guest list 
      mockedServlet.verify(times(1), () -> EmailServlet.sendEmail(GUEST_1, MEETING_EVENT_ID));
      mockedServlet.verify(times(1), () -> EmailServlet.sendEmail(GUEST_2, MEETING_EVENT_ID));
      mockedServlet.verify(times(1), () -> EmailServlet.sendEmail(GUEST_3, MEETING_EVENT_ID));
    }

    HashMap<String, Object> expected = new HashMap<String, Object>() {{
      put(GUEST_1, true);
      put(GUEST_2, true);
      put(GUEST_3, true);
    }};

    writer.flush(); // writer may not have been flushed yet

    // Convert expected and result to Json Object to compare 
    String resultsJsonStr = stringWriter.toString(); 
    String expectedJsonStr = ServletUtil.convertMapToJson(expected); 
    JsonObject resultsJsonObj = new JsonParser().parse(resultsJsonStr).getAsJsonObject();
    JsonObject expectedJsonObj = new JsonParser().parse(expectedJsonStr).getAsJsonObject(); 
    assertEquals(resultsJsonObj.get(GUEST_1), expectedJsonObj.get(GUEST_1));
    assertEquals(resultsJsonObj.get(GUEST_1), expectedJsonObj.get(GUEST_1));
    assertEquals(resultsJsonObj.get(GUEST_1), expectedJsonObj.get(GUEST_1));
  }

  @Test 
  public void testNullMeetingEventId() throws IOException {
    when(mockedRequest.getParameter("meetingEventId")).thenReturn(null);
    new EmailServlet().doPost(mockedRequest, mockedResponse); 
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_EMAIL_REQUEST_ERROR);
  }

  @Test 
  public void testNullGuestList() throws IOException {
    when(mockedRequest.getParameter("guestList")).thenReturn(null); 
    new EmailServlet().doPost(mockedRequest, mockedResponse); 
    testBadRequest(HttpServletResponse.SC_BAD_REQUEST, ErrorMessages.BAD_EMAIL_REQUEST_ERROR);
  }

  private void testBadRequest(int status, String errorMessage) throws IOException {
    // Check that error response was sent with appropriate details
    HashMap errorResponse = new HashMap<String, Object>() {{
      put("status", status);
      put("message", errorMessage);
    }};

    writer.flush(); // writer may not have been flushed yet

    // Convert expected and result to Json Object to compare 
    String resultsJsonStr = stringWriter.toString(); 
    String expectedJsonStr = ServletUtil.convertMapToJson(errorResponse); 
    JsonObject resultsJsonObj = new JsonParser().parse(resultsJsonStr).getAsJsonObject();
    JsonObject expectedJsonObj = new JsonParser().parse(expectedJsonStr).getAsJsonObject(); 
    assertEquals(resultsJsonObj.get("status"), expectedJsonObj.get("status"));
    assertEquals(resultsJsonObj.get("message"), expectedJsonObj.get("message"));

    // Verify error status code set
    verify(mockedResponse, times(1)).setStatus(status);
  }
}
