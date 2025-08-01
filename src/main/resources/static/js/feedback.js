// Feedback Management System
const API_BASE_URL = 'http://localhost:8080/api/admin/feedbacks';

// Global variables
let feedbacks = [];
let filteredFeedbacks = [];
let currentFeedback = null;
let selectedFeedbacks = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFeedbacks();
    setupEventListeners();
    loadStatistics();
});

// Event listeners setup
function setupEventListeners() {
    // Search and filter inputs with real-time filtering
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('blockFilter').addEventListener('change', applyFilters);
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
    document.getElementById('assigneeFilter').addEventListener('change', applyFilters);
    
    // Bulk action modal
    document.getElementById('bulkAction').addEventListener('change', function() {
        const valueDiv = document.getElementById('bulkValue');
        const valueSelect = document.getElementById('bulkValueSelect');
        const action = this.value;
        
        if (action) {
            valueDiv.style.display = 'block';
            populateBulkValues(action, valueSelect);
        } else {
            valueDiv.style.display = 'none';
        }
    });
}

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('accessToken');
}

// Get auth headers
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Improved alert function with animation
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => {
        alert.classList.add('hide');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    });

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible custom-alert`;
    
    const iconMap = {
        'success': 'fas fa-check-circle',
        'danger': 'fas fa-exclamation-triangle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    
    const icon = iconMap[type] || 'fas fa-info-circle';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${icon} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);

    // Show animation
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 100);

    // Auto hide after 5 seconds
    const autoHideTimer = setTimeout(() => {
        hideAlert(alertDiv);
    }, 5000);

    // Close button handler
    const closeBtn = alertDiv.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHideTimer);
        hideAlert(alertDiv);
    });
}

function hideAlert(alertDiv) {
    alertDiv.classList.remove('show');
    alertDiv.classList.add('hide');
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 300);
}

// Load statistics
async function loadStatistics() {
    try {
        // Load statistics from multiple endpoints
        const endpoints = [
            '/api/admin/feedbacks',
            '/api/admin-technician-accountant/feedbacks/status/PENDING',
            '/api/admin-technician-accountant/feedbacks/status/IN_PROGRESS',
            '/api/admin-technician-accountant/feedbacks/status/RESOLVED'
        ];
        
        // Calculate statistics from current feedbacks data
        const pendingCount = feedbacks.filter(f => f.status === 'PENDING').length;
        const processingCount = feedbacks.filter(f => f.status === 'IN_PROGRESS').length;
        const resolvedCount = feedbacks.filter(f => f.status === 'RESOLVED').length;
        const urgentCount = feedbacks.filter(f => f.priority === 'HIGH').length;
        
        // Update DOM if elements exist
        const pendingElement = document.getElementById('pendingCount');
        const processingElement = document.getElementById('processingCount');
        const resolvedElement = document.getElementById('resolvedCount');
        const urgentElement = document.getElementById('urgentCount');
        
        if (pendingElement) pendingElement.textContent = pendingCount;
        if (processingElement) processingElement.textContent = processingCount;
        if (resolvedElement) resolvedElement.textContent = resolvedCount;
        if (urgentElement) urgentElement.textContent = urgentCount;
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load feedbacks from API
async function loadFeedbacks() {
    showLoading(true);
    try {
        const response = await fetch(API_BASE_URL, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status && data.data) {
                feedbacks = data.data;
                filteredFeedbacks = [...feedbacks];
                displayFeedbacks();
            } else {
                const errorMessage = data.userMessage || data.message || 'Có lỗi khi tải dữ liệu phản ánh';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Không thể tải danh sách phản ánh';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        showAlert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Display feedbacks
function displayFeedbacks() {
    const container = document.getElementById('feedbackContainer');
    container.innerHTML = '';
    
    if (filteredFeedbacks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Không tìm thấy phản ánh nào</h5>
                <p class="text-muted">Thử thay đổi điều kiện tìm kiếm</p>
            </div>
        `;
        return;
    }
    
    filteredFeedbacks.forEach(feedback => {
        const feedbackItem = createFeedbackItem(feedback);
        container.appendChild(feedbackItem);
    });
}

