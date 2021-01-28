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

package com.google.sps.data;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;
import javax.servlet.http.HttpServletResponse;

/** Class of utility functions shared by the servlets and their tests */
public class ServletUtil {
  /**
   * Convert Object to JSON string using the Gson library.
   * @param obj the object to be converted to JSON
   * @return a JSON String with the object contents.
   */
  public static String convertToJson(Object object) {
    Gson gson = new Gson();
    String json = gson.toJson(object);
    return json;
  }

  /** Send an error response JSON to the client code containing the status code and message 
   * via response.getWriter.println(), and also set the status of the response to the status code.
   * @param {HttpServletResponse} response - the servlet response 
   * @param {int} status - the status code to be returned in the error JSON and set as as the status
   * via response.setStatus
   * @param {String} message - the error message
   */
  public static void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
    HashMap errorResponse = new HashMap<String, Object>() {{
      put("status", status);
      put("message", message);
    }};
    response.setStatus(status);
    String error = ServletUtil.convertToJson(errorResponse);
    response.setContentType("application/json");
    response.getWriter().println(error);
    return;
  }

  /**
   * Private constructor 
   * Class should be instantiated
   */
  private ServletUtil() {
  }
}
