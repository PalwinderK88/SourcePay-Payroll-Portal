// Quick test to verify Chatbot component exists and is properly configured
const fs = require('fs');
const path = require('path');

console.log('🔍 CHATBOT COMPONENT DIAGNOSTIC TEST\n');
console.log('=====================================\n');

// Test 1: Check if Chatbot.js exists
const chatbotPath = path.join(__dirname, 'Frontend', 'Components', 'Chatbot.js');
console.log('Test 1: Checking if Chatbot.js exists...');
if (fs.existsSync(chatbotPath)) {
    console.log('✅ PASS: Chatbot.js found at Frontend/Components/Chatbot.js\n');
} else {
    console.log('❌ FAIL: Chatbot.js NOT found!\n');
    process.exit(1);
}

// Test 2: Check if _app.js exists
const appPath = path.join(__dirname, 'Frontend', 'Pages', '_app.js');
console.log('Test 2: Checking if _app.js exists...');
if (fs.existsSync(appPath)) {
    console.log('✅ PASS: _app.js found at Frontend/Pages/_app.js\n');
} else {
    console.log('❌ FAIL: _app.js NOT found!\n');
    process.exit(1);
}

// Test 3: Check if Chatbot is imported in _app.js
console.log('Test 3: Checking if Chatbot is imported in _app.js...');
const appContent = fs.readFileSync(appPath, 'utf8');
if (appContent.includes("import Chatbot from '../Components/Chatbot'")) {
    console.log('✅ PASS: Chatbot is imported in _app.js\n');
} else {
    console.log('❌ FAIL: Chatbot import NOT found in _app.js!\n');
    process.exit(1);
}

// Test 4: Check if Chatbot component is rendered in _app.js
console.log('Test 4: Checking if Chatbot is rendered in _app.js...');
if (appContent.includes('<Chatbot />')) {
    console.log('✅ PASS: <Chatbot /> component is rendered in _app.js\n');
} else {
    console.log('❌ FAIL: <Chatbot /> NOT found in JSX!\n');
    process.exit(1);
}

// Test 5: Check Chatbot.js content
console.log('Test 5: Checking Chatbot.js implementation...');
const chatbotContent = fs.readFileSync(chatbotPath, 'utf8');

const checks = [
    { name: 'useState hook', pattern: 'useState' },
    { name: 'useEffect hook', pattern: 'useEffect' },
    { name: 'isLoggedIn check', pattern: 'isLoggedIn' },
    { name: 'Chat button styles', pattern: 'chatButton' },
    { name: 'Fixed positioning', pattern: "position: 'fixed'" },
    { name: 'High z-index', pattern: 'zIndex: 99999' },
    { name: 'Display flex', pattern: "display: 'flex" },
    { name: 'Visibility visible', pattern: "visibility: 'visible'" },
];

let allPassed = true;
checks.forEach(check => {
    if (chatbotContent.includes(check.pattern)) {
        console.log(`  ✅ ${check.name}: Found`);
    } else {
        console.log(`  ❌ ${check.name}: NOT FOUND`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\n✅ PASS: All Chatbot.js checks passed\n');
} else {
    console.log('\n❌ FAIL: Some Chatbot.js checks failed\n');
    process.exit(1);
}

// Test 6: Check if FAQ routes exist
console.log('Test 6: Checking backend FAQ routes...');
const faqRoutesPath = path.join(__dirname, 'Backend', 'Routes', 'faq.js');
if (fs.existsSync(faqRoutesPath)) {
    console.log('✅ PASS: FAQ routes found at Backend/Routes/faq.js\n');
} else {
    console.log('⚠️  WARNING: FAQ routes NOT found (chatbot may not work fully)\n');
}

// Test 7: Check if chatbot service exists
console.log('Test 7: Checking chatbot service...');
const chatbotServicePath = path.join(__dirname, 'Backend', 'services', 'chatbotService.js');
if (fs.existsSync(chatbotServicePath)) {
    console.log('✅ PASS: Chatbot service found at Backend/services/chatbotService.js\n');
} else {
    console.log('⚠️  WARNING: Chatbot service NOT found (chatbot may not work fully)\n');
}

console.log('=====================================');
console.log('✅ ALL CRITICAL TESTS PASSED!\n');
console.log('The chatbot component is properly configured.');
console.log('\nIf you still cannot see the chatbot, the issue is likely:');
console.log('1. Servers not running (Backend on port 5000, Frontend on port 3000)');
console.log('2. Browser cache (try incognito/private mode)');
console.log('3. Not logged in (chatbot only shows for logged-in users)');
console.log('\nRun DIAGNOSE_AND_FIX_CHATBOT.bat to fix these issues.');
console.log('=====================================\n');
