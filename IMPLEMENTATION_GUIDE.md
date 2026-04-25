# Smart UniHub - Signup Approval Workflow & Notifications System
## Implementation Guide & Technical Specifications

---

## 📋 Overview

This document provides a comprehensive guide for implementing a **two-tier signup approval system** and a **complete notifications infrastructure** with web UI integration.

### Key Requirements:
- **Users**: Auto-approved on signup, can login immediately
- **Managers/Technicians**: Require admin approval before login
- **Notifications**: Display booking approval/rejection, ticket status changes, and comment additions in web UI
- **No Breaking Changes**: All existing features remain functional

---

## 🏗️ System Architecture

### Current State
```
✅ Backend: Spring Boot + MongoDB
✅ Frontend: React + Vite + TailwindCSS
✅ Notification Entity: Exists with proper types
✅ Notification Service: Complete with CRUD operations
✅ Notification Controller: API endpoints ready
✅ Ticket/Comment Services: Send notifications on creation/status change
✅ Booking Service: Sends notifications on submission/approval/rejection
⚠️ User Entity: Missing approval status tracking
⚠️ Auth Controller: No approval check in login
⚠️ SignUp Page: Needs approval workflow UI
⚠️ Notification Panel: Exists but needs enhancement
```

---

## 🔧 Backend Implementation Tasks

### Task 1: Update User Entity (CRITICAL)

**File**: `backend/src/main/java/com/smartcampus/entity/User.java`

**Changes**:
```java
// Add these enum and fields to User.java

// Add this enum inside or before User class
public enum ApprovalStatus {
    APPROVED,           // User is approved and can login
    PENDING_APPROVAL,   // Manager/Technician waiting for admin approval
    REJECTED            // Admin rejected the signup
}

// Add these fields to User class
private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;  // Default: approved
private String requestedRole;  // Role requested during signup (for pending users)
private String approvedBy;     // Admin user ID who approved this user
private LocalDateTime approvalDate;  // When user was approved/rejected
```

**Getter/Setter Methods** to add:
```java
public ApprovalStatus getApprovalStatus() { return approvalStatus; }
public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }

public String getRequestedRole() { return requestedRole; }
public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }

public String getApprovedBy() { return approvedBy; }
public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

public LocalDateTime getApprovalDate() { return approvalDate; }
public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }
```

---

### Task 2: Update Auth Controller - Signup Endpoint

**File**: `backend/src/main/java/com/smartcampus/controller/AuthController.java`

**Changes to `/signup` POST endpoint**:

Replace the current signup method with:
```java
@PostMapping("/signup")
public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> userData) {
    String fullName = userData.get("fullName");
    String email = userData.get("email");
    String password = userData.get("password");
    String phoneNumber = userData.get("phoneNumber");
    String role = userData.get("role");
    
    // Validate input
    if (userRepository.findByEmail(email).isPresent()) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Email already exists");
        return ResponseEntity.badRequest().body(errorResponse);
    }
    
    // Create new user
    User newUser = new User();
    newUser.setFullName(fullName);
    newUser.setEmail(email);
    newUser.setPassword(passwordEncoder.encode(password));
    newUser.setPhoneNumber(phoneNumber);
    newUser.setIsActive(true);
    newUser.setCreatedAt(LocalDateTime.now());
    newUser.setUpdatedAt(LocalDateTime.now());
    
    // Assign role and approval status
    String userRole = role != null ? role : "USER";
    
    // CRITICAL: Set approval status based on role
    if ("MANAGER".equals(userRole) || "TECHNICIAN".equals(userRole)) {
        newUser.setApprovalStatus(User.ApprovalStatus.PENDING_APPROVAL);
        newUser.setRequestedRole(userRole);
    } else {
        // USER role is auto-approved
        newUser.setApprovalStatus(User.ApprovalStatus.APPROVED);
    }
    
    // Get or create role
    Role newUserRole = roleRepository.findByRoleName(userRole)
            .orElseGet(() -> {
                Role newRole = new Role();
                newRole.setRoleName(userRole);
                newRole.setDescription(userRole + " role");
                return roleRepository.save(newRole);
            });
    
    Set<Role> roles = new HashSet<>();
    roles.add(newUserRole);
    newUser.setRoles(roles);
    
    userRepository.save(newUser);
    
    Map<String, String> response = new HashMap<>();
    response.put("message", "User registered successfully");
    response.put("email", email);
    response.put("fullName", fullName);
    if ("MANAGER".equals(userRole) || "TECHNICIAN".equals(userRole)) {
        response.put("approvalRequired", "true");
        response.put("approvalMessage", "Your account requires admin approval. You will be notified once approved.");
    } else {
        response.put("approvalRequired", "false");
        response.put("approvalMessage", "Your account is active. You can login immediately.");
    }
    
    return ResponseEntity.ok(response);
}
```

