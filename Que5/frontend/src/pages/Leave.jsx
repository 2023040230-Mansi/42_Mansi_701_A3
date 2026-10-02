import React, { useEffect, useState } from 'react'

export default function Leave({ token }){
  const [leaves, setLeaves] = useState([])
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  async function load(){
    const res = await fetch('http://localhost:3004/api/leaves', { headers: { Authorization: 'Bearer '+token } })
    const j = await res.json()
    setLeaves(j)
  }

  useEffect(()=>{ load() }, [token])

  async function submit(e){
    e.preventDefault()
    await fetch('http://localhost:3004/api/leaves', { method:'POST', headers:{'content-type':'application/json', Authorization: 'Bearer '+token}, body: JSON.stringify({ date, reason }) })
    setDate(''); setReason('')
    load()
  }

  return (
    <div>
      <h3>Leave Application</h3>
      <form onSubmit={submit}>
        <label>Date: <input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><br />
        <label>Reason: <input value={reason} onChange={e=>setReason(e.target.value)} required/></label><br />
        <button>Apply</button>
      </form>

      <h4>Your Applications</h4>
      <ul>
        {leaves.map(l=> (
          <li key={l._id}>{new Date(l.date).toLocaleDateString()} - {l.reason} - {l.grant ? 'Granted' : 'Pending'}</li>
        ))}
      </ul>
    </div>
  )
}
