import requests
import json
import uuid

BASE_URL = "https://community-seeded.preview.emergentagent.com/api"

def test_fresh_reports_system():
    print("=== Testing Reports System with Fresh Users ===\n")
    
    try:
        # Create two fresh users for reports testing
        print("1. Creating fresh test users...")
        
        # User A
        user_a_email = f"reporter_{uuid.uuid4().hex[:8]}@test.com"
        user_a_data = {
            "name": "Reporter User",
            "email": user_a_email,
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=user_a_data)
        print(f"   User A signup status: {response.status_code}")
        
        if response.status_code == 201:
            user_a_result = response.json()
            user_a_headers = {'Authorization': f"Bearer {user_a_result['token']}"}
            user_a_id = user_a_result['user']['id']
            print(f"   ✅ User A created: {user_a_id}")
        else:
            print(f"   ❌ User A creation failed: {response.text}")
            return
            
        # User B  
        user_b_email = f"target_{uuid.uuid4().hex[:8]}@test.com"
        user_b_data = {
            "name": "Target User",
            "email": user_b_email,
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=user_b_data)
        print(f"   User B signup status: {response.status_code}")
        
        if response.status_code == 201:
            user_b_result = response.json()
            user_b_headers = {'Authorization': f"Bearer {user_b_result['token']}"}
            user_b_id = user_b_result['user']['id']
            print(f"   ✅ User B created: {user_b_id}")
        else:
            print(f"   ❌ User B creation failed: {response.text}")
            return
            
        # Test 1: Create fresh report
        print("\n2. Testing fresh report creation...")
        report_data = {
            "target_type": "user",
            "target_id": user_b_id,
            "reason": "Testing fresh reports system"
        }
        
        response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=user_a_headers)
        print(f"   Create report status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            report = result.get('report', {})
            print(f"   ✅ Fresh report created successfully. ID: {report.get('id')}")
            
            # Test 2: Duplicate report should fail
            print("\n3. Testing duplicate report rejection...")
            response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=user_a_headers)
            print(f"   Duplicate report status: {response.status_code}")
            
            if response.status_code == 409:
                print("   ✅ Duplicate report correctly rejected (409)")
            else:
                print(f"   ❌ Expected 409 for duplicate report, got {response.status_code}")
                
        else:
            print(f"   ❌ Fresh report creation failed: {response.text}")
            
        print("\n=== Fresh Reports System Test Complete ===")
        
    except Exception as e:
        print(f"❌ Fresh reports test error: {str(e)}")

if __name__ == "__main__":
    test_fresh_reports_system()