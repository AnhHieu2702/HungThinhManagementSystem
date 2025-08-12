// Maintenance Management System - Complete Implementation with Bootstrap Icons
const API_BASE_URL = 'http://localhost:8080/api/admin/maintenances';

// Global variables
let maintenances = [];
let filteredMaintenances = [];
let currentMaintenance = null;
let currentDate = new Date(2025, 7, 7); // August 7, 2025 (month is 0-indexed)
let selectedDate = null;

// Data mappings
const priorityMapping = {
    'LOW': 'Thấp',
    'MEDIUM': 'Trung bình', 
    'HIGH': 'Cao',
    'URGENT': 'Khẩn cấp'
};

const statusMapping = {
    'PENDING': 'Đang chờ',
    'IN_PROGRESS': 'Đang thực hiện',
    'COMPLETED': 'Hoàn thành',
    'OVERDUE': 'Quá hạn'
};

const deviceTypeMapping = {
    'ELEVATOR': 'Thang máy',
    'FIRE_SYSTEM': 'Hệ thống PCCC',
    'WATER_PUMP': 'Máy bơm nước',
    'VENTILATION': 'Hệ thống thông gió',
    'ELECTRICAL': 'Hệ thống điện',
    'SECURITY': 'An ninh',
    'OTHER': 'Khác'
};

const technicianMapping = {
    'tech1': 'Nguyễn Văn Tú',
    'tech2': 'Lê Minh An',
    'tech3': 'Trần Đức Hùng',
    'tech4': 'Đội vệ sinh',
    'manager': 'Quản lý kỹ thuật'
};

// Alert function
function showAlert(message, type) {
    console.log(`[ALERT] ${type.toUpperCase()}: ${message}`);
    
    document.querySelectorAll('.custom-alert').forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible custom-alert`;
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
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

    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);

    alertDiv.querySelector('.btn-close').addEventListener('click', () => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    });
}

// Create maintenance modal
function createMaintenanceModal() {
    if (document.getElementById('maintenanceModal')) return;

    const modalHTML = `
        <div class="modal fade" id="maintenanceModal" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalTitle">Chi tiết bảo trì</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Tên nhiệm vụ *</label>
                                    <input type="text" class="form-control" id="maintenanceTitle" placeholder="Nhập tên nhiệm vụ">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Loại thiết bị</label>
                                    <select class="form-select" id="deviceType">
                                        <option value="ELEVATOR">Thang máy</option>
                                        <option value="FIRE_SYSTEM">Hệ thống PCCC</option>
                                        <option value="WATER_PUMP">Máy bơm nước</option>
                                        <option value="VENTILATION">Hệ thống thông gió</option>
                                        <option value="ELECTRICAL">Hệ thống điện</option>
                                        <option value="SECURITY">An ninh</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Mã thiết bị</label>
                                    <input type="text" class="form-control" id="deviceCode" placeholder="VD: ELV-A-001">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Vị trí</label>
                                    <input type="text" class="form-control" id="location" placeholder="VD: Tòa A - Tầng 15">
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Ngày thực hiện *</label>
                                    <input type="date" class="form-control" id="scheduledDate">
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <label class="form-label">Thời gian bắt đầu *</label>
                                        <input type="time" class="form-control" id="startTime">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">Thời gian kết thúc *</label>
                                        <input type="time" class="form-control" id="endTime">
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Người thực hiện</label>
                                    <select class="form-select" id="assignedTechnician">
                                        <option value="">Chọn người thực hiện</option>
                                        <option value="tech1">Nguyễn Văn Tú</option>
                                        <option value="tech2">Lê Minh An</option>
                                        <option value="tech3">Trần Đức Hùng</option>
                                        <option value="tech4">Đội vệ sinh</option>
                                        <option value="manager">Quản lý kỹ thuật</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Mức độ ưu tiên</label>
                                    <select class="form-select" id="priority">
                                        <option value="LOW">Thấp</option>
                                        <option value="MEDIUM">Trung bình</option>
                                        <option value="HIGH">Cao</option>
                                        <option value="URGENT">Khẩn cấp</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Mô tả công việc</label>
                            <textarea class="form-control" id="description" rows="3" placeholder="Mô tả chi tiết công việc cần thực hiện..."></textarea>
                        </div>
                        
                        <div class="mb-3" id="statusSection" style="display: none;">
                            <label class="form-label">Trạng thái</label>
                            <select class="form-select" id="status">
                                <option value="PENDING">Đang chờ</option>
                                <option value="IN_PROGRESS">Đang thực hiện</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="OVERDUE">Quá hạn</option>
                            </select>
                        </div>
                        
                        <div class="mb-3" id="notesSection" style="display: none;">
                            <label class="form-label">Ghi chú</label>
                            <textarea class="form-control" id="notes" rows="2" placeholder="Ghi chú về quá trình thực hiện..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button type="button" class="btn btn-primary" id="saveMaintenanceBtn">Lưu</button>
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
}

