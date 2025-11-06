const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getUserById, updateUserDetails } = require('../utils/notionHelper');

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// Update user details (protected route)
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field (fullName or phone) is required' 
      });
    }

    await updateUserDetails(req.user.userId, { fullName, phone });

    const updatedUser = await getUserById(req.user.userId);

    res.json({
      success: true,
      message: 'User details updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
      }
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user details',
      error: error.message
    });
  }
});

module.exports = router;
