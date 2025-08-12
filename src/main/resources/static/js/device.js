// Device Management System - Complete Demo Version
const API_BASE_URL = 'http://localhost:8080/api/admin/devices';

// Global variables
let devices = [];
let filteredDevices = [];
let currentDevice = null;
let currentMode = 'view';

// Device type mapping for display
const deviceTypeMapping = {
    'ELEVATOR': 'Thang máy',
    'GENERATOR': 'Máy phát điện', 
    'PUMP': 'Máy bơm',
    'AIR_CONDITIONER': 'Điều hòa',
    'CAMERA': 'Camera',
    'FIRE_ALARM': 'PCCC',
    'OTHER': 'Khác'
};

// Status mapping for display
const statusMapping = {
    'WORKING': 'Hoạt động tốt',
    'MAINTENANCE': 'Bảo trì',
    'BROKEN': 'Hỏng hóc',
    'INSPECTION': 'Chờ kiểm tra'
};

// Priority mapping for display
const priorityMapping = {
    'LOW': 'Thấp',
    'MEDIUM': 'Trung bình',
    'HIGH': 'Cao',
    'URGENT': 'Khẩn cấp'
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
        'success': 'bi bi-check-circle-fill',
        'danger': 'bi bi-exclamation-triangle-fill',
        'warning': 'bi bi-exclamation-triangle-fill',
        'info': 'bi bi-info-circle-fill'
    };
    
    const icon = iconMap[type] || 'bi bi-info-circle-fill';
    
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
    if (document.getElementById('deviceModal')) {
        console.log('Modal already exists');
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="deviceModal" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalTitle">Chi tiết thiết bị</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="device-details">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Tên thiết bị</label>
                                    <input type="text" class="form-control" id="deviceName" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Mã thiết bị</label>
                                    <input type="text" class="form-control" id="deviceCode" readonly>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Loại thiết bị</label>
                                    <select class="form-select" id="deviceType" disabled>
                                        <option value="ELEVATOR">Thang máy</option>
                                        <option value="GENERATOR">Máy phát điện</option>
                                        <option value="PUMP">Máy bơm</option>
                                        <option value="AIR_CONDITIONER">Điều hòa</option>
                                        <option value="CAMERA">Camera</option>
                                        <option value="FIRE_ALARM">PCCC</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Vị trí</label>
                                    <input type="text" class="form-control" id="deviceLocation" readonly>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Trạng thái</label>
                                    <select class="form-select" id="deviceStatus">
                                        <option value="WORKING">Hoạt động tốt</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                        <option value="BROKEN">Hỏng hóc</option>
                                        <option value="INSPECTION">Chờ kiểm tra</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Ưu tiên</label>
                                    <select class="form-select" id="devicePriority">
                                        <option value="LOW">Thấp</option>
                                        <option value="MEDIUM">Trung bình</option>
                                        <option value="HIGH">Cao</option>
                                        <option value="URGENT">Khẩn cấp</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Bảo trì cuối</label>
                                    <input type="date" class="form-control" id="lastMaintenanceDate">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Bảo trì tiếp theo</label>
                                    <input type="date" class="form-control" id="nextMaintenanceDate">
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Mô tả</label>
                                <textarea class="form-control" id="deviceDescription" rows="3" readonly></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Ghi chú</label>
                                <textarea class="form-control" id="deviceNotes" rows="3" placeholder="Nhập ghi chú về thiết bị..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="saveDeviceBtn">Cập nhật</button>
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
            const tableBody = document.getElementById('deviceTableBody');
            const bootstrap = typeof window.bootstrap !== 'undefined';
            
            if (tableBody && bootstrap) {
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
    console.log('🚀 Device Management System Loading...');
    
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
    const searchBtn = document.getElementById('searchBtn');
    const addBtn = document.getElementById('addDeviceBtn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (addBtn) addBtn.addEventListener('click', () => openModal('add', null));
    
    // Filter inputs
    const filterElements = [
        'deviceTypeFilter', 'statusFilter', 'buildingFilter', 'searchInput'
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
        devices = [
            {
                id: 1,
                name: 'Thang máy Tòa A',
                code: 'ELV-A-001',
                type: 'ELEVATOR',
                location: 'Tòa A - Tầng 1-20',
                status: 'WORKING',
                priority: 'MEDIUM',
                lastMaintenanceDate: '2025-07-15',
                nextMaintenanceDate: '2025-08-15',
                description: 'Thang máy chính tòa A, phục vụ từ tầng 1 đến tầng 20',
                notes: 'Hoạt động bình thường, không có vấn đề'
            },
            {
                id: 2,
                name: 'Máy phát điện dự phòng',
                code: 'GEN-001',
                type: 'GENERATOR',
                location: 'Tầng hầm B1',
                status: 'MAINTENANCE',
                priority: 'HIGH',
                lastMaintenanceDate: '2025-08-01',
                nextMaintenanceDate: '2025-11-01',
                description: 'Máy phát điện dự phòng cho toàn bộ tòa nhà',
                notes: 'Đang trong quá trình bảo trì định kỳ'
            },
            {
                id: 3,
                name: 'Máy bơm nước sinh hoạt',
                code: 'PMP-001',
                type: 'PUMP',
                location: 'Tầng hầm B2',
                status: 'BROKEN',
                priority: 'URGENT',
                lastMaintenanceDate: '2025-06-20',
                nextMaintenanceDate: '2025-08-10',
                description: 'Máy bơm nước sinh hoạt chính',
                notes: 'Cần sửa chữa khẩn cấp'
            },
            {
                id: 4,
                name: 'Hệ thống điều hòa Lobby',
                code: 'AC-LB-001',
                type: 'AIR_CONDITIONER',
                location: 'Sảnh chính Tòa A',
                status: 'WORKING',
                priority: 'LOW',
                lastMaintenanceDate: '2025-07-10',
                nextMaintenanceDate: '2025-09-10',
                description: 'Hệ thống điều hòa không khí cho khu vực sảnh chính',
                notes: 'Hoạt động tốt'
            },
            {
                id: 5,
                name: 'Camera an ninh Tòa B',
                code: 'CAM-B-015',
                type: 'CAMERA',
                location: 'Tòa B - Tầng 15',
                status: 'INSPECTION',
                priority: 'MEDIUM',
                lastMaintenanceDate: '2025-05-07',
                nextMaintenanceDate: '2025-10-05',
                description: 'Camera giám sát an ninh tầng 15 tòa B',
                notes: 'Đang chờ kiểm tra định kỳ'
            },
            {
                id: 6,
                name: 'Hệ thống PCCC Tòa C',
                code: 'FIRE-C-001',
                type: 'FIRE_ALARM',
                location: 'Tòa C - Tất cả tầng',
                status: 'WORKING',
                priority: 'HIGH',
                lastMaintenanceDate: '2025-07-25',
                nextMaintenanceDate: '2025-10-25',
                description: 'Hệ thống báo cháy và chữa cháy tự động',
                notes: 'Hệ thống hoạt động bình thường'
            }
        ];
        
        filteredDevices = [...devices];
        displayDevices();
        showLoading(false);
        
        console.log(`✅ Loaded ${devices.length} sample devices`);
        showAlert('Tải dữ liệu thành công!', 'success');
    }, 1500);
}

// Display devices in table
function displayDevices() {
    console.log(`🎨 Displaying ${filteredDevices.length} devices...`);
    const tbody = document.getElementById('deviceTableBody');
    
    if (!tbody) {
        console.error('❌ Device table body not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (filteredDevices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="bi bi-search fa-3x mb-3"></i>
                    <h5>Không tìm thấy thiết bị nào</h5>
                    <p>Thử thay đổi điều kiện tìm kiếm</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredDevices.forEach((device, index) => {
        const row = createDeviceRow(device, index);
        tbody.appendChild(row);
    });
    
    console.log(`✅ Displayed ${filteredDevices.length} device items`);
}

// Create device table row - UPDATED with icon buttons
function createDeviceRow(device, index) {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.05}s`;
    
    const statusClass = device.status ? device.status.toLowerCase() : 'working';
    const priorityClass = device.priority ? device.priority.toLowerCase() : 'low';
    
    tr.innerHTML = `
        <td class="device-info">
            <div class="device-name">${device.name || 'Không có tên'}</div>
            <div class="device-code">${device.code || 'N/A'}</div>
        </td>
        <td class="device-location">${device.location || 'Không xác định'}</td>
        <td>
            <span class="status-badge ${statusClass}">${statusMapping[device.status] || 'Không xác định'}</span>
        </td>
        <td class="date-text">${formatDate(device.lastMaintenanceDate) || 'Chưa có'}</td>
        <td class="date-text ${!device.nextMaintenanceDate ? 'pending' : ''}">${formatDate(device.nextMaintenanceDate) || 'Cần sắp xếp'}</td>
        <td>
            <span class="priority-badge ${priorityClass}">${priorityMapping[device.priority] || 'Thấp'}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn btn-view" type="button" title="Xem chi tiết">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn btn-edit" type="button" title="Chỉnh sửa">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn btn-maintenance" type="button" title="Bảo trì">
                    <i class="bi bi-tools"></i>
                </button>
                <button class="action-btn btn-delete" type="button" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    // Event listeners for buttons
    const viewBtn = tr.querySelector('.btn-view');
    const editBtn = tr.querySelector('.btn-edit');
    const maintenanceBtn = tr.querySelector('.btn-maintenance');
    const deleteBtn = tr.querySelector('.btn-delete');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            console.log(`👁️ View clicked: ${device.id}`);
            openModal('view', device.id);
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log(`✏️ Edit clicked: ${device.id}`);
            openModal('edit', device.id);
        });
    }
    
    if (maintenanceBtn) {
        maintenanceBtn.addEventListener('click', () => {
            console.log(`🔧 Maintenance clicked: ${device.id}`);
            openModal('maintenance', device.id);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            console.log(`🗑️ Delete clicked: ${device.id}`);
            deleteDevice(device.id);
        });
    }
    
    return tr;
}

