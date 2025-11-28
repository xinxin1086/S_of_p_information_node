// Development Monitor Script
// This script monitors the application for development purposes

(function() {
  'use strict';

  // 监控应用状态
  const devMonitor = {
    init: function() {
      console.log('🔧 Development Monitor initialized');
      this.setupErrorHandling();
      this.setupPerformanceMonitoring();
    },

    setupErrorHandling: function() {
      window.addEventListener('error', function(e) {
        console.warn('🚨 Dev Monitor - Error caught:', e.error);
      });

      window.addEventListener('unhandledrejection', function(e) {
        console.warn('🚨 Dev Monitor - Unhandled promise rejection:', e.reason);
      });
    },

    setupPerformanceMonitoring: function() {
      if ('performance' in window) {
        window.addEventListener('load', function() {
          setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
              console.log('📊 Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }
          }, 0);
        });
      }
    }
  };

  // 初始化监控
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      devMonitor.init();
    });
  } else {
    devMonitor.init();
  }

  // 将监控对象暴露到全局，方便调试
  window.devMonitor = devMonitor;
})();