---

### Task 3: Update Auth Controller - Login Endpoint

**File**: `backend/src/main/java/com/smartcampus/controller/AuthController.java`

**Changes to `/login` POST endpoint**:

Add approval status check in the login method (after password verification):
```java
@PostMapping("/login")
public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
    String email = credentials.get("email");
    String password = credentials.get("password");
    
    // Find user by email
    User user = userRepository.findByEmail(email).orElse(null);
    if (user == null) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Invalid email or password");
        return ResponseEntity.status(401).body(errorResponse);
    }
    
    // Check if user is active
    if (!user.getIsActive()) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Account is deactivated");
        return ResponseEntity.status(403).body(errorResponse);
    }
    
    // NEW: Check approval status for MANAGER/TECHNICIAN
    if (user.getApprovalStatus() == User.ApprovalStatus.PENDING_APPROVAL) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Your account is pending admin approval. Please wait for approval email.");
        errorResponse.put("approvalStatus", "PENDING");
        return ResponseEntity.status(403).body(errorResponse);
    }
    
    if (user.getApprovalStatus() == User.ApprovalStatus.REJECTED) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Your account has been rejected. Please contact admin for more information.");
        errorResponse.put("approvalStatus", "REJECTED");
        return ResponseEntity.status(403).body(errorResponse);
    }
    
    // Verify password
    if (!passwordEncoder.matches(password, user.getPassword())) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Invalid email or password");
        return ResponseEntity.status(401).body(errorResponse);
    }
    
    // Generate token and resolve role
    String token = System.currentTimeMillis() + "_" + user.getId();
    String role = resolvePrimaryRole(user);
    
    Map<String, String> response = new HashMap<>();
    response.put("token", token);
    response.put("message", "Login successful");
    response.put("email", user.getEmail());
    response.put("fullName", user.getFullName());
    response.put("role", role);
    response.put("userId", user.getId());
    response.put("approvalStatus", user.getApprovalStatus().toString());
    
    return ResponseEntity.ok(response);
}
```

---

### Task 4: Add Approval Endpoints in UserController

**File**: `backend/src/main/java/com/smartcampus/controller/UserController.java`

**Add these new endpoints**:

