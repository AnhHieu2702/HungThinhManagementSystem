// ================== CẤU HÌNH ==================
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    feedbacks: `${API_BASE_URL}/api/admin/feedbacks`,
    feedbacksByStatus: (status) => `${API_BASE_URL}/api/admin-technician-accountant/feedbacks/status/${status}`,
    assignFeedback: (id) => `${API_BASE_URL}/api/admin/feedbacks/${id}/assign`,
    updateFeedback: (id) => `${API_BASE_URL}/api/admin-technician-accountant/feedbacks/${id}`
};

// ================== XÁC THỰC ==================
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
let totalFeedbacks = 0;
let allFeedbacks = [];
let filteredFeedbacks = [];
let assignFeedbackId = null;
let editingFeedbackId = null;

// Đúng giá trị backend cần
const HANDLERS = [
    { username: "KYTHUATVIEN", display: "Kỹ thuật viên", backendRole: "TECHNICIAN" },
    { username: "KETOAN", display: "Kế toán", backendRole: "ACCOUNTANT" }
];

const STATUS_OPTIONS = [
    { value: 'PENDING', display: 'Chờ xử lý' },
    { value: 'IN_PROGRESS', display: 'Đang xử lý' },
    { value: 'RESOLVED', display: 'Đã xử lý' },
    { value: 'CLOSED', display: 'Đã đóng' }
];

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', function() {
    loadFeedbacks();
    setupEventListeners();
    setupAssignModalEvents();
    renderHandlerSelectOptions();
    setupEditModalEvents();
    renderEditSelectOptions();
});

// ================== SỰ KIỆN FILTER ==================
function setupEventListeners() {
    const searchTitle = document.getElementById('searchTitle');
    if (searchTitle) {
        searchTitle.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') applyFilters();
        });
    }
    ['searchCategory', 'searchStatus', 'searchHandler'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.addEventListener('change', applyFilters);
    });
}