// Create feedback item
function createFeedbackItem(feedback) {
    const item = document.createElement('div');
    const statusClass = getStatusClass(feedback.status);
    
    item.className = `feedback-item ${statusClass}`;
    item.onclick = () => openFeedbackModal(feedback.id);
    
    item.innerHTML = `
        <div class="feedback-checkbox">
            <input type="checkbox" class="bulk-checkbox" value="${feedback.id}" 
                   onclick="event.stopPropagation(); toggleFeedbackSelection('${feedback.id}')">
        </div>
        
        <div class="feedback-header">
            <div class="feedback-title">${feedback.title}</div>
        </div>
        
        <div class="feedback-meta">
            <span><i class="fas fa-home"></i> ${feedback.apartmentNumber || 'N/A'}</span>
            <span><i class="fas fa-clock"></i> ${formatDate(feedback.createdAt)}</span>
            <span><i class="fas fa-user"></i> ${feedback.residentName || 'N/A'}</span>
        </div>
        
        <div class="feedback-content">
            ${feedback.content || 'Không có nội dung'}
        </div>
        
        <div class="feedback-badges">
            <span class="badge status-badge ${getStatusBadgeClass(feedback.status)}">
                ${getStatusText(feedback.status)}
            </span>
            <span class="badge category-badge">
                ${feedback.category || 'Khác'}
            </span>
            ${feedback.priority ? `<span class="badge ${getPriorityBadgeClass(feedback.priority)}">${getPriorityText(feedback.priority)}</span>` : ''}
            ${feedback.assignedToName ? `<span class="badge bg-info">Phân công: ${feedback.assignedToName}</span>` : '<span class="badge bg-warning">Chờ xử lý</span>'}
        </div>
        
        <div class="feedback-actions">
            <button class="action-btn btn-detail" onclick="event.stopPropagation(); openFeedbackModal('${feedback.id}')">
                <i class="fas fa-eye me-1"></i>Chi tiết
            </button>
            <button class="action-btn btn-assign" onclick="event.stopPropagation(); quickAssign('${feedback.id}')">
                <i class="fas fa-user-plus me-1"></i>Phân công
            </button>
            <button class="action-btn btn-resolve" onclick="event.stopPropagation(); quickResolve('${feedback.id}')">
                <i class="fas fa-check me-1"></i>Giải quyết
            </button>
        </div>
    `;
    
    return item;
}

// Helper functions for status and priority
function getStatusClass(status) {
    const statusMap = {
        'PENDING': 'pending',
        'IN_PROGRESS': 'in-progress',
        'RESOLVED': 'resolved'
    };
    return statusMap[status] || 'pending';
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'PENDING': 'status-pending',
        'IN_PROGRESS': 'status-processing',
        'RESOLVED': 'status-resolved'
    };
    return statusMap[status] || 'status-pending';
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Chờ xử lý',
        'IN_PROGRESS': 'Đang xử lý',
        'RESOLVED': 'Đã giải quyết'
    };
    return statusMap[status] || 'Chờ xử lý';
}

function getPriorityClass(priority) {
    const priorityMap = {
        'HIGH': 'priority-high',
        'MEDIUM': 'priority-medium',
        'LOW': 'priority-low'
    };
    return priorityMap[priority] || 'priority-medium';
}

function getPriorityBadgeClass(priority) {
    const priorityMap = {
        'HIGH': 'priority-high',
        'MEDIUM': 'priority-medium',
        'LOW': 'priority-low'
    };
    return priorityMap[priority] || 'priority-medium';
}

function getPriorityText(priority) {
    const priorityMap = {
        'HIGH': 'Cao',
        'MEDIUM': 'Trung bình',
        'LOW': 'Thấp'
    };
    return priorityMap[priority] || 'Trung bình';
}

// Format date for Vietnam timezone
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
}

// Apply filters with real-time results
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const block = document.getElementById('blockFilter').value;
    const time = document.getElementById('timeFilter').value;
    const assignee = document.getElementById('assigneeFilter').value;
    
    filteredFeedbacks = feedbacks.filter(feedback => {
        // Search filter
        const searchMatch = !search || 
            feedback.title.toLowerCase().includes(search) ||
            feedback.content.toLowerCase().includes(search) ||
            (feedback.apartmentNumber && feedback.apartmentNumber.toLowerCase().includes(search)) ||
            (feedback.residentName && feedback.residentName.toLowerCase().includes(search));
        
        // Category filter
        const categoryMatch = !category || feedback.category === category;
        
        // Block filter
        const blockMatch = !block || (feedback.apartmentNumber && feedback.apartmentNumber.startsWith(block));
        
        // Time filter
        const timeMatch = !time || checkTimeRange(feedback.createdAt, time);
        
        // Assignee filter
        const assigneeMatch = !assignee || checkAssigneeFilter(feedback, assignee);
        
        return searchMatch && categoryMatch && blockMatch && timeMatch && assigneeMatch;
    });
    
    displayFeedbacks();
    console.log(`Filtered ${filteredFeedbacks.length} out of ${feedbacks.length} feedbacks`);
}

