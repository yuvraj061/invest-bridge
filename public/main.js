// main.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-config.js';
import * as auth from './auth.js';
import * as posts from './posts.js';
import * as connections from './connections.js';
import * as logging from './logging.js';
import * as ui from './ui.js';
import * as categories from './categories.js';
import * as evaluation from './evaluation.js';
import * as advisor from './advisor.js';
import * as queries from './queries.js';

// Get Firebase service instances
const firebaseAuth = getAuth(app);
const db = getFirestore(app);

// Application State
let currentUser = null;
let users = [];
let postsData = [];
let connectionsData = [];

// Firebase Data Loading
async function loadAllDataFromFirestore() {
    logging.log('Attempting to load all data from Firestore...', 'info', currentUser);
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        logging.log(`Loaded ${users.length} users from Firestore.`, 'info', currentUser);

        const postsSnapshot = await getDocs(collection(db, "posts"));
        postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        logging.log(`Loaded ${postsData.length} posts from Firestore.`, 'info', currentUser);

        const connectionsSnapshot = await getDocs(collection(db, "connections"));
        connectionsData = connectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        logging.log(`Loaded ${connectionsData.length} connections from Firestore.`, 'info', currentUser);
    } catch (error) {
        logging.log(`Error loading data from Firestore: ${error.message}`, 'error', currentUser);
        console.error("Error loading data from Firestore:", error);
    }
}

// Dashboard Logic
function updateDashboardOverview() {
    if (!currentUser) {
        logging.log('Attempted to update dashboard overview without current user.', 'warn');
        return;
    }

    const userConnections = connectionsData.filter(c =>
        c.investorId === currentUser.id || c.entrepreneurId === currentUser.id || c.bankerId === currentUser.id
    );

    const userPosts = postsData.filter(p => p.userId === currentUser.id);

    document.getElementById('totalConnections').textContent = userConnections.length;
    document.getElementById('activeProposals').textContent = userPosts.length;

    const approvedConnectionsCount = userConnections.filter(c => c.status === 'approved').length;
    const successRate = userConnections.length > 0
        ? Math.round((approvedConnectionsCount / userConnections.length) * 100) + '%'
        : '0%';
    document.getElementById('successRate').textContent = successRate;

    logging.log(`Dashboard overview updated for ${currentUser.name}.`, 'info', currentUser);
}

// Global Functions for HTML Event Handlers
window.showAuthTab = ui.showAuthTab;

window.register = async function(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('userType').value;
    const phone = document.getElementById('registerPhone').value.trim();

    if (!name || !email || !password || !userType || !phone) {
        alert("Please fill in all registration fields.");
        logging.log("Registration attempt with incomplete fields.", 'warn');
        return;
    }
    if (password.length < 6) {
        alert("Password should be at least 6 characters.");
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    try {
        logging.log(`Attempting to register new user: ${email} as ${userType}`, 'info');
        await auth.registerUser({ name, email, password, userType, phone });
        logging.log(`Successfully registered user: ${email} (${userType}) and created Firestore document.`, 'info');
        alert('Registration successful! You can now log in.');
        ui.showAuthTab('login');
        
        document.getElementById('registerName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('userType').value = '';
        document.getElementById('registerPhone').value = '';
    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please login or use a different email.';
        }
        logging.log(`Registration failed for ${email}: ${errorMessage}`, 'error');
        console.error("Registration error:", error);
        alert(`Registration failed: ${errorMessage}`);
    }
};

window.login = async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        logging.log("Login attempt with incomplete fields.", 'warn');
        return;
    }

    try {
        logging.log(`Attempting to login user: ${email}`, 'info');
        await auth.loginUser(email, password);
        logging.log(`Login request sent for ${email}. Awaiting auth state change.`, 'info');
    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No user found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        }
        logging.log(`Login failed for ${email}: ${errorMessage}`, 'error');
        console.error("Login error:", error);
        alert(`Login failed: ${errorMessage}`);
    }
};

window.logout = async function() {
    try {
        logging.log(`User ${currentUser ? currentUser.email : 'N/A'} is logging out.`, 'info');
        await auth.logoutUser();
        alert('Logged out successfully!');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } catch (error) {
        logging.log(`Logout failed: ${error.message}`, 'error');
        console.error("Logout error:", error);
        alert(`Logout failed: ${error.message}`);
    }
};

window.showDashboardTab = function(tab) {
    ui.showDashboardTab(tab);
    logging.log(`Switched to dashboard tab: ${tab}`, 'info', currentUser);

    // Show/hide post type selector for bankers
    if (tab === 'post') {
        const postTypeGroup = document.getElementById('postTypeGroup');
        if (currentUser && currentUser.userType === 'banker') {
            postTypeGroup.style.display = 'block';
            document.getElementById('postType').setAttribute('required', 'required');
        } else {
            postTypeGroup.style.display = 'none';
            document.getElementById('postType').removeAttribute('required');
        }
    }

    if (tab === 'overview') {
        updateDashboardOverview();
    } else if (tab === 'browse') {
        loadBrowseContent();
    } else if (tab === 'connections') {
        loadConnections();
    }
};

window.createPost = async function(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please log in to create a post.");
        logging.log("Attempted to create post without being logged in.", 'warn');
        return;
    }

    const title = document.getElementById('postTitle').value.trim();
    const description = document.getElementById('postDescription').value.trim();
    const amount = document.getElementById('postAmount').value;
    const category = document.getElementById('postCategory').value;
    const subcategory = document.getElementById('postSubcategory').value;
    let postType = '';
    if (currentUser.userType === 'banker') {
        postType = document.getElementById('postType').value;
        if (!postType) {
            alert("Please select a post type (Loan Offer or Advisory).");
            return;
        }
    }

    if (!title || !description || !amount || !category || !subcategory) {
        alert("Please fill in all post details including subcategory.");
        return;
    }
    if (isNaN(amount) || parseInt(amount) <= 0) {
        alert("Please enter a valid positive amount.");
        return;
    }

    try {
        logging.log(`Attempting to create new post: "${title}" by ${currentUser.name}.`, 'info', currentUser);
        const newPostData = {
            userId: currentUser.id,
            userName: currentUser.name,
            userType: currentUser.userType,
            title,
            description,
            amount: parseInt(amount),
            category,
            subcategory,
            categoryInfo: categories.getCategoryInfo(category),
            subcategoryInfo: categories.getSubcategoryInfo(category, subcategory),
            status: 'active',
            createdAt: new Date().toISOString()
        };
        if (currentUser.userType === 'banker') {
            newPostData.postType = postType;
        }

        await posts.createPost(newPostData);
        await loadAllDataFromFirestore();

        logging.log(`New post "${title}" created successfully by ${currentUser.name}.`, 'info', currentUser);
        alert('Post created successfully!');

        document.getElementById('postTitle').value = '';
        document.getElementById('postDescription').value = '';
        document.getElementById('postAmount').value = '';
        document.getElementById('postCategory').value = '';
        document.getElementById('postSubcategory').value = '';
        document.getElementById('subcategoryGroup').style.display = 'none';
        document.getElementById('categoryInfo').style.display = 'none';
        if (document.getElementById('postType')) document.getElementById('postType').value = '';

        updateDashboardOverview();
        ui.showDashboardTab('overview');
    } catch (error) {
        logging.log(`Failed to create post "${title}": ${error.message}`, 'error', currentUser);
        console.error("Create post error:", error);
        alert(`Failed to create post: ${error.message}`);
    }
};

