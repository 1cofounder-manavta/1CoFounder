import requests
import json
import time

# API Base URL
BASE_URL = "https://community-seeded.preview.emergentagent.com/api"

def test_database_seeding_verification():
    """Test database seeding verification - verify users, problems, projects counts"""
    print("=== Testing Database Seeding Verification ===")
    
    try:
        # First login as admin to check user count  
        admin_login_data = {
            "email": "admin@1cofounder.ai",
            "password": "Admin@1cf2026"
        }
        
        print("1. Testing admin login...")
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
        print(f"Admin login status: {response.status_code}")
        
        if response.status_code == 200:
            admin_token = response.json().get("token")
            print("✅ Admin login successful")
            
            # Test admin users endpoint to verify 100+ users
            print("\n2. Checking user count via admin endpoint...")
            headers = {"Authorization": f"Bearer {admin_token}"}
            users_response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
            print(f"Admin users endpoint status: {users_response.status_code}")
            
            if users_response.status_code == 200:
                users_data = users_response.json()
                user_count = len(users_data.get("users", []))
                print(f"✅ Found {user_count} users in database")
                
                if user_count >= 100:
                    print("✅ Database seeding verification PASSED - 100+ users found")
                else:
                    print(f"❌ Database seeding verification FAILED - Only {user_count} users found, expected 100+")
            else:
                print(f"❌ Admin users endpoint failed: {users_response.status_code}")
                print(f"Response: {users_response.text}")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Admin user count test failed with error: {e}")
        
    try:
        # Test public problems endpoint - should have 20 problems
        print("\n3. Checking problems count via public endpoint...")
        problems_response = requests.get(f"{BASE_URL}/problems")
        print(f"Problems endpoint status: {problems_response.status_code}")
        
        if problems_response.status_code == 200:
            problems_data = problems_response.json()
            problems_count = len(problems_data.get("problems", []))
            print(f"✅ Found {problems_count} problems in database")
            
            if problems_count >= 20:
                print("✅ Problems seeding verification PASSED - 20+ problems found")
            else:
                print(f"❌ Problems seeding verification FAILED - Only {problems_count} problems found, expected 20+")
        else:
            print(f"❌ Problems endpoint failed: {problems_response.status_code}")
            print(f"Response: {problems_response.text}")
            
    except Exception as e:
        print(f"❌ Problems count test failed with error: {e}")
        
    try:
        # Test projects endpoint - should have 8+ projects
        print("\n4. Checking projects count...")
        projects_response = requests.get(f"{BASE_URL}/projects")
        print(f"Projects endpoint status: {projects_response.status_code}")
        
        if projects_response.status_code == 200:
            projects_data = projects_response.json()
            projects_count = len(projects_data.get("projects", []))
            print(f"✅ Found {projects_count} projects in database")
            
            if projects_count >= 8:
                print("✅ Projects seeding verification PASSED - 8+ projects found")
            else:
                print(f"❌ Projects seeding verification FAILED - Only {projects_count} projects found, expected 8+")
        else:
            print(f"❌ Projects endpoint failed: {projects_response.status_code}")
            print(f"Response: {projects_response.text}")
            
    except Exception as e:
        print(f"❌ Projects count test failed with error: {e}")

def test_email_verification_rollback():
    """Test email verification rollback - signup should return token directly"""
    print("\n=== Testing Email Verification Rollback ===")
    
    timestamp = int(time.time())
    test_email = f"test_verify_rollback_{timestamp}@test.com"
    
    signup_data = {
        "name": "Test Rollback User",
        "email": test_email,
        "password": "TestPassword123!"
    }
    
    try:
        print("1. Testing new user signup (should return token directly)...")
        response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Signup response status: {response.status_code}")
        
        if response.status_code == 201 or response.status_code == 200:
            response_data = response.json()
            print(f"Signup response keys: {list(response_data.keys())}")
            
            # Check that response contains token and user (no email_verification_required)
            if "token" in response_data and "user" in response_data:
                print("✅ Signup returns token and user directly")
                
                # Check that email_verification_required is not present
                if "email_verification_required" not in response_data:
                    print("✅ No email_verification_required field - verification rollback confirmed")
                else:
                    print(f"❌ email_verification_required field still present: {response_data['email_verification_required']}")
                
                # Check user has email_verified: false
                user = response_data.get("user", {})
                if user.get("email_verified") == False:
                    print("✅ User created with email_verified: false as expected")
                else:
                    print(f"❌ User email_verified status unexpected: {user.get('email_verified')}")
                
                token = response_data.get("token")
                
                # Test login with same credentials should work even without verification
                print("\n2. Testing login with unverified email (should work)...")
                login_data = {
                    "email": test_email,
                    "password": "TestPassword123!"
                }
                
                login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
                print(f"Login response status: {login_response.status_code}")
                
                if login_response.status_code == 200:
                    login_response_data = login_response.json()
                    if "token" in login_response_data:
                        print("✅ Login successful even with unverified email - rollback confirmed")
                    else:
                        print("❌ Login response missing token")
                else:
                    print(f"❌ Login failed: {login_response.status_code}")
                    print(f"Response: {login_response.text}")
                    
            else:
                print(f"❌ Signup response missing token or user: {response_data}")
        else:
            print(f"❌ Signup failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Email verification rollback test failed with error: {e}")

