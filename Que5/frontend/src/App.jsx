import React, { useState, useEffect } from 'react'
import Profile from './pages/Profile'
import Leave from './pages/Leave'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [empId, setEmpId] = useState(localStorage.getItem('empId') || '')

  useEffect(()=>{
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    if (empId) localStorage.setItem('empId', empId)
    else localStorage.removeItem('empId')
  }, [token, empId])

  if (!token) return <Login onLogin={(t, id)=>{ setToken(t); setEmpId(id); }} />

  return (
    <div style={{padding:20}}>
      <h2>Employee Portal</h2>
      <p>Logged in: {empId} <button onClick={()=>{ setToken(''); setEmpId(''); }}>Logout</button></p>
      <nav>
        <button onClick={()=>window.renderPage='profile'}>Profile</button>
        <button onClick={()=>window.renderPage='leave'}>Leave Application</button>
      </nav>
      <div style={{marginTop:20}}>
        {window.renderPage==='leave' ? <Leave token={token} /> : <Profile token={token} />}
      </div>
    </div>
  )
}

function Login({ onLogin }){
  const [empId, setEmpId] = useState('EMP000001')
  const [password, setPassword] = useState('emppass')
  const [err, setErr] = useState('')

  async function submit(e){
    e.preventDefault()
    setErr('')
    try{
      const res = await fetch('http://localhost:3004/api/auth/login', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ empId, password }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j.message || 'Login failed')
      onLogin(j.token, empId)
      window.renderPage='profile'
    }catch(er){ setErr(er.message) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <form onSubmit={submit}>
        <label>EmpID: <input value={empId} onChange={e=>setEmpId(e.target.value)} /></label><br />
        <label>Password: <input value={password} onChange={e=>setPassword(e.target.value)} type="password"/></label><br />
        <button>Login</button>
      </form>
    </div>
  )
}
