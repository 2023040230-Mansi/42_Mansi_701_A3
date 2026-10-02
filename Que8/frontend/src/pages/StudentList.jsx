import React, { useEffect, useState } from 'react'

export default function StudentList({ onEdit, refreshKey }){
  const [students, setStudents] = useState([])

  useEffect(()=>{ fetchStudents() }, [refreshKey])

  async function fetchStudents(){
    const r = await fetch('http://localhost:3015/api/students')
    const j = await r.json()
    setStudents(j)
  }

  async function del(id){
    if (!confirm('Delete student?')) return
    await fetch('http://localhost:3015/api/students/'+id, { method:'DELETE' })
    fetchStudents()
  }

  return (
    <div>
      <h3>Students</h3>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr><th>Name</th><th>Age</th><th>Course</th><th>Year</th><th></th></tr></thead>
        <tbody>
          {students.map(s=> (
            <tr key={s.id} style={{borderTop:'1px solid #ddd'}}>
              <td>{s.name}</td>
              <td>{s.age}</td>
              <td>{s.course}</td>
              <td>{s.year}</td>
              <td>
                <button onClick={()=>onEdit(s)}>Edit</button>
                <button onClick={()=>del(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
