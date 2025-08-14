// Apartment Management for ADMIN - Table CRUD (full code, UI/UX giống admin.js)

const API_BASE_URL = 'http://localhost:8080/api/admin/apartments';

let apartments = [];
let searchKeyword = '';
let searchBlock = '';
let searchFloor = '';
let searchArea = '';

let currentPage = 1;
const pageSize = 5;

// ====== Utility Functions ======
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
function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => {
        alert.classList.add('hide');
        setTimeout(() => {
            if (alert.parentNode) alert.parentNode.removeChild(alert);
        }, 300);
    });
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible custom-alert`;
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
    setTimeout(() => alertDiv.classList.add('show'), 100);
    const autoHideTimer = setTimeout(() => hideAlert(alertDiv), 5000);
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
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}
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
    document.getElementById('confirmBtn').onclick = () => { div.remove(); onConfirm(); };
    document.getElementById('cancelBtn').onclick = () => { div.remove(); };
}
function checkAreaRange(area, range) {
    switch (range) {
        case '50-70': return area >= 50 && area <= 70;
        case '70-90': return area >= 70 && area <= 90;
        case '90-120': return area >= 90 && area <= 120;
        case '120+': return area > 120;
        default: return true;
    }
}

// ====== API ======
async function fetchApartments() {
    showLoading(true);
    try {
        const res = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Lỗi khi lấy danh sách căn hộ');
        const data = await res.json();
        apartments = Array.isArray(data.data) ? data.data : [];
        currentPage = 1;
        renderApartmentTable();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}
async function addApartmentApi(apartment) {
    showLoading(true);
    try {
        const res = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(apartment)
        });
        if (!res.ok) throw new Error('Lỗi khi thêm căn hộ');
        showAlert('Thêm căn hộ thành công!', 'success');
        await fetchApartments();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}
async function updateApartmentApi(id, apartment) {
    showLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(apartment)
        });
        if (!res.ok) throw new Error('Lỗi khi cập nhật căn hộ');
        showAlert('Cập nhật căn hộ thành công!', 'success');
        await fetchApartments();
    } catch (e) {
        showAlert(e.message, 'danger');
    }
    showLoading(false);
}
async function deleteApartmentApi(id) {
    showConfirmDialog('Bạn có chắc chắn muốn xóa căn hộ này?', async () => {
        showLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Lỗi khi xóa căn hộ');
            showAlert('Xóa căn hộ thành công!', 'success');
            await fetchApartments();
        } catch (e) {
            showAlert(e.message, 'danger');
        }
        showLoading(false);
    });
}

// ====== Table Render & Pagination ======
function filterApartments() {
    return apartments.filter(apartment => {
        const matchNumber = (apartment.apartmentNumber || '').toLowerCase().includes(searchKeyword.toLowerCase());
        const matchBlock = !searchBlock || apartment.block === searchBlock;
        const matchFloor = !searchFloor || String(apartment.floor) === searchFloor;
        const matchArea = !searchArea || checkAreaRange(apartment.area, searchArea);
        return matchNumber && matchBlock && matchFloor && matchArea;
    });
}
function renderApartmentTable() {
    const tbody = document.getElementById('apartmentTableBody');
    let filtered = filterApartments();

    // Pagination logic
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);

    const showList = filtered.slice(startIdx, endIdx);

    tbody.innerHTML = showList.map((apartment, idx) => `
    <tr>
        <td class="align-middle text-center">${startIdx + idx + 1}</td>
        <td class="align-middle text-center">${apartment.apartmentNumber}</td>
        <td class="align-middle text-center">${apartment.floor}</td>
        <td class="align-middle text-center">${apartment.block}</td>
        <td class="align-middle text-center">${apartment.area}</td>
        <td class="align-middle text-center">
            <button class="btn btn-sm editBtn" data-id="${apartment.id}" title="Sửa"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm deleteBtn" data-id="${apartment.id}" title="Xoá"><i class="fas fa-trash"></i></button>
        </td>
    </tr>
`).join('') || `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;

    // Record info
    document.getElementById('apartmentRecordsInfo').textContent =
        total === 0 ? 'Không có căn hộ nào'
            : `Hiển thị ${total === 0 ? 0 : (startIdx + 1)}-${endIdx} trong tổng số ${total} căn hộ`;

    // Pagination
    renderApartmentPagination(totalPages);

    // Event handler edit/delete
    document.querySelectorAll('.editBtn').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const apartment = apartments.find(a => a.id === id);
            showEditApartmentModal(apartment);
        })
    );
    document.querySelectorAll('.deleteBtn').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            deleteApartmentApi(id);
        })
    );
}
function renderApartmentPagination(totalPages) {
    const ul = document.getElementById('apartmentPaginationContainer');
    ul.innerHTML = '';
    if (totalPages <= 1) return;
    // Prev
    const prevLi = document.createElement('li');
    prevLi.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#">‹</a>`;
    prevLi.onclick = e => { e.preventDefault(); if (currentPage > 1) { currentPage--; renderApartmentTable(); } };
    ul.appendChild(prevLi);
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === currentPage ? ' active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = e => { e.preventDefault(); currentPage = i; renderApartmentTable(); };
        ul.appendChild(li);
    }
    // Next
    const nextLi = document.createElement('li');
    nextLi.className = `page-item${currentPage === totalPages ? ' disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#">›</a>`;
    nextLi.onclick = e => { e.preventDefault(); if (currentPage < totalPages) { currentPage++; renderApartmentTable(); } };
    ul.appendChild(nextLi);
}