// Open modal
function openModal(mode, deviceId) {
    console.log(`🎭 Opening modal: ${mode} for ID: ${deviceId}`);
    
    // Ensure modal exists
    if (!document.getElementById('deviceModal')) {
        createModal();
    }
    
    // Find device (if editing existing)
    if (deviceId) {
        currentDevice = devices.find(device => device.id == deviceId);
        if (!currentDevice) {
            showAlert('Không tìm thấy thiết bị này!', 'danger');
            return;
        }
    } else {
        currentDevice = null;
    }
    
    currentMode = mode;
    
    setTimeout(() => {
        try {
            const modalTitle = document.getElementById('modalTitle');
            const saveBtn = document.getElementById('saveDeviceBtn');
            
            // Configure modal based on mode
            switch(mode) {
                case 'view':
                    modalTitle.textContent = 'Chi tiết thiết bị';
                    saveBtn.style.display = 'none';
                    enableFormInputs(false);
                    break;
                case 'edit':
                    modalTitle.textContent = 'Chỉnh sửa thiết bị';
                    saveBtn.textContent = 'Cập nhật';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true);
                    break;
                case 'add':
                    modalTitle.textContent = 'Thêm thiết bị mới';
                    saveBtn.textContent = 'Thêm thiết bị';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true);
                    clearForm();
                    break;
                case 'maintenance':
                    modalTitle.textContent = 'Cập nhật bảo trì';
                    saveBtn.textContent = 'Cập nhật bảo trì';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true, true); // maintenance mode
                    break;
            }
            
            // Setup save button
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', saveDevice);
            
            // Populate form if editing
            if (currentDevice && mode !== 'add') {
                populateForm(currentDevice);
            }
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('deviceModal'));
            modal.show();
            
            console.log('✅ Modal opened successfully');
            
        } catch (error) {
            console.error('❌ Modal error:', error);
            showAlert('Lỗi khi mở modal: ' + error.message, 'danger');
        }
    }, 100);
}

