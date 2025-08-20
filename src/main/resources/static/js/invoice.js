// ================== DỮ LIỆU GIẢ MẪU ==================
let currentPage = 1;
let itemsPerPage = 5;
let allInvoices = [
    {
        id: "1",
        code: "Hóa đơn 1",
        apartment: "A - 1205",
        amount: "1.850.000",
        due: "2025-08-31",
        status: "Đã thanh toán"
    },
    {
        id: "2",
        code: "Hóa đơn 2",
        apartment: "B - 0823",
        amount: "1.870.000",
        due: "2025-08-31",
        status: "Chưa thanh toán"
    },
    {
        id: "3",
        code: "Hóa đơn 3",
        apartment: "C - 1402",
        amount: "2.000.000",
        due: "2025-07-31",
        status: "Quá hạn"
    }
];
let filteredInvoices = [...allInvoices];

const serviceFees = [
    {
        type: "Phí quản lý",
        desc: "Phí duy trì hoạt động chung cư",
        price: "15.000đ",
        note: "+ VAT 10%",
        unit: "m²/tháng"
    },
    {
        type: "Phí dịch vụ",
        desc: "Vệ sinh, an ninh, tiện ích",
        price: "8.500đ",
        note: "+ VAT 10%",
        unit: "m²/tháng"
    },
    {
        type: "Phí đậu xe",
        desc: "Ô tô, xe máy, xe đạp",
        price: "500.000đ",
        note: "Ô tô/Tháng",
        unit: "vị trí/tháng"
    },
    {
        type: "Điện nước chung",
        desc: "Khu vực chung, thang máy",
        price: "3.500đ",
        note: "Theo EVN",
        unit: "kWh"
    }
];

// ================== KHỞI TẠO ==================
document.addEventListener('DOMContentLoaded', function () {
    renderServiceFees();
    renderInvoiceTable();
    renderInvoicePagination();
    setupInvoiceEventListeners();
    setupAddInvoiceModal();
    setupEditInvoiceModal();
    setupViewInvoiceModal();
    setupPrintInvoiceModal();
});

// ================== BẢNG PHÍ DỊCH VỤ ==================
function renderServiceFees() {
    const tbody = document.getElementById('serviceFeeTableBody');
    tbody.innerHTML = serviceFees.map(fee => `
        <tr>
            <td>
                <div class="fee-type">${fee.type}</div>
                <div class="fee-desc">${fee.desc}</div>
            </td>
            <td>${fee.price} <span class="fee-note">${fee.note}</span></td>
            <td>${fee.unit}</td>
            <td><button class="action-btn" title="Chỉnh sửa"><i class="fas fa-pen"></i></button></td>
        </tr>
    `).join('');
}

