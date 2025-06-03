/* eslint-disable no-undef */
var express = require('express');
var router = express.Router();

const fs = require('fs');
let routes = fs.readdirSync(__dirname);

for (let route of routes) { 
  if (route.includes('.js') && route !== 'index.js') {
    try {
      // Dosya boyutunu kontrol et
      const filePath = require('path').join(__dirname, route);
      const stats = fs.statSync(filePath);
      
      if (stats.size > 0) {
        const routeModule = require(`./${route}`);
        
        // Router olup olmadığını kontrol et
        if (routeModule && typeof routeModule === 'function') {
          router.use(`/${route.replace('.js', '')}`, routeModule);
        } else {
          console.warn(`Warning: ${route} does not export a valid router`);
        }
      } else {
        console.warn(`Warning: ${route} is empty, skipping...`);
      }
    } catch (error) {
      console.error(`Error loading route ${route}:`, error.message);
    }
  }
}

module.exports = router;