// Wait for DOM elements
function waitForElements() {
    return new Promise((resolve) => {
        const checkElements = () => {
            const calendarDays = document.getElementById('calendarDays');
            const tableBody = document.getElementById('maintenanceTableBody');
            const quickTasks = document.getElementById('quickTasksList');
            const bootstrap = typeof window.bootstrap !== 'undefined';
            
            if (calendarDays && tableBody && quickTasks && bootstrap) {
                resolve();
            } else {
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Maintenance Management System Loading...');
    console.log(`👤 Current User: trang204`);
    console.log(`📅 Current Time: ${new Date().toISOString()}`);
    
    try {
        await waitForElements();
        createMaintenanceModal();
        setupEventListeners();
        
        // Load sample data directly (no API call)
        loadSampleData();
        initCalendar();
        
        console.log('✅ System initialized successfully');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showAlert('Lỗi khởi tạo hệ thống!', 'danger');
    }
});

// Setup event listeners
function setupEventListeners() {
    // Add maintenance button
    const addBtn = document.getElementById('addMaintenanceBtn');
    if (addBtn) addBtn.addEventListener('click', () => openMaintenanceModal('add'));
    
    // Calendar navigation
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        initCalendar();
        updateCalendarWithTasks();
    });
    
    if (nextBtn) nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        initCalendar();
        updateCalendarWithTasks();
    });
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', applyStatusFilter);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openMaintenanceModal('add');
        }
        
        if (e.key === 'Escape') {
            selectedDate = null;
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            filteredMaintenances = [...maintenances];
            displayMaintenanceTable();
        }
    });
}

