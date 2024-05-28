# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gmail_quickstart]
import os.path
import base64
import sqlite3
import datetime
import pytz
from openai import OpenAI

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

client = OpenAI()
def get_embeddings(text):
  response = client.embeddings.create(
      input=text,
      model="text-embedding-3-small"
  )
  return response.data[0].embedding

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify']

def main():
  """Shows basic usage of the Gmail API.
  Lists the user's Gmail labels.
  """
  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
      flow = InstalledAppFlow.from_client_secrets_file(
          "credentials.json", SCOPES
      )
      creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())

  try:
    # Call the Gmail API
    service = build("gmail", "v1", credentials=creds)
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], q="label:todo").execute()
    messages = results.get('messages',[])
    if not messages:
      print('No new messages.')
      exit(1)
    for message in messages:
      msg = service.users().messages().get(userId='me', id=message['id']).execute()                
      for header in msg['payload']['headers']:
        if header['name'] == 'Date':
          date_value = header['value']
          datetime_obj = datetime.datetime.strptime(date_value, "%a, %d %b %Y %H:%M:%S %z")
          # Convert to Eastern Standard Time (EST) format since Google uses PST timezone
          est_timezone = pytz.timezone("EST")
          est_datetime_obj = datetime_obj.astimezone(est_timezone)

          # Format the datetime object and turn second to 00 since alphavantage api only returns on 1min increments
          date_value = est_datetime_obj.strftime("%Y/%m/%d %H:%M:00")
      for part in msg['payload']['parts']:
        if part['mimeType'] == 'text/plain':
          try:
            data = part['body']["data"]
            byte_code = base64.urlsafe_b64decode(data)

            text = byte_code.decode("utf-8")
            embeddings = get_embeddings(text)

            con = sqlite3.connect("data/data.db")
            cur = con.cursor()

            sql = "INSERT INTO trends (date, text, embeddings) VALUES (?, ?, ?)"
            data = (date_value, text, embeddings) 

            cur.execute(sql, data)
            print(f"Date:{date_value} - inserted")
            con.commit()

            # mark the message as read (optional)
            msg  = service.users().messages().modify(userId='me', id=message['id'], body={'removeLabelIds': ['Label_8705966380606725806']}).execute()
            
            cur.close()
            con.close()
          except BaseException as error:
            pass

  except HttpError as error:
    # TODO(developer) - Handle errors from gmail API.
    print(f"An error occurred: {error}")


if __name__ == "__main__":
  main()
# [END gmail_quickstart]