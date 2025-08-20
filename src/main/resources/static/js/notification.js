// Notification Management for ADMIN - Table CRUD, Detail View (UI/UX giống apartment.js)
// API: http://localhost:8080/api/notifications

const NOTIFICATION_API_URL = 'http://localhost:8080/api/notifications';

let notifications = [];
let notificationSearchKeyword = '';
let notificationSender = '';
let notificationPriority = '';

let notificationCurrentPage = 1;
const notificationPageSize = 5;

// ===== Utility Functions (Reuse from apartment.js as needed) =====
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
function notificationShowAlert(message, type) {
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
    const autoHideTimer = setTimeout(() => notificationHideAlert(alertDiv), 5000);
    const closeBtn = alertDiv.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHideTimer);
        notificationHideAlert(alertDiv);
    });
}
function notificationHideAlert(alertDiv) {
    alertDiv.classList.remove('show');
    alertDiv.classList.add('hide');
    setTimeout(() => {
        if (alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
    }, 300);
}
function notificationShowLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}
function notificationShowConfirmDialog(message, onConfirm) {
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

// ===== API =====
async function fetchNotifications() {
    notificationShowLoading(true);
    try {
        const res = await fetch(NOTIFICATION_API_URL, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Lỗi khi lấy danh sách thông báo');
        const data = await res.json();
        notifications = Array.isArray(data.data) ? data.data : [];
        notificationCurrentPage = 1;
        renderNotificationTable();
    } catch (e) {
        notificationShowAlert(e.message, 'danger');
    }
    notificationShowLoading(false);
}
async function addNotificationApi(notification) {
    notificationShowLoading(true);
    try {
        const res = await fetch(NOTIFICATION_API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(notification)
        });
        if (!res.ok) throw new Error('Lỗi khi thêm thông báo');
        notificationShowAlert('Thêm thông báo thành công!', 'success');
        await fetchNotifications();
    } catch (e) {
        notificationShowAlert(e.message, 'danger');
    }
    notificationShowLoading(false);
}
async function updateNotificationApi(id, notification) {
    notificationShowLoading(true);
    try {
        const res = await fetch(`${NOTIFICATION_API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(notification)
        });
        if (!res.ok) throw new Error('Lỗi khi cập nhật thông báo');
        notificationShowAlert('Cập nhật thông báo thành công!', 'success');
        await fetchNotifications();
    } catch (e) {
        notificationShowAlert(e.message, 'danger');
    }
    notificationShowLoading(false);
}
async function deleteNotificationApi(id) {
    notificationShowConfirmDialog('Bạn có chắc chắn muốn xóa thông báo này?', async () => {
        notificationShowLoading(true);
        try {
            const res = await fetch(`${NOTIFICATION_API_URL}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Lỗi khi xóa thông báo');
            notificationShowAlert('Xóa thông báo thành công!', 'success');
            await fetchNotifications();
        } catch (e) {
            notificationShowAlert(e.message, 'danger');
        }
        notificationShowLoading(false);
    });
}
async function fetchNotificationDetail(id) {
    notificationShowLoading(true);
    try {
        const res = await fetch(`${NOTIFICATION_API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Lỗi khi lấy chi tiết thông báo');
        const data = await res.json();
        showDetailNotificationModal(data.data);
    } catch (e) {
        notificationShowAlert(e.message, 'danger');
    }
    notificationShowLoading(false);
}

// ====== Table Render & Pagination ======
function filterNotifications() {
    return notifications.filter(n => {
        const matchTitle = (n.title || '').toLowerCase().includes(notificationSearchKeyword.toLowerCase());
        const matchSender = !notificationSender || ((n.senderType || '').toUpperCase() === notificationSender);
        const matchPriority = !notificationPriority || ((n.priority || '').toUpperCase() === notificationPriority);
        return matchTitle && matchSender && matchPriority;
    });
}
function renderNotificationTable() {
    const tbody = document.getElementById('notificationTableBody');
    let filtered = filterNotifications();

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / notificationPageSize) || 1;
    if (notificationCurrentPage > totalPages) notificationCurrentPage = totalPages;
    const startIdx = (notificationCurrentPage - 1) * notificationPageSize;
    const endIdx = Math.min(startIdx + notificationPageSize, total);

    const showList = filtered.slice(startIdx, endIdx);

    tbody.innerHTML = showList.map((n, idx) => `
        <tr>
            <td class="align-middle text-center">${startIdx + idx + 1}</td>
            <td class="align-middle text-center">${n.title}</td>
            <td class="align-middle text-center">${n.senderName || ''}</td>
            <td class="align-middle text-center">${convertPriority(n.priority)}</td>
            <td class="align-middle text-center">${n.sendTime || ''}</td>
            <td class="align-middle text-center table-action-btns">
                <button class="btn btn-sm btn-edit" data-id="${n.id}" title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-view" data-id="${n.id}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-delete" data-id="${n.id}" title="Xoá"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;

    document.getElementById('notificationRecordsInfo').textContent =
        total === 0 ? 'Không có thông báo nào'
            : `Hiển thị ${total === 0 ? 0 : (startIdx + 1)}-${endIdx} trong tổng số ${total} thông báo`;

    renderNotificationPagination(totalPages);

    // Gắn lại event handler cho nút sau khi render
    document.querySelectorAll('.btn-edit').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const noti = notifications.find(n => String(n.id) === String(id));
            showEditNotificationModal(noti);
        })
    );
    document.querySelectorAll('.btn-delete').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            deleteNotificationApi(id);
        })
    );
    document.querySelectorAll('.btn-view').forEach(btn =>
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            fetchNotificationDetail(id);
        })
    );
}
function renderNotificationPagination(totalPages) {
    const ul = document.getElementById('notificationPaginationContainer');
    ul.innerHTML = '';
    if (totalPages <= 1) return;
    // Prev
    const prevLi = document.createElement('li');
    prevLi.className = `page-item${notificationCurrentPage === 1 ? ' disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#">‹</a>`;
    prevLi.onclick = e => { e.preventDefault(); if (notificationCurrentPage > 1) { notificationCurrentPage--; renderNotificationTable(); } };
    ul.appendChild(prevLi);
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === notificationCurrentPage ? ' active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = e => { e.preventDefault(); notificationCurrentPage = i; renderNotificationTable(); };
        ul.appendChild(li);
    }
    // Next
    const nextLi = document.createElement('li');
    nextLi.className = `page-item${notificationCurrentPage === totalPages ? ' disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#">›</a>`;
    nextLi.onclick = e => { e.preventDefault(); if (notificationCurrentPage < totalPages) { notificationCurrentPage++; renderNotificationTable(); } };
    ul.appendChild(nextLi);
}
function convertPriority(priority) {
    if (!priority) return '';
    if (priority === 'NORMAL') return 'Bình thường';
    if (priority === 'IMPORTANT') return 'Quan trọng';
    return priority;
}
function convertTargetType(targetType) {
    switch (targetType) {
        case 'ALL': return 'Tất cả';
        case 'A': return 'Tòa A';
        case 'B': return 'Tòa B';
        case 'C': return 'Tòa C';
        default: return targetType;
    }
}

