# Enterprise Library REST API Specifications

## 1. REST Endpoints Catalog

### `GET /api/v1/library/books`
Search catalog by title, author, ISBN, barcode, or subject.

### `POST /api/v1/library/books`
Catalog a new book volume.

### `POST /api/v1/library/circulation/issue`
Issue a book copy to a student/faculty member.

### `POST /api/v1/library/circulation/return`
Process a returned book volume and compute fines.

### `GET /api/v1/library/digital-resources`
Fetch e-books, journals, and question papers.
