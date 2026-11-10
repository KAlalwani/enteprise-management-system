# Enterprise Management System

A web app for running a small business: sales and purchase invoices, stock, suppliers, customers, employee schedules and performance, automatic reminders, and exports to Excel and PDF.

## Overview

The app is server-rendered (Express + EJS) and stores its data in MongoDB. An **admin** sets up the enterprise and its employees. Employees then create an account with their employee ID and CPR, and sign in.

- Admins manage employees, shifts, absences, performance reviews, reminders and exports of employee data.
- Signed-in staff create sales and purchase invoices, manage products, services, suppliers and customers, and see their own schedule.
- Stock changes automatically when an invoice is created or cancelled.
- Every morning the app emails admins about low stock and upcoming salaries, and reminds clients about unpaid invoices by email and WhatsApp.

## Screenshots

Add your own screenshots to a `screenshots/` folder and link them here, for example:

<!--
![Home](./screenshots/home.png)
![Invoice](./screenshots/invoice.png)
![Staff overview](./screenshots/staff.png)
![Reminders](./screenshots/reminders.png)
-->

## Technologies Used

- Node.js and Express 5
- MongoDB with Mongoose
- EJS templates
- Tailwind CSS (built with the Tailwind CLI)
- express-session, bcrypt (authentication), express-rate-limit
- method-override (PUT and DELETE from HTML forms)
- multer (photo upload)
- ExcelJS and PDFKit (exports)
- Nodemailer (email), node-cron (daily schedule), Twilio (WhatsApp) *future features

See `package.json` for the full list.

## Getting Started

