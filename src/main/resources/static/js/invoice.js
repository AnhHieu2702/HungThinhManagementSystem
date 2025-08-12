// Invoice Management System - Complete Implementation with Excel Export
const API_BASE_URL = 'http://localhost:8080/api/admin-accountant';

// Global variables
let serviceFees = [];
let invoices = [];
let filteredInvoices = [];
let currentInvoice = null;
let currentServiceFee = null;

// Status mapping for display
const statusMapping = {
    'PAID': 'Đã thanh toán',
    'PENDING': 'Chưa thanh toán',
    'OVERDUE': 'Quá hạn'
};

// Invoice type mapping
const typeMapping = {
    'MONTHLY': 'Hóa đơn tháng',
    'SERVICE': 'Phí dịch vụ',
    'PARKING': 'Phí đỗ xe'
};

// Alert function with better styling
function showAlert(message, type) {
    console.log(`[ALERT] ${type.toUpperCase()}: ${message}`);
    
    // Remove existing alerts
    document.querySelectorAll('.custom-alert').forEach(alert => {
        alert.remove();
    });

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible custom-alert`;
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" aria-label="Close"></button>
        </div>
    `;
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);

    // Show animation
    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateY(0)';
    }, 100);

    // Auto hide after 4 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);

    // Close button handler
    alertDiv.querySelector('.btn-close').addEventListener('click', () => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    });
}

