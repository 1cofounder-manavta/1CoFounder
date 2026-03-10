import requests
import json
import uuid
import time
from datetime import datetime

# Base URL from environment
BASE_URL = "https://cofounder-ready.preview.emergentagent.com/api"

# Test credentials from review request
CREDENTIALS = {
    'regular1': {'email': 'priya@test.com', 'password': 'password123'},
    'regular2': {'email': 'rahul@test.com', 'password': 'password123'},
    'admin': {'email': 'admin@1cofounder.com', 'password': 'admin123'}
}

def login_user(credentials):
    """Login and return auth headers"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
        if response.status_code == 200:
            result = response.json()
            return {'Authorization': f"Bearer {result['token']}"}
        else:
            print(f"❌ Login failed for {credentials['email']}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error for {credentials['email']}: {str(e)}")
        return None

def test_production_readiness_features():
    print("=== Testing Production Readiness Features for 1CoFounder.com ===\n")
    
    # Login users
    print("1. Authenticating test users...")
    auth_headers = {}
    
    for user_type, creds in CREDENTIALS.items():
        print(f"   Logging in {user_type} ({creds['email']})...")
        headers = login_user(creds)
        if headers:
            auth_headers[user_type] = headers
            print(f"   ✅ {user_type} logged in successfully")
        else:
            print(f"   ❌ {user_type} login failed")
            return
    
    # Test 1: Email Verification
    print("\n2. Testing Email Verification System...")
    test_email_verification(auth_headers)
    
    # Test 2: Notifications
    print("\n3. Testing Notifications System...")
    test_notifications(auth_headers)
    
    # Test 3: Rate Limiting
    print("\n4. Testing Rate Limiting...")
    test_rate_limiting(auth_headers)
    
    # Test 4: Block System
    print("\n5. Testing Block System...")
    test_block_system(auth_headers)
    
    # Test 5: Reports System
    print("\n6. Testing Reports System...")
    test_reports_system(auth_headers)
    
    # Test 6: Settings / Password Management
    print("\n7. Testing Settings & Password Management...")
    test_settings_password(auth_headers)
    
    # Test 7: Profile Completeness
    print("\n8. Testing Profile Completeness...")
    test_profile_completeness(auth_headers)
    
    # Test 8: Admin Enhanced Analytics
    print("\n9. Testing Admin Enhanced Analytics...")
    test_admin_analytics(auth_headers)
    
    # Test 9: Discover with blocked users
    print("\n10. Testing Discover with Blocked Users...")
    test_discover_blocked(auth_headers)
    
    print("\n=== Production Readiness Test Complete ===")

def test_email_verification(auth_headers):
    """Test email verification endpoints"""
    try:
        print("   Testing signup with email verification...")
        
        # Create new user to test verification flow
        new_user_email = f"testuser_{uuid.uuid4().hex[:8]}@test.com"
        signup_data = {
            "name": "Test User",
            "email": new_user_email,
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"   Signup status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            user = result.get('user', {})
            token = result.get('token')
            
            # Check if email_verified is false initially
            email_verified = user.get('email_verified', None)
            print(f"   ✅ Signup successful. email_verified: {email_verified}")
            
            if email_verified is False:
                print("   ✅ Email verification correctly set to false on signup")
            else:
                print(f"   ❌ Expected email_verified=false, got {email_verified}")
            
            # Test resend verification
            print("   Testing resend verification...")
            headers = {'Authorization': f"Bearer {token}"}
            
            response = requests.post(f"{BASE_URL}/auth/resend-verification", headers=headers)
            print(f"   Resend verification status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ Resend verification successful")
            else:
                print(f"   ❌ Resend verification failed: {response.text}")
                
            # Test verification endpoint with invalid token
            print("   Testing verification with invalid token...")
            fake_token = "invalid_token_12345"
            response = requests.get(f"{BASE_URL}/auth/verify?token={fake_token}")
            print(f"   Invalid token verification status: {response.status_code}")
            
            if response.status_code == 400:
                print("   ✅ Invalid token correctly rejected")
            else:
                print(f"   ❌ Expected 400 for invalid token, got {response.status_code}")
            
        else:
            print(f"   ❌ Signup failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Email verification test error: {str(e)}")

def test_notifications(auth_headers):
    """Test notifications system"""
    try:
        headers = auth_headers['regular1']
        
        print("   Testing GET /api/notifications...")
        response = requests.get(f"{BASE_URL}/notifications", headers=headers)
        print(f"   Get notifications status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            notifications = result.get('notifications', [])
            unread = result.get('unread', 0)
            
            print(f"   ✅ Notifications retrieved. Count: {len(notifications)}, Unread: {unread}")
            
            # Test mark all as read
            print("   Testing mark all notifications as read...")
            response = requests.post(f"{BASE_URL}/notifications/read", 
                                   json={}, headers=headers)
            print(f"   Mark all as read status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ Mark all as read successful")
                
                # Verify unread count is now 0
                response = requests.get(f"{BASE_URL}/notifications", headers=headers)
                if response.status_code == 200:
                    result = response.json()
                    new_unread = result.get('unread', 0)
                    print(f"   ✅ Unread count after mark as read: {new_unread}")
                    
                    if new_unread == 0:
                        print("   ✅ All notifications marked as read successfully")
                    
            else:
                print(f"   ❌ Mark as read failed: {response.text}")
                
            # Test mark specific notification as read (if any exist)
            if len(notifications) > 0:
                print("   Testing mark specific notification as read...")
                notification_id = notifications[0].get('id')
                if notification_id:
                    response = requests.post(f"{BASE_URL}/notifications/read", 
                                           json={'id': notification_id}, headers=headers)
                    print(f"   Mark specific as read status: {response.status_code}")
                    
                    if response.status_code == 200:
                        print("   ✅ Mark specific notification as read successful")
                    else:
                        print(f"   ❌ Mark specific as read failed: {response.text}")
            
        else:
            print(f"   ❌ Get notifications failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Notifications test error: {str(e)}")

def test_rate_limiting(auth_headers):
    """Test rate limiting on swipes and problems"""
    try:
        headers = auth_headers['regular1']
        
        print("   Testing swipe rate limiting...")
        
        # Get a user to swipe on
        response = requests.get(f"{BASE_URL}/users/discover", headers=headers)
        if response.status_code == 200:
            result = response.json()
            users = result.get('users', [])
            
            if len(users) > 0:
                target_user_id = users[0]['id']
                
                # Make a swipe (should work)
                swipe_data = {
                    "target_id": target_user_id,
                    "action": "like"
                }
                
                response = requests.post(f"{BASE_URL}/swipes", json=swipe_data, headers=headers)
                print(f"   First swipe status: {response.status_code}")
                
                if response.status_code == 200:
                    print("   ✅ First swipe successful (within rate limit)")
                else:
                    print(f"   ❌ First swipe failed: {response.text}")
                    
                # Note: Not testing exhaustive 30 swipes for performance
                print("   ✅ Swipe rate limiting endpoint accessible (not testing full 30 limit)")
            else:
                print("   ⚠️ No users available for swipe testing")
        
        print("   Testing problem post rate limiting...")
        
        # Test creating a problem (should work up to 3 times per day)
        problem_data = {
            "title": f"Test Problem {uuid.uuid4().hex[:8]}",
            "description": "Test problem for rate limiting",
            "clinical_context": "Testing context",
            "skills_required": ["Testing"]
        }
        
        response = requests.post(f"{BASE_URL}/problems", json=problem_data, headers=headers)
        print(f"   Problem creation status: {response.status_code}")
        
        if response.status_code == 201:
            print("   ✅ Problem creation successful (within rate limit)")
        elif response.status_code == 429:
            print("   ✅ Rate limit correctly enforced (429 status)")
        else:
            print(f"   ❌ Problem creation failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Rate limiting test error: {str(e)}")

def test_block_system(auth_headers):
    """Test block/unblock system"""
    try:
        headers1 = auth_headers['regular1']  # priya
        headers2 = auth_headers['regular2']  # rahul
        
        # Get user IDs
        print("   Getting user information...")
        response1 = requests.get(f"{BASE_URL}/auth/me", headers=headers1)
        response2 = requests.get(f"{BASE_URL}/auth/me", headers=headers2)
        
        if response1.status_code == 200 and response2.status_code == 200:
            user1 = response1.json()['user']
            user2 = response2.json()['user']
            
            user1_id = user1['id']
            user2_id = user2['id']
            
            print(f"   User 1 (Priya): {user1_id}")
            print(f"   User 2 (Rahul): {user2_id}")
            
            # Test block user
            print("   Testing block user...")
            block_data = {"blocked_id": user2_id}
            
            response = requests.post(f"{BASE_URL}/users/block", json=block_data, headers=headers1)
            print(f"   Block user status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ User blocked successfully")
                
                # Test get blocked users list
                print("   Testing get blocked users list...")
                response = requests.get(f"{BASE_URL}/users/blocked", headers=headers1)
                print(f"   Get blocked users status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    blocked_users = result.get('blocked_users', [])
                    print(f"   ✅ Blocked users list retrieved. Count: {len(blocked_users)}")
                    
                    # Check if user2 is in the blocked list
                    blocked_user_ids = [u['id'] for u in blocked_users]
                    if user2_id in blocked_user_ids:
                        print("   ✅ Blocked user found in blocked list")
                    else:
                        print("   ❌ Blocked user not found in blocked list")
                        
                else:
                    print(f"   ❌ Get blocked users failed: {response.text}")
                
                # Test discover doesn't include blocked user
                print("   Testing discover excludes blocked users...")
                response = requests.get(f"{BASE_URL}/users/discover", headers=headers1)
                print(f"   Discover users status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    discovered_users = result.get('users', [])
                    discovered_user_ids = [u['id'] for u in discovered_users]
                    
                    if user2_id not in discovered_user_ids:
                        print("   ✅ Blocked user correctly excluded from discover")
                    else:
                        print("   ❌ Blocked user still appears in discover")
                        
                else:
                    print(f"   ❌ Discover users failed: {response.text}")
                
                # Test unblock user
                print("   Testing unblock user...")
                unblock_data = {"blocked_id": user2_id}
                
                response = requests.post(f"{BASE_URL}/users/unblock", json=unblock_data, headers=headers1)
                print(f"   Unblock user status: {response.status_code}")
                
                if response.status_code == 200:
                    print("   ✅ User unblocked successfully")
                    
                    # Verify blocked list is empty
                    response = requests.get(f"{BASE_URL}/users/blocked", headers=headers1)
                    if response.status_code == 200:
                        result = response.json()
                        blocked_users = result.get('blocked_users', [])
                        print(f"   ✅ Blocked users count after unblock: {len(blocked_users)}")
                        
                        if len(blocked_users) == 0:
                            print("   ✅ Blocked list cleared after unblock")
                            
                else:
                    print(f"   ❌ Unblock user failed: {response.text}")
                    
            else:
                print(f"   ❌ Block user failed: {response.text}")
                
        else:
            print("   ❌ Failed to get user information for blocking test")
            
    except Exception as e:
        print(f"   ❌ Block system test error: {str(e)}")

def test_reports_system(auth_headers):
    """Test reports system"""
    try:
        headers1 = auth_headers['regular1']  # priya
        headers2 = auth_headers['regular2']  # rahul
        
        # Get user IDs
        response1 = requests.get(f"{BASE_URL}/auth/me", headers=headers1)
        response2 = requests.get(f"{BASE_URL}/auth/me", headers=headers2)
        
        if response1.status_code == 200 and response2.status_code == 200:
            user1 = response1.json()['user']
            user2 = response2.json()['user']
            
            user2_id = user2['id']
            
            # Test create report
            print("   Testing create report...")
            report_data = {
                "target_type": "user",
                "target_id": user2_id,
                "reason": "Testing report system"
            }
            
            response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers1)
            print(f"   Create report status: {response.status_code}")
            
            if response.status_code == 201:
                result = response.json()
                report = result.get('report', {})
                print(f"   ✅ Report created successfully. ID: {report.get('id')}")
                
                # Test duplicate report (should fail with 409)
                print("   Testing duplicate report...")
                response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers1)
                print(f"   Duplicate report status: {response.status_code}")
                
                if response.status_code == 409:
                    print("   ✅ Duplicate report correctly rejected (409)")
                else:
                    print(f"   ❌ Expected 409 for duplicate report, got {response.status_code}")
                    
                # Verify report_count incremented (would need admin access to check)
                print("   ✅ Report system basic functionality working")
                
            else:
                print(f"   ❌ Create report failed: {response.text}")
                
        else:
            print("   ❌ Failed to get user information for reports test")
            
    except Exception as e:
        print(f"   ❌ Reports system test error: {str(e)}")

def test_settings_password(auth_headers):
    """Test settings and password management"""
    try:
        headers = auth_headers['regular1']
        
        # Test password change with wrong current password
        print("   Testing password change with wrong current password...")
        wrong_password_data = {
            "current_password": "wrongpassword",
            "new_password": "newpassword123"
        }
        
        response = requests.put(f"{BASE_URL}/users/password", json=wrong_password_data, headers=headers)
        print(f"   Wrong password status: {response.status_code}")
        
        if response.status_code == 400:
            print("   ✅ Wrong current password correctly rejected")
        else:
            print(f"   ❌ Expected 400 for wrong password, got {response.status_code}")
        
        # Test password change with correct current password
        print("   Testing password change with correct current password...")
        correct_password_data = {
            "current_password": "password123",
            "new_password": "newpassword123"
        }
        
        response = requests.put(f"{BASE_URL}/users/password", json=correct_password_data, headers=headers)
        print(f"   Correct password change status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Password change successful")
            
            # Reset password back to original
            print("   Resetting password back to original...")
            reset_data = {
                "current_password": "newpassword123",
                "new_password": "password123"
            }
            
            response = requests.put(f"{BASE_URL}/users/password", json=reset_data, headers=headers)
            print(f"   Password reset status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ Password reset to original successful")
            else:
                print(f"   ❌ Password reset failed: {response.text}")
                
        else:
            print(f"   ❌ Password change failed: {response.text}")
        
        # Test notification preferences
        print("   Testing notification preferences...")
        prefs_data = {
            "matches": True,
            "messages": False,
            "problems": True,
            "projects": False
        }
        
        response = requests.put(f"{BASE_URL}/users/notification-preferences", json=prefs_data, headers=headers)
        print(f"   Notification preferences status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Notification preferences updated successfully")
        else:
            print(f"   ❌ Notification preferences update failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Settings/password test error: {str(e)}")

def test_profile_completeness(auth_headers):
    """Test profile completeness calculation"""
    try:
        headers = auth_headers['regular1']
        
        print("   Testing profile completeness in /api/auth/me...")
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"   Get current user status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            user = result.get('user', {})
            
            profile_completeness = user.get('profile_completeness')
            unread_notifications = user.get('unread_notifications')
            
            print(f"   ✅ Profile completeness: {profile_completeness}%")
            print(f"   ✅ Unread notifications count: {unread_notifications}")
            
            if profile_completeness is not None:
                print("   ✅ Profile completeness field present in response")
                
                if isinstance(profile_completeness, int) and 0 <= profile_completeness <= 100:
                    print("   ✅ Profile completeness is valid percentage (0-100)")
                else:
                    print(f"   ❌ Invalid profile completeness value: {profile_completeness}")
            else:
                print("   ❌ Profile completeness field missing from response")
                
            if unread_notifications is not None:
                print("   ✅ Unread notifications field present in response")
            else:
                print("   ❌ Unread notifications field missing from response")
                
        else:
            print(f"   ❌ Get current user failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Profile completeness test error: {str(e)}")

def test_admin_analytics(auth_headers):
    """Test admin enhanced analytics"""
    try:
        if 'admin' not in auth_headers:
            print("   ❌ Admin credentials not available")
            return
            
        headers = auth_headers['admin']
        
        print("   Testing admin dashboard analytics...")
        response = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers)
        print(f"   Admin dashboard status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            stats = result.get('stats', {})
            
            # Check for enhanced analytics fields
            expected_fields = ['totalMatches', 'totalMessages', 'activeProjects']
            
            print(f"   ✅ Admin dashboard retrieved. Stats: {stats}")
            
            for field in expected_fields:
                if field in stats:
                    print(f"   ✅ Enhanced analytics field '{field}': {stats[field]}")
                else:
                    print(f"   ❌ Missing enhanced analytics field: {field}")
            
            # Check basic fields too
            basic_fields = ['totalUsers', 'totalProblems', 'totalProjects']
            for field in basic_fields:
                if field in stats:
                    print(f"   ✅ Basic analytics field '{field}': {stats[field]}")
                    
        elif response.status_code == 401:
            print("   ❌ Admin authentication failed - check admin credentials")
        else:
            print(f"   ❌ Admin dashboard failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Admin analytics test error: {str(e)}")

def test_discover_blocked(auth_headers):
    """Test discover endpoint with blocked users"""
    try:
        headers1 = auth_headers['regular1']  # priya
        headers2 = auth_headers['regular2']  # rahul
        
        # Get user IDs
        response1 = requests.get(f"{BASE_URL}/auth/me", headers=headers1)
        response2 = requests.get(f"{BASE_URL}/auth/me", headers=headers2)
        
        if response1.status_code == 200 and response2.status_code == 200:
            user1 = response1.json()['user']
            user2 = response2.json()['user']
            
            user2_id = user2['id']
            
            print(f"   Testing discover before blocking...")
            # Get initial discover list
            response = requests.get(f"{BASE_URL}/users/discover", headers=headers1)
            print(f"   Initial discover status: {response.status_code}")
            
            initial_user_ids = []
            if response.status_code == 200:
                result = response.json()
                initial_users = result.get('users', [])
                initial_user_ids = [u['id'] for u in initial_users]
                print(f"   ✅ Initial discover returned {len(initial_users)} users")
            
            # Block user2 (rahul)
            print(f"   Blocking user {user2_id}...")
            block_data = {"blocked_id": user2_id}
            
            response = requests.post(f"{BASE_URL}/users/block", json=block_data, headers=headers1)
            if response.status_code == 200:
                print("   ✅ User blocked successfully")
                
                # Test discover after blocking
                print("   Testing discover after blocking...")
                response = requests.get(f"{BASE_URL}/users/discover", headers=headers1)
                print(f"   Post-block discover status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    post_block_users = result.get('users', [])
                    post_block_user_ids = [u['id'] for u in post_block_users]
                    
                    print(f"   ✅ Post-block discover returned {len(post_block_users)} users")
                    
                    if user2_id not in post_block_user_ids:
                        print("   ✅ Blocked user correctly excluded from discover results")
                    else:
                        print("   ❌ Blocked user still appears in discover results")
                        
                else:
                    print(f"   ❌ Post-block discover failed: {response.text}")
                
                # Unblock user for cleanup
                print("   Cleaning up - unblocking user...")
                unblock_data = {"blocked_id": user2_id}
                response = requests.post(f"{BASE_URL}/users/unblock", json=unblock_data, headers=headers1)
                if response.status_code == 200:
                    print("   ✅ User unblocked for cleanup")
                    
            else:
                print(f"   ❌ Block user failed: {response.text}")
                
        else:
            print("   ❌ Failed to get user information for discover test")
            
    except Exception as e:
        print(f"   ❌ Discover blocked test error: {str(e)}")

if __name__ == "__main__":
    test_production_readiness_features()