// Load sample data
function loadSampleData() {
    console.log('📡 Loading maintenance data...');
    showLoading(true);
    
    setTimeout(() => {
        maintenances = [
            {
                id: 1,
                title: 'Bảo trì định kỳ thang máy Tòa A',
                description: 'Kiểm tra và bảo dưỡng hệ thống thang máy chính',
                deviceType: 'ELEVATOR',
                deviceCode: 'ELV-A-001',
                location: 'Tòa A - Thang máy chính',
                scheduledDate: '2025-08-05',
                startTime: '08:00',
                endTime: '10:00',
                assignedTechnician: 'tech1',
                assignedTechnicianName: 'Nguyễn Văn Tú',
                priority: 'MEDIUM',
                status: 'COMPLETED',
                notes: 'Đã hoàn thành kiểm tra và bảo dưỡng',
                createdAt: '2025-08-01T08:00:00Z',
                updatedAt: '2025-08-05T10:30:00Z'
            },
            {
                id: 2,
                title: 'Kiểm tra hệ thống PCCC Tòa B',
                description: 'Kiểm tra hệ thống báo cháy và thiết bị chữa cháy',
                deviceType: 'FIRE_SYSTEM',
                deviceCode: 'FIRE-B-001',
                location: 'Tòa B - Hệ thống báo cháy',
                scheduledDate: '2025-08-05',
                startTime: '14:00',
                endTime: '16:00',
                assignedTechnician: 'tech2',
                assignedTechnicianName: 'Lê Minh An',
                priority: 'HIGH',
                status: 'IN_PROGRESS',
                notes: 'Đang thực hiện kiểm tra hệ thống',
                createdAt: '2025-08-01T09:00:00Z',
                updatedAt: '2025-08-05T14:20:00Z'
            },
            {
                id: 3,
                title: 'Sửa chữa máy bơm nước tầng hầm',
                description: 'Thay thế phụ tùng và kiểm tra hệ thống máy bơm',
                deviceType: 'WATER_PUMP',
                deviceCode: 'PMP-001',
                location: 'Tầng hầm - Máy bơm chính',
                scheduledDate: '2025-08-06',
                startTime: '16:30',
                endTime: '18:00',
                assignedTechnician: 'tech3',
                assignedTechnicianName: 'Trần Đức Hùng',
                priority: 'URGENT',
                status: 'PENDING',
                notes: '',
                createdAt: '2025-08-02T10:00:00Z',
                updatedAt: '2025-08-02T10:00:00Z'
            },
            {
                id: 4,
                title: 'Vệ sinh hệ thống thông gió',
                description: 'Vệ sinh và thay thế bộ lọc không khí',
                deviceType: 'VENTILATION',
                deviceCode: 'VENT-C-001',
                location: 'Tòa C - Hệ thống thông gió',
                scheduledDate: '2025-08-09',
                startTime: '08:00',
                endTime: '12:00',
                assignedTechnician: 'tech4',
                assignedTechnicianName: 'Đội vệ sinh',
                priority: 'LOW',
                status: 'PENDING',
                notes: '',
                createdAt: '2025-08-03T11:00:00Z',
                updatedAt: '2025-08-03T11:00:00Z'
            },
            {
                id: 5,
                title: 'Kiểm tra định kỳ hệ thống điện',
                description: 'Kiểm tra và đo đạc các thông số hệ thống điện dự phòng',
                deviceType: 'ELECTRICAL',
                deviceCode: 'ELEC-A-001',
                location: 'Tòa A - Tủ điện tổng',
                scheduledDate: '2025-08-10',
                startTime: '10:00',
                endTime: '15:00',
                assignedTechnician: 'manager',
                assignedTechnicianName: 'Quản lý kỹ thuật',
                priority: 'HIGH',
                status: 'PENDING',
                notes: '',
                createdAt: '2025-08-04T09:00:00Z',
                updatedAt: '2025-08-04T09:00:00Z'
            },
            {
                id: 6,
                title: 'Thay thế van nước tầng 8',
                description: 'Thay thế van điều khiển nước bị hỏng ở tầng 8',
                deviceType: 'WATER_PUMP',
                deviceCode: 'VALVE-008',
                location: 'Tầng 8 - Van điều khiển nước',
                scheduledDate: '2025-08-08',
                startTime: '13:00',
                endTime: '15:00',
                assignedTechnician: 'tech3',
                assignedTechnicianName: 'Trần Đức Hùng',
                priority: 'HIGH',
                status: 'OVERDUE',
                notes: 'Đã quá thời gian dự kiến, cần xử lý khẩn cấp',
                createdAt: '2025-08-05T08:00:00Z',
                updatedAt: '2025-08-08T16:00:00Z'
            }
        ];
        
        filteredMaintenances = [...maintenances];
        displayMaintenanceTable();
        displayQuickTasks();
        updateCalendarWithTasks();
        showLoading(false);
        
        showAlert('Tải dữ liệu thành công!', 'success');
    }, 1500);
}