// Create modals dynamically
function createModals() {
    if (document.getElementById('serviceFeeModal')) {
        console.log('Modals already exist');
        return;
    }

    const modalsHTML = `
        <!-- Service Fee Modal -->
        <div class="modal fade" id="serviceFeeModal" tabindex="-1" aria-labelledby="serviceFeeModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="serviceFeeModalTitle">Thêm phí dịch vụ</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="serviceFeeForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Loại phí *</label>
                                        <input type="text" class="form-control" id="serviceFeeType" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Đơn vị *</label>
                                        <input type="text" class="form-control" id="serviceFeeUnit" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Đơn giá (VNĐ) *</label>
                                        <input type="number" class="form-control" id="serviceFeePrice" required min="0">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">VAT (%)</label>
                                        <input type="number" class="form-control" id="serviceFeeVAT" min="0" max="100" value="10">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Mô tả</label>
                                <textarea class="form-control" id="serviceFeeDescription" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button type="button" class="btn btn-primary" id="saveServiceFeeBtn">Lưu</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Invoice Modal -->
        <div class="modal fade" id="invoiceModal" tabindex="-1" aria-labelledby="invoiceModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="invoiceModalTitle">Chi tiết hóa đơn</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <form id="invoiceForm">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Tiêu đề hóa đơn *</label>
                                                <input type="text" class="form-control" id="invoiceTitle" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Mã hóa đơn</label>
                                                <input type="text" class="form-control" id="invoiceCode" readonly>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Căn hộ *</label>
                                                <input type="text" class="form-control" id="invoiceApartment" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Tên cư dân</label>
                                                <input type="text" class="form-control" id="invoiceResident">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Loại hóa đơn *</label>
                                                <select class="form-select" id="invoiceType" required>
                                                    <option value="">Chọn loại</option>
                                                    <option value="MONTHLY">Hóa đơn tháng</option>
                                                    <option value="SERVICE">Phí dịch vụ</option>
                                                    <option value="PARKING">Phí đỗ xe</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Số tiền (VNĐ) *</label>
                                                <input type="number" class="form-control" id="invoiceAmount" required min="0">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="mb-3">
                                                <label class="form-label">Trạng thái *</label>
                                                <select class="form-select" id="invoiceStatus" required>
                                                    <option value="PENDING">Chưa thanh toán</option>
                                                    <option value="PAID">Đã thanh toán</option>
                                                    <option value="OVERDUE">Quá hạn</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Hạn thanh toán *</label>
                                                <input type="date" class="form-control" id="invoiceDueDate" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">Ngày thanh toán</label>
                                                <input type="date" class="form-control" id="invoicePaidDate">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Ghi chú</label>
                                        <textarea class="form-control" id="invoiceNotes" rows="3"></textarea>
                                    </div>
                                </form>
                            </div>
                            <div class="col-md-4">
                                <div class="invoice-info">
                                    <h6 class="mb-3">Thông tin bổ sung</h6>
                                    <div class="info-card">
                                        <div class="info-item">
                                            <span class="info-label">Ngày tạo:</span>
                                            <span class="info-value" id="invoiceCreatedAt">-</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Cập nhật lần cuối:</span>
                                            <span class="info-value" id="invoiceUpdatedAt">-</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Người tạo:</span>
                                            <span class="info-value" id="invoiceCreatedBy">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="saveInvoiceBtn">Lưu</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div id="loadingOverlay" class="loading-overlay" style="display: none;">
            <div class="text-center">
                <div class="spinner-border text-primary mb-2" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="text-white">Đang xử lý...</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalsHTML);
    console.log('✅ Modals created successfully');
}

// Wait for DOM elements
function waitForElements() {
    return new Promise((resolve) => {
        const checkElements = () => {
            const serviceFeeContainer = document.getElementById('serviceFeeTableBody');
            const invoiceContainer = document.getElementById('invoiceTableBody');
            const bootstrap = typeof window.bootstrap !== 'undefined';
            
            if (serviceFeeContainer && invoiceContainer && bootstrap) {
                console.log('✅ All required elements found');
                resolve();
            } else {
                console.log('⏳ Waiting for elements...');
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Invoice Management System Loading...');
    
    try {
        await waitForElements();
        createModals();
        setupEventListeners();
        loadSampleData();
        console.log('✅ System initialized successfully');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showAlert('Lỗi khởi tạo hệ thống!', 'danger');
    }
});

// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Button listeners
    const addServiceFeeBtn = document.getElementById('addServiceFeeBtn');
    const createInvoiceBtn = document.getElementById('createInvoiceBtn');
    const exportInvoicesBtn = document.getElementById('exportInvoicesBtn');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const applyBtn = document.getElementById('applyFiltersBtn');
    
    if (addServiceFeeBtn) addServiceFeeBtn.addEventListener('click', () => openServiceFeeModal('add'));
    if (createInvoiceBtn) createInvoiceBtn.addEventListener('click', () => openInvoiceModal('add'));
    if (exportInvoicesBtn) exportInvoicesBtn.addEventListener('click', exportInvoices);
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    
    // Filter inputs
    const filterElements = [
        'searchInput', 'statusFilter', 'buildingFilter', 'typeFilter'
    ];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        }
    });
    
    console.log('✅ Event listeners setup completed');
}

// Load sample data
function loadSampleData() {
    console.log('📡 Loading sample data...');
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        // Sample service fees
        serviceFees = [
            {
                id: 1,
                type: 'Phí quản lý',
                description: 'Phí quản lý hoạt động chung cư',
                price: 15000,
                unit: 'm²/tháng',
                vat: 10
            },
            {
                id: 2,
                type: 'Phí dịch vụ',
                description: 'Vệ sinh, an ninh, tiện ích',
                price: 8500,
                unit: 'm²/tháng',
                vat: 10
            },
            {
                id: 3,
                type: 'Phí đỗ xe',
                description: 'Ô tô, xe máy, xe đạp',
                price: 500000,
                unit: 'vị trí/tháng',
                vat: 0
            },
            {
                id: 4,
                type: 'Điện nước chung',
                description: 'Khu vực chung, thang máy',
                price: 3500,
                unit: 'kWh',
                vat: 0
            },
            {
                id: 5,
                type: 'Phí khác',
                description: 'Phí phát sinh, đặc biệt',
                price: 0,
                unit: 'lần/dịch vụ',
                vat: 0
            }
        ];

        // Sample invoices
        invoices = [
            {
                id: 1,
                title: 'Hóa đơn tháng 7/2025',
                code: 'HD-2025-A1205',
                apartmentNumber: 'A-1205',
                residentName: 'Nguyễn Văn A',
                type: 'MONTHLY',
                amount: 1850000,
                status: 'PAID',
                dueDate: '2025-08-01',
                paidDate: '2025-08-01',
                createdAt: '2025-07-25T10:00:00Z',
                updatedAt: '2025-08-01T14:30:00Z',
                createdBy: 'tuandung',
                notes: 'Đã thanh toán đúng hạn'
            },
            {
                id: 2,
                title: 'Phí dịch vụ tháng 7/2025',
                code: 'HD-2025-A0315-S',
                apartmentNumber: 'B-0823',
                residentName: 'Trần Thị B',
                type: 'SERVICE',
                amount: 1650000,
                status: 'PENDING',
                dueDate: '2025-08-15',
                paidDate: null,
                createdAt: '2025-07-25T10:00:00Z',
                updatedAt: '2025-07-25T10:00:00Z',
                createdBy: 'tuandung',
                notes: 'Chưa thanh toán'
            },
            {
                id: 3,
                title: 'Phí đỗ xe tháng 7/2025',
                code: 'HD-2025-C1402-P',
                apartmentNumber: 'C-1402',
                residentName: 'Lê Văn C',
                type: 'PARKING',
                amount: 2000000,
                status: 'OVERDUE',
                dueDate: '2025-07-31',
                paidDate: null,
                createdAt: '2025-07-25T10:00:00Z',
                updatedAt: '2025-08-05T09:00:00Z',
                createdBy: 'tuandung',
                notes: 'Quá hạn 7 ngày'
            },
            {
                id: 4,
                title: 'Hóa đơn tháng 6/2025',
                code: 'HD-2025-B0502',
                apartmentNumber: 'B-0502',
                residentName: 'Phạm Thị D',
                type: 'MONTHLY',
                amount: 1750000,
                status: 'PENDING',
                dueDate: '2025-08-10',
                paidDate: null,
                createdAt: '2025-06-25T10:00:00Z',
                updatedAt: '2025-06-25T10:00:00Z',
                createdBy: 'tuandung',
                notes: 'Chưa thanh toán'
            }
        ];
        
        filteredInvoices = [...invoices];
        displayServiceFees();
        displayInvoices();
        showLoading(false);
        
        console.log(`✅ Loaded ${serviceFees.length} service fees and ${invoices.length} invoices`);
        showAlert('Tải dữ liệu thành công!', 'success');
    }, 1500);
}

// Display service fees
function displayServiceFees() {
    console.log(`🎨 Displaying ${serviceFees.length} service fees...`);
    const container = document.getElementById('serviceFeeTableBody');
    
    if (!container) {
        console.error('❌ Service fee container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (serviceFees.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="empty-state">
                        <h6>Chưa có phí dịch vụ nào</h6>
                        <p class="text-muted mb-0">Nhấn "Thêm phí dịch vụ" để bắt đầu</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    serviceFees.forEach((fee, index) => {
        const row = createServiceFeeRow(fee, index);
        container.appendChild(row);
    });
    
    // Initialize tooltips after adding rows
    initializeTooltips();
    
    console.log(`✅ Displayed ${serviceFees.length} service fee items`);
}

// Create service fee row với Icon Buttons
function createServiceFeeRow(fee, index) {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.1}s`;
    
    const vatText = fee.vat > 0 ? `+ VAT ${fee.vat}%` : '';
    
    tr.innerHTML = `
        <td>
            <div class="service-fee-item">${fee.type}</div>
            <div class="service-fee-description">${fee.description}</div>
        </td>
        <td>
            <div class="service-fee-price">${formatCurrency(fee.price)}</div>
            ${vatText ? `<div class="service-fee-vat">${vatText}</div>` : ''}
        </td>
        <td>
            <span class="service-fee-unit">${fee.unit}</span>
        </td>
        <td>
            <div class="action-btn-group">
                <button class="action-icon-btn btn-view" type="button" title="Xem chi tiết" data-bs-toggle="tooltip">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-icon-btn btn-edit" type="button" title="Chỉnh sửa" data-bs-toggle="tooltip">
                    <i class="bi bi-pencil"></i>
                </button>
            </div>
        </td>
    `;
    
    // Event listeners
    const viewBtn = tr.querySelector('.btn-view');
    const editBtn = tr.querySelector('.btn-edit');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            console.log(`👁️ View service fee: ${fee.id}`);
            openServiceFeeModal('view', fee.id);
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log(`✏️ Edit service fee: ${fee.id}`);
            openServiceFeeModal('edit', fee.id);
        });
    }
    
    return tr;
}

