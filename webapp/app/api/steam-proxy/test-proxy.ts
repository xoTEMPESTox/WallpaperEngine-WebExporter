// Simple test script to verify the Steam proxy function works
// This is for manual testing purposes only

async function testProxy() {
  try {
    // Test with a known Steam URL (this is a placeholder, you'll need a real URL)
    const testUrl = 'https://steamcommunity.com/sharedfiles/filedetails/?id=123456789';
    const proxyUrl = `/api/steam-proxy?url=${encodeURIComponent(testUrl)}`;
    
    console.log('Testing proxy with URL:', proxyUrl);
    
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      console.log('Proxy test successful!');
      console.log('Status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));
    } else {
      console.error('Proxy test failed with status:', response.status);
      console.error('Response:', await response.text());
    }
  } catch (error) {
    console.error('Proxy test error:', error);
  }
}

// Run the test
testProxy();