// Initialize calendar
function initCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonth = document.getElementById('currentMonth');
    const currentYear = document.getElementById('currentYear');
    
    if (!calendarDays) return;
    
    if (currentMonth) currentMonth.textContent = currentDate.getMonth() + 1;
    if (currentYear) currentYear.textContent = currentDate.getFullYear();
    
    calendarDays.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    
    const dayOfWeek = firstDay.getDay();
    const adjustedStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - adjustedStart);
    
    const today = new Date(2025, 7, 7); // August 7, 2025
    
    for (let i = 0; i < 42; i++) {
        const currentCalendarDate = new Date(startDate);
        currentCalendarDate.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = currentCalendarDate.getDate();
        
        if (currentCalendarDate.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        
        if (currentCalendarDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        if (selectedDate && currentCalendarDate.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dayElement.classList.add('selected');
            selectedDate = new Date(currentCalendarDate);
            filterBySelectedDate();
        });
        
        calendarDays.appendChild(dayElement);
    }
}

// Update calendar with task indicators
function updateCalendarWithTasks() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    calendarDays.forEach(dayElement => {
        if (dayElement.classList.contains('other-month')) return;
        
        const dayNumber = parseInt(dayElement.textContent);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dayDate = new Date(year, month, dayNumber);
        
        const hasTask = maintenances.some(maintenance => {
            const taskDate = new Date(maintenance.scheduledDate);
            return taskDate.toDateString() === dayDate.toDateString();
        });
        
        if (hasTask) {
            dayElement.classList.add('has-task');
        } else {
            dayElement.classList.remove('has-task');
        }
    });
}

// Display maintenance table with ICON BUTTONS
function displayMaintenanceTable() {
    const tableBody = document.getElementById('maintenanceTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filteredMaintenances.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="empty-state">
                        <h6>Không có dữ liệu bảo trì</h6>
                        <p>Chưa có lịch bảo trì nào được lên lịch</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredMaintenances.forEach((maintenance, index) => {
        const row = createMaintenanceRow(maintenance, index);
        tableBody.appendChild(row);
    });
}

// Create maintenance table row with ICON BUTTONS
function createMaintenanceRow(maintenance, index) {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.1}s`;
    
    row.innerHTML = `
        <td>
            <div class="task-info">
                <div class="task-name">${maintenance.title || 'Không có tiêu đề'}</div>
                <div class="task-device">${maintenance.deviceCode || 'N/A'}</div>
                <div class="task-location">${maintenance.location || 'Không xác định'}</div>
            </div>
        </td>
        <td>${formatDate(maintenance.scheduledDate)}</td>
        <td>${formatTimeRange(maintenance.startTime, maintenance.endTime)}</td>
        <td>${maintenance.assignedTechnicianName || 'Chưa phân công'}</td>
        <td><span class="priority-badge ${getPriorityClass(maintenance.priority)}">${priorityMapping[maintenance.priority] || 'Thấp'}</span></td>
        <td><span class="status-badge ${getStatusClass(maintenance.status)}">${statusMapping[maintenance.status] || 'Mới'}</span></td>
        <td>
            <div class="action-buttons">
                <button class="action-btn btn-view" title="Xem chi tiết" data-id="${maintenance.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn btn-edit" title="Chỉnh sửa" data-id="${maintenance.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                ${maintenance.status !== 'COMPLETED' ? 
                    `<button class="action-btn btn-complete" title="Hoàn thành" data-id="${maintenance.id}">
                        <i class="bi bi-check-lg"></i>
                    </button>` : ''
                }
                <button class="action-btn btn-delete" title="Xóa" data-id="${maintenance.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    // Add event listeners
    const viewBtn = row.querySelector('.btn-view');
    const editBtn = row.querySelector('.btn-edit');
    const completeBtn = row.querySelector('.btn-complete');
    const deleteBtn = row.querySelector('.btn-delete');
    
    if (viewBtn) viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMaintenanceModal('view', maintenance.id);
    });
    
    if (editBtn) editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMaintenanceModal('edit', maintenance.id);
    });
    
    if (completeBtn) completeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        completeMaintenance(maintenance.id);
    });
    
    if (deleteBtn) deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteMaintenance(maintenance.id);
    });
    
    return row;
}

