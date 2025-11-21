import { Router, Request, Response } from 'express';
import emailService from '../services/emailService';

const router = Router();

// Test email endpoint - REMOVE IN PRODUCTION
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('🧪 Testing email service...');
    
    const result = await emailService.sendVerificationEmail(email, 'test-token-123');
    
    if (result) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully! Check your inbox.' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send email. Check server logs for details.' 
      });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