// Display invoices
function displayInvoices() {
    console.log(`🎨 Displaying ${filteredInvoices.length} invoices...`);
    const container = document.getElementById('invoiceTableBody');
    
    if (!container) {
        console.error('❌ Invoice container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (filteredInvoices.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="empty-state">
                        <h6>Không tìm thấy hóa đơn nào</h6>
                        <p class="text-muted mb-0">Thử thay đổi điều kiện tìm kiếm</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredInvoices.forEach((invoice, index) => {
        const row = createInvoiceRow(invoice, index);
        container.appendChild(row);
    });
    
    // Initialize tooltips after adding rows
    initializeTooltips();
    
    console.log(`✅ Displayed ${filteredInvoices.length} invoice items`);
}

// Create invoice row với Icon Buttons dựa trên status
function createInvoiceRow(invoice, index) {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.1}s`;
    
    const statusClass = invoice.status ? invoice.status.toLowerCase() : 'pending';
    const amountClass = getAmountClass(invoice.status);
    
    // Generate action buttons based on status với Icon Buttons
    let actionButtons = '';
    
    switch(invoice.status) {
        case 'PAID':
            // Đã thanh toán: Xem | Sửa | In
            actionButtons = `
                <div class="action-btn-group">
                    <button class="action-icon-btn btn-view" type="button" title="Xem chi tiết" data-bs-toggle="tooltip">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-icon-btn btn-edit" type="button" title="Chỉnh sửa" data-bs-toggle="tooltip">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-icon-btn btn-print" type="button" title="In hóa đơn" data-bs-toggle="tooltip">
                        <i class="bi bi-printer"></i>
                    </button>
                </div>
            `;
            break;
            
        case 'PENDING':
            // Chưa thanh toán: Xem | Sửa | Gửi thông báo
            actionButtons = `
                <div class="action-btn-group">
                    <button class="action-icon-btn btn-view" type="button" title="Xem chi tiết" data-bs-toggle="tooltip">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-icon-btn btn-edit" type="button" title="Chỉnh sửa" data-bs-toggle="tooltip">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-icon-btn btn-notify" type="button" title="Gửi thông báo" data-bs-toggle="tooltip">
                        <i class="bi bi-bell"></i>
                    </button>
                </div>
            `;
            break;
            
        case 'OVERDUE':
            // Quá hạn: Xem | Sửa | Cảnh báo | Khóa
            actionButtons = `
                <div class="action-btn-group">
                    <button class="action-icon-btn btn-view" type="button" title="Xem chi tiết" data-bs-toggle="tooltip">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-icon-btn btn-edit" type="button" title="Chỉnh sửa" data-bs-toggle="tooltip">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-icon-btn btn-warning" type="button" title="Gửi cảnh báo" data-bs-toggle="tooltip">
                        <i class="bi bi-exclamation-triangle"></i>
                    </button>
                    <button class="action-icon-btn btn-lock" type="button" title="Khóa căn hộ" data-bs-toggle="tooltip">
                        <i class="bi bi-lock"></i>
                    </button>
                </div>
            `;
            break;
            
        default:
            // Mặc định: Xem | Sửa
            actionButtons = `
                <div class="action-btn-group">
                    <button class="action-icon-btn btn-view" type="button" title="Xem chi tiết" data-bs-toggle="tooltip">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-icon-btn btn-edit" type="button" title="Chỉnh sửa" data-bs-toggle="tooltip">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            `;
    }
    
    tr.innerHTML = `
        <td>
            <div class="invoice-title">${invoice.title}</div>
            <div class="invoice-code">${invoice.code}</div>
        </td>
        <td>
            <div class="apartment-info">${invoice.apartmentNumber}</div>
            <div class="resident-name">${invoice.residentName}</div>
        </td>
        <td>
            <div class="amount-value ${amountClass}">${formatCurrency(invoice.amount)}</div>
        </td>
        <td>
            <div class="due-date">${formatDate(invoice.dueDate)}</div>
        </td>
        <td>
            <span class="status-badge ${statusClass}">${statusMapping[invoice.status] || 'Chưa thanh toán'}</span>
        </td>
        <td>
            ${actionButtons}
        </td>
    `;
    
    // Event listeners
    const viewBtn = tr.querySelector('.btn-view');
    const editBtn = tr.querySelector('.btn-edit');
    const printBtn = tr.querySelector('.btn-print');
    const notifyBtn = tr.querySelector('.btn-notify');
    const warningBtn = tr.querySelector('.btn-warning');
    const lockBtn = tr.querySelector('.btn-lock');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            console.log(`👁️ View invoice: ${invoice.id}`);
            openInvoiceModal('view', invoice.id);
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log(`✏️ Edit invoice: ${invoice.id}`);
            openInvoiceModal('edit', invoice.id);
        });
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            console.log(`🖨️ Print invoice: ${invoice.id}`);
            printInvoice(invoice.id);
        });
    }
    
    if (notifyBtn) {
        notifyBtn.addEventListener('click', () => {
            console.log(`📧 Send notification: ${invoice.id}`);
            sendNotification(invoice.id);
        });
    }
    
    if (warningBtn) {
        warningBtn.addEventListener('click', () => {
            console.log(`⚠️ Send warning: ${invoice.id}`);
            sendWarning(invoice.id);
        });
    }
    
    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            console.log(`🔒 Lock apartment: ${invoice.apartmentNumber}`);
            lockApartment(invoice.id);
        });
    }
    
    return tr;
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Open service fee modal
function openServiceFeeModal(mode, serviceFeeId = null) {
    console.log(`🎭 Opening service fee modal: ${mode} for ID: ${serviceFeeId}`);
    
    if (!document.getElementById('serviceFeeModal')) {
        createModals();
    }
    
    currentServiceFee = serviceFeeId ? serviceFees.find(sf => sf.id === serviceFeeId) : null;
    
    setTimeout(() => {
        try {
            const modalTitle = document.getElementById('serviceFeeModalTitle');
            const saveBtn = document.getElementById('saveServiceFeeBtn');
            
            switch(mode) {
                case 'add':
                    modalTitle.textContent = 'Thêm phí dịch vụ';
                    saveBtn.textContent = 'Thêm';
                    saveBtn.style.display = 'block';
                    enableServiceFeeForm(true);
                    clearServiceFeeForm();
                    break;
                case 'edit':
                    modalTitle.textContent = 'Chỉnh sửa phí dịch vụ';
                    saveBtn.textContent = 'Cập nhật';
                    saveBtn.style.display = 'block';
                    enableServiceFeeForm(true);
                    populateServiceFeeForm(currentServiceFee);
                    break;
                case 'view':
                    modalTitle.textContent = 'Chi tiết phí dịch vụ';
                    saveBtn.style.display = 'none';
                    enableServiceFeeForm(false);
                    populateServiceFeeForm(currentServiceFee);
                    break;
            }
            
            // Setup save button
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', () => saveServiceFee(mode));
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('serviceFeeModal'));
            modal.show();
            
            console.log('✅ Service fee modal opened successfully');
            
        } catch (error) {
            console.error('❌ Service fee modal error:', error);
            showAlert('Lỗi khi mở modal: ' + error.message, 'danger');
        }
    }, 100);
}