```java
// Get all users pending admin approval
@GetMapping("/pending-approvals")
public ResponseEntity<List<Map<String, Object>>> getPendingApprovals() {
    List<User> pendingUsers = userRepository.findByApprovalStatus(User.ApprovalStatus.PENDING_APPROVAL);
    
    List<Map<String, Object>> result = new ArrayList<>();
    for (User user : pendingUsers) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("fullName", user.getFullName());
        userMap.put("email", user.getEmail());
        userMap.put("phoneNumber", user.getPhoneNumber());
        userMap.put("requestedRole", user.getRequestedRole());
        userMap.put("createdAt", user.getCreatedAt());
        result.add(userMap);
    }
    
    return ResponseEntity.ok(result);
}

// Approve a user's signup request
@PostMapping("/{userId}/approve")
public ResponseEntity<Map<String, String>> approveUser(
        @PathVariable String userId,
        @RequestHeader("Authorization") String token) {
    
    // Get current admin user from token
    String adminUserId = extractUserIdFromToken(token);
    User adminUser = userRepository.findById(adminUserId)
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
    
    // Check if requester is admin
    if (!isAdmin(adminUser)) {
        return ResponseEntity.status(403).body(Collections.singletonMap(
            "message", "Only admins can approve users"
        ));
    }
    
    // Get user to approve
    User userToApprove = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (userToApprove.getApprovalStatus() != User.ApprovalStatus.PENDING_APPROVAL) {
        return ResponseEntity.badRequest().body(Collections.singletonMap(
            "message", "User is not pending approval"
        ));
    }
    
    // Assign the requested role
    String requestedRole = userToApprove.getRequestedRole();
    Role role = roleRepository.findByRoleName(requestedRole)
            .orElseGet(() -> {
                Role newRole = new Role();
                newRole.setRoleName(requestedRole);
                newRole.setDescription(requestedRole + " role");
                return roleRepository.save(newRole);
            });
    
    Set<Role> roles = new HashSet<>();
    roles.add(role);
    userToApprove.setRoles(roles);
    userToApprove.setApprovalStatus(User.ApprovalStatus.APPROVED);
    userToApprove.setApprovedBy(adminUserId);
    userToApprove.setApprovalDate(LocalDateTime.now());
    
    userRepository.save(userToApprove);
    
    // Send notification to approved user
    notificationService.createNotification(
        userId,
        "Account Approved",
        "Your " + requestedRole + " account has been approved. You can now login.",
        Notification.NotificationType.SYSTEM_NOTIFICATION,
        "USER",
        userId
    );
    
    Map<String, String> response = new HashMap<>();
    response.put("message", "User approved successfully");
    response.put("userId", userId);
    response.put("email", userToApprove.getEmail());
    
    return ResponseEntity.ok(response);
}

// Reject a user's signup request
@PostMapping("/{userId}/reject")
public ResponseEntity<Map<String, String>> rejectUser(
        @PathVariable String userId,
        @RequestBody Map<String, String> data,
        @RequestHeader("Authorization") String token) {
    
    // Get current admin user from token
    String adminUserId = extractUserIdFromToken(token);
    User adminUser = userRepository.findById(adminUserId)
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
    
    // Check if requester is admin
    if (!isAdmin(adminUser)) {
        return ResponseEntity.status(403).body(Collections.singletonMap(
            "message", "Only admins can reject users"
        ));
    }
    
    // Get user to reject
    User userToReject = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (userToReject.getApprovalStatus() != User.ApprovalStatus.PENDING_APPROVAL) {
        return ResponseEntity.badRequest().body(Collections.singletonMap(
            "message", "User is not pending approval"
        ));
    }
    
    String rejectionReason = data.getOrDefault("reason", "Your account has been rejected.");
    
    // Update user status
    userToReject.setApprovalStatus(User.ApprovalStatus.REJECTED);
    userToReject.setApprovedBy(adminUserId);
    userToReject.setApprovalDate(LocalDateTime.now());
    
    userRepository.save(userToReject);
    
    // Send notification to rejected user
    notificationService.createNotification(
        userId,
        "Account Rejected",
        "Your account request has been rejected. Reason: " + rejectionReason,
        Notification.NotificationType.SYSTEM_NOTIFICATION,
        "USER",
        userId
    );
    
    Map<String, String> response = new HashMap<>();
    response.put("message", "User rejected successfully");
    response.put("userId", userId);
    
    return ResponseEntity.ok(response);
}

// Helper methods
private String extractUserIdFromToken(String token) {
    if (token != null && token.startsWith("Bearer ")) {
        token = token.substring(7);
    }
    // Token format: timestamp_userId
    String[] parts = token.split("_");
    return parts.length > 1 ? parts[1] : null;
}

private boolean isAdmin(User user) {
    return user.getRoles().stream()
            .anyMatch(role -> "ADMIN".equals(role.getRoleName()));
}
```

