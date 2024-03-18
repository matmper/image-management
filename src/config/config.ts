export default {
  'app': {
    'version': '1.0.0',
    'env': process.env.APP_ENV || 'local',
    'port': process.env.APP_PORT || 3000,
  },

  'auth': {
    'user': process.env.AUTH_USER || null,
    'pass': process.env.AUTH_PASS || null,
  },

  'storage': {
    'default': process.env.STORAGE_OPTION || 'local',
    'max_size': process.env.STORAGE_MAX_SIZE || 5,
    'options': {
      'local': {
        'path': process.env.STORAGE_PATH || 'storage/public'
      }
    },
  }
}