// Open invoice modal
function openInvoiceModal(mode, invoiceId = null) {
    console.log(`🎭 Opening invoice modal: ${mode} for ID: ${invoiceId}`);
    
    if (!document.getElementById('invoiceModal')) {
        createModals();
    }
    
    currentInvoice = invoiceId ? invoices.find(inv => inv.id === invoiceId) : null;
    
    setTimeout(() => {
        try {
            const modalTitle = document.getElementById('invoiceModalTitle');
            const saveBtn = document.getElementById('saveInvoiceBtn');
            
            switch(mode) {
                case 'add':
                    modalTitle.textContent = 'Tạo hóa đơn mới';
                    saveBtn.textContent = 'Tạo';
                    saveBtn.style.display = 'block';
                    enableInvoiceForm(true);
                    clearInvoiceForm();
                    generateInvoiceCode();
                    break;
                case 'edit':
                    modalTitle.textContent = 'Chỉnh sửa hóa đơn';
                    saveBtn.textContent = 'Cập nhật';
                    saveBtn.style.display = 'block';
                    enableInvoiceForm(true);
                    populateInvoiceForm(currentInvoice);
                    break;
                case 'view':
                    modalTitle.textContent = 'Chi tiết hóa đơn';
                    saveBtn.style.display = 'none';
                    enableInvoiceForm(false);
                    populateInvoiceForm(currentInvoice);
                    break;
            }
            
            // Setup save button
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', () => saveInvoice(mode));
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
            modal.show();
            
            console.log('✅ Invoice modal opened successfully');
            
        } catch (error) {
            console.error('❌ Invoice modal error:', error);
            showAlert('Lỗi khi mở modal: ' + error.message, 'danger');
        }
    }, 100);
}

