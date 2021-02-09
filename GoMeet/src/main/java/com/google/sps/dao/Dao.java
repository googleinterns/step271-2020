package main.java.com.google.sps.dao;

import com.google.appengine.api.datastore.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

public interface Dao<T> {
  // TODO: Visibility

  Optional<T> get(String keyString);

  List<T> getAll();

  String save(T t);

  void updateVote(String keyString) throws EntityNotFoundException;

  void delete(String keyString);  
}
