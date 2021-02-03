package com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.*;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.ServletUtil;
import com.google.sps.servlets.EmailServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;
import org.junit.Assert;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Test;

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

    // Assert that key is returned in JSON Object
    HashMap<String, Object> keyObj = new HashMap<String, Object>() {{
      put("sent", true);
    }};
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(ServletUtil.convertMapToJson(keyObj)));
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

    String errorJson = ServletUtil.convertMapToJson(errorResponse);

    // Verify error status code set
    verify(mockedResponse, times(1)).setStatus(status);

    // Assert that error response is returned
    writer.flush(); // writer may not have been flushed yet
    assertTrue(stringWriter.toString().contains(errorJson));
  }
}
