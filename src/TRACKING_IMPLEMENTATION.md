# Live Package Tracking Implementation Guide

## Overview
This guide explains how to implement the complete live package tracking system for SwiftDelivery, including:
- Admin dashboard with Google Maps for tracking package locations
- Customer-facing tracking page
- Backend API endpoints and database schema

## Files Created

### Frontend Components (React)
1. **LiveTrackingMap.jsx** - Admin dashboard component for managing package tracking
2. **LiveTrackingMap.css** - Styling for the admin tracking interface
3. **TrackPackage.jsx** - Customer-facing tracking page component
4. **TrackPackage.css** - Styling for the customer tracking interface

## Database Schema

### Tracking Model (MongoDB)

```javascript
// models/Tracking.js
const trackingSchema = new Schema({
  trackingId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: [
      'Pending Pickup',
      'Pickup Assigned',
      'Pickup Accepted',
      'Enroute to Facility',
      'Arrived at Hub or Facility',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Awaiting Receipt',
      'Delivery Failed',
      'Returned to Sender'
    ],
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tracking', trackingSchema);
```

## Backend API Endpoints

### POST /api/tracking
**Create or update a tracking record**

```javascript
// routes/tracking.js
router.post('/tracking', authenticateAdmin, async (req, res) => {
  try {
    const { trackingId, userId, status, location } = req.body;

    if (!trackingId || !userId || !status || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tracking = await Tracking.findOneAndUpdate(
      { trackingId },
      {
        userId,
        status,
        location,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    ).populate('userId', 'fullName email');

    res.json({
      trackingId: tracking.trackingId,
      status: tracking.status,
      location: tracking.location,
      user: {
        fullName: tracking.userId.fullName,
        email: tracking.userId.email
      },
      updatedAt: tracking.updatedAt
    });
  } catch (error) {
    console.error('Tracking creation error:', error);
    res.status(500).json({ error: 'Failed to create tracking record' });
  }
});
```

### GET /api/tracking/:trackingId
**Retrieve tracking information by tracking ID**

```javascript
router.get('/tracking/:trackingId', async (req, res) => {
  try {
    const tracking = await Tracking.findOne({ 
      trackingId: req.params.trackingId 
    }).populate('userId', 'fullName email');

    if (!tracking) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    res.json({
      trackingId: tracking.trackingId,
      status: tracking.status,
      location: tracking.location,
      user: {
        fullName: tracking.userId.fullName,
        email: tracking.userId.email
      },
      updatedAt: tracking.updatedAt
    });
  } catch (error) {
    console.error('Tracking retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve tracking information' });
  }
});
```

## Integration Steps

### 1. Update AdminDashboard.jsx

Add the LiveTrackingMap component to your admin dashboard:

```javascript
// AdminDashboard.jsx
import LiveTrackingMap from './LiveTrackingMap';

// Inside your component JSX:
<LiveTrackingMap />
```

### 2. Create a Tracking Route

Add a new route for customers to track packages:

```javascript
// App.jsx
import TrackPackage from './src/TrackPackage';

<Route path="/track" element={<TrackPackage />} />
```

### 3. Configure Google Maps API

Set your Google Maps API key in your `.env` file:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Obtain your API key from: https://console.cloud.google.com/

### 4. Set Up Authentication Middleware

```javascript
// middleware/auth.js
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateAdmin;
```

## Usage Flow

### Admin Workflow
1. Admin logs into the dashboard
2. Views "Live Tracking Map" section
3. Verified users appear in the sidebar
4. Admin selects a user from the list
5. Selects package status from dropdown
6. Clicks "Pin Location" button
7. Clicks on the map to set package location
8. System generates and displays tracking ID
9. Admin provides tracking ID to customer

### Customer Workflow
1. Customer visits `/track` page
2. Enters their tracking ID
3. System displays:
   - Package status with color-coded badge
   - Recipient information
   - Last updated timestamp
   - Google Map with package location
4. Customer can click map marker for additional details

## Package Statuses

1. **Pending Pickup** - Package waiting to be picked up
2. **Pickup Assigned** - Courier assigned for pickup
3. **Pickup Accepted** - Courier accepted the pickup
4. **Enroute to Facility** - Moving to distribution facility
5. **Arrived at Hub or Facility** - At distribution center
6. **In Transit** - On the way to destination
7. **Out for Delivery** - On the way to final destination
8. **Delivered** - Successfully delivered
9. **Awaiting Receipt** - Waiting for customer to receive
10. **Delivery Failed** - Delivery attempt failed
11. **Returned to Sender** - Package returned to sender

## Tracking ID Format

Format: `SWIFT-{timestamp}`

Example: `SWIFT-1732840234567`

Generated automatically when admin pins a location on the map.

## Security Considerations

1. **Authentication**: Only admins can create/update tracking records
2. **Authorization**: Customers can only view their own tracking data
3. **API Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Validation**: Validate all input coordinates and status values
5. **CORS**: Configure CORS properly for frontend-backend communication

## Styling Features

### Admin Dashboard
- Modern gradient backgrounds
- Sticky sidebar for easy user selection
- Responsive grid layout
- Color-coded status badges
- Smooth animations
- Mobile-optimized design

### Customer Tracking Page
- Full-screen gradient background
- Center-aligned card design
- Color-coded status badges for each delivery status
- Smooth slide-up animations
- Fully responsive layout
- Touch-friendly inputs on mobile

## Next Steps

1. Install dependencies if needed
2. Set up MongoDB connection for Tracking model
3. Add the backend routes to your Express server
4. Configure Google Maps API key
5. Test admin functionality:
   - Create sample tracking records
   - Pin locations on map
   - Verify tracking ID generation
6. Test customer functionality:
   - Track packages with valid IDs
   - Verify location display on map
   - Check status updates

## Troubleshooting

**Map not loading**: Check Google Maps API key configuration and ensure it's enabled for Maps JavaScript API.

**Tracking ID not generating**: Ensure the location is properly clicked on the map and a user is selected.

**Customer tracking returns 404**: Verify tracking ID format and ensure it exists in database.

**Location not showing on customer map**: Check that location coordinates are valid numbers and within expected range.

## Support

For issues or questions about the implementation, refer to this documentation or contact the development team.
