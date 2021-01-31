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

/** Names of fields of data in the Datastore MeetingTime entity */
public class ErrorMessages {
  public static final String BAD_REQUEST_ERROR = 
      "meetingId and datetime must both be provided for a new MeetingTime";
  public static final String INVALID_KEY_ERROR = 
      "Invalid entity ID";
  public static final String ENTITY_NOT_FOUND_ERROR = 
      "Entity not found";
  public static final String TOO_MANY_RESULTS_ERROR = 
      "Too many results returned";
  public static final String BAD_POST_REQUEST_ERROR = 
      "All parameters must be provided to create a new entity";
  public static final String BAD_GET_REQUEST_ERROR = 
      "A valid Id must be provided to fetch the entity";
}
