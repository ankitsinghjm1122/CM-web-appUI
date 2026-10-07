import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserX,
  RotateCcw,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function CustomerListScreen({ onAddCustomer, onEditCustomer }) {
  const { customers, deleteCustomer, resetCustomers, openCustomerProfile } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for delete confirmation modal
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Filter customers by search term (name or email) and status
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        cust.email.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        cust.company.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesStatus =
        statusFilter === 'All' ? true : cust.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Reset to page 1 whenever search or filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleDeleteConfirmed = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      // Adjust page if last item on current page was deleted
      if (paginatedCustomers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Displaying {customers.length} total customer accounts across all business tiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetCustomers}
            title="Reset Mock Data"
            className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed Data</span>
          </button>
          <button
            id="add-customer-top-btn"
            onClick={onAddCustomer}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="customer-search-input"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or company..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          {['All', 'Active', 'Inactive'].map((status) => {
            const isSelected = statusFilter === status;
            const count =
              status === 'All'
                ? customers.length
                : customers.filter((c) => c.status === status).length;

            return (
              <button
                key={status}
                id={`filter-${status.toLowerCase()}-btn`}
                onClick={() => handleStatusFilterChange(status)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No customers found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No customers matched your search query "${searchTerm}". Try checking for typos or searching by company.`
                : `There are currently no ${statusFilter.toLowerCase()} customers in the database.`}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="mt-4 inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" id="customers-table">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Contact Info</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {paginatedCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    id={`customer-row-${cust.id}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Customer Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openCustomerProfile(cust)}
                          className="relative group/avatar cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform active:scale-95"
                          title={`Click to open ${cust.name}'s profile`}
                        >
                          <img
                            src={cust.avatar}
                            alt={cust.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover/avatar:ring-indigo-500 group-hover/avatar:scale-105 transition-all shadow-sm"
                          />
                          <span className="absolute inset-0 rounded-full bg-indigo-900/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px]">
                            <Eye className="w-3.5 h-3.5" />
                          </span>
                        </button>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => openCustomerProfile(cust)}
                            className="font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors cursor-pointer block"
                            title={`Click to open ${cust.name}'s profile`}
                          >
                            {cust.name}
                          </button>
                          <p className="text-[11px] text-slate-500 truncate sm:hidden">
                            {cust.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info (Email & Phone) */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cust.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{cust.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
                        <span className="truncate">{cust.company}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          cust.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cust.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {cust.status}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-slate-500">
                      {new Date(cust.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`edit-customer-${cust.id}-btn`}
                          onClick={() => onEditCustomer(cust)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-customer-${cust.id}-btn`}
                          onClick={() => setCustomerToDelete(cust)}
                          title="Delete Customer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Working Pagination Bar */}
        {filteredCustomers.length > 0 && (
          <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
              </span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{filteredCustomers.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Button */}
              <button
                id="pagination-prev-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              {/* Next Page Button */}
              <button
                id="pagination-next-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        title="Delete Customer"
        message={`Are you sure you want to remove ${customerToDelete?.name} (${customerToDelete?.company}) from your customer list? This action cannot be undone.`}
        confirmText="Confirm Delete"
        cancelText="Keep Customer"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setCustomerToDelete(null)}
        danger={true}
      />
    </div>
  );
}
