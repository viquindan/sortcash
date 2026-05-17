# Guía de Despliegue Netflow (Hostinger VPS)

Deploy en VPS Ubuntu con Node.js, PM2 y Nginx.

## 1. Setup del servidor

```bash
ssh root@<tu-ip-del-vps>

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

## 2. Clonar y configurar entorno

```bash
mkdir -p /var/www && cd /var/www
git clone <url-de-tu-repo> netflow
cd netflow
```

Crea `.env.local`:

```bash
nano .env.local
```

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="genera con: openssl rand -base64 32"
NODE_ENV=production
```

## 3. Instalar y compilar

```bash
npm install
npm run build
```

## 4. PM2

```bash
pm2 start npm --name "netflow" -- start
pm2 save
pm2 startup
```

## 5. Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/netflow
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/netflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL con Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 7. Actualizaciones

```bash
cd /var/www/netflow
git pull
npm install
npm run build
pm2 restart netflow
```
