import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'Main',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: () => (
          <svg className="sidebar-nav__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0 8h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm0-12h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z" />
          </svg>
        ),
      },
      {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: () => (
          <svg className="sidebar-nav__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      {
        name: 'Chat Assistant',
        href: '/dashboard/chat',
        icon: () => (
          <svg className="sidebar-nav__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        ),
      },
      {
        name: 'Document Analysis',
        href: '/dashboard/documents',
        icon: () => (
          <svg className="sidebar-nav__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        name: 'Profile',
        href: '/dashboard/profile',
        icon: () => (
          <svg className="sidebar-nav__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        ),
      },
      {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: () => (
          <svg className="sidebar-nav__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="sidebar-nav">
      {navigation.map((group, groupIdx) => (
        <Fragment key={group.title}>
          <h3 className="sidebar-nav__group-title">{group.title}</h3>
          <ul className="sidebar-nav__list">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="sidebar-nav__item">
                  <Link
                    href={item.href}
                    className={`sidebar-nav__link ${
                      isActive ? 'sidebar-nav__link--active' : ''
                    }`}
                  >
                    <item.icon />
                    <span className="sidebar-nav__text">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Fragment>
      ))}
      
      <div className="sidebar-footer">
        <div className="user-menu">
          <div className="user-menu__avatar">JD</div>
          <div className="user-menu__info">
            <div className="user-menu__name">John Doe</div>
            <div className="user-menu__role">Administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
}