// ====== Modal ======
function showAddNotificationModal() {
    document.getElementById('notificationModalLabel').textContent = 'Thêm thông báo';
    document.getElementById('notificationForm').reset();
    document.getElementById('notificationId').value = '';
    document.getElementById('saveNotificationBtn').onclick = saveNotification;
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
}
function showEditNotificationModal(notification) {
    if (!notification) {
        notificationShowAlert('Không tìm thấy thông báo!', 'danger');
        return;
    }
    document.getElementById('notificationModalLabel').textContent = 'Chỉnh sửa thông báo';
    document.getElementById('notificationForm').reset();
    document.getElementById('notificationId').value = notification.id || '';
    document.getElementById('notificationTitle').value = notification.title || '';
    document.getElementById('notificationContent').value = notification.content || '';
    document.getElementById('notificationTargetType').value = notification.targetType || 'ALL';
    document.getElementById('notificationPriority').value = notification.priority || 'NORMAL';
    document.getElementById('saveNotificationBtn').onclick = saveNotification;
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
}
function saveNotification() {
    const id = document.getElementById('notificationId').value;
    const title = document.getElementById('notificationTitle').value.trim();
    const content = document.getElementById('notificationContent').value.trim();
    const targetType = document.getElementById('notificationTargetType').value;
    const priority = document.getElementById('notificationPriority').value;

    if (!title || !content || !targetType || !priority) {
        notificationShowAlert('Vui lòng nhập đủ thông tin!', 'danger');
        return;
    }

    if (!id) {
        addNotificationApi({ title, content, targetType, priority });
    } else {
        updateNotificationApi(id, { title, content, targetType, priority });
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('notificationModal'));
    modal.hide();
}
function showDetailNotificationModal(notification) {
    document.getElementById('detailNotificationTitle').value = notification.title || '';
    document.getElementById('detailNotificationContent').value = notification.content || '';
    document.getElementById('detailNotificationTargetType').value = convertTargetType(notification.targetType);
    document.getElementById('detailNotificationPriority').value = convertPriority(notification.priority);
    document.getElementById('detailNotificationSender').value = notification.senderName || '';
    document.getElementById('detailNotificationTime').value = notification.sendTime || '';
    const modal = new bootstrap.Modal(document.getElementById('notificationDetailModal'));
    modal.show();
}

