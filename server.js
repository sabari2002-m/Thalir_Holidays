require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Thalir_Holidays';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Thalir2026';

function getBasicAuthCredentials(authHeader) {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  try {
    const base64Value = authHeader.slice(6);
    const decoded = Buffer.from(base64Value, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch (error) {
    return null;
  }
}

function requireAdminAuth(req, res, next) {
  const credentials = getBasicAuthCredentials(req.headers.authorization);

  if (!credentials) {
    res.status(401).json({ success: false, message: 'Admin authentication required' });
    return;
  }

  if (credentials.username !== ADMIN_USERNAME || credentials.password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    return;
  }

  next();
}

// SendGrid Email configuration
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Free alternative notification channel via Telegram Bot API
async function sendTelegramNotification(bookingData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  const message = [
    'New Booking - Thalir Holidays',
    `Booking ID: #${bookingData.booking_id}`,
    `Name: ${bookingData.customer_name}`,
    `Email: ${bookingData.email}`,
    `Phone: ${bookingData.phone}`,
    `Package: ${bookingData.package_title || 'General Inquiry'}`,
    `Travel Date: ${bookingData.travel_date}`,
    `Adults: ${bookingData.num_adults}`,
    `Children: ${bookingData.num_children || 0}`,
    `Special Requests: ${bookingData.special_requests || 'None'}`,
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('Telegram notification failed:', body);
      return false;
    }

    console.log('Booking notification sent successfully via Telegram');
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

// Function to send booking notification (SendGrid first, Telegram fallback)
async function sendBookingNotification(bookingData) {
  const msg = {
    to: process.env.NOTIFICATION_EMAIL || 'sabarimanickaraj269@gmail.com',
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thalirholidays.com',
    subject: `🎉 New Booking - ${bookingData.customer_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #4CAF50; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">🌴Thalir Holidays Booking! 🌴</h2>
        <hr style="border: 1px solid #4CAF50;">
        
        <h3 style="color: #333;">Customer Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 40%;">Name:</td>
            <td style="padding: 8px;">${bookingData.customer_name}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;">${bookingData.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Phone:</td>
            <td style="padding: 8px;">${bookingData.phone}</td>
          </tr>
        </table>

        <h3 style="color: #333; margin-top: 20px;">Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold; width: 40%;">Package:</td>
            <td style="padding: 8px;">${bookingData.package_title || 'General Inquiry'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Travel Date:</td>
            <td style="padding: 8px;">${bookingData.travel_date}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Adults:</td>
            <td style="padding: 8px;">${bookingData.num_adults}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Children:</td>
            <td style="padding: 8px;">${bookingData.num_children || 0}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Special Requests:</td>
            <td style="padding: 8px;">${bookingData.special_requests || 'None'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Booking ID:</td>
            <td style="padding: 8px;"><strong>#${bookingData.booking_id}</strong></td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Submitted At:</td>
            <td style="padding: 8px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
          <p style="margin: 0; color: #856404;"><strong>⚡ Action Required:</strong> Please contact the customer at <strong>${bookingData.phone}</strong> or reply to <strong>${bookingData.email}</strong></p>
        </div>

        <footer style="margin-top: 20px; text-align: center; color: #777; font-size: 12px;">
          <p>This is an automated notification from Thalir Holidays booking system</p>
          <p>📞 Contact: ${process.env.NOTIFICATION_PHONE || '7904004742'}</p>
        </footer>
      </div>
    `
  };

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg);
      console.log('Booking notification email sent successfully via SendGrid');
      return true;
    } else {
      console.log('SendGrid not configured. Trying Telegram notification.');
      const telegramSent = await sendTelegramNotification(bookingData);
      if (telegramSent) {
        return true;
      }

      console.log('No notification channel configured. Booking details:', bookingData);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }

    // Fallback to Telegram when SendGrid errors out (e.g., credits exceeded)
    const telegramSent = await sendTelegramNotification(bookingData);
    return telegramSent;
  }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
    return;
  }

  res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Get all destinations
