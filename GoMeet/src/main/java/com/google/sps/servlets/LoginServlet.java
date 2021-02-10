package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.users.User;
import com.google.gson.Gson;
import com.google.sps.data.ErrorMessages;
import com.google.sps.data.MeetingEventFields;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.util.HashMap;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/user-status")
public class LoginServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    String meetingEventId = request.getParameter(MeetingEventFields.MEETING_EVENT_ID);

    if (meetingEventId == null) {
      ServletUtil.sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
          ErrorMessages.BAD_LOGIN_STATUS_REQUEST_ERROR);
      return;
    }

    String redirectUrl = "/meeting-event.html?meetingEventId=" + meetingEventId; 

    UserService userService = UserServiceFactory.getUserService();
    HashMap<String, String> userStatus = new HashMap<String, String>();
    
    if (userService.isUserLoggedIn()) {
      String logoutUrl = userService.createLogoutURL(redirectUrl);
      String userEmail = userService.getCurrentUser().getEmail(); 
      userStatus.put("loggedIn", "true"); 
      userStatus.put("logoutUrl", logoutUrl);
      userStatus.put("userEmail", userEmail); 
    } else {
      String loginUrl = userService.createLoginURL(redirectUrl);
      userStatus.put("loggedIn", "false"); 
      userStatus.put("loginUrl", loginUrl); 
    }

    Gson gson = new Gson(); 
    response.getWriter().println(gson.toJson(userStatus));
  }
}