// Display quick tasks
function displayQuickTasks() {
    const quickTasksList = document.getElementById('quickTasksList');
    if (!quickTasksList) return;
    
    const today = new Date(2025, 7, 7); // August 7, 2025
    const tomorrow = new Date(2025, 7, 8);
    
    const upcomingTasks = maintenances
        .filter(m => m.status !== 'COMPLETED')
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
        .slice(0, 6);
    
    quickTasksList.innerHTML = '';
    
    if (upcomingTasks.length === 0) {
        quickTasksList.innerHTML = `
            <div class="empty-state">
                <h6>Không có nhiệm vụ sắp tới</h6>
                <p>Tất cả nhiệm vụ đã hoàn thành</p>
            </div>
        `;
        return;
    }
    
    upcomingTasks.forEach((task, index) => {
        const taskElement = createQuickTaskElement(task, today, tomorrow, index);
        quickTasksList.appendChild(taskElement);
    });
}

// Create quick task element
function createQuickTaskElement(task, today, tomorrow, index) {
    const taskDate = new Date(task.scheduledDate);
    let statusClass = 'available';
    let statusText = 'Sẵn sàng';
    
    if (taskDate.toDateString() === today.toDateString()) {
        statusClass = 'urgent';
        statusText = 'Hôm nay';
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
        statusClass = 'scheduled';
        statusText = 'Ngày mai';
    } else if (taskDate < today) {
        statusClass = 'urgent';
        statusText = 'Quá hạn';
    }
    
    const taskElement = document.createElement('div');
    taskElement.className = 'quick-task-item';
    taskElement.style.animationDelay = `${index * 0.1}s`;
    
    taskElement.innerHTML = `
        <div class="quick-task-content">
            <div class="quick-task-title">${task.title}</div>
            <div class="quick-task-time">${formatTimeRange(task.startTime, task.endTime)}, ${formatDateShort(task.scheduledDate)}</div>
        </div>
        <div class="quick-task-status ${statusClass}">${statusText}</div>
    `;
    
    taskElement.addEventListener('click', () => {
        openMaintenanceModal('view', task.id);
    });
    
    return taskElement;
}

// Open maintenance modal
function openMaintenanceModal(mode, maintenanceId = null) {
    if (!document.getElementById('maintenanceModal')) {
        createMaintenanceModal();
    }
    
    currentMaintenance = null;
    if (maintenanceId) {
        currentMaintenance = maintenances.find(m => m.id == maintenanceId);
        if (!currentMaintenance) {
            showAlert('Không tìm thấy dữ liệu bảo trì!', 'danger');
            return;
        }
    }
    
    setTimeout(() => {
        try {
            const modalTitle = document.getElementById('modalTitle');
            const saveBtn = document.getElementById('saveMaintenanceBtn');
            const statusSection = document.getElementById('statusSection');
            const notesSection = document.getElementById('notesSection');
            
            switch(mode) {
                case 'add':
                    modalTitle.textContent = 'Thêm lịch bảo trì';
                    saveBtn.textContent = 'Thêm mới';
                    saveBtn.style.display = 'block';
                    statusSection.style.display = 'none';
                    notesSection.style.display = 'none';
                    enableFormInputs(true);
                    clearForm();
                    break;
                case 'view':
                    modalTitle.textContent = 'Chi tiết bảo trì';
                    saveBtn.style.display = 'none';
                    statusSection.style.display = 'block';
                    notesSection.style.display = 'block';
                    enableFormInputs(false);
                    break;
                case 'edit':
                    modalTitle.textContent = 'Chỉnh sửa bảo trì';
                    saveBtn.textContent = 'Cập nhật';
                    saveBtn.style.display = 'block';
                    statusSection.style.display = 'block';
                    notesSection.style.display = 'block';
                    enableFormInputs(true);
                    break;
            }
            
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', () => saveMaintenance(mode));
            
            if (currentMaintenance) {
                populateForm(currentMaintenance);
            }
            
            const modal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
            modal.show();
            
        } catch (error) {
            showAlert('Lỗi khi mở modal: ' + error.message, 'danger');
        }
    }, 100);
}

