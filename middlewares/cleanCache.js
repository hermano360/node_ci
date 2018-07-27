const {clearHash} = require('../services/cache')

module.exports = {
  clearHashUserID: async (req, res, next) => {
    if(res.statusCode < 400){
      await next()
      clearHash(req.user.id)
    } else {
      next()
    }
  }
}
