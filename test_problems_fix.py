import requests
import json

# Test the specific problems endpoint functionality that was failing
BASE_URL = "https://medical-match-1.preview.emergentagent.com/api"

def test_problems_endpoint():
    print("=== Testing Problems Endpoint After Fix ===\n")
    
    # Test getting problems list
    response = requests.get(f"{BASE_URL}/problems")
    print(f"Problems list status: {response.status_code}")
    
    if response.status_code == 200:
        problems_result = response.json()
        problems = problems_result.get('problems', [])
        print(f"✅ Found {len(problems)} problems")
        
        # Look for test problem with interest count = 1
        for problem in problems:
            if problem.get('title') == 'Test Problem':
                print(f"✅ Test Problem found:")
                print(f"   - ID: {problem['id']}")
                print(f"   - Interest count: {problem['interest_count']}")
                print(f"   - Interested users: {len(problem.get('interested_users', []))}")
                
                if problem['interest_count'] == 1:
                    print("✅ Interest count is correct (1)")
                else:
                    print(f"❌ Expected interest count 1, got {problem['interest_count']}")
                    
                # Check interested users details
                if problem.get('interested_users'):
                    user = problem['interested_users'][0]
                    if 'user' in user and user['user'].get('name') == 'Bob Test':
                        print("✅ Bob Test found in interested users")
                    else:
                        print(f"❌ Expected Bob Test, got: {user}")
                break
        else:
            print("❌ Test Problem not found in list")
    else:
        print(f"❌ Problems list failed: {response.text}")

if __name__ == "__main__":
    test_problems_endpoint()