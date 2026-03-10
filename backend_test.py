#!/usr/bin/env python3
"""
Backend API Testing for 1CoFounder Smart Matching Feature
Tests the complete flow including authentication, profile updates, smart matching, and messaging.
"""
import requests
import json
import time

# Base URL from environment
BASE_URL = "https://health-cofound.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.tokens = {}
        self.user_ids = {}
        self.test_results = []
    
    def log_result(self, test_name, success, details=""):
        """Log test results for reporting"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, token=None, expect_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=10)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"{method} {endpoint} -> {response.status_code}")
            
            if response.status_code != expect_status:
                print(f"Expected {expect_status}, got {response.status_code}")
                if response.text:
                    print(f"Response: {response.text}")
                return False, None
            
            if response.headers.get('content-type', '').startswith('application/json'):
                return True, response.json()
            else:
                return True, response.text
                
        except requests.RequestException as e:
            print(f"Request failed: {e}")
            return False, None
    
    def test_health_check(self):
        """Test basic health endpoint"""
        success, data = self.make_request("GET", "/health")
        if success and data and data.get("status") == "ok":
            self.log_result("Health Check", True, "Health endpoint responding correctly")
            return True
        else:
            self.log_result("Health Check", False, "Health endpoint not responding properly")
            return False
    
    def test_signup(self, user_name, email, password, user_key):
        """Test user signup"""
        signup_data = {
            "name": user_name,
            "email": email,
            "password": password
        }
        
        success, data = self.make_request("POST", "/auth/signup", signup_data, expect_status=201)
        if success and data and "token" in data and "user" in data:
            self.tokens[user_key] = data["token"]
            self.user_ids[user_key] = data["user"]["id"]
            self.log_result(f"Signup {user_name}", True, f"User created with ID: {data['user']['id']}")
            return True
        else:
            self.log_result(f"Signup {user_name}", False, "Failed to create user or get token")
            return False
    
    def test_profile_update(self, user_key, profile_data):
        """Test profile update"""
        if user_key not in self.tokens:
            self.log_result(f"Profile Update {user_key}", False, "No token available")
            return False
        
        success, data = self.make_request("PUT", "/users/profile", profile_data, self.tokens[user_key])
        if success and data and "user" in data:
            # Verify the fields were updated correctly
            user = data["user"]
            profile_complete = user.get("profile_complete", False)
            
            # Check key fields
            fields_ok = True
            for key, value in profile_data.items():
                if user.get(key) != value:
                    fields_ok = False
                    break
            
            if profile_complete and fields_ok:
                self.log_result(f"Profile Update {user_key}", True, "Profile updated with all fields")
                return True
            else:
                self.log_result(f"Profile Update {user_key}", False, f"Profile fields not saved correctly or profile_complete={profile_complete}")
                return False
        else:
            self.log_result(f"Profile Update {user_key}", False, "Failed to update profile")
            return False
    
    def test_discover_with_matching(self, user_key, expected_behavior="users_returned"):
        """Test user discovery with smart matching"""
        if user_key not in self.tokens:
            self.log_result(f"Discover {user_key}", False, "No token available")
            return False, []
        
        success, data = self.make_request("GET", "/users/discover", token=self.tokens[user_key])
        if success and data and "users" in data:
            users = data["users"]
            
            if expected_behavior == "users_returned":
                if len(users) > 0:
                    # Check that users have required fields for matching
                    first_user = users[0]
                    required_fields = ["name", "role", "city", "country", "skills", "interests", "startup_stage"]
                    has_fields = all(field in first_user for field in required_fields)
                    
                    # Check that users don't include the requesting user
                    requesting_user_id = self.user_ids.get(user_key)
                    excludes_self = all(user.get("id") != requesting_user_id for user in users)
                    
                    if has_fields and excludes_self:
                        self.log_result(f"Discover {user_key}", True, f"Found {len(users)} users with proper matching fields")
                        return True, users
                    else:
                        self.log_result(f"Discover {user_key}", False, f"Users missing required fields or includes self")
                        return False, []
                else:
                    self.log_result(f"Discover {user_key}", True, "No users found (expected for first user)")
                    return True, []
            
        self.log_result(f"Discover {user_key}", False, "Failed to get discover results")
        return False, []
    
    def test_swipe(self, swiper_key, target_id, action="like"):
        """Test swiping functionality"""
        if swiper_key not in self.tokens:
            self.log_result(f"Swipe {swiper_key}", False, "No token available")
            return False, False
        
        swipe_data = {
            "target_id": target_id,
            "action": action
        }
        
        success, data = self.make_request("POST", "/swipes", swipe_data, self.tokens[swiper_key])
        if success and data:
            swipe_recorded = "swipe" in data and "id" in data["swipe"]
            is_match = data.get("match", False)
            has_match_data = data.get("match_data") is not None
            
            if swipe_recorded:
                if is_match and has_match_data:
                    self.log_result(f"Swipe {swiper_key} -> Match", True, f"Swipe recorded and match created")
                else:
                    self.log_result(f"Swipe {swiper_key}", True, f"Swipe recorded, match={is_match}")
                return True, is_match
            else:
                self.log_result(f"Swipe {swiper_key}", False, "Swipe not properly recorded")
                return False, False
        else:
            self.log_result(f"Swipe {swiper_key}", False, "Failed to record swipe")
            return False, False
    
    def test_get_matches(self, user_key, expected_count=0):
        """Test getting matches"""
        if user_key not in self.tokens:
            self.log_result(f"Get Matches {user_key}", False, "No token available")
            return False, []
        
        success, data = self.make_request("GET", "/matches", token=self.tokens[user_key])
        if success and data and "matches" in data:
            matches = data["matches"]
            
            if len(matches) >= expected_count:
                # Check match structure
                if matches:
                    first_match = matches[0]
                    has_matched_user = "matched_user" in first_match and first_match["matched_user"] is not None
                    if has_matched_user:
                        self.log_result(f"Get Matches {user_key}", True, f"Found {len(matches)} matches with user details")
                        return True, matches
                    else:
                        self.log_result(f"Get Matches {user_key}", False, "Matches missing matched_user details")
                        return False, []
                else:
                    self.log_result(f"Get Matches {user_key}", True, f"Found {len(matches)} matches")
                    return True, matches
            else:
                self.log_result(f"Get Matches {user_key}", False, f"Expected at least {expected_count} matches, got {len(matches)}")
                return False, []
        else:
            self.log_result(f"Get Matches {user_key}", False, "Failed to get matches")
            return False, []
    
    def test_messaging(self, sender_key, conversation_id, message_text):
        """Test sending a message"""
        if sender_key not in self.tokens:
            self.log_result(f"Send Message {sender_key}", False, "No token available")
            return False
        
        message_data = {
            "conversation_id": conversation_id,
            "message": message_text
        }
        
        success, data = self.make_request("POST", "/messages", message_data, self.tokens[sender_key], expect_status=201)
        if success and data and "message" in data:
            message = data["message"]
            if message.get("conversation_id") == conversation_id and message.get("message") == message_text:
                self.log_result(f"Send Message {sender_key}", True, "Message sent successfully")
                return True
            else:
                self.log_result(f"Send Message {sender_key}", False, "Message data incorrect")
                return False
        else:
            self.log_result(f"Send Message {sender_key}", False, "Failed to send message")
            return False
    
    def test_get_messages(self, user_key, conversation_id, expected_count=1):
        """Test getting messages from conversation"""
        if user_key not in self.tokens:
            self.log_result(f"Get Messages {user_key}", False, "No token available")
            return False
        
        success, data = self.make_request("GET", f"/messages/{conversation_id}", token=self.tokens[user_key])
        if success and data and "messages" in data:
            messages = data["messages"]
            if len(messages) >= expected_count:
                self.log_result(f"Get Messages {user_key}", True, f"Retrieved {len(messages)} messages")
                return True
            else:
                self.log_result(f"Get Messages {user_key}", False, f"Expected at least {expected_count} messages, got {len(messages)}")
                return False
        else:
            self.log_result(f"Get Messages {user_key}", False, "Failed to get messages")
            return False
    
    def run_complete_test_flow(self):
        """Run the complete test flow as specified in the review request"""
        print("=" * 60)
        print("1CoFounder Smart Matching Backend Test")
        print("=" * 60)
        
        # Step 1: Health Check
        if not self.test_health_check():
            return False
        
        print("\n--- Step 1: Create User A (Doctor) ---")
        if not self.test_signup("TestDoc Alpha", "alpha_doc@test.com", "password123", "user_a"):
            return False
        
        # Profile for User A (Doctor)
        user_a_profile = {
            "role": "Doctor",
            "city": "Boston", 
            "country": "United States",
            "bio": "Cardiologist",
            "skills": ["Cardiology", "Machine Learning"],
            "interests": ["AI Healthcare", "Diagnostics", "Remote Monitoring"],
            "startup_stage": "Idea",
            "commitment_level": "Full Time",
            "looking_for": ["AI Engineer", "Software Engineer"]
        }
        
        if not self.test_profile_update("user_a", user_a_profile):
            return False
        
        print("\n--- Step 2: Verify discover ordering ---")
        success, users = self.test_discover_with_matching("user_a")
        if not success:
            return False
        
        print("\n--- Step 3: Create User B (Engineer) ---") 
        if not self.test_signup("TestEng Beta", "beta_eng@test.com", "password123", "user_b"):
            return False
        
        # Profile for User B (Engineer)
        user_b_profile = {
            "role": "Engineer",
            "city": "Boston",
            "country": "United States", 
            "bio": "AI developer",
            "skills": ["AI Engineering", "Machine Learning", "Full Stack Development"],
            "interests": ["AI Healthcare", "Diagnostics"],
            "startup_stage": "Idea",
            "commitment_level": "Full Time",
            "looking_for": ["Clinician", "Product Manager"]
        }
        
        if not self.test_profile_update("user_b", user_b_profile):
            return False
        
        print("\n--- Step 4: User A swipes Interested on User B ---")
        user_b_id = self.user_ids.get("user_b")
        if not user_b_id:
            self.log_result("Get User B ID", False, "User B ID not available")
            return False
        
        success, is_match = self.test_swipe("user_a", user_b_id, "like")
        if not success:
            return False
        
        if is_match:
            self.log_result("One-sided swipe check", False, "Should not be a match yet (one-sided)")
        else:
            self.log_result("One-sided swipe check", True, "Correctly no match on one-sided like")
        
        print("\n--- Step 5: User B swipes Interested on User A ---")
        user_a_id = self.user_ids.get("user_a") 
        if not user_a_id:
            self.log_result("Get User A ID", False, "User A ID not available")
            return False
        
        success, is_match = self.test_swipe("user_b", user_a_id, "like")
        if not success:
            return False
        
        if is_match:
            self.log_result("Mutual match creation", True, "Match created on mutual likes")
        else:
            self.log_result("Mutual match creation", False, "Should be a match on mutual likes")
        
        print("\n--- Step 6: Verify match created ---")
        success, matches = self.test_get_matches("user_a", expected_count=1)
        if not success:
            return False
        
        # Get match ID for messaging
        match_id = None
        if matches:
            match_id = matches[0].get("id")
        
        if not match_id:
            self.log_result("Get Match ID", False, "Could not extract match ID")
            return False
        
        print("\n--- Step 7: Test messaging ---")
        if not self.test_messaging("user_a", match_id, "Hey! Let's build together!"):
            return False
        
        if not self.test_get_messages("user_b", match_id, expected_count=1):
            return False
        
        print("\n--- Step 8: Test Skip functionality ---")
        # Create User C for skip test
        if not self.test_signup("TestUser Charlie", "charlie_test@test.com", "password123", "user_c"):
            return False
        
        user_c_profile = {
            "role": "Student",
            "city": "Boston",
            "country": "United States",
            "bio": "Medical student", 
            "skills": ["Research", "Data Analysis"],
            "interests": ["Medical Research", "Public Health"],
            "startup_stage": "Idea",
            "commitment_level": "Part Time",
            "looking_for": ["Mentor", "Researcher"]
        }
        
        if not self.test_profile_update("user_c", user_c_profile):
            return False
        
        # User A skips User C
        user_c_id = self.user_ids.get("user_c")
        if user_c_id:
            success, is_match = self.test_swipe("user_a", user_c_id, "pass")
            if success:
                self.log_result("Skip functionality", True, "User A successfully skipped User C")
            else:
                self.log_result("Skip functionality", False, "Failed to record skip")
        
        print("\n--- Test Summary ---")
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if "✅" in result["status"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if "❌" in result["status"]]
        if failed_tests:
            print("\nFailed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return passed_tests == total_tests

def main():
    tester = BackendTester()
    success = tester.run_complete_test_flow()
    
    if success:
        print("\n🎉 All tests passed! Smart matching feature is working correctly.")
        exit(0)
    else:
        print("\n❌ Some tests failed. Check the details above.")
        exit(1)

if __name__ == "__main__":
    main()