// ====== DOM Events ======
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchNotificationInput').addEventListener('input', function () {
        notificationSearchKeyword = this.value.trim();
        notificationCurrentPage = 1;
        renderNotificationTable();
    });
    document.getElementById('senderFilter').addEventListener('change', function () {
        notificationSender = this.value;
        notificationCurrentPage = 1;
        renderNotificationTable();
    });
    document.getElementById('priorityFilter').addEventListener('change', function () {
        notificationPriority = this.value;
        notificationCurrentPage = 1;
        renderNotificationTable();
    });
    document.getElementById('clearNotificationFiltersBtn').addEventListener('click', function () {
        document.getElementById('searchNotificationInput').value = '';
        document.getElementById('senderFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        notificationSearchKeyword = '';
        notificationSender = '';
        notificationPriority = '';
        notificationCurrentPage = 1;
        renderNotificationTable();
    });
    document.getElementById('searchNotificationBtn').addEventListener('click', function () {
        notificationSearchKeyword = document.getElementById('searchNotificationInput').value.trim();
        notificationSender = document.getElementById('senderFilter').value;
        notificationPriority = document.getElementById('priorityFilter').value;
        notificationCurrentPage = 1;
        renderNotificationTable();
    });
    document.getElementById('addNotificationBtn').addEventListener('click', showAddNotificationModal);

    fetchNotifications();
});

function createNotificationModal() {
    if (document.getElementById('notificationModal')) return;
    const modalHTML = `
        <div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <form class="modal-content" id="notificationForm" autocomplete="off">
              <div class="modal-header">
                <h5 class="modal-title" id="notificationModalLabel">Thêm thông báo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="notificationId">
                <div class="mb-3">
                  <label class="form-label">Tiêu đề</label>
                  <input type="text" class="form-control" id="notificationTitle" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nội dung</label>
                  <textarea class="form-control" id="notificationContent" rows="4" required></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Đối tượng</label>
                  <select class="form-control" id="notificationTargetType" required>
                    <option value="ALL">Tất cả</option>
                    <option value="A">Tòa A</option>
                    <option value="B">Tòa B</option>
                    <option value="C">Tòa C</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Trạng thái</label>
                  <select class="form-control" id="notificationPriority" required>
                    <option value="NORMAL">Bình thường</option>
                    <option value="IMPORTANT">Quan trọng</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                <button type="button" class="btn btn-primary" id="saveNotificationBtn">Lưu</button>
              </div>
            </form>
          </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showAddNotificationModal() {
    createNotificationModal();
    document.getElementById('notificationModalLabel').textContent = 'Thêm thông báo';
    document.getElementById('notificationForm').reset();
    document.getElementById('notificationId').value = '';
    document.getElementById('saveNotificationBtn').onclick = saveNotification;
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
}

function showEditNotificationModal(notification) {
    if (!notification) {
        notificationShowAlert('Không tìm thấy thông báo!', 'danger');
        return;
    }
    createNotificationModal();
    document.getElementById('notificationModalLabel').textContent = 'Chỉnh sửa thông báo';
    document.getElementById('notificationForm').reset();
    document.getElementById('notificationId').value = notification.id || '';
    document.getElementById('notificationTitle').value = notification.title || '';
    document.getElementById('notificationContent').value = notification.content || '';
    document.getElementById('notificationTargetType').value = notification.targetType || 'ALL';
    document.getElementById('notificationPriority').value = notification.priority || 'NORMAL';
    document.getElementById('saveNotificationBtn').onclick = saveNotification;
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
}