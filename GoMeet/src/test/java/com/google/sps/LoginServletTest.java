package com.google.sps;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalUserServiceTestConfig;
import com.google.gson.Gson;
import java.io.IOException;
// import javax.servlet.annotation.WebServlet;
// import javax.servlet.http.HttpServlet;
import com.google.sps.servlets.LoginServlet;

import static org.junit.Assert.assertEquals;
import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.json.simple.JSONObject;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/** Tests for LoginServlet.java */
@RunWith(JUnit4.class)
public class LoginServletTest {
  private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalUserServiceTestConfig());
  private MockHttpServletRequest request = new MockHttpServletRequest();
  private MockHttpServletResponse response = new MockHttpServletResponse();
  private Gson gson = new Gson(); 
  private UserService userService = UserServiceFactory.getUserService();

  @Before
  public void setup() {
    helper.setUp();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  @Test
  public void notLoggedIn() throws IOException {
    helper.setEnvIsLoggedIn(false);
    new LoginServlet().doGet(request, response); 

    // Check the response type is in json form 
    String responseType = response.getContentType();
    assertEquals(responseType, "application/json");

    // Note: Could not use .json() to directly read the response in json format
    //       becuase the method does not exist in the MockHttpServletResponse class
    // Fix:  Read the response as a string and then use Gson to convert to 
    //       Json object and read key value pairs
    String content = response.getContentAsString();
    JSONObject jsonObject = gson.fromJson(content, JSONObject.class);

    // Check loggedIn key value 
    Object loggedIn = jsonObject.get("loggedIn"); 
    assertEquals(loggedIn, "false"); 

    // Check loginUrl key value 
    Object loginUrl = jsonObject.get("loginUrl"); 
    assertEquals(loginUrl, "/_ah/login?continue\u003d%2Fmeeting-event.html"); 

    // Check number of key value pairs 
    int numKeys = jsonObject.keySet().size(); 
    assertEquals(numKeys, 2);
  }

  @Test 
  public void loggedIn() throws IOException {
    helper.setEnvIsLoggedIn(true);
    new LoginServlet().doGet(request, response); 

    // Check the response type is in json form 
    String responseType = response.getContentType();
    assertEquals(responseType, "application/json");

    // Get the response 
    String content = response.getContentAsString();
    JSONObject jsonObject = gson.fromJson(content, JSONObject.class);

    // Check the loggedIn key value 
    Object status = jsonObject.get("loggedIn"); 
    assertEquals(status, "true");
    
    // Check the logoutUrl key value 
    Object logoutUrl = jsonObject.get("logoutUrl"); 
    assertEquals(logoutUrl, "/_ah/logout?continue\u003d%2Fmeeting-event.html");

    // Check number of key value pairs 
    int numKeys = jsonObject.keySet().size(); 
    assertEquals(numKeys, 2);
  }
}