def test_auth_endpoints_with_seed_users():
    """Test auth endpoints with seed users and admin"""
    print("\n=== Testing Auth Endpoints with Seed Users ===")
    
    # Test seed user login
    seed_user_data = {
        "email": "aarav.mehta@seed.1cofounder",
        "password": "Welcome@1cf"
    }
    
    try:
        print("1. Testing seed user login...")
        response = requests.post(f"{BASE_URL}/auth/login", json=seed_user_data)
        print(f"Seed user login status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            if "token" in response_data and "user" in response_data:
                print("✅ Seed user login successful")
                seed_token = response_data.get("token")
                
                # Test /api/auth/me with seed user token
                print("\n2. Testing /api/auth/me with seed user token...")
                headers = {"Authorization": f"Bearer {seed_token}"}
                me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                print(f"Auth/me response status: {me_response.status_code}")
                
                if me_response.status_code == 200:
                    user_info = me_response.json()
                    print(f"✅ Auth/me successful - User: {user_info.get('name', 'Unknown')}")
                else:
                    print(f"❌ Auth/me failed: {me_response.status_code}")
            else:
                print(f"❌ Seed user login response missing token/user: {response_data}")
        else:
            print(f"❌ Seed user login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Seed user login test failed with error: {e}")
    
    # Test admin login
    admin_data = {
        "email": "admin@1cofounder.ai", 
        "password": "Admin@1cf2026"
    }
    
    try:
        print("\n3. Testing admin login...")
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_data)
        print(f"Admin login status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            if "token" in response_data and "user" in response_data:
                print("✅ Admin login successful")
                admin_token = response_data.get("token")
                
                # Test /api/auth/me with admin token
                print("\n4. Testing /api/auth/me with admin token...")
                headers = {"Authorization": f"Bearer {admin_token}"}
                me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                print(f"Admin auth/me response status: {me_response.status_code}")
                
                if me_response.status_code == 200:
                    admin_info = me_response.json()
                    print(f"✅ Admin auth/me successful - User: {admin_info.get('name', 'Unknown')}")
                    if admin_info.get('is_admin'):
                        print("✅ Admin privileges confirmed")
                    else:
                        print("❌ Admin privileges not found")
                else:
                    print(f"❌ Admin auth/me failed: {me_response.status_code}")
            else:
                print(f"❌ Admin login response missing token/user: {response_data}")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Admin login test failed with error: {e}")
        
    # Test resend verification endpoint still works
    try:
        print("\n5. Testing resend verification endpoint...")
        resend_data = {"email": "test@example.com"}
        resend_response = requests.post(f"{BASE_URL}/auth/resend-verification", json=resend_data)
        print(f"Resend verification status: {resend_response.status_code}")
        
        if resend_response.status_code in [200, 404]:  # 404 is OK if user doesn't exist
            print("✅ Resend verification endpoint accessible")
        else:
            print(f"❌ Resend verification failed: {resend_response.status_code}")
            
    except Exception as e:
        print(f"❌ Resend verification test failed with error: {e}")

def test_problems_projects_accessibility():
    """Test problems and projects endpoints accessibility with seed data"""
    print("\n=== Testing Problems & Projects Accessibility ===")
    
    try:
        print("1. Testing GET /api/problems accessibility...")
        response = requests.get(f"{BASE_URL}/problems")
        print(f"Problems endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            problems_data = response.json()
            problems = problems_data.get("problems", [])
            print(f"✅ Problems accessible - Found {len(problems)} problems")
            
            # Check if we have seed data
            if len(problems) >= 20:
                print("✅ Seed data confirmed - 20+ problems available")
                # Show a few example problems
                for i, problem in enumerate(problems[:3]):
                    print(f"  Problem {i+1}: {problem.get('title', 'No title')[:50]}...")
            else:
                print(f"❌ Expected 20+ problems from seed, found {len(problems)}")
        else:
            print(f"❌ Problems endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Problems accessibility test failed with error: {e}")
    
    try:
        print("\n2. Testing GET /api/projects accessibility...")
        response = requests.get(f"{BASE_URL}/projects")
        print(f"Projects endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            projects_data = response.json()
            projects = projects_data.get("projects", [])
            print(f"✅ Projects accessible - Found {len(projects)} projects")
            
            # Check if we have seed data
            if len(projects) >= 8:
                print("✅ Seed data confirmed - 8+ projects available")
                # Show a few example projects
                for i, project in enumerate(projects[:3]):
                    print(f"  Project {i+1}: {project.get('name', 'No name')[:50]}...")
            else:
                print(f"❌ Expected 8+ projects from seed, found {len(projects)}")
        else:
            print(f"❌ Projects endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Projects accessibility test failed with error: {e}")

def main():
    """Run all seeding and rollback verification tests"""
    print("🧪 1COFOUNDER SEEDING & ROLLBACK VERIFICATION TESTS")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print()
    
    # Run all tests
    test_database_seeding_verification()
    test_email_verification_rollback()
    test_auth_endpoints_with_seed_users()
    test_problems_projects_accessibility()
    
    print("\n" + "=" * 60)
    print("✅ SEEDING & ROLLBACK VERIFICATION TESTS COMPLETE")

if __name__ == "__main__":
    main()