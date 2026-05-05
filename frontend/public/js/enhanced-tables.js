/**
 * Enhanced Table System
 * Modern Sorting, Pagination, Filtering, Export
 */

class EnhancedTable {
    constructor(tableId, options = {}) {
        this.tableId = tableId;
        this.options = {
            itemsPerPage: options.itemsPerPage || 10,
            sortable: options.sortable !== false,
            filterable: options.filterable !== false,
            exportable: options.exportable !== false,
            searchable: options.searchable !== false,
            ...options
        };
        
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filterValues = {};
        this.searchTerm = '';
        this.originalData = [];
        this.filteredData = [];
        
        this.init();
    }

    init() {
        this.tableElement = document.getElementById(this.tableId);
        if (!this.tableElement) return;
        
        this.setupTableStructure();
        this.bindEvents();
        this.loadInitialData();
    }

    setupTableStructure() {
        const container = this.tableElement.parentElement;
        
        // Create enhanced table container
        const enhancedContainer = document.createElement('div');
        enhancedContainer.className = 'enhanced-table-container';
        
        // Create table controls
        const controls = this.createTableControls();
        
        // Create table stats
        const stats = this.createTableStats();
        
        // Wrap existing table
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'enhanced-table-wrapper';
        
        // Move table to new structure
        this.tableElement.classList.add('enhanced-table');
        tableWrapper.appendChild(this.tableElement);
        
        // Create pagination
        const pagination = this.createPagination();
        
        // Assemble enhanced container
        enhancedContainer.appendChild(controls);
        enhancedContainer.appendChild(stats);
        enhancedContainer.appendChild(tableWrapper);
        enhancedContainer.appendChild(pagination);
        
        // Replace original container
        container.appendChild(enhancedContainer);
        
        // Store references
        this.container = enhancedContainer;
        this.controlsElement = controls;
        this.statsElement = stats;
        this.paginationElement = pagination;
    }

    createTableControls() {
        const controls = document.createElement('div');
        controls.className = 'enhanced-table-controls';
        
        const leftControls = document.createElement('div');
        leftControls.className = 'table-controls-left';
        
        // Search box
        if (this.options.searchable) {
            const searchBox = document.createElement('div');
            searchBox.className = 'enhanced-search-box';
            searchBox.innerHTML = `
                <i class="fas fa-search"></i>
                <input type="text" class="enhanced-search-input" placeholder="Search..." id="${this.tableId}-search">
            `;
            leftControls.appendChild(searchBox);
        }
        
        // Filters
        if (this.options.filterable) {
            const filterGroup = document.createElement('div');
            filterGroup.className = 'enhanced-filter-group';
            // Filters will be added dynamically based on table columns
            leftControls.appendChild(filterGroup);
        }
        
        const rightControls = document.createElement('div');
        rightControls.className = 'table-controls-right';
        
        // Export dropdown
        if (this.options.exportable) {
            const exportDropdown = this.createExportDropdown();
            rightControls.appendChild(exportDropdown);
        }
        
        controls.appendChild(leftControls);
        controls.appendChild(rightControls);
        
        return controls;
    }

    createExportDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'export-dropdown';
        dropdown.innerHTML = `
            <button class="export-btn" id="${this.tableId}-export-btn">
                <i class="fas fa-download"></i>
                Export
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="export-menu" id="${this.tableId}-export-menu">
                <button class="export-option" onclick="window.enhancedTables['${this.tableId}'].exportToCSV()">
                    <i class="fas fa-file-csv"></i> Export CSV
                </button>
                <button class="export-option" onclick="window.enhancedTables['${this.tableId}'].exportToExcel()">
                    <i class="fas fa-file-excel"></i> Export Excel
                </button>
                <button class="export-option" onclick="window.enhancedTables['${this.tableId}'].exportToPDF()">
                    <i class="fas fa-file-pdf"></i> Export PDF
                </button>
                <button class="export-option" onclick="window.enhancedTables['${this.tableId}'].printTable()">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        `;
        
