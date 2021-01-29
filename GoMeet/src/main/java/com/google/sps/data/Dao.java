package main.java.com.google.sps.data;

import java.util.List;
import java.util.Optional;

public interface Dao<T> {
  // TODO: Visibility

  Optional<T> get(String keyString);

  List<T> getAll();

  String save(T t);

  void update(String keyString);

  void delete(String keyString);  
}
