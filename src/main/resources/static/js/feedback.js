// ================== CẤU HÌNH ==================
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    feedbacks: `${API_BASE_URL}/api/admin/feedbacks`,
    feedbacksByStatus: (status) => `${API_BASE_URL}/api/admin-technician-accountant/feedbacks/status/${status}`,
    assignFeedback: (id) => `${API_BASE_URL}/api/admin/feedbacks/${id}/assign`,
    updateFeedback: (id) => `${API_BASE_URL}/api/admin-technician/feedbacks/${id}`
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

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', function() {
    loadFeedbacks();
    setupEventListeners();
});

// ================== SỰ KIỆN FILTER ==================
function setupEventListeners() {
    // Sự kiện tìm kiếm theo tiêu đề
    const searchTitle = document.getElementById('searchTitle');
    if (searchTitle) {
        searchTitle.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }

    // Sự kiện lọc theo danh mục và trạng thái
    ['searchCategory', 'searchStatus', 'searchHandler'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
}

// ================== LOAD DANH SÁCH PHẢN ÁNH ==================
async function loadFeedbacks() {
    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.feedbacks, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

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

    tbody.innerHTML = currentFeedbacks.map((feedback, index) => `
        <tr>
            <td class="text-center">${startIndex + index + 1}</td>
            <td class="text-center">${feedback.title}</td>
            <td class="text-center">${feedback.residentName}</td>
            <td class="text-center">
                <div class="feedback-content">${feedback.content}</div>
            </td>
            <td class="text-center">
                <span class="category-badge category-${feedback.category.toLowerCase()}">${feedback.category}</span>
            </td>
            <td class="text-center">
                <span class="status-badge status-${feedback.status.toLowerCase()}">${feedback.status}</span>
            </td>
            <td class="text-center">${feedback.handlerName || 'Chưa phân công'}</td>
            <td class="text-center">
                <div class="action-buttons">
                    ${feedback.status.toLowerCase() === 'pending' || feedback.status.toLowerCase() === 'chờ xử lý' ? `
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
    `).join('') || '<tr><td colspan="8" class="text-center">Không có dữ liệu</td></tr>';

    updateRecordsInfo(startIndex + 1, Math.min(endIndex, filteredFeedbacks.length), filteredFeedbacks.length);
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
        const titleMatch = !title || feedback.title.toLowerCase().includes(title);
        const categoryMatch = !category || feedback.category.toLowerCase() === category.toLowerCase();
        const statusMatch = !status || feedback.status.toLowerCase() === status.toLowerCase();
        const handlerMatch = !handler || (feedback.handlerName && feedback.handlerName.toLowerCase() === handler.toLowerCase());

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

// ================== XỬ LÝ PHẢN ÁNH ==================
async function assignHandler(feedbackId) {
    const handlerName = prompt('Nhập tên người xử lý:');
    if (!handlerName) return;

    showLoading(true);
    try {
        const response = await fetch(API_ENDPOINTS.assignFeedback(feedbackId), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ handlerName })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        if (result.status) {
            showAlert('Phân công xử lý thành công!', 'success');
            loadFeedbacks();
        } else {
            showAlert(result.userMessage || 'Có lỗi khi phân công', 'danger');
        }
    } catch (error) {
        showAlert('Không thể phân công người xử lý', 'danger');
        console.error('Error:', error);
    } finally {
        showLoading(false);
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