window.connectWithUser = async function(postId) {
    if (!currentUser) {
        alert("Please log in to send connection requests.");
        logging.log("Attempted to send connection request without current user.", 'warn');
        return;
    }

    const post = postsData.find(p => p.id === postId);
    if (!post) {
        alert("Post not found.");
        logging.log(`Attempted to connect to non-existent post: ${postId}`, 'error');
        return;
    }

    let investorId = null, entrepreneurId = null, bankerId = null;
    if (currentUser.userType === 'investor' && post.userType === 'entrepreneur') {
        investorId = currentUser.id;
        entrepreneurId = post.userId;
    } else if (currentUser.userType === 'entrepreneur' && post.userType === 'investor') {
        investorId = post.userId;
        entrepreneurId = currentUser.id;
    } else if (currentUser.userType === 'banker' && (post.userType === 'entrepreneur' || post.userType === 'investor')) {
        bankerId = currentUser.id;
        if (post.userType === 'entrepreneur') {
            entrepreneurId = post.userId;
        } else if (post.userType === 'investor') {
            investorId = post.userId;
        }
    } else if ((currentUser.userType === 'investor' || currentUser.userType === 'entrepreneur') && post.userType === 'banker') {
        bankerId = post.userId;
        if (currentUser.userType === 'investor') {
            investorId = currentUser.id;
        } else if (currentUser.userType === 'entrepreneur') {
            entrepreneurId = currentUser.id;
        }
    } else {
        alert("Cannot initiate a connection with this user type for this post.");
        logging.log(`Invalid connection attempt: Current user (${currentUser.userType}) trying to connect with post by (${post.userType}).`, 'warn');
        return;
    }

    if (currentUser.id === post.userId) {
        alert("You cannot connect to your own post.");
        logging.log("Attempted to connect to self's post.", 'warn');
        return;
    }

    try {
        let connectionsQuery;
        if (bankerId && (investorId || entrepreneurId)) {
            connectionsQuery = query(
                collection(db, "connections"),
                where("postId", "==", postId),
                where("bankerId", "==", bankerId),
                investorId ? where("investorId", "==", investorId) : where("entrepreneurId", "==", entrepreneurId)
            );
        } else {
            connectionsQuery = query(
                collection(db, "connections"),
                where("postId", "==", postId),
                where("investorId", "==", investorId),
                where("entrepreneurId", "==", entrepreneurId)
            );
        }
        const existingConnectionsSnapshot = await getDocs(connectionsQuery);

        if (!existingConnectionsSnapshot.empty) {
            alert('A connection for this post already exists or is pending.');
            logging.log('Attempted to create duplicate connection.', 'info');
            return;
        }

        const newConnectionData = {
            investorId: investorId,
            entrepreneurId: entrepreneurId,
            bankerId: bankerId,
            postId: postId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            requestedBy: currentUser.id
        };

        await connections.createConnection(newConnectionData);
        await loadAllDataFromFirestore();

        logging.log(`Connection request sent from ${currentUser.name} to ${users.find(u => u.id === post.userId)?.name || 'Unknown'} for post "${post.title}".`, 'info', currentUser);
        alert('Connection request sent successfully!');
        updateDashboardOverview();
        loadBrowseContent();
    } catch (error) {
        logging.log(`Failed to send connection request for post ${postId}: ${error.message}`, 'error', currentUser);
        console.error("Connection request error:", error);
        alert(`Failed to send connection request: ${error.message}`);
    }
};

window.viewProfile = function(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        logging.log(`Viewing profile for: ${user.name}`, 'info', currentUser);
        ui.viewProfile(user);
    } else {
        alert('User profile not found.');
        logging.log(`Attempted to view profile for unknown user ID: ${userId}`, 'warn');
    }
};

window.updateConnectionStatus = async function(connectionId, status) {
    if (!currentUser) {
        alert("Please log in to update connection status.");
        logging.log("Attempted to update connection status without current user.", 'warn');
        return;
    }

    try {
        logging.log(`Attempting to update connection ${connectionId} to status: ${status}.`, 'info', currentUser);
        await connections.updateConnectionStatus(connectionId, status, currentUser.id);
        await loadAllDataFromFirestore();

        logging.log(`Connection ${connectionId} status updated to: ${status} by ${currentUser.name}.`, 'info', currentUser);
        alert(`Connection request ${status}!`);
        loadConnections();
        updateDashboardOverview();
    } catch (error) {
        logging.log(`Failed to update connection status for ${connectionId}: ${error.message}`, 'error', currentUser);
        console.error("Update connection error:", error);
        alert(`Failed to update connection status: ${error.message}`);
    }
};

window.viewConnectionDetails = function(connectionId) {
            const connection = connectionsData.find(c => c.id === connectionId);
    if (connection) {
        const investor = users.find(u => u.id === connection.investorId);
        const entrepreneur = users.find(u => u.id === connection.entrepreneurId);
        const post = postsData.find(p => p.id === connection.postId);

        let details = `Connection ID: ${connection.id}\n`;
        details += `Status: ${connection.status.toUpperCase()}\n`;
        details += `Investor: ${investor ? investor.name + ' (' + investor.email + ')' : 'N/A'}\n`;
        details += `Entrepreneur: ${entrepreneur ? entrepreneur.name + ' (' + entrepreneur.email + ')' : 'N/A'}\n`;
        details += `Linked Post: ${post ? post.title : 'N/A'}\n`;
        details += `Amount Proposed: ${post ? '₹' + post.amount.toLocaleString('en-IN') : 'N/A'}\n`;
        details += `Requested By: ${users.find(u => u.id === connection.requestedBy)?.name || 'N/A'}\n`;
        details += `Created At: ${new Date(connection.createdAt).toLocaleString()}\n`;
        if (connection.updatedAt) {
            details += `Last Updated: ${new Date(connection.updatedAt).toLocaleString()}\n`;
        }

        alert(details);
        logging.log(`Viewed details for connection: ${connectionId}`, 'info', currentUser);
    } else {
        alert("Connection details not found.");
        logging.log(`Attempted to view details for non-existent connection: ${connectionId}`, 'warn');
    }
};

