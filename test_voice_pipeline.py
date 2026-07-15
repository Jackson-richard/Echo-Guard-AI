import requests
import os
import sys

BASE_URL = "http://localhost:5000"

def get_audio_path(filename):
    return os.path.join(os.path.dirname(__file__), "test_audio", filename)

def enroll_user(user_id, audio_file):
    url = f"{BASE_URL}/voice/enroll"
    path = get_audio_path(audio_file)
    with open(path, "rb") as f:
        files = {"audio": (audio_file, f, "audio/wav")}
        data = {"user_id": user_id}
        res = requests.post(url, files=files, data=data)
    return res

def verify_user(user_id, audio_file, challenge_phrase):
    url = f"{BASE_URL}/voice/verify"
    path = get_audio_path(audio_file)
    with open(path, "rb") as f:
        files = {"audio": (audio_file, f, "audio/wav")}
        data = {"user_id": user_id, "challenge_phrase": challenge_phrase}
        res = requests.post(url, files=files, data=data)
    return res

def run_tests():
    print("=========================================================")
    print("TEST SUITE: VOICE ENROLLMENT & VERIFICATION")
    print("=========================================================")
    
    # Test Case 1
    print("\nTest Case 1: Enroll User A, Verify User A")
    res1 = enroll_user("UserA", "user_a.wav")
    print(f"Enroll response: {res1.json()}")
    assert res1.status_code == 200 and res1.json().get("embedding_saved") == True, "Failed to enroll User A"
    
    # example1.wav says "and these are exactly the ones who would"
    res2 = verify_user("UserA", "user_a.wav", "and these are exactly the ones who would")
    print(f"Verify response: {res2.json()}")
    assert res2.json().get("verified") == True, "User A verification failed!"
    print("Expected: PASS -> Actual: PASS")

    # Test Case 2
    print("\nTest Case 2: Enroll User A, Verify User B")
    # user_b.wav (example2.wav) says "believe that this is the best"
    res3 = verify_user("UserA", "user_b.wav", "believe that this is the best") 
    print(f"Verify response: {res3.json()}")
    assert res3.json().get("verified") == False, "User B incorrectly verified as User A!"
    print("Expected: FAIL -> Actual: FAIL")

    # Test Case 3
    print("\nTest Case 3: Enroll User A, Verify cloned AI voice")
    res4 = verify_user("UserA", "ai_voice.wav", "this is a cloned synthetic ai voice speaking the challenge phrase")
    print(f"Verify response: {res4.json()}")
    assert res4.json().get("verified") == False, "AI Voice incorrectly verified!"
    assert res4.json().get("reason", "") == "Synthetic Voice Detected", "AI voice was not rejected by deepfake system!"
    print("Expected: FAIL -> Actual: FAIL")

    # Test Case 4
    print("\nTest Case 4: Poor quality recording")
    res5 = enroll_user("UserB", "poor_quality.wav")
    print(f"Enroll response: {res5.status_code} {res5.json()}")
    assert res5.status_code in [400, 500] or not res5.json().get("embedding_saved"), "Poor quality audio was enrolled!"
    print("Expected: Reject Enrollment -> Actual: Reject Enrollment")

    # Test Case 5
    print("\nTest Case 5: Replay attack")
    res6 = verify_user("UserA", "user_a.wav", "random wrong phrase delta nine")
    print(f"Verify response: {res6.json()}")
    assert res6.json().get("verified") == False, "Replay attack incorrectly verified!"
    assert "phrase mismatch" in res6.json().get("reason", "").lower() or "replay attack" in res6.json().get("reason", "").lower(), "Replay attack was not identified as phrase mismatch!"
    print("Expected: FAIL -> Actual: FAIL")

    print("\n=========================================================")
    print("ALL TESTS PASSED!")
    print("=========================================================")
    
    with open("verification_report.txt", "w") as f:
        f.write("Verification Report\n")
        f.write("========================\n")
        f.write("Test Case 1 (Same Speaker): PASS\n")
        f.write("Test Case 2 (Different Speaker): PASS\n")
        f.write("Test Case 3 (AI Voice): PASS\n")
        f.write("Test Case 4 (Poor Quality): PASS\n")
        f.write("Test Case 5 (Replay Attack): PASS\n")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nTEST ERROR: {e}")
        sys.exit(1)
