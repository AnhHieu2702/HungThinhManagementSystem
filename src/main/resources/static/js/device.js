// ================== CẤU HÌNH API ==================
const DEVICE_API_BASE_URL = 'http://localhost:8080';
const DEVICE_API_ENDPOINTS = {
    devices: `${DEVICE_API_BASE_URL}/api/admin-technician/devices`,
    devicesByStatus: (status) => `${DEVICE_API_BASE_URL}/api/admin-technician/devices/status/${status}`,
    addDevice: `${DEVICE_API_BASE_URL}/api/admin/devices`, // POST
    updateDevice: (deviceCode) => `${DEVICE_API_BASE_URL}/api/admin/devices/${deviceCode}`, // PUT
    deleteDevice: (deviceCode) => `${DEVICE_API_BASE_URL}/api/admin/devices/${deviceCode}` // DELETE
};

// ================== XÁC THỰC ==================
function getDeviceAuthToken() {
    return localStorage.getItem('accessToken');
}
function getDeviceAuthHeaders() {
    const token = getDeviceAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ================== BIẾN TOÀN CỤC ==================
let deviceCurrentPage = 1;
let deviceItemsPerPage = 5;
let deviceTotal = 0;
let allDevices = [];
let filteredDevices = [];
let deviceLocations = [];
const deviceStatusOptions = [
    { value: 'ACTIVE', display: 'Hoạt động' },
    { value: 'INACTIVE', display: 'Không hoạt động' },
    { value: 'UNDER_MAINTENANCE', display: 'Đang bảo trì' },
    { value: 'BROKEN', display: 'Hỏng' }
];

// Xóa thiết bị
let deviceCodeToDelete = null;

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', function() {
    loadDevices();
    setupDeviceEventListeners();
    setupAddDeviceModal();
    setupEditDeviceModal();
    setupDeleteDeviceModal();
});

// ================== SỰ KIỆN FILTER ==================
function setupDeviceEventListeners() {
    document.getElementById('searchDeviceCode')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') applyDeviceFilters();
    });
    document.getElementById('searchLocation')?.addEventListener('change', applyDeviceFilters);
    document.getElementById('searchStatus')?.addEventListener('change', applyDeviceFilters);
}

// ================== SỰ KIỆN MODAL THÊM MỚI ==================
function setupAddDeviceModal() {
    document.getElementById('btnAddDevice')?.addEventListener('click', function() {
        document.getElementById('addDeviceForm').reset();
        const modal = new bootstrap.Modal(document.getElementById('addDeviceModal'));
        modal.show();
    });

    document.getElementById('addDeviceForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const deviceCode = document.getElementById('addDeviceCode').value.trim();
        const deviceName = document.getElementById('addDeviceName').value.trim();
        const location = document.getElementById('addDeviceLocation').value.trim();
        const installationDate = document.getElementById('addInstallationDate').value;

        if (!deviceCode || !deviceName || !location || !installationDate) {
            showDeviceAlert('Vui lòng nhập đầy đủ thông tin!', 'danger');
            return;
        }

        // THÊM MỚI LUÔN MẶC ĐỊNH STATUS LÀ "ACTIVE"
        const payload = {
            deviceCode,
            deviceName,
            location,
            installationDate,
            status: "ACTIVE",
            deviceType: "UNKNOWN",
            warrantyExpiry: installationDate,
            maintenanceCycleDays: 0,
            lastMaintenanceDate: installationDate
        };

        showDeviceLoading(true);
        try {
            const response = await fetch(DEVICE_API_ENDPOINTS.addDevice, {
                method: 'POST',
                headers: getDeviceAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                let errorMsg = 'Không thể thêm thiết bị';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.userMessage || errorMsg;
                } catch (e) {}
                throw new Error(errorMsg);
            }
            const result = await response.json();
            if (result.status) {
                showDeviceAlert('Thêm thiết bị thành công!', 'success');
            } else {
                showDeviceAlert(result.userMessage || 'Có lỗi khi thêm thiết bị', 'danger');
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById('addDeviceModal'));
            modal.hide();
            await loadDevices();
        } catch (error) {
            showDeviceAlert('Thêm thiết bị thất bại! ' + error.message, 'danger');
            console.error('Error:', error);
        } finally {
            showDeviceLoading(false);
        }
    });
}

