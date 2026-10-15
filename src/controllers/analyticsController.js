const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsService.getSummary();
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  }

  async getByCountry(req, res, next) {
    try {
      const data = await analyticsService.getByCountry();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getByDepartment(req, res, next) {
    try {
      const data = await analyticsService.getByDepartment();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getByDesignation(req, res, next) {
    try {
      const data = await analyticsService.getByDesignation();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getTopEarners(req, res, next) {
    try {
      const { currency } = req.query;
      const data = await analyticsService.getTopEarners(currency);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
