package test.java.com.google.sps;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import com.google.sps.data.ServletUtil;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Assert;
import org.junit.Test;

/**
 * Class for servlet unit testing helper functions 
 */
public class ServletTestUtil {
  
  /**
   * Helper function to test the correct error response was sent in the case of 
   * a bad request
   */
  public static void badRequest(int status, String errorMessage, 
      HttpServletResponse mockedResponse, StringWriter stringWriter, PrintWriter writer) {

    HashMap errorResponse = new HashMap<String, Object>() {{
      put("status", status);
      put("message", errorMessage);
    }};

    writer.flush(); // Writer may not have been flushed yet

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