**Also update UserRepository** to add query method:
```java
// Add to UserRepository interface
List<User> findByApprovalStatus(User.ApprovalStatus approvalStatus);
```

---

### Task 5: Verify Notification System (Already Complete)

The following are **already implemented** and working:

✅ **NotificationService** - Creates notifications with proper types
✅ **NotificationController** - Exposes API endpoints for frontend
✅ **TicketService** - Creates TICKET_CREATED, TICKET_ASSIGNED, TICKET_STATUS_CHANGED notifications
✅ **CommentService** - Creates COMMENT_ADDED notifications
✅ **BookingService** - Creates BOOKING_SUBMITTED, BOOKING_APPROVED, BOOKING_REJECTED notifications

**No backend notification changes needed!**

---

## 🎨 Frontend Implementation Tasks

### Task 1: Update SignUp Page with Role Selection & Approval Messaging

**File**: `frontend/src/pages/SignUp.jsx`

**Key Changes**:
1. Add role selection (USER / MANAGER / TECHNICIAN)
2. Show approval messaging based on selected role
3. Call signup with selected role
4. Display pending approval message on success

**Replace the form section** with role information displayed:
```jsx
{/* Role Selection Section */}
<div className="mb-8">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Role</h3>
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
    {roles.map((r) => (
      <button
        key={r.id}
        type="button"
        onClick={() => {
          setSelectedRole(r.id)
          setApprovalMessage(getApprovalMessage(r.id))
        }}
        className={`p-4 rounded-lg border-2 transition-all ${
          selectedRole === r.id
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-primary'
        }`}
      >
        <div className="text-2xl mb-2">{r.icon}</div>
        <p className="font-semibold text-sm">{r.name}</p>
        <p className="text-xs text-gray-500 mt-1">{r.description}</p>
      </button>
    ))}
  </div>

  {/* Approval Status Message */}
  {approvalMessage && (
    <div className={`mt-4 p-3 rounded-lg text-sm ${
      approvalMessage.approved
        ? 'bg-green-50 text-green-800'
        : 'bg-yellow-50 text-yellow-800'
    }`}>
      <p>{approvalMessage.text}</p>
    </div>
  )}
</div>
```

**Add helper function**:
```jsx
const getApprovalMessage = (roleId) => {
  const messages = {
    'USER': { 
      approved: true, 
      text: '✅ User accounts are automatically approved. You can login immediately after signup.' 
    },
    'MANAGER': { 
      approved: false, 
      text: '⏳ Manager accounts require admin approval. You will receive an approval email once verified.' 
    },
    'TECHNICIAN': { 
      approved: false, 
      text: '⏳ Technician accounts require admin approval. You will receive an approval email once verified.' 
    }
  }
  return messages[roleId] || null
}
```

**Update handleSubmit** to include selected role:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  
  if (!selectedRole) {
    setError('Please select a role')
    return
  }
  
  // ... existing validation ...
  
  try {
    const response = await AuthAPI.signup({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      role: selectedRole  // Use selected role
    })
    
    // Show appropriate success message
    setSuccess(true)
    setSuccessMessage(response.approvalMessage || 'Account created successfully!')
    
    setTimeout(() => {
      navigate('/login')
    }, 2000)
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed')
  } finally {
    setLoading(false)
  }
}
```

---

### Task 2: Enhance Notification Panel in Navbar/Dashboard

**Create new component**: `frontend/src/components/NotificationPanel.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { NotificationAPI } from '../services/api'
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaComments,
  FaCalendarAlt,
  FaTicketAlt,
  FaTimes,
  FaCheck,
  FaTrash
} from 'react-icons/fa'