// Enable/disable form inputs
function enableFormInputs(enabled, maintenanceMode = false) {
    const fieldConfigs = [
        { id: 'deviceName', alwaysDisabled: maintenanceMode },
        { id: 'deviceCode', alwaysDisabled: maintenanceMode },
        { id: 'deviceType', alwaysDisabled: maintenanceMode },
        { id: 'deviceLocation', alwaysDisabled: maintenanceMode },
        { id: 'deviceDescription', alwaysDisabled: maintenanceMode },
        { id: 'deviceStatus', alwaysDisabled: false },
        { id: 'devicePriority', alwaysDisabled: false },
        { id: 'lastMaintenanceDate', alwaysDisabled: false },
        { id: 'nextMaintenanceDate', alwaysDisabled: false },
        { id: 'deviceNotes', alwaysDisabled: false }
    ];
    
    fieldConfigs.forEach(({ id, alwaysDisabled }) => {
        const field = document.getElementById(id);
        if (field) {
            field.disabled = alwaysDisabled || !enabled;
            if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                field.readOnly = alwaysDisabled || !enabled;
            }
        }
    });
}

// Populate form
function populateForm(device) {
    if (!device) return;
    
    const fields = [
        { id: 'deviceName', value: device.name },
        { id: 'deviceCode', value: device.code },
        { id: 'deviceType', value: device.type },
        { id: 'deviceLocation', value: device.location },
        { id: 'deviceStatus', value: device.status },
        { id: 'devicePriority', value: device.priority },
        { id: 'lastMaintenanceDate', value: device.lastMaintenanceDate },
        { id: 'nextMaintenanceDate', value: device.nextMaintenanceDate },
        { id: 'deviceDescription', value: device.description },
        { id: 'deviceNotes', value: device.notes }
    ];
    
    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });
}