// ================== SỰ KIỆN MODAL SỬA ==================
function setupEditDeviceModal() {
    document.getElementById('editDeviceForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const deviceCode = document.getElementById('editDeviceCode').value.trim();
        const deviceName = document.getElementById('editDeviceName').value.trim();
        const location = document.getElementById('editDeviceLocation').value.trim();
        const installationDate = document.getElementById('editInstallationDate').value;
        const status = document.getElementById('editDeviceStatus').value;

        if (!deviceCode || !deviceName || !location || !installationDate || !status) {
            showDeviceAlert('Vui lòng nhập đầy đủ thông tin!', 'danger');
            return;
        }

        const payload = {
            deviceName,
            location,
            deviceType: "UNKNOWN",
            warrantyExpiry: installationDate,
            maintenanceCycleDays: 0,
            lastMaintenanceDate: installationDate,
            status
        };

        showDeviceLoading(true);
        try {
            const response = await fetch(DEVICE_API_ENDPOINTS.updateDevice(deviceCode), {
                method: 'PUT',
                headers: getDeviceAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                let errorMsg = 'Không thể cập nhật thiết bị';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.userMessage || errorMsg;
                } catch (e) {}
                throw new Error(errorMsg);
            }
            const result = await response.json();
            if (result.status) {
                showDeviceAlert('Cập nhật thiết bị thành công!', 'success');
            } else {
                showDeviceAlert(result.userMessage || 'Có lỗi khi cập nhật thiết bị', 'danger');
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById('editDeviceModal'));
            modal.hide();
            await loadDevices();
        } catch (error) {
            showDeviceAlert('Cập nhật thiết bị thất bại! ' + error.message, 'danger');
            console.error('Error:', error);
        } finally {
            showDeviceLoading(false);
        }
    });
}

// ================== SỰ KIỆN MODAL XÓA ==================
function setupDeleteDeviceModal() {
    const btnDelete = document.getElementById('btnConfirmDeleteDevice');
    if (btnDelete) {
        btnDelete.addEventListener('click', async function() {
            if (!deviceCodeToDelete) return;
            showDeviceLoading(true);
            try {
                const response = await fetch(DEVICE_API_ENDPOINTS.deleteDevice(deviceCodeToDelete), {
                    method: 'DELETE',
                    headers: getDeviceAuthHeaders()
                });
                if (!response.ok) {
                    let errorMsg = 'Xóa thiết bị thất bại!';
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.userMessage || errorMsg;
                    } catch (e) {}
                    throw new Error(errorMsg);
                }
                const result = await response.json();
                if (result.status) {
                    showDeviceAlert('Xóa thiết bị thành công!', 'success');
                } else {
                    showDeviceAlert(result.userMessage || 'Có lỗi khi xóa thiết bị', 'danger');
                }
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteDeviceModal'));
                modal.hide();
                deviceCodeToDelete = null;
                await loadDevices();
            } catch (error) {
                showDeviceAlert('Xóa thiết bị thất bại! ' + error.message, 'danger');
                console.error(error);
            } finally {
                showDeviceLoading(false);
                deviceCodeToDelete = null;
            }
        });
    }
}

