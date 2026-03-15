// ecosystem.config.js — PM2 Process Manager Configuration
// Install: npm install -g pm2
// Start:   pm2 start ecosystem.config.js --env production
// Monitor: pm2 monit
// Logs:    pm2 logs seahawk
// Auto-start: pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name:        'seahawk-api',
      script:      'server.js',
      cwd:         './backend',
      instances:   'max',       // Use all CPU cores
      exec_mode:   'cluster',   // Cluster mode for multi-core
      watch:       false,
      max_memory_restart: '500M',

      env: {
        NODE_ENV: 'development',
        PORT:     3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT:     3001,
      },

      // Log configuration
      out_file:        './logs/pm2-out.log',
      error_file:      './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:      true,
      log_type:        'json',

      // Restart policy
      restart_delay:  5000,
      max_restarts:   10,
      min_uptime:     '10s',
      exp_backoff_restart_delay: 100,

      // Graceful shutdown
      kill_timeout:   10000,
      listen_timeout: 10000,

      // Health monitoring
      autorestart: true,
    },
  ],
};