// Check time range
function checkTimeRange(dateString, range) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    switch(range) {
        case 'today':
            return date.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return date >= monthAgo;
        default:
            return true;
    }
}

// Check assignee filter
function checkAssigneeFilter(feedback, filter) {
    switch(filter) {
        case 'assigned':
            return !!feedback.assignedToName;
        case 'unassigned':
            return !feedback.assignedToName;
        default:
            return true;
    }
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('blockFilter').value = '';
    document.getElementById('timeFilter').value = '';
    document.getElementById('assigneeFilter').value = '';
    
    filteredFeedbacks = [...feedbacks];
    displayFeedbacks();
    showAlert('Đã xóa tất cả bộ lọc!', 'info');
}

// Open feedback modal
function openFeedbackModal(feedbackId) {
    currentFeedback = feedbacks.find(f => f.id == feedbackId);
    if (!currentFeedback) return;
    
    // Populate modal
    document.getElementById('feedbackTitle').textContent = currentFeedback.title;
    document.getElementById('apartmentInfo').textContent = `${currentFeedback.apartmentNumber || 'N/A'} - ${currentFeedback.residentName || 'N/A'}`;
    document.getElementById('createdTime').textContent = formatDate(currentFeedback.createdAt);
    document.getElementById('feedbackContent').textContent = currentFeedback.content || 'Không có nội dung';
    
    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.className = `badge ${getStatusBadgeClass(currentFeedback.status)}`;
    statusBadge.textContent = getStatusText(currentFeedback.status);
    
    // Priority badge
    const priorityBadge = document.getElementById('priorityBadge');
    if (currentFeedback.priority) {
        priorityBadge.className = `badge ${getPriorityBadgeClass(currentFeedback.priority)}`;
        priorityBadge.textContent = getPriorityText(currentFeedback.priority);
        priorityBadge.style.display = 'inline';
    } else {
        priorityBadge.style.display = 'none';
    }
    
    // Category badge
    const categoryBadge = document.getElementById('categoryBadge');
    categoryBadge.textContent = currentFeedback.category || 'Khác';
    
    // Set form values
    document.getElementById('statusSelect').value = currentFeedback.status || 'PENDING';
    document.getElementById('assigneeSelect').value = currentFeedback.assignedTo || '';
    document.getElementById('responseTextarea').value = currentFeedback.response || '';
    
    // Show response section if exists
    const responseSection = document.getElementById('responseSection');
    const responseContent = document.getElementById('responseContent');
    if (currentFeedback.response) {
        responseContent.textContent = currentFeedback.response;
        responseSection.style.display = 'block';
    } else {
        responseSection.style.display = 'none';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    modal.show();
}

// Update feedback
async function updateFeedback() {
    if (!currentFeedback) return;
    
    const updateData = {
        status: document.getElementById('statusSelect').value,
        response: document.getElementById('responseTextarea').value,
        assignedToUsername: document.getElementById('assigneeSelect').value
    };
    
    showLoading(true);
    
    try {
        let response;
        
        // Update status
        if (updateData.status !== currentFeedback.status) {
            response = await fetch(`${API_BASE_URL.replace('/admin/', '/admin-technician/')}/${currentFeedback.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    status: updateData.status,
                    response: updateData.response,
                    assignedToUsername: updateData.assignedToUsername
                })
            });
        }
        
        // Assign feedback
        if (updateData.assignedToUsername && updateData.assignedToUsername !== currentFeedback.assignedTo) {
            response = await fetch(`${API_BASE_URL}/${currentFeedback.id}/assign`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    assignedToUsername: updateData.assignedToUsername
                })
            });
        }

        if (response && response.ok) {
            const apiResult = await response.json();
            if (apiResult.status) {
                showAlert('Cập nhật phản ánh thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide();
                await loadFeedbacks();
                await loadStatistics();
            } else {
                const errorMessage = apiResult.userMessage || apiResult.message || 'Có lỗi xảy ra khi cập nhật!';
                showAlert(errorMessage, 'danger');
            }
        } else if (response) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Có lỗi xảy ra khi cập nhật!';
            showAlert(errorMessage, 'danger');
        }
        
    } catch (error) {
        console.error('Error updating feedback:', error);
        showAlert('Có lỗi xảy ra. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Quick assign
async function quickAssign(feedbackId) {
    // Simple prompt for demo - replace with proper modal
    const assignee = prompt('Nhập tên đăng nhập người xử lý:');
    if (!assignee) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/${feedbackId}/assign`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                assignedToUsername: assignee
            })
        });

        if (response.ok) {
            const apiResult = await response.json();
            if (apiResult.status) {
                showAlert('Phân công thành công!', 'success');
                await loadFeedbacks();
            } else {
                const errorMessage = apiResult.userMessage || apiResult.message || 'Có lỗi khi phân công!';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Có lỗi khi phân công!';
            showAlert(errorMessage, 'danger');
        }
        
    } catch (error) {
        console.error('Error assigning feedback:', error);
        showAlert('Có lỗi xảy ra. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Quick resolve
async function quickResolve(feedbackId) {
    const response = confirm('Bạn có chắc chắn muốn đánh dấu phản ánh này là đã giải quyết?');
    if (!response) return;
    
    showLoading(true);
    
    try {
        const apiResponse = await fetch(`${API_BASE_URL.replace('/admin/', '/admin-technician/')}/${feedbackId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                status: 'RESOLVED',
                response: 'Đã giải quyết'
            })
        });

        if (apiResponse.ok) {
            const apiResult = await apiResponse.json();
            if (apiResult.status) {
                showAlert('Đã đánh dấu giải quyết thành công!', 'success');
                await loadFeedbacks();
                await loadStatistics();
            } else {
                const errorMessage = apiResult.userMessage || apiResult.message || 'Có lỗi khi cập nhật trạng thái!';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await apiResponse.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Có lỗi khi cập nhật trạng thái!';
            showAlert(errorMessage, 'danger');
        }
        
    } catch (error) {
        console.error('Error resolving feedback:', error);
        showAlert('Có lỗi xảy ra. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Toggle feedback selection for bulk actions
function toggleFeedbackSelection(feedbackId) {
    const index = selectedFeedbacks.indexOf(feedbackId);
    if (index > -1) {
        selectedFeedbacks.splice(index, 1);
    } else {
        selectedFeedbacks.push(feedbackId);
    }
}

// Bulk actions
function bulkActions() {
    if (selectedFeedbacks.length === 0) {
        showAlert('Vui lòng chọn ít nhất một phản ánh!', 'warning');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('bulkModal'));
    modal.show();
}

// Populate bulk values based on action
function populateBulkValues(action, selectElement) {
    selectElement.innerHTML = '';
    
    switch(action) {
        case 'assign':
            selectElement.innerHTML = `
                <option value="">Chọn người xử lý</option>
                <option value="tech1">Kỹ thuật viên 1</option>
                <option value="tech2">Kỹ thuật viên 2</option>
                <option value="manager">Quản lý</option>
            `;
            break;
        case 'status':
            selectElement.innerHTML = `
                <option value="">Chọn trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
            `;
            break;
        case 'priority':
            selectElement.innerHTML = `
                <option value="">Chọn độ ưu tiên</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
            `;
            break;
    }
}

// Execute bulk action
async function executeBulkAction() {
    const action = document.getElementById('bulkAction').value;
    const value = document.getElementById('bulkValueSelect').value;
    
    if (!action || !value) {
        showAlert('Vui lòng chọn đầy đủ thông tin!', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        // Execute bulk action for each selected feedback
        const promises = selectedFeedbacks.map(async (feedbackId) => {
            let url, body;
            
            switch(action) {
                case 'assign':
                    url = `${API_BASE_URL}/${feedbackId}/assign`;
                    body = { assignedToUsername: value };
                    break;
                case 'status':
                    url = `${API_BASE_URL.replace('/admin/', '/admin-technician/')}/${feedbackId}`;
                    body = { status: value, response: `Cập nhật hàng loạt: ${getStatusText(value)}` };
                    break;
                default:
                    return Promise.resolve();
            }
            
            return fetch(url, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });
        });
        
        await Promise.all(promises);
        
        showAlert(`Đã thực hiện thao tác cho ${selectedFeedbacks.length} phản ánh!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('bulkModal')).hide();
        
        // Clear selections
        selectedFeedbacks = [];
        document.querySelectorAll('.bulk-checkbox').forEach(cb => cb.checked = false);
        
        await loadFeedbacks();
        await loadStatistics();
        
    } catch (error) {
        console.error('Error executing bulk action:', error);
        showAlert('Có lỗi xảy ra khi thực hiện thao tác hàng loạt!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Send notification
function sendNotification() {
    showAlert('Chức năng gửi thông báo đang được phát triển!', 'info');
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}