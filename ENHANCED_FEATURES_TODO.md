# Enhanced Features Implementation TODO

## Feature 1: Payslip Breakdowns with Plain-English Explanations
- [x] Create database migration for payslip breakdown fields
- [x] Update Payslip model with new fields
- [x] Update payslip controller to handle breakdown data
- [x] Create payslip explanations utility
- [x] Create PayslipBreakdown component
- [x] Update PayslipList component with breakdown view
- [x] Update UploadPayslip component for admin

## Feature 2: Document Upload + Automated Reminders
- [ ] Create database migration for document tracking fields
- [ ] Update Document model with expiry and status fields
- [ ] Create document reminder service with cron jobs
- [ ] Update document controller with reminder endpoints
- [ ] Create DocumentStatus component
- [ ] Update document upload form with expiry date
- [ ] Add notification banner for missing documents
- [ ] Update email service with document reminder templates

## Feature 3: Push Notifications System
- [ ] Create notifications table migration
- [ ] Create Notification model
- [ ] Create notification service
- [ ] Add notification routes
- [ ] Install socket.io dependencies
- [ ] Set up WebSocket server
- [ ] Create NotificationCenter component
- [ ] Create notification client utility
- [ ] Add toast notifications
- [ ] Integrate notifications across app

## Feature 4: Chatbot/FAQ System
- [ ] Create FAQ table migration
- [ ] Create FAQ model
- [ ] Seed FAQ database with content
- [ ] Create chatbot service
- [ ] Add chatbot/FAQ routes
- [ ] Create Chatbot widget component
- [ ] Create FAQ page
- [ ] Add knowledge base integration

## General Updates
- [ ] Update server.js with new routes
- [ ] Install new dependencies
- [ ] Update documentation
- [ ] Test all features