**Requirements:** Node.js, and a MongoDB database (a local server or a MongoDB Atlas cluster).

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
cp .env.example .env      # then fill in the values
npm run css               # builds public/css/style.css
node server.js
```

Open the address printed in the console.

### Environment variables

| Variable                            | Needed for                |
| ----------------------------------- | ------------------------- |
| `MONGODB_URI`, `SESSION_SECRET` | The app itself (required) |

First run

1. Open the home page and create the enterprise.
2. Go to `/employee/new` and create the first employee. While there are no employees, this page is open to anyone and the first employee becomes the **Admin**. Note the employee ID shown.
3. Go to `/auth/sign-up` and sign up with that employee ID and CPR.
4. From then on, only admins can add employees. Each new employee signs up with the ID the app generated for them and their CPR.

### Styling

Styles live in `src/input.css`. After changing styles or adding Tailwind classes to a view, run `npm run css` (or `npm run css:watch` while developing) and commit the rebuilt `public/css/style.css`.

## User Stories

**Admin**

- As an admin, I set up the enterprise's name, roles and departments so the rest of the system uses them.
- As an admin, I add and edit employees, with their photo, so each person can sign up.
- As an admin, I record shifts, absences and monthly performance ratings so I can see how my team is doing.
- As an admin, I see which products are low on stock and which client invoices are overdue.
- As an admin, I cancel an invoice and the stock is returned automatically.
- As an admin, I export invoices, products and employees to Excel.

**Staff**

- As an employee, I sign up with my employee ID and CPR, then sign in.
- As an employee, I create sales and purchase invoices and record payments.
- As an employee, I manage products (with photos), services, suppliers and customers.
- As an employee, I see my own upcoming shifts, absences and reviews.
- As an employee, I download an invoice as a PDF.

Database Design

![]()![1794282316465](image/README/1794282316465.png)![]()

![]()

| Collection        | Main fields                                                                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise        | name, features, roles, departments, salariesDate                                                                                                                                                                                                  |
| User              | username, password (hashed)                                                                                                                                                                                                                       |
| Employee          | user, name, id, role, department, salary, CPR, phoneNumber, IBAN, email, experience, photo                                                                                                                                                        |
| Customer          | name, phone, email, whatsappOptIn                                                                                                                                                                                                                 |
| Supplier          | name, email, phoneNumber, IBAN                                                                                                                                                                                                                    |
| Product           | name, supplier, stock, reorderLevel, unitPrice (cost), price, category, photo                                                                                                                                                                     |
| Service           | name, category, price                                                                                                                                                                                                                             |
| Invoice           | invoiceNumber, transactionType (Sale/Purchase), customer or supplier, items (product or service, name, quantity, unitPrice, subtotal), totalAmount, amountPaid, paymentStatus, status (Active/Cancelled), transactionDate, description, createdBy |
| Shift             | employee, date, startTime, endTime, notes                                                                                                                                                                                                         |
| Absence           | employee, startDate, endDate, type, reason                                                                                                                                                                                                        |
| PerformanceReview | employee, period (YYYY-MM), rating (1-5), notes, reviewedBy                                                                                                                                                                                       |

## Routes

Access: **Public** = anyone, **Signed in** = any signed-in user, **Admin** = admin role only.

### Home and authentication

| Method | Route          | Description                                                              | Access |
| ------ | -------------- | ------------------------------------------------------------------------ | ------ |
| GET    | /              | Home page (shows the enterprise setup form until one exists)             | Public |
| GET    | /auth/sign-up  | Sign-up form                                                             | Public |
| POST   | /auth/sign-up  | Create an account linked to an employee (employee ID and CPR must match) | Public |
| GET    | /auth/sign-in  | Sign-in form                                                             | Public |
| POST   | /auth/sign-in  | Sign in (10 attempts per 15 minutes)                                     | Public |
| GET    | /auth/sign-out | Sign out                                                                 | Public |

### Enterprise

| Method | Route                | Description                                 | Access |
| ------ | -------------------- | ------------------------------------------- | ------ |
| POST   | /enterprise          | Create the enterprise (only if none exists) | Public |
| GET    | /enterprise          | View enterprise details                     | Admin  |
| GET    | /enterprise/:id/edit | Edit form                                   | Admin  |
| PUT    | /enterprise/:id      | Update enterprise                           | Admin  |
| DELETE | /enterprise/:id      | Delete enterprise                           | Admin  |

### Employees

| Method | Route              | Description                                                                                  | Access |
| ------ | ------------------ | -------------------------------------------------------------------------------------------- | ------ |
| GET    | /employee/new      | New employee form (open to anyone while no employee exists)                                  | Admin  |
| GET    | /employee          | List employees                                                                               | Admin  |
| POST   | /employee          | Create employee, generate the employee ID, optional photo (the first employee becomes Admin) | Admin  |
| GET    | /employee/:id      | Employee details                                                                             | Admin  |
| GET    | /employee/:id/edit | Edit form                                                                                    | Admin  |
| PUT    | /employee/:id      | Update employee, optional new photo                                                          | Admin  |
| DELETE | /employee/:id      | Delete employee and their shifts, absences and reviews                                       | Admin  |

### Products, services, suppliers and customers

The same seven routes exist for `/products`, `/services`, `/suppliers` and `/customers`. Products also take a photo and a reorder level, and customers have the WhatsApp opt-in.

| Method | Route              | Description | Access    |
| ------ | ------------------ | ----------- | --------- |
| GET    | /products          | List        | Signed in |
| GET    | /products/new      | New form    | Signed in |
| POST   | /products          | Create      | Signed in |
| GET    | /products/:id      | Details     | Signed in |
| GET    | /products/:id/edit | Edit form   | Signed in |
| PUT    | /products/:id      | Update      | Signed in |
| DELETE | /products/:id      | Delete      | Admin     |

### Invoices

| Method | Route                         | Description                                | Access    |
| ------ | ----------------------------- | ------------------------------------------ | --------- |
| GET    | /invoices                     | List invoices                              | Signed in |
| GET    | /invoices/new                 | New invoice form                           | Signed in |
| POST   | /invoices                     | Create a sale or purchase and update stock | Signed in |
| GET    | /invoices/:invoiceId          | Invoice details                            | Signed in |
| POST   | /invoices/:invoiceId/payments | Record a payment                           | Signed in |
| GET    | /invoices/:invoiceId/edit     | Edit form (description only)               | Signed in |
| PUT    | /invoices/:invoiceId          | Update the description                     | Signed in |
| DELETE | /invoices/:invoiceId          | Cancel the invoice and restore stock       | Admin     |

### Staff

The `shifts`, `absences` and `reviews` sections each have the same set of routes; only shifts are listed.

| Method | Route             | Description                                      | Access    |
| ------ | ----------------- | ------------------------------------------------ | --------- |
| GET    | /staff/me         | My shifts, absences and reviews                  | Signed in |
| GET    | /staff            | Overview: absences this month and average rating | Admin     |
| GET    | /staff/shifts     | Upcoming shifts                                  | Admin     |
| GET    | /staff/shifts/new | New shift form                                   | Admin     |
| POST   | /staff/shifts     | Create a shift (overlaps are rejected)           | Admin     |
| DELETE | /staff/shifts/:id | Delete a shift                                   | Admin     |

### Reminders, exports, uploads and operations

| Method | Route                    | Description                              | Access    |
| ------ | ------------------------ | ---------------------------------------- | --------- |
| GET    | /reminders               | Low stock, overdue invoices, next payday | Admin     |
| POST   | /reminders/run           | Send reminders now                       | Admin     |
| GET    | /export/invoices/xlsx    | All invoices and line items as Excel     | Signed in |
| GET    | /export/invoices/:id/pdf | One invoice as PDF                       | Signed in |
| GET    | /export/products/xlsx    | Products and stock as Excel              | Signed in |
| GET    | /export/products/pdf     | Products and stock as PDF                | Signed in |
| GET    | /export/employees/xlsx   | Employees as Excel (no CPR or IBAN)      | Admin     |
| GET    | /uploads/:filename       | Serve an uploaded photo                  | Signed in |
| GET    | /operations              | Quick links page                         | Signed in |

## Features

- Authentication tied to employee records, with an admin role and rate-limited sign-in
- Sales and purchase invoices with atomic stock updates, partial payments, description edits and cancellation that restores stock
- Products with supplier, cost and selling price, reorder level and photo; services, suppliers and customers
- Employee shifts (no overlaps), absences and monthly performance reviews, plus a personal schedule page
- Photo upload for employees and products (JPG, PNG or WebP, up to 2 MB)
- Export to Excel (invoices, products, employees) and PDF (invoices, products)
- Validation and error pages, Tailwind styling

## Future Enhancements

- Edit invoice line items (today you cancel and create a new invoice)
- Refunds when cancelling a paid invoice
- Stop deletion of products, suppliers and customers that invoices still use
- Search, filters and pagination on lists, and date ranges for exports
- Arabic text in PDF exports (needs an embedded Arabic font)
- WhatsApp delivery status and customer replies
- Salary reminders to each employee, and a payroll record
- Role changes that apply without signing in again

## Credits

- Developed by Khadija
- [Express](https://expressjs.com/), [Mongoose](https://mongoosejs.com/), [EJS](https://ejs.co/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ExcelJS](https://github.com/exceljs/exceljs), [PDFKit](https://pdfkit.org/), [Nodemailer](https://nodemailer.com/), [node-cron](https://github.com/node-cron/node-cron)