// ================== LOAD DANH SÁCH PHẢN ÁNH ==================
async function loadFeedbacks() {
    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.feedbacks, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.status && Array.isArray(result.data)) {
            allFeedbacks = result.data;
            filteredFeedbacks = [...allFeedbacks];
            totalFeedbacks = allFeedbacks.length;
            renderTable();
            renderPagination();
        } else {
            showAlert(result.userMessage || 'Có lỗi khi tải dữ liệu phản ánh', 'danger');
        }
    } catch (error) {
        showAlert('Không thể tải danh sách phản ánh', 'danger');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// ================== XỬ LÝ BẢNG ==================
function renderTable() {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

    tbody.innerHTML = currentFeedbacks.map((feedback, index) => {
        // Ưu tiên assignedToName, tiếp theo là assignedToUsername, nếu không có thì "Chưa phân công"
        let handlerDisplay = "Chưa phân công";
        if (feedback.assignedToName) {
            handlerDisplay = getHandlerDisplay(feedback.assignedToName);
        } else if (feedback.assignedToUsername) {
            handlerDisplay = getHandlerDisplay(feedback.assignedToUsername);
        } else if (feedback.handlerName) {
            handlerDisplay = feedback.handlerName;
        }

        return `
        <tr>
            <td class="text-center">${startIndex + index + 1}</td>
            <td class="text-center">${feedback.title}</td>
            <td class="text-center">${feedback.residentName}</td>
            <td class="text-center">
                <div class="feedback-content">${feedback.content}</div>
            </td>
            <td class="text-center">
                <span class="category-badge category-${feedback.category?.toLowerCase()}">${feedback.category}</span>
            </td>
            <td class="text-center">
                <span class="status-badge status-${getStatusCss(feedback.status)}">${getStatusDisplay(feedback.status)}</span>
            </td>
            <td class="text-center">${handlerDisplay}</td>
            <td class="text-center">
                <div class="action-buttons">
                    ${(feedback.status === 'PENDING' || getStatusDisplay(feedback.status) === 'Chờ xử lý') ? `
                        <button class="btn action-btn btn-add-user" onclick="assignHandler('${feedback.id}')" title="Phân công">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    ` : ''}
                    <button class="btn action-btn btn-edit" onclick="editFeedback('${feedback.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('') || '<tr><td colspan="8" class="text-center">Không có dữ liệu</td></tr>';

    updateRecordsInfo(startIndex + 1, Math.min(endIndex, filteredFeedbacks.length), filteredFeedbacks.length);
}

// ================== Helper cho status/handler ==================
function getStatusDisplay(value) {
    // Chuyển enum backend sang tiếng Việt
    const found = STATUS_OPTIONS.find(opt => opt.value === value);
    return found ? found.display : value;
}
function getStatusCss(value) {
    // Dùng cho class badge, luôn lower-case
    switch (value) {
        case 'PENDING': return 'choxuly';
        case 'IN_PROGRESS': return 'dangxuly';
        case 'RESOLVED': return 'daxuly';
        case 'CLOSED': return 'dadong';
        default: return value?.toLowerCase() || '';
    }
}
function getHandlerDisplay(usernameOrName) {
    // Nếu truyền vào là mã thì hiển thị tiếng Việt, nếu là tên tiếng Việt thì trả luôn
    const found = HANDLERS.find(h => h.username === usernameOrName);
    return found ? found.display : (usernameOrName ? usernameOrName : "Chưa phân công");
}
function getHandlerUsernameByDisplay(display) {
    const found = HANDLERS.find(h => h.display === display);
    return found ? found.username : display;
}

// ================== XỬ LÝ PHÂN TRANG ==================
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `
                <li class="page-item active">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
    }

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
    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
    renderPagination();
}

// ================== LỌC DỮ LIỆU ==================
function applyFilters() {
    const title = document.getElementById('searchTitle')?.value.toLowerCase();
    const category = document.getElementById('searchCategory')?.value;
    const status = document.getElementById('searchStatus')?.value;
    const handler = document.getElementById('searchHandler')?.value;

    filteredFeedbacks = allFeedbacks.filter(feedback => {
        const titleMatch = !title || feedback.title?.toLowerCase().includes(title);
        const categoryMatch = !category || feedback.category?.toLowerCase() === category.toLowerCase();
        // status filter: allow filter by both VN and enum
        const statusMatch = !status || feedback.status === status || getStatusDisplay(feedback.status) === status;
        let handlerDisplay = "";
        if (feedback.assignedToName) {
            handlerDisplay = getHandlerDisplay(feedback.assignedToName).toLowerCase();
        } else if (feedback.assignedToUsername) {
            handlerDisplay = getHandlerDisplay(feedback.assignedToUsername).toLowerCase();
        } else if (feedback.handlerName) {
            handlerDisplay = feedback.handlerName.toLowerCase();
        }
        const handlerMatch = !handler || handlerDisplay === handler.toLowerCase();

        return titleMatch && categoryMatch && statusMatch && handlerMatch;
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

function clearFilters() {
    document.getElementById('searchTitle').value = '';
    document.getElementById('searchCategory').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchHandler').value = '';
    
    filteredFeedbacks = [...allFeedbacks];
    currentPage = 1;
    renderTable();
    renderPagination();
}

// ================== PHÂN CÔNG XỬ LÝ ==================
function assignHandler(feedbackId) {
    assignFeedbackId = feedbackId;
    document.getElementById('handlerSelect').value = '';
    const assignModal = new bootstrap.Modal(document.getElementById('assignModal'));
    assignModal.show();
}

// Gán lại options cho select trong modal
function renderHandlerSelectOptions() {
    const select = document.getElementById('handlerSelect');
    if (!select) return;
    select.innerHTML = `<option value="">Tất cả</option>` +
        HANDLERS.map(h => `<option value="${h.username}">${h.display}</option>`).join('');
}

// Render select options cho modal sửa phản ánh
function renderEditSelectOptions() {
    // Status select
    const statusSelect = document.getElementById('editStatus');
    if (statusSelect) {
        statusSelect.innerHTML =
            STATUS_OPTIONS.map(opt => `<option value="${opt.value}">${opt.display}</option>`).join('');
    }
    // Handler select
    const handlerSelect = document.getElementById('editHandler');
    if (handlerSelect) {
        handlerSelect.innerHTML =
            `<option value="">Chưa phân công</option>` +
            HANDLERS.map(h => `<option value="${h.username}">${h.display}</option>`).join('');
    }
}

// Setup event modal phân công
function setupAssignModalEvents() {
    const assignBtn = document.getElementById('assignSubmitBtn');
    if (assignBtn) {
        assignBtn.addEventListener('click', async function() {
            const handlerValue = document.getElementById('handlerSelect').value;
            if (!handlerValue) {
                showAlert('Vui lòng chọn người xử lý!', 'danger');
                return;
            }
            showLoading(true);
            try {
                // Gửi đúng key cho backend (theo Swagger phải là assignedToUsername)
                const bodyData = { assignedToUsername: handlerValue };
                const response = await fetch(API_ENDPOINTS.assignFeedback(assignFeedbackId), {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(bodyData)
                });
                if (!response.ok) {
                    let errorMsg = 'Network response was not ok';
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.userMessage || errorMsg;
                    } catch (e) {}
                    throw new Error(errorMsg);
                }
                const result = await response.json();
                if (result.status) {
                    showAlert('Phân công xử lý thành công!', 'success');
                    const modalEl = document.getElementById('assignModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();
                    loadFeedbacks();
                } else {
                    showAlert(result.userMessage || 'Có lỗi khi phân công', 'danger');
                }
            } catch (error) {
                showAlert('Không thể phân công người xử lý: ' + error.message, 'danger');
                console.error('Error:', error);
            } finally {
                showLoading(false);
            }
        });
    }
}

async function updateFeedbackStatus(feedbackId, newStatus) {
    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.updateFeedback(feedbackId), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        if (result.status) {
            showAlert('Cập nhật trạng thái thành công!', 'success');
            loadFeedbacks();
        } else {
            showAlert(result.userMessage || 'Có lỗi khi cập nhật trạng thái', 'danger');
        }
    } catch (error) {
        showAlert('Không thể cập nhật trạng thái', 'danger');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// ================== SỬA PHẢN ÁNH ==================
function editFeedback(feedbackId) {
    // Lấy từ allFeedbacks để đảm bảo luôn đầy đủ dữ liệu
    const feedback = allFeedbacks.find(fb => fb.id === feedbackId);
    if (!feedback) {
        showAlert('Không tìm thấy dữ liệu phản ánh', 'danger');
        return;
    }

    editingFeedbackId = feedbackId;

    // Fill dữ liệu vào form modal
    document.getElementById('editTitle').value = feedback.title || '';
    document.getElementById('editCategory').value = feedback.category || '';
    document.getElementById('editResidentName').value = feedback.residentName || '';

    // ==== SỬA ĐOẠN GÁN TRẠNG THÁI CHO ĐÚNG ====
    const statusSelect = document.getElementById('editStatus');
    if (statusSelect) {
        // Nếu backend trả về tiếng Việt, tìm lại giá trị enum
        let matchedStatus = feedback.status;
        // Nếu status là tiếng Việt, tìm value enum tương ứng
        const matchOption = STATUS_OPTIONS.find(opt =>
            opt.value === feedback.status || opt.display === feedback.status
        );
        if (matchOption) matchedStatus = matchOption.value;
        statusSelect.value = matchedStatus;
    }
    // ============================================

    // Người xử lý: ưu tiên assignedToName, tiếp theo là assignedToUsername, nếu không đúng thì để trống (chưa phân công)
    let handlerValue = '';
    if (HANDLERS.find(h => h.username === feedback.assignedToName)) {
        handlerValue = feedback.assignedToName;
    } else if (HANDLERS.find(h => h.username === feedback.assignedToUsername)) {
        handlerValue = feedback.assignedToUsername;
    }
    document.getElementById('editHandler').value = handlerValue;

    document.getElementById('editContent').value = feedback.content || '';
    document.getElementById('editResponse').value = feedback.response || '';

    // Hiển thị modal
    const editModal = new bootstrap.Modal(document.getElementById('editFeedbackModal'));
    editModal.show();
}

// Setup submit modal sửa phản ánh
function setupEditModalEvents() {
    const editForm = document.getElementById('editFeedbackForm');
    if (!editForm) return;
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const status = document.getElementById('editStatus').value; // PENDING, IN_PROGRESS, RESOLVED, CLOSED
        const assignedToUsername = document.getElementById('editHandler').value; // KYTHUATVIEN hoặc KETOAN
        const responseText = document.getElementById('editResponse').value;

        if (!status || !responseText) {
            showAlert('Vui lòng nhập đầy đủ các trường cần thiết!', 'danger');
            return;
        }

        showLoading(true);
        try {
            const bodyData = {
                status: status,
                assignedToUsername: assignedToUsername,
                response: responseText
            };

            const response = await fetch(API_ENDPOINTS.updateFeedback(editingFeedbackId), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                let errorMsg = 'Lỗi hệ thống, vui lòng thử lại sau.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.userMessage || errorMsg;
                } catch (e) {}
                throw new Error(errorMsg);
            }
            const result = await response.json();
            if (result.status) {
                showAlert('Cập nhật phản ánh thành công!', 'success');
                const modalEl = document.getElementById('editFeedbackModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
                loadFeedbacks();
            } else {
                showAlert(result.userMessage || 'Có lỗi khi cập nhật phản ánh', 'danger');
            }
        } catch (error) {
            showAlert('Không thể cập nhật phản ánh: ' + error.message, 'danger');
            console.error('Error:', error);
        } finally {
            showLoading(false);
        }
    });
}

// ================== TIỆN ÍCH ==================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add('show');
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }, 100);
}

function updateRecordsInfo(start, end, total) {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        recordsInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${total} phản ánh`;
    }
}