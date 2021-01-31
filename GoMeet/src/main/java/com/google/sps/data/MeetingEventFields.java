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

/** Names of fields of data in the Datastore MeetingEvent entity */
public class MeetingEventFields {
  public static final String MEETING_EVENT_ID = "meetingEventId";
  public static final String MEETING_NAME = "meetingName";
  public static final String DURATION_MINS = "durationMins";
  public static final String DURATION_HOURS = "durationHours";
  public static final String TIME_FIND_METHOD = "timeFindMethod";
  public static final String GUEST_LIST = "guestList";
  public static final String MEETING_TIME_IDS = "meetingTimeIds";
  public static final String MEETING_LOCATION_IDS = "meetingLocationIds";
}