// ====== Modal ======
function createApartmentModal() {
    if (document.getElementById('apartmentModal')) return;
    const modalHTML = `
        <div class="modal fade" id="apartmentModal" tabindex="-1" aria-labelledby="apartmentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-md">
                <div class="modal-content">
                    <div class="modal-header modal-header-custom">
                        <h5 class="modal-title" id="apartmentModalLabel">Thêm căn hộ</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="apartmentForm">
                            <input type="hidden" id="apartmentId">
                            <div class="mb-3">
                                <label class="form-label">Mã căn hộ *</label>
                                <input type="text" class="form-control" id="apartmentNumber" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Tầng *</label>
                                <input type="number" class="form-control" id="floor" min="1" max="50" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Tòa *</label>
                                <select class="form-control" id="block" required>
                                    <option value="">Chọn tòa</option>
                                    <option value="A">Tòa A</option>
                                    <option value="B">Tòa B</option>
                                    <option value="C">Tòa C</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Diện tích (m²) *</label>
                                <input type="number" class="form-control" id="area" min="30" max="300" required>
                            </div>
                            <div id="addFields" style="display: none;">
                                <hr>
                                <h6>Thông tin đăng nhập (chỉ khi thêm mới)</h6>
                                <div class="mb-3">
                                    <label class="form-label">Tên đăng nhập *</label>
                                    <input type="text" class="form-control" id="username">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Mật khẩu *</label>
                                    <input type="password" class="form-control" id="password">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button type="button" class="btn btn-custom" id="saveApartmentBtn">Lưu</button>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .modal-header-custom { background: #1b2d73 !important; color: #fff !important; }
            .modal-header-custom .modal-title { color: #fff !important; }
            .btn-custom { background: #1b2d73; color: #fff; border: none;}
            .btn-custom:hover, .btn-custom:focus { background: #1b2d73; color: #fff;}
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
function showAddApartmentModal() {
    createApartmentModal();
    document.getElementById('apartmentModalLabel').textContent = 'Thêm căn hộ';
    document.getElementById('apartmentForm').reset();
    document.getElementById('apartmentId').value = '';
    document.getElementById('addFields').style.display = '';
    document.getElementById('username').required = true;
    document.getElementById('password').required = true;
    document.getElementById('saveApartmentBtn').onclick = saveApartment;
    const modal = new bootstrap.Modal(document.getElementById('apartmentModal'));
    modal.show();
}
function showEditApartmentModal(apartment) {
    createApartmentModal();
    document.getElementById('apartmentModalLabel').textContent = 'Chỉnh sửa căn hộ';
    document.getElementById('apartmentForm').reset();
    document.getElementById('apartmentId').value = apartment.id || '';
    document.getElementById('apartmentNumber').value = apartment.apartmentNumber || '';
    document.getElementById('floor').value = apartment.floor || '';
    document.getElementById('block').value = apartment.block || '';
    document.getElementById('area').value = apartment.area || '';
    document.getElementById('addFields').style.display = 'none';
    document.getElementById('username').required = false;
    document.getElementById('password').required = false;
    document.getElementById('saveApartmentBtn').onclick = saveApartment;
    const modal = new bootstrap.Modal(document.getElementById('apartmentModal'));
    modal.show();
}
function saveApartment() {
    const apartmentId = document.getElementById('apartmentId').value;
    const apartmentNumber = document.getElementById('apartmentNumber').value.trim();
    const floor = parseInt(document.getElementById('floor').value);
    const block = document.getElementById('block').value;
    const area = parseInt(document.getElementById('area').value);

    if (!apartmentNumber || !floor || !block || !area) {
        showAlert('Vui lòng nhập đủ thông tin!', 'danger');
        return;
    }

    if (!apartmentId) {
        // Thêm mới
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!username || !password) {
            showAlert('Vui lòng nhập tên đăng nhập và mật khẩu!', 'danger');
            return;
        }
        addApartmentApi({
            apartmentNumber, floor, block, area, username, password
        });
    } else {
        // Sửa
        updateApartmentApi(apartmentId, {
            apartmentNumber, floor, block, area
        });
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('apartmentModal'));
    modal.hide();
}

// ====== DOM Events ======
document.addEventListener('DOMContentLoaded', function () {
    // Tìm kiếm, filter
    document.getElementById('searchInput').addEventListener('input', function () {
        searchKeyword = this.value.trim();
        currentPage = 1;
        renderApartmentTable();
    });
    document.getElementById('blockFilter').addEventListener('change', function () {
        searchBlock = this.value;
        currentPage = 1;
        renderApartmentTable();
    });
    document.getElementById('floorFilter').addEventListener('input', function () {
        searchFloor = this.value.trim();
        currentPage = 1;
        renderApartmentTable();
    });
    document.getElementById('areaFilter').addEventListener('change', function () {
        searchArea = this.value;
        currentPage = 1;
        renderApartmentTable();
    });
    // Clear filter
    document.getElementById('clearApartmentFiltersBtn').addEventListener('click', function () {
        document.getElementById('searchInput').value = '';
        document.getElementById('blockFilter').value = '';
        document.getElementById('floorFilter').value = '';
        document.getElementById('areaFilter').value = '';
        searchKeyword = '';
        searchBlock = '';
        searchFloor = '';
        searchArea = '';
        currentPage = 1;
        renderApartmentTable();
    });
    // Tìm kiếm button
    document.getElementById('searchApartmentBtn').addEventListener('click', function () {
        searchKeyword = document.getElementById('searchInput').value.trim();
        searchBlock = document.getElementById('blockFilter').value;
        searchFloor = document.getElementById('floorFilter').value.trim();
        searchArea = document.getElementById('areaFilter').value;
        currentPage = 1;
        renderApartmentTable();
    });
    // Thêm mới
    document.getElementById('addApartmentBtn').addEventListener('click', showAddApartmentModal);

    fetchApartments();
});