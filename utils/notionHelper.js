const { notion, databaseId } = require('../config/notion');

// Case Studies Database ID - will be set via environment variable
const caseStudiesDatabaseId = process.env.NOTION_CASE_STUDIES_DATABASE_ID;

/**
 * Create a new user in Notion database
 */
async function createUser(userData) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Email': {
          title: [
            {
              text: {
                content: userData.email,
              },
            },
          ],
        },
        'Password': {
          rich_text: [
            {
              text: {
                content: userData.password, // This should be hashed
              },
            },
          ],
        },
        'Full Name': {
          rich_text: [
            {
              text: {
                content: userData.fullName || '',
              },
            },
          ],
        },
        'Phone': {
          rich_text: [
            {
              text: {
                content: userData.phone || '',
              },
            },
          ],
        },
        'Created At': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating user in Notion:', error);
    throw error;
  }
}

/**
 * Find user by email in Notion database
 */
async function findUserByEmail(email) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Email',
        title: {
          equals: email,
        },
      },
    });

    if (response.results.length > 0) {
      const user = response.results[0];
      return {
        id: user.id,
        email: user.properties.Email.title[0]?.text.content || '',
        password: user.properties.Password.rich_text[0]?.text.content || '',
        fullName: user.properties['Full Name']?.rich_text[0]?.text.content || '',
        phone: user.properties.Phone?.rich_text[0]?.text.content || '',
        createdAt: user.properties['Created At']?.date?.start || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user in Notion:', error);
    throw error;
  }
}

/**
 * Update user details in Notion database
 */
async function updateUserDetails(pageId, userData) {
  try {
    const properties = {};

    if (userData.fullName) {
      properties['Full Name'] = {
        rich_text: [
          {
            text: {
              content: userData.fullName,
            },
          },
        ],
      };
    }

    if (userData.phone) {
      properties['Phone'] = {
        rich_text: [
          {
            text: {
              content: userData.phone,
            },
          },
        ],
      };
    }

    const response = await notion.pages.update({
      page_id: pageId,
      properties: properties,
    });

    return response;
  } catch (error) {
    console.error('Error updating user in Notion:', error);
    throw error;
  }
}

/**
 * Get user by page ID
 */
async function getUserById(pageId) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return {
      id: response.id,
      email: response.properties.Email.title[0]?.text.content || '',
      fullName: response.properties['Full Name']?.rich_text[0]?.text.content || '',
      phone: response.properties.Phone?.rich_text[0]?.text.content || '',
      createdAt: response.properties['Created At']?.date?.start || '',
    };
  } catch (error) {
    console.error('Error getting user from Notion:', error);
    throw error;
  }
}

/**
 * Create a new case study in Notion database
 */
async function createCaseStudy(caseStudyData) {
  try {
    const properties = {
      'Name ': {
        title: [
          {
            text: {
              content: caseStudyData.name,
            },
          },
        ],
      },
      'Project Details': {
        rich_text: [
          {
            text: {
              content: caseStudyData.projectDetails || '',
            },
          },
        ],
      },
      'Status': {
        status: {
          name: caseStudyData.status || 'Not Started',
        },
      },
      'Created At': {
        date: {
          start: new Date().toISOString(),
        },
      },
    };

    // Add Tags if provided
    if (caseStudyData.tags && caseStudyData.tags.length > 0) {
      properties['Tags'] = {
        multi_select: caseStudyData.tags.map(tag => ({ name: tag })),
      };
    }

    // Add Cover Image if provided
    if (caseStudyData.coverImage) {
      properties['Cover-image'] = {
        files: [
          {
            name: caseStudyData.coverImage.name || 'cover-image',
            external: {
              url: caseStudyData.coverImage.url,
            },
          },
        ],
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: caseStudiesDatabaseId },
      properties: properties,
    });
    return response;
  } catch (error) {
    console.error('Error creating case study in Notion:', error);
    throw error;
  }
}

/**
 * Get all case studies from Notion database (filtered for published ones)
 */
async function getAllCaseStudies() {
  try {
    const response = await notion.databases.query({
      database_id: caseStudiesDatabaseId,
      filter: {
        property: 'Status',
        status: {
          equals: 'Done'
        }
      },
      // Removed sorting by 'Created At' as the property doesn't exist in the database
      // sorts: [
      //   {
      //     property: 'Created At',
      //     direction: 'descending',
      //   },
      // ],
    });

    return response.results.map(page => ({
      id: page.id,
      name: page.properties['Name ']?.title[0]?.text.content || '',
      projectDetails: page.properties['Project Details']?.rich_text[0]?.text.content || '',
      tags: page.properties.Tags?.multi_select?.map(tag => tag.name) || [],
      coverImage: page.properties['Cover-image']?.files[0]?.external?.url || 
                  page.properties['Cover-image']?.files[0]?.file?.url || null,
      status: page.properties.Status?.status?.name || 'Not Started',
      createdAt: page.properties['Created At']?.date?.start || '',
    }));
  } catch (error) {
    console.error('Error getting case studies from Notion:', error);
    throw error;
  }
}

