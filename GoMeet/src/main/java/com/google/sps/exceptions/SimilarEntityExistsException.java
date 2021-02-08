package main.java.com.google.sps.exceptions;

/** 
 * Thrown when there is a similar entity alreay in the database. 
 * If thrown, the current transaction is not completed.
 */
public class SimilarEntityExistsException extends Exception { 

  public SimilarEntityExistsException() {
    super();
  }

  public SimilarEntityExistsException(String errorMessage) {
    super(errorMessage);
  }
}
