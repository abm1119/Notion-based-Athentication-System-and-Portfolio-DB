const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { 
  createCaseStudy, 
  getAllCaseStudies, 
  getCaseStudyById, 
  updateCaseStudy, 
  deleteCaseStudy,
  getCaseStudyWithContent 
} = require('../utils/notionHelper');

// Get all case studies (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const caseStudies = await getAllCaseStudies();
    res.json({
      success: true,
      caseStudies: caseStudies
    });
  } catch (error) {
    console.error('Error fetching case studies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching case studies',
      error: error.message
    });
  }
});

// Get single case study by ID (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const includeContent = req.query.includeContent === 'true';
    
    let caseStudy;
    if (includeContent) {
      caseStudy = await getCaseStudyWithContent(req.params.id);
    } else {
      caseStudy = await getCaseStudyById(req.params.id);
    }
    
    if (!caseStudy) {
      return res.status(404).json({ 
        success: false, 
        message: 'Case study not found' 
      });
    }
    
    res.json({
      success: true,
      caseStudy: caseStudy
    });
  } catch (error) {
    console.error('Error fetching case study:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching case study',
      error: error.message
    });
  }
});

// Create new case study (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, projectDetails, tags, coverImage, status } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Case study name is required' 
      });
    }

    const caseStudyData = {
      name,
      projectDetails: projectDetails || '',
      tags: tags || [],
      coverImage: coverImage || null,
      status: status || 'Not Started'
    };

    const newCaseStudy = await createCaseStudy(caseStudyData);
    
    res.status(201).json({
      success: true,
      message: 'Case study created successfully',
      caseStudy: {
        id: newCaseStudy.id,
        ...caseStudyData
      }
    });
  } catch (error) {
    console.error('Error creating case study:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating case study',
      error: error.message
    });
  }
});

// Update case study (protected route)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, projectDetails, tags, coverImage, status } = req.body;
    
    // Build update data object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (projectDetails !== undefined) updateData.projectDetails = projectDetails;
    if (tags !== undefined) updateData.tags = tags;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields provided for update' 
      });
    }

    await updateCaseStudy(req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Case study updated successfully',
      caseStudy: {
        id: req.params.id,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating case study:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating case study',
      error: error.message
    });
  }
});

// Delete case study (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteCaseStudy(req.params.id);
    
    res.json({
      success: true,
      message: 'Case study deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting case study:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting case study',
      error: error.message
    });
  }
});

module.exports = router;