// Clear form
function clearForm() {
    const fields = [
        'deviceName', 'deviceCode', 'deviceType', 'deviceLocation',
        'deviceStatus', 'devicePriority', 'lastMaintenanceDate',
        'nextMaintenanceDate', 'deviceDescription', 'deviceNotes'
    ];
    
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    // Set defaults
    document.getElementById('deviceStatus').value = 'WORKING';
    document.getElementById('devicePriority').value = 'LOW';
}

// Save device
async function saveDevice() {
    console.log('💾 Saving device...');
    
    // Get form data
    const formData = {
        name: document.getElementById('deviceName')?.value,
        code: document.getElementById('deviceCode')?.value,
        type: document.getElementById('deviceType')?.value,
        location: document.getElementById('deviceLocation')?.value,
        status: document.getElementById('deviceStatus')?.value,
        priority: document.getElementById('devicePriority')?.value,
        lastMaintenanceDate: document.getElementById('lastMaintenanceDate')?.value,
        nextMaintenanceDate: document.getElementById('nextMaintenanceDate')?.value,
        description: document.getElementById('deviceDescription')?.value,
        notes: document.getElementById('deviceNotes')?.value
    };
    
    // Validation
    if (currentMode === 'add' && (!formData.name || !formData.code)) {
        showAlert('Vui lòng nhập tên và mã thiết bị!', 'warning');
        return;
    }
    
    console.log('📋 Form data:', formData);
    showLoading(true);
    
    // Simulate save
    setTimeout(() => {
        try {
            if (currentMode === 'add') {
                // Add new device
                const newDevice = {
                    id: Math.max(...devices.map(d => d.id), 0) + 1,
                    ...formData
                };
                devices.push(newDevice);
                showAlert('Thêm thiết bị thành công!', 'success');
            } else {
                // Update existing device
                const index = devices.findIndex(d => d.id === currentDevice.id);
                if (index !== -1) {
                    devices[index] = { ...devices[index], ...formData };
                }
                
                const messages = {
                    'edit': 'Cập nhật thiết bị thành công!',
                    'maintenance': 'Cập nhật thông tin bảo trì thành công!'
                };
                showAlert(messages[currentMode] || 'Cập nhật thành công!', 'success');
            }
            
            filteredDevices = [...devices];
            displayDevices();
            
            // Close modal
            const modalElement = document.getElementById('deviceModal');
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

// Delete device
function deleteDevice(deviceId) {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
        return;
    }
    
    console.log('🗑️ Deleting device:', deviceId);
    showLoading(true);
    
    setTimeout(() => {
        try {
            devices = devices.filter(d => d.id !== deviceId);
            filteredDevices = [...devices];
            displayDevices();
            showAlert('Xóa thiết bị thành công!', 'success');
            console.log('✅ Delete completed successfully');
        } catch (error) {
            console.error('❌ Delete error:', error);
            showAlert('Lỗi khi xóa: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 800);
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function applyFilters() {
    console.log('🔍 Applying filters...');
    
    const filters = {
        deviceType: document.getElementById('deviceTypeFilter')?.value || '',
        status: document.getElementById('statusFilter')?.value || '',
        building: document.getElementById('buildingFilter')?.value || '',
        search: document.getElementById('searchInput')?.value.toLowerCase() || ''
    };
    
    filteredDevices = devices.filter(device => {
        const typeMatch = !filters.deviceType || device.type === filters.deviceType;
        const statusMatch = !filters.status || device.status === filters.status;
        const buildingMatch = !filters.building || device.location?.includes(`Tòa ${filters.building}`);
        const searchMatch = !filters.search || 
            device.name?.toLowerCase().includes(filters.search) ||
            device.code?.toLowerCase().includes(filters.search) ||
            device.location?.toLowerCase().includes(filters.search);
        
        return typeMatch && statusMatch && buildingMatch && searchMatch;
    });
    
    displayDevices();
    console.log(`✅ Filters applied: ${filteredDevices.length}/${devices.length} items`);
}

function clearFilters() {
    console.log('🧹 Clearing filters...');
    
    const filterIds = [
        'deviceTypeFilter', 'statusFilter', 'buildingFilter', 'searchInput'
    ];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    filteredDevices = [...devices];
    displayDevices();
    showAlert('Đã xóa tất cả bộ lọc!', 'info');
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// Global functions for debugging
window.DeviceSystem = {
    devices,
    filteredDevices,
    openModal,
    showAlert,
    currentDevice,
    currentMode
};

console.log('📦 Device Management System loaded successfully!');