// ================== MỞ MODAL SỬA VÀ ĐỔ DỮ LIỆU ==================
function editDevice(deviceCode) {
    const device = allDevices.find(d => d.deviceCode === deviceCode);
    if (!device) {
        showDeviceAlert('Không tìm thấy thiết bị cần sửa!', 'danger');
        return;
    }
    document.getElementById('editDeviceCode').value = device.deviceCode || '';
    document.getElementById('editDeviceName').value = device.deviceName || '';
    document.getElementById('editDeviceLocation').value = device.location || '';
    document.getElementById('editInstallationDate').value = formatDeviceDateInput(device.installationDate);

    // Đảm bảo trạng thái là enum
    const statusSelect = document.getElementById('editDeviceStatus');
    const validValues = ["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE", "BROKEN"];
    let statusValue = device.status;
    // Nếu nhận được display tiếng Việt, convert sang enum
    if (!validValues.includes(statusValue)) {
        statusValue = deviceStatusOptions.find(opt => opt.display === statusValue)?.value || "ACTIVE";
    }
    statusSelect.value = validValues.includes(statusValue) ? statusValue : "ACTIVE";

    const modal = new bootstrap.Modal(document.getElementById('editDeviceModal'));
    modal.show();
}

// ================== MỞ MODAL XÓA VÀ LƯU DEVICE CODE ==================
function deleteDevice(deviceCode) {
    deviceCodeToDelete = deviceCode;
    const modal = new bootstrap.Modal(document.getElementById('deleteDeviceModal'));
    modal.show();
}

