package com.google.sps.servlets;

import com.google.sps.data.ErrorMessages;
import com.google.sps.data.ServletUtil;
import java.io.IOException;
import java.util.HashMap;
import java.util.Properties;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/email")
public class EmailServlet extends HttpServlet {

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    
    String meetingEventId = request.getParameter("meetingEventId"); 
    String guestListUri = request.getParameter("guestList");

    if (meetingEventId == null || guestListUri == null) {
      ServletUtil.sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, 
          ErrorMessages.BAD_EMAIL_REQUEST_ERROR);
      return; 
    }

    // Create a hashmap to store the sent status of each email 
    HashMap<String, Object> emailStatus = new HashMap<String, Object>();

    String guestList = ServletUtil.decodeUri(guestListUri); 
    String[] guestListSplit = guestList.split(",");
    for (int i = 0; i < guestListSplit.length; i++) {
      boolean sent = sendEmail(guestListSplit[i], meetingEventId);
      emailStatus.put(guestListSplit[i], sent);
    }

    response.setContentType("application/json");
    response.getWriter().println(ServletUtil.convertMapToJson(emailStatus));
  }

  /**
   * Sends an email to the given email address containing a link to a meeting event 
   * HTML page. Email is sent from interns@go-meet.appspotmail.com
   * @param {String} emailAddress the email address to send the message to
   * @param {String} meetingEventId the unique ID to be included in the email link
   */
  public static boolean sendEmail(String emailAddress, String meetingEventId) {
    Properties properties = new Properties();
    Session session = Session.getDefaultInstance(properties, null);

    try {
      Message msg = new MimeMessage(session);
      msg.setFrom(new InternetAddress("interns@go-meet.appspotmail.com"));
      msg.addRecipient(Message.RecipientType.TO, new InternetAddress(emailAddress));
      msg.setSubject("You have been invited to a GoMeet event!");
      msg.setText("The meeting event ID is: " + meetingEventId); //TO DO: Find out what the meeting link should be
      Transport.send(msg);
    } catch (AddressException e) {
      System.err.println("Address exception"); 
      return false;
    } catch (MessagingException e) {
      System.err.println("Messaging exception"); 
      return false; 
    }
    return true;
  }
}
