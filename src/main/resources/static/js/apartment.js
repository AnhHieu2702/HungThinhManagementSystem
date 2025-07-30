// Apartment Management System - Simplified
const API_BASE_URL = 'http://localhost:8080/api/admin/apartments';

// Global variables
let apartments = [];
let filteredApartments = [];
let currentApartment = null;
let currentMode = 'add';

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
    
    // Icon mapping
    const iconMap = {
        'success': 'bi-check-circle-fill',
        'danger': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    
    const icon = iconMap[type] || 'bi-info-circle-fill';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icon} me-2"></i>
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadApartments();
    setupEventListeners();
    setupFormValidation();
});

// Event listeners setup
function setupEventListeners() {
    // Search and filter inputs
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('blockFilter').addEventListener('change', applyFilters);
    document.getElementById('floorFilter').addEventListener('change', applyFilters);
    document.getElementById('areaFilter').addEventListener('change', applyFilters);
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('apartmentForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveApartment();
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

// Load apartments from API
async function loadApartments() {
    showLoading(true);
    try {
        const response = await fetch(API_BASE_URL, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status && data.data) {
                apartments = data.data;
                filteredApartments = [...apartments];
                displayApartments();
            } else {
                const errorMessage = data.userMessage || data.message || 'Có lỗi khi tải dữ liệu căn hộ';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Không thể tải danh sách căn hộ';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error loading apartments:', error);
        showAlert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Display apartments
function displayApartments() {
    const container = document.getElementById('apartmentsContainer');
    container.innerHTML = '';
    
    if (filteredApartments.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Không tìm thấy căn hộ nào</h5>
                <p class="text-muted">Thử thay đổi điều kiện tìm kiếm</p>
            </div>
        `;
        return;
    }
    
    filteredApartments.forEach(apartment => {
        const apartmentCard = createApartmentCard(apartment);
        container.appendChild(apartmentCard);
    });
}

// Create apartment card
function createApartmentCard(apartment) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
    
    col.innerHTML = `
        <div class="apartment-card">
            <div class="apartment-header">
                <div>
                    <div class="apartment-number">${apartment.apartmentNumber}</div>
                    <div class="apartment-size">${apartment.area}m² • Tầng ${apartment.floor}</div>
                </div>
            </div>
            
            <div class="apartment-details">
                <div class="detail-item">
                    <span class="detail-label">Tòa nhà:</span>
                    <span class="detail-value">Tòa ${apartment.block}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tầng:</span>
                    <span class="detail-value">Tầng ${apartment.floor}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Diện tích:</span>
                    <span class="detail-value">${apartment.area} m²</span>
                </div>
            </div>
            
            <div class="apartment-actions">
                <button class="action-btn btn-view" onclick="openModal('view', '${apartment.id}')">
                    <i class="fas fa-eye me-1"></i>Xem chi tiết
                </button>
                <button class="action-btn btn-edit" onclick="openModal('edit', '${apartment.id}')">
                    <i class="fas fa-edit me-1"></i>Chỉnh sửa
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Apply filters
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const block = document.getElementById('blockFilter').value;
    const floor = document.getElementById('floorFilter').value;
    const area = document.getElementById('areaFilter').value;
    
    filteredApartments = apartments.filter(apartment => {
        // Search filter
        const searchMatch = !search || 
            apartment.apartmentNumber.toLowerCase().includes(search);
        
        // Block filter
        const blockMatch = !block || apartment.block === block;
        
        // Floor filter
        const floorMatch = !floor || checkFloorRange(apartment.floor, floor);
        
        // Area filter
        const areaMatch = !area || checkAreaRange(apartment.area, area);
        
        return searchMatch && blockMatch && floorMatch && areaMatch;
    });
    
    displayApartments();
}

// Check floor range
function checkFloorRange(floor, range) {
    switch(range) {
        case '1-5':
            return floor >= 1 && floor <= 5;
        case '6-10':
            return floor >= 6 && floor <= 10;
        case '11-15':
            return floor >= 11 && floor <= 15;
        case '16-20':
            return floor >= 16 && floor <= 20;
        default:
            return true;
    }
}

// Check area range
function checkAreaRange(area, range) {
    switch(range) {
        case '50-70':
            return area >= 50 && area <= 70;
        case '70-90':
            return area >= 70 && area <= 90;
        case '90-120':
            return area >= 90 && area <= 120;
        case '120+':
            return area > 120;
        default:
            return true;
    }
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('blockFilter').value = '';
    document.getElementById('floorFilter').value = '';
    document.getElementById('areaFilter').value = '';
    
    filteredApartments = [...apartments];
    displayApartments();
}

// Open modal
function openModal(mode, apartmentId = null) {
    currentMode = mode;
    const modal = new bootstrap.Modal(document.getElementById('apartmentModal'));
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');
    const form = document.getElementById('apartmentForm');
    const addFields = document.getElementById('addFields');
    
    // Reset form
    form.reset();
    
    if (apartmentId) {
        currentApartment = apartments.find(apt => apt.id == apartmentId);
    } else {
        currentApartment = null;
    }
    
    switch(mode) {
        case 'add':
            modalTitle.textContent = 'Thêm căn hộ mới';
            saveBtn.textContent = 'Thêm mới';
            saveBtn.style.display = 'block';
            addFields.style.display = 'block';
            enableFormInputs(true);
            break;
        case 'edit':
            modalTitle.textContent = 'Chỉnh sửa căn hộ';
            saveBtn.textContent = 'Cập nhật';
            saveBtn.style.display = 'block';
            addFields.style.display = 'none';
            enableFormInputs(true);
            populateForm(currentApartment);
            break;
        case 'view':
            modalTitle.textContent = 'Thông tin căn hộ';
            saveBtn.style.display = 'none';
            addFields.style.display = 'none';
            enableFormInputs(false);
            populateForm(currentApartment);
            break;
    }
    
    modal.show();
}

// Enable/disable form inputs
function enableFormInputs(enabled) {
    const inputs = document.querySelectorAll('#apartmentForm input, #apartmentForm select');
    inputs.forEach(input => {
        input.disabled = !enabled;
    });
}

// Populate form with apartment data
function populateForm(apartment) {
    if (!apartment) return;
    
    document.getElementById('apartmentNumber').value = apartment.apartmentNumber || '';
    document.getElementById('floor').value = apartment.floor || '';
    document.getElementById('block').value = apartment.block || '';
    document.getElementById('area').value = apartment.area || '';
}

// Save apartment
async function saveApartment() {
    const form = document.getElementById('apartmentForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const formData = {
        apartmentNumber: document.getElementById('apartmentNumber').value,
        floor: parseInt(document.getElementById('floor').value),
        block: document.getElementById('block').value,
        area: parseInt(document.getElementById('area').value)
    };
    
    // Add username and password for new apartments
    if (currentMode === 'add') {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showAlert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!', 'danger');
            return;
        }
        
        formData.username = username;
        formData.password = password;
    }
    
    showLoading(true);
    
    try {
        let response;
        let url = API_BASE_URL;
        let method = 'POST';
        
        if (currentMode === 'edit' && currentApartment) {
            url = `${API_BASE_URL}/${currentApartment.id}`;
            method = 'PUT';
        }
        
        response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const apiResult = await response.json();
            if (apiResult.status) {
                const successMessage = currentMode === 'add' ? 'Thêm căn hộ thành công!' : 'Cập nhật căn hộ thành công!';
                showAlert(successMessage, 'success');
                
                // Close modal and refresh data
                bootstrap.Modal.getInstance(document.getElementById('apartmentModal')).hide();
                await loadApartments();
            } else {
                const errorMessage = apiResult.userMessage || apiResult.message || 'Có lỗi xảy ra khi lưu dữ liệu!';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Có lỗi xảy ra khi lưu dữ liệu!';
            showAlert(errorMessage, 'danger');
        }
        
    } catch (error) {
        console.error('Error saving apartment:', error);
        showAlert('Có lỗi xảy ra. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}