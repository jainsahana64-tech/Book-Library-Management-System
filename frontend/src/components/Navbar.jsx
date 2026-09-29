import React from 'react';
import { BookOpen, PlusCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout, onOpenAddBook }) {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="brand-icon-wrapper">
          <BookOpen size={24} />
        </div>
        <div>
          <span className="brand-title">GlowLogic</span>
          <span className="brand-badge">Library</span>
        </div>
      </div>

      <div className="nav-actions">
        <button
          className="btn btn-primary"
          id="btn-add-book"
          onClick={onOpenAddBook}
          title="Add a new book to the library"
        >
          <PlusCircle size={18} />
          <span>Add Book</span>
        </button>

        {user ? (
          <div className="nav-actions">
            <div className="user-pill" title={`Logged in as ${user.email}`}>
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{user.name}</span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              id="btn-logout"
              onClick={onLogout}
              title="Log out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            className="btn btn-secondary"
            id="btn-open-login"
            onClick={onOpenAuth}
          >
            <LogIn size={18} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