app.get('/api/destinations', (req, res) => {
  db.all('SELECT * FROM destinations ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get destination by ID
app.get('/api/destinations/:id', (req, res) => {
  db.get('SELECT * FROM destinations WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Get all packages
app.get('/api/packages', (req, res) => {
  const query = `
    SELECT p.*, d.name as destination_name, d.state 
    FROM packages p 
    LEFT JOIN destinations d ON p.destination_id = d.id 
    ORDER BY d.name, p.price
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get packages by destination
app.get('/api/packages/destination/:destinationId', (req, res) => {
  const query = `
    SELECT p.*, d.name as destination_name, d.state 
    FROM packages p 
    LEFT JOIN destinations d ON p.destination_id = d.id 
    WHERE p.destination_id = ?
  `;
  
  db.all(query, [req.params.destinationId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get package by ID
app.get('/api/packages/:id', (req, res) => {
  const query = `
    SELECT p.*, d.name as destination_name, d.state, d.description as dest_description 
    FROM packages p 
    LEFT JOIN destinations d ON p.destination_id = d.id 
    WHERE p.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { 
    package_id, 
    customer_name, 
    email, 
    phone, 
    travel_date, 
    num_adults, 
    num_children, 
    special_requests 
  } = req.body;

  // Validation
  if (!customer_name || !email || !phone || !travel_date || !num_adults) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const query = `
    INSERT INTO bookings 
    (package_id, customer_name, email, phone, travel_date, num_adults, num_children, special_requests) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [package_id, customer_name, email, phone, travel_date, num_adults, num_children || 0, special_requests || ''],
    async function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const bookingId = this.lastID;
      
      // Get package details for email notification
      const packageQuery = `
        SELECT p.title, d.name as destination_name
        FROM packages p
        LEFT JOIN destinations d ON p.destination_id = d.id
        WHERE p.id = ?
      `;
      
      db.get(packageQuery, [package_id], async (err, packageInfo) => {
        const bookingData = {
          booking_id: bookingId,
          customer_name,
          email,
          phone,
          travel_date,
          num_adults,
          num_children: num_children || 0,
          special_requests: special_requests || 'None',
          package_title: packageInfo ? `${packageInfo.destination_name} - ${packageInfo.title}` : 'General Inquiry'
        };
        
        // Send email notification (don't wait for it)
        sendBookingNotification(bookingData).catch(error => {
          console.error('Email notification failed:', error);
        });
        
        res.json({
          success: true,
          booking_id: bookingId,
          message: 'Booking inquiry submitted successfully!'
        });
      });
    }
  );
});

// Get all bookings (admin only)
app.get('/api/bookings', requireAdminAuth, (req, res) => {
  const query = `
    SELECT
      b.id,
      b.customer_name,
      b.email,
      b.phone,
      b.travel_date,
      b.num_adults,
      b.num_children,
      b.special_requests,
      CASE
        WHEN b.status IN ('completed', 'confirmed') THEN 'completed'
        WHEN b.status = 'in_process' THEN 'in_process'
        ELSE 'pending'
      END AS status,
      b.created_at,
      p.title AS package_title,
      d.name AS destination_name
    FROM bookings b
    LEFT JOIN packages p ON b.package_id = p.id
    LEFT JOIN destinations d ON p.destination_id = d.id
    ORDER BY b.created_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json(rows);
  });
});

// Update booking status (admin only)
app.put('/api/bookings/:id/status', requireAdminAuth, (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'in_process', 'completed'];

  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status' });
    return;
  }

  db.run(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ success: false, message: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      res.json({ success: true, message: 'Booking status updated' });
    }
  );
});

// Delete booking (admin only)
app.delete('/api/bookings/:id', requireAdminAuth, (req, res) => {
  db.run('DELETE FROM bookings WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ success: false, message: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    res.json({ success: true, message: 'Booking deleted successfully' });
  });
});

// Upload destination image endpoint
app.post('/api/destinations/:id/image', requireAdminAuth, (req, res) => {
  const { image_url } = req.body;
  
  db.run(
    'UPDATE destinations SET image_url = ? WHERE id = ?',
    [image_url, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: 'Image updated successfully' });
    }
  );
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/packages', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'packages.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin-images', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-images.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;