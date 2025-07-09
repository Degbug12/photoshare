class PhotoShareApp {
    constructor() {
        this.stream = null;
        this.photos = [];
        this.sharedPhotos = [];
        this.currentPhotoIndex = null;
        this.isAdmin = false;
        this.timerInterval = null;
        this.sessionExpiration = null;
        this.stealthMode = false;
        this.decoyActive = false;
        
        // Admin credentials (in production, use secure authentication)
        this.adminCredentials = {
            username: 'admin',
            password: 'secure123'
        };
        
        this.initializeElements();
        this.checkAdminStatus();
        this.bindEvents();
        this.loadSharedPhotos();
        this.cleanupExpiredSessions();
    }

    initializeElements() {
        // Camera elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.startCameraBtn = document.getElementById('startCamera');
        this.takePhotoBtn = document.getElementById('takePhoto');
        this.stopCameraBtn = document.getElementById('stopCamera');
        
        // Gallery elements
        this.photoGallery = document.getElementById('photoGallery');
        this.sharedGallery = document.getElementById('sharedGallery');
        
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        
        // Share elements
        this.generateLinkBtn = document.getElementById('generateLink');
        this.shareLink = document.getElementById('shareLink');
        this.linkInput = document.getElementById('linkInput');
        this.copyLinkBtn = document.getElementById('copyLink');
        
        // Modal elements
        this.modal = document.getElementById('photoModal');
        this.modalImage = document.getElementById('modalImage');
        this.sharePhotoBtn = document.getElementById('sharePhoto');
        this.deletePhotoBtn = document.getElementById('deletePhoto');
        this.closeModal = document.querySelector('.close');
        
        // Admin elements
        this.adminModal = document.getElementById('adminModal');
        this.adminUsername = document.getElementById('adminUsername');
        this.adminPassword = document.getElementById('adminPassword');
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.loginError = document.getElementById('loginError');
        this.adminStatus = document.getElementById('adminStatus');
        
        // Timer elements
        this.expirationTimer = document.getElementById('expirationTimer');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.hoursLeft = document.getElementById('hoursLeft');
        this.minutesLeft = document.getElementById('minutesLeft');
        this.secondsLeft = document.getElementById('secondsLeft');
        
        // Admin control elements
        this.clearAllSessionsBtn = document.getElementById('clearAllSessions');
        this.viewActiveSessionsBtn = document.getElementById('viewActiveSessions');
        this.sessionCount = document.getElementById('sessionCount');
        
        // Stealth mode elements
        this.createStealthControls();
    }

    bindEvents() {
        // Camera controls
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.takePhotoBtn.addEventListener('click', () => this.takePhoto());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Share controls
        this.generateLinkBtn.addEventListener('click', () => this.generateShareLink());
        this.copyLinkBtn.addEventListener('click', () => this.copyShareLink());
        
        // Modal controls
        this.sharePhotoBtn.addEventListener('click', () => this.shareCurrentPhoto());
        this.deletePhotoBtn.addEventListener('click', () => this.deleteCurrentPhoto());
        this.closeModal.addEventListener('click', () => this.closePhotoModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closePhotoModal();
        });
        
        // Admin authentication
        this.loginBtn.addEventListener('click', () => this.authenticateAdmin());
        this.logoutBtn.addEventListener('click', () => this.logoutAdmin());
        this.adminUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.authenticateAdmin();
        });
        this.adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.authenticateAdmin();
        });
        
        // Admin controls
        this.clearAllSessionsBtn.addEventListener('click', () => this.clearAllSessions());
        this.viewActiveSessionsBtn.addEventListener('click', () => this.viewActiveSessions());
        
        // Stealth mode controls
        this.bindStealthEvents();
        
        // Handle shared photo parameter
        this.handleSharedPhotoParam();
    }

    async startCamera() {
        try {
            // Add body class for camera active state
            document.body.classList.add('camera-active');
            
            // Request camera permission with minimal constraints to reduce notifications
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    // Additional constraints to minimize notifications
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                },
                audio: false  // Explicitly disable audio to avoid microphone notifications
            });
            
            this.video.srcObject = this.stream;
            
            // Set video attributes to hide controls and indicators
            this.video.controls = false;
            this.video.muted = true;
            this.video.disablePictureInPicture = true;
            this.video.setAttribute('playsinline', true);
            this.video.setAttribute('webkit-playsinline', true);
            
            // Update UI
            this.startCameraBtn.style.display = 'none';
            this.takePhotoBtn.style.display = 'inline-flex';
            this.stopCameraBtn.style.display = 'inline-flex';
            
            // Hide any camera indicators after a short delay
            setTimeout(() => {
                this.hideCameraIndicators();
            }, 500);
            
            this.showNotification('Camera started discreetly', 'success');
        } catch (error) {
            console.error('Error accessing camera:', error);
            document.body.classList.remove('camera-active');
            this.showNotification('Failed to access camera. Please grant permission.', 'error');
        }
    }

    takePhoto() {
        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(this.video, 0, 0);
        
        // Convert to blob and add to photos
        this.canvas.toBlob((blob) => {
            const photoData = {
                id: Date.now(),
                blob: blob,
                url: URL.createObjectURL(blob),
                timestamp: new Date().toISOString(),
                type: 'camera'
            };
            
            this.photos.push(photoData);
            this.updatePhotoGallery();
            this.showNotification('Photo captured!', 'success');
        }, 'image/jpeg', 0.8);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        
        // Remove camera active class
        document.body.classList.remove('camera-active');
        
        // Clear indicator hiding interval
        this.clearIndicatorInterval();
        
        // Update UI
        this.startCameraBtn.style.display = 'inline-flex';
        this.takePhotoBtn.style.display = 'none';
        this.stopCameraBtn.style.display = 'none';
        
        this.showNotification('Camera stopped', 'info');
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.style.background = 'rgba(102, 126, 234, 0.1)';
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.style.background = '';
        
        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            this.processFiles(imageFiles);
        } else {
            this.showNotification('Please drop image files only', 'error');
        }
    }

    processFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const photoData = {
                    id: Date.now() + Math.random(),
                    blob: file,
                    url: URL.createObjectURL(file),
                    timestamp: new Date().toISOString(),
                    type: 'upload',
                    name: file.name
                };
                
                this.photos.push(photoData);
            }
        });
        
        this.updatePhotoGallery();
        this.showNotification(`${files.length} photo(s) added!`, 'success');
    }

    updatePhotoGallery() {
        if (this.photos.length === 0) {
            this.photoGallery.innerHTML = '<p class="no-photos">No photos taken yet. Use the camera above to take photos.</p>';
            return;
        }

        this.photoGallery.innerHTML = '';
        
        this.photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.url}" alt="Photo ${index + 1}">
                <div class="photo-overlay">
                    <i class="fas fa-eye"></i> View
                </div>
            `;
            
            photoItem.addEventListener('click', () => this.openPhotoModal(index));
            this.photoGallery.appendChild(photoItem);
        });
    }

    openPhotoModal(index) {
        this.currentPhotoIndex = index;
        const photo = this.photos[index];
        
        this.modalImage.src = photo.url;
        this.modal.style.display = 'block';
    }

    closePhotoModal() {
        this.modal.style.display = 'none';
        this.currentPhotoIndex = null;
    }

    shareCurrentPhoto() {
        if (this.currentPhotoIndex === null) return;
        
        const photo = this.photos[this.currentPhotoIndex];
        
        if (!this.sharedPhotos.find(p => p.id === photo.id)) {
            this.sharedPhotos.push({...photo});
            this.updateSharedGallery();
            this.saveSharedPhotos();
            this.showNotification('Photo shared!', 'success');
        } else {
            this.showNotification('Photo already shared', 'info');
        }
        
        this.closePhotoModal();
    }

    deleteCurrentPhoto() {
        if (this.currentPhotoIndex === null) return;
        
        const photo = this.photos[this.currentPhotoIndex];
        
        // Remove from photos array
        this.photos.splice(this.currentPhotoIndex, 1);
        
        // Remove from shared photos if it exists
        this.sharedPhotos = this.sharedPhotos.filter(p => p.id !== photo.id);
        
        // Clean up object URL
        URL.revokeObjectURL(photo.url);
        
        this.updatePhotoGallery();
        this.updateSharedGallery();
        this.saveSharedPhotos();
        this.closePhotoModal();
        
        this.showNotification('Photo deleted', 'info');
    }

    updateSharedGallery() {
        if (this.sharedPhotos.length === 0) {
            this.sharedGallery.innerHTML = '<p class="no-shared">No photos shared yet.</p>';
            return;
        }

        this.sharedGallery.innerHTML = '';
        
        this.sharedPhotos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.url}" alt="Shared Photo ${index + 1}">
                <div class="photo-overlay">
                    <i class="fas fa-share"></i> Shared
                </div>
            `;
            
            this.sharedGallery.appendChild(photoItem);
        });
    }


    copyShareLink() {
        this.linkInput.select();
        document.execCommand('copy');
        this.showNotification('Link copied to clipboard!', 'success');
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    handleSharedPhotoParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session');
        
        if (sessionId) {
            this.loadSharedSession(sessionId);
        }
    }

    loadSharedSession(sessionId) {
        const sessionData = localStorage.getItem(`session_${sessionId}`);
        
        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                
                // Display shared photos
                this.displaySharedSession(data);
                
                // Hide camera and upload sections for viewers
                document.querySelector('.camera-section').style.display = 'none';
                document.querySelector('.upload-section').style.display = 'none';
                document.querySelector('.gallery-section').style.display = 'none';
                
                // Update header
                document.querySelector('header h1').innerHTML = '<i class="fas fa-images"></i> Shared Photos';
                document.querySelector('header p').textContent = 'View shared photos from this session';
                
            } catch (error) {
                console.error('Error loading shared session:', error);
                this.showNotification('Invalid share link', 'error');
            }
        } else {
            this.showNotification('Share link expired or invalid', 'error');
        }
    }

    displaySharedSession(data) {
        const sharedSection = document.querySelector('.shared-section');
        sharedSection.innerHTML = `
            <h3>Shared Photos (${data.photos.length})</h3>
            <p>Shared on: ${new Date(data.createdAt).toLocaleString()}</p>
            <div class="shared-gallery" id="sessionGallery"></div>
        `;
        
        const sessionGallery = document.getElementById('sessionGallery');
        
        data.photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.url}" alt="${photo.name || 'Shared Photo'} ${index + 1}">
                <div class="photo-overlay">
                    <i class="fas fa-download"></i> View
                </div>
            `;
            
            photoItem.addEventListener('click', () => {
                window.open(photo.url, '_blank');
            });
            
            sessionGallery.appendChild(photoItem);
        });
    }

    saveSharedPhotos() {
        // Save to localStorage for persistence
        const photoData = this.sharedPhotos.map(photo => ({
            id: photo.id,
            url: photo.url,
            timestamp: photo.timestamp,
            type: photo.type,
            name: photo.name
        }));
        
        localStorage.setItem('sharedPhotos', JSON.stringify(photoData));
    }

    loadSharedPhotos() {
        const savedPhotos = localStorage.getItem('sharedPhotos');
        if (savedPhotos) {
            try {
                this.sharedPhotos = JSON.parse(savedPhotos);
                this.updateSharedGallery();
            } catch (error) {
                console.error('Error loading shared photos:', error);
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '300px',
            animation: 'slideIn 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        return colors[type] || '#17a2b8';
    }

    // Admin Authentication Methods
    checkAdminStatus() {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                const now = new Date().getTime();
                const sessionTime = new Date(session.timestamp).getTime();
                
                // Check if admin session is still valid (24 hours)
                if (now - sessionTime < 24 * 60 * 60 * 1000) {
                    this.isAdmin = true;
                    this.showAdminInterface();
                    return;
                }
            } catch (error) {
                console.error('Invalid admin session:', error);
            }
        }
        
        // Show login modal if not admin
        this.showAdminLogin();
    }

    showAdminLogin() {
        this.adminModal.style.display = 'block';
        // Hide main content
        document.querySelector('main').style.filter = 'blur(5px)';
        document.querySelector('main').style.pointerEvents = 'none';
    }

    authenticateAdmin() {
        const username = this.adminUsername.value;
        const password = this.adminPassword.value;
        
        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            
            this.isAdmin = true;
            
            // Store admin session
            localStorage.setItem('adminSession', JSON.stringify({
                timestamp: new Date().toISOString(),
                username: username
            }));
            
            this.showAdminInterface();
            this.adminModal.style.display = 'none';
            document.querySelector('main').style.filter = 'none';
            document.querySelector('main').style.pointerEvents = 'auto';
            
            this.showNotification('Admin login successful!', 'success');
            this.startSessionTimer();
            
        } else {
            this.loginError.style.display = 'flex';
            this.showNotification('Invalid admin credentials', 'error');
        }
        
        // Clear password field
        this.adminPassword.value = '';
    }

    showAdminInterface() {
        this.adminStatus.style.display = 'flex';
        this.updateSessionCount();
    }

    logoutAdmin() {
        this.isAdmin = false;
        localStorage.removeItem('adminSession');
        this.adminStatus.style.display = 'none';
        
        // Clear all data
        this.clearAllSessions();
        this.photos = [];
        this.sharedPhotos = [];
        this.updatePhotoGallery();
        this.updateSharedGallery();
        
        // Stop camera if active
        this.stopCamera();
        
        // Show login modal
        this.showAdminLogin();
        
        this.showNotification('Admin logged out', 'info');
    }

    // 24-Hour Expiration System
    generateShareLink() {
        if (!this.isAdmin) {
            this.showNotification('Admin access required to generate links', 'error');
            return;
        }
        
        if (this.sharedPhotos.length === 0) {
            this.showNotification('No photos to share. Add some photos first!', 'error');
            return;
        }

        // Generate unique session ID
        const sessionId = this.generateSessionId();
        const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Create shareable URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
        
        this.linkInput.value = shareUrl;
        this.shareLink.style.display = 'flex';
        
        // Store session data with expiration
        const sessionData = {
            photos: this.sharedPhotos.map(photo => ({
                id: photo.id,
                url: photo.url,
                timestamp: photo.timestamp,
                type: photo.type,
                name: photo.name || 'Photo'
            })),
            createdAt: new Date().toISOString(),
            expiresAt: expirationTime.toISOString(),
            adminSession: true
        };
        
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
        
        // Start timer for this session
        this.sessionExpiration = expirationTime;
        this.startExpirationTimer();
        
        this.showNotification('24-hour share link generated!', 'success');
        this.updateSessionCount();
    }

    startExpirationTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.expirationTimer.style.display = 'block';
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        if (!this.sessionExpiration) return;
        
        const now = new Date().getTime();
        const expiration = new Date(this.sessionExpiration).getTime();
        const timeLeft = expiration - now;
        
        if (timeLeft <= 0) {
            this.expireSession();
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        this.hoursLeft.textContent = hours.toString().padStart(2, '0');
        this.minutesLeft.textContent = minutes.toString().padStart(2, '0');
        this.secondsLeft.textContent = seconds.toString().padStart(2, '0');
    }

    expireSession() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.expirationTimer.style.display = 'none';
        this.clearAllSessions();
        this.showNotification('24-hour session expired. All photos deleted for security.', 'warning');
    }

    startSessionTimer() {
        // Start 24-hour countdown for admin session
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                const sessionStart = new Date(session.timestamp).getTime();
                const sessionEnd = sessionStart + (24 * 60 * 60 * 1000);
                this.sessionExpiration = new Date(sessionEnd);
                this.startExpirationTimer();
            } catch (error) {
                console.error('Error starting session timer:', error);
            }
        }
    }

    cleanupExpiredSessions() {
        const now = new Date().getTime();
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('session_')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key));
                    if (sessionData.expiresAt) {
                        const expiration = new Date(sessionData.expiresAt).getTime();
                        if (now > expiration) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // Remove corrupted session data
                    localStorage.removeItem(key);
                }
            }
        });
        
        this.updateSessionCount();
    }

    // Admin Control Methods
    clearAllSessions() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('session_')) {
                localStorage.removeItem(key);
            }
        });
        
        localStorage.removeItem('sharedPhotos');
        this.sharedPhotos = [];
        this.updateSharedGallery();
        this.updateSessionCount();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.expirationTimer.style.display = 'none';
        
        this.showNotification('All sessions cleared', 'info');
    }

    updateSessionCount() {
        const keys = Object.keys(localStorage);
        const sessionCount = keys.filter(key => key.startsWith('session_')).length;
        this.sessionCount.textContent = sessionCount;
    }

    viewActiveSessions() {
        const keys = Object.keys(localStorage);
        const sessions = keys.filter(key => key.startsWith('session_'));
        
        if (sessions.length === 0) {
            this.showNotification('No active sessions', 'info');
            return;
        }
        
        let sessionInfo = `Active Sessions (${sessions.length}):\n\n`;
        
        sessions.forEach((key, index) => {
            try {
                const sessionData = JSON.parse(localStorage.getItem(key));
                const sessionId = key.replace('session_', '');
                const photoCount = sessionData.photos ? sessionData.photos.length : 0;
                const created = new Date(sessionData.createdAt).toLocaleString();
                const expires = sessionData.expiresAt ? 
                    new Date(sessionData.expiresAt).toLocaleString() : 'No expiration';
                
                sessionInfo += `${index + 1}. Session: ${sessionId.substring(0, 8)}...\n`;
                sessionInfo += `   Photos: ${photoCount}\n`;
                sessionInfo += `   Created: ${created}\n`;
                sessionInfo += `   Expires: ${expires}\n\n`;
            } catch (error) {
                sessionInfo += `${index + 1}. Corrupted session\n\n`;
            }
        });
        
        alert(sessionInfo);
    }

    // Camera Stealth Methods
    hideCameraIndicators() {
        // Hide browser camera indicators
        const indicators = document.querySelectorAll(
            '.camera-indicator, .recording-indicator, .media-indicator, ' +
            '.permission-indicator, .status-bar-notification, ' +
            '.camera-notification, .media-notification'
        );
        
        indicators.forEach(indicator => {
            if (indicator) {
                indicator.style.display = 'none';
                indicator.style.opacity = '0';
                indicator.style.visibility = 'hidden';
            }
        });
        
        // Hide any dynamically created indicators
        setTimeout(() => {
            this.hideSystemIndicators();
        }, 1000);
        
        // Continuously hide indicators while camera is active
        if (this.stream) {
            this.indicatorHideInterval = setInterval(() => {
                this.hideSystemIndicators();
            }, 2000);
        }
    }
    
    hideSystemIndicators() {
        // Target common mobile browser notification classes
        const selectors = [
            '[class*="camera"]',
            '[class*="recording"]', 
            '[class*="media"]',
            '[class*="permission"]',
            '[class*="notification"]',
            '[id*="camera"]',
            '[id*="recording"]',
            '[id*="media"]'
        ];
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el && el !== this.video && !el.closest('.container')) {
                        el.style.display = 'none !important';
                        el.style.opacity = '0 !important';
                        el.style.visibility = 'hidden !important';
                    }
                });
            } catch (error) {
                // Ignore selector errors
            }
        });
        
        // Hide status bar on mobile if possible
        if (window.innerHeight < window.innerWidth) {
            // Landscape mode - try to hide status bar
            document.documentElement.requestFullscreen?.();
        }
    }
    
    clearIndicatorInterval() {
        if (this.indicatorHideInterval) {
            clearInterval(this.indicatorHideInterval);
            this.indicatorHideInterval = null;
        }
    }

    createStealthControls() {
        const stealthToggle = document.createElement('button');
        stealthToggle.id = 'stealthToggle';
        stealthToggle.className = 'btn';
        stealthToggle.innerHTML = 'Toggle Stealth Mode';
        stealthToggle.onclick = () => {
            document.body.classList.toggle('stealth-active');
            alert('Stealth mode toggled');
        };
        document.body.appendChild(stealthToggle);
    }

    bindStealthEvents() {
        const stealthToggle = document.getElementById('stealthToggle');
        if (stealthToggle) stealthToggle.addEventListener('click', () => this.toggleStealth());
    }

    toggleStealth() {
        document.body.classList.toggle('stealth-active');
        this.showNotification('Stealth mode toggled', this.isStealthMode ? 'success' : 'info');
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoShareApp();
});
