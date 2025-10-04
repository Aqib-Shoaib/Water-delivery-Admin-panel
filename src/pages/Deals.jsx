import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Deals() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/reminders?tab=deals', { replace: true })
  }, [navigate])
  return null
}
