// resident.js

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINTS = {
    residents: `${API_BASE_URL}/residents`,
    adminResidents: `${API_BASE_URL}/admin-resident/apartments/residents`,
    residentsByApartment: (apartmentId) => `${API_BASE_URL}/admin-resident/apartments/${apartmentId}/residents`
};

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

// Global Variables
let currentPage = 1;
let itemsPerPage = 5;
let totalResidents = 0;
let allResidents = [];
let filteredResidents = [];
let isEditMode = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadResidents();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Search input event listeners
    const searchInputs = ['searchName', 'searchPhone', 'searchEmail', 'searchApartment'];
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });
        }
    });
}

// Load residents from API
async function loadResidents() {
    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.residents, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.status && result.data) {
                allResidents = result.data;
                filteredResidents = [...allResidents];
                totalResidents = allResidents.length;
                
                const successMessage = result.userMessage || 'Tải danh sách cư dân thành công';
                showAlert(successMessage, 'success');
                renderTable();
                renderPagination();
            } else {
                const errorMessage = result.userMessage || result.message || 'Có lỗi khi tải dữ liệu cư dân';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Không thể tải danh sách cư dân';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error loading residents:', error);
        showAlert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Load residents by apartment ID
async function loadResidentsByApartment(apartmentId) {
    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.residentsByApartment(apartmentId), {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.status && result.data) {
                const residents = result.data;
                const message = result.userMessage || `Tìm thấy ${residents.length} cư dân trong căn hộ này`;
                showAlert(message, 'info');
                // You can implement a modal or separate view to show apartment residents
                console.log('Residents in apartment:', residents);
            } else {
                const errorMessage = result.userMessage || result.message || 'Không tìm thấy cư dân trong căn hộ này';
                showAlert(errorMessage, 'warning');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Không thể tải danh sách cư dân căn hộ';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error loading apartment residents:', error);
        showAlert('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Render residents table
function renderTable() {
    const tbody = document.getElementById('residentsTableBody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResidents = filteredResidents.slice(startIndex, endIndex);
    
    if (currentResidents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Không có dữ liệu cư dân</p>
                </td>
            </tr>
        `;
        updateRecordsInfo(0, 0, 0);
        return;
    }
    
    tbody.innerHTML = currentResidents.map((resident, index) => {
        const stt = startIndex + index + 1;
        const avatar = getAvatarLetter(resident.fullname);
        const formattedDate = formatDate(resident.createTime);
        
        return `
            <tr>
                <td class="text-center">${stt}</td>
                <td class="text-center">
                    <div class="resident-info">
                        <div class="resident-avatar">${avatar}</div>
                        <div class="resident-details">
                            <div class="resident-name">${resident.fullname}</div>
                            <div class="resident-email">${resident.email}</div>
                        </div>
                    </div>
                </td>
                <td class="text-center">
                    <span class="apartment-badge">${resident.apartmentNumber}</span>
                </td>
                <td class="text-center">${resident.phone}</td>
                <td class="text-center">${formattedDate}</td>
                <td class="text-center">
                    <button class="action-btn btn-view" onclick="viewApartmentResidents('${resident.apartmentId}')" title="Xem cư dân trong căn hộ">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="editResident('${resident.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-add" onclick="addResidentToApartment('${resident.apartmentId}')" title="Thêm vào căn hộ">
                        <i class="fas fa-plus"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateRecordsInfo(startIndex + 1, Math.min(endIndex, filteredResidents.length), filteredResidents.length);
}

// Render pagination
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    
    const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    container.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderTable();
    renderPagination();
}

// Apply filters
function applyFilters() {
    const searchName = document.getElementById('searchName')?.value.toLowerCase().trim() || '';
    const searchPhone = document.getElementById('searchPhone')?.value.toLowerCase().trim() || '';
    const searchEmail = document.getElementById('searchEmail')?.value.toLowerCase().trim() || '';
    const searchApartment = document.getElementById('searchApartment')?.value.toLowerCase().trim() || '';
    
    filteredResidents = allResidents.filter(resident => {
        const matchName = !searchName || resident.fullname.toLowerCase().includes(searchName);
        const matchPhone = !searchPhone || resident.phone.toLowerCase().includes(searchPhone);
        const matchEmail = !searchEmail || resident.email.toLowerCase().includes(searchEmail);
        const matchApartment = !searchApartment || resident.apartmentNumber.toLowerCase().includes(searchApartment);
        
        return matchName && matchPhone && matchEmail && matchApartment;
    });
    
    currentPage = 1;
    renderTable();
    renderPagination();
}

// Clear filters
function clearFilters() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchPhone').value = '';
    document.getElementById('searchEmail').value = '';
    document.getElementById('searchApartment').value = '';
    
    filteredResidents = [...allResidents];
    currentPage = 1;
    renderTable();
    renderPagination();
}

// View apartment residents
function viewApartmentResidents(apartmentId) {
    loadResidentsByApartment(apartmentId);
}

// Edit resident
function editResident(residentId) {
    const resident = allResidents.find(r => r.id === residentId);
    if (!resident) {
        showAlert('danger', 'Không tìm thấy thông tin cư dân');
        return;
    }
    
    isEditMode = true;
    document.getElementById('residentModalLabel').textContent = 'Chỉnh sửa cư dân';
    document.getElementById('residentId').value = resident.id;
    document.getElementById('fullname').value = resident.fullname;
    document.getElementById('apartmentNumber').value = resident.apartmentNumber;
    document.getElementById('phone').value = resident.phone;
    document.getElementById('email').value = resident.email;
    document.getElementById('dateOfBirth').value = resident.dateOfBirth;
    
    const modal = new bootstrap.Modal(document.getElementById('residentModal'));
    modal.show();
}

// Add resident to apartment
function addResidentToApartment(apartmentId) {
    const apartment = allResidents.find(r => r.apartmentId === apartmentId);
    if (!apartment) {
        showAlert('danger', 'Không tìm thấy thông tin căn hộ');
        return;
    }
    
    isEditMode = false;
    document.getElementById('residentModalLabel').textContent = 'Thêm cư dân vào căn hộ';
    document.getElementById('residentForm').reset();
    document.getElementById('residentId').value = '';
    document.getElementById('apartmentNumber').value = apartment.apartmentNumber;
    document.getElementById('apartmentNumber').readOnly = true;
    
    const modal = new bootstrap.Modal(document.getElementById('residentModal'));
    modal.show();
}

// Show add modal
function showAddModal() {
    isEditMode = false;
    document.getElementById('residentModalLabel').textContent = 'Thêm cư dân mới';
    document.getElementById('residentForm').reset();
    document.getElementById('residentId').value = '';
    document.getElementById('apartmentNumber').readOnly = false;
    
    const modal = new bootstrap.Modal(document.getElementById('residentModal'));
    modal.show();
}

// Save resident
async function saveResident() {
    const form = document.getElementById('residentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const residentData = {
        fullname: document.getElementById('fullname').value.trim(),
        apartmentNumber: document.getElementById('apartmentNumber').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        relation: document.getElementById('relation').value
    };
    
    showLoading(true);
    try {
        let response;
        let url = API_ENDPOINTS.adminResidents;
        let method = 'POST';
        
        if (isEditMode) {
            const residentId = document.getElementById('residentId').value;
            url = `${API_ENDPOINTS.adminResidents}/${residentId}`;
            method = 'PUT';
        } else {
            // For adding new resident, we need apartmentId
            // This is a simplified approach - you might need to get apartmentId from apartmentNumber
            residentData.apartmentId = 'apartment-id-here'; // You need to get this from somewhere
        }
        
        response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(residentData)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.status) {
                const successMessage = result.userMessage || (isEditMode ? 'Cập nhật cư dân thành công!' : 'Thêm cư dân thành công!');
                showAlert(successMessage, 'success');
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('residentModal'));
                modal.hide();
                await loadResidents(); // Reload the list
            } else {
                const errorMessage = result.userMessage || result.message || 'Có lỗi xảy ra khi lưu thông tin cư dân';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.userMessage || errorData.message || 'Có lỗi xảy ra khi lưu thông tin cư dân';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error saving resident:', error);
        showAlert('Có lỗi xảy ra. Vui lòng thử lại sau!', 'danger');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function getAvatarLetter(fullname) {
    if (!fullname) return '?';
    const words = fullname.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function updateRecordsInfo(start, end, total) {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        recordsInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${total} cư dân`;
    }
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
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
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
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

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Handle modal events
document.addEventListener('DOMContentLoaded', function() {
    const residentModal = document.getElementById('residentModal');
    if (residentModal) {
        residentModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('apartmentNumber').readOnly = false;
        });
    }
});