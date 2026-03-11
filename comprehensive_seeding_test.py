import requests
import json
import time

# API Base URL
BASE_URL = "https://community-seeded.preview.emergentagent.com/api"

def test_authenticated_projects():
    """Test projects endpoint with authentication"""
    print("=== Testing Authenticated Projects Access ===")
    
    # Login with seed user first
    seed_user_data = {
        "email": "aarav.mehta@seed.1cofounder",
        "password": "Welcome@1cf"
    }
    
    try:
        print("1. Logging in with seed user for projects access...")
        response = requests.post(f"{BASE_URL}/auth/login", json=seed_user_data)
        
        if response.status_code == 200:
            token = response.json().get("token")
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test projects endpoint with auth
            print("2. Testing GET /api/projects with authentication...")
            projects_response = requests.get(f"{BASE_URL}/projects", headers=headers)
            print(f"Projects endpoint status: {projects_response.status_code}")
            
            if projects_response.status_code == 200:
                projects_data = projects_response.json()
                projects = projects_data.get("projects", [])
                print(f"✅ Projects accessible with auth - Found {len(projects)} projects")
                
                if len(projects) >= 8:
                    print("✅ Projects seeding verification PASSED - 8+ projects found")
                    # Show example projects
                    for i, project in enumerate(projects[:3]):
                        print(f"  Project {i+1}: {project.get('name', 'No name')[:50]}...")
                else:
                    print(f"❌ Projects seeding verification FAILED - Only {len(projects)} projects found, expected 8+")
            else:
                print(f"❌ Projects endpoint still failed with auth: {projects_response.status_code}")
                print(f"Response: {projects_response.text}")
        else:
            print(f"❌ Seed user login failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Authenticated projects test failed with error: {e}")

def test_admin_dashboard_for_user_count():
    """Test admin dashboard to get accurate user count"""
    print("\n=== Testing Admin Dashboard for User Count ===")
    
    admin_data = {
        "email": "admin@1cofounder.ai",
        "password": "Admin@1cf2026"
    }
    
    try:
        print("1. Logging in as admin...")
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_data)
        
        if response.status_code == 200:
            admin_token = response.json().get("token")
            headers = {"Authorization": f"Bearer {admin_token}"}
            
            # Test admin dashboard
            print("2. Testing admin dashboard for stats...")
            dashboard_response = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers)
            print(f"Admin dashboard status: {dashboard_response.status_code}")
            
            if dashboard_response.status_code == 200:
                dashboard_data = dashboard_response.json()
                stats = dashboard_data.get("stats", {})
                
                total_users = stats.get("totalUsers", 0)
                new_today = stats.get("newToday", 0)
                total_problems = stats.get("totalProblems", 0)
                total_projects = stats.get("totalProjects", 0)
                
                print(f"✅ Admin dashboard accessible")
                print(f"  Total Users: {total_users}")
                print(f"  New Today: {new_today}")
                print(f"  Total Problems: {total_problems}")
                print(f"  Total Projects: {total_projects}")
                
                # Verify seeding expectations
                if total_users >= 100:
                    print("✅ User seeding verification PASSED - 100+ users in system")
                else:
                    print(f"❌ User seeding verification FAILED - Only {total_users} users, expected 100+")
                    
                if total_problems >= 20:
                    print("✅ Problems seeding verification PASSED via dashboard")
                else:
                    print(f"❌ Problems seeding verification FAILED via dashboard - Only {total_problems}")
                    
                if total_projects >= 8:
                    print("✅ Projects seeding verification PASSED via dashboard")
                else:
                    print(f"❌ Projects seeding verification FAILED via dashboard - Only {total_projects}")
                    
            else:
                print(f"❌ Admin dashboard failed: {dashboard_response.status_code}")
                print(f"Response: {dashboard_response.text}")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Admin dashboard test failed with error: {e}")

