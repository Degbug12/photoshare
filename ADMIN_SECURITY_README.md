# PhotoShare - Admin-Only Mobile Photo Sharing (24-Hour Security)

A secure mobile-first photo sharing application with admin-only access and automatic 24-hour expiration for maximum security protection.

## 🔐 **Enhanced Security Features**

### **Admin-Only Access**
- ✅ **Login Required**: Only admin can access the app
- ✅ **Secure Authentication**: Username/password protection
- ✅ **Session Management**: 24-hour admin sessions
- ✅ **Auto-Logout**: Automatic logout on unauthorized access

### **24-Hour Expiration Protection**
- ✅ **Auto-Delete**: All photos automatically delete after 24 hours
- ✅ **Live Timer**: Countdown timer shows remaining time
- ✅ **Link Expiration**: Share links expire automatically
- ✅ **Session Cleanup**: Expired sessions auto-remove

### **Mobile Security**
- ✅ **Mobile-First Design**: Optimized for phone use
- ✅ **Touch Protection**: Prevents accidental sharing
- ✅ **Screen Lock Protection**: Works with device security
- ✅ **Intruder Protection**: Can't access without admin credentials

## 🚀 **Quick Start Guide**

### **Default Admin Credentials**
```
Username: admin
Password: secure123
```
**⚠️ IMPORTANT: Change these in the code for production use!**

### **Setup Steps**
1. **Open app on your mobile device**
2. **Enter admin credentials to login**
3. **Take photos or upload existing ones**
4. **Select photos to share**
5. **Generate 24-hour share link**
6. **Send link to recipients**
7. **Monitor countdown timer**

## 📱 **Mobile-Optimized Features**

### **For Your Phone (Admin Device)**
- Large touch-friendly buttons
- Optimized camera interface
- Drag-and-drop photo upload
- Clear status indicators
- Easy logout button

### **For Recipients**
- View-only access (no admin needed)
- Responsive photo gallery
- Download/view photos
- Automatic expiration notice

## 🔒 **Security Layers**

### **Layer 1: Admin Authentication**
- Required login before any access
- Invalid credentials show error
- Session expires after 24 hours
- Automatic logout clears all data

### **Layer 2: 24-Hour Expiration**
- Photos auto-delete after 24 hours
- Share links become invalid
- Live countdown timer
- Warning notifications

### **Layer 3: Session Management**
- Active session monitoring
- Manual session clearing
- Expired session cleanup
- Admin control panel

### **Layer 4: Mobile Protection**
- Screen blur on unauthorized access
- Touch gesture protection
- Device orientation support
- Memory cleanup on logout

## 🛡️ **Protection Against Intruders**

### **If Someone Gets Your Phone:**
1. **App requires admin login** - Can't access without credentials
2. **24-hour timer visible** - Shows when everything expires
3. **Logout button available** - Quick way to clear everything
4. **Auto-expire protection** - Everything deletes automatically

### **If You Lose Phone Access:**
1. **24-hour maximum exposure** - All data auto-deletes
2. **No permanent storage** - Nothing saved beyond timer
3. **Session tracking** - Admin can see active sessions
4. **Remote expiration** - Can't extend without admin access

## 📋 **Admin Control Panel**

### **Session Management**
- **Active Sessions**: View all current share sessions
- **Session Count**: Live counter of active sessions
- **Clear All**: Emergency delete all sessions
- **Expiration Timer**: Live countdown display

### **Security Actions**
- **Logout**: Clears all data and requires re-login
- **Clear Sessions**: Immediately expire all share links
- **View Sessions**: Detailed session information
- **Manual Cleanup**: Force cleanup of expired data

## 🚨 **Emergency Security**

### **If Compromised:**
1. Click **"Logout"** button (clears everything)
2. Or click **"Clear All Sessions"** (expires all links)
3. Or wait for 24-hour auto-expiration
4. Change admin password in code

### **Prevention:**
- Always logout when not using
- Don't share admin credentials
- Monitor active session count
- Use device screen lock

## 🛠 **Customization**

### **Change Admin Password**
Edit in `script.js`:
```javascript
this.adminCredentials = {
    username: 'your-username',
    password: 'your-secure-password'
};
```

### **Change Expiration Time**
Edit in `script.js`:
```javascript
// Change 24 hours to desired time
const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
```

### **Add More Security**
- Add PIN lock for admin actions
- Implement photo encryption
- Add device fingerprinting
- Set location restrictions

## 📱 **Mobile Usage Tips**

### **Best Practices:**
- Use on secure WiFi when possible
- Keep app updated
- Regularly clear old sessions
- Monitor expiration timer
- Use device screen lock

### **Recommended Workflow:**
1. Login to admin mode
2. Take/upload photos
3. Select photos to share
4. Generate 24h link immediately
5. Share link with recipients
6. Monitor countdown timer
7. Logout when done

## 🔧 **Technical Details**

### **Local Storage Security:**
- Admin sessions stored locally
- Automatic cleanup of expired data
- No server-side storage required
- Data isolated per device

### **Browser Compatibility:**
- Works on all mobile browsers
- Offline capable after loading
- Progressive Web App ready
- Touch gesture support

### **Performance:**
- Optimized for mobile networks
- Efficient image handling
- Minimal battery usage
- Fast startup time

## ⚠️ **Important Security Notes**

1. **Admin password is stored in JavaScript** - Consider server-based auth for production
2. **Local storage can be cleared by user** - Use for temporary sharing only
3. **24-hour limit is enforced client-side** - Don't rely on it for absolute security
4. **Photos are base64 encoded** - May use significant device memory
5. **No encryption at rest** - Don't use for highly sensitive photos

## 🆘 **Troubleshooting**

### **Can't Login:**
- Check admin credentials in code
- Clear browser cache
- Try incognito mode

### **Timer Not Working:**
- Check JavaScript is enabled
- Refresh the page
- Clear localStorage

### **Photos Not Sharing:**
- Verify admin login status
- Check photo selection
- Try smaller image files

---

**✅ Ready for secure mobile photo sharing with automatic 24-hour protection!**
