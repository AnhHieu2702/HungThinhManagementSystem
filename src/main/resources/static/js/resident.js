// resident.js

// ================== CẤU HÌNH ==================
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINTS = {
    residents: `${API_BASE_URL}/residents`,
    adminResidents: `${API_BASE_URL}/admin-resident/apartments/residents`,
    residentsByApartment: (apartmentId) => `${API_BASE_URL}/admin-resident/apartments/${apartmentId}/residents`,
    addResidentToApartment: (apartmentId) => `${API_BASE_URL}/admin/apartments/${apartmentId}/residents`,
    updateResident: (residentId) => `${API_BASE_URL}/admin-resident/apartments/residents/${residentId}`,
};

function getAuthToken() {
    return localStorage.getItem('accessToken');
}
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ================== BIẾN TOÀN CỤC ==================
let currentPage = 1;
let itemsPerPage = 5;
let totalResidents = 0;
let allResidents = [];
let filteredResidents = [];

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', function() {
    loadResidents();
    setupEventListeners();
});

// ================== SỰ KIỆN FILTER ==================
function setupEventListeners() {
    const searchInputs = ['searchName', 'searchPhone', 'searchEmail', 'searchApartment'];
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') applyFilters();
            });
        }
    });
}

// ================== LOAD DANH SÁCH CHÍNH ==================
async function loadResidents() {
    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.residents, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const result = await response.json();
            if (result.status && Array.isArray(result.data)) {
                allResidents = result.data;
                filteredResidents = [...allResidents];
                totalResidents = allResidents.length;
                renderTable();
                renderPagination();
            } else {
                showAlert(result.userMessage || 'Có lỗi khi tải dữ liệu cư dân', 'danger');
            }
        } else {
            showAlert('Không thể tải danh sách cư dân', 'danger');
        }
    } catch (error) {
        showAlert('Có lỗi xảy ra khi tải dữ liệu', 'danger');
    } finally {
        showLoading(false);
    }
}

