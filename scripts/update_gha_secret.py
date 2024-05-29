from base64 import b64encode
from nacl import encoding, public
import requests
import os
import json

api_key = os.getenv("GH_PERSONAL_ACCESS_TOKEN")

url = "https://api.github.com/repos/edelauna/stock-predictor/actions/secrets/public-key"
headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {api_key}",
    "X-GitHub-Api-Version": "2022-11-28"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    public_key = data["key"]
    key_id = data["key_id"]
    # handle the response data as needed
else:
    print(f"[-]\tGET secrets failed with status code {response.status_code}: {response.text}")
    exit(1)



def encrypt(public_key: str, secret_value: str) -> str:
  """Encrypt a Unicode string using the public key."""
  public_key = public.PublicKey(public_key.encode("utf-8"), encoding.Base64Encoder())
  sealed_box = public.SealedBox(public_key)
  encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
  return b64encode(encrypted).decode("utf-8")

url = "https://api.github.com/repos/edelauna/stock-predictor/actions/secrets/TOKEN_JSON"

# Read data from file
with open("token.json", "r") as file:
    payload = json.load(file)
response = requests.put(url, headers=headers, json={
  'encrypted_value': encrypt(public_key, str(payload)),
  'key_id': key_id
})

if str(response.status_code).startswith("2"):
    # Request successful
    print("[+]\tSecret updated successfully")
else:
    # Request failed
    print(f"[-]\tPut Secret failed with status code {response.status_code}: {response.text}")
    exit(1)