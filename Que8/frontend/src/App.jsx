import React, { useEffect, useState } from 'react'
import StudentList from './pages/StudentList'
import StudentForm from './pages/StudentForm'

export default function App(){
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <div style={{padding:20}}>
      <h1>Student CRUD</h1>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <StudentList onEdit={(s)=>setEditing(s)} refreshKey={refreshKey} />
        </div>
        <div style={{width:360}}>
          <StudentForm student={editing} onSaved={()=>{ setEditing(null); setRefreshKey(k=>k+1) }} />
        </div>
      </div>
    </div>
  )
}
