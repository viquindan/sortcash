#!/bin/bash

# netflow - deploy.sh

echo "Iniciando despliegue de Netflow..."

# 1. Pull latest changes
echo "Obteniendo últimos cambios de Git..."
git pull origin main

# 2. Install dependencies
echo "Instalando dependencias..."
npm install

# 3. Build Next.js app
echo "Construyendo la aplicación..."
npm run build

# 4. Restart PM2 process
echo "Reiniciando proceso en PM2..."
pm2 restart netflow || pm2 start npm --name "netflow" -- start

# 5. Save PM2 list
echo "Guardando configuración de PM2..."
pm2 save

echo "¡Despliegue completado con éxito!"