/**
 * Get ALL case studies from Notion database (no filters - for database viewing)
 */
async function getAllCaseStudiesComplete() {
  try {
    const response = await notion.databases.query({
      database_id: caseStudiesDatabaseId,
      // Removed sorting to ensure compatibility with all database schemas
    });

    return response.results.map(page => ({
      id: page.id,
      name: page.properties['Name ']?.title[0]?.text.content || '',
      projectDetails: page.properties['Project Details']?.rich_text[0]?.text.content || '',
      tags: page.properties.Tags?.multi_select?.map(tag => tag.name) || [],
      coverImage: page.properties['Cover-image']?.files[0]?.external?.url || 
                  page.properties['Cover-image']?.files[0]?.file?.url || null,
      status: page.properties.Status?.status?.name || 'Not Started',
      createdAt: page.properties['Created At']?.date?.start || '',
      url: page.url,
      lastEditedTime: page.last_edited_time,
      createdTime: page.created_time,
    }));
  } catch (error) {
    console.error('Error getting all case studies from Notion:', error);
    throw error;
  }
}

/**
 * Get ALL users from Notion database (for database viewing)
 */
async function getAllUsers() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      // Removed sorting to ensure compatibility with all database schemas
    });

    return response.results.map(page => ({
      id: page.id,
      email: page.properties.Email.title[0]?.text.content || '',
      fullName: page.properties['Full Name']?.rich_text[0]?.text.content || '',
      phone: page.properties.Phone?.rich_text[0]?.text.content || '',
      createdAt: page.properties['Created At']?.date?.start || '',
      url: page.url,
      lastEditedTime: page.last_edited_time,
      createdTime: page.created_time,
    }));
  } catch (error) {
    console.error('Error getting all users from Notion:', error);
    throw error;
  }
}

/**
 * Get case study by ID
 */
async function getCaseStudyById(pageId) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return {
      id: response.id,
      name: response.properties['Name ']?.title[0]?.text.content || '',
      projectDetails: response.properties['Project Details']?.rich_text[0]?.text.content || '',
      tags: response.properties.Tags?.multi_select?.map(tag => tag.name) || [],
      coverImage: response.properties['Cover-image']?.files[0]?.external?.url || 
                  response.properties['Cover-image']?.files[0]?.file?.url || null,
      status: response.properties.Status?.status?.name || 'Not Started',
      createdAt: response.properties['Created At']?.date?.start || '',
    };
  } catch (error) {
    console.error('Error getting case study from Notion:', error);
    throw error;
  }
}

/**
 * Update case study in Notion database
 */
async function updateCaseStudy(pageId, caseStudyData) {
  try {
    const properties = {};

    if (caseStudyData.name) {
      properties['Name '] = {
        title: [
          {
            text: {
              content: caseStudyData.name,
            },
          },
        ],
      };
    }

    if (caseStudyData.projectDetails) {
      properties['Project Details'] = {
        rich_text: [
          {
            text: {
              content: caseStudyData.projectDetails,
            },
          },
        ],
      };
    }

    if (caseStudyData.status) {
      properties['Status'] = {
        status: {
          name: caseStudyData.status,
        },
      };
    }

    if (caseStudyData.tags) {
      properties['Tags'] = {
        multi_select: caseStudyData.tags.map(tag => ({ name: tag })),
      };
    }

    if (caseStudyData.coverImage) {
      properties['Cover-image'] = {
        files: [
          {
            name: caseStudyData.coverImage.name || 'cover-image',
            external: {
              url: caseStudyData.coverImage.url,
            },
          },
        ],
      };
    }

    const response = await notion.pages.update({
      page_id: pageId,
      properties: properties,
    });

    return response;
  } catch (error) {
    console.error('Error updating case study in Notion:', error);
    throw error;
  }
}

/**
 * Delete case study from Notion database
 */
async function deleteCaseStudy(pageId) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    return response;
  } catch (error) {
    console.error('Error deleting case study from Notion:', error);
    throw error;
  }
}

/**
 * Get page blocks content from Notion page
 */
async function getPageBlocks(pageId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    
    // Process blocks to get nested content
    const processedBlocks = await Promise.all(
      response.results.map(async (block) => {
        const processedBlock = await processBlock(block);
        
        // If block has children, fetch them recursively
        if (block.has_children) {
          processedBlock.children = await getPageBlocks(block.id);
        }
        
        return processedBlock;
      })
    );
    
    return processedBlocks;
  } catch (error) {
    console.error('Error getting page blocks from Notion:', error);
    throw error;
  }
}

