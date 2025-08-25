// ================== DỮ LIỆU GIẢ ==================
const MAINTENANCE_DATA = [
    { id: "1", deviceName: "Thang máy", maintenanceDate: "26/08/2025", technician: "Kỹ thuật viên", status: "scheduled" },
    { id: "2", deviceName: "Camera", maintenanceDate: "26/08/2025", technician: "Kỹ thuật viên", status: "inprogress" },
    { id: "3", deviceName: "Máy bơm nước", maintenanceDate: "26/08/2025", technician: "Kỹ thuật viên", status: "done" },
    { id: "4", deviceName: "Hệ thống barrier", maintenanceDate: "26/08/2025", technician: "Kỹ thuật viên", status: "cancelled" }
];

// ================== CONSTANT CHO DROPDOWN ==================
// Bây giờ chỉ còn 1 lựa chọn duy nhất là "Kỹ thuật viên"
const TECHNICIANS = [
    "Kỹ thuật viên"
];
const STATUS_OPTIONS = [
    { value: "scheduled", display: "Đã lên lịch" },
    { value: "inprogress", display: "Đang thực hiện" },
    { value: "done", display: "Hoàn thành" },
    { value: "cancelled", display: "Đã hủy" }
];

// ================== BIẾN PHÂN TRANG ==================
let currentPage = 1;
const itemsPerPage = 5;
let filteredMaintenance = [...MAINTENANCE_DATA];

// ================== BIẾN EDIT ==================
let editingMaintenanceId = null;

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    renderPagination();
    setupEventListeners();
    renderAddModalSelectOptions();
    setupAddModalEvents();
    renderEditModalSelectOptions();
    setupEditModalEvents();
});

