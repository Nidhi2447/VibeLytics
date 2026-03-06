const router = require('express').Router()

const DEMO_TEACHER = {
  id: 'teacher-001',
  name: 'Dr. Sarah Miller',
  role: 'Head Teacher',
  school: 'Springfield High School',
  section: 'Section 10-B',
  plan: 'pro',
  alertPreferences: {
    lowEngagement: true,
    confusionSpikes: true,
    studentOffline: true
  },
  engagementAlertThreshold: 40
}

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email === 'sarah@vibelytics.app' && password === 'demo123') {
    res.json({ success: true, teacher: DEMO_TEACHER, token: 'vibelytics-demo-token' })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

router.get('/me', (req, res) => {
  res.json({ teacher: DEMO_TEACHER })
})

module.exports = router
