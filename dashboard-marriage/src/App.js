import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import Dashboard, { CompletedPage, EidGreetingsPage, BirthdayPage } from './Dashboard';
import AdminsPage from './Dashboard/pages/AdminsPage';
import LoveMessagesPage from './Dashboard/pages/LoveMessagesPage';
import TemplatesPage from './Dashboard/pages/TemplatesPage';
import { ToastProvider } from './components/ToastProvider';
import './App.css';

const EditorRoute = ({ component: Component }) => {
  const [searchParams] = useSearchParams();
  const studioMode = searchParams.get('studio') === '1';
  return <Component embedded={studioMode} studioMode={studioMode} />;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/completed" replace />} />
          <Route path="/dashboard" element={<Navigate to="/completed" replace />} />
          <Route path="/completed" element={<CompletedPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/invitations" element={<Navigate to="/completed" replace />} />
          <Route path="/invitations/new" element={<EditorRoute component={Dashboard} />} />
          <Route path="/eid-greetings" element={<Navigate to="/completed" replace />} />
          <Route path="/eid-greetings/new" element={<EditorRoute component={EidGreetingsPage} />} />
          <Route path="/birthday-greetings" element={<Navigate to="/completed" replace />} />
          <Route path="/birthday-greetings/new" element={<EditorRoute component={BirthdayPage} />} />
          <Route path="/love-messages" element={<Navigate to="/completed" replace />} />
          <Route path="/love-messages/new" element={<EditorRoute component={LoveMessagesPage} />} />
          <Route path="/settings" element={<AdminsPage />} />
          <Route path="*" element={<Navigate to="/completed" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