        return dropdown;
    }

    createTableStats() {
        const stats = document.createElement('div');
        stats.className = 'table-stats';
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Records</span>
                <span class="stat-value" id="${this.tableId}-total-records">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Filtered</span>
                <span class="stat-value" id="${this.tableId}-filtered-records">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Showing</span>
                <span class="stat-value" id="${this.tableId}-showing-records">0</span>
            </div>
        `;
        
        return stats;
    }

    createPagination() {
        const pagination = document.createElement('div');
        pagination.className = 'enhanced-pagination';
        pagination.innerHTML = `
            <div class="pagination-info">
                Showing <span id="${this.tableId}-page-info">0-0</span> of <span id="${this.tableId}-total-info">0</span> entries
            </div>
            <div class="pagination-controls" id="${this.tableId}-pagination-controls">
                <!-- Pagination buttons will be generated dynamically -->
            </div>
        `;
        
        return pagination;
    }

    bindEvents() {
        // Search event
        const searchInput = document.getElementById(`${this.tableId}-search`);
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Export dropdown toggle
        const exportBtn = document.getElementById(`${this.tableId}-export-btn`);
        const exportMenu = document.getElementById(`${this.tableId}-export-menu`);
        
        if (exportBtn && exportMenu) {
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exportMenu.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                exportMenu.classList.remove('show');
            });
        }
        
        // Sort events
        if (this.options.sortable) {
            this.bindSortEvents();
        }
    }

    bindSortEvents() {
        const headers = this.tableElement.querySelectorAll('th');
        headers.forEach((header, index) => {
            if (header.textContent.trim() !== 'Actions') {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(index);
                });
                
                // Add sort icon
                const sortable = document.createElement('div');
                sortable.className = 'sortable';
                sortable.innerHTML = `
                    <span>${header.textContent}</span>
                    <i class="fas fa-sort sort-icon" id="${this.tableId}-sort-${index}"></i>
                `;
                header.textContent = '';
                header.appendChild(sortable);
            }
        });
    }

    loadInitialData() {
        // Extract data from existing table
        const rows = this.tableElement.querySelectorAll('tbody tr');
        this.originalData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).map(cell => cell.textContent.trim());
        });
        
        this.filteredData = [...this.originalData];
        this.renderTable();
        this.updateStats();
    }

    applyFilters() {
        this.filteredData = this.originalData.filter(row => {
            // Apply search filter
            if (this.searchTerm) {
                const searchMatch = row.some(cell => 
                    cell.toLowerCase().includes(this.searchTerm)
                );
                if (!searchMatch) return false;
            }
            
            // Apply column filters
            for (const [column, value] of Object.entries(this.filterValues)) {
                if (value && row[column] !== value) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    }

    sortTable(columnIndex) {
        if (this.sortColumn === columnIndex) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnIndex;
            this.sortDirection = 'asc';
        }
        
        // Update sort icons
        const headers = this.tableElement.querySelectorAll('th .sort-icon');
        headers.forEach((icon, index) => {
            icon.className = 'fas fa-sort sort-icon';
            if (index === columnIndex) {
                icon.className = `fas fa-sort-${this.sortDirection} sort-icon ${this.sortDirection}`;
            }
        });
        
        // Sort data
        this.filteredData.sort((a, b) => {
            const aVal = a[columnIndex];
            const bVal = b[columnIndex];
            
            // Try to parse as numbers
            const aNum = parseFloat(aVal);
            const bNum = parseFloat(bVal);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return this.sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // String comparison
            const comparison = aVal.localeCompare(bVal);
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        
        this.renderTable();
    }

    renderTable() {
        const tbody = this.tableElement.querySelector('tbody');
        if (!tbody) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
        const endIndex = startIndex + this.options.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        if (pageData.length === 0) {
            this.showEmptyState(tbody);
            return;
        }
        
        // Add rows
        pageData.forEach(rowData => {
            const row = this.createTableRow(rowData);
            tbody.appendChild(row);
        });
        
        // Update pagination
        this.updatePagination();
    }

    createTableRow(data) {
        const row = document.createElement('tr');
        
        data.forEach((cellData, index) => {
            const cell = document.createElement('td');
            
            // Special handling for status column
            if (cellData.toLowerCase().includes('active') || 
                cellData.toLowerCase().includes('inactive') ||
                cellData.toLowerCase().includes('pending')) {
                cell.innerHTML = `<span class="status-badge ${cellData.toLowerCase()}">${cellData}</span>`;
            } 
            // Special handling for actions column
            else if (index === data.length - 1) {
                cell.innerHTML = `
                    <div class="action-buttons">
                        <button class="action-btn view" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            } else {
                cell.textContent = cellData;
            }
            
            row.appendChild(cell);
        });
        
        return row;
    }

    showEmptyState(tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" class="table-empty">
                    <i class="fas fa-inbox"></i>
                    <h3>No data found</h3>
                    <p>No records match your search criteria</p>
                    <button class="btn btn-primary" onclick="window.enhancedTables['${this.tableId}'].clearFilters()">
                        Clear Filters
                    </button>
                </td>
            </tr>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.options.itemsPerPage);
        const controls = document.getElementById(`${this.tableId}-pagination-controls`);
        
        if (!controls) return;
        
        controls.innerHTML = '';
        
        // Previous button
        const prevBtn = this.createPaginationButton('Previous', this.currentPage > 1, () => {
            this.currentPage--;
            this.renderTable();
        });
        controls.appendChild(prevBtn);
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            controls.appendChild(this.createPaginationButton('1', true, () => {
                this.currentPage = 1;
                this.renderTable();
            }));
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 8px';
                controls.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            controls.appendChild(this.createPaginationButton(i, true, () => {
                this.currentPage = i;
                this.renderTable();
            }, i === this.currentPage));
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 8px';
                controls.appendChild(ellipsis);
            }
            
            controls.appendChild(this.createPaginationButton(totalPages, true, () => {
                this.currentPage = totalPages;
                this.renderTable();
            }));
        }
        
        // Next button
        const nextBtn = this.createPaginationButton('Next', this.currentPage < totalPages, () => {
            this.currentPage++;
            this.renderTable();
        });
        controls.appendChild(nextBtn);
        
        // Update page info
        const startRecord = (this.currentPage - 1) * this.options.itemsPerPage + 1;
        const endRecord = Math.min(this.currentPage * this.options.itemsPerPage, this.filteredData.length);
        
        const pageInfo = document.getElementById(`${this.tableId}-page-info`);
        const totalInfo = document.getElementById(`${this.tableId}-total-info`);
        
        if (pageInfo) pageInfo.textContent = `${startRecord}-${endRecord}`;
        if (totalInfo) totalInfo.textContent = this.filteredData.length;
    }

    createPaginationButton(text, enabled, onClick, active = false) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        if (active) button.classList.add('active');
        if (!enabled) button.disabled = true;
        
        button.textContent = text;
        button.addEventListener('click', onClick);
        
        return button;
    }

    updateStats() {
        const totalRecords = document.getElementById(`${this.tableId}-total-records`);
        const filteredRecords = document.getElementById(`${this.tableId}-filtered-records`);
        const showingRecords = document.getElementById(`${this.tableId}-showing-records`);
        
        if (totalRecords) totalRecords.textContent = this.originalData.length;
        if (filteredRecords) filteredRecords.textContent = this.filteredData.length;
        
        const startRecord = (this.currentPage - 1) * this.options.itemsPerPage + 1;
        const endRecord = Math.min(this.currentPage * this.options.itemsPerPage, this.filteredData.length);
        
        if (showingRecords) {
            showingRecords.textContent = this.filteredData.length > 0 ? `${startRecord}-${endRecord}` : '0';
        }
    }

    clearFilters() {
        this.searchTerm = '';
        this.filterValues = {};
        this.currentPage = 1;
        
        const searchInput = document.getElementById(`${this.tableId}-search`);
        if (searchInput) searchInput.value = '';
        
        this.applyFilters();
    }

    // Export methods
    exportToCSV() {
        const csv = this.convertToCSV();
        this.downloadFile(csv, `${this.tableId}-export.csv`, 'text/csv');
    }

    exportToExcel() {
        // For simplicity, export as CSV (can be enhanced with actual Excel library)
        this.exportToCSV();
    }

    exportToPDF() {
        // For simplicity, open print dialog (can be enhanced with PDF library)
        this.printTable();
    }

    printTable() {
        const printWindow = window.open('', '_blank');
        const tableHTML = this.tableElement.outerHTML;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>${this.tableId} - Print View</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; color: white; }
                        .status-badge.active { background-color: #10b981; }
                        .status-badge.inactive { background-color: #ef4444; }
                        .status-badge.pending { background-color: #f59e0b; }
                    </style>
                </head>
                <body>
                    <h1>${this.tableId} Report</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    ${tableHTML}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    convertToCSV() {
        const headers = Array.from(this.tableElement.querySelectorAll('thead th'))
            .map(th => th.textContent.trim())
            .filter(text => text !== 'Actions');
        
        const rows = this.filteredData.map(row => 
            row.slice(0, -1).map(cell => `"${cell}"`).join(',')
        );
        
        return [headers.join(','), ...rows].join('\n');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

// Global table manager
window.enhancedTables = {};

// Initialize enhanced tables
function initEnhancedTables() {
    // Auto-initialize tables with data-enhanced-table attribute
    const tables = document.querySelectorAll('table[data-enhanced-table]');
    
    tables.forEach(table => {
        const tableId = table.id || `table-${Date.now()}`;
        table.id = tableId;
        
        const options = {
            itemsPerPage: parseInt(table.dataset.itemsPerPage) || 10,
            sortable: table.dataset.sortable !== 'false',
            filterable: table.dataset.filterable !== 'false',
            exportable: table.dataset.exportable !== 'false',
            searchable: table.dataset.searchable !== 'false'
        };
        
        window.enhancedTables[tableId] = new EnhancedTable(tableId, options);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initEnhancedTables);

// Export for manual initialization
window.EnhancedTable = EnhancedTable;
