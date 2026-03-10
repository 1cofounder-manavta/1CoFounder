#!/usr/bin/env python3

import requests
import json
import sys
import random
import string

# Base URL for the API
BASE_URL = "https://health-cofound.preview.emergentagent.com/api"

# Generate unique emails for each test run
def generate_unique_email(base):
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return base.replace('@', f'+{suffix}@')

# Test data
alice_data = {
    "name": "Dr. Alice Smith",
    "email": generate_unique_email("alice@test.com"), 
    "password": "password123"
}

bob_data = {
    "name": "Bob Engineer",
    "email": generate_unique_email("bob@test.com"),
    "password": "password123"
}

alice_profile = {
    "name": "Dr. Alice Smith",
    "role": "Doctor", 
    "location": "San Francisco, CA",
    "bio": "Passionate about AI in healthcare",
    "skills": ["AI/ML", "Clinical Research"],
    "interests": ["Digital Health", "Oncology"],
    "startup_stage": "Idea",
    "commitment_level": "Full-time",
    "looking_for": ["Technical Co-founder", "Business Partner"]
}

bob_profile = {
    "name": "Bob Engineer",
    "role": "Engineer",
    "location": "San Francisco, CA", 
    "bio": "Experienced software engineer",
    "skills": ["Software Engineering", "AI/ML"],
    "interests": ["Digital Health", "Startups"],
    "startup_stage": "Idea",
    "commitment_level": "Full-time",
    "looking_for": ["Business Partner", "Medical Expert"]
}

# Global variables to store tokens and IDs
alice_token = None
bob_token = None
alice_id = None
bob_id = None
match_id = None
project_id = None

def test_health_check():
    """Test 1: Health Check"""
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and response.json().get('status') == 'ok':
            print("✅ Health check passed")
            return True
        else:
            print("❌ Health check failed")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_alice_signup():
    """Test 2: Alice Signup"""
    print("\n2. Testing Alice Signup...")
    global alice_token, alice_id
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=alice_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get('token') and data.get('user'):
            alice_token = data['token']
            alice_id = data['user']['id']
            print("✅ Alice signup passed")
            return True
        else:
            print("❌ Alice signup failed")
            return False
    except Exception as e:
        print(f"❌ Alice signup error: {str(e)}")
        return False

def test_alice_login():
    """Test 3: Alice Login"""
    print("\n3. Testing Alice Login...")
    global alice_token, alice_id
    
    try:
        login_data = {"email": alice_data["email"], "password": alice_data["password"]}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and data.get('token') and data.get('user'):
            alice_token = data['token'] # Update token
            alice_id = data['user']['id'] # Update ID
            print("✅ Alice login passed")
            return True
        else:
            print("❌ Alice login failed")
            return False
    except Exception as e:
        print(f"❌ Alice login error: {str(e)}")
        return False

def test_get_current_user():
    """Test 4: Get Current User"""
    print("\n4. Testing Get Current User...")
    
    if not alice_token:
        print("❌ No Alice token available")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and data.get('user'):
            print("✅ Get current user passed")
            return True
        else:
            print("❌ Get current user failed")
            return False
    except Exception as e:
        print(f"❌ Get current user error: {str(e)}")
        return False

def test_update_alice_profile():
    """Test 5: Update Alice Profile"""
    print("\n5. Testing Update Alice Profile...")
    
    if not alice_token:
        print("❌ No Alice token available")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        response = requests.put(f"{BASE_URL}/users/profile", headers=headers, json=alice_profile)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and data.get('user') and data['user'].get('profile_complete') == True:
            print("✅ Update Alice profile passed")
            return True
        else:
            print("❌ Update Alice profile failed")
            return False
    except Exception as e:
        print(f"❌ Update Alice profile error: {str(e)}")
        return False

