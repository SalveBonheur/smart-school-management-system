/**
 * API Configuration - Auto-detects server port
 * Smart School Transport System
 */

// Try multiple ports in order of preference
const API_PORTS = [3006, 3001, 3002, 3003, 3004, 3005, 3007, 3008, 3009, 3010];

// Get the working API base URL
async function getApiBaseUrl() {
    // Check if we have a stored working port
    const storedPort = localStorage.getItem('apiPort');
    if (storedPort) {
        return `http://localhost:${storedPort}/api`;
    }
    
    // Try to find a working port
    for (const port of API_PORTS) {
        try {
            const response = await fetch(`http://localhost:${port}/api/auth/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            if (response.ok) {
                localStorage.setItem('apiPort', port);
                return `http://localhost:${port}/api`;
            }
        } catch (e) {
            // Port not available, try next
        }
    }
    
    // Default fallback
    return 'http://localhost:3006/api';
}

// Current API base URL (will be updated after detection)
let API_BASE_URL = 'http://localhost:3006/api';

// Initialize API config
async function initApiConfig() {
    API_BASE_URL = await getApiBaseUrl();
    console.log('API Base URL:', API_BASE_URL);
}

// Initialize on load
initApiConfig();

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;
window.getApiBaseUrl = getApiBaseUrl;
window.initApiConfig = initApiConfig;