// ================== BẢNG DANH SÁCH HÓA ĐƠN ==================
function renderInvoiceTable() {
    const tbody = document.getElementById('invoiceTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

    tbody.innerHTML = currentInvoices.map(inv => {
        let actions = `
            <button class="action-btn" title="Xem chi tiết" onclick="viewInvoiceDetail('${inv.id}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn" title="Chỉnh sửa" onclick="openEditInvoiceModal('${inv.id}')">
                <i class="fas fa-pen"></i>
            </button>
            <button class="action-btn" title="In hóa đơn" onclick="openPrintInvoiceModal('${inv.id}')">
                <i class="fas fa-print"></i>
            </button>
        `;
        return `
            <tr>
                <td>${inv.code}</td>
                <td>${inv.apartment}</td>
                <td>${formatMoney(inv.amount)}</td>
                <td>${formatDate(inv.due)}</td>
                <td>${inv.status}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>';

    updateRecordsInfo(startIndex + 1, Math.min(endIndex, filteredInvoices.length), filteredInvoices.length, "hóa đơn");
}

// ================== BUTTON HANDLERS ==================
function viewInvoiceDetail(id) {
    const invoice = allInvoices.find(inv => inv.id === id);
    if (!invoice) return showToastAlert('Không tìm thấy hóa đơn!', 'danger');
    document.getElementById('viewCode').value = invoice.code;
    document.getElementById('viewApartment').value = invoice.apartment;
    document.getElementById('viewAmount').value = formatMoney(invoice.amount);
    document.getElementById('viewDue').value = formatDate(invoice.due);
    document.getElementById('viewStatus').value = invoice.status;
    document.getElementById('viewInvoiceModal').style.display = 'flex';
}

function setupViewInvoiceModal() {
    document.getElementById('viewInvoiceModalClose').onclick = function() {
        document.getElementById('viewInvoiceModal').style.display = 'none';
    };
}

// ==== IN HÓA ĐƠN ====
function openPrintInvoiceModal(id) {
    const invoice = allInvoices.find(inv => inv.id === id);
    if (!invoice) return showToastAlert('Không tìm thấy hóa đơn!', 'danger');
    // Đổ dữ liệu vào các trường trong modal in hóa đơn
    document.getElementById('printCode').value = invoice.code || '';
    document.getElementById('printApartment').value = invoice.apartment || '';
    document.getElementById('printAmount').value = formatMoney(invoice.amount || '');
    document.getElementById('printDue').value = formatDate(invoice.due || '');
    document.getElementById('printStatus').value = invoice.status || '';
    document.getElementById('printInvoiceModal').style.display = 'flex';
    window._currentPrintInvoiceId = id;
}

function setupPrintInvoiceModal() {
    document.getElementById('printInvoiceModalClose').onclick = hidePrintInvoiceModal;
    document.getElementById('printInvoiceModalCancel').onclick = hidePrintInvoiceModal;
    document.getElementById('doPrintInvoiceBtn').onclick = doPrintInvoice;
}

function hidePrintInvoiceModal() {
    document.getElementById('printInvoiceModal').style.display = 'none';
}

function doPrintInvoice() {
    // Lấy dữ liệu từ form modal in hóa đơn
    const code = document.getElementById('printCode').value;
    const apartment = document.getElementById('printApartment').value;
    const amount = document.getElementById('printAmount').value;
    const due = document.getElementById('printDue').value;
    const status = document.getElementById('printStatus').value;

    // Tạo HTML hóa đơn để in (không in input/select, chỉ in dữ liệu)
    const printContent = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:40px auto;padding:32px 24px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.08);background:#fff;">
            <h2 style="color:#152259;margin-bottom:28px;text-align:center;">HÓA ĐƠN THANH TOÁN DỊCH VỤ</h2>
            <table style="width:100%;font-size:18px;">
                <tr>
                    <td style="padding:8px 16px;font-weight:500;color:#152259;">Mã hóa đơn</td>
                    <td style="padding:8px;">${code}</td>
                </tr>
                <tr>
                    <td style="padding:8px 16px;font-weight:500;color:#152259;">Căn hộ</td>
                    <td style="padding:8px;">${apartment}</td>
                </tr>
                <tr>
                    <td style="padding:8px 16px;font-weight:500;color:#152259;">Số tiền</td>
                    <td style="padding:8px;">${amount}</td>
                </tr>
                <tr>
                    <td style="padding:8px 16px;font-weight:500;color:#152259;">Hạn thanh toán</td>
                    <td style="padding:8px;">${due}</td>
                </tr>
                <tr>
                    <td style="padding:8px 16px;font-weight:500;color:#152259;">Trạng thái</td>
                    <td style="padding:8px;">${status}</td>
                </tr>
            </table>
        </div>
    `;

    // Mở cửa sổ in
    const printWindow = window.open('', '', 'height=700,width=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>In hóa đơn</title>
            <style>
                body { background: #fff !important; margin:0; }
                @media print {
                    body { background: #fff !important; margin:0; }
                }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 500); // Tự động đóng sau khi in
}

// ================== FORMAT & UTILS ==================
function formatMoney(money) {
    if (typeof money === 'string' && money.endsWith('đ')) return money;
    return money.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
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

function updateRecordsInfo(start, end, total, label) {
    const recordsInfo = document.getElementById('recordsInfo');
    if (recordsInfo) {
        recordsInfo.textContent = `Hiển thị ${start}-${end} trong tổng số ${total} ${label}`;
    }
}

// ================== PHÂN TRANG ==================
function renderInvoicePagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeInvoicePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeInvoicePage(${i})">${i}</a>
            </li>
        `;
    }
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeInvoicePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    container.innerHTML = paginationHTML;
}

function changeInvoicePage(page) {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderInvoiceTable();
    renderInvoicePagination();
}

// ================== FILTER ==================
function setupInvoiceEventListeners() {
    document.getElementById('searchInvoiceCode').addEventListener('keyup', function (e) {
        if (e.key === 'Enter') applyInvoiceFilters();
    });
    ['searchStatus', 'searchBuilding'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyInvoiceFilters);
    });
    document.getElementById('btnSearchInvoice').addEventListener('click', applyInvoiceFilters);
    document.getElementById('btnResetFilter').addEventListener('click', clearInvoiceFilters);
}

function applyInvoiceFilters() {
    const code = document.getElementById('searchInvoiceCode').value.trim().toLowerCase();
    const status = document.getElementById('searchStatus').value;
    const building = document.getElementById('searchBuilding').value;

    filteredInvoices = allInvoices.filter(inv => {
        const codeMatch = !code || inv.code.toLowerCase().includes(code);
        let statusMatch = !status || (
            (status === 'paid' && inv.status === 'Đã thanh toán') ||
            (status === 'unpaid' && inv.status === 'Chưa thanh toán') ||
            (status === 'overdue' && inv.status.toLowerCase().includes('quá hạn'))
        );
        const buildingMatch = !building || inv.apartment.startsWith(building);
        return codeMatch && statusMatch && buildingMatch;
    });

    currentPage = 1;
    renderInvoiceTable();
    renderInvoicePagination();
}

function clearInvoiceFilters() {
    document.getElementById('searchInvoiceCode').value = '';
    document.getElementById('searchStatus').value = '';
    document.getElementById('searchBuilding').value = '';
    filteredInvoices = [...allInvoices];
    currentPage = 1;
    renderInvoiceTable();
    renderInvoicePagination();
}

// ================== MODAL THÊM ==================
function setupAddInvoiceModal() {
    document.getElementById('saveInvoiceBtn').addEventListener('click', saveInvoice);
    document.getElementById('invoiceModal').addEventListener('show.bs.modal', function () {
        resetInvoiceForm();
        document.getElementById('invoiceModalLabel').textContent = 'Thêm hóa đơn';
        document.getElementById('saveInvoiceBtn').textContent = 'Thêm';
    });
}

function resetInvoiceForm() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceId').value = '';
}

function saveInvoice() {
    const code = document.getElementById('addCode').value.trim();
    const apartment = document.getElementById('addApartment').value.trim();
    const amount = document.getElementById('addAmount').value.trim();
    const due = document.getElementById('addDue').value;
    const status = document.getElementById('addStatus').value;

    if (!code || !apartment || !amount || !due || !status) {
        showToastAlert('Vui lòng nhập đầy đủ thông tin!', 'warning');
        return;
    }

    const newInvoice = {
        id: String(Date.now()),
        code,
        apartment,
        amount,
        due,
        status
    };
    allInvoices.unshift(newInvoice);
    filteredInvoices = [...allInvoices];
    currentPage = 1;
    renderInvoiceTable();
    renderInvoicePagination();
    showToastAlert('Thêm hóa đơn thành công!', 'success');
    const modal = bootstrap.Modal.getInstance(document.getElementById('invoiceModal'));
    if (modal) modal.hide();
}

// ================== MODAL SỬA ==================
function setupEditInvoiceModal() {
    document.getElementById('saveEditInvoiceBtn').onclick = saveEditInvoice;
    document.getElementById('editInvoiceModalClose').onclick = hideEditInvoiceModal;
    document.getElementById('editInvoiceModalCancel').onclick = hideEditInvoiceModal;
}

function openEditInvoiceModal(id) {
    const invoice = allInvoices.find(inv => inv.id === id);
    if (!invoice) return;

    document.getElementById('editInvoiceModalLabel').textContent = 'Sửa hóa đơn';
    document.getElementById('editInvoiceId').value = invoice.id;
    document.getElementById('editCode').value = invoice.code;
    document.getElementById('editApartment').value = invoice.apartment;
    document.getElementById('editAmount').value = invoice.amount;
    document.getElementById('editDue').value = invoice.due;
    document.getElementById('editStatus').value = invoice.status;

    document.getElementById('editInvoiceModal').style.display = 'flex';
}

function hideEditInvoiceModal() {
    document.getElementById('editInvoiceModal').style.display = 'none';
}

function saveEditInvoice() {
    const id = document.getElementById('editInvoiceId').value;
    const code = document.getElementById('editCode').value.trim();
    const apartment = document.getElementById('editApartment').value.trim();
    const amount = document.getElementById('editAmount').value.trim();
    const due = document.getElementById('editDue').value;
    const status = document.getElementById('editStatus').value;

    if (!code || !apartment || !amount || !due || !status) {
        showToastAlert('Vui lòng nhập đầy đủ thông tin!', 'warning');
        return;
    }

    const idx = allInvoices.findIndex(inv => inv.id === id);
    if (idx > -1) {
        allInvoices[idx] = {
            id,
            code,
            apartment,
            amount,
            due,
            status
        };
        filteredInvoices = [...allInvoices];
        renderInvoiceTable();
        renderInvoicePagination();
        showToastAlert('Cập nhật hóa đơn thành công!', 'success');
    }
    hideEditInvoiceModal();
}

// ================== TOAST ALERT GÓC PHẢI ==================
function showToastAlert(message, type) {
    let container = document.querySelector('.toast-alert-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-alert-container';
        document.body.appendChild(container);
    }
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} toast-alert d-flex align-items-center fade show`;
    alertDiv.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)} me-2"></i>
        <div class="flex-grow-1">${message}</div>
        <button type="button" class="btn-close ms-2" aria-label="Close"></button>
    `;
    container.appendChild(alertDiv);
    const closeBtn = alertDiv.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
        hideToastAlert(alertDiv);
    });
    setTimeout(() => hideToastAlert(alertDiv), 4000);
}

function hideToastAlert(alertDiv) {
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