// Helper functions
function enableFormInputs(enabled) {
    const fieldIds = [
        'maintenanceTitle', 'deviceType', 'deviceCode', 'location',
        'scheduledDate', 'startTime', 'endTime', 'assignedTechnician',
        'priority', 'description', 'status', 'notes'
    ];
    
    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.disabled = !enabled;
            field.style.backgroundColor = enabled ? '' : '#f8f9fa';
        }
    });
}

function clearForm() {
    const fieldIds = [
        'maintenanceTitle', 'deviceCode', 'location', 'scheduledDate',
        'startTime', 'endTime', 'description', 'notes'
    ];
    
    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    document.getElementById('deviceType').value = 'ELEVATOR';
    document.getElementById('priority').value = 'MEDIUM';
    document.getElementById('assignedTechnician').value = '';
    document.getElementById('status').value = 'PENDING';
}

function populateForm(maintenance) {
    if (!maintenance) return;
    
    const fields = [
        { id: 'maintenanceTitle', value: maintenance.title },
        { id: 'deviceType', value: maintenance.deviceType },
        { id: 'deviceCode', value: maintenance.deviceCode },
        { id: 'location', value: maintenance.location },
        { id: 'scheduledDate', value: maintenance.scheduledDate },
        { id: 'startTime', value: maintenance.startTime },
        { id: 'endTime', value: maintenance.endTime },
        { id: 'assignedTechnician', value: maintenance.assignedTechnician || '' },
        { id: 'priority', value: maintenance.priority },
        { id: 'description', value: maintenance.description },
        { id: 'status', value: maintenance.status },
        { id: 'notes', value: maintenance.notes }
    ];
    
    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });
}

