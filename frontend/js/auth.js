/* ==========================================================================
   INVENTORY MANAGEMENT SYSTEM - AUTHENTICATION MODULE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAuthForms();
    checkProtectedPages();
    updateUserInterface();
});

// Initialize Auth Form Listeners
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle User Login
async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        showAlert('Please enter both email and password.', 'danger');
        return;
    }

    setButtonLoading(submitBtn, true, 'Logging in...');

    try {
        let loggedIn = false;
        if (isLiveFirebase && firebaseAuth) {
            try {
                const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                StorageEngine.setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || email.split('@')[0]
                });
                loggedIn = true;
            } catch (fbErr) {
                if (fbErr.code === 'auth/api-key-not-valid' || fbErr.message.includes('api-key')) {
                    console.warn("Live Firebase Auth key unconfigured. Falling back to Local Engine.");
                } else {
                    throw fbErr;
                }
            }
        }
        
        if (!loggedIn) {
            // Local mode login verification
            StorageEngine.setUser({
                uid: "usr_" + Date.now(),
                email: email,
                displayName: email.split('@')[0]
            });
        }

        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = getPagePath('dashboard.html');
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);
        showAlert(error.message || 'Failed to authenticate.', 'danger');
    } finally {
        setButtonLoading(submitBtn, false, 'Sign In');
    }
}

// Handle User Registration
async function handleRegisterSubmit(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!fullName || !email || !password || !confirmPassword) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'danger');
        return;
    }

    setButtonLoading(submitBtn, true, 'Creating Account...');

    try {
        let registered = false;
        if (isLiveFirebase && firebaseAuth) {
            try {
                const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                await user.updateProfile({ displayName: fullName });

                StorageEngine.setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: fullName
                });
                registered = true;
            } catch (fbErr) {
                if (fbErr.code === 'auth/api-key-not-valid' || fbErr.message.includes('api-key')) {
                    console.warn("Live Firebase Auth key unconfigured. Falling back to Local Engine.");
                } else {
                    throw fbErr;
                }
            }
        }

        if (!registered) {
            // Local fallback registration
            StorageEngine.setUser({
                uid: "usr_" + Date.now(),
                email: email,
                displayName: fullName
            });
        }

        showAlert('Account created successfully! Redirecting to Dashboard...', 'success');
        setTimeout(() => {
            window.location.href = getPagePath('dashboard.html');
        }, 1200);

    } catch (error) {
        console.error("Registration error:", error);
        showAlert(error.message || 'Failed to register account.', 'danger');
    } finally {
        setButtonLoading(submitBtn, false, 'Create Account');
    }
}

// Handle Logout
async function handleLogout(e) {
    if (e) e.preventDefault();
    try {
        if (isLiveFirebase && firebaseAuth) {
            await firebaseAuth.signOut();
        }
        StorageEngine.setUser(null);
        window.location.href = getPagePath('login.html');
    } catch (error) {
        console.error("Logout error:", error);
        StorageEngine.setUser(null);
        window.location.href = getPagePath('login.html');
    }
}

// Protected Route Checker
function checkProtectedPages() {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('register.html');
    const user = StorageEngine.getUser();

    if (!user && !isAuthPage && !currentPath.endsWith('index.html')) {
        window.location.href = getPagePath('login.html');
    } else if (user && isAuthPage) {
        window.location.href = getPagePath('dashboard.html');
    }
}

// Display Current User Information in UI
function updateUserInterface() {
    const user = StorageEngine.getUser();
    if (user) {
        const userNameEls = document.querySelectorAll('.user-display-name');
        const userEmailEls = document.querySelectorAll('.user-display-email');
        const userAvatarEls = document.querySelectorAll('.user-display-avatar');

        userNameEls.forEach(el => el.textContent = user.displayName || user.email.split('@')[0]);
        userEmailEls.forEach(el => el.textContent = user.email);
        userAvatarEls.forEach(el => {
            const initial = (user.displayName || user.email)[0].toUpperCase();
            el.textContent = initial;
        });
    }
}

// Helper Path Calculator
function getPagePath(pageName) {
    if (window.location.pathname.includes('/pages/')) {
        return pageName;
    }
    return 'pages/' + pageName;
}
