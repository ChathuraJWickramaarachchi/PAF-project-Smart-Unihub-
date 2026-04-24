import React from 'react'
import { Outlet } from 'react-router-dom'
import UserSidebar from '../components/UserSidebar'

export default function UserLayout() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <UserSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
