package com.google.sps;

import static org.mockito.Mockito.*;
import static org.junit.Assert.assertEquals;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalUserServiceTestConfig;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingEventFields;
import com.google.sps.data.ServletUtil;
import com.google.sps.servlets.LoginServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import test.java.com.google.sps.ServletTestUtil; 

/** Tests for LoginServlet.java */
@RunWith(JUnit4.class)
public class LoginServletTest {
  private final String MEETING_EVENT_ID = "qwerty12345"; 

  // Mocks
  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalUserServiceTestConfig());
  private HttpServletRequest mockedRequest;       
  private HttpServletResponse mockedResponse;
  private StringWriter stringWriter;
  private PrintWriter writer;

  @Before
  public void setup() throws IOException {
    helper.setUp();
    helper.setEnvEmail("test@gmail.com");
    helper.setEnvAuthDomain("gmail.com");
    mockedRequest = mock(HttpServletRequest.class);      
    mockedResponse = mock(HttpServletResponse.class);
    stringWriter = new StringWriter();
    writer = new PrintWriter(stringWriter);
    when(mockedResponse.getWriter()).thenReturn(writer);
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_EVENT_ID)).thenReturn(MEETING_EVENT_ID);
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  @Test 
  public void noMeetingEventIdParam() throws IOException {
    when(mockedRequest.getParameter(MeetingEventFields.MEETING_EVENT_ID)).thenReturn(null);
    new LoginServlet().doGet(mockedRequest, mockedResponse); 

    ServletTestUtil.expectBadRequest(HttpServletResponse.SC_BAD_REQUEST, 
        ErrorMessages.BAD_LOGIN_STATUS_REQUEST_ERROR, mockedResponse, stringWriter, writer);
  }

  @Test
  public void notLoggedIn() throws IOException {
    helper.setEnvIsLoggedIn(false);
    new LoginServlet().doGet(mockedRequest, mockedResponse); 

    writer.flush();

    HashMap expectedResponse = new HashMap<String, String>() {{
      put("loggedIn", "false");
      put("loginUrl", "/_ah/login?continue\u003d%2Fmeeting-event.html%3FmeetingEventId%3Dqwerty12345");
    }};

    // Convert expected and result to Json Object to compare 
    String resultsJsonStr = stringWriter.toString(); 
    String expectedJsonStr = ServletUtil.convertMapToJson(expectedResponse); 
    JsonObject resultsJsonObj = new JsonParser().parse(resultsJsonStr).getAsJsonObject();
    JsonObject expectedJsonObj = new JsonParser().parse(expectedJsonStr).getAsJsonObject(); 
    assertEquals(resultsJsonObj.get("loggedIn"), expectedJsonObj.get("loggedIn"));
    assertEquals(resultsJsonObj.get("loginUrl"), expectedJsonObj.get("loginUrl"));
  }

  @Test 
  public void loggedIn() throws IOException {
    helper.setEnvIsLoggedIn(true);
    new LoginServlet().doGet(mockedRequest, mockedResponse); 

    writer.flush();

    HashMap expectedResponse = new HashMap<String, String>() {{
      put("loggedIn", "true");
      put("logoutUrl", "/_ah/logout?continue\u003d%2Fmeeting-event.html%3FmeetingEventId%3Dqwerty12345");
      put("userEmail", "test@gmail.com");
    }};

    // Convert expected and result to Json Object to compare 
    String resultsJsonStr = stringWriter.toString(); 
    String expectedJsonStr = ServletUtil.convertMapToJson(expectedResponse); 
    JsonObject resultsJsonObj = new JsonParser().parse(resultsJsonStr).getAsJsonObject();
    JsonObject expectedJsonObj = new JsonParser().parse(expectedJsonStr).getAsJsonObject(); 
    assertEquals(resultsJsonObj.get("loggedIn"), expectedJsonObj.get("loggedIn"));
    assertEquals(resultsJsonObj.get("logoutUrl"), expectedJsonObj.get("logoutUrl"));
    assertEquals(resultsJsonObj.get("userEmail"), expectedJsonObj.get("userEmail"));
  }
}
