// QuickLoan API Debug Script
// Run this in your browser's Developer Console (F12) when the app is loaded

console.log('🔍 Starting QuickLoan API Debug...');

// Step 1: Test Backend Health
console.log('1️⃣ Testing Backend Health...');
fetch('http://localhost:3001/health')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ Backend Health OK:', data);
  })
  .catch(error => {
    console.error('❌ Backend Health FAILED:', error.message);
    console.log('💡 Possible issues:');
    console.log('   - Backend server not running');
    console.log('   - Wrong URL (check if using Replit URL instead of localhost)');
    console.log('   - Firewall blocking port 3001');
  });

// Step 2: Check Token Storage
console.log('2️⃣ Checking Token Storage...');
const token = localStorage.getItem('@access_token');
if (token) {
  console.log('✅ Token found in localStorage');
  console.log('📏 Token length:', token.length, 'characters');

  // Step 3: Test Authenticated API Call
  console.log('3️⃣ Testing Authenticated API Call (Metrics)...');
  fetch('http://localhost:3001/api/admin/metrics', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📡 Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ Metrics API OK:', data);
  })
  .catch(error => {
    console.error('❌ Metrics API FAILED:', error.message);
    console.log('💡 Possible issues:');
    console.log('   - User does not have admin role');
    console.log('   - Token expired or invalid');
    console.log('   - Database connection issues');
    console.log('   - RLS policies blocking access');
  });

} else {
  console.error('❌ No token found in localStorage');
  console.log('💡 Possible issues:');
  console.log('   - User not logged in');
  console.log('   - Token storage failed');
  console.log('   - Using wrong storage key');
}

// Step 4: Test Basic API Info
console.log('4️⃣ Testing API Info Endpoint...');
fetch('http://localhost:3001/api')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Info OK:', data);
  })
  .catch(error => {
    console.error('❌ API Info FAILED:', error.message);
  });

console.log('🔍 Debug complete! Check the results above.');
