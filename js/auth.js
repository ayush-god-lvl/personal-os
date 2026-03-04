/* ============================================
   PERSONAL OS — Authentication (Google Sign-In)
   ============================================ */

const Auth = {
    currentUser: null,
    provider: new firebase.auth.GoogleAuthProvider(),

    init() {
        FirebaseAuth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            this.updateUI(user);

            if (user) {
                // User signed in — load cloud data
                Toast.show(`Welcome, ${user.displayName}!`, 'success');
                await Data.loadFromCloud();
                // Re-render current page with cloud data
                App.navigate(App.getCurrentPage());
            }
        });
    },

    async signIn() {
        try {
            await FirebaseAuth.signInWithPopup(this.provider);
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
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
            // Show user profile
            if (profileSection) {
                profileSection.style.display = 'flex';
                profileSection.innerHTML = `
                    <img class="user-avatar" src="${user.photoURL || ''}" alt="" referrerpolicy="no-referrer">
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
            const statusDot = document.querySelector('.system-status span:last-child');
            if (statusDot) statusDot.textContent = 'Cloud Synced';
        } else {
            // Hide profile
            if (profileSection) {
                profileSection.style.display = 'none';
                profileSection.innerHTML = '';
            }
            // Show sign-in button
            if (signInBtn) signInBtn.style.display = 'flex';

            // Update status
            const statusDot = document.querySelector('.system-status span:last-child');
            if (statusDot) statusDot.textContent = 'Local Only';
        }
    }
};
