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
   * Private constructor 
   * Class should be instantiated
   */
  private ServletUtil() {
  }
}
