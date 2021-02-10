package main.java.com.google.sps.exceptions;

/** 
 * Thrown if the maximum number of locations for a single meeting has already been reached.
 * If thrown, the current transaction is not completed.
 */
public class MaxEntitiesReachedException extends Exception { 

  public MaxEntitiesReachedException() {
    super();
  }

  public MaxEntitiesReachedException(String errorMessage) {
    super(errorMessage);
  }
}
