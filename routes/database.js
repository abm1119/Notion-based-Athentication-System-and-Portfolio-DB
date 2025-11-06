const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { 
  getAllUsers,
  getAllCaseStudiesComplete,
  getUserById,
  getCaseStudyById
} = require('../utils/notionHelper');

// Get all users from database (protected route)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users from database',
      error: error.message
    });
  }
});

// Get all case studies from database (protected route)
router.get('/case-studies', authenticateToken, async (req, res) => {
  try {
    const caseStudies = await getAllCaseStudiesComplete();
    res.json({
      success: true,
      caseStudies: caseStudies,
      count: caseStudies.length
    });
  } catch (error) {
    console.error('Error fetching all case studies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching case studies from database',
      error: error.message
    });
  }
});

// Get specific user details by ID (protected route)
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user details',
      error: error.message
    });
  }
});

// Get specific case study details by ID (protected route)
router.get('/case-studies/:id', authenticateToken, async (req, res) => {
  try {
    const caseStudy = await getCaseStudyById(req.params.id);
    res.json({
      success: true,
      caseStudy: caseStudy
    });
  } catch (error) {
    console.error('Error fetching case study details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching case study details',
      error: error.message
    });
  }
});

// Get database overview (protected route)
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const [users, caseStudies] = await Promise.all([
      getAllUsers(),
      getAllCaseStudiesComplete()
    ]);

    const overview = {
      users: {
        total: users.length,
        recent: users.slice(0, 5)
      },
      caseStudies: {
        total: caseStudies.length,
        byStatus: caseStudies.reduce((acc, cs) => {
          acc[cs.status] = (acc[cs.status] || 0) + 1;
          return acc;
        }, {}),
        recent: caseStudies.slice(0, 5)
      }
    };

    res.json({
      success: true,
      overview: overview
    });
  } catch (error) {
    console.error('Error fetching database overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching database overview',
      error: error.message
    });
  }
});

module.exports = router;