function saveMaintenance(mode) {
    const formData = {
        title: document.getElementById('maintenanceTitle')?.value?.trim(),
        deviceType: document.getElementById('deviceType')?.value,
        deviceCode: document.getElementById('deviceCode')?.value?.trim(),
        location: document.getElementById('location')?.value?.trim(),
        scheduledDate: document.getElementById('scheduledDate')?.value,
        startTime: document.getElementById('startTime')?.value,
        endTime: document.getElementById('endTime')?.value,
        assignedTechnician: document.getElementById('assignedTechnician')?.value || null,
        priority: document.getElementById('priority')?.value,
        description: document.getElementById('description')?.value?.trim(),
        status: document.getElementById('status')?.value,
        notes: document.getElementById('notes')?.value?.trim()
    };
    
    const errors = [];
    if (!formData.title) errors.push('Tên nhiệm vụ là bắt buộc');
    if (!formData.scheduledDate) errors.push('Ngày thực hiện là bắt buộc');
    if (!formData.startTime) errors.push('Thời gian bắt đầu là bắt buộc');
    if (!formData.endTime) errors.push('Thời gian kết thúc là bắt buộc');
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        errors.push('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
    }
    
    if (errors.length > 0) {
        showAlert(`Vui lòng kiểm tra:\n${errors.join('\n')}`, 'warning');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        try {
            if (mode === 'add') {
                const newMaintenance = {
                    ...formData,
                    id: Math.max(...maintenances.map(m => m.id), 0) + 1,
                    assignedTechnicianName: formData.assignedTechnician ? technicianMapping[formData.assignedTechnician] : null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                maintenances.push(newMaintenance);
                showAlert('Thêm lịch bảo trì thành công!', 'success');
                
            } else if (mode === 'edit' && currentMaintenance) {
                const index = maintenances.findIndex(m => m.id === currentMaintenance.id);
                if (index !== -1) {
                    maintenances[index] = {
                        ...maintenances[index],
                        ...formData,
                        assignedTechnicianName: formData.assignedTechnician ? technicianMapping[formData.assignedTechnician] : null,
                        updatedAt: new Date().toISOString()
                    };
                }
                showAlert('Cập nhật bảo trì thành công!', 'success');
            }
            
            filteredMaintenances = [...maintenances];
            displayMaintenanceTable();
            displayQuickTasks();
            updateCalendarWithTasks();
            
            const modalElement = document.getElementById('maintenanceModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
        } catch (error) {
            showAlert('Lỗi khi lưu: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 1200);
}

function completeMaintenance(maintenanceId) {
    const maintenance = maintenances.find(m => m.id === maintenanceId);
    if (!maintenance) {
        showAlert('Không tìm thấy dữ liệu bảo trì!', 'danger');
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn đánh dấu nhiệm vụ "${maintenance.title}" đã hoàn thành?`)) {
        showLoading(true);
        
        setTimeout(() => {
            const index = maintenances.findIndex(m => m.id === maintenanceId);
            if (index !== -1) {
                maintenances[index].status = 'COMPLETED';
                maintenances[index].updatedAt = new Date().toISOString();
                if (!maintenances[index].notes) {
                    maintenances[index].notes = 'Đã hoàn thành nhiệm vụ bảo trì';
                }
                
                filteredMaintenances = [...maintenances];
                displayMaintenanceTable();
                displayQuickTasks();
                updateCalendarWithTasks();
                
                showAlert('Đã đánh dấu hoàn thành!', 'success');
            }
            showLoading(false);
        }, 800);
    }
}

function deleteMaintenance(maintenanceId) {
    const maintenance = maintenances.find(m => m.id === maintenanceId);
    if (!maintenance) {
        showAlert('Không tìm thấy dữ liệu bảo trì!', 'danger');
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa lịch bảo trì "${maintenance.title}"?\nThao tác này không thể hoàn tác!`)) {
        showLoading(true);
        
        setTimeout(() => {
            const index = maintenances.findIndex(m => m.id === maintenanceId);
            if (index !== -1) {
                maintenances.splice(index, 1);
                
                filteredMaintenances = [...maintenances];
                displayMaintenanceTable();
                displayQuickTasks();
                updateCalendarWithTasks();
                
                showAlert('Đã xóa lịch bảo trì!', 'success');
            }
            showLoading(false);
        }, 800);
    }
}

function applyStatusFilter() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    
    if (statusFilter === '') {
        filteredMaintenances = [...maintenances];
    } else {
        filteredMaintenances = maintenances.filter(maintenance => 
            maintenance.status === statusFilter
        );
    }
    
    displayMaintenanceTable();
}

function filterBySelectedDate() {
    if (!selectedDate) {
        filteredMaintenances = [...maintenances];
    } else {
        filteredMaintenances = maintenances.filter(maintenance => {
            const taskDate = new Date(maintenance.scheduledDate);
            return taskDate.toDateString() === selectedDate.toDateString();
        });
    }
    
    displayMaintenanceTable();
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

function formatDateShort(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';
    return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`;
}

function getPriorityClass(priority) {
    const priorityClasses = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'URGENT': 'urgent'
    };
    return priorityClasses[priority] || 'low';
}

function getStatusClass(status) {
    const statusClasses = {
        'PENDING': 'pending',
        'IN_PROGRESS': 'in-progress',
        'COMPLETED': 'completed',
        'OVERDUE': 'overdue'
    };
    return statusClasses[status] || 'pending';
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Export system for debugging
window.MaintenanceSystem = {
    maintenances,
    filteredMaintenances,
    currentMaintenance,
    currentDate,
    selectedDate,
    openMaintenanceModal,
    showAlert,
    loadSampleData,
    displayMaintenanceTable,
    displayQuickTasks,
    updateCalendarWithTasks,
    initCalendar
};

console.log('📦 Maintenance Management System loaded successfully!');
console.log('🎯 Features: Bootstrap 5.3.0, Bootstrap Icons, Calendar, CRUD operations');
console.log('👤 Current User: trang204');
console.log(`📅 System Time: ${new Date().toISOString()}`);