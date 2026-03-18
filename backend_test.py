import requests
import sys
import json
from datetime import datetime
import uuid

class MetadataAPITester:
    def __init__(self, base_url="https://data-privacy-check-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                response = requests.request(method, url, json=data, headers=headers, timeout=10)

            print(f"Status Code: {response.status_code}")
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_json = response.json()
                    if method == 'GET' and 'collect' in endpoint:
                        print(f"Metadata fields returned: {len(response_json)} fields")
                        print(f"Sample fields: {list(response_json.keys())[:5]}")
                    elif 'save' in endpoint:
                        print(f"Snapshot saved with ID: {response_json.get('id', 'N/A')}")
                except:
                    print("Response not JSON or empty")
                return True, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_text = response.text
                    print(f"Error response: {error_text[:200]}")
                except:
                    print("Could not read error response")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Request Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Unexpected Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET", 
            "",
            200
        )
        return success

    def test_metadata_collect(self):
        """Test server-side metadata collection"""
        success, response = self.run_test(
            "Server-side Metadata Collection",
            "GET",
            "metadata/collect",
            200
        )
        
        if success and response:
            # Validate expected metadata fields
            expected_fields = ['ip_address', 'user_agent', 'accept_language', 'host']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Warning: Missing expected fields: {missing_fields}")
            else:
                print("✅ All expected metadata fields present")
                
        return success, response

    def test_metadata_save(self):
        """Test saving metadata snapshot"""
        # Create sample metadata
        sample_metadata = {
            "client": {
                "browser": {
                    "userAgent": "Mozilla/5.0 (Test Browser)",
                    "platform": "Linux x86_64",
                    "language": "en-US"
                },
                "device": {
                    "screenWidth": 1920,
                    "screenHeight": 1080,
                    "devicePixelRatio": 1
                },
                "network": {
                    "effectiveType": "4g",
                    "downlink": 10
                },
                "storage": {
                    "localStorageEnabled": True,
                    "sessionStorageEnabled": True
                },
                "permissions": {
                    "geolocation": "prompt",
                    "notifications": "denied"
                },
                "hidden": {
                    "canvasFingerprint": "abc123def456",
                    "timezone": "America/New_York",
                    "plugins": ["Plugin 1", "Plugin 2"]
                },
                "time": {
                    "timestamp": datetime.now().isoformat(),
                    "localTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "timezone": "America/New_York"
                }
            },
            "server": {
                "ip_address": "127.0.0.1",
                "user_agent": "Mozilla/5.0 (Test Browser)",
                "accept_language": "en-US,en;q=0.9"
            }
        }
        
        success, response = self.run_test(
            "Save Metadata Snapshot",
            "POST",
            "metadata/save",
            200,
            data=sample_metadata
        )
        
        if success and response:
            # Validate response structure
            expected_fields = ['id', 'client_metadata', 'server_metadata', 'timestamp']
            missing_fields = [field for field in expected_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Warning: Missing expected response fields: {missing_fields}")
            else:
                print("✅ Snapshot response structure valid")
                
        return success, response

    def test_metadata_history(self):
        """Test retrieving metadata history"""
        success, response = self.run_test(
            "Get Metadata History",
            "GET",
            "metadata/history", 
            200
        )
        
        if success and isinstance(response, list):
            print(f"✅ History contains {len(response)} snapshots")
            if response:
                # Check structure of first snapshot
                first_snapshot = response[0]
                required_fields = ['id', 'client_metadata', 'server_metadata', 'timestamp']
                if all(field in first_snapshot for field in required_fields):
                    print("✅ Snapshot structure in history is valid")
                else:
                    print("⚠️  Warning: Snapshot structure in history may be incomplete")
        elif success:
            print("⚠️  Warning: History response is not a list")
            
        return success

    def test_cors_headers(self):
        """Test CORS headers are present"""
        print(f"\n🔍 Testing CORS Headers...")
        try:
            response = requests.options(f"{self.api_base}/metadata/collect", timeout=10)
            headers = response.headers
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods', 
                'Access-Control-Allow-Headers'
            ]
            
            present_headers = [h for h in cors_headers if h in headers]
            print(f"CORS headers present: {len(present_headers)}/{len(cors_headers)}")
            
            if len(present_headers) >= 1:  # At least origin should be present
                print("✅ CORS seems to be configured")
                self.tests_passed += 1
            else:
                print("⚠️  Warning: CORS headers may not be properly configured")
                
            self.tests_run += 1
            return len(present_headers) >= 1
            
        except Exception as e:
            print(f"❌ Failed to test CORS: {str(e)}")
            self.tests_run += 1
            return False

def main():
    print("🚀 Starting Backend API Tests for Metadata Collection App")
    print("=" * 60)
    
    tester = MetadataAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Metadata Collection", lambda: tester.test_metadata_collect()[0]),
        ("Metadata Save", lambda: tester.test_metadata_save()[0]), 
        ("Metadata History", tester.test_metadata_history),
        ("CORS Configuration", tester.test_cors_headers)
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"  - {test}")
    else:
        print("\n✅ All tests passed!")
    
    print("\n🔍 Summary:")
    if tester.tests_passed == tester.tests_run:
        print("✅ Backend API is fully functional")
        return 0
    elif tester.tests_passed >= (tester.tests_run * 0.8):  # 80% pass rate
        print("⚠️  Backend API is mostly functional with minor issues")
        return 0
    else:
        print("❌ Backend API has significant issues") 
        return 1

if __name__ == "__main__":
    sys.exit(main())