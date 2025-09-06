// JSONBin Configuration
// To set up JSONBin:
// 1. Go to https://jsonbin.io
// 2. Create a free account
// 3. Create a new bin with this initial structure:
/*
{
  "innovations": []
}
*/
// 4. Get your API key from the dashboard
// 5. Replace the values below with your actual API key and bin ID

const JSONBIN_CONFIG = {
    API_KEY: '$2a$10$YOUR_API_KEY_HERE', // Replace with your JSONBin API key
    BIN_ID: 'YOUR_BIN_ID_HERE', // Replace with your bin ID
    BASE_URL: 'https://api.jsonbin.io/v3'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONBIN_CONFIG;
}