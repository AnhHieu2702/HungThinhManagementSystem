const API_BASE_URL = 'http://localhost:8080/api/admin/staffs';

let staffs = [];
let searchKeyword = '';
let searchRole = '';

// Lấy token và headers chuẩn theo resident.js
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

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getAvatarLetter(name) {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// =================== XÁC NHẬN XÓA GIỮA MÀN HÌNH ===================
function showConfirmDialog(message, onConfirm) {
    const old = document.getElementById('customConfirmDialog');
    if (old) old.remove();

    const div = document.createElement('div');
    div.id = 'customConfirmDialog';
    div.innerHTML = `
        <div style="
            position:fixed;z-index:2000;top:0;left:0;width:100vw;height:100vh;
            background:rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
            <div style="
                background:white;border-radius:10px;min-width:320px;max-width:90vw;padding:32px 24px 16px 24px;
                box-shadow:0 0 8px 1px rgba(0,0,0,0.12);text-align:center;position:relative;">
                <div style="font-size:1.5rem;margin-bottom:16px;">
                    <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size:2rem"></i>
                </div>
                <div style="font-size:1.15rem;margin-bottom:24px;font-weight:500;">${message}</div>
                <button id="confirmBtn" class="btn btn-danger me-2" style="min-width:80px;">Xóa</button>
                <button id="cancelBtn" class="btn btn-secondary" style="min-width:80px;">Hủy</button>
            </div>
        </div>`;
    document.body.appendChild(div);

    document.getElementById('confirmBtn').onclick = () => {
        div.remove();
        onConfirm();
    };
    document.getElementById('cancelBtn').onclick = () => {
        div.remove();
    };
}

// ================= API =================
async function fetchStaffs() {
    showLoading(true);
    try {
        const res = await fetch(API_BASE_URL, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Lỗi khi lấy danh sách nhân viên');
        const data = await res.json();
        staffs = Array.isArray(data.data) ? data.data : [];
        renderStaffTable();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}

async function addStaffApi(staff) {
    showLoading(true);
    try {
        const res = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(staff)
        });
        if (!res.ok) throw new Error('Lỗi khi thêm nhân viên');
        showAlert('Thêm tài khoản thành công!', 'success');
        await fetchStaffs();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}

async function updateStaffApi(id, staff) {
    showLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(staff)
        });
        if (!res.ok) throw new Error('Lỗi khi cập nhật nhân viên');
        showAlert('Cập nhật tài khoản thành công!', 'success');
        await fetchStaffs();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}

async function deleteStaffApi(id) {
    showConfirmDialog('Bạn có chắc chắn muốn xóa tài khoản này?', async () => {
        showLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Lỗi khi xóa nhân viên');
            showAlert('Xóa tài khoản thành công!', 'success');
            await fetchStaffs();
        } catch (e) {
            showAlert(e.message, 'danger');
        }
        showLoading(false);
    });
}

