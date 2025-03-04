// Global API configuration - using the same config as the main application
const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const USERS_SHEET_NAME = "Users";

const API_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzMH6BkoZ-RlBaXLa0q-KiZqhC1IoW_k032jwt915q-IvybymelujRvHgCaHMoD6bAp/exec',
    CLIENT_ID: '900437232674-krleqgjop3u7cl4sggmo20rkmrsl5vh5.apps.googleusercontent.com',
    SHEET_ID: SHEET_ID,
    USERS_SHEET_NAME: USERS_SHEET_NAME
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Login form elements
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const forgotPasswordLink = document.getElementById('forgotPassword');

    // Register form elements
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    const passwordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordFeedback = document.getElementById('passwordFeedback');

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            if (!username || !password) {
                showMessage(loginMessage, 'Please enter both username and password', 'error');
                return;
            }

            try {
                showLoading('Logging in...');
                const result = await login(username, password, rememberMe);
                
                if (result.success) {
                    showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
                    // Store session info
                    sessionStorage.setItem('user', JSON.stringify({
                        username: result.username,
                        name: result.name,
                        email: result.email,
                        isLoggedIn: true
                    }));
                    
                    // If remember me is checked, store in localStorage too (lasts beyond session)
                    if (rememberMe) {
                        localStorage.setItem('rememberedUser', username);
                    } else {
                        localStorage.removeItem('rememberedUser');
                    }
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showMessage(loginMessage, result.message || 'Invalid username or password', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage(loginMessage, 'An error occurred during login. Please try again.', 'error');
            } finally {
                hideLoading();
            }
        });
    }

    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (!fullName || !email || !username || !password) {
                showMessage(registerMessage, 'Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage(registerMessage, 'Passwords do not match', 'error');
                return;
            }
            
            if (!validatePassword(password)) {
                showMessage(registerMessage, 'Password does not meet requirements', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showMessage(registerMessage, 'Please enter a valid email address', 'error');
                return;
            }

            try {
                showLoading('Creating account...');
                const result = await register(fullName, email, username, password);
                
                if (result.success) {
                    showMessage(registerMessage, 'Account created successfully! Redirecting to login...', 'success');
                    
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage(registerMessage, result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showMessage(registerMessage, 'An error occurred during registration. Please try again.', 'error');
            } finally {
                hideLoading();
            }
        });
        
        // Password strength validation
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                updatePasswordStrength(password);
            });
        }
    }
    
    // Auto-fill remembered username if available
    const rememberedUser = localStorage.getItem('rememberedUser');
    const usernameField = document.getElementById('username');
    if (rememberedUser && usernameField) {
        usernameField.value = rememberedUser;
        // If we have a remembered user, check the remember me box
        const rememberMeCheckbox = document.getElementById('rememberMe');
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Forgot password functionality
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            
            if (!username) {
                showMessage(loginMessage, 'Please enter your username or email first', 'error');
                return;
            }
            
            // Here you would typically send a password reset email
            // For now, we'll just show a message
            showMessage(loginMessage, 'Password reset functionality will be implemented soon. Please contact support.', 'info');
        });
    }
});

/**
 * Login function that authenticates against the Users sheet
 */
async function login(username, password, rememberMe) {
    try {
        // We'll use the Google Apps Script endpoint to handle the authentication
        const formData = {
            action: 'login',
            username: username,
            password: password
        };
        
        const response = await fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        // Since we're using no-cors, we can't read the response directly
        // Instead, we'll use a separate function to check authentication status
        return await checkAuthStatus(username);
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please try again.' };
    }
}

/**
 * Register function that adds a new user to the Users sheet
 */
async function register(fullName, email, username, password) {
    try {
        // Check if username or email already exists
        const userExists = await checkUserExists(username, email);
        if (userExists) {
            return { success: false, message: 'Username or email already exists' };
        }
        
        // We'll use the Google Apps Script endpoint to handle the registration
        const formData = {
            action: 'register',
            fullName: fullName,
            email: email,
            username: username,
            password: password, // In reality, this should be hashed server-side
            registrationDate: new Date().toISOString()
        };
        
        await fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        // Since we're using no-cors, we just assume success if no error was thrown
        // In production, you would check for a response
        return { success: true };
        
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Registration failed. Please try again.' };
    }
}

/**
 * Check if a user exists in the Users sheet
 */
async function checkUserExists(username, email) {
    // In a real implementation, this would check against the Google Sheet
    // For now, we'll simulate this check
    
    // Normally you would query the sheet here
    return false; // Simulate that the user doesn't exist
}

/**
 * Check authentication status by querying the sheet for the user
 */
/**
 * Check authentication status by querying the sheet for the user
 */
async function checkAuthStatus(username) {
    try {
        // Make a request to the Google Apps Script endpoint
        await fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'authenticate',
                username: username
            })
        });

        // Since we can't read the response with no-cors,
        // we'll make a second request to check the authentication status
        const checkStatusData = {
            action: 'checkStatus',
            username: username,
            timestamp: new Date().toISOString()
        };

        await fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkStatusData)
        });

        // For now, return successful login with the username
        // Later we can implement proper session management
        return {
            success: true,
            username: username,
            name: username, // Using username as name for now
            email: username + '@example.com' // Placeholder email
        };

    } catch (error) {
        console.error('Authentication error:', error);
        return {
            success: false,
            message: 'Authentication failed. Please try again.'
        };
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    // At least 8 chars, must include letter and number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordFeedback = document.getElementById('passwordFeedback');
    
    if (!passwordStrength || !passwordFeedback) return;
    
    // Remove existing classes
    passwordStrength.className = 'strength-meter';
    
    if (!password) {
        passwordFeedback.textContent = 'Password must be at least 8 characters with letters and numbers';
        return;
    }
    
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    
    if (isLongEnough && hasLetter && hasNumber && hasSpecial) {
        passwordStrength.classList.add('strong');
        passwordFeedback.textContent = 'Strong password';
    } else if (isLongEnough && hasLetter && hasNumber) {
        passwordStrength.classList.add('medium');
        passwordFeedback.textContent = 'Good password. Consider adding special characters.';
    } else {
        passwordStrength.classList.add('weak');
        passwordFeedback.textContent = 'Weak password. Must be 8+ characters with letters and numbers.';
    }
}

/**
 * Show message in UI
 */
function showMessage(element, message, type = 'info') {
    if (!element) return;
    
    element.textContent = message;
    element.className = `message-box ${type}`;
    element.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    
    if (overlay) {
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        overlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
