const PAGE_SIZE = 5;
let currentPage = 1;
let financialReports = [
    { stt: 1, title: "Tiêu đề 1", type: "Loại 1", amount: "16500000", time: "16:40", date: "2025-06-02", desc: "Mô tả 1", note: "Ghi chú 1" },
    { stt: 2, title: "Tiêu đề 2", type: "Loại 2", amount: "3700000", time: "09:00", date: "2025-06-02", desc: "Mô tả 2", note: "Ghi chú 2" },
    { stt: 3, title: "Tiêu đề 3", type: "Loại 3", amount: "5650000", time: "11:30", date: "2025-06-03", desc: "Mô tả 3", note: "Ghi chú 3" },
    { stt: 4, title: "Tiêu đề 4", type: "Loại 4", amount: "2100000", time: "18:00", date: "2025-06-04", desc: "Mô tả 4", note: "Ghi chú 4" }
];
let filteredReports = financialReports.slice();
let totalReports = filteredReports.length;
let currentEditIndex = null;
let currentViewIndex = null;
let currentExportReportIndex = null;

document.addEventListener('DOMContentLoaded', function () {
    renderFinancialTable();
    renderPagination();
    setupEventListeners();
    setupAddReportModal();
    setupViewModal();
    setupEditModal();
    setupExportReportModal();
});

// ========== BẢNG DANH SÁCH ==========
function renderFinancialTable() {
    const tbody = document.getElementById('financialTableBody');
    tbody.innerHTML = '';

    let pageReports = filteredReports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    pageReports.forEach((report, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${(currentPage - 1) * PAGE_SIZE + index + 1}</td>
            <td>${report.title || ''}</td>
            <td>${report.type || ''}</td>
            <td>${formatMoney(report.amount) || ''}</td>
            <td>${report.time || ''}</td>
            <td>${report.date ? formatDate(report.date) : ''}</td>
            <td>
                <button class="action-btn" title="Xem" onclick="openViewReportModal(${(currentPage - 1) * PAGE_SIZE + index})"><i class="fas fa-eye"></i></button>
                <button class="action-btn" title="Sửa" onclick="openEditReportModal(${(currentPage - 1) * PAGE_SIZE + index})"><i class="fas fa-pencil-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const startIdx = (filteredReports.length === 0) ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endIdx = Math.min(currentPage * PAGE_SIZE, totalReports);
    document.getElementById('recordsInfo').textContent = `Hiển thị ${startIdx}-${endIdx} trong tổng số ${totalReports} báo cáo`;
}

// ========== PHÂN TRANG ==========
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    const nav = container.parentElement;
    const totalPages = Math.ceil(totalReports / PAGE_SIZE);

    if (totalReports <= PAGE_SIZE) {
        container.innerHTML = '';
        if (nav) nav.style.display = 'none';
        return;
    } else {
        if (nav) nav.style.display = '';
    }

    let html = '';
    html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1});return false;"><i class="fas fa-angle-left"></i></a>
    </li>`;

    let pageNumbers = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
        pageNumbers = [1, 2, 3, '...', totalPages];
    }
    pageNumbers.forEach(num => {
        if (num === '...') {
            html += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
        } else {
            html += `<li class="page-item${num === currentPage ? ' active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${num});return false;">${num}</a>
            </li>`;
        }
    });

    html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1});return false;"><i class="fas fa-angle-right"></i></a>
    </li>`;

    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(totalReports / PAGE_SIZE);
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    renderFinancialTable();
    renderPagination();
}

// ========== FILTER ==========
function setupEventListeners() {
    document.getElementById('searchTitle').addEventListener('keyup', function (e) {
        if (e.key === 'Enter') applyFilters();
    });
    document.getElementById('searchType').addEventListener('change', applyFilters);
}

function applyFilters() {
    const title = document.getElementById('searchTitle').value.trim().toLowerCase();
    const type = document.getElementById('searchType').value;
    filteredReports = financialReports.filter(r => {
        const titleMatch = !title || r.title.toLowerCase().includes(title);
        const typeMatch = !type || r.type === `Loại ${type}`;
        return titleMatch && typeMatch;
    });
    totalReports = filteredReports.length;
    currentPage = 1;
    renderFinancialTable();
    renderPagination();
}

function clearFilters() {
    document.getElementById('searchTitle').value = '';
    document.getElementById('searchType').value = '';
    filteredReports = financialReports.slice();
    totalReports = filteredReports.length;
    currentPage = 1;
    renderFinancialTable();
    renderPagination();
}

