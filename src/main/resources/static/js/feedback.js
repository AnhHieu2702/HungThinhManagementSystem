// Feedback Management System - Complete Demo Version
const API_BASE_URL = 'http://localhost:8080/api/admin/feedbacks';

// Global variables
let feedbacks = [];
let filteredFeedbacks = [];
let currentFeedback = null;
let currentMode = 'view';

// Category mapping for display
const categoryMapping = {
    'ELECTRICAL': 'Điện',
    'WATER': 'Nước', 
    'ELEVATOR': 'Thang máy',
    'SECURITY': 'An ninh',
    'CLEANING': 'Vệ sinh',
    'OTHER': 'Khác'
};

// Priority mapping for display
const priorityMapping = {
    'LOW': 'Thấp',
    'MEDIUM': 'Trung bình',
    'HIGH': 'Cao',
    'URGENT': 'Khẩn cấp'
};

// Status mapping for display
const statusMapping = {
    'NEW': 'Mới',
    'IN_PROGRESS': 'Đang xử lý',
    'RESOLVED': 'Đã giải quyết',
    'REJECTED': 'Từ chối'
};

// Assignee mapping
const assigneeMapping = {
    'tech1': 'Kỹ thuật viên - Hoàng Văn E',
    'tech2': 'Kỹ thuật viên - Nguyễn Văn F',
    'security': 'Bảo vệ - Trần Văn G',
    'cleaner': 'Vệ sinh - Lê Thị H',
    'manager': 'Quản lý - Phạm Thị I'
};

// Alert function with better styling
function showAlert(message, type) {
    console.log(`[ALERT] ${type.toUpperCase()}: ${message}`);
    
    // Remove existing alerts
    document.querySelectorAll('.custom-alert').forEach(alert => {
        alert.remove();
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
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);

    // Show animation
    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateY(0)';
    }, 100);

    // Auto hide after 4 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);

    // Close button handler
    alertDiv.querySelector('.btn-close').addEventListener('click', () => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    });
}

