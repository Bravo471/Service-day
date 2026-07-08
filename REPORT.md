# Service Day Dashboard - Project Report

## 1. Introduction
The Service Day Dashboard is a front-end Angular application that supports two main user roles: employees and administrators. Employees can browse approved NGO activities, register for events, change or cancel registrations, and check in using QR tokens. Administrators can manage NGO activities, monitor participation, send reminders, and generate QR codes.

## 2. Technologies Used
- Angular 17+
- TypeScript
- HTML5 and CSS3
- RxJS
- Angular Router
- Angular Forms
- angularx-qrcode
- Node.js and npm

## 3. Justification of Technologies
Angular was chosen because it supports modular architecture, dependency injection, reusable components, and structured routing for modern web applications. TypeScript improves code reliability by providing static typing. RxJS enables asynchronous data handling and responsive UI updates, which is essential for mock API interactions. QR code support was included with angularx-qrcode to meet the assignment’s check-in requirement.

## 4. Installation and Setup
1. Install Node.js from the official website.
2. Open PowerShell in the project folder.
3. Run `npm install`.
4. Start the app with `npx ng serve --host 0.0.0.0`.
5. Open the local URL shown in the terminal.

## 5. User Manual
### Employee Functions
- Login using a demo employee account.
- Open Opportunities to view approved activities and register before cut-off.
- Open My Registration to change or cancel a registration.
- Open Check-In to enter a QR code token and mark attendance.

### Administrator Functions
- Login as the admin demo account.
- Open Manage NGOs to add, edit, or delete NGO activities.
- Open Monitoring to view participation stats and registration records.
- Open Notifications to schedule reminder messages and send broadcasts.
- Open QR Codes to generate or regenerate QR tokens for each activity.

## 6. Conclusion
The completed dashboard meets the assignment’s core requirements for a client-side Angular application using modular design, mock data, responsive UI, asynchronous services, and role-based workflows.