// Save functions
function saveServiceFee(mode) {
    console.log('💾 Saving service fee...');
    
    const formData = {
        type: document.getElementById('serviceFeeType')?.value,
        unit: document.getElementById('serviceFeeUnit')?.value,
        price: parseFloat(document.getElementById('serviceFeePrice')?.value || 0),
        vat: parseFloat(document.getElementById('serviceFeeVAT')?.value || 0),
        description: document.getElementById('serviceFeeDescription')?.value
    };
    
    // Validation
    if (!formData.type || !formData.unit || formData.price < 0) {
        showAlert('Vui lòng điền đầy đủ thông tin bắt buộc!', 'warning');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        try {
            if (mode === 'add') {
                const newServiceFee = {
                    id: serviceFees.length + 1,
                    ...formData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'tuandung'
                };
                serviceFees.push(newServiceFee);
                showAlert('Thêm phí dịch vụ thành công!', 'success');
            } else if (mode === 'edit' && currentServiceFee) {
                const index = serviceFees.findIndex(sf => sf.id === currentServiceFee.id);
                if (index !== -1) {
                    serviceFees[index] = {
                        ...serviceFees[index],
                        ...formData,
                        updatedAt: new Date().toISOString()
                    };
                    showAlert('Cập nhật phí dịch vụ thành công!', 'success');
                }
            }
            
            displayServiceFees();
            
            const modalElement = document.getElementById('serviceFeeModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
        } catch (error) {
            console.error('❌ Save service fee error:', error);
            showAlert('Lỗi khi lưu: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 1200);
}

function saveInvoice(mode) {
    console.log('💾 Saving invoice...');
    
    const formData = {
        title: document.getElementById('invoiceTitle')?.value,
        code: document.getElementById('invoiceCode')?.value,
        apartmentNumber: document.getElementById('invoiceApartment')?.value,
        residentName: document.getElementById('invoiceResident')?.value,
        type: document.getElementById('invoiceType')?.value,
        amount: parseFloat(document.getElementById('invoiceAmount')?.value || 0),
        status: document.getElementById('invoiceStatus')?.value,
        dueDate: document.getElementById('invoiceDueDate')?.value,
        paidDate: document.getElementById('invoicePaidDate')?.value,
        notes: document.getElementById('invoiceNotes')?.value
    };
    
    // Validation
    if (!formData.title || !formData.apartmentNumber || !formData.type || formData.amount <= 0 || !formData.dueDate) {
        showAlert('Vui lòng điền đầy đủ thông tin bắt buộc!', 'warning');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        try {
            if (mode === 'add') {
                const newInvoice = {
                    id: invoices.length + 1,
                    ...formData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'tuandung'
                };
                invoices.push(newInvoice);
                filteredInvoices = [...invoices];
                showAlert('Tạo hóa đơn thành công!', 'success');
            } else if (mode === 'edit' && currentInvoice) {
                const index = invoices.findIndex(inv => inv.id === currentInvoice.id);
                if (index !== -1) {
                    invoices[index] = {
                        ...invoices[index],
                        ...formData,
                        updatedAt: new Date().toISOString()
                    };
                    filteredInvoices = [...invoices];
                    showAlert('Cập nhật hóa đơn thành công!', 'success');
                }
            }
            
            displayInvoices();
            
            const modalElement = document.getElementById('invoiceModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
        } catch (error) {
            console.error('❌ Save invoice error:', error);
            showAlert('Lỗi khi lưu: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 1200);
}

// Utility functions
function generateInvoiceCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const code = `HD-${year}${month}${day}-${random}`;
    
    const codeField = document.getElementById('invoiceCode');
    if (codeField) codeField.value = code;
}

function getAmountClass(status) {
    const amountClasses = {
        'PAID': 'amount-paid',
        'PENDING': 'amount-pending',
        'OVERDUE': 'amount-overdue'
    };
    return amountClasses[status] || 'amount-pending';
}

function formatCurrency(amount) {
    if (!amount) return '0₫';
    return amount.toLocaleString('vi-VN') + '₫';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + 
           date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
}

// Filter functions
function applyFilters() {
    console.log('🔍 Applying filters...');
    
    const filters = {
        search: document.getElementById('searchInput')?.value.toLowerCase() || '',
        status: document.getElementById('statusFilter')?.value || '',
        building: document.getElementById('buildingFilter')?.value || '',
        type: document.getElementById('typeFilter')?.value || ''
    };
    
    filteredInvoices = invoices.filter(invoice => {
        const searchMatch = !filters.search || 
            invoice.title?.toLowerCase().includes(filters.search) ||
            invoice.apartmentNumber?.toLowerCase().includes(filters.search) ||
            invoice.residentName?.toLowerCase().includes(filters.search) ||
            invoice.code?.toLowerCase().includes(filters.search);
        
        const statusMatch = !filters.status || invoice.status === filters.status;
        const buildingMatch = !filters.building || invoice.apartmentNumber?.includes(filters.building);
        const typeMatch = !filters.type || invoice.type === filters.type;
        
        return searchMatch && statusMatch && buildingMatch && typeMatch;
    });
    
    displayInvoices();
    console.log(`✅ Filters applied: ${filteredInvoices.length}/${invoices.length} items`);
}

function clearFilters() {
    console.log('🧹 Clearing filters...');
    
    const filterIds = ['searchInput', 'statusFilter', 'buildingFilter', 'typeFilter'];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    filteredInvoices = [...invoices];
    displayInvoices();
    showAlert('Đã xóa tất cả bộ lọc!', 'info');
}

// Form helper functions
function enableServiceFeeForm(enabled) {
    const fields = ['serviceFeeType', 'serviceFeeUnit', 'serviceFeePrice', 'serviceFeeVAT', 'serviceFeeDescription'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.disabled = !enabled;
    });
}

function enableInvoiceForm(enabled) {
    const fields = ['invoiceTitle', 'invoiceApartment', 'invoiceResident', 'invoiceType', 'invoiceAmount', 'invoiceStatus', 'invoiceDueDate', 'invoicePaidDate', 'invoiceNotes'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.disabled = !enabled;
    });
    
    // Code field is always readonly
    const codeField = document.getElementById('invoiceCode');
    if (codeField) codeField.disabled = true;
}

function clearServiceFeeForm() {
    const fields = ['serviceFeeType', 'serviceFeeUnit', 'serviceFeePrice', 'serviceFeeVAT', 'serviceFeeDescription'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    document.getElementById('serviceFeeVAT').value = '10';
}

function clearInvoiceForm() {
    const fields = ['invoiceTitle', 'invoiceCode', 'invoiceApartment', 'invoiceResident', 'invoiceType', 'invoiceAmount', 'invoiceStatus', 'invoiceDueDate', 'invoicePaidDate', 'invoiceNotes'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    document.getElementById('invoiceStatus').value = 'PENDING';
    
    // Set default due date (end of current month)
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    document.getElementById('invoiceDueDate').value = lastDay.toISOString().split('T')[0];
}

function populateServiceFeeForm(fee) {
    if (!fee) return;
    
    const fields = [
        { id: 'serviceFeeType', value: fee.type },
        { id: 'serviceFeeUnit', value: fee.unit },
        { id: 'serviceFeePrice', value: fee.price },
        { id: 'serviceFeeVAT', value: fee.vat },
        { id: 'serviceFeeDescription', value: fee.description }
    ];
    
    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });
}

function populateInvoiceForm(invoice) {
    if (!invoice) return;
    
    const fields = [
        { id: 'invoiceTitle', value: invoice.title },
        { id: 'invoiceCode', value: invoice.code },
        { id: 'invoiceApartment', value: invoice.apartmentNumber },
        { id: 'invoiceResident', value: invoice.residentName },
        { id: 'invoiceType', value: invoice.type },
        { id: 'invoiceAmount', value: invoice.amount },
        { id: 'invoiceStatus', value: invoice.status },
        { id: 'invoiceDueDate', value: invoice.dueDate },
        { id: 'invoicePaidDate', value: invoice.paidDate },
        { id: 'invoiceNotes', value: invoice.notes }
    ];
    
    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });
    
    // Info fields
    const infoFields = [
        { id: 'invoiceCreatedAt', value: formatDateTime(invoice.createdAt) },
        { id: 'invoiceUpdatedAt', value: formatDateTime(invoice.updatedAt) },
        { id: 'invoiceCreatedBy', value: invoice.createdBy }
    ];
    
    infoFields.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || 'N/A';
    });
}

// Action functions for different invoice statuses
function printInvoice(invoiceId) {
    console.log('🖨️ Printing invoice:', invoiceId);
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('Không tìm thấy hóa đơn!', 'danger');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        showLoading(false);
        showAlert(`Đã gửi lệnh in hóa đơn ${invoice.code} thành công!`, 'success');
        
        // Simulate opening print dialog
        const printContent = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="text-align: center; color: #2c3e50;">HÓA ĐƠN THANH TOÁN</h2>
                <div style="margin: 20px 0;">
                    <strong>Mã hóa đơn:</strong> ${invoice.code}<br>
                    <strong>Tiêu đề:</strong> ${invoice.title}<br>
                    <strong>Căn hộ:</strong> ${invoice.apartmentNumber}<br>
                    <strong>Cư dân:</strong> ${invoice.residentName}<br>
                    <strong>Số tiền:</strong> ${formatCurrency(invoice.amount)}<br>
                    <strong>Hạn thanh toán:</strong> ${formatDate(invoice.dueDate)}<br>
                    <strong>Trạng thái:</strong> ${statusMapping[invoice.status]}<br>
                    <strong>Ngày thanh toán:</strong> ${formatDate(invoice.paidDate)}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <em>Cảm ơn bạn đã thanh toán đúng hạn!</em>
                </div>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        
    }, 1000);
}