function formatDeviceDateInput(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

// ================== LOAD DANH SÁCH THIẾT BỊ ==================
async function loadDevices() {
    showDeviceLoading(true);
    try {
        const response = await fetch(DEVICE_API_ENDPOINTS.devices, {
            headers: getDeviceAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();

        let deviceList = [];
        if (Array.isArray(result)) {
            deviceList = result;
        } else if (result && Array.isArray(result.data)) {
            deviceList = result.data;
        } else if (result && result.devices && Array.isArray(result.devices)) {
            deviceList = result.devices;
        }

        allDevices = deviceList.map(device => ({
            id: device.id,
            deviceCode: device.deviceCode,
            deviceName: device.deviceName,
            location: device.location,
            installationDate: device.installationDate,
            status: device.status // status phải là enum: "ACTIVE", "BROKEN",...
        }));

        deviceLocations = [...new Set(allDevices.map(device => device.location))].filter(Boolean);
        renderDeviceLocationOptions();
        filteredDevices = [...allDevices];
        deviceTotal = allDevices.length;
        renderDeviceTable();
        renderDevicePagination();
    } catch (error) {
        showDeviceAlert('Không thể tải danh sách thiết bị', 'danger');
        console.error('Error:', error);
    } finally {
        showDeviceLoading(false);
    }
}

// ================== RENDER LOCATION OPTIONS ==================
function renderDeviceLocationOptions() {
    const locationSelect = document.getElementById('searchLocation');
    if (!locationSelect) return;
    locationSelect.innerHTML = `<option value="">Tất cả vị trí</option>` +
        deviceLocations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
}

// ================== BẢNG ==================
function renderDeviceTable() {
    const tbody = document.getElementById('deviceTableBody');
    if (!tbody) return;
    const startIndex = (deviceCurrentPage - 1) * deviceItemsPerPage;
    const endIndex = startIndex + deviceItemsPerPage;
    const currentDevices = filteredDevices.slice(startIndex, endIndex);

    tbody.innerHTML = currentDevices.map((device, idx) => {
        return `
        <tr>
            <td class="text-center">${startIndex + idx + 1}</td>
            <td class="text-center">${device.deviceCode || ''}</td>
            <td class="text-center">${device.deviceName || ''}</td>
            <td class="text-center">${device.location || ''}</td>
            <td class="text-center">${formatDeviceDate(device.installationDate)}</td>
            <td class="text-center">
                <span class="device-status ${getDeviceStatusCss(device.status)}">${getDeviceStatusDisplay(device.status)}</span>
            </td>
            <td class="text-center">
                <div class="device-action-buttons">
                    <button class="btn device-action-btn btn-edit" title="Chỉnh sửa" onclick="editDevice('${device.deviceCode}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn device-action-btn btn-delete" title="Xóa" onclick="deleteDevice('${device.deviceCode}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('') || `<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>`;

    updateDeviceRecordsInfo(startIndex + 1, Math.min(endIndex, filteredDevices.length), filteredDevices.length);
}

// ================== Helper cho status ==================
function getDeviceStatusDisplay(value) {
    if (!value || typeof value !== 'string') return 'Không xác định';
    const found = deviceStatusOptions.find(opt => opt.value === value);
    if (found) return found.display;
    // Nếu value là tiếng Việt, trả luôn
    const foundVN = deviceStatusOptions.find(opt => opt.display === value);
    if (foundVN) return foundVN.display;
    return value;
}
function getDeviceStatusCss(value) {
    switch (value) {
        case 'ACTIVE': return 'device-status-active';
        case 'INACTIVE': return 'device-status-inactive';
        case 'UNDER_MAINTENANCE': return 'device-status-maintaining';
        case 'BROKEN': return 'device-status-broken';
        default: return '';
    }
}
function formatDeviceDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

// ================== PHÂN TRANG ==================
function renderDevicePagination() {
    const container = document.getElementById('devicePaginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(filteredDevices.length / deviceItemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <li class="page-item ${deviceCurrentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeDevicePage(${deviceCurrentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    for (let i = 1; i <= totalPages; i++) {
        if (i === deviceCurrentPage) {
            paginationHTML += `
                <li class="page-item active"><a class="page-link" href="#">${i}</a></li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item"><a class="page-link" href="#" onclick="changeDevicePage(${i})">${i}</a></li>
            `;
        }
    }
    paginationHTML += `
        <li class="page-item ${deviceCurrentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeDevicePage(${deviceCurrentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    container.innerHTML = paginationHTML;
}
function changeDevicePage(page) {
    const totalPages = Math.ceil(filteredDevices.length / deviceItemsPerPage);
    if (page < 1 || page > totalPages) return;
    deviceCurrentPage = page;
    renderDeviceTable();
    renderDevicePagination();
}

// ================== LỌC DỮ LIỆU ==================
function applyDeviceFilters() {
    const code = document.getElementById('searchDeviceCode')?.value.toLowerCase();
    const location = document.getElementById('searchLocation')?.value;
    const status = document.getElementById('searchStatus')?.value;
    filteredDevices = allDevices.filter(device => {
        const codeMatch = !code || (device.deviceCode && device.deviceCode.toLowerCase().includes(code));
        const locationMatch = !location || device.location === location;

        // Đảm bảo status là enum để so sánh
        const validValues = ["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE", "BROKEN"];
        let deviceStatus = device.status;
        if (!validValues.includes(deviceStatus)) {
            deviceStatus = deviceStatusOptions.find(opt => opt.display === deviceStatus)?.value || deviceStatus;
        }
        const statusMatch = !status || deviceStatus === status;

        return codeMatch && locationMatch && statusMatch;
    });
    deviceCurrentPage = 1;
    renderDeviceTable();
    renderDevicePagination();
}
function clearDeviceFilters() {
    document.getElementById('searchDeviceCode').value = '';
    document.getElementById('searchLocation').value = '';
    document.getElementById('searchStatus').value = '';
    filteredDevices = [...allDevices];
    deviceCurrentPage = 1;
    renderDeviceTable();
    renderDevicePagination();
}

// ================== TIỆN ÍCH ==================
function showDeviceLoading(show) {
    const overlay = document.getElementById('deviceLoadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}
function showDeviceAlert(message, type) {
    // Alert dạng toast góc phải
    document.querySelectorAll('.device-toast-alert').forEach(e => e.remove());
    const toast = document.createElement('div');
    toast.className = 'device-toast-alert' + (type === 'danger' ? ' device-toast-danger' : '');
    toast.innerHTML = `
        <span class="device-toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        </span>
        <span>${message}</span>
        <button type="button" class="device-toast-close" title="Đóng">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
    toast.querySelector('.device-toast-close').onclick = () => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    };
}
function updateDeviceRecordsInfo(start, end, total) {
    const recordsInfo = document.getElementById('deviceRecordsInfo');
    if (recordsInfo) {
        recordsInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${total} thiết bị`;
    }
}