// Create modal dynamically
function createModal() {
    if (document.getElementById('feedbackModal')) {
        console.log('Modal already exists');
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="feedbackModal" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalTitle">Chi tiết phản ánh</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="feedback-details">
                                    <div class="mb-3">
                                        <label class="form-label">Tiêu đề</label>
                                        <input type="text" class="form-control" id="feedbackTitle" readonly>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Danh mục</label>
                                            <select class="form-select" id="feedbackCategory" disabled>
                                                <option value="ELECTRICAL">Điện</option>
                                                <option value="WATER">Nước</option>
                                                <option value="ELEVATOR">Thang máy</option>
                                                <option value="SECURITY">An ninh</option>
                                                <option value="CLEANING">Vệ sinh</option>
                                                <option value="OTHER">Khác</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Mức độ ưu tiên</label>
                                            <select class="form-select" id="feedbackPriority">
                                                <option value="LOW">Thấp</option>
                                                <option value="MEDIUM">Trung bình</option>
                                                <option value="HIGH">Cao</option>
                                                <option value="URGENT">Khẩn cấp</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Mô tả chi tiết</label>
                                        <textarea class="form-control" id="feedbackDescription" rows="4" readonly></textarea>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Người phụ trách</label>
                                            <select class="form-select" id="feedbackAssignee">
                                                <option value="">Chưa phân công</option>
                                                <option value="tech1">Kỹ thuật viên - Hoàng Văn E</option>
                                                <option value="tech2">Kỹ thuật viên - Nguyễn Văn F</option>
                                                <option value="security">Bảo vệ - Trần Văn G</option>
                                                <option value="cleaner">Vệ sinh - Lê Thị H</option>
                                                <option value="manager">Quản lý - Phạm Thị I</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Trạng thái</label>
                                            <select class="form-select" id="feedbackStatus">
                                                <option value="NEW">Mới</option>
                                                <option value="IN_PROGRESS">Đang xử lý</option>
                                                <option value="RESOLVED">Đã giải quyết</option>
                                                <option value="REJECTED">Từ chối</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Ghi chú xử lý</label>
                                        <textarea class="form-control" id="feedbackNotes" rows="3" placeholder="Nhập ghi chú về quá trình xử lý..."></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4">
                                <div class="feedback-info">
                                    <h6 class="mb-3">Thông tin bổ sung</h6>
                                    
                                    <div class="info-card mb-3">
                                        <div class="info-item">
                                            <span class="info-label">Người gửi:</span>
                                            <span class="info-value" id="feedbackSender">-</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Căn hộ:</span>
                                            <span class="info-value" id="feedbackApartment">-</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Thời gian tạo:</span>
                                            <span class="info-value" id="feedbackCreatedAt">-</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Cập nhật lần cuối:</span>
                                            <span class="info-value" id="feedbackUpdatedAt">-</span>
                                        </div>
                                    </div>
                                    
                                    <div class="attachment-section">
                                        <h6 class="mb-2">Hình ảnh đính kèm</h6>
                                        <div id="feedbackAttachments" class="attachment-grid">
                                            <p class="text-muted">Không có hình ảnh đính kèm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="saveFeedbackBtn">Cập nhật</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="loadingOverlay" class="loading-overlay" style="display: none;">
            <div class="text-center">
                <div class="spinner-border text-primary mb-2" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="text-white">Đang xử lý...</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Modal created successfully');
}

// Wait for DOM elements
function waitForElements() {
    return new Promise((resolve) => {
        const checkElements = () => {
            const container = document.getElementById('feedbackContainer');
            const bootstrap = typeof window.bootstrap !== 'undefined';
            
            if (container && bootstrap) {
                console.log('✅ All required elements found');
                resolve();
            } else {
                console.log('⏳ Waiting for elements...');
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Feedback Management System Loading...');
    
    try {
        await waitForElements();
        createModal();
        setupEventListeners();
        loadSampleData();
        console.log('✅ System initialized successfully');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showAlert('Lỗi khởi tạo hệ thống!', 'danger');
    }
});

// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Filter buttons
    const clearBtn = document.getElementById('clearFiltersBtn');
    const applyBtn = document.getElementById('applyFiltersBtn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    
    // Filter inputs
    const filterElements = [
        'searchInput', 'categoryFilter', 'blockFilter', 
        'timeFilter', 'assigneeFilter', 'priorityFilter'
    ];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        }
    });
    
    console.log('✅ Event listeners setup completed');
}

// Load sample data
function loadSampleData() {
    console.log('📡 Loading sample data...');
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        feedbacks = [
            {
                id: 1,
                title: 'Thang máy tòa A bị kẹt tầng 15',
                description: 'Thang máy số 2 tòa A bị kẹt ở tầng 15 từ 8h sáng. Đã có 3 cư dân mắc kẹt bên trong, cần xử lý khẩn cấp.',
                category: 'ELEVATOR',
                priority: 'URGENT',
                status: 'NEW',
                senderName: 'Nguyễn Văn Minh',
                apartmentNumber: 'A-1501',
                assigneeName: null,
                assigneeId: null,
                createdAt: '2025-08-05T08:30:00Z',
                updatedAt: '2025-08-05T08:30:00Z',
                notes: '',
                attachments: []
            },
            {
                id: 2,
                title: 'Mất điện khu vực tầng 12 tòa B',
                description: 'Toàn bộ tầng 12 tòa B bị mất điện từ 14h hôm qua, ảnh hưởng đến 8 căn hộ. Thang máy cũng không hoạt động.',
                category: 'ELECTRICAL',
                priority: 'HIGH',
                status: 'IN_PROGRESS',
                senderName: 'Trần Thị Lan',
                apartmentNumber: 'B-1205',
                assigneeName: 'Kỹ thuật viên - Hoàng Văn E',
                assigneeId: 'tech1',
                createdAt: '2025-08-04T14:00:00Z',
                updatedAt: '2025-08-05T09:15:00Z',
                notes: 'Đã liên hệ với đội kỹ thuật điện. Đang kiểm tra hệ thống điện chính.',
                attachments: []
            },
            {
                id: 3,
                title: 'Vệ sinh khu vực sảnh tòa C chưa đạt yêu cầu',
                description: 'Khu vực sảnh tòa C và khu vực xung quanh thang máy chưa được vệ sinh sạch sẽ. Có nhiều rác thải và bụi bẩn.',
                category: 'CLEANING',
                priority: 'MEDIUM',
                status: 'RESOLVED',
                senderName: 'Lê Văn Hùng',
                apartmentNumber: 'C-305',
                assigneeName: 'Vệ sinh - Lê Thị H',
                assigneeId: 'cleaner',
                createdAt: '2025-08-04T16:15:00Z',
                updatedAt: '2025-08-05T10:30:00Z',
                notes: 'Đã hoàn thành vệ sinh toàn bộ khu vực sảnh và xung quanh thang máy.',
                attachments: []
            },
            {
                id: 4,
                title: 'Hệ thống nước nóng tòa A không hoạt động',
                description: 'Hệ thống nước nóng từ tầng 10-15 tòa A không hoạt động từ 2 ngày nay.',
                category: 'WATER',
                priority: 'HIGH',
                status: 'NEW',
                senderName: 'Phạm Thị Mai',
                apartmentNumber: 'A-1203',
                assigneeName: null,
                assigneeId: null,
                createdAt: '2025-08-03T09:20:00Z',
                updatedAt: '2025-08-03T09:20:00Z',
                notes: '',
                attachments: []
            },
            {
                id: 5,
                title: 'An ninh cần kiểm tra camera tầng hầm',
                description: 'Camera an ninh ở tầng hầm B1 và B2 không hoạt động, cần kiểm tra và sửa chữa.',
                category: 'SECURITY',
                priority: 'MEDIUM',
                status: 'IN_PROGRESS',
                senderName: 'Nguyễn Thị Hoa',
                apartmentNumber: 'B-808',
                assigneeName: 'Bảo vệ - Trần Văn G',
                assigneeId: 'security',
                createdAt: '2025-08-02T11:45:00Z',
                updatedAt: '2025-08-04T14:20:00Z',
                notes: 'Đã liên hệ với công ty bảo trì camera. Dự kiến sửa chữa trong tuần này.',
                attachments: []
            }
        ];
        
        filteredFeedbacks = [...feedbacks];
        displayFeedbacks();
        showLoading(false);
        
        console.log(`✅ Loaded ${feedbacks.length} sample feedbacks`);
        showAlert('Tải dữ liệu thành công!', 'success');
    }, 1500);
}

