import requests
import json
import uuid
from datetime import datetime

# Base URL from environment
BASE_URL = "https://community-seeded.preview.emergentagent.com/api"

def test_enhanced_messaging_and_problems():
    print("=== Testing Enhanced 1CoFounder.com Messaging and Problems Features ===\n")
    
    # Store user data for testing
    users = {}
    
    try:
        # 1. Create User A (Alice)
        print("1. Creating User A (Alice)...")
        alice_data = {
            "name": "Alice Test",
            "email": "alice_msg@test.com",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=alice_data)
        print(f"Signup response status: {response.status_code}")
        if response.status_code == 201:
            alice_result = response.json()
            users['alice'] = {
                'token': alice_result['token'],
                'user': alice_result['user'],
                'headers': {'Authorization': f"Bearer {alice_result['token']}"}
            }
            print(f"✅ Alice created successfully with ID: {alice_result['user']['id']}")
        else:
            print(f"❌ Alice signup failed: {response.text}")
            return
        
        # Update Alice's profile
        print("   Updating Alice's profile...")
        alice_profile = {
            "role": "Doctor",
            "city": "NYC", 
            "country": "US",
            "bio": "Test doctor",
            "skills": ["Cardiology"],
            "interests": ["AI Healthcare"],
            "startup_stage": "Idea",
            "commitment_level": "Full Time",
            "looking_for": ["AI Engineer"]
        }
        
        response = requests.put(f"{BASE_URL}/users/profile", json=alice_profile, headers=users['alice']['headers'])
        print(f"Profile update status: {response.status_code}")
        if response.status_code == 200:
            users['alice']['user'] = response.json()['user']
            print(f"✅ Alice's profile updated successfully")
        else:
            print(f"❌ Alice profile update failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error creating Alice: {str(e)}")
        return

    try:
        # 2. Create User B (Bob)
        print("\n2. Creating User B (Bob)...")
        bob_data = {
            "name": "Bob Test",
            "email": "bob_msg@test.com", 
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=bob_data)
        print(f"Signup response status: {response.status_code}")
        if response.status_code == 201:
            bob_result = response.json()
            users['bob'] = {
                'token': bob_result['token'],
                'user': bob_result['user'],
                'headers': {'Authorization': f"Bearer {bob_result['token']}"}
            }
            print(f"✅ Bob created successfully with ID: {bob_result['user']['id']}")
        else:
            print(f"❌ Bob signup failed: {response.text}")
            return
            
        # Update Bob's profile
        print("   Updating Bob's profile...")
        bob_profile = {
            "role": "Engineer",
            "city": "SF",
            "country": "US", 
            "bio": "Test engineer",
            "skills": ["AI Engineering"],
            "interests": ["AI Healthcare"],
            "startup_stage": "Idea",
            "commitment_level": "Full Time",
            "looking_for": ["Clinician"]
        }
        
        response = requests.put(f"{BASE_URL}/users/profile", json=bob_profile, headers=users['bob']['headers'])
        print(f"Profile update status: {response.status_code}")
        if response.status_code == 200:
            users['bob']['user'] = response.json()['user']
            print(f"✅ Bob's profile updated successfully")
        else:
            print(f"❌ Bob profile update failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error creating Bob: {str(e)}")
        return

    try:
        # 3. Create mutual match
        print("\n3. Creating mutual match...")
        
        # Alice swipes like on Bob
        print("   Alice swipes like on Bob...")
        alice_swipe = {
            "target_id": users['bob']['user']['id'],
            "action": "like"
        }
        
        response = requests.post(f"{BASE_URL}/swipes", json=alice_swipe, headers=users['alice']['headers'])
        print(f"Alice swipe status: {response.status_code}")
        if response.status_code == 200:
            swipe_result = response.json()
            print(f"✅ Alice swiped on Bob. Match: {swipe_result.get('match', False)}")
        else:
            print(f"❌ Alice swipe failed: {response.text}")
            return
            
        # Bob swipes like on Alice  
        print("   Bob swipes like on Alice...")
        bob_swipe = {
            "target_id": users['alice']['user']['id'],
            "action": "like"
        }
        
        response = requests.post(f"{BASE_URL}/swipes", json=bob_swipe, headers=users['bob']['headers'])
        print(f"Bob swipe status: {response.status_code}")
        if response.status_code == 200:
            swipe_result = response.json()
            match_created = swipe_result.get('match', False)
            print(f"✅ Bob swiped on Alice. Match created: {match_created}")
            if match_created and swipe_result.get('match_data'):
                match_id = swipe_result['match_data']['match']['id']
                users['match_id'] = match_id
                print(f"✅ Match ID: {match_id}")
            else:
                print("❌ Match not created properly")
                return
        else:
            print(f"❌ Bob swipe failed: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Error creating match: {str(e)}")
        return

    try:
        # 4. Test Conversations endpoint
        print("\n4. Testing Conversations endpoint...")
        
        response = requests.get(f"{BASE_URL}/conversations", headers=users['alice']['headers'])
        print(f"Conversations status: {response.status_code}")
        if response.status_code == 200:
            conversations_result = response.json()
            conversations = conversations_result.get('conversations', [])
            print(f"✅ Found {len(conversations)} conversations")
            
            if len(conversations) == 1:
                conversation = conversations[0]
                print(f"✅ Conversation with Bob found. Match ID: {conversation['match_id']}")
                print(f"✅ Unread count: {conversation['unread_count']} (should be 0 - no messages yet)")
                print(f"✅ Matched user: {conversation['matched_user']['name']}")
                users['match_id'] = conversation['match_id']  # Store for messaging
            else:
                print(f"❌ Expected 1 conversation, got {len(conversations)}")
        else:
            print(f"❌ Conversations fetch failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing conversations: {str(e)}")

    try:
        # 5. Send messages
        print("\n5. Testing messaging...")
        
        # Alice sends message to Bob
        print("   Alice sends message...")
        alice_message = {
            "conversation_id": users['match_id'],
            "message": "Hi Bob!"
        }
        
        response = requests.post(f"{BASE_URL}/messages", json=alice_message, headers=users['alice']['headers'])
        print(f"Alice message status: {response.status_code}")
        if response.status_code == 201:
            message_result = response.json()
            print(f"✅ Alice's message sent. ID: {message_result['message']['id']}")
            print(f"✅ Message has read_by array: {message_result['message']['read_by']}")
        else:
            print(f"❌ Alice message failed: {response.text}")
            
        # Bob sends message to Alice
        print("   Bob sends message...")
        bob_message = {
            "conversation_id": users['match_id'],
            "message": "Hi Alice!"
        }
        
        response = requests.post(f"{BASE_URL}/messages", json=bob_message, headers=users['bob']['headers'])
        print(f"Bob message status: {response.status_code}")
        if response.status_code == 201:
            message_result = response.json()
            print(f"✅ Bob's message sent. ID: {message_result['message']['id']}")
            print(f"✅ Message has read_by array: {message_result['message']['read_by']}")
        else:
            print(f"❌ Bob message failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing messaging: {str(e)}")

    try:
        # 6. Test unread counts
        print("\n6. Testing unread counts...")
        
        response = requests.get(f"{BASE_URL}/conversations", headers=users['alice']['headers'])
        print(f"Conversations status: {response.status_code}")
        if response.status_code == 200:
            conversations_result = response.json()
            conversations = conversations_result.get('conversations', [])
            
            if len(conversations) >= 1:
                conversation = conversations[0]
                unread_count = conversation['unread_count']
                print(f"✅ Unread count: {unread_count} (should be 1 - Bob's message not read by Alice)")
                
                if unread_count == 1:
                    print("✅ Unread count is correct")
                else:
                    print(f"❌ Expected unread count 1, got {unread_count}")
            else:
                print(f"❌ No conversations found")
        else:
            print(f"❌ Conversations fetch failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing unread counts: {str(e)}")

    try:
        # 7. Mark messages as read
        print("\n7. Testing mark as read...")
        
        response = requests.get(f"{BASE_URL}/messages/{users['match_id']}/read", headers=users['alice']['headers'])
        print(f"Mark as read status: {response.status_code}")
        if response.status_code == 200:
            read_result = response.json()
            print(f"✅ Mark as read success: {read_result.get('success', False)}")
        else:
            print(f"❌ Mark as read failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing mark as read: {str(e)}")

    try:
        # 8. Verify unread cleared
        print("\n8. Verifying unread cleared...")
        
        response = requests.get(f"{BASE_URL}/conversations", headers=users['alice']['headers'])
        print(f"Conversations status: {response.status_code}")
        if response.status_code == 200:
            conversations_result = response.json()
            conversations = conversations_result.get('conversations', [])
            
            if len(conversations) >= 1:
                conversation = conversations[0]
                unread_count = conversation['unread_count']
                print(f"✅ Unread count after mark as read: {unread_count} (should be 0)")
                
                if unread_count == 0:
                    print("✅ Unread count cleared successfully")
                else:
                    print(f"❌ Expected unread count 0, got {unread_count}")
            else:
                print(f"❌ No conversations found")
        else:
            print(f"❌ Conversations fetch failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error verifying unread cleared: {str(e)}")

    try:
        # 9. Test match-only messaging
        print("\n9. Testing match-only messaging...")
        
        # Create User C (not matched with Alice)
        print("   Creating User C...")
        user_c_data = {
            "name": "Charlie Test",
            "email": "charlie_msg@test.com",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=user_c_data)
        if response.status_code == 201:
            charlie_result = response.json()
            charlie_headers = {'Authorization': f"Bearer {charlie_result['token']}"}
            print(f"✅ Charlie created successfully")
            
            # Try to send message with fake conversation_id
            print("   Alice tries to send message to fake conversation...")
            fake_message = {
                "conversation_id": str(uuid.uuid4()),  # Fake conversation ID
                "message": "This should fail"
            }
            
            response = requests.post(f"{BASE_URL}/messages", json=fake_message, headers=users['alice']['headers'])
            print(f"Fake message status: {response.status_code}")
            if response.status_code == 403:
                error_result = response.json()
                error_message = error_result.get('error', '')
                print(f"✅ Correctly blocked non-matched messaging. Error: {error_message}")
                
                if "only message matched users" in error_message:
                    print("✅ Correct error message returned")
                else:
                    print(f"❌ Unexpected error message: {error_message}")
            else:
                print(f"❌ Expected 403 error, got {response.status_code}: {response.text}")
        else:
            print(f"❌ Charlie creation failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing match-only messaging: {str(e)}")

    try:
        # 10. Test Problems creation
        print("\n10. Testing Problems creation...")
        
        # Alice creates a problem
        print("   Alice creates a problem...")
        problem_data = {
            "title": "Test Problem",
            "description": "Test desc", 
            "clinical_context": "ER setting",
            "skills_required": ["AI Engineer", "Clinician"]
        }
        
        response = requests.post(f"{BASE_URL}/problems", json=problem_data, headers=users['alice']['headers'])
        print(f"Problem creation status: {response.status_code}")
        if response.status_code == 201:
            problem_result = response.json()
            problem_id = problem_result['problem']['id']
            users['problem_id'] = problem_id
            print(f"✅ Problem created successfully with ID: {problem_id}")
        else:
            print(f"❌ Problem creation failed: {response.text}")
            return
            
        # Verify problem appears in list
        print("   Verifying problem in list...")
        response = requests.get(f"{BASE_URL}/problems", headers=users['alice']['headers'])
        print(f"Problems list status: {response.status_code}")
        if response.status_code == 200:
            problems_result = response.json()
            problems = problems_result.get('problems', [])
            
            created_problem = None
            for problem in problems:
                if problem['id'] == problem_id:
                    created_problem = problem
                    break
                    
            if created_problem:
                print(f"✅ Problem found in list. Interest count: {created_problem['interest_count']} (should be 0)")
                if created_problem['interest_count'] == 0:
                    print("✅ Correct initial interest count")
                else:
                    print(f"❌ Expected interest count 0, got {created_problem['interest_count']}")
            else:
                print(f"❌ Created problem not found in list")
        else:
            print(f"❌ Problems list fetch failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing problems creation: {str(e)}")

    try:
        # 11. Test Join Problem
        print("\n11. Testing Join Problem...")
        
        # Bob joins the problem
        print("   Bob joins Alice's problem...")
        response = requests.post(f"{BASE_URL}/problems/{users['problem_id']}/join", headers=users['bob']['headers'])
        print(f"Join problem status: {response.status_code}")
        if response.status_code == 201:
            join_result = response.json()
            print(f"✅ Bob joined problem successfully. Interest ID: {join_result['interest']['id']}")
        else:
            print(f"❌ Bob join failed: {response.text}")
            
        # Verify interest count updated
        print("   Verifying interest count updated...")
        response = requests.get(f"{BASE_URL}/problems", headers=users['alice']['headers'])
        if response.status_code == 200:
            problems_result = response.json()
            problems = problems_result.get('problems', [])
            
            updated_problem = None
            for problem in problems:
                if problem['id'] == users['problem_id']:
                    updated_problem = problem
                    break
                    
            if updated_problem:
                interest_count = updated_problem['interest_count']
                print(f"✅ Interest count after join: {interest_count} (should be 1)")
                if interest_count == 1:
                    print("✅ Interest count updated correctly")
                else:
                    print(f"❌ Expected interest count 1, got {interest_count}")
            else:
                print(f"❌ Problem not found in updated list")
        else:
            print(f"❌ Problems list fetch failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing join problem: {str(e)}")

    try:
        # 12. Test Contact Creator
        print("\n12. Testing Contact Creator...")
        
        # Create User D
        print("   Creating User D...")
        user_d_data = {
            "name": "David Test",
            "email": "david_msg@test.com",
            "password": "password123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/signup", json=user_d_data)
        if response.status_code == 201:
            david_result = response.json()
            david_headers = {'Authorization': f"Bearer {david_result['token']}"}
            users['david'] = {
                'token': david_result['token'],
                'user': david_result['user'],
                'headers': david_headers
            }
            print(f"✅ David created successfully")
            
            # Update David's profile
            david_profile = {
                "role": "Researcher",
                "city": "Boston",
                "country": "US",
                "bio": "Test researcher", 
                "skills": ["Research"],
                "interests": ["AI Healthcare"],
                "startup_stage": "Idea",
                "commitment_level": "Part Time",
                "looking_for": ["Clinician"]
            }
            
            requests.put(f"{BASE_URL}/users/profile", json=david_profile, headers=david_headers)
            print("   David's profile updated")
            
            # David contacts problem creator (Alice)
            print("   David contacts problem creator...")
            response = requests.post(f"{BASE_URL}/problems/{users['problem_id']}/contact", headers=david_headers)
            print(f"Contact creator status: {response.status_code}")
            if response.status_code == 200:
                contact_result = response.json()
                interest_sent = contact_result.get('interest_sent', False)
                print(f"✅ Contact creator response. Interest sent: {interest_sent}")
                
                if interest_sent:
                    print("✅ Connection request sent successfully (not yet matched)")
                else:
                    # Check if already matched
                    already_matched = contact_result.get('already_matched', False) or contact_result.get('matched', False)
                    if already_matched:
                        print("✅ Already matched or instant match created")
                    else:
                        print(f"❌ Unexpected response: {contact_result}")
            else:
                print(f"❌ Contact creator failed: {response.text}")
        else:
            print(f"❌ David creation failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing contact creator: {str(e)}")

    print("\n=== Enhanced Messaging and Problems Features Test Complete ===")

if __name__ == "__main__":
    test_enhanced_messaging_and_problems()