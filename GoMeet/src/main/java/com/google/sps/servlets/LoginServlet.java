// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
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
      userStatus.put("loggedIn", "true"); 
      userStatus.put("logoutUrl", logoutUrl); 
    } else {
      String loginUrl = userService.createLoginURL(redirectUrl);
      userStatus.put("loggedIn", "false"); 
      userStatus.put("loginUrl", loginUrl); 
    }

    Gson gson = new Gson(); 
    response.getWriter().println(gson.toJson(userStatus));
  }
}