// ================== BẢNG DANH SÁCH ==================
function renderTable() {
    const tbody = document.getElementById('residentsTableBody');
    if (!tbody) return;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResidents = filteredResidents.slice(startIndex, endIndex);

    tbody.innerHTML = currentResidents.map((resident, index) => `
        <tr>
            <td class="text-center">${startIndex + index + 1}</td>
            <td class="text-center">
                <div class="resident-info">
                        <span class="resident-avatar">${getAvatarLetter(resident.fullname)}</span>
                        <div>${resident.fullname}<br><span>${resident.email}</span></div>
                </div>
            </td>
            <td class="text-center">${resident.apartmentNumber || ''}</td>
            <td class="text-center">${resident.phone || ''}</td>
            <td class="text-center">${resident.createTime ? formatDate(resident.createTime) : ''}</td>
            <td class="text-center">
                <button class="btn btn-sm" title="Xem cư dân hộ" onclick="showResidentsOfApartment('${resident.apartmentId}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm" title="Chỉnh sửa" onclick='showEditResidentModal("${resident.apartmentId}", ${JSON.stringify(resident)})'><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" title="Thêm vào hộ này" onclick="showAddResidentToApartmentModal('${resident.apartmentId}')"><i class="fas fa-plus"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;
    updateRecordsInfo(startIndex + 1, Math.min(endIndex, filteredResidents.length), filteredResidents.length);
}

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
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function updateRecordsInfo(start, end, total) {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        recordsInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${total} cư dân`;
    }
}
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}
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
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getAlertIcon(type)} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" aria-label="Close"></button>
        </div>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => { alertDiv.classList.add('show'); }, 100);
    const autoHideTimer = setTimeout(() => { hideAlert(alertDiv); }, 5000);
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
        if (alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
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

// ================== PHÂN TRANG ==================
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
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
        if (startPage > 2) paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
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
function changePage(page) {
    const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
    renderPagination();
}
function applyFilters() {
    const searchName = document.getElementById('searchName')?.value.toLowerCase().trim() || '';
    const searchPhone = document.getElementById('searchPhone')?.value.toLowerCase().trim() || '';
    const searchEmail = document.getElementById('searchEmail')?.value.toLowerCase().trim() || '';
    const searchApartment = document.getElementById('searchApartment')?.value.toLowerCase().trim() || '';
    filteredResidents = allResidents.filter(resident => {
        const matchName = !searchName || resident.fullname.toLowerCase().includes(searchName);
        const matchPhone = !searchPhone || resident.phone.toLowerCase().includes(searchPhone);
        const matchEmail = !searchEmail || resident.email.toLowerCase().includes(searchEmail);
        const matchApartment = !searchApartment || (resident.apartmentNumber || '').toLowerCase().includes(searchApartment);
        return matchName && matchPhone && matchEmail && matchApartment;
    });
    currentPage = 1;
    renderTable();
    renderPagination();
}
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

// =========== CHỨC NĂNG BỔ SUNG: THÊM/SỬA/XEM CƯ DÂN HỘ ===========

// 1. Thêm cư dân vào hộ (nút +)
function showAddResidentToApartmentModal(apartmentId) {
    document.getElementById('residentForm').reset();
    document.getElementById('residentId').value = '';
    document.getElementById('apartmentId').value = apartmentId;
    document.getElementById('residentModalLabel').textContent = 'Thêm cư dân vào hộ';
    document.getElementById('saveResidentBtn').onclick = saveResidentToApartment;
    document.getElementById('fullname').oninput = function () {
        document.getElementById('avatarModal').textContent = getAvatarLetter(this.value);
    };
    const modal = new bootstrap.Modal(document.getElementById('residentModal'));
    modal.show();
}
async function saveResidentToApartment() {
    const apartmentId = document.getElementById('apartmentId').value;
    const data = {
        fullname: document.getElementById('fullname').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        relation: document.getElementById('relation').value.trim()
    };
    if (!data.fullname || !data.dateOfBirth || !data.email || !data.phone || !data.relation) {
        showAlert('Vui lòng nhập đầy đủ thông tin', 'danger');
        return;
    }
    showLoading(true);
    try {
        const res = await fetch(API_ENDPOINTS.addResidentToApartment(apartmentId), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Lỗi khi thêm cư dân vào hộ');
        showAlert('Thêm cư dân thành công!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('residentModal')).hide();
        await loadResidents();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}

// 2. Sửa cư dân (nút bút chì)
function showEditResidentModal(apartmentId, resident) {
    document.getElementById('residentModalLabel').textContent = 'Chỉnh sửa cư dân';
    document.getElementById('residentId').value = resident.id;
    document.getElementById('apartmentId').value = apartmentId;
    document.getElementById('fullname').value = resident.fullname;
    document.getElementById('dateOfBirth').value = resident.dateOfBirth;
    document.getElementById('email').value = resident.email;
    document.getElementById('phone').value = resident.phone;
    document.getElementById('relation').value = resident.relation || '';
    document.getElementById('avatarModal').textContent = getAvatarLetter(resident.fullname);
    document.getElementById('fullname').oninput = function () {
        document.getElementById('avatarModal').textContent = getAvatarLetter(this.value);
    };
    document.getElementById('saveResidentBtn').onclick = saveEditResident;
    const modal = new bootstrap.Modal(document.getElementById('residentModal'));
    modal.show();
}
async function saveEditResident() {
    const residentId = document.getElementById('residentId').value;
    const data = {
        fullname: document.getElementById('fullname').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        relation: document.getElementById('relation').value.trim()
    };
    if (!data.fullname || !data.dateOfBirth || !data.email || !data.phone || !data.relation) {
        showAlert('Vui lòng nhập đầy đủ thông tin', 'danger');
        return;
    }
    showLoading(true);
    try {
        const res = await fetch(API_ENDPOINTS.updateResident(residentId), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Lỗi khi cập nhật cư dân');
        showAlert('Cập nhật cư dân thành công!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('residentModal')).hide();
        await loadResidents();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}

// 3. Xem chi tiết cư dân của hộ (nút con mắt)
async function showResidentsOfApartment(apartmentId) {
    showLoading(true);
    try {
        const res = await fetch(API_ENDPOINTS.residentsByApartment(apartmentId), {
            headers: getAuthHeaders()
        });
        const result = await res.json();
        if (result.status && Array.isArray(result.data)) {
            renderResidentListModal(result.data);
        } else {
            showAlert(result.userMessage || 'Không có cư dân', 'warning');
        }
    } catch (e) {
        showAlert('Lỗi khi lấy danh sách cư dân', 'danger');
    }
    showLoading(false);
}
function renderResidentListModal(list) {
    // Xóa modal cũ nếu có
    const old = document.getElementById('residentListModal');
    if (old) old.remove();

    let html = `
    <div class="modal fade" id="residentListModal" tabindex="-1" aria-labelledby="residentListModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">

            <!-- Tiêu đề -->
            <div class="modal-header">
                <h5 class="modal-title" id="residentListModalLabel">Danh sách cư dân trong hộ</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <!-- Nội dung -->
            <div class="modal-body">
                <div class="row g-3">
                    ${list.map(r => `
                        <div class="col-md-6">
                            <div class="card h-100 border-primary shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title mb-2">${r.fullname || 'Chưa có tên'}</h5>
                                    <p class="mb-1"><strong>Ngày sinh:</strong> ${r.dateOfBirth || ''}</p>
                                    <p class="mb-1"><strong>Email:</strong> ${r.email || ''}</p>
                                    <p class="mb-1"><strong>SĐT:</strong> ${r.phone || ''}</p>
                                    <p class="mb-0"><strong>Quan hệ:</strong> ${r.relation || ''}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

        </div>
    </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    new bootstrap.Modal(document.getElementById('residentListModal')).show();
}

// ================== MODAL SỰ KIỆN ĐÓNG ==================
document.addEventListener('DOMContentLoaded', function() {
    const residentModal = document.getElementById('residentModal');
    if (residentModal) {
        residentModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('apartmentNumber').readOnly = false;
        });
    }
});