// Display feedbacks
function displayFeedbacks() {
    console.log(`🎨 Displaying ${filteredFeedbacks.length} feedbacks...`);
    const container = document.getElementById('feedbackContainer');
    
    if (!container) {
        console.error('❌ Feedback container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (filteredFeedbacks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                <h5>Không tìm thấy phản ánh nào</h5>
                <p class="text-muted">Thử thay đổi điều kiện tìm kiếm</p>
            </div>
        `;
        return;
    }
    
    filteredFeedbacks.forEach((feedback, index) => {
        const feedbackElement = createFeedbackElement(feedback, index);
        container.appendChild(feedbackElement);
    });
    
    console.log(`✅ Displayed ${filteredFeedbacks.length} feedback items`);
}

// Create feedback element
function createFeedbackElement(feedback, index) {
    const div = document.createElement('div');
    div.className = `feedback-item ${getStatusClass(feedback.status)}`;
    div.style.animationDelay = `${index * 0.1}s`;
    
    const priorityClass = feedback.priority ? feedback.priority.toLowerCase() : 'low';
    const statusClass = feedback.status ? feedback.status.toLowerCase().replace('_', '-') : 'new';
    
    div.innerHTML = `
        <div class="feedback-header">
            <div class="flex-grow-1">
                <div class="feedback-title">${feedback.title || 'Không có tiêu đề'}</div>
                <div class="feedback-meta">
                    <span><i class="fas fa-user"></i>${feedback.senderName || 'Không xác định'}</span>
                    <span><i class="fas fa-home"></i>${feedback.apartmentNumber || 'N/A'}</span>
                    <span><i class="fas fa-clock"></i>${formatDate(feedback.createdAt)}</span>
                </div>
            </div>
            <div class="feedback-badges">
                <span class="priority-badge ${priorityClass}">${priorityMapping[feedback.priority] || 'Thấp'}</span>
                <span class="status-badge ${statusClass}">${statusMapping[feedback.status] || 'Mới'}</span>
            </div>
        </div>
        
        <div class="feedback-description">
            ${feedback.description || 'Không có mô tả'}
        </div>
        
        <div class="feedback-footer">
            <div class="feedback-badges">
                <span class="category-badge">${categoryMapping[feedback.category] || 'Khác'}</span>
                ${feedback.assigneeName ? 
                    `<span class="text-muted"><i class="fas fa-user-cog me-1"></i>${feedback.assigneeName}</span>` : 
                    '<span class="text-muted"><i class="fas fa-user-slash me-1"></i>Chưa phân công</span>'
                }
            </div>
            <div class="feedback-actions">
                <button class="action-btn btn-view" type="button" title="Xem chi tiết">
                    <i class="fas fa-eye me-1"></i>Xem
                </button>
                <button class="action-btn btn-edit" type="button" title="Xử lý phản ánh">
                    <i class="fas fa-edit me-1"></i>Xử lý
                </button>
                ${!feedback.assigneeName ? 
                    `<button class="action-btn btn-assign" type="button" title="Phân công xử lý">
                        <i class="fas fa-user-plus me-1"></i>Phân công
                    </button>` : ''
                }
            </div>
        </div>
    `;
    
    // Event listeners for buttons
    const viewBtn = div.querySelector('.btn-view');
    const editBtn = div.querySelector('.btn-edit');
    const assignBtn = div.querySelector('.btn-assign');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            console.log(`👁️ View clicked: ${feedback.id}`);
            openModal('view', feedback.id);
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log(`✏️ Edit clicked: ${feedback.id}`);
            openModal('edit', feedback.id);
        });
    }
    
    if (assignBtn) {
        assignBtn.addEventListener('click', () => {
            console.log(`👤 Assign clicked: ${feedback.id}`);
            openModal('assign', feedback.id);
        });
    }
    
    return div;
}

// Open modal
function openModal(mode, feedbackId) {
    console.log(`🎭 Opening modal: ${mode} for ID: ${feedbackId}`);
    
    // Ensure modal exists
    if (!document.getElementById('feedbackModal')) {
        createModal();
    }
    
    // Find feedback
    currentFeedback = feedbacks.find(fb => fb.id == feedbackId);
    if (!currentFeedback) {
        showAlert('Không tìm thấy phản ánh này!', 'danger');
        return;
    }
    
    currentMode = mode;
    
    setTimeout(() => {
        try {
            const modalTitle = document.getElementById('modalTitle');
            const saveBtn = document.getElementById('saveFeedbackBtn');
            
            // Configure modal based on mode
            switch(mode) {
                case 'view':
                    modalTitle.textContent = 'Chi tiết phản ánh';
                    saveBtn.style.display = 'none';
                    enableFormInputs(false);
                    break;
                case 'edit':
                    modalTitle.textContent = 'Xử lý phản ánh';
                    saveBtn.textContent = 'Cập nhật';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true);
                    break;
                case 'assign':
                    modalTitle.textContent = 'Phân công xử lý';
                    saveBtn.textContent = 'Phân công';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true);
                    break;
            }
            
            // Setup save button
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', saveFeedback);
            
            // Populate form
            populateForm(currentFeedback);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
            modal.show();
            
            // Focus on assignee dropdown if assign mode
            if (mode === 'assign') {
                setTimeout(() => {
                    document.getElementById('feedbackAssignee')?.focus();
                }, 500);
            }
            
            console.log('✅ Modal opened successfully');
            
        } catch (error) {
            console.error('❌ Modal error:', error);
            showAlert('Lỗi khi mở modal: ' + error.message, 'danger');
        }
    }, 100);
}

// Enable/disable form inputs
function enableFormInputs(enabled) {
    const fieldConfigs = [
        { id: 'feedbackTitle', alwaysDisabled: true },
        { id: 'feedbackCategory', alwaysDisabled: true },
        { id: 'feedbackDescription', alwaysDisabled: true },
        { id: 'feedbackPriority', alwaysDisabled: false },
        { id: 'feedbackAssignee', alwaysDisabled: false },
        { id: 'feedbackStatus', alwaysDisabled: false },
        { id: 'feedbackNotes', alwaysDisabled: false }
    ];
    
    fieldConfigs.forEach(({ id, alwaysDisabled }) => {
        const field = document.getElementById(id);
        if (field) {
            field.disabled = alwaysDisabled || !enabled;
        }
    });
}

// Populate form
function populateForm(feedback) {
    if (!feedback) return;
    
    // Form fields
    const fields = [
        { id: 'feedbackTitle', value: feedback.title },
        { id: 'feedbackCategory', value: feedback.category },
        { id: 'feedbackDescription', value: feedback.description },
        { id: 'feedbackPriority', value: feedback.priority || 'LOW' },
        { id: 'feedbackAssignee', value: feedback.assigneeId },
        { id: 'feedbackStatus', value: feedback.status || 'NEW' },
        { id: 'feedbackNotes', value: feedback.notes }
    ];
    
    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });
    
    // Info fields
    const infoFields = [
        { id: 'feedbackSender', value: feedback.senderName },
        { id: 'feedbackApartment', value: feedback.apartmentNumber },
        { id: 'feedbackCreatedAt', value: formatDate(feedback.createdAt) },
        { id: 'feedbackUpdatedAt', value: formatDate(feedback.updatedAt) }
    ];
    
    infoFields.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || 'N/A';
    });
}

// Save feedback
async function saveFeedback() {
    console.log('💾 Saving feedback...');
    
    if (!currentFeedback) {
        showAlert('Không có dữ liệu để cập nhật!', 'danger');
        return;
    }
    
    // Get form data
    const formData = {
        priority: document.getElementById('feedbackPriority')?.value,
        assigneeId: document.getElementById('feedbackAssignee')?.value || null,
        status: document.getElementById('feedbackStatus')?.value,
        notes: document.getElementById('feedbackNotes')?.value
    };
    
    // Validation
    if (currentMode === 'assign' && !formData.assigneeId) {
        showAlert('Vui lòng chọn người phụ trách!', 'warning');
        return;
    }
    
    console.log('📋 Form data:', formData);
    showLoading(true);
    
    // Simulate save
    setTimeout(() => {
        try {
            // Update local data
            const index = feedbacks.findIndex(f => f.id === currentFeedback.id);
            if (index !== -1) {
                feedbacks[index] = {
                    ...feedbacks[index],
                    ...formData,
                    assigneeName: formData.assigneeId ? assigneeMapping[formData.assigneeId] : null,
                    updatedAt: new Date().toISOString()
                };
                
                filteredFeedbacks = [...feedbacks];
                displayFeedbacks();
            }
            
            const messages = {
                'view': 'Đã xem chi tiết!',
                'edit': 'Cập nhật phản ánh thành công!',
                'assign': 'Phân công xử lý thành công!'
            };
            
            showAlert(messages[currentMode], 'success');
            
            // Close modal
            const modalElement = document.getElementById('feedbackModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
            console.log('✅ Save completed successfully');
            
        } catch (error) {
            console.error('❌ Save error:', error);
            showAlert('Lỗi khi lưu: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 1200);
}

// Helper functions
function getStatusClass(status) {
    const statusClasses = {
        'NEW': 'new',
        'IN_PROGRESS': 'in-progress',
        'RESOLVED': 'resolved',
        'REJECTED': 'rejected'
    };
    return statusClasses[status] || 'new';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + 
           date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
}

function applyFilters() {
    console.log('🔍 Applying filters...');
    
    const filters = {
        search: document.getElementById('searchInput')?.value.toLowerCase() || '',
        category: document.getElementById('categoryFilter')?.value || '',
        block: document.getElementById('blockFilter')?.value || '',
        time: document.getElementById('timeFilter')?.value || '',
        assignee: document.getElementById('assigneeFilter')?.value || '',
        priority: document.getElementById('priorityFilter')?.value || ''
    };
    
    filteredFeedbacks = feedbacks.filter(feedback => {
        const searchMatch = !filters.search || 
            feedback.title?.toLowerCase().includes(filters.search) ||
            feedback.description?.toLowerCase().includes(filters.search) ||
            feedback.apartmentNumber?.toLowerCase().includes(filters.search) ||
            feedback.senderName?.toLowerCase().includes(filters.search);
        
        const categoryMatch = !filters.category || feedback.category === filters.category;
        const blockMatch = !filters.block || feedback.apartmentNumber?.includes(filters.block);
        const timeMatch = !filters.time || checkTimeRange(feedback.createdAt, filters.time);
        const assigneeMatch = !filters.assignee || 
            (filters.assignee === 'assigned' && feedback.assigneeName) ||
            (filters.assignee === 'unassigned' && !feedback.assigneeName);
        const priorityMatch = !filters.priority || feedback.priority === filters.priority;
        
        return searchMatch && categoryMatch && blockMatch && timeMatch && assigneeMatch && priorityMatch;
    });
    
    displayFeedbacks();
    console.log(`✅ Filters applied: ${filteredFeedbacks.length}/${feedbacks.length} items`);
}

function checkTimeRange(dateString, range) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    switch(range) {
        case 'today':
            return date.toDateString() === now.toDateString();
        case 'week':
            return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
            return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'quarter':
            return date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        default:
            return true;
    }
}

function clearFilters() {
    console.log('🧹 Clearing filters...');
    
    const filterIds = [
        'searchInput', 'categoryFilter', 'blockFilter', 
        'timeFilter', 'assigneeFilter', 'priorityFilter'
    ];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    filteredFeedbacks = [...feedbacks];
    displayFeedbacks();
    showAlert('Đã xóa tất cả bộ lọc!', 'info');
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// Global functions for debugging
window.FeedbackSystem = {
    feedbacks,
    filteredFeedbacks,
    openModal,
    showAlert,
    currentFeedback,
    currentMode
};

console.log('📦 Feedback Management System loaded successfully!');