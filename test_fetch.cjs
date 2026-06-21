const http = require('http');
http.get('http://localhost:5173/api/rbac.php?action=get_users_roles', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', console.error);
