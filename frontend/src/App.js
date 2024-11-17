// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import HomePage from './components/HomePage';
import Properties from './components/Properties';
import AddTenants from './components/AddTenants';
import Pendings from './components/Pendings';
import Expenses from './components/ExpensePage';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Subscription from './components/Subscription';
import EditProperty from './components/EditProperty';
import AddProperty from './components/AddProperty';
import Profile from './components/Profile';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/properties" element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        } />

        <Route path="/addtenants/:propertyId/:tenantId?" element={
          <ProtectedRoute>
            <AddTenants />
          </ProtectedRoute>
        } />

        <Route path="/pendings/:propertyId" element={
          <ProtectedRoute>
            <Pendings />
          </ProtectedRoute>
        } />

        <Route path="/profile/:id" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Expenses route with propertyId and optional expenseId for add/edit functionality */}
        <Route path="/properties/:propertyId/expenses" element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } />
        <Route path="/properties/:propertyId/expenses/:expenseId?" element={
          <ProtectedRoute>
            <ExpenseForm />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

        <Route path="/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />

        <Route path="/editproperty/:id" element={
          <ProtectedRoute>
            <EditProperty />
          </ProtectedRoute>
        } />

        <Route path="/addproperty" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />

        <Route path="/addproperty/:id" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