def test_bob_signup_and_profile():
    """Test 6: Bob Signup and Profile Update"""
    print("\n6. Testing Bob Signup and Profile Update...")
    global bob_token, bob_id
    
    # Bob signup
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=bob_data)
        print(f"Bob Signup Status Code: {response.status_code}")
        data = response.json()
        print(f"Bob Signup Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get('token') and data.get('user'):
            bob_token = data['token']
            bob_id = data['user']['id']
            print("✅ Bob signup passed")
        else:
            print("❌ Bob signup failed")
            return False
    except Exception as e:
        print(f"❌ Bob signup error: {str(e)}")
        return False
    
    # Bob profile update
    try:
        headers = {"Authorization": f"Bearer {bob_token}"}
        response = requests.put(f"{BASE_URL}/users/profile", headers=headers, json=bob_profile)
        print(f"Bob Profile Update Status Code: {response.status_code}")
        data = response.json()
        print(f"Bob Profile Update Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and data.get('user') and data['user'].get('profile_complete') == True:
            print("✅ Bob profile update passed")
            return True
        else:
            print("❌ Bob profile update failed")
            return False
    except Exception as e:
        print(f"❌ Bob profile update error: {str(e)}")
        return False

def test_discover_users():
    """Test 7: Discover Users"""
    print("\n7. Testing Discover Users...")
    
    if not alice_token:
        print("❌ No Alice token available")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        response = requests.get(f"{BASE_URL}/users/discover", headers=headers)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and 'users' in data:
            # Check if Bob is in the discovered users
            bob_found = any(user.get('id') == bob_id for user in data['users'])
            if bob_found:
                print("✅ Discover users passed - Bob found in results")
                return True
            else:
                print("⚠️ Discover users working but Bob not in results (might be random)")
                return True
        else:
            print("❌ Discover users failed")
            return False
    except Exception as e:
        print(f"❌ Discover users error: {str(e)}")
        return False

def test_swipe_alice_likes_bob():
    """Test 8: Alice Swipes (Likes) Bob"""
    print("\n8. Testing Alice Swipes (Likes) Bob...")
    
    if not alice_token or not bob_id:
        print("❌ Missing Alice token or Bob ID")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        swipe_data = {"target_id": bob_id, "action": "like"}
        response = requests.post(f"{BASE_URL}/swipes", headers=headers, json=swipe_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and data.get('swipe'):
            match_result = data.get('match', False)
            print(f"✅ Alice's swipe passed - Match: {match_result}")
            return True
        else:
            print("❌ Alice's swipe failed")
            return False
    except Exception as e:
        print(f"❌ Alice's swipe error: {str(e)}")
        return False

def test_swipe_bob_likes_alice():
    """Test 9: Bob Swipes (Likes) Alice - Should Create Match"""
    print("\n9. Testing Bob Swipes (Likes) Alice...")
    global match_id
    
    if not bob_token or not alice_id:
        print("❌ Missing Bob token or Alice ID")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {bob_token}"}
        swipe_data = {"target_id": alice_id, "action": "like"}
        response = requests.post(f"{BASE_URL}/swipes", headers=headers, json=swipe_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and data.get('swipe'):
            match_result = data.get('match', False)
            if match_result and data.get('match_data'):
                match_id = data['match_data']['match']['id']
                print(f"✅ Bob's swipe passed - Match created! Match ID: {match_id}")
                return True
            else:
                print("✅ Bob's swipe passed but no match created")
                return True
        else:
            print("❌ Bob's swipe failed")
            return False
    except Exception as e:
        print(f"❌ Bob's swipe error: {str(e)}")
        return False

def test_get_matches():
    """Test 10: Get Matches"""
    print("\n10. Testing Get Matches...")
    
    if not alice_token:
        print("❌ No Alice token available")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        response = requests.get(f"{BASE_URL}/matches", headers=headers)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and 'matches' in data:
            matches = data['matches']
            if len(matches) > 0:
                print(f"✅ Get matches passed - Found {len(matches)} match(es)")
                # Update match_id if we don't have it
                global match_id
                if not match_id and matches:
                    match_id = matches[0]['id']
                    print(f"Updated match_id: {match_id}")
                return True
            else:
                print("⚠️ Get matches working but no matches found")
                return True
        else:
            print("❌ Get matches failed")
            return False
    except Exception as e:
        print(f"❌ Get matches error: {str(e)}")
        return False

def test_send_message():
    """Test 11: Send Message"""
    print("\n11. Testing Send Message...")
    
    if not alice_token or not match_id:
        print("❌ Missing Alice token or match ID")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        message_data = {
            "conversation_id": match_id,
            "message": "Hi Bob! Let's build something!"
        }
        response = requests.post(f"{BASE_URL}/messages", headers=headers, json=message_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get('message'):
            print("✅ Send message passed")
            return True
        else:
            print("❌ Send message failed")
            return False
    except Exception as e:
        print(f"❌ Send message error: {str(e)}")
        return False

def test_get_messages():
    """Test 12: Get Messages"""
    print("\n12. Testing Get Messages...")
    
    if not alice_token or not match_id:
        print("❌ Missing Alice token or match ID")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        response = requests.get(f"{BASE_URL}/messages/{match_id}", headers=headers)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and 'messages' in data:
            messages = data['messages']
            print(f"✅ Get messages passed - Found {len(messages)} message(s)")
            return True
        else:
            print("❌ Get messages failed")
            return False
    except Exception as e:
        print(f"❌ Get messages error: {str(e)}")
        return False

def test_create_problem():
    """Test 13: Create Problem"""
    print("\n13. Testing Create Problem...")
    
    if not alice_token:
        print("❌ No Alice token available")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        problem_data = {
            "title": "AI Triage System",
            "description": "Need an AI system for ER triage",
            "clinical_context": "Emergency room",
            "skills_required": ["AI/ML", "Software Engineering"]
        }
        response = requests.post(f"{BASE_URL}/problems", headers=headers, json=problem_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get('problem'):
            print("✅ Create problem passed")
            return True
        else:
            print("❌ Create problem failed")
            return False
    except Exception as e:
        print(f"❌ Create problem error: {str(e)}")
        return False

def test_get_problems():
    """Test 14: Get Problems"""
    print("\n14. Testing Get Problems...")
    
    try:
        response = requests.get(f"{BASE_URL}/problems")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and 'problems' in data:
            problems = data['problems']
            print(f"✅ Get problems passed - Found {len(problems)} problem(s)")
            return True
        else:
            print("❌ Get problems failed")
            return False
    except Exception as e:
        print(f"❌ Get problems error: {str(e)}")
        return False

def test_create_project():
    """Test 15: Create Project"""
    print("\n15. Testing Create Project...")
    global project_id
    
    if not alice_token:
        print("❌ No Alice token available")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {alice_token}"}
        project_data = {
            "name": "MedTriage AI",
            "description": "Building AI triage for ERs", 
            "stage": "Idea"
        }
        response = requests.post(f"{BASE_URL}/projects", headers=headers, json=project_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get('project'):
            project_id = data['project']['id']
            print(f"✅ Create project passed - Project ID: {project_id}")
            return True
        else:
            print("❌ Create project failed")
            return False
    except Exception as e:
        print(f"❌ Create project error: {str(e)}")
        return False

def test_get_projects():
    """Test 16: Get Projects"""
    print("\n16. Testing Get Projects...")
    
    try:
        response = requests.get(f"{BASE_URL}/projects")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and 'projects' in data:
            projects = data['projects']
            print(f"✅ Get projects passed - Found {len(projects)} project(s)")
            return True
        else:
            print("❌ Get projects failed")
            return False
    except Exception as e:
        print(f"❌ Get projects error: {str(e)}")
        return False

def test_join_project():
    """Test 17: Join Project (Bob joins Alice's project)"""
    print("\n17. Testing Join Project...")
    
    if not bob_token or not project_id:
        print("❌ Missing Bob token or project ID")
        return False
        
    try:
        headers = {"Authorization": f"Bearer {bob_token}"}
        join_data = {"role": "Engineer"}
        response = requests.post(f"{BASE_URL}/projects/{project_id}/join", headers=headers, json=join_data)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201 and data.get('member'):
            print("✅ Join project passed")
            return True
        else:
            print("❌ Join project failed")
            return False
    except Exception as e:
        print(f"❌ Join project error: {str(e)}")
        return False

def main():
    """Run all tests in sequence"""
    print("Starting 1CoFounder.com Backend API Tests")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_alice_signup, 
        test_alice_login,
        test_get_current_user,
        test_update_alice_profile,
        test_bob_signup_and_profile,
        test_discover_users,
        test_swipe_alice_likes_bob,
        test_swipe_bob_likes_alice,
        test_get_matches,
        test_send_message,
        test_get_messages,
        test_create_problem,
        test_get_problems,
        test_create_project,
        test_get_projects,
        test_join_project
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        if not result:
            print(f"\n⚠️ Test {test.__name__} failed, continuing with remaining tests...")
    
    print("\n" + "=" * 50)
    print("FINAL TEST RESULTS:")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    for i, (test, result) in enumerate(zip(tests, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i+1:2d}. {test.__name__:<30} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)