// ================== HIỂN THỊ BẢNG ==================
function renderTable() {
    const tbody = document.getElementById('maintenanceTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRows = filteredMaintenance.slice(startIndex, endIndex);

    tbody.innerHTML = currentRows.map((row, idx) => `
        <tr>
            <td class="text-center">${startIndex + idx + 1}</td>
            <td class="text-center">${row.deviceName}</td>
            <td class="text-center">${row.maintenanceDate}</td>
            <td class="text-center">${row.technician}</td>
            <td class="text-center">${getStatusDisplay(row.status)}</td>
            <td class="text-center">
                <button class="btn action-btn btn-edit" title="Chỉnh sửa" onclick="editMaintenance('${row.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join("") || `<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>`;

    updateRecordsInfo(startIndex + 1, Math.min(endIndex, filteredMaintenance.length), filteredMaintenance.length);
}

// ================== STATUS ==================
function getStatusDisplay(status) {
    const found = STATUS_OPTIONS.find(opt => opt.value === status);
    return found ? found.display : status;
}

// ================== PHÂN TRANG ==================
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredMaintenance.length / itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></a>
    </li>`;

    for (let i = 1; i <= totalPages && i <= 3; i++) {
        html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
    }
    if (totalPages > 3) {
        html += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>
        <li class="page-item ${currentPage === totalPages ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>
        </li>`;
    }

    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></a>
    </li>`;

    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredMaintenance.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
    renderPagination();
}

// ================== FILTER ==================
function setupEventListeners() {
    document.getElementById('btnSearch').addEventListener('click', applyFilters);
    document.getElementById('btnClearFilter').addEventListener('click', clearFilters);

    document.getElementById('searchDeviceCode').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    document.getElementById('searchStatus').addEventListener('change', applyFilters);

    // Thêm mới
    document.getElementById('btnAddMaintenance').addEventListener('click', function() {
        resetAddModalForm();
        const modal = new bootstrap.Modal(document.getElementById('addMaintenanceModal'));
        modal.show();
    });
}

// ================== FILTER HÀM ==================
function applyFilters() {
    const code = document.getElementById('searchDeviceCode').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;

    filteredMaintenance = MAINTENANCE_DATA.filter(item => {
        const codeMatch = !code || item.deviceName.toLowerCase().includes(code);
        const statusMatch = !status || item.status === status;
        return codeMatch && statusMatch;
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

function clearFilters() {
    document.getElementById('searchDeviceCode').value = '';
    document.getElementById('searchStatus').value = '';
    filteredMaintenance = [...MAINTENANCE_DATA];
    currentPage = 1;
    renderTable();
    renderPagination();
}

// ================== THÊM MỚI ==================
function renderAddModalSelectOptions() {
    const techSelect = document.getElementById('addTechnician');
    if (techSelect) {
        // Bổ sung option mặc định "Chọn người bảo trì" + chỉ 1 lựa chọn "Kỹ thuật viên"
        techSelect.innerHTML = `<option value="">Chọn người bảo trì</option>` +
            TECHNICIANS.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    const statusSelect = document.getElementById('addStatus');
    if (statusSelect) {
        statusSelect.innerHTML = STATUS_OPTIONS.map(opt => `<option value="${opt.value}">${opt.display}</option>`).join('');
    }
}

function resetAddModalForm() {
    document.getElementById('addDeviceName').value = '';
    document.getElementById('addMaintenanceDate').value = '';
    document.getElementById('addTechnician').selectedIndex = 0; // Mặc định là "Chọn người bảo trì"
    document.getElementById('addStatus').selectedIndex = 0;
}

function setupAddModalEvents() {
    const form = document.getElementById('addMaintenanceForm');
    if (!form) return;
    form.onsubmit = function(e) {
        e.preventDefault();
        const deviceName = document.getElementById('addDeviceName').value.trim();
        const maintenanceDateRaw = document.getElementById('addMaintenanceDate').value;
        const technician = document.getElementById('addTechnician').value;
        const status = document.getElementById('addStatus').value;

        if (!deviceName || !maintenanceDateRaw || !technician || !status) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        const maintenanceDate = formatDateDMY(maintenanceDateRaw);

        const newId = (MAINTENANCE_DATA.length + 1).toString();
        const newEntry = {
            id: newId,
            deviceName,
            maintenanceDate,
            technician,
            status
        };
        MAINTENANCE_DATA.push(newEntry);
        filteredMaintenance = [...MAINTENANCE_DATA];
        currentPage = 1;
        renderTable();
        renderPagination();

        const modalEl = document.getElementById('addMaintenanceModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
    };
}

// ================== SỬA LỊCH BẢO TRÌ ==================
function renderEditModalSelectOptions() {
    const techSelect = document.getElementById('editTechnician');
    if (techSelect) {
        // Đảm bảo khi sửa cũng chỉ có "Kỹ thuật viên" (không cần option "Chọn người bảo trì" vì luôn có giá trị)
        techSelect.innerHTML =
            TECHNICIANS.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    const statusSelect = document.getElementById('editStatus');
    if (statusSelect) {
        statusSelect.innerHTML = STATUS_OPTIONS.map(opt => `<option value="${opt.value}">${opt.display}</option>`).join('');
    }
}

function resetEditModalForm() {
    document.getElementById('editDeviceName').value = '';
    document.getElementById('editMaintenanceDate').value = '';
    document.getElementById('editTechnician').selectedIndex = 0;
    document.getElementById('editStatus').selectedIndex = 0;
}

function editMaintenance(id) {
    editingMaintenanceId = id;
    renderEditModalSelectOptions();

    const data = MAINTENANCE_DATA.find(m => m.id === id);
    if (!data) {
        alert("Không tìm thấy lịch bảo trì!");
        return;
    }
    document.getElementById('editDeviceName').value = data.deviceName;
    document.getElementById('editDeviceName').readOnly = true;
    document.getElementById('editMaintenanceDate').value = formatDateYMD(data.maintenanceDate);
    document.getElementById('editTechnician').value = data.technician;
    document.getElementById('editStatus').value = data.status;

    const modal = new bootstrap.Modal(document.getElementById('editMaintenanceModal'));
    modal.show();
}

function setupEditModalEvents() {
    const editForm = document.getElementById('editMaintenanceForm');
    if (!editForm) return;
    editForm.onsubmit = function(e) {
        e.preventDefault();
        const deviceName = document.getElementById('editDeviceName').value.trim();
        const maintenanceDateRaw = document.getElementById('editMaintenanceDate').value;
        const technician = document.getElementById('editTechnician').value;
        const status = document.getElementById('editStatus').value;

        if (!deviceName || !maintenanceDateRaw || !technician || !status) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        const maintenanceDate = formatDateDMY(maintenanceDateRaw);

        const idx = MAINTENANCE_DATA.findIndex(m => m.id === editingMaintenanceId);
        if (idx !== -1) {
            MAINTENANCE_DATA[idx] = {
                ...MAINTENANCE_DATA[idx],
                deviceName,
                maintenanceDate,
                technician,
                status
            };
            filteredMaintenance = [...MAINTENANCE_DATA];
            renderTable();
            renderPagination();
        } else {
            alert('Không tìm thấy lịch bảo trì để sửa!');
        }

        const modalEl = document.getElementById('editMaintenanceModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
    };
}

// ================== FORMAT DATE ==================
// Chuyển yyyy-mm-dd => dd/mm/yyyy
function formatDateDMY(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

// Chuyển dd/mm/yyyy -> yyyy-mm-dd
function formatDateYMD(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
}

// ================== RECORDS INFO ==================
function updateRecordsInfo(start, end, total) {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        recordsInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${total} thiết bị`;
    }
}