// ========== MODAL THÊM MỚI ==========
function setupAddReportModal() {
    document.getElementById('addReportBtn').addEventListener('click', function () {
        document.getElementById('addReportModal').style.display = 'flex';
        resetAddReportForm();
        setTimeout(() => document.getElementById('addTitle').focus(), 150);
    });
    document.getElementById('closeAddReportModal').addEventListener('click', hideAddReportModal);
    document.getElementById('cancelAddReportBtn').addEventListener('click', hideAddReportModal);
    document.getElementById('addReportForm').addEventListener('submit', function (e) {
        e.preventDefault();
        handleAddReport();
    });
    document.getElementById('addReportModal').addEventListener('mousedown', function(e){
        if (e.target === this) hideAddReportModal();
    });
}

function resetAddReportForm() {
    document.getElementById('addTitle').value = "";
    document.getElementById('addType').value = "";
    document.getElementById('addDate').value = "";
    document.getElementById('addTime').value = "";
    document.getElementById('addAmount').value = "";
    document.getElementById('addDesc').value = "";
    document.getElementById('addNote').value = "";
}

function hideAddReportModal() {
    document.getElementById('addReportModal').style.display = 'none';
}

// ========== TOAST THÔNG BÁO ==========
function showToast(message = 'Thành công!', timeout = 3000) {
    const old = document.getElementById('fin-toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'fin-toast';
    toast.id = 'fin-toast';
    toast.innerHTML = `
        <span class="fin-toast-icon"><i class="fas fa-check-circle"></i></span>
        <span class="fin-toast-message">${message}</span>
        <button class="fin-toast-close" onclick="this.parentNode.remove()">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, timeout);
}

function handleAddReport() {
    const title = document.getElementById('addTitle').value.trim();
    const type = document.getElementById('addType').value;
    const date = document.getElementById('addDate').value;
    const time = document.getElementById('addTime').value;
    const amount = document.getElementById('addAmount').value;
    const desc = document.getElementById('addDesc').value.trim();
    const note = document.getElementById('addNote').value.trim();

    if (!title || !type || !date || !time || !amount) {
        alert("Vui lòng nhập đầy đủ các trường bắt buộc!");
        return;
    }
    const newReport = {
        stt: financialReports.length + 1,
        title: title,
        type: `Loại ${type}`,
        amount: amount,
        time: time,
        date: date,
        desc: desc,
        note: note
    };
    financialReports.push(newReport);
    filteredReports = financialReports.slice();
    totalReports = filteredReports.length;
    currentPage = Math.ceil(totalReports / PAGE_SIZE);

    renderFinancialTable();
    renderPagination();
    hideAddReportModal();

    // Thông báo thêm thành công
    showToast('Thêm báo cáo tài chính thành công!');
}

// ========== MODAL XEM CHI TIẾT ==========
function setupViewModal() {
    document.getElementById('closeViewReportModal').addEventListener('click', hideViewReportModal);
    document.getElementById('viewReportModal').addEventListener('mousedown', function(e){
        if (e.target === this) hideViewReportModal();
    });
}

function openViewReportModal(index) {
    let report = filteredReports[index];
    if (!report) return;
    document.getElementById('viewTitle').value = report.title || "";
    document.getElementById('viewType').value = report.type || "";
    document.getElementById('viewDate').value = report.date ? formatDate(report.date) : "";
    document.getElementById('viewTime').value = report.time || "";
    document.getElementById('viewAmount').value = formatMoney(report.amount) || "";
    document.getElementById('viewDesc').value = report.desc || "";
    document.getElementById('viewNote').value = report.note || "";
    document.getElementById('viewReportModal').style.display = 'flex';
}
function hideViewReportModal() {
    document.getElementById('viewReportModal').style.display = 'none';
}

// ========== MODAL SỬA ==========
function setupEditModal() {
    document.getElementById('closeEditReportModal').addEventListener('click', hideEditReportModal);
    document.getElementById('cancelEditReportBtn').addEventListener('click', hideEditReportModal);
    document.getElementById('editReportForm').addEventListener('submit', function(e){
        e.preventDefault();
        handleEditReport();
    });
    document.getElementById('editReportModal').addEventListener('mousedown', function(e){
        if (e.target === this) hideEditReportModal();
    });
}

function openEditReportModal(index) {
    let report = filteredReports[index];
    if (!report) return;
    currentEditIndex = findOriginalIndex(report); // Tìm vị trí gốc trong mảng tài chính
    document.getElementById('editTitle').value = report.title || "";
    document.getElementById('editType').value = report.type ? report.type.replace("Loại ", "") : "";
    document.getElementById('editDate').value = report.date || "";
    document.getElementById('editTime').value = report.time || "";
    document.getElementById('editAmount').value = report.amount || "";
    document.getElementById('editDesc').value = report.desc || "";
    document.getElementById('editNote').value = report.note || "";
    document.getElementById('editReportModal').style.display = 'flex';
    setTimeout(() => document.getElementById('editTitle').focus(), 150);
}

function hideEditReportModal() {
    document.getElementById('editReportModal').style.display = 'none';
}

function handleEditReport() {
    if (currentEditIndex === null) return;
    const title = document.getElementById('editTitle').value.trim();
    const type = document.getElementById('editType').value;
    const date = document.getElementById('editDate').value;
    const time = document.getElementById('editTime').value;
    const amount = document.getElementById('editAmount').value;
    const desc = document.getElementById('editDesc').value.trim();
    const note = document.getElementById('editNote').value.trim();

    if (!title || !type || !date || !time || !amount) {
        alert("Vui lòng nhập đầy đủ các trường bắt buộc!");
        return;
    }
    financialReports[currentEditIndex] = {
        stt: currentEditIndex + 1,
        title: title,
        type: `Loại ${type}`,
        amount: amount,
        time: time,
        date: date,
        desc: desc,
        note: note
    };
    filteredReports = financialReports.slice();
    totalReports = filteredReports.length;
    renderFinancialTable();
    hideEditReportModal();

    // Thông báo cập nhật thành công
    showToast('Cập nhật báo cáo tài chính thành công!');
}

// Tìm vị trí báo cáo trong mảng gốc
function findOriginalIndex(report) {
    return financialReports.findIndex(r =>
        r.title === report.title &&
        r.type === report.type &&
        r.amount === report.amount &&
        r.time === report.time &&
        r.date === report.date &&
        r.desc === report.desc &&
        r.note === report.note
    );
}

// ========== MODAL XUẤT BÁO CÁO ==========
function setupExportReportModal() {
    document.getElementById('exportBtn').addEventListener('click', function () {
        // Mặc định xuất báo cáo đầu tiên, có thể sửa logic để xuất theo báo cáo đang chọn
        currentExportReportIndex = 0;
        showExportReportModal(financialReports[currentExportReportIndex]);
    });

    document.getElementById('closeExportReportModal').addEventListener('click', hideExportReportModal);
    document.getElementById('cancelExportReportBtn').addEventListener('click', hideExportReportModal);
    document.getElementById('exportReportModal').addEventListener('mousedown', function(e){
        if (e.target === this) hideExportReportModal();
    });
    document.getElementById('exportReportForm').addEventListener('submit', function(e){
        e.preventDefault();
        printCurrentReport();
        hideExportReportModal();
    });
}

// Mở modal xuất từ danh sách (bấm vào icon xuất từng báo cáo)
function openExportReportModal(index) {
    currentExportReportIndex = index;
    showExportReportModal(filteredReports[index]);
}

function showExportReportModal(report) {
    if (!report) return;
    document.getElementById('exportTitle').value = report.title || "";
    document.getElementById('exportType').value = report.type || "";
    document.getElementById('exportDate').value = report.date ? formatDate(report.date) : "";
    document.getElementById('exportTime').value = report.time || "";
    document.getElementById('exportAmount').value = formatMoney(report.amount) || "";
    document.getElementById('exportDesc').value = report.desc || "";
    document.getElementById('exportNote').value = report.note || "";
    document.getElementById('exportReportModal').style.display = 'flex';
}

function hideExportReportModal() {
    document.getElementById('exportReportModal').style.display = 'none';
}

function printCurrentReport() {
    // Chuẩn bị nội dung in từ báo cáo đang xuất
    const report = filteredReports[currentExportReportIndex];
    if (!report) return;
    const html = `
      <div style="font-family: Arial; padding:32px;">
        <h2 style="color:#152259;">BÁO CÁO TÀI CHÍNH</h2>
        <table style="width:100%;font-size:16px;margin-bottom:24px;">
          <tr><td><b>Tiêu đề:</b></td><td>${report.title || ""}</td></tr>
          <tr><td><b>Loại giao dịch:</b></td><td>${report.type || ""}</td></tr>
          <tr><td><b>Ngày thực hiện:</b></td><td>${report.date ? formatDate(report.date) : ""}</td></tr>
          <tr><td><b>Giờ giao dịch:</b></td><td>${report.time || ""}</td></tr>
          <tr><td><b>Số tiền:</b></td><td>${formatMoney(report.amount) || ""}</td></tr>
          <tr><td><b>Mô tả chi tiết:</b></td><td>${report.desc || ""}</td></tr>
          <tr><td><b>Ghi chú:</b></td><td>${report.note || ""}</td></tr>
        </table>
      </div>
    `;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    setTimeout(() => w.close(), 500);
}

// ========== FORMAT ==========
function formatMoney(money) {
    if (!money) return "";
    money = money.toString().replace(/\D/g, "");
    return money.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
}
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}