// Load and display opportunities
async function loadBrowseContent() {
    const browseList = document.getElementById('browseList');
    browseList.innerHTML = '';

    if (!currentUser) {
        browseList.innerHTML = '<p style="text-align: center; color: #718096;">Please log in to browse opportunities.</p>';
        logging.log("Attempted to load browse content without current user.", 'warn');
        return;
    }

    logging.log(`Loading browse content for ${currentUser.userType}...`, 'info', currentUser);
    let relevantPosts = [];

    if (currentUser.userType === 'investor') {
        relevantPosts = postsData.filter(p => (p.userType === 'entrepreneur' || p.userType === 'banker') && p.status === 'active' && p.userId !== currentUser.id);
    } else if (currentUser.userType === 'entrepreneur') {
        relevantPosts = postsData.filter(p => (p.userType === 'investor' || p.userType === 'banker') && p.status === 'active' && p.userId !== currentUser.id);
        if (relevantPosts.length === 0) {
            relevantPosts = postsData.filter(p => p.userType === 'entrepreneur' && p.status === 'active' && p.userId !== currentUser.id);
        }
    } else if (currentUser.userType === 'banker') {
        relevantPosts = postsData.filter(p => (p.userType === 'entrepreneur' || p.userType === 'investor') && p.status === 'active');
    } else {
        browseList.innerHTML = '<p style="text-align: center; color: #718096;">No content available for your user type.</p>';
        logging.log(`No specific browse content logic for user type: ${currentUser.userType}`, 'info');
        return;
    }

    if (relevantPosts.length === 0) {
        browseList.innerHTML = '<p style="text-align: center; color: #718096;">No opportunities available at the moment.</p>';
        logging.log('No relevant posts found for Browse.', 'info');
        return;
    }

    relevantPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    relevantPosts.forEach(post => {
        const postUser = users.find(u => u.id === post.userId);
        if (!postUser) {
            logging.log(`User for post ${post.id} not found in local cache.`, 'warn');
            return;
        }

        const connectionExists = connectionsData.some(c =>
            (c.investorId === currentUser.id && c.entrepreneurId === post.userId && c.postId === post.id) ||
            (c.entrepreneurId === currentUser.id && c.investorId === post.userId && c.postId === post.id) ||
            (c.bankerId === currentUser.id && c.postId === post.id) ||
            ((post.userType === 'banker') && ((c.investorId === currentUser.id && c.bankerId === post.userId && c.postId === post.id) || (c.entrepreneurId === currentUser.id && c.bankerId === post.userId && c.postId === post.id)))
        );

        let showConnectButton = false;
        if (currentUser.id !== post.userId && !connectionExists) {
            if (
                (currentUser.userType === 'investor' && post.userType === 'entrepreneur') ||
                (currentUser.userType === 'entrepreneur' && post.userType === 'investor') ||
                (currentUser.userType === 'banker' && (post.userType === 'entrepreneur' || post.userType === 'investor')) ||
                ((currentUser.userType === 'investor' || currentUser.userType === 'entrepreneur') && post.userType === 'banker')
            ) {
                showConnectButton = true;
            }
        }

        const card = document.createElement('div');
        card.className = 'card';
        
        // Get category info for display
        const categoryInfo = post.categoryInfo || categories.getCategoryInfo(post.category);
        const subcategoryInfo = post.subcategoryInfo || categories.getSubcategoryInfo(post.category, post.subcategory);
        
        card.innerHTML = `
            <h3>${post.title}</h3>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 1.5rem;">${categoryInfo?.icon || '📋'}</span>
                <div>
                    <p style="margin: 0; font-weight: 600; color: #4a5568;">${categoryInfo?.name || post.category || 'N/A'}</p>
                    <p style="margin: 0; font-size: 0.9rem; color: #718096;">${subcategoryInfo?.name || post.subcategory || 'N/A'}</p>
                </div>
            </div>
            <p><strong>Amount:</strong> ₹${post.amount ? post.amount.toLocaleString('en-IN') : 'N/A'}</p>
            <p><strong>Posted by:</strong> ${postUser.name} (${postUser.userType.charAt(0).toUpperCase() + postUser.userType.slice(1)})</p>
            ${post.userType === 'banker' && post.postType ? `<p><strong>Type:</strong> ${post.postType === 'loan' ? 'Loan Offer' : 'Advisory'}</p>` : ''}
            <p>${post.description || 'No description provided.'}</p>
            <div class="card-actions">
                ${showConnectButton ? `<button class="btn-small" onclick="connectWithUser('${post.id}')">Connect</button>` : connectionExists ? `<button class="btn-small" disabled>Connected</button>` : ''}
                <button class="btn-small" onclick="viewProfile('${post.userId}')">View Profile</button>
            </div>
        `;
        browseList.appendChild(card);
    });
    logging.log(`Displayed ${relevantPosts.length} posts in browse section.`, 'info', currentUser);
}

