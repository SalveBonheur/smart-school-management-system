# 🚀 Deployment Guide

## 📋 **Production Deployment Instructions**

### **🔧 System Requirements**
- **Node.js** 14.0 or higher
- **NPM** 6.0 or higher
- **SQLite** (built-in, no separate installation needed)
- **Web Server** (Nginx, Apache, or similar)
- **SSL Certificate** (for HTTPS)

---

## 🌐 **Deployment Options**

### **Option 1: Simple Deployment (Recommended)**

#### **Step 1: Prepare the Server**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### **Step 2: Deploy the Application**
```bash
# Clone or upload your files
cd /var/www/
git clone [your-repository] smart-school-transport
cd smart-school-transport

# Install dependencies
cd backend
npm install --production

# Start the application with PM2
pm2 start server-simple.js --name "school-transport"
pm2 startup
pm2 save
```

#### **Step 3: Configure Nginx**
```nginx
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/school-transport

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # File Upload Size
    client_max_body_size 10M;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Location Blocks
    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static Files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|woff|woff2|ttf|eot|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        root /var/www/smart-school-transport/frontend/public;
    }
}
```

#### **Step 4: Enable Site**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/school-transport /etc/nginx/sites-enabled/

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

### **Option 2: Docker Deployment**

#### **Create Dockerfile**
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY backend/ .
COPY frontend/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3006

# Start application
CMD ["node", "server-simple.js"]
```

#### **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3006:3006"
    environment:
      - NODE_ENV=production
      - PORT=3006
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### **Deploy with Docker**
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

### **Option 3: Cloud Platform Deployment**

#### **Heroku Deployment**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3006

# Deploy
git push heroku main
```

#### **Vercel Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🔒 **Security Configuration**

### **Environment Variables**
Create a `.env` file in the backend directory:
```env
NODE_ENV=production
PORT=3006
JWT_SECRET=your-super-secret-jwt-key-here
DB_PATH=./database.sqlite
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **SSL Certificate Setup**
```bash
# Use Let's Encrypt for free SSL
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **Monitoring & Maintenance**

### **PM2 Monitoring**
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs school-transport

# Restart application
pm2 restart school-transport

# View status
pm2 status
```

### **Backup Strategy**
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/school-transport"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/smart-school-transport/backend/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/smart-school-transport

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### **Log Rotation**
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/school-transport

# Add:
/var/www/school-transport/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs school-transport --err

# Restart application
pm2 restart school-transport
```

#### **Database Issues**
```bash
# Check database permissions
ls -la backend/database.sqlite

# Fix permissions
sudo chown www-data:www-data backend/database.sqlite
sudo chmod 664 backend/database.sqlite
```

#### **Nginx Issues**
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📈 **Performance Optimization**

### **Enable Caching**
```nginx
# Add to Nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### **Database Optimization**
```bash
# Vacuum SQLite database
sqlite3 backend/database.sqlite "VACUUM;"

# Analyze database
sqlite3 backend/database.sqlite "ANALYZE;"
```

---

## 🎯 **Post-Deployment Checklist**

- [ ] **Application is running and accessible**
- [ ] **SSL certificate is installed and working**
- [ ] **Database is properly configured**
- [ ] **All user roles can login and function**
- [ ] **Payment system is working**
- [ ] **Email notifications are configured**
- [ ] **Backup system is active**
- [ ] **Monitoring is set up**
- [ ] **Security headers are configured**
- [ ] **Performance is optimized**

---

## 📞 **Support Contact**

For deployment assistance:
- **Email**: isalvebonheur@gmail.com
- **Phone**: +250 788 123 456

---

**🎓 Your Smart School Transport System is now ready for production!**
