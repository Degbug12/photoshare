class AdminDashboard {
    constructor() {
        this.isMonitoring = false;
        this.charts = {};
        this.currentSection = 'overview';
        this.refreshInterval = null;
        this.monitoringInterval = null;
        this.photoShareApp = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeCharts();
        this.loadData();
        this.startRealTimeUpdates();
        this.logActivity('Admin dashboard initialized');
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Overview section
        document.getElementById('refreshOverview').addEventListener('click', () => {
            this.refreshOverview();
        });

        // Sessions section
        document.getElementById('terminateAll').addEventListener('click', () => {
            this.confirmAction('Terminate all active sessions?', () => {
                this.terminateAllSessions();
            });
        });

        document.getElementById('refreshSessions').addEventListener('click', () => {
            this.refreshSessions();
        });

        // Photos section
        document.getElementById('bulkDelete').addEventListener('click', () => {
            this.confirmAction('Delete all selected photos?', () => {
                this.bulkDeletePhotos();
            });
        });

        document.getElementById('refreshPhotos').addEventListener('click', () => {
            this.refreshPhotos();
        });

        // Monitoring section
        document.getElementById('toggleMonitoring').addEventListener('click', () => {
            this.toggleMonitoring();
        });

        // Security section
        document.getElementById('changePassword').addEventListener('click', () => {
            this.changePassword();
        });

        document.getElementById('updateTimeout').addEventListener('click', () => {
            this.updateTimeout();
        });

        // Emergency controls
        document.getElementById('emergencyStop').addEventListener('click', () => {
            this.emergencyStop();
        });

        document.getElementById('wipeAll').addEventListener('click', () => {
            this.confirmAction('PERMANENTLY DELETE ALL DATA? This cannot be undone!', () => {
                this.wipeAllData();
            });
        });

        // Modal events
        document.getElementById('confirmYes').addEventListener('click', () => {
            this.executeConfirmedAction();
        });

        document.getElementById('confirmNo').addEventListener('click', () => {
            this.closeModal();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'overview':
                this.refreshOverview();
                break;
            case 'sessions':
                this.refreshSessions();
                break;
            case 'photos':
                this.refreshPhotos();
                break;
            case 'monitoring':
                this.refreshMonitoring();
                break;
            case 'security':
                this.refreshSecurityAlerts();
                break;
        }
    }

    refreshOverview() {
        this.logActivity('Overview refreshed');
        this.updateStats();
        this.updateCharts();
        this.updateActivityFeed();
    }

    updateStats() {
        const stats = this.getSystemStats();
        
        document.getElementById('activeUsers').textContent = stats.activeUsers;
        document.getElementById('totalPhotos').textContent = stats.totalPhotos;
        document.getElementById('activeSessions').textContent = stats.activeSessions;
        document.getElementById('securityAlerts').textContent = stats.securityAlerts;
    }

    getSystemStats() {
        // Get data from localStorage and main PhotoShare app
        const sessions = this.getActiveSessions();
        const photos = this.getAllPhotos();
        const alerts = this.getSecurityAlerts();

        return {
            activeUsers: sessions.length,
            totalPhotos: photos.length,
            activeSessions: sessions.length,
            securityAlerts: alerts.length
        };
    }

    getActiveSessions() {
        const sessions = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('session_')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key));
                    if (sessionData.expiresAt) {
                        const expiration = new Date(sessionData.expiresAt).getTime();
                        const now = new Date().getTime();
                        
                        if (now < expiration) {
                            sessions.push({
                                id: key.replace('session_', ''),
                                ...sessionData,
                                userIP: this.generateFakeIP(),
                                status: 'Active'
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error parsing session:', error);
                }
            }
        });
        
        return sessions;
    }

    getAllPhotos() {
        const photos = [];
        try {
            const sharedPhotos = JSON.parse(localStorage.getItem('sharedPhotos') || '[]');
            photos.push(...sharedPhotos);
        } catch (error) {
            console.error('Error loading photos:', error);
        }
        return photos;
    }

    getSecurityAlerts() {
        // Generate some sample security alerts
        const alerts = [];
        const alertTypes = [
            'Unusual login attempt detected',
            'Multiple failed authentication attempts',
            'Suspicious photo upload activity',
            'Camera access from unknown device'
        ];

        // Add random alerts for demo
        if (Math.random() > 0.7) {
            alerts.push({
                id: Date.now(),
                type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
                timestamp: new Date().toISOString(),
                severity: 'medium'
            });
        }

        return alerts;
    }

    generateFakeIP() {
        return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }

    refreshSessions() {
        const sessions = this.getActiveSessions();
        const tableBody = document.getElementById('sessionsTableBody');
        
        tableBody.innerHTML = '';
        
        sessions.forEach(session => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${session.id.substring(0, 8)}...</td>
                <td>${session.userIP}</td>
                <td>${new Date(session.createdAt).toLocaleString()}</td>
                <td>${session.photos ? session.photos.length : 0}</td>
                <td><span class="status-badge active">${session.status}</span></td>
                <td>
                    <button class="btn danger" onclick="dashboard.terminateSession('${session.id}')">
                        <i class="fas fa-ban"></i> Terminate
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        this.logActivity(`Sessions refreshed - ${sessions.length} active sessions`);
    }

    refreshPhotos() {
        const photos = this.getAllPhotos();
        const photosGrid = document.getElementById('photosGrid');
        
        photosGrid.innerHTML = '';
        
        photos.forEach(photo => {
            const photoCard = document.createElement('div');
            photoCard.className = 'photo-card';
            photoCard.innerHTML = `
                <img src="${photo.url}" alt="Photo">
                <div class="photo-info">
                    <p><strong>ID:</strong> ${photo.id}</p>
                    <p><strong>Type:</strong> ${photo.type}</p>
                    <p><strong>Uploaded:</strong> ${new Date(photo.timestamp).toLocaleString()}</p>
                </div>
                <div class="photo-actions">
                    <button class="btn danger" onclick="dashboard.deletePhoto('${photo.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn primary" onclick="dashboard.viewPhoto('${photo.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            `;
            photosGrid.appendChild(photoCard);
        });
        
        this.logActivity(`Photos refreshed - ${photos.length} photos found`);
    }

    refreshMonitoring() {
        if (this.isMonitoring) {
            this.updateCameraMonitor();
            this.updateSystemLogs();
        }
    }

    toggleMonitoring() {
        const button = document.getElementById('toggleMonitoring');
        
        if (this.isMonitoring) {
            this.stopMonitoring();
            button.innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
            button.className = 'btn success';
        } else {
            this.startMonitoring();
            button.innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
            button.className = 'btn danger';
        }
        
        this.isMonitoring = !this.isMonitoring;
    }

    startMonitoring() {
        this.logActivity('Live monitoring started');
        this.monitoringInterval = setInterval(() => {
            this.updateCameraMonitor();
            this.updateSystemLogs();
        }, 2000);
    }

    stopMonitoring() {
        this.logActivity('Live monitoring stopped');
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    updateCameraMonitor() {
        const cameraMonitor = document.getElementById('cameraMonitor');
        
        // Check if main app has active camera
        if (window.opener && window.opener.photoShareApp) {
            const mainApp = window.opener.photoShareApp;
            if (mainApp.stream) {
                cameraMonitor.innerHTML = `
                    <div class="camera-feed-active">
                        <i class="fas fa-video"></i>
                        <p>Camera feed detected</p>
                        <p>Status: <span style="color: #28a745;">Active</span></p>
                    </div>
                `;
            } else {
                cameraMonitor.innerHTML = `
                    <div class="no-feed">
                        <i class="fas fa-video-slash"></i>
                        <p>No active camera feeds</p>
                    </div>
                `;
            }
        } else {
            cameraMonitor.innerHTML = `
                <div class="no-feed">
                    <i class="fas fa-video-slash"></i>
                    <p>No connection to main app</p>
                </div>
            `;
        }
    }

    updateSystemLogs() {
        const logsContainer = document.getElementById('systemLogs');
        const currentTime = new Date().toLocaleTimeString();
        
        // Add random system events
        const events = [
            'Photo uploaded successfully',
            'Session timer updated',
            'User authentication verified',
            'Camera access granted',
            'Stealth mode activated',
            'Photo shared via link'
        ];
        
        if (Math.random() > 0.6) {
            const event = events[Math.floor(Math.random() * events.length)];
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <span class="log-time">${currentTime}</span>
                <span class="log-type info">INFO</span>
                <span class="log-message">${event}</span>
            `;
            
            logsContainer.insertBefore(logEntry, logsContainer.firstChild);
            
            // Keep only last 50 entries
            while (logsContainer.children.length > 50) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        }
    }

    initializeCharts() {
        // Usage Analytics Chart
        const usageCtx = document.getElementById('usageChart').getContext('2d');
        this.charts.usage = new Chart(usageCtx, {
            type: 'line',
            data: {
                labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
                datasets: [{
                    label: 'Active Users',
                    data: [2, 5, 3, 8, 6, 4],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            }
        });

        // Photo Activity Chart
        const photoCtx = document.getElementById('photoChart').getContext('2d');
        this.charts.photo = new Chart(photoCtx, {
            type: 'doughnut',
            data: {
                labels: ['Camera Photos', 'Uploaded Photos', 'Shared Photos'],
                datasets: [{
                    data: [12, 8, 5],
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Update chart data with real statistics
        const stats = this.getSystemStats();
        
        // Update usage chart with some random data
        const newData = Array.from({length: 6}, () => Math.floor(Math.random() * 10));
        this.charts.usage.data.datasets[0].data = newData;
        this.charts.usage.update();
        
        // Update photo chart
        const photos = this.getAllPhotos();
        const cameraPhotos = photos.filter(p => p.type === 'camera').length;
        const uploadedPhotos = photos.filter(p => p.type === 'upload').length;
        const sharedPhotos = photos.length;
        
        this.charts.photo.data.datasets[0].data = [cameraPhotos, uploadedPhotos, sharedPhotos];
        this.charts.photo.update();
    }

    updateActivityFeed() {
        const activityList = document.getElementById('activityList');
        const activities = this.getRecentActivities();
        
        activityList.innerHTML = '';
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <i class="fas fa-${activity.icon}"></i>
                <span>${activity.message}</span>
                <time>${activity.time}</time>
            `;
            activityList.appendChild(item);
        });
    }

    getRecentActivities() {
        return [
            { icon: 'user-plus', message: 'New admin session started', time: '2 minutes ago' },
            { icon: 'camera', message: 'Camera activated', time: '5 minutes ago' },
            { icon: 'share', message: 'Photo shared via link', time: '8 minutes ago' },
            { icon: 'shield-alt', message: 'Stealth mode activated', time: '12 minutes ago' },
            { icon: 'trash', message: 'Expired session cleaned up', time: '15 minutes ago' }
        ];
    }

    refreshSecurityAlerts() {
        const alerts = this.getSecurityAlerts();
        const alertsList = document.getElementById('securityAlertsList');
        
        alertsList.innerHTML = '';
        
        if (alerts.length === 0) {
            alertsList.innerHTML = '<p style="color: #28a745;">No security alerts</p>';
        } else {
            alerts.forEach(alert => {
                const alertItem = document.createElement('div');
                alertItem.className = 'alert-item';
                alertItem.innerHTML = `
                    <strong>${alert.type}</strong>
                    <p>Time: ${new Date(alert.timestamp).toLocaleString()}</p>
                    <p>Severity: ${alert.severity.toUpperCase()}</p>
                `;
                alertsList.appendChild(alertItem);
            });
        }
    }

    terminateSession(sessionId) {
        localStorage.removeItem(`session_${sessionId}`);
        this.refreshSessions();
        this.logActivity(`Session ${sessionId} terminated`);
        this.showNotification('Session terminated successfully', 'success');
    }

    terminateAllSessions() {
        const keys = Object.keys(localStorage);
        let count = 0;
        
        keys.forEach(key => {
            if (key.startsWith('session_')) {
                localStorage.removeItem(key);
                count++;
            }
        });
        
        this.refreshSessions();
        this.logActivity(`All sessions terminated (${count} sessions)`);
        this.showNotification(`${count} sessions terminated`, 'success');
    }

    deletePhoto(photoId) {
        // Remove from shared photos
        const sharedPhotos = JSON.parse(localStorage.getItem('sharedPhotos') || '[]');
        const updatedPhotos = sharedPhotos.filter(photo => photo.id !== photoId);
        localStorage.setItem('sharedPhotos', JSON.stringify(updatedPhotos));
        
        this.refreshPhotos();
        this.logActivity(`Photo ${photoId} deleted`);
        this.showNotification('Photo deleted successfully', 'success');
    }

    bulkDeletePhotos() {
        localStorage.removeItem('sharedPhotos');
        this.refreshPhotos();
        this.logActivity('Bulk photo deletion performed');
        this.showNotification('All photos deleted', 'success');
    }

    viewPhoto(photoId) {
        const photos = this.getAllPhotos();
        const photo = photos.find(p => p.id === photoId);
        
        if (photo) {
            window.open(photo.url, '_blank');
        }
    }

    changePassword() {
        const newPassword = document.getElementById('newPassword').value;
        
        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Update password in main app if accessible
        if (window.opener && window.opener.photoShareApp) {
            window.opener.photoShareApp.adminCredentials.password = newPassword;
        }
        
        document.getElementById('newPassword').value = '';
        this.logActivity('Admin password changed');
        this.showNotification('Password changed successfully', 'success');
    }

    updateTimeout() {
        const timeout = document.getElementById('sessionTimeout').value;
        
        // Store timeout setting
        localStorage.setItem('adminTimeout', timeout);
        
        this.logActivity(`Session timeout updated to ${timeout} minutes`);
        this.showNotification('Timeout updated successfully', 'success');
    }

    emergencyStop() {
        this.confirmAction('EMERGENCY STOP: This will terminate all sessions and stop all operations!', () => {
            this.terminateAllSessions();
            this.stopMonitoring();
            
            // Try to stop camera in main app
            if (window.opener && window.opener.photoShareApp) {
                window.opener.photoShareApp.stopCamera();
            }
            
            this.logActivity('EMERGENCY STOP executed');
            this.showNotification('Emergency stop executed', 'warning');
        });
    }

    wipeAllData() {
        // Clear all PhotoShare data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('session_') || key === 'sharedPhotos' || key === 'adminSession') {
                localStorage.removeItem(key);
            }
        });
        
        // Refresh all sections
        this.refreshOverview();
        this.refreshSessions();
        this.refreshPhotos();
        
        this.logActivity('ALL DATA WIPED');
        this.showNotification('All data permanently deleted', 'warning');
    }

    startRealTimeUpdates() {
        this.refreshInterval = setInterval(() => {
            if (this.currentSection === 'overview') {
                this.updateStats();
                this.updateActivityFeed();
            }
        }, 5000);
    }

    logActivity(message) {
        console.log(`[Admin Dashboard] ${new Date().toLocaleString()}: ${message}`);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            zIndex: '10001',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '300px'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
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

    confirmAction(message, callback) {
        this.pendingAction = callback;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
    }

    executeConfirmedAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.closeModal();
    }

    closeModal() {
        document.getElementById('confirmModal').style.display = 'none';
    }

    logout() {
        this.confirmAction('Are you sure you want to logout?', () => {
            window.close();
        });
    }

    loadData() {
        // Load initial data
        this.refreshOverview();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});

// Handle window communication
window.addEventListener('message', (event) => {
    if (event.data.type === 'photoShareUpdate') {
        window.dashboard.refreshOverview();
    }
});