export default function NotificationPanel() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, unread, booking, ticket, comment, system

  useEffect(() => {
    if (user?.userId) {
      fetchUnreadCount()
      // Optionally: Set up polling for new notifications
      const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, filter])

  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationAPI.getUnreadCount(user.userId)
      setUnreadCount(response.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      let response
      if (filter === 'unread') {
        response = await NotificationAPI.getUnread(user.userId)
      } else {
        response = await NotificationAPI.getAll(user.userId)
      }
      
      // Apply type filter
      let filtered = response || []
      if (filter !== 'all' && filter !== 'unread') {
        filtered = filtered.filter(n => n.type.includes(filter.toUpperCase()))
      }
      
      setNotifications(filtered)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationAPI.markAsRead(notificationId)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(user.userId)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await NotificationAPI.delete(notificationId)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_SUBMITTED':
      case 'BOOKING_APPROVED':
      case 'BOOKING_REJECTED':
        return <FaCalendarAlt className="text-blue-500" />
      case 'TICKET_CREATED':
      case 'TICKET_ASSIGNED':
      case 'TICKET_STATUS_CHANGED':
        return <FaTicketAlt className="text-purple-500" />
      case 'COMMENT_ADDED':
        return <FaComments className="text-green-500" />
      case 'SYSTEM_NOTIFICATION':
        return <FaBell className="text-yellow-500" />
      default:
        return <FaBell className="text-gray-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED':
        return 'bg-green-50 border-green-200'
      case 'BOOKING_REJECTED':
        return 'bg-red-50 border-red-200'
      case 'TICKET_CREATED':
        return 'bg-blue-50 border-blue-200'
      case 'TICKET_STATUS_CHANGED':
        return 'bg-purple-50 border-purple-200'
      case 'COMMENT_ADDED':
        return 'bg-green-50 border-green-200'
      case 'SYSTEM_NOTIFICATION':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-96 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-4 py-2 border-b border-gray-200 text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'booking', label: 'Bookings' },
              { id: 'ticket', label: 'Tickets' },
              { id: 'comment', label: 'Comments' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaBell className="mx-auto text-3xl mb-2 opacity-30" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} cursor-pointer hover:bg-opacity-75 transition-all ${
                      !notification.isRead ? 'border-l-primary' : 'border-l-gray-300'
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        className="mt-2 text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}
```

---

### Task 3: Create Admin Approval Panel

**Create new page**: `frontend/src/pages/Admin/PendingApprovals.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { AdminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import {
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaUser
} from 'react-icons/fa'

export default function PendingApprovals() {
  const { user } = useAuth()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rejectionForm, setRejectionForm] = useState({ userId: null, reason: '' })
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await AdminAPI.getPendingApprovals()
      setPendingUsers(response || [])
    } catch (err) {
      setError('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await AdminAPI.approveUser(userId)
      showToast(`✅ User approved successfully`)
      fetchPendingApprovals()
    } catch (err) {
      setError('Failed to approve user')
    }
  }

  const handleRejectClick = (userId) => {
    setRejectionForm({ userId, reason: '' })
  }

  const handleRejectSubmit = async () => {
    if (!rejectionForm.reason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    try {
      await AdminAPI.rejectUser(rejectionForm.userId, {
        reason: rejectionForm.reason
      })
      showToast('❌ User rejected')
      setRejectionForm({ userId: null, reason: '' })
      fetchPendingApprovals()
    } catch (err) {
      setError('Failed to reject user')
    }
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'TECHNICIAN':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-gray-600 mt-2">
              Review and approve/reject manager and technician signup requests
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Toast Message */}
          {toast && (
            <div className="fixed top-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              {toast}
            </div>
          )}

          {/* Rejection Modal */}
          {rejectionForm.userId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject User</h3>
                <textarea
                  value={rejectionForm.reason}
                  onChange={(e) => setRejectionForm({ ...rejectionForm, reason: e.target.value })}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                  rows="4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setRejectionForm({ userId: null, reason: '' })}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Users List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4">Loading pending approvals...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <FaCheck className="mx-auto text-4xl text-green-500 mb-4 opacity-50" />
              <p className="text-gray-600 text-lg">No pending approvals</p>
              <p className="text-gray-400 text-sm mt-2">All signup requests have been processed</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingUsers.map(u => (
                <div
                  key={u.id}
                  className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <FaUser />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{u.fullName}</h3>
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${getRoleColor(u.requestedRole)}`}>
                            {u.requestedRole}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 ml-15">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {u.email}
                        </div>
                        {u.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            {u.phoneNumber}
                          </div>
                        )}
                        <div className="flex items-center gap-2 col-span-2">
                          <FaClock className="text-gray-400" />
                          Requested: {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(u.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
```

**Add route to Admin Dashboard navigation**:
```jsx
// In your admin navigation/sidebar, add:
<Link to="/admin/pending-approvals" className="...">
  <FaCheckCircle /> Pending Approvals ({pendingCount})
</Link>
```

---

### Task 4: Update API Service

**File**: `frontend/src/services/api.js`

**Add these API methods**:

```javascript
export const AdminAPI = {
  // ... existing methods ...
  
  getPendingApprovals: async () => {
    const response = await fetch(`${API_BASE_URL}/users/pending-approvals`)
    if (!response.ok) throw new Error('Failed to fetch pending approvals')
    return response.json()
  },
  
  approveUser: async (userId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/users/${userId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Failed to approve user')
    return response.json()
  },
  
  rejectUser: async (userId, data) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to reject user')
    return response.json()
  }
}

export const NotificationAPI = {
  getAll: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch notifications')
    return response.json()
  },
  
  getUnread: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread`)
    if (!response.ok) throw new Error('Failed to fetch unread notifications')
    return response.json()
  },
  
  getUnreadCount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`)
    if (!response.ok) throw new Error('Failed to fetch unread count')
    return response.json()
  },
  
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH'
    })
    if (!response.ok) throw new Error('Failed to mark as read')
    return response.json()
  },
  
  markAllAsRead: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to mark all as read')
  },
  
  delete: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete notification')
  }
}
```

---

### Task 5: Integrate NotificationPanel into Navbar

**Update Navbar component** to include the NotificationPanel:

```jsx
import NotificationPanel from './NotificationPanel'

export default function Navbar() {
  return (
    <nav className="...">
      {/* ... existing navbar content ... */}
      
      {/* Add NotificationPanel before user menu */}
      {user && <NotificationPanel />}
      
      {/* ... user menu ... */}
    </nav>
  )
}
```

---

## 📊 Implementation Checklist

### Backend
- [ ] Add `ApprovalStatus` enum and fields to User entity
- [ ] Add getters/setters for approval fields
- [ ] Update `/auth/signup` endpoint
- [ ] Update `/auth/login` endpoint with approval check
- [ ] Add `findByApprovalStatus()` to UserRepository
- [ ] Add `/users/pending-approvals` endpoint
- [ ] Add `/users/{userId}/approve` endpoint
- [ ] Add `/users/{userId}/reject` endpoint
- [ ] Test all endpoints with Postman/curl
- [ ] Verify existing booking/ticket/comment notifications still work

### Frontend
- [ ] Update SignUp.jsx with role selection and approval messaging
- [ ] Create NotificationPanel.jsx component
- [ ] Create PendingApprovals.jsx page
- [ ] Update api.js with new endpoints
- [ ] Integrate NotificationPanel into Navbar
- [ ] Add route to PendingApprovals in admin dashboard
- [ ] Test signup flow for all roles
- [ ] Test approval/rejection flow
- [ ] Test notification display and interactions
- [ ] Verify styling matches your design system

---

## 🧪 Testing Scenarios

### Scenario 1: User Signup (Auto-Approved)
1. Go to signup page
2. Select "USER" role
3. See message: "✅ User accounts are automatically approved. You can login immediately."
4. Complete signup
5. Go to login page
6. Login with created credentials
7. ✅ Should successfully login and redirect to user dashboard

### Scenario 2: Manager Signup (Requires Approval)
1. Go to signup page
2. Select "MANAGER" role
3. See message: "⏳ Manager accounts require admin approval..."
4. Complete signup
5. Try to login with created credentials
6. ❌ Should see error: "Your account is pending admin approval"
7. Admin navigates to "/admin/pending-approvals"
8. Admin clicks "Approve" for the manager
9. Manager receives notification: "Your MANAGER account has been approved"
10. Manager retries login
11. ✅ Should successfully login

### Scenario 3: Technician Rejection
1. Technician signs up
2. Admin navigates to pending approvals
3. Admin clicks "Reject"
4. Admin enters rejection reason: "Qualifications not verified"
5. Technician receives notification: "Your account has been rejected. Reason: Qualifications not verified"
6. Technician tries to login
7. ❌ Should see error: "Your account has been rejected"

### Scenario 4: Notification Display
1. User logs in
2. Clicks bell icon in navbar
3. Sees all their notifications (bookings, tickets, comments)
4. Can filter by type
5. Can mark individual or all notifications as read
6. Unread count decreases
7. Can delete notifications

---

## 🚀 Deployment Checklist

- [ ] MongoDB migration: Ensure all existing Users have `approvalStatus = APPROVED`
- [ ] Backend: Run `mvn clean package` successfully
- [ ] Frontend: Run `npm run build` successfully
- [ ] Database: Verify no schema conflicts
- [ ] Environment variables: Check API_BASE_URL is correct
- [ ] Security: Verify role checks are enforced
- [ ] Testing: Run through all scenarios above
- [ ] Documentation: Update any API docs

---

## 💡 Key Design Decisions

1. **ApprovalStatus Enum**: Tracks APPROVED, PENDING_APPROVAL, REJECTED states
2. **Auto-approval for Users**: No admin intervention needed for standard users
3. **Notification Trigger Points**: Booking, Ticket, Comment creation and status changes
4. **Frontend Polling**: Notification panel polls every 30 seconds for updates
5. **Role Priority**: ADMIN > MANAGER > TECHNICIAN > USER (deterministic resolution)
6. **Token Format**: `timestamp_userId` for simple extraction

---

## ⚠️ Important Notes

- **No Breaking Changes**: All existing functionality remains intact
- **Backward Compatibility**: Existing users automatically get `approvalStatus = APPROVED`
- **Database Migration**: You may need to set default approval status for existing users
- **Notification Types**: Already implemented in backend (BOOKING_*, TICKET_*, COMMENT_ADDED, SYSTEM_NOTIFICATION)
- **Permissions**: Approval endpoints check for ADMIN role
- **Error Handling**: All endpoints provide clear error messages

---

## 🔗 Related Files Reference

### Backend
- `backend/src/main/java/com/smartcampus/entity/User.java` - Add approval fields
- `backend/src/main/java/com/smartcampus/controller/AuthController.java` - Update signup/login
- `backend/src/main/java/com/smartcampus/controller/UserController.java` - Add approval endpoints
- `backend/src/main/java/com/smartcampus/repository/UserRepository.java` - Add query method
- `backend/src/main/java/com/smartcampus/service/NotificationService.java` - Already ready ✅
- `backend/src/main/java/com/smartcampus/entity/Notification.java` - Already ready ✅

### Frontend
- `frontend/src/pages/SignUp.jsx` - Update with role selection
- `frontend/src/components/NotificationPanel.jsx` - Create new
- `frontend/src/pages/Admin/PendingApprovals.jsx` - Create new
- `frontend/src/services/api.js` - Add new endpoints
- `frontend/src/components/Navbar.jsx` - Integrate NotificationPanel

---

**Ready to implement? Follow the tasks in order for smooth integration!**