def test_specific_auth_details():
    """Test specific auth details to verify user data"""
    print("\n=== Testing Specific Auth Details ===")
    
    # Test with seed user
    seed_user_data = {
        "email": "aarav.mehta@seed.1cofounder",
        "password": "Welcome@1cf"
    }
    
    try:
        print("1. Testing seed user auth details...")
        response = requests.post(f"{BASE_URL}/auth/login", json=seed_user_data)
        
        if response.status_code == 200:
            response_data = response.json()
            user = response_data.get("user", {})
            token = response_data.get("token")
            
            print(f"✅ Seed user login successful")
            print(f"  User ID: {user.get('id', 'Unknown')}")
            print(f"  Name: {user.get('name', 'Unknown')}")
            print(f"  Email: {user.get('email', 'Unknown')}")
            print(f"  Email Verified: {user.get('email_verified', 'Unknown')}")
            print(f"  Profile Complete: {user.get('profile_complete', 'Unknown')}")
            
            # Test /api/auth/me for more details
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                print(f"  Profile Completeness: {me_data.get('profile_completeness', 'Unknown')}%")
                print(f"  Unread Notifications: {me_data.get('unread_notifications', 'Unknown')}")
        else:
            print(f"❌ Seed user login failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Seed user auth details test failed with error: {e}")
    
    # Test with admin user
    admin_data = {
        "email": "admin@1cofounder.ai",
        "password": "Admin@1cf2026"
    }
    
    try:
        print("\n2. Testing admin auth details...")
        response = requests.post(f"{BASE_URL}/auth/login", json=admin_data)
        
        if response.status_code == 200:
            response_data = response.json()
            user = response_data.get("user", {})
            token = response_data.get("token")
            
            print(f"✅ Admin login successful")
            print(f"  User ID: {user.get('id', 'Unknown')}")
            print(f"  Name: {user.get('name', 'Unknown')}")
            print(f"  Email: {user.get('email', 'Unknown')}")
            print(f"  Is Admin: {user.get('is_admin', 'Unknown')}")
            print(f"  Email Verified: {user.get('email_verified', 'Unknown')}")
            
            # Test /api/auth/me for admin details
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                print(f"  Admin Status in /me: {me_data.get('is_admin', 'Unknown')}")
                if me_data.get('is_admin'):
                    print("✅ Admin privileges confirmed via /api/auth/me")
                else:
                    print("❌ Admin privileges not found in /api/auth/me response")
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Admin auth details test failed with error: {e}")

def test_comprehensive_rollback_verification():
    """More comprehensive email verification rollback test"""
    print("\n=== Comprehensive Email Verification Rollback Test ===")
    
    timestamp = int(time.time())
    test_email = f"rollback_test_{timestamp}@test.com"
    
    signup_data = {
        "name": "Rollback Test User",
        "email": test_email,
        "password": "SecurePass123!"
    }
    
    try:
        print("1. Testing complete signup → login → auth flow...")
        
        # Step 1: Signup
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
        print(f"Signup status: {signup_response.status_code}")
        
        if signup_response.status_code in [200, 201]:
            signup_data_response = signup_response.json()
            
            # Verify rollback characteristics
            has_token = "token" in signup_data_response
            has_user = "user" in signup_data_response
            no_verification_required = "email_verification_required" not in signup_data_response
            
            print(f"✅ Signup Response Analysis:")
            print(f"  Has token: {has_token}")
            print(f"  Has user: {has_user}")
            print(f"  No email_verification_required: {no_verification_required}")
            
            if has_token and has_user and no_verification_required:
                print("✅ EMAIL VERIFICATION ROLLBACK CONFIRMED - Signup returns token directly")
                
                user = signup_data_response.get("user", {})
                print(f"  User email_verified: {user.get('email_verified')}")
                
                # Step 2: Immediate login test
                login_response = requests.post(f"{BASE_URL}/auth/login", json={
                    "email": test_email,
                    "password": "SecurePass123!"
                })
                
                print(f"Immediate login status: {login_response.status_code}")
                
                if login_response.status_code == 200:
                    login_data = login_response.json()
                    if "token" in login_data:
                        print("✅ ROLLBACK CONFIRMED - Unverified user can login immediately")
                        
                        # Step 3: Test authenticated endpoint access
                        token = login_data.get("token")
                        headers = {"Authorization": f"Bearer {token}"}
                        
                        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                        if me_response.status_code == 200:
                            print("✅ ROLLBACK CONFIRMED - Unverified user can access authenticated endpoints")
                        else:
                            print("❌ Unverified user cannot access authenticated endpoints")
                    else:
                        print("❌ Login response missing token")
                else:
                    print(f"❌ Immediate login failed: {login_response.status_code}")
            else:
                print("❌ EMAIL VERIFICATION ROLLBACK NOT COMPLETE")
        else:
            print(f"❌ Signup failed: {signup_response.status_code}")
            print(f"Response: {signup_response.text}")
            
    except Exception as e:
        print(f"❌ Comprehensive rollback test failed with error: {e}")

def main():
    """Run comprehensive seeding and rollback verification tests"""
    print("🔬 COMPREHENSIVE 1COFOUNDER SEEDING & ROLLBACK VERIFICATION")
    print("=" * 70)
    print(f"Testing against: {BASE_URL}")
    print()
    
    # Run all tests
    test_admin_dashboard_for_user_count()
    test_authenticated_projects()
    test_comprehensive_rollback_verification()
    test_specific_auth_details()
    
    print("\n" + "=" * 70)
    print("✅ COMPREHENSIVE VERIFICATION TESTS COMPLETE")

if __name__ == "__main__":
    main()