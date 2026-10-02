import React, { useEffect, useState } from 'react'

export default function Profile({ token }){
  const [profile, setProfile] = useState(null)

  useEffect(()=>{
    fetch('http://localhost:3004/api/profile', { headers: { Authorization: 'Bearer '+token } })
      .then(r=>r.json()).then(setProfile).catch(()=>{})
  }, [token])

  if (!profile) return <div>Loading...</div>

  return (
    <div>
      <h3>Profile</h3>
      <table>
        <tbody>
          <tr><td>EmpID</td><td>{profile.empId}</td></tr>
          <tr><td>Name</td><td>{profile.name}</td></tr>
          <tr><td>Email</td><td>{profile.email}</td></tr>
          <tr><td>Base Salary</td><td>{profile.baseSalary}</td></tr>
        </tbody>
      </table>
    </div>
  )
}
