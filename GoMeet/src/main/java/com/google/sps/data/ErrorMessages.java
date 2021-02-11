package com.google.sps.data;

/** Error messages to be send as part of error responses from servlets. */
public class ErrorMessages {
  public static final String BAD_REQUEST_ERROR = 
      "Datetime must both be provided for a new MeetingTime";
  public static final String INVALID_KEY_ERROR = 
      "Invalid entity ID";
  public static final String ENTITY_NOT_FOUND_ERROR = 
      "Entity not found";
  public static final String TOO_MANY_RESULTS_ERROR = 
      "Too many results returned";
  public static final String BAD_REQUEST_ERROR_LOCATION = 
      "Invalid location";
  public static final String MAX_ENTITIES = 
      "Maximum number of entities reached";
  public static final String BAD_EMAIL_REQUEST_ERROR = 
      "MeetingId and guest list must both be provided to send email invitations";
  public static final String BAD_POST_REQUEST_ERROR = 
      "All parameters must be provided to create a new entity";
  public static final String BAD_GET_REQUEST_ERROR = 
      "A valid Id must be provided to fetch the entity";
  public static final String USER_HAS_VOTED_ERROR =
      "The user has voted once already";
  public static final String BAD_LOGIN_STATUS_REQUEST_ERROR = 
      "Please provide a meething event ID to the request"; 
}