// Load and display connections
async function loadConnections() {
    const connectionsList = document.getElementById('connectionsList');
    connectionsList.innerHTML = '';

    if (!currentUser) {
        connectionsList.innerHTML = '<p style="text-align: center; color: #718096;">Please log in to view your connections.</p>';
        logging.log("Attempted to load connections without current user.", 'warn');
        return;
    }

    logging.log(`Loading connections for user: ${currentUser.name}.`, 'info', currentUser);
    const userConnections = connectionsData.filter(c =>
        c.investorId === currentUser.id || c.entrepreneurId === currentUser.id || c.bankerId === currentUser.id
    );

    if (userConnections.length === 0) {
        connectionsList.innerHTML = '<p style="text-align: center; color: #718096;">No connections yet. Browse opportunities to connect with others!</p>';
        logging.log('No connections found for current user.', 'info');
        return;
    }

    userConnections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    userConnections.forEach(connection => {
        let otherUserId;
        if (connection.investorId === currentUser.id) {
            otherUserId = connection.entrepreneurId || connection.bankerId;
        } else if (connection.entrepreneurId === currentUser.id) {
            otherUserId = connection.investorId || connection.bankerId;
        } else if (connection.bankerId === currentUser.id) {
            otherUserId = connection.investorId || connection.entrepreneurId;
        }
        const otherUser = users.find(u => u.id === otherUserId);
        const post = postsData.find(p => p.id === connection.postId);

        let actionsHtml = '';
        const isRequester = connection.requestedBy === currentUser.id;
        const isRecipient = !isRequester && connection.status === 'pending';

        if (connection.status === 'pending') {
            if (isRecipient) {
                actionsHtml = `
                    <button class="btn-small btn-success" onclick="updateConnectionStatus('${connection.id}', 'approved')">Approve</button>
                    <button class="btn-small" onclick="updateConnectionStatus('${connection.id}', 'rejected')">Reject</button>
                `;
            } else {
                actionsHtml = `<button class="btn-small" disabled>Pending Response</button>`;
            }
        } else if (connection.status === 'approved' && currentUser.userType === 'banker') {
            actionsHtml = `<button class="btn-small btn-success" onclick="viewConnectionDetails('${connection.id}')">View Details</button>`;
        }
        actionsHtml += `<button class="btn-small" onclick="viewProfile('${otherUserId}')">View Profile</button>`;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${otherUser ? otherUser.name : 'Unknown User'}</h3>
            <p><strong>Type:</strong> ${otherUser ? (otherUser.userType.charAt(0).toUpperCase() + otherUser.userType.slice(1)) : 'Unknown'}</p>
            <p><strong>Email:</strong> ${otherUser ? otherUser.email : 'Unknown'}</p>
            <p><strong>Linked Post:</strong> ${post ? post.title : 'Unknown Post'}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${connection.status}">${connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}</span></p>
            <div class="card-actions">
                ${actionsHtml}
            </div>
        `;
        connectionsList.appendChild(card);
    });
    logging.log(`Displayed ${userConnections.length} connections for current user.`, 'info', currentUser);
}

// Firebase Authentication State Listener
onAuthStateChanged(firebaseAuth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                currentUser = { id: user.uid, ...userDoc.data() };
                logging.log(`User ${currentUser.email} (${currentUser.userType}) is signed in. Fetching all app data.`, 'info', currentUser);
                await loadAllDataFromFirestore();
                ui.showDashboard(currentUser);
            } else {
                logging.log(`Firestore user document not found for Firebase user: ${user.uid}. Forcing sign out.`, 'error');
                await signOut(firebaseAuth);
                alert("Your user profile could not be loaded. Please re-register or contact support.");
            }
        } catch (error) {
            logging.log(`Error fetching user document for ${user.uid}: ${error.message}`, 'error');
            console.error("Error fetching user doc:", error);
            await signOut(firebaseAuth);
            alert("Failed to load user data. Please try logging in again.");
        }
    } else {
        currentUser = null;
        users = [];
        postsData = []; // Clear postsData
        connectionsData = [];
        logging.log('User is signed out. Displaying authentication section.', 'info');
        ui.showAuthSection();
    }
});

// Category Management Functions
window.updateSubcategories = function() {
    const categorySelect = document.getElementById('postCategory');
    const subcategorySelect = document.getElementById('postSubcategory');
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const categoryInfo = document.getElementById('categoryInfo');
    
    const selectedCategory = categorySelect.value;
    
    if (!selectedCategory) {
        subcategoryGroup.style.display = 'none';
        categoryInfo.style.display = 'none';
        return;
    }
    
    const categoryData = categories.getCategoryInfo(selectedCategory);
    if (!categoryData) return;
    
    // Populate subcategories
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    Object.entries(categoryData.subcategories).forEach(([key, name]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = name;
        subcategorySelect.appendChild(option);
    });
    
    // Show subcategory group
    subcategoryGroup.style.display = 'block';
    
    // Update category info
    document.getElementById('categoryIcon').textContent = categoryData.icon;
    document.getElementById('categoryName').textContent = categoryData.name;
    document.getElementById('categoryDescription').textContent = categoryData.description;
    document.getElementById('investmentRange').textContent = categories.formatInvestmentRange(categoryData.investmentRange);
    categoryInfo.style.display = 'block';
    
    logging.log(`Category selected: ${categoryData.name}`, 'info', currentUser);
};

window.showCategorySuggestions = function() {
    const amount = parseInt(document.getElementById('postAmount').value) || 0;
    if (amount < 1000) return;
    
    const suggestions = categories.getCategorySuggestions(currentUser?.userType, amount);
    if (suggestions.length === 0) return;
    
    // Create suggestions container
    let suggestionsHtml = '<div class="category-suggestions">';
    suggestions.slice(0, 6).forEach(suggestion => {
        suggestionsHtml += `
            <div class="category-suggestion" onclick="selectCategorySuggestion('${suggestion.key}')">
                <span class="category-suggestion-icon">${suggestion.icon}</span>
                <div class="category-suggestion-name">${suggestion.name}</div>
                <div class="category-suggestion-score">${Math.round(suggestion.matchScore)}% match</div>
            </div>
        `;
    });
    suggestionsHtml += '</div>';
    
    // Insert after amount field
    const amountField = document.getElementById('postAmount').parentNode;
    const existingSuggestions = document.querySelector('.category-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.innerHTML = suggestionsHtml;
    amountField.parentNode.insertBefore(suggestionsDiv, amountField.nextSibling);
};

window.selectCategorySuggestion = function(categoryKey) {
    document.getElementById('postCategory').value = categoryKey;
    window.updateSubcategories();
    
    // Remove suggestions after selection
    const suggestions = document.querySelector('.category-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
    
    logging.log(`Category suggestion selected: ${categoryKey}`, 'info', currentUser);
};

// Initialize categories on page load
function initializeCategories() {
    const categorySelect = document.getElementById('postCategory');
    if (!categorySelect) return;
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    // Add all categories
    const allCategories = categories.getAllCategories();
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.key;
        option.textContent = `${category.icon} ${category.name}`;
        categorySelect.appendChild(option);
    });
    
    // Add event listeners for amount field
    const amountField = document.getElementById('postAmount');
    if (amountField) {
        amountField.addEventListener('input', window.showCategorySuggestions);
        amountField.addEventListener('focus', () => {
            if (amountField.value && parseInt(amountField.value) >= 1000) {
                window.showCategorySuggestions();
            }
        });
    }
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    logging.loadLogsFromLocalStorage();
    logging.log('Application initialized. Waiting for Firebase Auth state...', 'info');
    initializeCategories();
});

// ===== EVALUATION FUNCTIONS =====

window.showEvaluationTab = function(tab) {
    // Hide all evaluation content
    document.querySelectorAll('.eval-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.eval-tab').forEach(tabBtn => {
        tabBtn.classList.remove('active');
    });
    
    // Show selected content and activate tab
    document.getElementById(tab + 'Content').classList.add('active');
    event.target.classList.add('active');
    
    logging.log(`Switched to evaluation tab: ${tab}`, 'info', currentUser);
};

window.evaluateProject = function(event) {
    event.preventDefault();
    
    const evaluationData = {
        marketSize: parseInt(document.getElementById('marketSize').value) || 0,
        growthRate: parseInt(document.getElementById('growthRate').value) || 0,
        competition: parseInt(document.getElementById('competition').value) || 0,
        experience: parseInt(document.getElementById('experience').value) || 0,
        skills: parseInt(document.getElementById('skills').value) || 0,
        commitment: parseInt(document.getElementById('commitment').value) || 0
    };
    
    const result = evaluation.calculateProjectScore(evaluationData);
    
    const resultsDiv = document.getElementById('evaluationResults');
    resultsDiv.innerHTML = `
        <div class="evaluation-summary">
            <h4>Evaluation Results</h4>
            <div class="score-display">
                <div class="overall-score">
                    <span class="score-number">${result.overallScore}</span>
                    <span class="score-grade" style="color: ${result.grade.color}">${result.grade.grade}</span>
                    <span class="score-label">${result.grade.label}</span>
                </div>
                <div class="recommendation">
                    <strong>Recommendation:</strong> ${result.recommendation}
                </div>
            </div>
            <div class="category-breakdown">
                <h5>Category Breakdown</h5>
                ${Object.entries(result.categoryScores).map(([category, data]) => `
                    <div class="category-score">
                        <span class="category-name">${evaluation.evaluationMetrics.scoringCriteria[category].name}</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${data.percentage}%; background-color: ${data.percentage >= 70 ? '#10B981' : data.percentage >= 50 ? '#F59E0B' : '#EF4444'}"></div>
                        </div>
                        <span class="score-percentage">${Math.round(data.percentage)}%</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
    
    logging.log(`Project evaluation completed with score: ${result.overallScore}`, 'info', currentUser);
};

window.assessRisk = function(event) {
    event.preventDefault();
    
    const riskData = {
        marketRisk: parseInt(document.getElementById('marketRisk').value),
        technologyRisk: parseInt(document.getElementById('technologyRisk').value),
        teamRisk: parseInt(document.getElementById('teamRisk').value),
        financialRisk: parseInt(document.getElementById('financialRisk').value),
        operationalRisk: parseInt(document.getElementById('operationalRisk').value)
    };
    
    const result = evaluation.assessRisk(riskData);
    
    const resultsDiv = document.getElementById('riskResults');
    resultsDiv.innerHTML = `
        <div class="risk-summary">
            <h4>Risk Assessment Results</h4>
            <div class="risk-overview">
                <div class="overall-risk">
                    <span class="risk-number">${result.overallRisk}%</span>
                    <span class="risk-level" style="color: ${result.riskLevel.color}">${result.riskLevel.level}</span>
                    <span class="risk-description">${result.riskLevel.description}</span>
                </div>
            </div>
            <div class="risk-breakdown">
                <h5>Risk Category Breakdown</h5>
                ${Object.entries(result.riskScores).map(([category, data]) => `
                    <div class="risk-category-result">
                        <span class="risk-category-name">${evaluation.evaluationMetrics.riskCategories[category].name}</span>
                        <div class="risk-bar">
                            <div class="risk-fill" style="width: ${data.score}%; background-color: ${data.level.color}"></div>
                        </div>
                        <span class="risk-percentage">${data.score}%</span>
                        <span class="risk-level-badge" style="background-color: ${data.level.color}">${data.level.level}</span>
                    </div>
                `).join('')}
            </div>
            <div class="top-risks">
                <h5>Top Risk Factors</h5>
                ${result.riskFactors.map(factor => `
                    <div class="risk-factor">
                        <span class="factor-category">${factor.category}</span>
                        <span class="factor-score">${factor.score}%</span>
                        <span class="factor-level">${factor.level}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
    
    logging.log(`Risk assessment completed with overall risk: ${result.overallRisk}%`, 'info', currentUser);
};

window.generateDiligenceReport = function() {
    const checklistData = {};
    
    // Collect checked items
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const category = checkbox.dataset.category;
        const item = checkbox.dataset.item;
        
        if (!checklistData[category]) {
            checklistData[category] = [];
        }
        checklistData[category].push(item);
    });
    
    const report = evaluation.generateDueDiligenceReport(checklistData);
    
    const resultsDiv = document.getElementById('diligenceResults');
    resultsDiv.innerHTML = `
        <div class="diligence-summary">
            <h4>Due Diligence Report</h4>
            <div class="completion-overview">
                <div class="overall-completion">
                    <span class="completion-number">${report.overallCompletion}%</span>
                    <span class="completion-label">Overall Completion</span>
                </div>
                <div class="completion-stats">
                    <span>${report.completed} of ${report.total} items completed</span>
                </div>
            </div>
            <div class="category-progress">
                <h5>Category Progress</h5>
                ${Object.entries(report.categories).map(([category, data]) => `
                    <div class="category-progress-item">
                        <span class="category-name">${data.name}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.completionRate}%; background-color: ${data.completionRate >= 80 ? '#10B981' : data.completionRate >= 50 ? '#F59E0B' : '#EF4444'}"></div>
                        </div>
                        <span class="progress-text">${data.completed}/${data.total} (${data.completionRate}%)</span>
                    </div>
                `).join('')}
            </div>
            ${report.priority.length > 0 ? `
                <div class="priority-items">
                    <h5>Priority Items to Complete</h5>
                    ${report.priority.map(item => `
                        <div class="priority-item">
                            <span class="priority-category">${item.name}</span>
                            <span class="priority-count">${item.remaining} items remaining</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="timeline-estimate">
                <h5>Estimated Timeline</h5>
                <p>Complete remaining items in approximately <strong>${report.timeline.timeline}</strong></p>
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
    
    logging.log(`Due diligence report generated with ${report.overallCompletion}% completion`, 'info', currentUser);
};

window.calculateValuation = function(event) {
    event.preventDefault();
    
    const financialData = {
        revenue: parseInt(document.getElementById('revenue').value),
        growthRate: parseInt(document.getElementById('growthRate').value),
        profitMargin: parseInt(document.getElementById('profitMargin').value),
        marketMultiple: parseInt(document.getElementById('marketMultiple').value)
    };
    
    const result = evaluation.calculateValuation(financialData);
    
    const resultsDiv = document.getElementById('valuationResults');
    resultsDiv.innerHTML = `
        <div class="valuation-summary">
            <h4>Valuation Results</h4>
            <div class="valuation-overview">
                <div class="valuation-item">
                    <span class="valuation-label">Current Valuation</span>
                    <span class="valuation-amount">₹${result.currentValuation.toLocaleString('en-IN')}</span>
                </div>
                <div class="valuation-item">
                    <span class="valuation-label">Projected Valuation (3 years)</span>
                    <span class="valuation-amount">₹${result.projectedValuation.toLocaleString('en-IN')}</span>
                </div>
                <div class="valuation-item">
                    <span class="valuation-label">Growth Multiple</span>
                    <span class="valuation-multiple">${result.growthMultiple}x</span>
                </div>
                <div class="valuation-item">
                    <span class="valuation-label">Potential ROI</span>
                    <span class="valuation-roi">${result.roi.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
    
    logging.log(`Valuation calculated: Current ₹${result.currentValuation}, Projected ₹${result.projectedValuation}`, 'info', currentUser);
};

// ===== ADVISOR FUNCTIONS =====

window.showAdvisorTab = function(tab) {
    // Hide all advisor content
    document.querySelectorAll('.adv-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.adv-tab').forEach(tabBtn => {
        tabBtn.classList.remove('active');
    });
    
    // Show selected content and activate tab
    document.getElementById(tab + 'Content').classList.add('active');
    event.target.classList.add('active');
    
    if (tab === 'services') {
        loadAdvisorServices();
    } else if (tab === 'myBookings') {
        loadMyBookings();
    }
    
    logging.log(`Switched to advisor tab: ${tab}`, 'info', currentUser);
};

function loadAdvisorServices() {
    const servicesList = document.getElementById('advisorServicesList');
    servicesList.innerHTML = '';
    
    Object.entries(advisor.advisorServices.serviceCategories).forEach(([key, service]) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <div class="service-header">
                <span class="service-icon">${service.icon}</span>
                <h4>${service.name}</h4>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-details">
                <div class="service-rate">
                    <strong>Rate:</strong> ₹${service.hourlyRate.typical.toLocaleString('en-IN')}/hour
                </div>
                <div class="service-expertise">
                    <strong>Expertise:</strong> ${service.expertise.join(', ')}
                </div>
            </div>
            <div class="service-services">
                <h5>Services Offered:</h5>
                <ul>
                    ${service.services.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                    ${service.services.length > 3 ? `<li>+${service.services.length - 3} more services</li>` : ''}
                </ul>
            </div>
            <button class="btn-small" onclick="selectServiceCategory('${key}')">Book Consultation</button>
        `;
        servicesList.appendChild(serviceCard);
    });
}

window.selectServiceCategory = function(category) {
    document.getElementById('serviceCategory').value = category;
    window.showAdvisorTab('book');
    logging.log(`Selected advisor service category: ${category}`, 'info', currentUser);
};

window.updateAdvisorList = function() {
    const category = document.getElementById('serviceCategory').value;
    if (!category) return;
    
    const serviceData = advisor.advisorServices.serviceCategories[category];
    if (!serviceData) return;
    
    // Update consultation type options based on category
    const consultationType = document.getElementById('consultationType');
    consultationType.innerHTML = '<option value="">Select Type</option>';
    
    Object.entries(advisor.advisorServices.consultationTypes).forEach(([key, type]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${type.name} - ${type.description}`;
        consultationType.appendChild(option);
    });
};

window.bookConsultation = function(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert("Please log in to book a consultation.");
        return;
    }
    
    const bookingData = {
        serviceCategory: document.getElementById('serviceCategory').value,
        consultationType: document.getElementById('consultationType').value,
        scheduledDate: document.getElementById('consultationDate').value,
        duration: parseInt(document.getElementById('consultationDuration').value),
        description: document.getElementById('consultationDescription').value,
        budget: parseInt(document.getElementById('budget').value)
    };
    
    const clientNeeds = {
        serviceCategory: bookingData.serviceCategory,
        budget: bookingData.budget,
        urgency: 'normal',
        expertise: [],
        sessionType: bookingData.consultationType
    };
    
    const matchedAdvisors = advisor.matchAdvisorToClient(clientNeeds);
    
    const matchesDiv = document.getElementById('advisorMatches');
    if (matchedAdvisors.length === 0) {
        matchesDiv.innerHTML = '<p>No advisors available for your requirements. Please try different criteria.</p>';
    } else {
        matchesDiv.innerHTML = `
            <h4>Matched Advisors</h4>
            ${matchedAdvisors.map(advisor => `
                <div class="advisor-match">
                    <div class="advisor-info">
                        <h5>${advisor.name}</h5>
                        <p><strong>Expertise:</strong> ${advisor.expertise.join(', ')}</p>
                        <p><strong>Experience:</strong> ${advisor.experience} years</p>
                        <p><strong>Rating:</strong> ${advisor.rating.toFixed(1)}/5.0</p>
                        <p><strong>Hourly Rate:</strong> ₹${advisor.hourlyRate.toLocaleString('en-IN')}</p>
                        <p><strong>Match Score:</strong> ${advisor.matchScore}%</p>
                        <p><strong>Estimated Cost:</strong> ₹${advisor.estimatedCost.toLocaleString('en-IN')}</p>
                    </div>
                    <div class="advisor-actions">
                        <button class="btn-small" onclick="confirmBooking('${advisor.id}', '${advisor.name}')">Book This Advisor</button>
                        <button class="btn-small" onclick="viewAdvisorProfile('${advisor.id}')">View Profile</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
    matchesDiv.style.display = 'block';
    
    logging.log(`Consultation booking search completed with ${matchedAdvisors.length} matches`, 'info', currentUser);
};

window.confirmBooking = function(advisorId, advisorName) {
    if (confirm(`Confirm booking with ${advisorName}?`)) {
        alert('Booking confirmed! The advisor will contact you soon.');
        document.getElementById('advisorMatches').style.display = 'none';
        logging.log(`Consultation booked with advisor: ${advisorName}`, 'info', currentUser);
    }
};

window.viewAdvisorProfile = function(advisorId) {
    // Find the advisor
    const advisor = advisorData.find(a => a.id === advisorId);
    if (!advisor) {
        alert('Advisor not found.');
        return;
    }
    
    // Create modal for advisor profile view
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>${advisor.name} - ${advisorData.serviceCategories[advisor.serviceCategory]?.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="advisor-profile-detail">
                    <div class="advisor-header">
                        <div class="advisor-avatar">
                            <span class="avatar-placeholder">${advisor.name.charAt(0)}</span>
                        </div>
                        <div class="advisor-info">
                            <h4>${advisor.name}</h4>
                            <p class="advisor-title">${advisor.title}</p>
                            <p class="advisor-company">${advisor.company}</p>
                            <div class="advisor-rating">
                                <span class="stars">${'⭐'.repeat(Math.floor(advisor.rating))}${advisor.rating % 1 >= 0.5 ? '⭐' : ''}</span>
                                <span class="rating-text">${advisor.rating.toFixed(1)} (${advisor.reviewCount} reviews)</span>
                            </div>
                        </div>
                        <div class="advisor-actions">
                            <button class="btn" onclick="bookConsultation('${advisor.id}')">Book Consultation</button>
                            <button class="btn-small" onclick="sendMessage('${advisor.id}')">Send Message</button>
                        </div>
                    </div>
                    
                    <div class="advisor-details">
                        <div class="detail-section">
                            <h5>About</h5>
                            <p>${advisor.bio}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Expertise</h5>
                            <div class="expertise-tags">
                                ${advisor.expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Experience</h5>
                            <p>${advisor.experience} years of experience</p>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Services Offered</h5>
                            <div class="services-list">
                                ${advisor.services.map(service => `
                                    <div class="service-item">
                                        <span class="service-name">${service.name}</span>
                                        <span class="service-price">$${service.price}/hour</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Availability</h5>
                            <div class="availability-info">
                                <p>Next available: ${advisor.nextAvailable}</p>
                                <p>Response time: ${advisor.responseTime}</p>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h5>Recent Reviews</h5>
                            <div class="reviews-list">
                                ${generateMockReviews(advisor.id).map(review => `
                                    <div class="review-item">
                                        <div class="review-header">
                                            <span class="reviewer-name">${review.reviewerName}</span>
                                            <span class="review-stars">${'⭐'.repeat(review.rating)}</span>
                                            <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <p class="review-text">${review.comment}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    logging.log(`Viewed advisor profile: ${advisorId}`, 'info', currentUser);
};

function generateMockReviews(advisorId) {
    return [
        {
            id: 'rev_1',
            advisorId: advisorId,
            reviewerName: 'John Smith',
            rating: 5,
            comment: 'Excellent consultation! The advisor provided valuable insights and helped me understand the market better.',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'rev_2',
            advisorId: advisorId,
            reviewerName: 'Sarah Johnson',
            rating: 4,
            comment: 'Very knowledgeable and professional. Would definitely recommend for business strategy advice.',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
}

window.bookConsultation = function(advisorId) {
    if (!currentUser) {
        alert('Please log in to book consultations.');
        return;
    }
    
    const advisor = advisorData.find(a => a.id === advisorId);
    if (!advisor) {
        alert('Advisor not found.');
        return;
    }
    
    const bookingModal = document.createElement('div');
    bookingModal.className = 'modal-overlay';
    bookingModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Book Consultation with ${advisor.name}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form onsubmit="submitBooking(event, '${advisorId}')">
                    <div class="form-group">
                        <label for="serviceType">Service Type:</label>
                        <select id="serviceType" required>
                            ${advisor.services.map(service => 
                                `<option value="${service.name}">${service.name} - $${service.price}/hour</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="consultationDate">Preferred Date:</label>
                        <input type="date" id="consultationDate" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="consultationTime">Preferred Time:</label>
                        <select id="consultationTime" required>
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="consultationDuration">Duration (hours):</label>
                        <select id="consultationDuration" required>
                            <option value="1">1 hour</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="consultationNotes">Notes/Questions:</label>
                        <textarea id="consultationNotes" rows="4" placeholder="Describe what you'd like to discuss..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-small" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn">Book Consultation</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(bookingModal);
};

window.submitBooking = function(event, advisorId) {
    event.preventDefault();
    
    const bookingData = {
        serviceType: document.getElementById('serviceType').value,
        date: document.getElementById('consultationDate').value,
        time: document.getElementById('consultationTime').value,
        duration: parseInt(document.getElementById('consultationDuration').value),
        notes: document.getElementById('consultationNotes').value,
        advisorId: advisorId,
        clientId: currentUser.id,
        clientName: currentUser.name,
        status: 'pending'
    };
    
    // Add booking to advisor module
    const newBooking = advisor.addBooking(bookingData);
    
    alert('Consultation booked successfully! The advisor will contact you to confirm.');
    
    // Close modal
    event.target.closest('.modal-overlay').remove();
    
    logging.log(`Consultation booked: ${advisorId}`, 'info', currentUser);
};

window.sendMessage = function(advisorId) {
    if (!currentUser) {
        alert('Please log in to send messages.');
        return;
    }
    
    alert('Message functionality will be implemented in the messaging system.');
    logging.log(`Message sent to advisor: ${advisorId}`, 'info', currentUser);
};

window.registerAsAdvisor = function(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert("Please log in to register as an advisor.");
        return;
    }
    
    const advisorData = {
        name: document.getElementById('advisorName').value,
        email: document.getElementById('advisorEmail').value,
        phone: document.getElementById('advisorPhone').value,
        expertise: [document.getElementById('advisorExpertise').value],
        experience: document.getElementById('advisorExperience').value,
        level: document.getElementById('advisorExperience').value,
        services: [document.getElementById('advisorExpertise').value],
        availability: ['this_week', 'next_week'],
        specializations: document.getElementById('advisorExpertise').value ? [document.getElementById('advisorExpertise').value] : [],
        certifications: document.getElementById('advisorCertifications').value ? document.getElementById('advisorCertifications').value.split(',').map(c => c.trim()) : [],
        bio: document.getElementById('advisorBio').value,
        profileImage: null
    };
    
    const advisorProfile = advisor.createAdvisorProfile(advisorData);
    
    alert('Advisor registration submitted successfully! Your profile will be reviewed and activated soon.');
    
    // Clear form
    document.getElementById('advisorName').value = '';
    document.getElementById('advisorEmail').value = '';
    document.getElementById('advisorPhone').value = '';
    document.getElementById('advisorExpertise').value = '';
    document.getElementById('advisorExperience').value = '';
    document.getElementById('advisorBio').value = '';
    document.getElementById('advisorCertifications').value = '';
    
    logging.log(`Advisor registration submitted for: ${advisorData.name}`, 'info', currentUser);
};

function loadMyBookings() {
    const bookingsList = document.getElementById('myBookingsList');
    bookingsList.innerHTML = '<p>Your consultation bookings will appear here.</p>';
    logging.log('Loaded my bookings section', 'info', currentUser);
}

// ===== QUERIES FUNCTIONS =====

window.showQueriesTab = function(tab) {
    // Hide all queries content
    document.querySelectorAll('.qry-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.qry-tab').forEach(tabBtn => {
        tabBtn.classList.remove('active');
    });
    
    // Show selected content and activate tab
    document.getElementById(tab + 'Content').classList.add('active');
    event.target.classList.add('active');
    
    if (tab === 'browse') {
        loadQueriesList();
    } else if (tab === 'knowledge') {
        loadKnowledgeBase();
    } else if (tab === 'myQueries') {
        loadMyQueries();
    }
    
    logging.log(`Switched to queries tab: ${tab}`, 'info', currentUser);
};

window.submitQuery = function(event) {
    event.preventDefault();
    
    if (!currentUser) {
        alert("Please log in to submit a question.");
        return;
    }
    
    const queryData = {
        title: document.getElementById('queryTitle').value,
        description: document.getElementById('queryDescription').value,
        category: document.getElementById('queryCategory').value,
        tags: document.getElementById('queryTags').value ? document.getElementById('queryTags').value.split(',').map(t => t.trim()) : [],
        urgency: document.getElementById('queryUrgency').value,
        expertRequested: document.getElementById('expertRequested').checked,
        isAnonymous: document.getElementById('anonymousQuery').checked,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorType: currentUser.userType
    };
    
    const newQuery = queries.createQuery(queryData);
    
    alert('Question submitted successfully! You will be notified when someone responds.');
    
    // Clear form
    document.getElementById('queryTitle').value = '';
    document.getElementById('queryDescription').value = '';
    document.getElementById('queryCategory').value = '';
    document.getElementById('queryTags').value = '';
    document.getElementById('queryUrgency').value = 'normal';
    document.getElementById('expertRequested').checked = false;
    document.getElementById('anonymousQuery').checked = false;
    
    logging.log(`Query submitted: ${queryData.title}`, 'info', currentUser);
};

window.searchQueries = function() {
    const keyword = document.getElementById('querySearch').value;
    const category = document.getElementById('queryCategoryFilter').value;
    const status = document.getElementById('queryStatusFilter').value;
    
    const searchCriteria = { keyword, category, status };
    const results = queries.searchQueries(searchCriteria);
    
    displayQueriesList(results);
};

function loadQueriesList() {
    const results = queries.searchQueries({});
    displayQueriesList(results);
}

function displayQueriesList(queriesList) {
    const queriesContainer = document.getElementById('queriesList');
    queriesContainer.innerHTML = '';
    
    if (queriesList.length === 0) {
        queriesContainer.innerHTML = '<p>No questions found matching your criteria.</p>';
        return;
    }
    
    queriesList.forEach(query => {
        const queryCard = document.createElement('div');
        queryCard.className = 'query-card';
        queryCard.innerHTML = `
            <div class="query-header">
                <h4>${query.title}</h4>
                <span class="query-status" style="color: ${queries.queryStatus[query.status].color}">${queries.queryStatus[query.status].name}</span>
            </div>
            <p class="query-description">${query.description}</p>
            <div class="query-meta">
                <span class="query-category">${queries.queryCategories[query.category]?.icon} ${queries.queryCategories[query.category]?.name}</span>
                <span class="query-author">by ${query.authorName}</span>
                <span class="query-date">${new Date(query.createdAt).toLocaleDateString()}</span>
                <span class="query-views">${query.views} views</span>
                <span class="query-responses">${query.responses} responses</span>
            </div>
            <div class="query-actions">
                <button class="btn-small" onclick="viewQuery('${query.id}')">View Question</button>
                ${query.expertRequested ? '<span class="expert-badge">👨‍💼 Expert Requested</span>' : ''}
            </div>
        `;
        queriesContainer.appendChild(queryCard);
    });
}

window.viewQuery = function(queryId) {
    // Find the query
    const query = queries.searchQueries({}).find(q => q.id === queryId);
    if (!query) {
        alert('Query not found.');
        return;
    }
    
    // Create modal for query detail view
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${query.title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="query-detail">
                    <div class="query-meta-detail">
                        <span class="query-category">${queries.queryCategories[query.category]?.icon} ${queries.queryCategories[query.category]?.name}</span>
                        <span class="query-author">by ${query.authorName}</span>
                        <span class="query-date">${new Date(query.createdAt).toLocaleDateString()}</span>
                        <span class="query-views">${query.views} views</span>
                        <span class="query-responses">${query.responses} responses</span>
                        <span class="query-status" style="color: ${queries.queryStatus[query.status].color}">${queries.queryStatus[query.status].name}</span>
                    </div>
                    
                    <div class="query-description-detail">
                        <h4>Question Details</h4>
                        <p>${query.description}</p>
                    </div>
                    
                    <div class="query-tags">
                        <h4>Tags</h4>
                        <div class="tag-list">
                            ${query.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="query-actions-detail">
                        <button class="btn-small" onclick="upvoteQuery('${query.id}')">👍 Upvote (${query.upvotes})</button>
                        <button class="btn-small" onclick="addResponseToQuery('${query.id}')">💬 Add Response</button>
                        ${query.expertRequested ? '<span class="expert-badge">👨‍💼 Expert Response Requested</span>' : ''}
                    </div>
                    
                    <div class="responses-section">
                        <h4>Responses (${query.responses})</h4>
                        <div id="responsesList">
                            ${generateMockResponses(query.id).map(response => `
                                <div class="response-item">
                                    <div class="response-header">
                                        <span class="response-author">${response.authorName}</span>
                                        <span class="response-type" style="background-color: ${queries.responseTypes[response.responseType].color}">${queries.responseTypes[response.responseType].badge}</span>
                                        <span class="response-date">${new Date(response.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div class="response-content">
                                        <p>${response.content}</p>
                                    </div>
                                    <div class="response-actions">
                                        <button class="btn-small" onclick="markResponseAsHelpful('${response.id}')">👍 Helpful (${response.helpfulCount})</button>
                                        ${!response.isAccepted ? `<button class="btn-small" onclick="acceptResponse('${response.id}', '${query.id}')">✅ Accept Answer</button>` : '<span class="accepted-badge">✅ Accepted Answer</span>'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    logging.log(`Viewed query detail: ${queryId}`, 'info', currentUser);
};

function generateMockResponses(queryId) {
    const mockResponses = [
        {
            id: 'resp_1',
            queryId: queryId,
            content: 'This is a comprehensive answer to your question. Based on my experience in this field, I would recommend focusing on the following key areas...',
            authorId: 'expert_1',
            authorName: 'Dr. Sarah Johnson',
            authorType: 'expert',
            responseType: 'expert',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            helpfulCount: 8,
            isAccepted: false
        },
        {
            id: 'resp_2',
            queryId: queryId,
            content: 'Great question! Here\'s my perspective on this topic. I\'ve worked with similar situations and found that...',
            authorId: 'user_2',
            authorName: 'Rajesh Kumar',
            authorType: 'entrepreneur',
            responseType: 'community',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            helpfulCount: 5,
            isAccepted: false
        }
    ];
    
    return mockResponses;
}

window.addResponseToQuery = function(queryId) {
    const responseModal = document.createElement('div');
    responseModal.className = 'modal-overlay';
    responseModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add Response</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form onsubmit="submitResponse(event, '${queryId}')">
                    <div class="form-group">
                        <label for="responseContent">Your Response:</label>
                        <textarea id="responseContent" rows="6" required placeholder="Provide a detailed and helpful response..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="responseType">Response Type:</label>
                        <select id="responseType" required>
                            <option value="community">Community Response</option>
                            ${currentUser && currentUser.userType === 'expert' ? '<option value="expert">Expert Response</option>' : ''}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="responseReferences">References (optional):</label>
                        <input type="text" id="responseReferences" placeholder="Add any references or sources">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-small" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn">Submit Response</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(responseModal);
};

window.submitResponse = function(event, queryId) {
    event.preventDefault();
    
    if (!currentUser) {
        alert("Please log in to submit a response.");
        return;
    }
    
    const responseData = {
        content: document.getElementById('responseContent').value,
        responseType: document.getElementById('responseType').value,
        references: document.getElementById('responseReferences').value ? [document.getElementById('responseReferences').value] : [],
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorType: currentUser.userType,
        authorExpertise: [],
        isVerified: currentUser.userType === 'expert'
    };
    
    const newResponse = queries.addResponse(queryId, responseData);
    
    alert('Response submitted successfully!');
    
    // Close modal and refresh query view
    event.target.closest('.modal-overlay').remove();
    window.viewQuery(queryId);
    
    logging.log(`Response submitted for query: ${queryId}`, 'info', currentUser);
};

window.searchKnowledge = function() {
    const keyword = document.getElementById('knowledgeSearch').value;
    const category = document.getElementById('knowledgeCategoryFilter').value;
    
    const searchCriteria = { keyword, category };
    const results = queries.searchKnowledgeBase(searchCriteria);
    
    displayKnowledgeList(results);
};

function loadKnowledgeBase() {
    const results = queries.searchKnowledgeBase({});
    displayKnowledgeList(results);
}

function displayKnowledgeList(articles) {
    const knowledgeContainer = document.getElementById('knowledgeList');
    knowledgeContainer.innerHTML = '';
    
    if (articles.length === 0) {
        knowledgeContainer.innerHTML = '<p>No knowledge base articles found.</p>';
        return;
    }
    
    articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.innerHTML = `
            <div class="article-header">
                <h4>${article.title}</h4>
                <span class="article-difficulty">${article.difficulty}</span>
            </div>
            <p class="article-content">${article.content}</p>
            <div class="article-meta">
                <span class="article-category">${queries.queryCategories[article.category]?.icon} ${queries.queryCategories[article.category]?.name}</span>
                <span class="article-author">by ${article.authorName}</span>
                <span class="article-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                <span class="article-views">${article.views} views</span>
                <span class="article-helpful">${article.helpfulCount} helpful</span>
                <span class="article-reading-time">${article.readingTime} min read</span>
            </div>
            <div class="article-actions">
                <button class="btn-small" onclick="viewArticle('${article.id}')">Read Article</button>
            </div>
        `;
        knowledgeContainer.appendChild(articleCard);
    });
}

window.viewArticle = function(articleId) {
    // Find the article
    const article = queries.searchKnowledgeBase({}).find(a => a.id === articleId);
    if (!article) {
        alert('Article not found.');
        return;
    }
    
    // Create modal for article detail view
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>${article.title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="article-detail">
                    <div class="article-meta-detail">
                        <span class="article-category">${queries.queryCategories[article.category]?.icon} ${queries.queryCategories[article.category]?.name}</span>
                        <span class="article-author">by ${article.authorName}</span>
                        <span class="article-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                        <span class="article-views">${article.views} views</span>
                        <span class="article-helpful">${article.helpfulCount} helpful</span>
                        <span class="article-reading-time">${article.readingTime} min read</span>
                        <span class="article-difficulty">${article.difficulty}</span>
                    </div>
                    
                    <div class="article-content-detail">
                        <div class="article-full-content">
                            ${article.content}
                        </div>
                    </div>
                    
                    <div class="article-actions-detail">
                        <button class="btn-small" onclick="markArticleHelpful('${article.id}')">👍 Helpful (${article.helpfulCount})</button>
                        <button class="btn-small" onclick="markArticleNotHelpful('${article.id}')">👎 Not Helpful (${article.notHelpfulCount || 0})</button>
                        <button class="btn-small" onclick="shareArticle('${article.id}')">📤 Share</button>
                        <button class="btn-small" onclick="bookmarkArticle('${article.id}')">🔖 Bookmark</button>
                    </div>
                    
                    <div class="related-articles">
                        <h4>Related Articles</h4>
                        <div class="related-articles-list">
                            ${generateRelatedArticles(article.category).map(related => `
                                <div class="related-article-item" onclick="viewArticle('${related.id}')">
                                    <h5>${related.title}</h5>
                                    <p>${related.content.substring(0, 100)}...</p>
                                    <span class="related-article-meta">${related.readingTime} min read • ${related.views} views</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    logging.log(`Viewed article detail: ${articleId}`, 'info', currentUser);
};

function generateRelatedArticles(category) {
    const allArticles = queries.searchKnowledgeBase({});
    return allArticles
        .filter(article => article.category === category)
        .slice(0, 3)
        .map(article => ({
            ...article,
            id: article.id + '_related'
        }));
}

window.markArticleHelpful = function(articleId) {
    alert('Article marked as helpful!');
    logging.log(`Article marked helpful: ${articleId}`, 'info', currentUser);
};

window.markArticleNotHelpful = function(articleId) {
    alert('Article marked as not helpful!');
    logging.log(`Article marked not helpful: ${articleId}`, 'info', currentUser);
};

window.shareArticle = function(articleId) {
    const article = queries.searchKnowledgeBase({}).find(a => a.id === articleId);
    if (article && navigator.share) {
        navigator.share({
            title: article.title,
            text: article.content.substring(0, 200) + '...',
            url: window.location.href
        });
    } else {
        alert('Share functionality not available in this browser.');
    }
    logging.log(`Article shared: ${articleId}`, 'info', currentUser);
};

window.bookmarkArticle = function(articleId) {
    alert('Article bookmarked!');
    logging.log(`Article bookmarked: ${articleId}`, 'info', currentUser);
};

window.upvoteQuery = function(queryId) {
    if (!currentUser) {
        alert('Please log in to upvote queries.');
        return;
    }
    
    const query = queries.searchQueries({}).find(q => q.id === queryId);
    if (query) {
        query.upvotes = (query.upvotes || 0) + 1;
        alert('Query upvoted!');
        logging.log(`Query upvoted: ${queryId}`, 'info', currentUser);
    }
};

window.markResponseAsHelpful = function(responseId) {
    if (!currentUser) {
        alert('Please log in to mark responses as helpful.');
        return;
    }
    
    alert('Response marked as helpful!');
    logging.log(`Response marked helpful: ${responseId}`, 'info', currentUser);
};

window.acceptResponse = function(responseId, queryId) {
    if (!currentUser) {
        alert('Please log in to accept responses.');
        return;
    }
    
    const query = queries.searchQueries({}).find(q => q.id === queryId);
    if (query && query.authorId === currentUser.id) {
        // Mark response as accepted
        alert('Response accepted as the best answer!');
        logging.log(`Response accepted: ${responseId} for query: ${queryId}`, 'info', currentUser);
    } else {
        alert('Only the query author can accept responses.');
    }
};

function loadMyQueries() {
    const myQueriesContainer = document.getElementById('myQueriesList');
    myQueriesContainer.innerHTML = '<p>Your submitted questions will appear here.</p>';
    logging.log('Loaded my queries section', 'info', currentUser);
}

// Initialize risk assessment sliders
document.addEventListener('DOMContentLoaded', () => {
    const riskSliders = ['marketRisk', 'technologyRisk', 'teamRisk', 'financialRisk', 'operationalRisk'];
    
    riskSliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueSpan = document.getElementById(sliderId + 'Value');
        
        if (slider && valueSpan) {
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value + '%';
            });
        }
    });
}); 