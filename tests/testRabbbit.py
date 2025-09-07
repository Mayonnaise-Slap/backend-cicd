import requests
import random
import string
import time

BASE_URL = "http://localhost:8080"

def rand_str(length=8):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))

def main():
    email = f"{rand_str()}@test.com"
    password = "password123"
    full_name = f"TestUser {rand_str(4)}"

    print(f"[+] Registering user {email}")
    resp = requests.post(f"{BASE_URL}/users/register", json={
        "email": email,
        "password": password,
        "fullName": full_name
    })
    resp.raise_for_status()

    print("[+] Logging in...")
    resp = requests.post(f"{BASE_URL}/users/login", json={
        "email": email,
        "password": password
    })
    resp.raise_for_status()
    token = resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    post_ids = []
    for i in range(3):
        print(f"[+] Creating workout {i+1}")
        resp = requests.post(f"{BASE_URL}/workouts/post/", json={
            "title": f"My Workout {i+1}",
            "elements": [
                {"type": "paragraph", "paragraph": rand_str(20)}
            ],
            "tags": []
        }, headers=headers)
        resp.raise_for_status()
        post_ids.append(resp.json()["id"])

    print("[+] Created posts:", post_ids)

    print("[+] Liking all visible posts...")
    resp = requests.get(f"{BASE_URL}/workouts/post/?limit=10000")
    resp.raise_for_status()
    posts = resp.json()["data"] if "data" in resp.json() else resp.json()
    for post in posts:
        pid = post["id"]
        print(f"Liking post {pid}")
        print(f"{BASE_URL}/social/posts/{pid}")
        like_resp = requests.post(
            f"{BASE_URL}/social/posts/{pid}",
            headers=headers
        )
        if like_resp.status_code not in (200, 201, 409):  # 409 if already liked
            print(f"[!] Failed to like post {pid}: {like_resp.status_code}")

    print("[+] Deleting user via /users/me")
    resp = requests.delete(f"{BASE_URL}/users/me", headers=headers)
    resp.raise_for_status()

    print("[*] Waiting 2s for cascade deletion to propagate...")
    time.sleep(2)

    print("[+] Checking if posts are gone...")
    for pid in post_ids:
        resp = requests.get(f"{BASE_URL}/workouts/post/{pid}")
        if resp.status_code == 404:
            print(f"    ✔️ Post {pid} deleted as expected")
        else:
            print(f"    ❌ Post {pid} still exists! Status: {resp.status_code}")

    print("[+] Test complete")

if __name__ == "__main__":
    main()