// ================= HIỂN THỊ BẢNG =================
function renderStaffTable() {
    let filtered = staffs.filter(staff => {
        const matchUsername = (staff.username || '').toLowerCase().includes(searchKeyword.toLowerCase());
        const matchRole = !searchRole || staff.role === searchRole;
        return matchUsername && matchRole;
    });

    const tbody = document.getElementById('staffTableBody');
    tbody.innerHTML = filtered.map((staff, idx) => `
    <tr>
        <td class="align-middle text-center">${idx + 1}</td>
        <td class="align-middle text-center">
            <div class="d-flex align-items-center justify-content-center">
                <span class="avatar-circle" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#1b2d73;color:white;font-weight:bold;border-radius:50%;margin-right:8px;">
                    ${getAvatarLetter(staff.username)}
                </span>
                <span>${staff.username}</span>
            </div>
        </td>
        <td class="align-middle text-center">${getRoleLabel(staff.role)}</td>
        <td class="align-middle text-center">${formatDate(staff.createTime)}</td>
        <td class="align-middle text-center">${formatDate(staff.lastModifiedTime)}</td>
        <td class="align-middle text-center">
            <button class="btn btn-sm editBtn" data-id="${staff.id}" title="Sửa"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm deleteBtn" data-id="${staff.id}" title="Xoá"><i class="fas fa-trash"></i></button>
        </td>
    </tr>
`).join('') || `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;

    document.getElementById('staffRecordsInfo').textContent =
        filtered.length === 0 ? 'Không có tài khoản nào'
            : `Hiển thị 1-${filtered.length} trong tổng số ${filtered.length} tài khoản`;

    document.querySelectorAll('.editBtn').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const staff = staffs.find(s => s.id === id);
            showEditStaffModal(staff);
        })
    );
    document.querySelectorAll('.deleteBtn').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            deleteStaffApi(id);
        })
    );
}

function getRoleLabel(role) {
    switch (role) {
        case 'ADMIN': return 'Quản trị viên';
        case 'MANAGER': return 'Quản lý';
        case 'ACCOUNTANT': return 'Kế toán';
        case 'TECHNICIAN': return 'Kỹ thuật viên';
        default: return '';
    }
}

// ================= MODAL HIỂN THỊ & LƯU =================
function createStaffModal() {
    if (document.getElementById('staffModal')) return;
    const modalHTML = `
        <div class="modal fade" id="staffModal" tabindex="-1" aria-labelledby="staffModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-md">
                <div class="modal-content">
                    <div class="modal-header modal-header-custom">
                        <h5 class="modal-title" id="staffModalLabel">Thêm tài khoản</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="staffForm">
                            <input type="hidden" id="staffId">
                            <div class="mb-3 text-center">
                                <span id="avatarModal" class="avatar-circle" style="width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;background:#1b2d73;color:white;font-size:1.5rem;font-weight:bold;border-radius:50%;margin-bottom:8px;">
                                    ?
                                </span>
                            </div>
                            <div class="mb-3">
                                <label for="staffUsername" class="form-label">Tên đăng nhập *</label>
                                <input type="text" class="form-control" id="staffUsername" required>
                            </div>
                            <div class="mb-3" id="passwordField">
                                <label for="staffPassword" class="form-label">Mật khẩu *</label>
                                <input type="password" class="form-control" id="staffPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="staffRole" class="form-label">Vai trò *</label>
                                <select class="form-control" id="staffRole" required>
                                    <option value="">Chọn vai trò</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                    <option value="MANAGER">Quản lý</option>
                                    <option value="ACCOUNTANT">Kế toán</option>
                                    <option value="TECHNICIAN">Kỹ thuật viên</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button type="button" class="btn btn-custom" id="saveStaffBtn">Lưu</button>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .modal-header-custom {
                background: #1b2d73 !important;
                color: #fff !important;
            }
            .modal-header-custom .modal-title {
                color: #fff !important;
            }
            .btn-custom {
                background: #1b2d73;
                color: #fff;
                border: none;
            }
            .btn-custom:hover, .btn-custom:focus {
                background: #1b2d73;
                color: #fff;
            }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showAddStaffModal() {
    createStaffModal();
    document.getElementById('staffModalLabel').textContent = 'Thêm tài khoản';
    document.querySelector('.modal-header').classList.add('modal-header-custom');
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
    document.getElementById('passwordField').style.display = '';
    document.getElementById('staffPassword').value = '';
    document.getElementById('staffUsername').disabled = false;
    document.getElementById('staffPassword').disabled = false;
    document.getElementById('staffRole').disabled = false;
    document.getElementById('avatarModal').textContent = '?';
    document.getElementById('saveStaffBtn').onclick = saveStaff;

    document.getElementById('staffUsername').oninput = function () {
        document.getElementById('avatarModal').textContent = getAvatarLetter(this.value);
    };

    const modal = new bootstrap.Modal(document.getElementById('staffModal'));
    modal.show();
}

function showEditStaffModal(staff) {
    createStaffModal();
    document.getElementById('staffModalLabel').textContent = 'Chỉnh sửa tài khoản';
    document.querySelector('.modal-header').classList.add('modal-header-custom');
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = staff.id || '';
    document.getElementById('staffUsername').value = staff.username || '';
    document.getElementById('staffRole').value = staff.role || '';
    document.getElementById('avatarModal').textContent = getAvatarLetter(staff.username);
    document.getElementById('passwordField').style.display = 'none';
    document.getElementById('staffUsername').disabled = false;
    document.getElementById('staffPassword').disabled = true;
    document.getElementById('staffRole').disabled = false;
    document.getElementById('saveStaffBtn').onclick = saveStaff;

    document.getElementById('staffUsername').oninput = function () {
        document.getElementById('avatarModal').textContent = getAvatarLetter(this.value);
    };

    const modal = new bootstrap.Modal(document.getElementById('staffModal'));
    modal.show();
}

function saveStaff() {
    const staffId = document.getElementById('staffId').value;
    const username = document.getElementById('staffUsername').value.trim();
    const role = document.getElementById('staffRole').value;
    let password = '';
    if (document.getElementById('passwordField').style.display !== 'none') {
        password = document.getElementById('staffPassword').value.trim();
    }
    if (!username || !role || (!staffId && !password)) {
        showAlert('Vui lòng nhập đủ thông tin!', 'danger');
        return;
    }
    if (!staffId) {
        addStaffApi({ username, password, role });
    } else {
        updateStaffApi(staffId, { username, role });
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('staffModal'));
    modal.hide();
}

// ================= SEARCH, FILTER, LOADING, ALERT =================
function showLoading(show) {
    const overlay = document.getElementById('staffLoadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// Alert giống login.js
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

// ================= SỰ KIỆN DOM =================
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('addStaffBtn');
    if (btn) btn.addEventListener('click', showAddStaffModal);

    document.getElementById('searchStaffBtn').addEventListener('click', function () {
        searchKeyword = document.getElementById('searchUsername').value.trim();
        searchRole = document.getElementById('searchRole').value;
        fetchStaffs();
    });
    document.getElementById('clearStaffFiltersBtn').addEventListener('click', function () {
        document.getElementById('searchUsername').value = '';
        document.getElementById('searchRole').value = '';
        searchKeyword = '';
        searchRole = '';
        fetchStaffs();
    });

    fetchStaffs();
});