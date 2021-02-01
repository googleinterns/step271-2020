package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.users.User;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;

@WebServlet("/user-status")
public class LoginServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");

    UserService userService = UserServiceFactory.getUserService();
    HashMap<String, String> userStatus = new HashMap<String, String>();
    String redirectUrl = "/meeting-event.html"; 

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