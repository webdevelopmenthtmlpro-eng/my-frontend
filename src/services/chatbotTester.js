import { detectIntent, generateResponse } from "./chatbotNLU";

export const testSamples = [
  { input: "show me the gallery", expectedIntent: "navigate_gallery" },
  { input: "take me to services", expectedIntent: "navigate_services" },
  { input: "where can I track my package", expectedIntent: "navigate_track" },
  { input: "contact information", expectedIntent: "navigate_contact" },
  { input: "FAQ", expectedIntent: "navigate_faq" },
  { input: "how do I book a shipment", expectedIntent: "navigate_booking" },
  { input: "I want to login", expectedIntent: "navigate_login" },
  { input: "create new account", expectedIntent: "navigate_register" },
  { input: "what are your prices", expectedIntent: "about_services" },
  { input: "show me home", expectedIntent: "navigate_home" },
  { input: "hello", expectedIntent: "general_chat" },
];

export const runChatbotTests = () => {
  console.log("🤖 Running Chatbot NLU Tests...\n");
  
  let passed = 0;
  let failed = 0;
  
  testSamples.forEach((test, index) => {
    const result = detectIntent(test.input);
    const isMatch = result.intent === test.expectedIntent;
    
    const status = isMatch ? "✅ PASS" : "❌ FAIL";
    const confidence = (result.confidence * 100).toFixed(0);
    
    console.log(`${index + 1}. ${status}`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Expected: ${test.expectedIntent}`);
    console.log(`   Got: ${result.intent} (${confidence}% confidence)`);
    
    if (result.section || result.route) {
      console.log(
        `   Navigation: Section="${result.section}" | Route="${result.route}"`
      );
    }
    
    const response = generateResponse(result.intent);
    console.log(`   Response: "${response}"`);
    console.log("");
    
    if (isMatch) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testSamples.length}`);
  console.log(`Success Rate: ${((passed / testSamples.length) * 100).toFixed(1)}%\n`);
  
  return {
    passed,
    failed,
    total: testSamples.length,
    successRate: (passed / testSamples.length) * 100,
  };
};

export const testSpecificInput = (userInput) => {
  console.log(`\n🧪 Testing Input: "${userInput}"`);
  const result = detectIntent(userInput);
  const response = generateResponse(result.intent);
  
  console.log("Result:");
  console.log(`  Intent: ${result.intent}`);
  console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`  Section: ${result.section || "N/A"}`);
  console.log(`  Route: ${result.route || "N/A"}`);
  console.log(`  Response: ${response}`);
  console.log("");
  
  return result;
};

if (typeof window !== "undefined" && window.__CHATBOT_DEBUG__) {
  console.log("🤖 Chatbot Debug Mode Enabled");
  window.chatbotTest = runChatbotTests;
  window.testInput = testSpecificInput;
  console.log("Available commands:");
  console.log("  window.chatbotTest() - Run all tests");
  console.log("  window.testInput('your message') - Test specific input");
}