function sendNotification(invoiceId) {
    console.log('📧 Sending notification for invoice:', invoiceId);
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('Không tìm thấy hóa đơn!', 'danger');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        showLoading(false);
        showAlert(`Đã gửi thông báo thanh toán đến ${invoice.residentName} (${invoice.apartmentNumber}) thành công!`, 'success');
        
        // Simulate updating last contact
        const index = invoices.findIndex(inv => inv.id === invoiceId);
        if (index !== -1) {
            invoices[index].notes = (invoices[index].notes || '') + ` | Đã gửi thông báo lúc ${formatDateTime(new Date().toISOString())}`;
            invoices[index].updatedAt = new Date().toISOString();
            filteredInvoices = [...invoices];
            displayInvoices();
        }
        
    }, 1500);
}

function sendWarning(invoiceId) {
    console.log('⚠️ Sending warning for invoice:', invoiceId);
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('Không tìm thấy hóa đơn!', 'danger');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        showLoading(false);
        showAlert(`Đã gửi cảnh báo quá hạn đến ${invoice.residentName} (${invoice.apartmentNumber})!`, 'warning');
        
        // Simulate updating warning sent
        const index = invoices.findIndex(inv => inv.id === invoiceId);
        if (index !== -1) {
            invoices[index].notes = (invoices[index].notes || '') + ` | Đã gửi cảnh báo quá hạn lúc ${formatDateTime(new Date().toISOString())}`;
            invoices[index].updatedAt = new Date().toISOString();
            filteredInvoices = [...invoices];
            displayInvoices();
        }
        
    }, 1500);
}

