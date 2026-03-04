/* ============================================
   PERSONAL OS — Authentication (Google Sign-In)
   ============================================ */

const Auth = {
    currentUser: null,
    provider: new firebase.auth.GoogleAuthProvider(),
    _initialized: false,

    init() {
        FirebaseAuth.onAuthStateChanged(async (user) => {
            const wasSignedIn = !!this.currentUser;
            this.currentUser = user;
            this.updateUI(user);

            if (user && !this._initialized) {
                // First sign-in or page reload with existing session
                Toast.show(`Welcome, ${user.displayName || 'User'}!`, 'success');
                if (!Tour.isActive) {
                    await Data.loadFromCloud();
                    App.navigate(App.getCurrentPage());
                }
            } else if (!user && wasSignedIn) {
                // User just signed out — re-render to update UI
                if (!Tour.isActive) {
                    App.navigate(App.getCurrentPage());
                }
            }

            this._initialized = true;
        });
    },

    async signIn() {
        try {
            // Try popup first, fallback to redirect for mobile
            await FirebaseAuth.signInWithPopup(this.provider);
        } catch (error) {
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                // Try redirect as fallback
                try {
                    await FirebaseAuth.signInWithRedirect(this.provider);
                } catch (redirectError) {
                    Toast.show('Sign-in failed: ' + redirectError.message, 'error');
                }
            } else if (error.code !== 'auth/popup-closed-by-user') {
                Toast.show('Sign-in failed: ' + error.message, 'error');
            }
        }
    },

    async signOut() {
        try {
            await FirebaseAuth.signOut();
            this.currentUser = null;
            this.updateUI(null);
            Toast.show('Signed out successfully.', 'info');
            // Re-render current page to update cloud sync status
            App.navigate(App.getCurrentPage());
        } catch (error) {
            Toast.show('Sign-out failed: ' + error.message, 'error');
        }
    },

    getUser() {
        return this.currentUser;
    },

    getUID() {
        return this.currentUser ? this.currentUser.uid : null;
    },

    isSignedIn() {
        return !!this.currentUser;
    },

    updateUI(user) {
        const profileSection = document.getElementById('user-profile');
        const signInBtn = document.getElementById('google-signin-btn');

        if (user) {
            // Show user profile with avatar fallback
            const avatarHTML = user.photoURL
                ? `<img class="user-avatar" src="${user.photoURL}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                + `<div class="user-avatar-fallback" style="display:none;">${(user.displayName || 'U')[0].toUpperCase()}</div>`
                : `<div class="user-avatar-fallback">${(user.displayName || 'U')[0].toUpperCase()}</div>`;

            if (profileSection) {
                profileSection.style.display = 'flex';
                profileSection.innerHTML = `
                    ${avatarHTML}
                    <div class="user-info">
                        <div class="user-name">${user.displayName || 'User'}</div>
                        <div class="user-email">${user.email || ''}</div>
                    </div>
                    <button class="user-signout" onclick="Auth.signOut()" title="Sign Out">⏻</button>
                `;
            }
            // Hide sign-in button
            if (signInBtn) signInBtn.style.display = 'none';

            // Update status dot to synced
            const statusText = document.querySelector('.system-status span:last-child');
            if (statusText) statusText.textContent = 'Cloud Synced';
            const statusDot = document.querySelector('.status-dot');
            if (statusDot) statusDot.style.background = 'var(--green)';
        } else {
            // Hide profile
            if (profileSection) {
                profileSection.style.display = 'none';
                profileSection.innerHTML = '';
            }
            // Show sign-in button
            if (signInBtn) signInBtn.style.display = 'flex';

            // Update status
            const statusText = document.querySelector('.system-status span:last-child');
            if (statusText) statusText.textContent = 'Local Only';
            const statusDot = document.querySelector('.status-dot');
            if (statusDot) statusDot.style.background = 'var(--yellow)';
        }
    }
};
