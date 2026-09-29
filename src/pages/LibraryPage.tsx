import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { LibraryService, logLibraryAction } from '../services/libraryService';
import {
  BookOpen,
  Search,
  Plus,
  CheckCircle,
  Clock,
  BookMarked,
  Download,
  QrCode,
  DollarSign,
  Users,
  Award,
  Filter,
  FileText,
  PieChart,
  ShoppingBag,
  RotateCcw,
  Bookmark,
} from 'lucide-react';

type LibraryTab =
  | 'overview'
  | 'catalog-search'
  | 'issue-circulation'
  | 'digital-library'
  | 'membership'
  | 'fines'
  | 'procurement'
  | 'reports-analytics';

export const LibraryPage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<LibraryTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Service Datasets
  const kpis = LibraryService.getKPIs();
  const books = LibraryService.getBooks();
  const issues = LibraryService.getIssues();
  const digitalResources = LibraryService.getDigitalResources();
  const members = LibraryService.getMembers();
  const fines = LibraryService.getFines();
  const procurement = LibraryService.getProcurementRequests();

  const handleIssueBookCopy = (bookId: string, title: string) => {
    LibraryService.issueBook(bookId, '2024CS108', 'Aarav Sharma', 'Student');
    addToast('Book Issued Successfully', `Issued copy of "${title}" to Aarav Sharma (2024CS108).`, 'success');
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-sky-600" /> Enterprise Library Management System
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Koha & Alma Grade Library Suite — Cataloging, Circulation Desk, Digital E-Resources, Fines & Procurement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                logLibraryAction({
                  user: 'Librarian V. Sharma',
                  role: 'Librarian',
                  action: 'Opened Catalog New Book Wizard',
                  status: 'SUCCESS',
                });
                addToast('Book Catalog Wizard Ready', 'Enter ISBN to auto-fill metadata.', 'info');
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Catalog New Book
            </Button>
          </div>
        </div>

        {/* Phase 8 Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Library Dashboard', icon: <PieChart className="w-4 h-4" /> },
            { id: 'catalog-search', label: 'Book Catalog & Search', icon: <Search className="w-4 h-4" /> },
            { id: 'issue-circulation', label: 'Circulation Desk', icon: <BookMarked className="w-4 h-4" /> },
            { id: 'digital-library', label: 'Digital Library & E-Books', icon: <Download className="w-4 h-4" /> },
            { id: 'membership', label: 'Members & RFID Cards', icon: <Users className="w-4 h-4" /> },
            { id: 'fines', label: 'Fines & Payments', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'procurement', label: 'Faculty Procurement', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'reports-analytics', label: 'Analytics & Reports', icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LibraryTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: LIBRARY DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-sky-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Volumes</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.totalBooks.toLocaleString('en-IN')}</h3>
                <span className="text-[11px] text-emerald-600 font-medium">{kpis.availableBooks.toLocaleString('en-IN')} Available</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Currently Issued</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.issuedBooks.toLocaleString('en-IN')}</h3>
                <span className="text-[11px] text-purple-600 font-medium">14 Days Standard Loan</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-amber-500">
                <p className="text-xs font-semibold text-slate-500 uppercase">Overdue Returns</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.overdueBooks}</h3>
                <span className="text-[11px] text-amber-600 font-medium">Automated Reminders Active</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Digital Resources</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.digitalResourcesCount.toLocaleString('en-IN')}</h3>
                <span className="text-[11px] text-emerald-600 font-medium">IEEE & ACM Pass Included</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Most Popular Volumes This Month</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Introduction to Algorithms (CLRS)</span><Badge variant="purple">142 Issues</Badge></div>
                  <div className="flex justify-between"><span>The C Programming Language</span><Badge variant="purple">98 Issues</Badge></div>
                  <div className="flex justify-between"><span>Database System Concepts</span><Badge variant="purple">85 Issues</Badge></div>
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Daily Reader Visits & Fine Collection</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Visitors Logged Today</span><span className="font-bold text-slate-900">{kpis.visitorsToday} Readers</span></div>
                  <div className="flex justify-between"><span>Total Fine Collected</span><span className="font-bold text-emerald-600">₹{kpis.fineCollectionTotal.toLocaleString('en-IN')}</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: BOOK CATALOG & ENTERPRISE SEARCH */}
        {activeTab === 'catalog-search' && (
          <div className="space-y-6">
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Search by Title, Author, ISBN, Barcode or Subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">ISBN / Book ID</th>
                      <th className="p-3">Title & Subtitle</th>
                      <th className="p-3">Author(s)</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Available / Total</th>
                      <th className="p-3">Shelf / Floor</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <div className="font-mono font-bold text-sky-600">{b.isbn}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{b.bookId}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{b.title}</td>
                        <td className="p-3">{b.author}</td>
                        <td className="p-3"><Badge variant="neutral">{b.category}</Badge></td>
                        <td className="p-3 text-center font-bold text-slate-800">
                          {b.copiesAvailable} / {b.copiesTotal}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{b.shelf} ({b.floor})</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-sky-600 hover:bg-sky-700"
                            onClick={() => handleIssueBookCopy(b.id, b.title)}
                            disabled={b.copiesAvailable <= 0}
                          >
                            Issue Copy
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: CIRCULATION DESK */}
        {activeTab === 'issue-circulation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Issue & Return Circulation Desk</h2>
                <p className="text-xs text-slate-500">Active loans, renewals, overdue status and automated fine triggers.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Txn Code</th>
                    <th className="p-3.5">Book Title</th>
                    <th className="p-3.5">Borrower Details</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Fine Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-sky-600">{iss.transactionCode}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{iss.bookTitle}</td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-900">{iss.memberName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{iss.memberRollNo}</div>
                      </td>
                      <td className="p-3.5">{iss.issueDate}</td>
                      <td className="p-3.5 text-amber-600 font-medium">{iss.dueDate}</td>
                      <td className="p-3.5 font-bold text-emerald-600">₹{iss.fineAmount}</td>
                      <td className="p-3.5"><Badge variant="success">{iss.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: DIGITAL LIBRARY & E-BOOKS */}
        {activeTab === 'digital-library' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Digital Library & E-Resource Repository</h2>
                <p className="text-xs text-slate-500">IEEE Journals, research papers, lecture notes and previous question papers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {digitalResources.map((res) => (
                <Card key={res.id} className="p-5 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="purple">{res.type}</Badge>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{res.title}</h3>
                      <p className="text-xs text-slate-500">{res.author} • {res.publicationYear}</p>
                    </div>
                    <Bookmark className={`w-5 h-5 ${res.isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">{res.fileSize} • {res.downloadsCount} Downloads</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        logLibraryAction({
                          user: 'Student 2024CS108',
                          role: 'Student',
                          action: 'Downloaded E-Resource PDF',
                          book: res.title,
                          status: 'SUCCESS',
                        });
                        addToast('Downloading E-Resource...', `File ${res.resourceCode} downloading.`, 'info');
                      }}
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MEMBERSHIP & RFID CARDS */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Library Members & QR / RFID Access Cards</h2>
                <p className="text-xs text-slate-500">Student & Faculty member privileges, card expiration, and RFID reader tags.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {members.map((mem) => (
                <Card key={mem.id} className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-sky-400 font-bold uppercase">{mem.memberCardNo}</span>
                      <h3 className="text-lg font-extrabold">{mem.name}</h3>
                      <p className="text-xs text-slate-400">{mem.department} • {mem.role}</p>
                    </div>
                    <QrCode className="w-10 h-10 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-300">
                    <span>Issued Books: {mem.currentBooksIssued} / {mem.maxBooksAllowed}</span>
                    <Badge variant="success">{mem.membershipStatus}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FINES & PAYMENT LEDGER */}
        {activeTab === 'fines' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Fine Management & Financial Ledger</h2>
                <p className="text-xs text-slate-500">Overdue fines, lost book replacements, waivers, and direct ERP Finance sync.</p>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Fine Code</th>
                    <th className="p-3.5">Member Roll</th>
                    <th className="p-3.5">Book Title</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Fine Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fines.map((fn) => (
                    <tr key={fn.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-sky-600">{fn.fineCode}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{fn.memberName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{fn.memberRollNo}</div>
                      </td>
                      <td className="p-3.5 text-slate-800">{fn.bookTitle}</td>
                      <td className="p-3.5"><Badge variant="neutral">{fn.fineType}</Badge></td>
                      <td className="p-3.5 font-bold text-rose-600">₹{fn.amount}</td>
                      <td className="p-3.5"><Badge variant="warning">{fn.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 7: FACULTY PROCUREMENT */}
        {activeTab === 'procurement' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Faculty Book Procurement & Requisitions</h2>
                <p className="text-xs text-slate-500">Faculty recommendations, vendor purchase orders, and receiving inspection.</p>
              </div>
            </div>

            <div className="space-y-4">
              {procurement.map((pr) => (
                <Card key={pr.id} className="p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{pr.requestNumber}</span>
                      <Badge variant="purple">{pr.department}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{pr.bookTitle}</h4>
                    <p className="text-xs text-slate-500">Author: {pr.author} • Publisher: {pr.publisher}</p>
                    <p className="text-xs text-slate-600">Requisitioner: <span className="font-semibold">{pr.requestedBy}</span> ({pr.copiesRequested} Copies requested)</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="success">{pr.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: REPORTS & ANALYTICS */}
        {activeTab === 'reports-analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Library BI Reports & Audit Logging</h2>
                <p className="text-xs text-slate-500">Circulation statistics, lost volume reports, and real-time terminal audit events.</p>
              </div>
            </div>

            <Card className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-sky-400">Live Spring Boot stdout Audit Stream</span>
                <span>Logger: LibraryController</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p><span className="text-sky-400">[LIBRARY]</span> User : Aarav Sharma | Role : Librarian | Action : Issue Book | Book : Clean Code | Student : 2024CS101 | Status : SUCCESS | Duration : 45ms</p>
                <p><span className="text-sky-400">[LIBRARY]</span> User : Dr. Sunita Rao | Role : Teacher | Action : Submitted Book Procurement Request | Book : Quantum Computing | Status : SUCCESS | Duration : 22ms</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