function lockApartment(invoiceId) {
    console.log('🔒 Locking apartment for invoice:', invoiceId);
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showAlert('Không tìm thấy hóa đơn!', 'danger');
        return;
    }
    
    const confirmLock = confirm(`Bạn có chắc chắn muốn khóa căn hộ ${invoice.apartmentNumber} do quá hạn thanh toán?\n\nHành động này sẽ:\n- Khóa quyền truy cập thang máy\n- Khóa quyền sử dụng tiện ích chung\n- Gửi thông báo khóa căn hộ`);
    
    if (confirmLock) {
        showLoading(true);
        
        setTimeout(() => {
            showLoading(false);
            showAlert(`Đã khóa căn hộ ${invoice.apartmentNumber} do quá hạn thanh toán!`, 'warning');
            
            // Simulate updating lock status
            const index = invoices.findIndex(inv => inv.id === invoiceId);
            if (index !== -1) {
                invoices[index].notes = (invoices[index].notes || '') + ` | Đã khóa căn hộ lúc ${formatDateTime(new Date().toISOString())}`;
                invoices[index].updatedAt = new Date().toISOString();
                filteredInvoices = [...invoices];
                displayInvoices();
            }
            
        }, 1000);
    }
}

// Excel Export Function using SheetJS
function exportInvoices() {
    console.log('📊 Exporting invoices to Excel...');
    
    // Check if SheetJS is available
    if (typeof XLSX === 'undefined') {
        showAlert('Thư viện Excel chưa được tải. Vui lòng thử lại sau!', 'warning');
        console.error('XLSX library is not loaded. Please include SheetJS library.');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Prepare data for worksheet
            const wsData = [
                // Header row with Vietnamese titles
                [
                    'STT',
                    'Mã hóa đơn', 
                    'Tiêu đề', 
                    'Căn hộ', 
                    'Cư dân', 
                    'Loại hóa đơn', 
                    'Số tiền (VNĐ)', 
                    'Hạn thanh toán', 
                    'Ngày thanh toán', 
                    'Trạng thái', 
                    'Ghi chú',
                    'Ngày tạo',
                    'Người tạo'
                ],
                // Data rows
                ...filteredInvoices.map((invoice, index) => [
                    index + 1, // STT
                    invoice.code || '',
                    invoice.title || '',
                    invoice.apartmentNumber || '',
                    invoice.residentName || '',
                    typeMapping[invoice.type] || invoice.type || '',
                    invoice.amount || 0,
                    formatDate(invoice.dueDate) || '',
                    invoice.paidDate ? formatDate(invoice.paidDate) : 'Chưa thanh toán',
                    statusMapping[invoice.status] || invoice.status || '',
                    invoice.notes || '',
                    formatDateTime(invoice.createdAt) || '',
                    invoice.createdBy || ''
                ])
            ];
            
            // Create worksheet from data
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Set column widths
            const colWidths = [
                { wch: 5 },   // STT
                { wch: 18 },  // Mã hóa đơn
                { wch: 25 },  // Tiêu đề
                { wch: 12 },  // Căn hộ
                { wch: 20 },  // Cư dân
                { wch: 15 },  // Loại hóa đơn
                { wch: 15 },  // Số tiền
                { wch: 15 },  // Hạn thanh toán
                { wch: 15 },  // Ngày thanh toán
                { wch: 15 },  // Trạng thái
                { wch: 30 },  // Ghi chú
                { wch: 18 },  // Ngày tạo
                { wch: 15 }   // Người tạo
            ];
            ws['!cols'] = colWidths;
            
            // Style header row
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress]) continue;
                
                ws[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "2C3E50" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" }
                    }
                };
            }
            
            // Format amount column (column G - index 6)
            for (let row = 1; row <= headerRange.e.r; row++) {
                const amountCell = ws[XLSX.utils.encode_cell({ r: row, c: 6 })];
                if (amountCell && typeof amountCell.v === 'number') {
                    amountCell.z = '#,##0';
                }
            }
            
            // Add worksheet to workbook
            const sheetName = 'Danh sách hóa đơn';
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            
            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
                        const filename = `Danh_sach_hoa_don_${dateStr}_${timeStr}.xlsx`;
            
            // Write file
            XLSX.writeFile(wb, filename);
            
            showLoading(false);
            showAlert(`Xuất file Excel thành công! File: ${filename}`, 'success');
            
            console.log(`✅ Excel file exported: ${filename}`);
            console.log(`📊 Total invoices exported: ${filteredInvoices.length}`);
            
        } catch (error) {
            showLoading(false);
            console.error('❌ Excel export error:', error);
            showAlert('Lỗi khi xuất file Excel: ' + error.message, 'danger');
        }
    }, 1000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// Global functions for debugging and external access
window.InvoiceSystem = {
    serviceFees,
    invoices,
    filteredInvoices,
    openServiceFeeModal,
    openInvoiceModal,
    showAlert,
    currentInvoice,
    currentServiceFee,
    printInvoice,
    sendNotification,
    sendWarning,
    lockApartment,
    exportInvoices,
    initializeTooltips,
    // Utility functions
    formatCurrency,
    formatDate,
    formatDateTime,
    // System info
    getCurrentUser: () => 'tuandung',
    getCurrentTime: () => '2025-08-07 14:59:05'
};

// System logging with current user and timestamp
console.log('📦 Invoice Management System loaded successfully!');
console.log(`👤 Current User: tuandung`);
console.log(`📅 System Time: 2025-08-07 14:59:05 UTC`);
console.log('💡 Make sure to include SheetJS library for Excel export functionality');
console.log('🔗 Add this to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>');
console.log('🎯 Bootstrap Icons integration completed');
console.log('✅ All action buttons converted to icon buttons with tooltips');