/**
 * Process individual block to extract content
 */
async function processBlock(block) {
  const processedBlock = {
    id: block.id,
    type: block.type,
    has_children: block.has_children,
    created_time: block.created_time,
    last_edited_time: block.last_edited_time,
  };

  // Extract content based on block type
  switch (block.type) {
    case 'paragraph':
      processedBlock.content = {
        rich_text: block.paragraph.rich_text,
        color: block.paragraph.color,
      };
      break;
    
    case 'heading_1':
      processedBlock.content = {
        rich_text: block.heading_1.rich_text,
        color: block.heading_1.color,
        is_toggleable: block.heading_1.is_toggleable,
      };
      break;
    
    case 'heading_2':
      processedBlock.content = {
        rich_text: block.heading_2.rich_text,
        color: block.heading_2.color,
        is_toggleable: block.heading_2.is_toggleable,
      };
      break;
    
    case 'heading_3':
      processedBlock.content = {
        rich_text: block.heading_3.rich_text,
        color: block.heading_3.color,
        is_toggleable: block.heading_3.is_toggleable,
      };
      break;
    
    case 'bulleted_list_item':
      processedBlock.content = {
        rich_text: block.bulleted_list_item.rich_text,
        color: block.bulleted_list_item.color,
      };
      break;
    
    case 'numbered_list_item':
      processedBlock.content = {
        rich_text: block.numbered_list_item.rich_text,
        color: block.numbered_list_item.color,
      };
      break;
    
    case 'to_do':
      processedBlock.content = {
        rich_text: block.to_do.rich_text,
        checked: block.to_do.checked,
        color: block.to_do.color,
      };
      break;
    
    case 'toggle':
      processedBlock.content = {
        rich_text: block.toggle.rich_text,
        color: block.toggle.color,
      };
      break;
    
    case 'code':
      processedBlock.content = {
        rich_text: block.code.rich_text,
        language: block.code.language,
        caption: block.code.caption,
      };
      break;
    
    case 'quote':
      processedBlock.content = {
        rich_text: block.quote.rich_text,
        color: block.quote.color,
      };
      break;
    
    case 'callout':
      processedBlock.content = {
        rich_text: block.callout.rich_text,
        icon: block.callout.icon,
        color: block.callout.color,
      };
      break;
    
    case 'divider':
      processedBlock.content = {};
      break;
    
    case 'image':
      processedBlock.content = {
        caption: block.image.caption,
        type: block.image.type,
        url: block.image.type === 'external' ? block.image.external.url : block.image.file.url,
      };
      break;
    
    case 'video':
      processedBlock.content = {
        caption: block.video.caption,
        type: block.video.type,
        url: block.video.type === 'external' ? block.video.external.url : block.video.file.url,
      };
      break;
    
    case 'file':
      processedBlock.content = {
        caption: block.file.caption,
        type: block.file.type,
        url: block.file.type === 'external' ? block.file.external.url : block.file.file.url,
        name: block.file.name,
      };
      break;
    
    case 'pdf':
      processedBlock.content = {
        caption: block.pdf.caption,
        type: block.pdf.type,
        url: block.pdf.type === 'external' ? block.pdf.external.url : block.pdf.file.url,
      };
      break;
    
    case 'bookmark':
      processedBlock.content = {
        url: block.bookmark.url,
        caption: block.bookmark.caption,
      };
      break;
    
    case 'embed':
      processedBlock.content = {
        url: block.embed.url,
        caption: block.embed.caption,
      };
      break;
    
    case 'table':
      processedBlock.content = {
        table_width: block.table.table_width,
        has_column_header: block.table.has_column_header,
        has_row_header: block.table.has_row_header,
      };
      break;
    
    case 'table_row':
      processedBlock.content = {
        cells: block.table_row.cells,
      };
      break;
    
    case 'column_list':
      processedBlock.content = {};
      break;
    
    case 'column':
      processedBlock.content = {};
      break;
    
    default:
      processedBlock.content = block[block.type] || {};
      break;
  }

  return processedBlock;
}

/**
 * Get case study with full page content (properties + blocks)
 */
async function getCaseStudyWithContent(pageId) {
  try {
    // Get basic page properties
    const caseStudy = await getCaseStudyById(pageId);
    
    // Get page blocks content
    const blocks = await getPageBlocks(pageId);
    
    return {
      ...caseStudy,
      blocks: blocks,
      hasContent: blocks.length > 0,
    };
  } catch (error) {
    console.error('Error getting case study with content from Notion:', error);
    throw error;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  updateUserDetails,
  getUserById,
  createCaseStudy,
  getAllCaseStudies,
  getAllCaseStudiesComplete,
  getAllUsers,
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
  getPageBlocks,
  processBlock,
  getCaseStudyWithContent,
};
