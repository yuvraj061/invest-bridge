// ui.js
function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[onclick="showAuthTab('${tab}')"]`).classList.add('active');

    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function showDashboardTab(tab) {
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[onclick="showDashboardTab('${tab}')"]`).classList.add('active');

    document.querySelectorAll('.dashboard-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}Content`).classList.add('active');
}

function showDashboard(currentUser) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');

    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'User';
        document.getElementById('userRole').textContent = currentUser.userType ? currentUser.userType.charAt(0).toUpperCase() + currentUser.userType.slice(1) : 'Role';
        document.getElementById('userAvatar').textContent = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
    }

    showDashboardTab('overview');
}

function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboard').classList.remove('active');
    showAuthTab('login');
}

function viewProfile(user) {
    if (user) {
        alert(`
            Profile Details:
            Name: ${user.name}
            Email: ${user.email}
            User Type: ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
            Phone: ${user.phone || 'N/A'}
            Joined: ${new Date(user.createdAt).toLocaleDateString()}
        `);
    } else {
        alert('User profile not found.');
    }
}

export { showAuthTab, showDashboardTab, showDashboard, showAuthSection, viewProfile }; 