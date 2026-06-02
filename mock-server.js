import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'mock-db.json');

// Helper to read DB
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      complaints: [],
      timeline: [],
      notifications: [],
      departments: [
        { id: 1, name: 'Water Supply Department', head_officer: 'Manoj Sharma', status: 'active' },
        { id: 2, name: 'Roads & Infrastructure Department', head_officer: 'Amit Singh', status: 'active' },
        { id: 3, name: 'Electricity Board', head_officer: 'Rajesh Kumar', status: 'active' },
        { id: 4, name: 'Sanitation & Solid Waste Dept', head_officer: 'Ravi Verma', status: 'active' },
        { id: 5, name: 'Sewer & Drainage Department', head_officer: 'Vijay Das', status: 'active' }
      ],
      officers: [
        { id: 1, name: 'Manoj Sharma', department_id: 1, department_name: 'Water Supply Department', designation: 'Executive Engineer', mobile: '9876543210', status: 'active' },
        { id: 2, name: 'Amit Singh', department_id: 2, department_name: 'Roads & Infrastructure Department', designation: 'Assistant Engineer', mobile: '9876543211', status: 'active' },
        { id: 3, name: 'Rajesh Kumar', department_id: 3, department_name: 'Electricity Board', designation: 'Junior Engineer', mobile: '9876543212', status: 'active' },
        { id: 4, name: 'Ravi Verma', department_id: 4, department_name: 'Sanitation & Solid Waste Dept', designation: 'Sanitation Inspector', mobile: '9876543213', status: 'active' },
        { id: 5, name: 'Vijay Das', department_id: 5, department_name: 'Sewer & Drainage Department', designation: 'Assistant Engineer', mobile: '9876543214', status: 'active' }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Helper to write DB
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Server logic
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Authorization, x-authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname.replace('/api', ''); // Normalize endpoints

  // Helper to parse JSON body
  const getBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });

  // Response helpers
  const sendJSON = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const sendError = (message, status = 400) => {
    sendJSON({ success: false, error: message }, status);
  };

  try {
    const dbData = readDB();

    // 1. Auth Endpoint
    if (pathname === '/auth.php' && req.method === 'POST') {
      const body = await getBody();
      const { email, password, role } = body; // email field holds mobile for citizen

      if (role === 'admin') {
        if (email === 'admin@ronganadi.gov.in' && password === 'admin123') {
          return sendJSON({
            success: true,
            data: {
              token: 'mock-admin-token',
              user: { id: 1, name: 'Rajiv Borah', email: 'admin@ronganadi.gov.in', role: 'admin', designation: 'District Coordinator', phone: '9435000001' }
            }
          });
        }
        return sendError('Invalid admin credentials', 401);
      }

      if (role === 'citizen') {
        if (email === '9999999999' && password === 'citizen123') {
          return sendJSON({
            success: true,
            data: {
              token: 'mock-citizen-token',
              user: { id: 3, name: 'Citizen Test User', mobile: '9999999999', role: 'citizen', area: 'Ward 01' }
            }
          });
        }
        return sendError('Invalid citizen credentials', 401);
      }

      return sendError('Invalid role');
    }

    // 2. Departments Endpoint
    if (pathname === '/departments.php' && req.method === 'GET') {
      return sendJSON({ success: true, data: dbData.departments });
    }

    // 3. Officers Endpoint
    if (pathname === '/officers.php' && req.method === 'GET') {
      return sendJSON({ success: true, data: dbData.officers });
    }

    // 4. Notifications Endpoint
    if (pathname === '/notifications.php') {
      if (req.method === 'GET') {
        return sendJSON({ success: true, data: dbData.notifications.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) });
      }
      if (req.method === 'PUT') {
        // Mark all as read
        dbData.notifications.forEach(n => { n.is_read = 1; });
        writeDB(dbData);
        return sendJSON({ success: true, message: 'Notifications marked as read' });
      }
    }

    // 5. Complaints Endpoint
    if (pathname === '/complaints.php') {
      // GET Complaint(s)
      if (req.method === 'GET') {
        const idParam = parseInt(parsedUrl.searchParams.get('id') || '0');
        const ticketIdParam = parsedUrl.searchParams.get('ticket_id') || '';

        if (idParam > 0) {
          const complaint = dbData.complaints.find(c => c.id === idParam);
          if (!complaint) return sendError('Complaint not found', 404);
          
          const dept = dbData.departments.find(d => d.id === complaint.department_id);
          const off = dbData.officers.find(o => o.id === complaint.assigned_officer_id);
          const fullComplaint = {
            ...complaint,
            department_name: dept ? dept.name : null,
            officer_name: off ? off.name : null,
            officer_mobile: off ? off.mobile : null
          };
          
          fullComplaint.timeline = dbData.timeline.filter(t => t.complaint_id === idParam).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
          return sendJSON({ success: true, data: fullComplaint });
        }

        if (ticketIdParam) {
          const complaint = dbData.complaints.find(c => c.ticket_id === ticketIdParam);
          if (!complaint) return sendError('Ticket not found', 404);

          const dept = dbData.departments.find(d => d.id === complaint.department_id);
          const off = dbData.officers.find(o => o.id === complaint.assigned_officer_id);
          const fullComplaint = {
            ...complaint,
            department_name: dept ? dept.name : null,
            officer_name: off ? off.name : null,
            officer_mobile: off ? off.mobile : null
          };

          fullComplaint.timeline = dbData.timeline.filter(t => t.complaint_id === complaint.id).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
          return sendJSON({ success: true, data: fullComplaint });
        }

        // Return list of complaints
        // Re-inject department/officer names for rendering
        const complaintsList = dbData.complaints.map(c => {
          const dept = dbData.departments.find(d => d.id === c.department_id);
          const off = dbData.officers.find(o => o.id === c.assigned_officer_id);
          return {
            ...c,
            department_name: dept ? dept.name : null,
            officer_name: off ? off.name : null,
            officer_mobile: off ? off.mobile : null
          };
        });

        return sendJSON({ success: true, data: complaintsList });
      }

      // POST Complaint (Citizen submitting)
      if (req.method === 'POST') {
        const body = await getBody();
        const newComplaint = {
          id: dbData.complaints.length + 1,
          ticket_id: null,
          citizen_id: 3,
          title: body.title,
          category: body.category,
          sub_category: body.sub_category || '',
          priority: body.priority || 'medium',
          location_lat: body.location_lat || null,
          location_lng: body.location_lng || null,
          address: body.address,
          description: body.description,
          contact_number: body.contact_number,
          status: 'submitted',
          department_id: null,
          assigned_officer_id: null,
          expected_completion_date: null,
          progress: 0,
          ward: body.ward || 'Ward 01',
          submitted_at: new Date().toISOString()
        };

        dbData.complaints.push(newComplaint);
        
        // Initial timeline
        dbData.timeline.push({
          id: dbData.timeline.length + 1,
          complaint_id: newComplaint.id,
          status_event: 'Complaint Submitted',
          event_description: 'Citizen registered the complaint details. Awaiting admin review and ticket generation.',
          created_at: new Date().toISOString()
        });

        writeDB(dbData);
        return sendJSON({ success: true, data: { id: newComplaint.id, status: 'submitted' } }, 201);
      }

      // PUT Complaint (Admin updating status / raising ticket)
      if (req.method === 'PUT') {
        const idParam = parseInt(parsedUrl.searchParams.get('id') || '0');
        if (idParam === 0) return sendError('Complaint ID required');

        const complaint = dbData.complaints.find(c => c.id === idParam);
        if (!complaint) return sendError('Complaint not found', 404);

        const body = await getBody();
        const originalTicketId = complaint.ticket_id;
        const originalStatus = complaint.status;
        const originalProgress = complaint.progress;
        
        let ticketJustGenerated = false;

        // Apply fields
        complaint.assigned_officer_id = body.assigned_officer_id !== undefined ? (body.assigned_officer_id ? parseInt(body.assigned_officer_id) : null) : complaint.assigned_officer_id;
        complaint.department_id = body.department_id !== undefined ? (body.department_id ? parseInt(body.department_id) : null) : complaint.department_id;
        
        // Auto-assign department based on officer if needed
        if (complaint.assigned_officer_id && body.assigned_officer_id) {
          const off = dbData.officers.find(o => o.id === complaint.assigned_officer_id);
          if (off) {
            complaint.department_id = off.department_id;
          }
        }

        // Generate Ticket ID
        if (!originalTicketId && (complaint.assigned_officer_id || complaint.department_id)) {
          complaint.ticket_id = 'GRV-' + new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
          complaint.ticket_generated_at = new Date().toISOString();
          ticketJustGenerated = true;
        }

        // Auto status transitions based on assignments
        if (ticketJustGenerated) {
          complaint.status = 'ticket_generated';
        }
        
        if (complaint.department_id && complaint.status === 'ticket_generated') {
          complaint.status = 'dept_assigned';
        }
        
        if (complaint.assigned_officer_id && (complaint.status === 'ticket_generated' || complaint.status === 'dept_assigned')) {
          complaint.status = 'officer_assigned';
        }

        // If the admin manually sets the status via the request payload, override the auto-status
        complaint.status = body.status || complaint.status;

        const getProgressForStatus = (st) => {
          if (st === 'completed') return 100;
          if (st === 'ground_inspection') return 90;
          if (st === 'action_taken') return 70;
          if (st === 'officer_assigned') return 50;
          if (st === 'dept_assigned') return 30;
          if (st === 'ticket_generated') return 10;
          return 0;
        };

        complaint.progress = body.progress !== undefined ? parseInt(body.progress) : getProgressForStatus(complaint.status);
        complaint.expected_completion_date = body.expected_completion_date !== undefined ? body.expected_completion_date : complaint.expected_completion_date;
        
        if (!complaint.expected_completion_date && ticketJustGenerated) {
          const expected = new Date();
          expected.setDate(expected.getDate() + 5);
          complaint.expected_completion_date = expected.toISOString().split('T')[0];
        }

        // Timeline & Notification triggering
        if (ticketJustGenerated) {
          dbData.timeline.push({
            id: dbData.timeline.length + 1,
            complaint_id: complaint.id,
            status_event: 'Ticket Generated',
            event_description: `Admin reviewed the complaint and raised Ticket ID: ${complaint.ticket_id}`,
            created_at: new Date().toISOString()
          });

          if (complaint.department_id) {
            const dept = dbData.departments.find(d => d.id === complaint.department_id);
            dbData.timeline.push({
              id: dbData.timeline.length + 1,
              complaint_id: complaint.id,
              status_event: 'Assigned To Department',
              event_description: `Grievance routed to the respective department: ${dept ? dept.name : 'Assigned Dept'}.`,
              created_at: new Date().toISOString()
            });
          }

          if (complaint.assigned_officer_id) {
            const off = dbData.officers.find(o => o.id === complaint.assigned_officer_id);
            dbData.timeline.push({
              id: dbData.timeline.length + 1,
              complaint_id: complaint.id,
              status_event: 'Assigned To Engineer',
              event_description: `Grievance assigned to the execution engineer: ${off ? off.name : 'Assigned Officer'}.`,
              created_at: new Date().toISOString()
            });
          }

          // Citizen notification
          const dept = dbData.departments.find(d => d.id === complaint.department_id);
          const off = dbData.officers.find(o => o.id === complaint.assigned_officer_id);
          const notifMsg = `Your complaint '${complaint.title}' has been reviewed. Ticket #${complaint.ticket_id} has been generated and assigned to the ${dept ? dept.name : 'Assigned Department'}` + 
            (off ? ` under Engineer ${off.name} (Contact: ${off.mobile})` : '') + `. You can now track it online.`;

          dbData.notifications.push({
            id: dbData.notifications.length + 1,
            citizen_id: complaint.citizen_id,
            complaint_id: complaint.id,
            ticket_id: complaint.ticket_id,
            message: notifMsg,
            is_read: 0,
            created_at: new Date().toISOString()
          });
        } else {
          // Status updates logging
          if (complaint.status !== originalStatus) {
            const statusLabels = {
              'submitted': 'Complaint Logged',
              'ticket_generated': 'Ticket Generated',
              'dept_assigned': 'Assigned To Department',
              'officer_assigned': 'Assigned To Engineer',
              'action_taken': 'Action Taken',
              'ground_inspection': 'Ground Inspection',
              'completed': 'Work Completed'
            };
            const statusDescs = {
              'submitted': 'Complaint re-logged and put under review.',
              'ticket_generated': 'Ticket generated by administration.',
              'dept_assigned': 'Routed and assigned to department.',
              'officer_assigned': 'Assigned to the execution engineer.',
              'action_taken': 'Initial action has been taken by the engineer.',
              'ground_inspection': 'On-site ground inspection is being conducted.',
              'completed': 'Grievance resolved and verified.'
            };

            const eventTitle = statusLabels[complaint.status] || 'Status Updated';
            const eventDesc = statusDescs[complaint.status] || `Ticket status updated to ${complaint.status}.`;

            dbData.timeline.push({
              id: dbData.timeline.length + 1,
              complaint_id: complaint.id,
              status_event: eventTitle,
              event_description: eventDesc,
              created_at: new Date().toISOString()
            });

            dbData.notifications.push({
              id: dbData.notifications.length + 1,
              citizen_id: complaint.citizen_id,
              complaint_id: complaint.id,
              ticket_id: complaint.ticket_id,
              message: `Status Update for Ticket #${complaint.ticket_id}: The ticket status has been updated to '${eventTitle}'.`,
              is_read: 0,
              created_at: new Date().toISOString()
            });
          }

          if (body.remark) {
             dbData.timeline.push({
               id: dbData.timeline.length + 1,
               complaint_id: complaint.id,
               status_event: 'Admin Remark',
               event_description: body.remark,
               created_at: new Date().toISOString()
             });
             dbData.notifications.push({
               id: dbData.notifications.length + 1,
               citizen_id: complaint.citizen_id,
               complaint_id: complaint.id,
               ticket_id: complaint.ticket_id,
               message: `Admin added a remark on Ticket #${complaint.ticket_id}: "${body.remark}"`,
               is_read: 0,
               created_at: new Date().toISOString()
             });
          }

          if (complaint.progress >= 50 && originalProgress < 50) {
            dbData.timeline.push({
              id: dbData.timeline.length + 1,
              complaint_id: complaint.id,
              status_event: 'Site Inspection Completed',
              event_description: 'Inspection engineer completed field study and measurements.',
              created_at: new Date().toISOString()
            });
          }
        }

        writeDB(dbData);
        return sendJSON({ success: true, data: { message: 'Complaint updated successfully', ticket_id: complaint.ticket_id } });
      }
    }

    return sendError('Route not found', 404);

  } catch (err) {
    return sendError(`Internal Server Error: ${err.message}`, 500);
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Node-based Mock API Server is running on http://localhost:${PORT}`);
});
