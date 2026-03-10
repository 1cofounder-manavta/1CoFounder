import requests
import json

# Test the profile update functionality with city and country fields
BASE_URL = "https://health-cofound.preview.emergentagent.com/api"

def test_profile_update():
    print("=== Testing Profile Update with City and Country Fields ===\n")
    
    try:
        # Create a test user
        print("1. Creating test user...")
        user_data = {
            "name": "Profile Test User",
            "email": "profile_test@test.com",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=user_data)
        print(f"Signup status: {response.status_code}")
        if response.status_code == 201:
            result = response.json()
            headers = {'Authorization': f"Bearer {result['token']}"}
            print(f"✅ User created with ID: {result['user']['id']}")
        else:
            print(f"❌ Signup failed: {response.text}")
            return
        
        # Test profile update with new city and country fields
        print("\n2. Testing profile update with city and country...")
        profile_data = {
            "name": "Updated Profile Test User",
            "role": "Doctor",
            "city": "San Francisco",
            "country": "United States", 
            "bio": "Updated test bio",
            "skills": ["Emergency Medicine", "Telemedicine"],
            "interests": ["AI Healthcare", "Remote Monitoring"],
            "startup_stage": "MVP",
            "commitment_level": "Full Time",
            "looking_for": ["AI Engineer", "Business Operator"]
        }
        
        response = requests.put(f"{BASE_URL}/users/profile", json=profile_data, headers=headers)
        print(f"Profile update status: {response.status_code}")
        
        if response.status_code == 200:
            updated_user = response.json()['user']
            print("✅ Profile updated successfully")
            
            # Verify city and country fields were saved
            if updated_user.get('city') == 'San Francisco':
                print("✅ City field saved correctly")
            else:
                print(f"❌ City field error. Expected: San Francisco, Got: {updated_user.get('city')}")
                
            if updated_user.get('country') == 'United States':
                print("✅ Country field saved correctly")
            else:
                print(f"❌ Country field error. Expected: United States, Got: {updated_user.get('country')}")
                
            if updated_user.get('profile_complete') == True:
                print("✅ Profile marked as complete")
            else:
                print(f"❌ Profile complete flag error. Got: {updated_user.get('profile_complete')}")
                
            # Verify all other fields
            expected_fields = ['name', 'role', 'bio', 'skills', 'interests', 'startup_stage', 'commitment_level', 'looking_for']
            all_correct = True
            for field in expected_fields:
                if updated_user.get(field) == profile_data[field]:
                    print(f"✅ {field} field correct")
                else:
                    print(f"❌ {field} field error. Expected: {profile_data[field]}, Got: {updated_user.get(field)}")
                    all_correct = False
                    
            if all_correct:
                print("✅ All profile fields updated correctly")
            else:
                print("❌ Some profile fields not updated correctly")
                
        else:
            print(f"❌ Profile update failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing profile update: {str(e)}")

if __name__ == "__main__":
    test_profile_update()