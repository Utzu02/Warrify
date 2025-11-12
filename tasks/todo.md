# Warrify Feature Implementation - Todo List

## 📋 Requirements Analysis
Date: November 12, 2025
Status: Planning Phase

---

## ✅ Todo Items

### 1. Authentication & Security Updates
- [ ] 1.1. Implement JWT authentication system
  - [ ] Create JWT generation on login (backend)
  - [ ] Create JWT verification middleware (backend)
  - [ ] Replace UID cookie with JWT token
  - [ ] Update userMiddleware.js to verify JWT instead of x-user-id
  - [ ] Store JWT in httpOnly cookie for security
- [ ] 1.2. Add username field to User schema
- [ ] 1.3. Update register endpoint to accept username
- [ ] 1.4. Update login endpoint to accept username OR email
- [ ] 1.5. Fix "Member since" to only set on registration (account_created_at)

### 2. Gmail Integration & Profile Updates
- [ ] 2.1. Add "Login with Gmail" button to Profile page
- [ ] 2.2. Store Google token persistently (decide: localStorage vs httpOnly cookie)
- [ ] 2.3. Auto-use stored token when clicking "Start scan"
- [ ] 2.4. Show "Please login first to Gmail" if no token exists
- [ ] 2.5. Add default settings configuration section in Profile
- [ ] 2.6. Create "Use default settings" button in Gmail config

### 3. Gmail Config UI Improvements
- [ ] 3.1. Convert Gmail config to popup/modal (not separate page)
- [ ] 3.2. Set default date range: today → 1 week from now
- [ ] 3.3. Add tooltip to "Number of documents to scan" explaining max PDFs
- [ ] 3.4. Add "Use default settings" button

### 4. Manual Import Validation
- [ ] 4.1. Create backend endpoint to validate if PDF is warranty
- [ ] 4.2. Call validation endpoint when manual import is submitted
- [ ] 4.3. Show alert "This is not a warranty" if validation fails

### 5. Warranties Table View
- [ ] 5.1. Convert warranty cards to table layout
- [ ] 5.2. Add table headers: PDF name, Provider, Purchased, Expires, Is Expired
- [ ] 5.3. Add "Is Expired" calculation (compare expiry with current date)
- [ ] 5.4. Add checkboxes for each row
- [ ] 5.5. Add "View more" button with icon → opens modal
- [ ] 5.6. Create preview/download modal for warranty details
- [ ] 5.7. Implement "Load more" pagination
- [ ] 5.8. Add global "Export XLS" button
- [ ] 5.9. Implement XLS export functionality (selected or all items)

### 6. Dashboard UI Fixes
- [ ] 6.1. Reorder: Show "Managed warranties" before "Remaining warranties"
- [ ] 6.2. Fix non-working filter buttons
- [ ] 6.3. Ensure filters work with new table view

### 7. Global Styling
- [x] 7.1. Change font to Poppins across all pages
- [x] 7.2. Update CSS files with font-family: 'Poppins', sans-serif
- [x] 7.3. Add Poppins import to index.html or CSS

### 8. Security Review
- [ ] 8.1. Review all code changes for security vulnerabilities
- [ ] 8.2. Ensure no sensitive data in frontend
- [ ] 8.3. Verify .env is in .gitignore
- [ ] 8.4. Check JWT implementation follows best practices
- [ ] 8.5. Verify Google token storage is secure

### 9. Testing & Validation
- [ ] 9.1. Test JWT authentication flow
- [ ] 9.2. Test Gmail login from Profile
- [ ] 9.3. Test default settings functionality
- [ ] 9.4. Test table view with pagination
- [ ] 9.5. Test export XLS functionality
- [ ] 9.6. Test on mobile (verify all changes work)

### 10. Final Review
- [ ] 10.1. Check for syntax errors
- [ ] 10.2. Run linter/formatter
- [ ] 10.3. Test on Railway deployment
- [ ] 10.4. Update documentation

---

## ❓ Questions for Clarification - ANSWERED ✅

1. **JWT Storage** - ✅ httpOnly cookie (with mobile browser compatibility check)
2. **Default Settings** - ✅ maxResults and date ranges (start/end)
3. **Table Pagination** - ✅ 15 warranties initial, 15 more on "Load more"
4. **Export XLS** - ✅ Only selected warranties + "Select All" checkbox in header
5. **Google Token Storage** - ✅ httpOnly cookie (secure)
6. **Is Expired Logic** - ✅ Show "N/A" if expiry date is missing

---

## 📝 Notes
- All changes should be simple and impact minimal code
- Security is priority #1
- Follow Mark Zuckerberg's principle: Move fast but don't break things
- Everything should be production-ready

---

## 🔒 Security Checklist (Pre-Push)
- [ ] No API keys in frontend code
- [ ] No passwords in code
- [ ] .env file in .gitignore
- [ ] JWT secret is strong and secure
- [ ] Sensitive tokens in httpOnly cookies
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (React handles most)

