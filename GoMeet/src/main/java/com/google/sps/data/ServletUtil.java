package com.google.sps.data;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import org.json.simple.JSONObject;

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

  /**
   * Converts HashMap to JSON object
   * @param hashMap the hashMap to be converted 
   * @return a JSON string
   */
  public static String convertMapToJson(HashMap<String, Object> hashMap) {
    JSONObject json = new JSONObject();
    json.putAll(hashMap);
    String jsonString = json.toString();
    return jsonString; 
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
    String error = ServletUtil.convertMapToJson(errorResponse);
    response.setContentType("application/json");
    response.getWriter().println(error);
    return;
  }

  /**
   * Decodes the encoded URI by replacing the UTF-8 representation
   * with the character representation
   * @param encodedUri the URI to decode 
   * @return the decoded URI
   */
  public static String decodeUri(String encodedUri) {
    String result; 
    // Decode "%2C" to ","
    result = encodedUri.replace("%2C", ",");

    // Decode "%40" to "@"
    result = result.replace("%40", "@");

    // Decode "+" to " " (space)
    result = result.replace("+", " "); 

    return result;
  }
  
  /**
   * Private constructor 
   * Class should be instantiated
   */
  private ServletUtil() {
  }
}
